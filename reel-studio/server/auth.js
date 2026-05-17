import bcrypt from 'bcryptjs';
import db from './db.js';

export const hash = (pw) => bcrypt.hashSync(pw, 10);
export const verify = (pw, h) => bcrypt.compareSync(pw, h);

export function userById(id) {
  return db.prepare('SELECT id, username, name, role FROM users WHERE id = ?').get(id);
}

export function userByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function requireAuth(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'unauthorized' });
  const u = userById(req.session.userId);
  if (!u) { req.session.destroy(() => {}); return res.status(401).json({ error: 'unauthorized' }); }
  req.user = u;
  next();
}
