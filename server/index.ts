import express, { type Request, type Response } from 'express';
import log4js from 'log4js';
import Geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import cors from 'cors';

const app = express();

log4js.configure({
  appenders: {
    tracker: {
      type: 'dateFile',
      filename: 'monitor-system/logs/access.log',
      pattern: '.yyyy-MM-dd',
      compress: true,
      layout: { type: 'messagePassThrough' },
    },
  },
  categories: { default: { appenders: ['tracker'], level: 'info' } },
});
const logger = log4js.getLogger('tracker');

app.use(cors());
app.use(express.json());
app.use(express.text());

type TrackerItem = {
  n: string;
  u: string;
  d: string;
  r: string | null;
  w: number;
  h: 0 | 1;
  p?: string;
};

app.post('/api/event', (req: Request, res: Response) => {
  const rawBody = req.body;
  const data: TrackerItem = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const geo = Geoip.lookup(clientIp);
  const ua = new UAParser(userAgent).getResult();

  const props = data.p ? JSON.parse(data.p) : {};

  const logItem = {
    ts: Date.now(),
    event_name: data.n,
    url: data.u,
    domain: data.d,
    referrer: data.r,
    screen_width: data.w,
    hash_mode: data.h === 1,
    props,
    ip: clientIp,
    geo: geo ? { city: geo.city, country: geo.country } : {},
    device: {
      browser: ua.browser.name,
      browser_version: ua.browser.version,
      os: ua.os.name,
      os_version: ua.os.version,
      device_type: ua.device.type || 'desktop',
    },
    user_agent: userAgent,
  };

  logger.info(JSON.stringify(logItem));

  res.status(202).send('ok');
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(8080, () => console.log('Tracker Server running on http://localhost:8080'));
