import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();
r.use(requireAuth);

r.get('/me', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings WHERE user_id = ?').all(req.user.id);
  const out = {};
  for (const row of rows) {
    try { out[row.key] = JSON.parse(row.value); } catch { out[row.key] = row.value; }
  }
  res.json(out);
});

r.put('/me', (req, res) => {
  const body = req.body || {};
  const ins = db.prepare('INSERT INTO settings (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value');
  db.transaction(() => {
    for (const [k, v] of Object.entries(body)) ins.run(req.user.id, k, JSON.stringify(v));
  })();
  res.json({ ok: true });
});

r.delete('/me', (req, res) => {
  db.prepare('DELETE FROM settings WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

export default r;
