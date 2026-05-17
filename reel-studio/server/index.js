import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import db from './db.js';
import { runSeed } from './seed.js';
import { attachWs } from './ws.js';

import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import taskRoutes from './routes/tasks.js';
import promptRoutes from './routes/prompts.js';
import toolRoutes from './routes/tools.js';
import targetRoutes from './routes/targets.js';
import strategyRoutes from './routes/strategy.js';
import threadRoutes from './routes/threads.js';
import messageRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';
import analyticsRoutes from './routes/analytics.js';

import SqliteStoreFactory from 'better-sqlite3-session-store';
const SqliteStore = SqliteStoreFactory(session);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';

runSeed();

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());

const sessionMiddleware = session({
  store: new SqliteStore({ client: db, expired: { clear: true, intervalMs: 15 * 60 * 1000 } }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd && process.env.COOKIE_SECURE !== 'false' ? 'auto' : false,
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  },
});
app.use(sessionMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, time: Date.now() }));

if (isProd && fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(DIST, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error('[api error]', err);
  res.status(500).json({ error: err.message || 'server error' });
});

const server = http.createServer(app);
attachWs(server, sessionMiddleware);

server.listen(PORT, () => {
  console.log(`[reel-studio] api + ws on http://localhost:${PORT} (${isProd ? 'prod' : 'dev'})`);
});
