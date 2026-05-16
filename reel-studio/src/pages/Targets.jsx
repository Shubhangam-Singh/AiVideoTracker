import clsx from 'clsx';
import { TARGETS, fmt } from '../data/index.js';
import { SectionHead } from '../components/shared.jsx';

function Ring({ pct, color }) {
  const r = 54, c = 2 * Math.PI * r;
  const dash = c * Math.min(pct, 1);
  const stroke = color === 'terra' ? 'var(--terracotta)' : 'var(--sage)';
  return (
    <svg className="ring-svg" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} stroke="var(--surface)" strokeWidth="6" fill="none" />
      <circle
        cx="65" cy="65" r={r}
        stroke={stroke} strokeWidth="6" fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 65 65)"
        style={{ transition: 'stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1)' }}
      />
      <text x="65" y="71" textAnchor="middle"
        style={{ fontFamily: 'var(--serif)', fontSize: 26, fill: 'var(--ink)' }}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

export default function Targets() {
  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 08 ] &nbsp; Targets</div>
          <h1>Where we'd like <span style={{ fontStyle: 'italic' }}>to arrive.</span></h1>
          <div className="sub">Goals, set softly. Re-read every Sunday evening.</div>
        </div>
        <div className="right">
          <div className="label">Score</div>
          <div className="value">B+</div>
          <div className="note">felt, not measured</div>
        </div>
      </div>

      <SectionHead num="·" title="Cadence" sub="weekly + monthly" />
      <div className="targets-grid">
        {TARGETS.map(t => {
          const pct = t.value / t.of;
          return (
            <div className="card target-card" key={t.id}>
              <div className="tg-head">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>{t.suffix}</div>
                  <div className="tg-name">{t.name}</div>
                </div>
                <div className="tg-progress">
                  {fmt(t.value)} <span className="of">/ {fmt(t.of)}</span>
                </div>
              </div>
              <div className={clsx('bar', t.color === 'terra' && 'terra')}>
                <span style={{ width: `${pct * 100}%` }} />
              </div>
              <div className="tg-foot">
                <span>{Math.round(pct * 100)}% &nbsp;·&nbsp; {t.note}</span>
                <span>{fmt(t.of - t.value)} to go</span>
              </div>
            </div>
          );
        })}
      </div>

      <SectionHead num="·" title="Year, at a glance" sub="three rings" />
      <div className="card" style={{ padding: '36px 32px' }}>
        <div className="targets-year-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {[
            { label: 'Videos published', pct: 0.42, v: '42', of: '100 yr', color: 'sage', note: 'on pace' },
            { label: 'Views — 12 mo',    pct: 0.61, v: '1.2M', of: '2.0M', color: 'sage', note: 'ahead' },
            { label: 'Watch hours',      pct: 0.34, v: '34k', of: '100k', color: 'terra', note: 'softening' },
          ].map((r, i) => (
            <div className="ring-wrap" key={i}>
              <Ring pct={r.pct} color={r.color} />
              <div className="ring-info">
                <div className="rl">{r.label}</div>
                <div className="rv">{r.v} <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--pencil)', letterSpacing: '0.06em' }}>/ {r.of}</span></div>
                <div className="rn">{r.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
