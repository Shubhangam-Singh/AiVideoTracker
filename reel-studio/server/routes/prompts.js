import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();
r.use(requireAuth);

r.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM prompts ORDER BY created_at DESC').all());
});

r.post('/', (req, res) => {
  const id = req.body.id || 'p' + Date.now().toString(36);
  const row = {
    id,
    title: String(req.body.title || '').trim() || 'Untitled prompt',
    tool: req.body.tool || '—',
    frames: Number(req.body.frames) || 0,
    body: req.body.body || '',
    linked_video_id: req.body.linked_video_id || null,
    created_by: req.user.id,
    t: Date.now(),
  };
  db.prepare(`INSERT INTO prompts (id, title, tool, frames, body, linked_video_id, created_by, created_at)
              VALUES (@id, @title, @tool, @frames, @body, @linked_video_id, @created_by, @t)`).run(row);
  res.status(201).json(db.prepare('SELECT * FROM prompts WHERE id = ?').get(id));
});

r.patch('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  const fields = ['title', 'tool', 'frames', 'body', 'linked_video_id'];
  const sets = [];
  const args = { id: p.id };
  for (const f of fields) if (req.body[f] !== undefined) { sets.push(`${f} = @${f}`); args[f] = req.body[f]; }
  if (sets.length) db.prepare(`UPDATE prompts SET ${sets.join(', ')} WHERE id = @id`).run(args);
  res.json(db.prepare('SELECT * FROM prompts WHERE id = ?').get(p.id));
});

r.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM prompts WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

export default r;
