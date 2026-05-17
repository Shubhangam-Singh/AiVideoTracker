import { useState } from 'react';
import { SectionHead, Pill, Modal } from '../components/shared.jsx';
import { useResource } from '../lib/useResource.js';
import { api } from '../lib/api.js';

function ToolModal({ initial, onClose, onSave }) {
  const [t, setT] = useState(() => ({
    name: initial?.name || '',
    purpose: initial?.purpose || '',
    status: initial?.status || 'active',
    cost: initial?.cost || 'free',
  }));
  const save = () => { if (!t.name.trim()) return; onSave(t); };
  return (
    <Modal title={initial ? 'Edit tool' : 'Add tool'} onClose={onClose}
      footer={<><button className="settings-secondary" onClick={onClose}>Cancel</button><button className="settings-primary" onClick={save}>{initial ? 'Save' : 'Add'}</button></>}>
      <div className="form-grid">
        <label className="form-field" style={{ gridColumn: '1 / -1' }}>
          <span>Name</span>
          <input className="settings-input" autoFocus value={t.name} onChange={e => setT({ ...t, name: e.target.value })} placeholder="PicsArt Flow" />
        </label>
        <label className="form-field" style={{ gridColumn: '1 / -1' }}>
          <span>Purpose</span>
          <textarea className="settings-input" rows={3} value={t.purpose} onChange={e => setT({ ...t, purpose: e.target.value })} placeholder="What's it for?" />
        </label>
        <label className="form-field">
          <span>Status</span>
          <select className="settings-input" value={t.status} onChange={e => setT({ ...t, status: e.target.value })}>
            <option value="active">active</option>
            <option value="backup">backup</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label className="form-field">
          <span>Cost</span>
          <select className="settings-input" value={t.cost} onChange={e => setT({ ...t, cost: e.target.value })}>
            <option value="free">free</option>
            <option value="paid">paid</option>
          </select>
        </label>
      </div>
    </Modal>
  );
}

export default function Tools() {
  const { data: tools, setData, refetch } = useResource('/api/tools');
  const list = tools || [];
  const [modal, setModal] = useState(null);

  const create = async (payload) => {
    const created = await api.post('/api/tools', payload);
    setData(prev => [...(prev || []), created]);
    setModal(null);
  };
  const update = async (id, payload) => {
    const updated = await api.patch('/api/tools/' + id, payload);
    setData(prev => (prev || []).map(t => t.id === id ? updated : t));
    setModal(null);
  };
  const toggleStatus = async (t) => {
    const next = t.status === 'active' ? 'backup' : 'active';
    setData(prev => (prev || []).map(x => x.id === t.id ? { ...x, status: next } : x));
    try { await api.patch('/api/tools/' + t.id, { status: next }); } catch { refetch(); }
  };
  const remove = async (t) => {
    if (!confirm(`Delete "${t.name}"?`)) return;
    await api.delete('/api/tools/' + t.id);
    setData(prev => (prev || []).filter(x => x.id !== t.id));
  };

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 07 ] &nbsp; Tools</div>
          <h1>The studio's <span style={{ fontStyle: 'italic' }}>quiet stack.</span></h1>
          <div className="sub">{list.filter(t => t.status === 'active').length} active, {list.filter(t => t.status === 'backup').length} on backup.</div>
        </div>
        <div className="right">
          <div className="label">Paid tools</div>
          <div className="value">{list.filter(t => t.cost === 'paid').length}</div>
          <div className="note">of {list.length} total</div>
        </div>
      </div>

      <SectionHead num="·" title="The stack" sub="ordered by use" right={<a onClick={() => setModal({ mode: 'create' })}>+ Add tool</a>} />

      <div className="tools-grid">
        {list.map((t, i) => (
          <div className="tool-card" key={t.id} style={{ position: 'relative' }}>
            <div className="tc-num">No. {String(i + 1).padStart(2, '0')}</div>
            <div className="tc-name">{t.name}</div>
            <div className="tc-purpose">{t.purpose}</div>
            <div className="tc-foot">
              <span className="tc-cost">{t.cost}</span>
              <button onClick={() => toggleStatus(t)} title="Toggle status">
                <Pill kind={t.status === 'active' ? 'sage' : 'gray'}>{t.status}</Pill>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '0.5px solid var(--hair)' }}>
              <button className="expand-btn" onClick={() => setModal({ mode: 'edit', tool: t })}>Edit</button>
              <button className="expand-btn" onClick={() => remove(t)} style={{ color: 'var(--terracotta)' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <ToolModal
          initial={modal.mode === 'edit' ? modal.tool : null}
          onClose={() => setModal(null)}
          onSave={(p) => modal.mode === 'edit' ? update(modal.tool.id, p) : create(p)}
        />
      )}
    </div>
  );
}
