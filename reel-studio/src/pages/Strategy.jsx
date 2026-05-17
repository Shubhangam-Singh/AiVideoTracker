import { useState, useEffect, useRef } from 'react';
import { useResource } from '../lib/useResource.js';
import { api } from '../lib/api.js';
import { SectionHead } from '../components/shared.jsx';

function Section({ section, onSave, onDelete }) {
  const [heading, setHeading] = useState(section.heading);
  const [body, setBody] = useState(section.body);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef(null);

  useEffect(() => { setHeading(section.heading); setBody(section.body); setDirty(false); }, [section.id]);

  const queueSave = (h, b) => {
    setDirty(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try { await onSave({ heading: h, body: b }); setDirty(false); }
      finally { setSaving(false); }
    }, 600);
  };

  return (
    <div className="nb-section">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <input
          value={heading}
          onChange={e => { setHeading(e.target.value); queueSave(e.target.value, body); }}
          className="nb-heading-input"
        />
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: saving ? 'var(--terracotta)' : dirty ? 'var(--pencil)' : 'var(--sage)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {saving ? 'saving…' : dirty ? 'unsaved' : 'saved'}
        </span>
        <button className="expand-btn" style={{ color: 'var(--terracotta)' }} onClick={onDelete}>Delete</button>
      </div>
      <textarea
        value={body}
        onChange={e => { setBody(e.target.value); queueSave(heading, e.target.value); }}
        className="nb-body-input"
        rows={Math.max(2, body.split('\n').length + 1)}
      />
    </div>
  );
}

export default function Strategy() {
  const { data: sections, setData } = useResource('/api/strategy');
  const list = sections || [];

  const update = async (id, patch) => {
    const updated = await api.patch('/api/strategy/' + id, patch);
    setData(prev => (prev || []).map(s => s.id === id ? updated : s));
  };
  const add = async () => {
    const created = await api.post('/api/strategy', { heading: 'New section', body: 'Start writing here…' });
    setData(prev => [...(prev || []), created]);
  };
  const remove = async (s) => {
    if (!confirm(`Delete "${s.heading}"?`)) return;
    await api.delete('/api/strategy/' + s.id);
    setData(prev => (prev || []).filter(x => x.id !== s.id));
  };

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 09 ] &nbsp; Strategy</div>
          <h1>The <span style={{ fontStyle: 'italic' }}>working notebook.</span></h1>
          <div className="sub">A living record. Type to edit — autosaves quietly.</div>
        </div>
        <div className="right">
          <div className="label">Add</div>
          <button className="settings-primary" onClick={add}>+ New section</button>
        </div>
      </div>

      <div className="notebook">
        <div className="nb-page">
          <div className="nb-head">
            <h1>Channel notes</h1>
            <div className="date">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>

          {list.map(s => (
            <Section key={s.id} section={s} onSave={(p) => update(s.id, p)} onDelete={() => remove(s)} />
          ))}

          {list.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>
              Empty notebook. Add a section to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
