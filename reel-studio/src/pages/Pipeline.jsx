import { VIDEOS, STAGES, STATUS_TO_PILL } from '../data/index.js';
import { SectionHead, Pill, AvatarStack } from '../components/shared.jsx';

export default function Pipeline() {
  const byStage = {};
  STAGES.forEach(s => byStage[s.id] = []);
  VIDEOS.forEach(v => { if (byStage[v.stage]) byStage[v.stage].push(v); });

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 04 ] &nbsp; Pipeline</div>
          <h1>The river of <span style={{ fontStyle: 'italic' }}>work in motion.</span></h1>
          <div className="sub">{VIDEOS.length} projects across five quiet rooms.</div>
        </div>
        <div className="right">
          <div className="label">Throughput</div>
          <div className="value">1.4 <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--pencil)', letterSpacing: '0.06em' }}>vids / wk</span></div>
          <div className="note">7-day rolling avg</div>
        </div>
      </div>

      <SectionHead
        num="·"
        title="Stages"
        sub="left to right — calmest first"
        right={
          <>
            <span>Filter: All</span>
            <a>+ New project</a>
          </>
        }
      />

      <div className="kanban">
        {STAGES.map((s, idx) => (
          <div className="kcol" key={s.id}>
            <div className="khead">
              <div className="ktitle">
                <span className={`status-dot ${s.dot}`} />
                {s.label}
              </div>
              <div className="kcount">{byStage[s.id].length}</div>
            </div>
            <div className="kcards">
              {byStage[s.id].map((v, i) => (
                <div className="kcard" key={v.id}>
                  <div className="knum">{String(idx + 1).padStart(2, '0')}·{String(i + 1).padStart(2, '0')}</div>
                  <div className="ktitle2">
                    {v.title}{v.part && <span style={{ fontStyle: 'italic', color: 'var(--pencil)' }}> — {v.part}</span>}
                  </div>
                  <div className="kmeta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AvatarStack whos={v.assignees} />
                      <span className="ktool">{v.tool}</span>
                    </div>
                    <Pill kind={STATUS_TO_PILL[v.status]}>{v.frames > 0 ? `${v.frames}f` : '—'}</Pill>
                  </div>
                </div>
              ))}
              {byStage[s.id].length === 0 && (
                <div style={{
                  border: '0.5px dashed var(--hair-strong)',
                  borderRadius: 5,
                  padding: '20px 14px',
                  textAlign: 'center',
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  color: 'var(--pencil)',
                  fontSize: 14,
                }}>
                  empty room
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
