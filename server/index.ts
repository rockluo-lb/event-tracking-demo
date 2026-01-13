import express, { type Request, type Response } from 'express';
import { createClient } from '@clickhouse/client';
import Geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import cors from 'cors';

const app = express();

const clickhouse = createClient({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  database: 'tracker',
});

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

type EventRow = {
  event_time: string;
  event_name: string;
  url: string;
  domain: string;
  referrer: string;
  screen_width: number;
  hash_mode: number;
  int1: number;
  int2: number;
  int3: number;
  int4: number;
  int5: number;
  int6: number;
  int7: number;
  int8: number;
  int9: number;
  int10: number;
  string1: string;
  string2: string;
  string3: string;
  string4: string;
  string5: string;
  string6: string;
  string7: string;
  string8: string;
  string9: string;
  string10: string;
  ip: string;
  country: string;
  city: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  device_type: string;
  user_agent: string;
};

app.post('/api/event', async (req: Request, res: Response) => {
  const rawBody = req.body;
  const data: TrackerItem = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const geo = Geoip.lookup(clientIp);
  const ua = new UAParser(userAgent).getResult();

  const props = data.p ? JSON.parse(data.p) : {};

  const row: EventRow = {
    event_time: new Date().toISOString().replace('T', ' ').replace('Z', ''),
    event_name: data.n,
    url: data.u,
    domain: data.d,
    referrer: data.r || '',
    screen_width: data.w,
    hash_mode: data.h,
    int1: props.int1 ?? 0,
    int2: props.int2 ?? 0,
    int3: props.int3 ?? 0,
    int4: props.int4 ?? 0,
    int5: props.int5 ?? 0,
    int6: props.int6 ?? 0,
    int7: props.int7 ?? 0,
    int8: props.int8 ?? 0,
    int9: props.int9 ?? 0,
    int10: props.int10 ?? 0,
    string1: props.string1 ?? '',
    string2: props.string2 ?? '',
    string3: props.string3 ?? '',
    string4: props.string4 ?? '',
    string5: props.string5 ?? '',
    string6: props.string6 ?? '',
    string7: props.string7 ?? '',
    string8: props.string8 ?? '',
    string9: props.string9 ?? '',
    string10: props.string10 ?? '',
    ip: clientIp,
    country: geo?.country || '',
    city: geo?.city || '',
    browser: ua.browser.name || '',
    browser_version: ua.browser.version || '',
    os: ua.os.name || '',
    os_version: ua.os.version || '',
    device_type: ua.device.type || 'desktop',
    user_agent: userAgent,
  };

  await clickhouse.insert({
    table: 'events_buffer',
    values: [row],
    format: 'JSONEachRow',
  });

  res.status(202).send('ok');
});

app.get('/health', async (_req: Request, res: Response) => {
  const result = await clickhouse.query({
    query: 'SELECT 1',
    format: 'JSONEachRow',
  });
  const data = await result.json();
  res.json({ status: 'ok', clickhouse: data, timestamp: new Date().toISOString() });
});

app.get('/api/stats', async (_req: Request, res: Response) => {
  const result = await clickhouse.query({
    query: `
      SELECT 
        event_name,
        count() as count,
        uniq(ip) as unique_visitors
      FROM tracker.events
      WHERE event_date >= today() - 7
      GROUP BY event_name
      ORDER BY count DESC
    `,
    format: 'JSONEachRow',
  });
  const data = await result.json();
  res.json(data);
});

app.get('/api/events', async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const result = await clickhouse.query({
    query: `
      SELECT *
      FROM tracker.events
      ORDER BY event_time DESC
      LIMIT {limit: UInt32}
    `,
    query_params: { limit },
    format: 'JSONEachRow',
  });
  const data = await result.json();
  res.json(data);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Tracker Server running on http://localhost:${PORT}`));
