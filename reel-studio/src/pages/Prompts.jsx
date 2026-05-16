import { useState } from 'react';
import clsx from 'clsx';
import { PROMPTS } from '../data/index.js';

export default function Prompts() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const tools = ['All', 'PicsArt Flow', 'Gemini', 'brainrot.mov', 'phot.ai'];

  const filtered = PROMPTS.filter(p => {
    if (filter !== 'All' && p.tool !== filter) return false;
    if (query && !(p.title + ' ' + p.body).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 05 ] &nbsp; Prompt vault</div>
          <h1>Words that <span style={{ fontStyle: 'italic' }}>moved pixels.</span></h1>
          <div className="sub">{PROMPTS.length} saved prompts, organised the way they were written.</div>
        </div>
        <div className="right">
          <div className="label">Avg. frames per prompt</div>
          <div className="value">9</div>
          <div className="note">measured this month</div>
        </div>
      </div>

      <div className="vault-toolbar">
        <div className="search">
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--pencil)', letterSpacing: '0.1em' }}>search</span>
          <input
            placeholder="by title, tool, or fragment…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="kbd">⌘ K</span>
        </div>
        <div className="filter-row">
          {tools.map(t => (
            <button key={t} className={clsx('filter', filter === t && 'on')} onClick={() => setFilter(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="vault-grid">
        {filtered.map((p, i) => (
          <div className="vault-card" key={p.id}>
            <div className="vc-num">No. {String(i + 1).padStart(2, '0')}</div>
            <div className="vc-title">{p.title}</div>
            <div className="vc-body">{p.body}</div>
            <div className="vc-meta">
              <span className="vc-frames">{p.frames > 0 ? `${p.frames} frames` : 'concept only'} &nbsp;·&nbsp; {p.tool.toLowerCase()}</span>
              <button className="expand-btn">Expand →</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', padding: 60, textAlign: 'center',
            fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 18
          }}>
            nothing matches — try a softer word.
          </div>
        )}
      </div>
    </div>
  );
}
