import clsx from 'clsx';
import { SectionHead, Avatar, Pill } from '../components/shared.jsx';

function TCol({ who, name, list, onToggleTask }) {
  const done = list.filter(t => t.done).length;
  return (
    <div className="tcol">
      <div className="thead">
        <Avatar who={who} size={36} />
        <h3>{name}</h3>
        <div className="tmeta">{done} / {list.length} done</div>
      </div>
      <div className="tcards">
        {list.map(t => (
          <div key={t.id} className={clsx('tcard', t.done && 'done')} onClick={() => onToggleTask(t.id)}>
            <span className="check" />
            <div>
              <div className="tc-title">{t.label}</div>
              <div className="tc-meta">
                <span>due <b>{t.due}</b></span>
                <span>· linked: <b>{t.video}</b></span>
              </div>
            </div>
            <Pill kind={t.done ? 'sage' : t.due === 'Today' ? 'terra' : 'gray'}>
              {t.done ? 'done' : t.due === 'Today' ? 'today' : 'queued'}
            </Pill>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Tasks({ tasks, onToggleTask }) {
  const s1 = tasks.filter(t => t.who === 's1');
  const s2 = tasks.filter(t => t.who === 's2');

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 06 ] &nbsp; Tasks</div>
          <h1>Two hands, <span style={{ fontStyle: 'italic' }}>one studio.</span></h1>
          <div className="sub">{tasks.filter(t => !t.done).length} open · {tasks.filter(t => t.done).length} closed today.</div>
        </div>
        <div className="right">
          <div className="label">Balance</div>
          <div className="value">{s1.filter(t => !t.done).length} &nbsp;·&nbsp; {s2.filter(t => !t.done).length}</div>
          <div className="note">open per person</div>
        </div>
      </div>

      <SectionHead num="·" title="Today's hands" sub="check it, ship it" />

      <div className="tboard">
        <TCol who="s1" name="Shubhangam" list={s1} onToggleTask={onToggleTask} />
        <TCol who="s2" name="Sanjeevani" list={s2} onToggleTask={onToggleTask} />
      </div>
    </div>
  );
}
