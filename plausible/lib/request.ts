import type { EventProps } from './types';
import type { PlausibleOptions } from './tracker';

type EventPayload = {
  readonly n: string;
  readonly u: Location['href'];
  readonly d: Location['hostname'];
  readonly r: Document['referrer'] | null;
  readonly w: Window['innerWidth'];
  readonly h: 1 | 0;
  readonly p?: string;
};

export type EventOptions = {
  readonly callback?: () => void;
  readonly props?: EventProps;
};

export function sendEvent(eventName: string, data: Required<PlausibleOptions>, options?: EventOptions): void {
  const isLocalhost =
    /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*:)*?:?0*1$/.test(location.hostname) ||
    location.protocol === 'file:';

  if (!data.trackLocalhost && isLocalhost) {
    return console.warn('[Plausible] Ignoring event because website is running locally');
  }

  const plausibleIgnore = localStorage.getItem('plausible_ignore');
  if (plausibleIgnore === 'true') {
    return console.warn(
      '[Plausible] Ignoring event because "plausible_ignore" is set to "true" in localStorage'
    );
  }

  const optionsParams = options?.props || {};
  const filteredParams = filterUndefined(optionsParams);

  const payload: EventPayload = {
    n: eventName,
    u: safeGetURLPath(data.url),
    d: data.domain,
    r: data.referrer,
    w: data.deviceWidth,
    h: data.hashMode ? 1 : 0,
    p: JSON.stringify(filteredParams),
  };

  const req = new XMLHttpRequest();
  req.open('POST', data.apiHost, true);
  req.setRequestHeader('Content-Type', 'text/plain');
  req.send(JSON.stringify(payload));
  req.onreadystatechange = () => {
    if (req.readyState !== 4) return;
    if (options && options.callback) {
      options.callback();
    }
  };
}

function safeGetURLPath(url: string): string {
  const urlObj = new URL(url);
  return urlObj.origin + urlObj.pathname;
}

function filterUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}
