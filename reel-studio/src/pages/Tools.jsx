import { TOOLS } from '../data/index.js';
import { SectionHead, Pill } from '../components/shared.jsx';

export default function Tools() {
  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 07 ] &nbsp; Tools</div>
          <h1>The studio's <span style={{ fontStyle: 'italic' }}>quiet stack.</span></h1>
          <div className="sub">{TOOLS.filter(t => t.status === 'active').length} active, {TOOLS.filter(t => t.status === 'backup').length} on backup. Nothing flashy.</div>
        </div>
        <div className="right">
          <div className="label">Monthly spend</div>
          <div className="value">₹ 2,840</div>
          <div className="note">across 3 paid tools</div>
        </div>
      </div>

      <SectionHead num="·" title="The stack" sub="ordered by use" right={<a>+ Add tool</a>} />

      <div className="tools-grid">
        {TOOLS.map((t, i) => (
          <div className="tool-card" key={t.id}>
            <div className="tc-num">No. {String(i + 1).padStart(2, '0')}</div>
            <div className="tc-name">{t.name}</div>
            <div className="tc-purpose">{t.purpose}</div>
            <div className="tc-foot">
              <span className="tc-cost">{t.cost}</span>
              <Pill kind={t.status === 'active' ? 'sage' : 'gray'}>{t.status}</Pill>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
