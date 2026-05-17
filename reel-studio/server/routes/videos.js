import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();
r.use(requireAuth);

function withAssignees(v) {
  if (!v) return v;
  const rows = db.prepare('SELECT user_id FROM video_assignees WHERE video_id = ?').all(v.id);
  return { ...v, assignees: rows.map(x => x.user_id) };
}

r.get('/', (_req, res) => {
  const list = db.prepare('SELECT * FROM videos ORDER BY ord, id').all();
  res.json(list.map(withAssignees));
});

r.post('/', (req, res) => {
  const id = req.body.id || 'v' + Date.now().toString(36);
  const v = {
    id,
    title: req.body.title || 'Untitled',
    part: req.body.part || '',
    status: req.body.status || 'idea',
    tool: req.body.tool || '—',
    stage: req.body.stage || req.body.status || 'idea',
    frames: Number(req.body.frames) || 0,
    due: req.body.due || '—',
  };
  const ord = (db.prepare('SELECT COALESCE(MAX(ord), -1)+1 AS o FROM videos').get().o);
  db.prepare(`INSERT INTO videos (id, title, part, status, tool, stage, frames, due, ord, updated_by, updated_at)
              VALUES (@id, @title, @part, @status, @tool, @stage, @frames, @due, @ord, @uby, @t)`)
    .run({ ...v, ord, uby: req.user.id, t: Date.now() });
  const assignees = Array.isArray(req.body.assignees) ? req.body.assignees : [req.user.id];
  const ins = db.prepare('INSERT OR IGNORE INTO video_assignees (video_id, user_id) VALUES (?, ?)');
  for (const u of assignees) ins.run(id, u);
  res.status(201).json(withAssignees(db.prepare('SELECT * FROM videos WHERE id = ?').get(id)));
});

r.patch('/:id', (req, res) => {
  const v = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'not found' });
  const fields = ['title', 'part', 'status', 'tool', 'stage', 'frames', 'due'];
  const sets = [];
  const args = {};
  for (const f of fields) if (req.body[f] !== undefined) { sets.push(`${f} = @${f}`); args[f] = req.body[f]; }
  if (sets.length) {
    args.id = v.id;
    args.t = Date.now();
    args.uby = req.user.id;
    db.prepare(`UPDATE videos SET ${sets.join(', ')}, updated_by = @uby, updated_at = @t WHERE id = @id`).run(args);
  }
  if (Array.isArray(req.body.assignees)) {
    db.prepare('DELETE FROM video_assignees WHERE video_id = ?').run(v.id);
    const ins = db.prepare('INSERT OR IGNORE INTO video_assignees (video_id, user_id) VALUES (?, ?)');
    for (const u of req.body.assignees) ins.run(v.id, u);
  }
  res.json(withAssignees(db.prepare('SELECT * FROM videos WHERE id = ?').get(v.id)));
});

r.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

export default r;
