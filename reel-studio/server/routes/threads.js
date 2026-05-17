import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';
import { broadcast } from '../ws.js';

const r = Router();
r.use(requireAuth);

function parseMsg(m) {
  return {
    ...m,
    decision: !!m.decision,
    attachment: m.attachment_json ? JSON.parse(m.attachment_json) : null,
    reactions: m.reactions_json ? JSON.parse(m.reactions_json) : [],
  };
}

r.get('/', (_req, res) => {
  const threads = db.prepare(`
    SELECT t.*, (SELECT MAX(created_at) FROM messages m WHERE m.thread_id = t.id) AS last_at
    FROM threads t ORDER BY pinned DESC, COALESCE(last_at, created_at) DESC, created_at DESC
  `).all();
  res.json(threads.map(t => ({ ...t, pinned: !!t.pinned })));
});

r.post('/', (req, res) => {
  const id = req.body.id || 'th' + Date.now().toString(36);
  const row = {
    id,
    title: String(req.body.title || '').trim() || 'New thread',
    linked_video_id: req.body.linked_video_id || null,
    pinned: req.body.pinned ? 1 : 0,
    created_by: req.user.id,
    t: Date.now(),
  };
  db.prepare(`INSERT INTO threads (id, title, linked_video_id, pinned, created_by, created_at)
              VALUES (@id, @title, @linked_video_id, @pinned, @created_by, @t)`).run(row);
  const out = { ...row, pinned: !!row.pinned, created_at: row.t };
  broadcast({ type: 'thread.created', thread: out });
  res.status(201).json(out);
});

r.patch('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM threads WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  const fields = ['title', 'linked_video_id', 'pinned'];
  const sets = [];
  const args = { id: t.id };
  for (const f of fields) if (req.body[f] !== undefined) {
    sets.push(`${f} = @${f}`);
    args[f] = f === 'pinned' ? (req.body[f] ? 1 : 0) : req.body[f];
  }
  if (sets.length) db.prepare(`UPDATE threads SET ${sets.join(', ')} WHERE id = @id`).run(args);
  const out = db.prepare('SELECT * FROM threads WHERE id = ?').get(t.id);
  const formatted = { ...out, pinned: !!out.pinned };
  broadcast({ type: 'thread.updated', thread: formatted });
  res.json(formatted);
});

r.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM threads WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'not found' });
  broadcast({ type: 'thread.deleted', id: req.params.id });
  res.json({ ok: true });
});

r.get('/:id/messages', (req, res) => {
  const limit = Math.min(500, Number(req.query.limit) || 200);
  const rows = db.prepare('SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC LIMIT ?').all(req.params.id, limit);
  res.json(rows.map(parseMsg));
});

export default r;
