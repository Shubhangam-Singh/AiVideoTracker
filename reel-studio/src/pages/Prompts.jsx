import { useState } from 'react';
import clsx from 'clsx';
import { Modal } from '../components/shared.jsx';
import { useResource } from '../lib/useResource.js';
import { api } from '../lib/api.js';

const TOOL_OPTIONS = ['PicsArt Flow', 'Gemini', 'Google Vids', 'phot.ai', 'brainrot.mov', '—'];

function PromptModal({ initial, onClose, onSave }) {
  const [p, setP] = useState(() => ({
    title: initial?.title || '',
    tool: initial?.tool || 'PicsArt Flow',
    frames: initial?.frames || 0,
    body: initial?.body || '',
  }));
  const save = () => { if (!p.title.trim()) return; onSave(p); };
  return (
    <Modal title={initial ? 'Edit prompt' : 'New prompt'} onClose={onClose} wide
      footer={<><button className="settings-secondary" onClick={onClose}>Cancel</button><button className="settings-primary" onClick={save}>{initial ? 'Save' : 'Create'}</button></>}>
      <div className="form-grid">
        <label className="form-field" style={{ gridColumn: '1 / -1' }}>
          <span>Title</span>
          <input className="settings-input" autoFocus value={p.title} onChange={e => setP({ ...p, title: e.target.value })} placeholder="Mirror King — frame 7" />
        </label>
        <label className="form-field">
          <span>Tool</span>
          <select className="settings-input" value={p.tool} onChange={e => setP({ ...p, tool: e.target.value })}>
            {TOOL_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Frames</span>
          <input className="settings-input" type="number" min={0} value={p.frames} onChange={e => setP({ ...p, frames: Number(e.target.value) || 0 })} />
        </label>
        <label className="form-field" style={{ gridColumn: '1 / -1' }}>
          <span>Prompt body</span>
          <textarea className="settings-input" rows={8} value={p.body} onChange={e => setP({ ...p, body: e.target.value })} placeholder="wide-angle, low light…" />
        </label>
      </div>
    </Modal>
  );
}

export default function Prompts() {
  const { data: prompts, setData } = useResource('/api/prompts');
  const list = prompts || [];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(new Set());
  const [modal, setModal] = useState(null);

  const toggleExpanded = (id) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const tools = ['All', ...Array.from(new Set(list.map(p => p.tool)))];
  const filtered = list.filter(p => {
    if (filter !== 'All' && p.tool !== filter) return false;
    if (query && !(p.title + ' ' + p.body + ' ' + p.tool).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const create = async (payload) => {
    const created = await api.post('/api/prompts', payload);
    setData(prev => [created, ...(prev || [])]);
    setModal(null);
  };
  const update = async (id, payload) => {
    const updated = await api.patch('/api/prompts/' + id, payload);
    setData(prev => (prev || []).map(p => p.id === id ? updated : p));
    setModal(null);
  };
  const remove = async (p) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await api.delete('/api/prompts/' + p.id);
    setData(prev => (prev || []).filter(x => x.id !== p.id));
  };

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 05 ] &nbsp; Prompt vault</div>
          <h1>Words that <span style={{ fontStyle: 'italic' }}>moved pixels.</span></h1>
          <div className="sub">{list.length} saved prompts.</div>
        </div>
        <div className="right">
          <div className="label">Add</div>
          <button className="settings-primary" onClick={() => setModal({ mode: 'create' })}>+ New prompt</button>
        </div>
      </div>

      <div className="vault-toolbar">
        <div className="search">
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--pencil)', letterSpacing: '0.1em' }}>search</span>
          <input placeholder="by title, tool, or fragment…" value={query} onChange={e => setQuery(e.target.value)} />
          <span className="kbd">⌘ K</span>
        </div>
        <div className="filter-row">
          {tools.map(t => (
            <button key={t} className={clsx('filter', filter === t && 'on')} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="vault-grid">
        {filtered.map((p, i) => (
          <div className="vault-card" key={p.id} style={{ position: 'relative' }}>
            <div className="vc-num">No. {String(i + 1).padStart(2, '0')}</div>
            <div className="vc-title">{p.title}</div>
            <div className="vc-body" style={expanded.has(p.id) ? { display: 'block', WebkitLineClamp: 'unset' } : {}}>{p.body}</div>
            <div className="vc-meta">
              <span className="vc-frames">{p.frames > 0 ? `${p.frames} frames` : 'concept only'} &nbsp;·&nbsp; {p.tool.toLowerCase()}</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="expand-btn" onClick={() => toggleExpanded(p.id)}>{expanded.has(p.id) ? 'Collapse ↑' : 'Expand →'}</button>
                <button className="expand-btn" onClick={() => setModal({ mode: 'edit', prompt: p })}>Edit</button>
                <button className="expand-btn" onClick={() => remove(p)} style={{ color: 'var(--terracotta)' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 18 }}>
            nothing matches — try a softer word.
          </div>
        )}
      </div>

      {modal && (
        <PromptModal
          initial={modal.mode === 'edit' ? modal.prompt : null}
          onClose={() => setModal(null)}
          onSave={p => modal.mode === 'edit' ? update(modal.prompt.id, p) : create(p)}
        />
      )}
    </div>
  );
}
