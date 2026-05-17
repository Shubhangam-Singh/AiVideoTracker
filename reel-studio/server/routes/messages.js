import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';
import { broadcast } from '../ws.js';
import { aiReply } from '../ai.js';

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

function insertMessage({ threadId, from, kind = 'text', text = '', attachment = null, decision = 0, decisionText = '' }) {
  const id = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const created_at = Date.now();
  db.prepare(`INSERT INTO messages (id, thread_id, from_user, kind, text, attachment_json, decision, decision_text, reactions_json, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, threadId, from, kind, text, attachment ? JSON.stringify(attachment) : null, decision ? 1 : 0, decisionText, null, created_at);
  return parseMsg(db.prepare('SELECT * FROM messages WHERE id = ?').get(id));
}

r.post('/', async (req, res) => {
  const { threadId, kind = 'text', text = '', attachment = null, decision = false, decisionText = '' } = req.body || {};
  if (!threadId) return res.status(400).json({ error: 'threadId required' });
  const t = db.prepare('SELECT id FROM threads WHERE id = ?').get(threadId);
  if (!t) return res.status(404).json({ error: 'thread not found' });
  if (kind === 'text' && !text.trim() && !attachment && !decision) return res.status(400).json({ error: 'empty message' });

  const msg = insertMessage({ threadId, from: req.user.id, kind, text, attachment, decision: decision ? 1 : 0, decisionText });
  broadcast({ type: 'message.created', threadId, message: msg });
  res.status(201).json(msg);

  // Trigger AI reply if message mentions @claude or kind is 'ai-prompt'
  const wantsAi = kind === 'ai-prompt' || /\B@claude\b/i.test(text);
  if (wantsAi) {
    const recent = db.prepare('SELECT from_user as "from", text FROM messages WHERE thread_id = ? AND decision = 0 AND kind != \'attach\' ORDER BY created_at DESC LIMIT 12').all(threadId).reverse();
    const cleanText = text.replace(/\B@claude\b/gi, '').trim() || 'help us think about this';
    try {
      const reply = await aiReply({ userText: cleanText, recent });
      const aiMsg = insertMessage({ threadId, from: 'ai', kind: 'ai', text: reply });
      broadcast({ type: 'message.created', threadId, message: aiMsg });
    } catch (err) {
      console.error('[ai] failed', err);
    }
  }
});

r.delete('/:id', (req, res) => {
  const m = db.prepare('SELECT thread_id FROM messages WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'not found' });
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  broadcast({ type: 'message.deleted', threadId: m.thread_id, id: req.params.id });
  res.json({ ok: true });
});

export default r;
