import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();
r.use(requireAuth);

r.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM tools ORDER BY ord, id').all());
});

r.post('/', (req, res) => {
  const id = req.body.id || 'tool-' + Date.now().toString(36);
  const ord = db.prepare('SELECT COALESCE(MAX(ord), 0)+1 AS o FROM tools').get().o;
  const row = {
    id,
    name: String(req.body.name || '').trim() || 'Untitled tool',
    purpose: req.body.purpose || '',
    status: req.body.status || 'active',
    cost: req.body.cost || 'free',
    ord,
  };
  db.prepare(`INSERT INTO tools (id, name, purpose, status, cost, ord)
              VALUES (@id, @name, @purpose, @status, @cost, @ord)`).run(row);
  res.status(201).json(row);
});

r.patch('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM tools WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  const fields = ['name', 'purpose', 'status', 'cost', 'ord'];
  const sets = [];
  const args = { id: t.id };
  for (const f of fields) if (req.body[f] !== undefined) { sets.push(`${f} = @${f}`); args[f] = req.body[f]; }
  if (sets.length) db.prepare(`UPDATE tools SET ${sets.join(', ')} WHERE id = @id`).run(args);
  res.json(db.prepare('SELECT * FROM tools WHERE id = ?').get(t.id));
});

r.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM tools WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

export default r;
