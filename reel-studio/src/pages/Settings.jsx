import { useState } from 'react';
import { useAuth } from '../lib/AuthProvider.jsx';
import { api } from '../lib/api.js';
import { SectionHead } from '../components/shared.jsx';

function Row({ label, hint, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row-label">
        <div className="settings-row-name">{label}</div>
        {hint && <div className="settings-row-hint">{hint}</div>}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

function Segment({ value, options, onChange }) {
  return (
    <div className="settings-segment">
      {options.map(opt => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const l = typeof opt === 'string' ? opt : opt.label;
        return (
          <button key={v} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>
        );
      })}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button className={`settings-toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)} aria-pressed={value}>
      <span className="settings-toggle-dot" />
    </button>
  );
}

export default function Settings({ tweaks, setTweak, resetTweaks, onLogout }) {
  const { user } = useAuth();
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNext, setPwNext] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwBusy, setPwBusy] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (!pwCurrent || !pwNext) return;
    if (pwNext.length < 6) { setPwMsg({ kind: 'err', text: 'new password must be at least 6 characters' }); return; }
    setPwBusy(true);
    try {
      await api.post('/api/auth/password', { current: pwCurrent, next: pwNext });
      setPwMsg({ kind: 'ok', text: 'password changed.' });
      setPwCurrent(''); setPwNext('');
    } catch (err) {
      setPwMsg({ kind: 'err', text: err.message });
    } finally { setPwBusy(false); }
  };

  const exportData = async () => {
    const [videos, tasks, prompts, tools, targets, strategy, threads] = await Promise.all([
      api.get('/api/videos'),
      api.get('/api/tasks'),
      api.get('/api/prompts'),
      api.get('/api/tools'),
      api.get('/api/targets'),
      api.get('/api/strategy'),
      api.get('/api/threads'),
    ]);
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), user, videos, tasks, prompts, tools, targets, strategy, threads }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reel-studio-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 10 ] &nbsp; Settings</div>
          <h1>Tune the <span style={{ fontStyle: 'italic' }}>studio.</span></h1>
          <div className="sub">Account, appearance, and your data — all in one place.</div>
        </div>
      </div>

      <SectionHead num="·" title="Account" sub="who you are here" />
      <div className="settings-card">
        <Row label="Name" hint="how it shows in the sidebar"><div className="settings-static">{user?.name}</div></Row>
        <Row label="Username" hint="used at sign-in"><div className="settings-static settings-mono">{user?.username}</div></Row>
        <Row label="Role"><div className="settings-static">{user?.role}</div></Row>
      </div>

      <SectionHead num="·" title="Change password" />
      <form className="settings-card" onSubmit={changePassword}>
        <Row label="Current password">
          <input type="password" className="settings-input" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} autoComplete="current-password" />
        </Row>
        <Row label="New password" hint="6 characters or more">
          <input type="password" className="settings-input" value={pwNext} onChange={e => setPwNext(e.target.value)} autoComplete="new-password" />
        </Row>
        <Row label="">
          <button type="submit" className="settings-primary" disabled={pwBusy || !pwCurrent || !pwNext}>
            {pwBusy ? 'saving…' : 'Update password'}
          </button>
        </Row>
        {pwMsg && (
          <div style={{ padding: '0 22px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: pwMsg.kind === 'ok' ? 'var(--sage)' : 'var(--terracotta)' }}>
            {pwMsg.text}
          </div>
        )}
      </form>

      <SectionHead num="·" title="Appearance" sub="saved per user" />
      <div className="settings-card">
        <Row label="Palette" hint="accent pair">
          <Segment value={tweaks.accents} onChange={v => setTweak('accents', v)}
            options={[
              { value: 'sage_terra', label: 'Sage · Terra' },
              { value: 'ocean_rust', label: 'Ocean · Rust' },
              { value: 'plum_olive', label: 'Olive · Plum' },
              { value: 'ink_gold',   label: 'Stone · Gold' },
            ]} />
        </Row>
        <Row label="Paper" hint="background mood">
          <Segment value={tweaks.paper} onChange={v => setTweak('paper', v)}
            options={[
              { value: 'warm', label: 'Warm' },
              { value: 'cool', label: 'Cool' },
              { value: 'cream', label: 'Cream' },
              { value: 'dusk', label: 'Dusk' },
            ]} />
        </Row>
        <Row label="Density">
          <Segment value={tweaks.density} options={['compact', 'regular', 'spacious']} onChange={v => setTweak('density', v)} />
        </Row>
        <Row label="Font scale" hint={`${tweaks.fontScale}px`}>
          <input type="range" min={12} max={17} step={1} value={tweaks.fontScale} onChange={e => setTweak('fontScale', Number(e.target.value))} className="settings-range" />
        </Row>
        <Row label="Chart style" hint="for Analytics">
          <Segment value={tweaks.chartStyle} options={['area', 'line', 'bars']} onChange={v => setTweak('chartStyle', v)} />
        </Row>
        <Row label="YouTube warm color" hint="otherwise Instagram is warm">
          <Toggle value={!!tweaks.ytFirst} onChange={v => setTweak('ytFirst', v)} />
        </Row>
        <Row label="Editorial annotations" hint="margin notes on Analytics">
          <Toggle value={!!tweaks.annotations} onChange={v => setTweak('annotations', v)} />
        </Row>
        <Row label="">
          <button className="settings-secondary" onClick={resetTweaks}>Reset appearance</button>
        </Row>
      </div>

      <SectionHead num="·" title="Data" sub="export, sign out" />
      <div className="settings-card">
        <Row label="Export all data" hint="JSON snapshot of everything"><button className="settings-secondary" onClick={exportData}>Download JSON</button></Row>
        <Row label="Sign out of this device"><button className="settings-danger" onClick={onLogout}>Sign out</button></Row>
      </div>
    </div>
  );
}
