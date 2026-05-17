import { useState } from 'react';
import clsx from 'clsx';
import { SectionHead, Avatar, Pill } from '../components/shared.jsx';
import { useResource } from '../lib/useResource.js';
import { api } from '../lib/api.js';

function TCol({ who, name, list, onToggle, onAdd, onDelete, onEdit }) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDue, setNewDue] = useState('Soon');
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDue, setEditDue] = useState('');
  const done = list.filter(t => t.done).length;

  const submitAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    onAdd({ label, who, due: newDue || 'Soon', video: '—' });
    setNewLabel(''); setNewDue('Soon'); setAdding(false);
  };

  const submitEdit = () => {
    if (!editingId) return;
    onEdit(editingId, { label: editLabel.trim() || 'Untitled', due: editDue || 'Soon' });
    setEditingId(null);
  };

  return (
    <div className="tcol">
      <div className="thead">
        <Avatar who={who} size={36} />
        <h3>{name}</h3>
        <div className="tmeta">{done} / {list.length} done</div>
      </div>
      <div className="tcards">
        {list.map(t => (
          <div key={t.id} className={clsx('tcard', t.done && 'done')} style={{ position: 'relative' }}>
            <span className="check" onClick={() => onToggle(t)} />
            {editingId === t.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 28 }}>
                <input
                  autoFocus
                  className="task-add-input"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                />
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    className="task-add-input"
                    placeholder="due"
                    value={editDue}
                    onChange={e => setEditDue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                    style={{ maxWidth: 100, fontSize: 12 }}
                  />
                  <button className="task-add-ok" onClick={submitEdit}>Save</button>
                  <button className="task-add-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ cursor: 'pointer' }} onClick={() => onToggle(t)}>
                <div className="tc-title">{t.label}</div>
                <div className="tc-meta">
                  <span>due <b>{t.due}</b></span>
                  {t.video && t.video !== '—' && <span>· linked: <b>{t.video}</b></span>}
                </div>
              </div>
            )}
            <Pill kind={t.done ? 'sage' : t.due === 'Today' ? 'terra' : 'gray'}>
              {t.done ? 'done' : t.due === 'Today' ? 'today' : 'queued'}
            </Pill>
            {editingId !== t.id && (
              <>
                <button
                  className="task-edit-btn"
                  onClick={(e) => { e.stopPropagation(); setEditingId(t.id); setEditLabel(t.label); setEditDue(t.due); }}
                  title="Edit"
                >✎</button>
                <button
                  className="task-delete-btn"
                  onClick={(e) => { e.stopPropagation(); onDelete(t); }}
                  title="Delete"
                >×</button>
              </>
            )}
          </div>
        ))}

        {adding && (
          <div className="tcard-add">
            <input
              autoFocus
              className="task-add-input"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') submitAdd();
                if (e.key === 'Escape') { setAdding(false); setNewLabel(''); }
              }}
              placeholder="What needs doing…"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <input
                className="task-add-input"
                placeholder="due (Today, Mon, etc)"
                value={newDue}
                onChange={e => setNewDue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitAdd(); }}
                style={{ flex: 1, fontSize: 12 }}
              />
              <button className="task-add-ok" onClick={submitAdd}>Add</button>
              <button className="task-add-cancel" onClick={() => { setAdding(false); setNewLabel(''); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {!adding && (
        <button className="task-add-btn" onClick={() => setAdding(true)}>
          + Add task
        </button>
      )}
    </div>
  );
}

export default function Tasks({ currentUser }) {
  const { data: tasks, refetch, setData } = useResource('/api/tasks');
  const list = tasks || [];
  const s1 = list.filter(t => t.who === 's1');
  const s2 = list.filter(t => t.who === 's2');

  const onAdd = async (payload) => {
    const created = await api.post('/api/tasks', payload);
    setData(prev => [...(prev || []), created]);
  };
  const onDelete = async (t) => {
    if (!confirm(`Delete "${t.label}"?`)) return;
    await api.delete('/api/tasks/' + t.id);
    setData(prev => (prev || []).filter(x => x.id !== t.id));
  };
  const onToggle = async (t) => {
    setData(prev => (prev || []).map(x => x.id === t.id ? { ...x, done: !x.done } : x));
    try { await api.patch('/api/tasks/' + t.id, { done: !t.done }); } catch { refetch(); }
  };
  const onEdit = async (id, patch) => {
    setData(prev => (prev || []).map(x => x.id === id ? { ...x, ...patch } : x));
    try { await api.patch('/api/tasks/' + id, patch); } catch { refetch(); }
  };

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 06 ] &nbsp; Tasks</div>
          <h1>Two hands, <span style={{ fontStyle: 'italic' }}>one studio.</span></h1>
          <div className="sub">{list.filter(t => !t.done).length} open · {list.filter(t => t.done).length} closed.</div>
        </div>
        <div className="right">
          <div className="label">Balance</div>
          <div className="value">{s1.filter(t => !t.done).length} &nbsp;·&nbsp; {s2.filter(t => !t.done).length}</div>
          <div className="note">open per person</div>
        </div>
      </div>

      <SectionHead num="·" title="Today's hands" sub="check it, ship it" />
      <div className="tboard">
        <TCol who="s1" name="Shubhangam" list={s1} onToggle={onToggle} onAdd={onAdd} onDelete={onDelete} onEdit={onEdit} />
        <TCol who="s2" name="Sanjeevani" list={s2} onToggle={onToggle} onAdd={onAdd} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </div>
  );
}
