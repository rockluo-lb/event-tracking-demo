import type { EventOptions } from './request';
import { sendEvent } from './request';

export type PlausibleInitOptions = {
  readonly hashMode?: boolean;
  readonly trackLocalhost?: boolean;
  readonly domain?: Location['hostname'];
  readonly apiHost?: string;
};

export type PlausibleEventData = {
  readonly url?: Location['href'];
  readonly referrer?: Document['referrer'] | null;
  readonly deviceWidth?: Window['innerWidth'];
};

export type PlausibleOptions = PlausibleInitOptions & PlausibleEventData;

export type TrackEvent = (eventName: string, options?: EventOptions, eventData?: PlausibleOptions) => void;

type TrackPageview = (eventData?: PlausibleOptions, options?: EventOptions) => void;

type Cleanup = () => void;

type EnableAutoPageviews = () => Cleanup;

export default function Plausible(defaults?: PlausibleInitOptions): {
  readonly trackEvent: TrackEvent;
  readonly trackPageview: TrackPageview;
  readonly enableAutoPageviews: EnableAutoPageviews;
} {
  const getConfig = (): Required<PlausibleOptions> => ({
    hashMode: false,
    trackLocalhost: false,
    url: location.href,
    domain: location.hostname,
    referrer: document.referrer || null,
    deviceWidth: window.innerWidth,
    apiHost: 'https://plausible.io',
    ...defaults,
  });

  const trackEvent: TrackEvent = (eventName, options, eventData) => {
    sendEvent(eventName, { ...getConfig(), ...eventData }, options);
  };

  const trackPageview: TrackPageview = (eventData, options) => {
    trackEvent('pageview', options, eventData);
  };

  const enableAutoPageviews: EnableAutoPageviews = () => {
    const page = () => trackPageview();
    const originalPushState = history.pushState;
    if (originalPushState) {
      history.pushState = function (data, title, url) {
        originalPushState.apply(this, [data, title, url]);
        page();
      };
      addEventListener('popstate', page);
    }

    if (defaults && defaults.hashMode) {
      addEventListener('hashchange', page);
    }

    trackPageview();

    return function cleanup() {
      if (originalPushState) {
        history.pushState = originalPushState;
        removeEventListener('popstate', page);
      }
      if (defaults && defaults.hashMode) {
        removeEventListener('hashchange', page);
      }
    };
  };

  return {
    trackEvent,
    trackPageview,
    enableAutoPageviews,
  };
}
