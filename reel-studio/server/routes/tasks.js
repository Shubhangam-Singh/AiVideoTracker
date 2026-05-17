import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();
r.use(requireAuth);

const fmt = (t) => ({ ...t, done: !!t.done });

r.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM tasks ORDER BY ord, created_at').all().map(fmt));
});

r.post('/', (req, res) => {
  const id = req.body.id || 'task-' + Date.now().toString(36);
  const ord = db.prepare('SELECT COALESCE(MAX(ord), -1)+1 AS o FROM tasks').get().o;
  const row = {
    id,
    who: req.body.who || req.user.id,
    label: String(req.body.label || '').trim() || 'Untitled task',
    due: req.body.due || 'Soon',
    video: req.body.video || '—',
    done: req.body.done ? 1 : 0,
    ord,
    t: Date.now(),
  };
  db.prepare(`INSERT INTO tasks (id, who, label, due, video, done, ord, created_at)
              VALUES (@id, @who, @label, @due, @video, @done, @ord, @t)`).run(row);
  res.status(201).json(fmt(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)));
});

r.patch('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  const fields = ['who', 'label', 'due', 'video', 'done'];
  const sets = [];
  const args = { id: t.id };
  for (const f of fields) if (req.body[f] !== undefined) {
    sets.push(`${f} = @${f}`);
    args[f] = f === 'done' ? (req.body[f] ? 1 : 0) : req.body[f];
  }
  if (sets.length) db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = @id`).run(args);
  res.json(fmt(db.prepare('SELECT * FROM tasks WHERE id = ?').get(t.id)));
});

r.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

export default r;
