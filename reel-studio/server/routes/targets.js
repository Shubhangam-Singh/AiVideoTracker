import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();
r.use(requireAuth);

r.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM targets ORDER BY ord, id').all());
});

r.post('/', (req, res) => {
  const id = req.body.id || 'tg-' + Date.now().toString(36);
  const ord = db.prepare('SELECT COALESCE(MAX(ord), 0)+1 AS o FROM targets').get().o;
  const row = {
    id,
    name: String(req.body.name || '').trim() || 'Untitled target',
    value: Number(req.body.value) || 0,
    goal: Number(req.body.goal) || 1,
    suffix: req.body.suffix || '',
    note: req.body.note || '',
    color: req.body.color || 'sage',
    ord,
  };
  db.prepare(`INSERT INTO targets (id, name, value, goal, suffix, note, color, ord)
              VALUES (@id, @name, @value, @goal, @suffix, @note, @color, @ord)`).run(row);
  res.status(201).json(row);
});

r.patch('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM targets WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  const fields = ['name', 'value', 'goal', 'suffix', 'note', 'color', 'ord'];
  const sets = [];
  const args = { id: t.id };
  for (const f of fields) if (req.body[f] !== undefined) { sets.push(`${f} = @${f}`); args[f] = req.body[f]; }
  if (sets.length) db.prepare(`UPDATE targets SET ${sets.join(', ')} WHERE id = @id`).run(args);
  res.json(db.prepare('SELECT * FROM targets WHERE id = ?').get(t.id));
});

r.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM targets WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

export default r;
