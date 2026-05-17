import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();
r.use(requireAuth);

r.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM strategy_sections ORDER BY ord, id').all());
});

r.post('/', (req, res) => {
  const id = req.body.id || 'sec-' + Date.now().toString(36);
  const ord = db.prepare('SELECT COALESCE(MAX(ord), 0)+1 AS o FROM strategy_sections').get().o;
  const row = {
    id,
    heading: String(req.body.heading || '').trim() || 'New section',
    body: req.body.body || '',
    ord,
    t: Date.now(),
  };
  db.prepare(`INSERT INTO strategy_sections (id, heading, body, ord, updated_at)
              VALUES (@id, @heading, @body, @ord, @t)`).run(row);
  res.status(201).json(db.prepare('SELECT * FROM strategy_sections WHERE id = ?').get(id));
});

r.patch('/:id', (req, res) => {
  const s = db.prepare('SELECT * FROM strategy_sections WHERE id = ?').get(req.params.id);
  if (!s) return res.status(404).json({ error: 'not found' });
  const fields = ['heading', 'body', 'ord'];
  const sets = [];
  const args = { id: s.id };
  for (const f of fields) if (req.body[f] !== undefined) { sets.push(`${f} = @${f}`); args[f] = req.body[f]; }
  sets.push('updated_at = @t'); args.t = Date.now();
  db.prepare(`UPDATE strategy_sections SET ${sets.join(', ')} WHERE id = @id`).run(args);
  res.json(db.prepare('SELECT * FROM strategy_sections WHERE id = ?').get(s.id));
});

r.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM strategy_sections WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

export default r;
