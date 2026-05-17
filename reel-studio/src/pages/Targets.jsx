import { useState } from 'react';
import clsx from 'clsx';
import { fmt } from '../data/index.js';
import { SectionHead, Modal } from '../components/shared.jsx';
import { useResource } from '../lib/useResource.js';
import { api } from '../lib/api.js';

function TargetModal({ initial, onClose, onSave }) {
  const [t, setT] = useState(() => ({
    name: initial?.name || '',
    value: initial?.value || 0,
    goal: initial?.goal || 1,
    suffix: initial?.suffix || '',
    note: initial?.note || '',
    color: initial?.color || 'sage',
  }));
  const save = () => { if (!t.name.trim()) return; onSave({ ...t, value: Number(t.value) || 0, goal: Number(t.goal) || 1 }); };
  return (
    <Modal title={initial ? 'Edit target' : 'New target'} onClose={onClose}
      footer={<><button className="settings-secondary" onClick={onClose}>Cancel</button><button className="settings-primary" onClick={save}>{initial ? 'Save' : 'Create'}</button></>}>
      <div className="form-grid">
        <label className="form-field" style={{ gridColumn: '1 / -1' }}>
          <span>Name</span>
          <input className="settings-input" autoFocus value={t.name} onChange={e => setT({ ...t, name: e.target.value })} placeholder="Weekly uploads" />
        </label>
        <label className="form-field">
          <span>Current value</span>
          <input className="settings-input" type="number" value={t.value} onChange={e => setT({ ...t, value: e.target.value })} />
        </label>
        <label className="form-field">
          <span>Goal</span>
          <input className="settings-input" type="number" value={t.goal} onChange={e => setT({ ...t, goal: e.target.value })} />
        </label>
        <label className="form-field">
          <span>Unit (suffix)</span>
          <input className="settings-input" value={t.suffix} onChange={e => setT({ ...t, suffix: e.target.value })} placeholder="videos, views, subs" />
        </label>
        <label className="form-field">
          <span>Color</span>
          <select className="settings-input" value={t.color} onChange={e => setT({ ...t, color: e.target.value })}>
            <option value="sage">sage (calm)</option>
            <option value="terra">terra (warm)</option>
          </select>
        </label>
        <label className="form-field" style={{ gridColumn: '1 / -1' }}>
          <span>Note</span>
          <input className="settings-input" value={t.note} onChange={e => setT({ ...t, note: e.target.value })} placeholder="On pace / behind / soft" />
        </label>
      </div>
    </Modal>
  );
}

export default function Targets() {
  const { data: targets, setData, refetch } = useResource('/api/targets');
  const list = targets || [];
  const [modal, setModal] = useState(null);
  const [editingVal, setEditingVal] = useState(null); // { id, value }

  const create = async (payload) => {
    const created = await api.post('/api/targets', payload);
    setData(prev => [...(prev || []), created]);
    setModal(null);
  };
  const update = async (id, payload) => {
    const updated = await api.patch('/api/targets/' + id, payload);
    setData(prev => (prev || []).map(t => t.id === id ? updated : t));
    setModal(null);
  };
  const inlineSave = async () => {
    if (!editingVal) return;
    const id = editingVal.id;
    const value = Number(editingVal.value) || 0;
    setData(prev => (prev || []).map(t => t.id === id ? { ...t, value } : t));
    setEditingVal(null);
    try { await api.patch('/api/targets/' + id, { value }); } catch { refetch(); }
  };
  const remove = async (t) => {
    if (!confirm(`Delete "${t.name}"?`)) return;
    await api.delete('/api/targets/' + t.id);
    setData(prev => (prev || []).filter(x => x.id !== t.id));
  };

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 08 ] &nbsp; Targets</div>
          <h1>Where we'd like <span style={{ fontStyle: 'italic' }}>to arrive.</span></h1>
          <div className="sub">Goals, set softly. Re-read every Sunday evening.</div>
        </div>
        <div className="right">
          <div className="label">Add</div>
          <button className="settings-primary" onClick={() => setModal({ mode: 'create' })}>+ New target</button>
        </div>
      </div>

      <SectionHead num="·" title="Cadence" sub="tap a number to edit" />
      <div className="targets-grid">
        {list.map(t => {
          const pct = t.goal ? t.value / t.goal : 0;
          const editing = editingVal && editingVal.id === t.id;
          return (
            <div className="card target-card" key={t.id} style={{ position: 'relative' }}>
              <div className="tg-head">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>{t.suffix}</div>
                  <div className="tg-name">{t.name}</div>
                </div>
                <div className="tg-progress">
                  {editing ? (
                    <input
                      autoFocus
                      type="number"
                      value={editingVal.value}
                      onChange={e => setEditingVal({ ...editingVal, value: e.target.value })}
                      onBlur={inlineSave}
                      onKeyDown={e => { if (e.key === 'Enter') inlineSave(); if (e.key === 'Escape') setEditingVal(null); }}
                      className="settings-input"
                      style={{ width: 110, fontFamily: 'var(--serif)', fontSize: 22, padding: '4px 8px' }}
                    />
                  ) : (
                    <span style={{ cursor: 'pointer' }} onClick={() => setEditingVal({ id: t.id, value: t.value })}>
                      {fmt(t.value)} <span className="of">/ {fmt(t.goal)}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className={clsx('bar', t.color === 'terra' && 'terra')}>
                <span style={{ width: `${Math.min(100, pct * 100)}%` }} />
              </div>
              <div className="tg-foot">
                <span>{Math.round(pct * 100)}% &nbsp;·&nbsp; {t.note}</span>
                <span>{fmt(Math.max(0, t.goal - t.value))} to go</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button className="expand-btn" onClick={() => setModal({ mode: 'edit', target: t })}>Edit</button>
                <button className="expand-btn" onClick={() => remove(t)} style={{ color: 'var(--terracotta)' }}>Delete</button>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>
            No targets yet. Add one above.
          </div>
        )}
      </div>

      {modal && (
        <TargetModal
          initial={modal.mode === 'edit' ? modal.target : null}
          onClose={() => setModal(null)}
          onSave={p => modal.mode === 'edit' ? update(modal.target.id, p) : create(p)}
        />
      )}
    </div>
  );
}
