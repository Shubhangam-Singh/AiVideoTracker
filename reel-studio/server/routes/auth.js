import { Router } from 'express';
import db from '../db.js';
import { hash, verify, userById, userByUsername, requireAuth } from '../auth.js';

const r = Router();

r.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const u = userByUsername(String(username).toLowerCase().trim());
  if (!u || !verify(password, u.password_hash)) return res.status(401).json({ error: 'invalid credentials' });
  req.session.userId = u.id;
  res.json({ id: u.id, username: u.username, name: u.name, role: u.role });
});

r.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

r.get('/me', (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'unauthorized' });
  const u = userById(req.session.userId);
  if (!u) return res.status(401).json({ error: 'unauthorized' });
  res.json(u);
});

r.post('/password', requireAuth, (req, res) => {
  const { current, next } = req.body || {};
  if (!current || !next || next.length < 6) return res.status(400).json({ error: 'invalid input (next password min 6 chars)' });
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!verify(current, row.password_hash)) return res.status(401).json({ error: 'current password wrong' });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash(next), req.user.id);
  res.json({ ok: true });
});

r.get('/users', requireAuth, (_req, res) => {
  res.json(db.prepare('SELECT id, username, name, role FROM users ORDER BY id').all());
});

export default r;
