import { useState } from 'react';
import { STAGES, STATUS_TO_PILL } from '../data/index.js';
import { SectionHead, Pill, AvatarStack, Modal } from '../components/shared.jsx';
import { useResource } from '../lib/useResource.js';
import { api } from '../lib/api.js';

const TOOL_OPTIONS = ['PicsArt Flow', 'Gemini', 'Google Vids', 'phot.ai', 'brainrot.mov', 'Viewmax', '—'];

function VideoModal({ initial, onClose, onSave, users }) {
  const [v, setV] = useState(() => ({
    title: initial?.title || '',
    part: initial?.part || '',
    stage: initial?.stage || 'idea',
    status: initial?.status || initial?.stage || 'idea',
    tool: initial?.tool || '—',
    frames: initial?.frames || 0,
    due: initial?.due || '—',
    assignees: initial?.assignees || [],
  }));
  const toggleAssignee = (id) => setV(p => ({ ...p, assignees: p.assignees.includes(id) ? p.assignees.filter(x => x !== id) : [...p.assignees, id] }));
  const save = () => {
    const next = { ...v, stage: v.stage, status: v.stage };
    if (!next.title.trim()) return;
    onSave(next);
  };
  return (
    <Modal title={initial ? 'Edit project' : 'New project'} onClose={onClose}
      footer={<><button className="settings-secondary" onClick={onClose}>Cancel</button><button className="settings-primary" onClick={save}>{initial ? 'Save' : 'Create'}</button></>}>
      <div className="form-grid">
        <label className="form-field">
          <span>Title</span>
          <input className="settings-input" value={v.title} onChange={e => setV({ ...v, title: e.target.value })} autoFocus placeholder="Project title" />
        </label>
        <label className="form-field">
          <span>Part (optional)</span>
          <input className="settings-input" value={v.part} onChange={e => setV({ ...v, part: e.target.value })} placeholder="Part 1" />
        </label>
        <label className="form-field">
          <span>Stage</span>
          <select className="settings-input" value={v.stage} onChange={e => setV({ ...v, stage: e.target.value })}>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Tool</span>
          <select className="settings-input" value={v.tool} onChange={e => setV({ ...v, tool: e.target.value })}>
            {TOOL_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Frames</span>
          <input className="settings-input" type="number" min={0} value={v.frames} onChange={e => setV({ ...v, frames: Number(e.target.value) || 0 })} />
        </label>
        <label className="form-field">
          <span>Due</span>
          <input className="settings-input" value={v.due} onChange={e => setV({ ...v, due: e.target.value })} placeholder="Today, Fri, Mar 10" />
        </label>
        <div className="form-field" style={{ gridColumn: '1 / -1' }}>
          <span>Assignees</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {users.map(u => (
              <button key={u.id} className={`chip ${v.assignees.includes(u.id) ? 'on' : ''}`} onClick={() => toggleAssignee(u.id)}>
                {u.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Pipeline() {
  const { data: videos, setData, refetch } = useResource('/api/videos');
  const { data: users } = useResource('/api/auth/users');
  const [modal, setModal] = useState(null); // { mode, video }
  const list = videos || [];
  const userList = users || [];

  const byStage = {};
  STAGES.forEach(s => byStage[s.id] = []);
  list.forEach(v => { if (byStage[v.stage]) byStage[v.stage].push(v); });

  const create = async (payload) => {
    const created = await api.post('/api/videos', payload);
    setData(prev => [...(prev || []), created]);
    setModal(null);
  };
  const update = async (id, patch) => {
    const updated = await api.patch('/api/videos/' + id, patch);
    setData(prev => (prev || []).map(v => v.id === id ? updated : v));
    setModal(null);
  };
  const moveStage = async (v, stage) => {
    setData(prev => (prev || []).map(x => x.id === v.id ? { ...x, stage, status: stage } : x));
    try { await api.patch('/api/videos/' + v.id, { stage, status: stage }); } catch { refetch(); }
  };
  const remove = async (v) => {
    if (!confirm(`Delete "${v.title}"?`)) return;
    await api.delete('/api/videos/' + v.id);
    setData(prev => (prev || []).filter(x => x.id !== v.id));
  };

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 04 ] &nbsp; Pipeline</div>
          <h1>The river of <span style={{ fontStyle: 'italic' }}>work in motion.</span></h1>
          <div className="sub">{list.length} projects across five quiet rooms.</div>
        </div>
        <div className="right">
          <div className="label">In progress</div>
          <div className="value">{list.filter(v => v.stage !== 'done' && v.stage !== 'idea').length}</div>
          <div className="note">moving today</div>
        </div>
      </div>

      <SectionHead
        num="·"
        title="Stages"
        sub="left to right — calmest first"
        right={<a onClick={() => setModal({ mode: 'create' })}>+ New project</a>}
      />

      <div className="kanban">
        {STAGES.map((s, idx) => (
          <div className="kcol" key={s.id}>
            <div className="khead">
              <div className="ktitle"><span className={`status-dot ${s.dot}`} />{s.label}</div>
              <div className="kcount">{byStage[s.id].length}</div>
            </div>
            <div className="kcards">
              {byStage[s.id].map((v, i) => (
                <div className="kcard" key={v.id} style={{ position: 'relative' }}>
                  <div className="knum">{String(idx + 1).padStart(2, '0')}·{String(i + 1).padStart(2, '0')}</div>
                  <div className="ktitle2" onClick={() => setModal({ mode: 'edit', video: v })} style={{ cursor: 'pointer' }}>
                    {v.title}{v.part && <span style={{ fontStyle: 'italic', color: 'var(--pencil)' }}> — {v.part}</span>}
                  </div>
                  <div className="kmeta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AvatarStack whos={v.assignees || []} />
                      <span className="ktool">{v.tool}</span>
                    </div>
                    <Pill kind={STATUS_TO_PILL[v.status]}>{v.frames > 0 ? `${v.frames}f` : '—'}</Pill>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <select
                      className="kcard-stage"
                      value={v.stage}
                      onChange={e => moveStage(v, e.target.value)}
                      onClick={e => e.stopPropagation()}
                    >
                      {STAGES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                    </select>
                    <button className="kcard-del" onClick={() => remove(v)} title="Delete">×</button>
                  </div>
                </div>
              ))}
              {byStage[s.id].length === 0 && (
                <div style={{ border: '0.5px dashed var(--hair-strong)', borderRadius: 5, padding: '20px 14px', textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 14 }}>
                  empty room
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <VideoModal
          initial={modal.mode === 'edit' ? modal.video : null}
          users={userList}
          onClose={() => setModal(null)}
          onSave={(payload) => modal.mode === 'edit' ? update(modal.video.id, payload) : create(payload)}
        />
      )}
    </div>
  );
}
