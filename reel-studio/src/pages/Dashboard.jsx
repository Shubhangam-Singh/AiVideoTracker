import clsx from 'clsx';
import { VIDEOS, TOOLS, PROMPTS, STATUS_TO_DOT, STATUS_TO_PILL } from '../data/index.js';
import { SectionHead, Pill, AvatarStack } from '../components/shared.jsx';

export default function Dashboard({ tasks, onToggleTask, onNav, currentUser }) {
  const userName = currentUser === 's2' ? 'Sanjeevani' : 'Shubhangam';
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const inProgress = VIDEOS.filter(v => v.stage === 'editing' || v.stage === 'generating').length;
  const toolsActive = TOOLS.filter(t => t.status === 'active').length;
  const dueToday = tasks.filter(t => !t.done && t.due === 'Today').length;

  const pipelineRows = VIDEOS.filter(v => v.stage !== 'done').slice(0, 5);
  const todayTasks = tasks.slice(0, 5);
  const recentPrompts = PROMPTS.slice(0, 3);

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 01 ] &nbsp; Dashboard &nbsp;— &nbsp; today</div>
          <h1>{timeGreet}, <span style={{ fontStyle: 'italic' }}>{userName}.</span></h1>
          <div className="sub">{VIDEOS.filter(v => v.stage !== 'done').length} videos in pipeline &nbsp;·&nbsp; {dueToday} task{dueToday === 1 ? '' : 's'} due today &nbsp;·&nbsp; the studio is quiet.</div>
        </div>
        <div className="right">
          <div className="label">This week</div>
          <div className="value">3 / 4 <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--pencil)', letterSpacing: '0.06em' }}>videos</span></div>
          <div className="note">one more for Friday</div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="corner">YTD</div>
          <div className="label">Videos made</div>
          <div className="num">42</div>
          <div className="delta"><b>+ 6</b> vs. last month</div>
        </div>
        <div className="stat terra">
          <div className="corner">live</div>
          <div className="label">In progress</div>
          <div className="num">{inProgress}</div>
          <div className="delta"><b>2</b> editing &nbsp;·&nbsp; <b>1</b> generating</div>
        </div>
        <div className="stat sage">
          <div className="corner">stack</div>
          <div className="label">Tools active</div>
          <div className="num">{toolsActive}</div>
          <div className="delta"><b>1</b> on backup</div>
        </div>
        <div className="stat">
          <div className="corner">w/22</div>
          <div className="label">Weekly target</div>
          <div className="num">4</div>
          <div className="delta"><b>3</b> shipped · 1 to go</div>
        </div>
      </div>

      <SectionHead
        num="02"
        title="Pipeline"
        sub="five projects, mid-stream"
        right={<a onClick={() => onNav('pipeline')}>Open kanban →</a>}
      />
      <div className="plist">
        {pipelineRows.map(v => (
          <div className="prow" key={v.id} onClick={() => onNav('pipeline')}>
            <span className={`status-dot ${STATUS_TO_DOT[v.status]}`} />
            <div className="title">
              {v.title}{v.part && <small>— {v.part}</small>}
            </div>
            <div className="tool">{v.tool}</div>
            <AvatarStack whos={v.assignees} />
            <div className="right-pill"><Pill kind={STATUS_TO_PILL[v.status]}>{v.status}</Pill></div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginTop: 64 }}>
        <div>
          <SectionHead
            num="03"
            title="Today"
            sub="small, finishable"
            right={<a onClick={() => onNav('tasks')}>All tasks →</a>}
          />
          <div className="task-list">
            {todayTasks.map(t => (
              <div key={t.id} className={clsx('task', t.done && 'done')} onClick={() => onToggleTask(t.id)}>
                <span className="check" />
                <div className="t-label">{t.label}</div>
                <div className="t-meta">{t.due}</div>
                <div className="t-link">{t.video}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHead
            num="04"
            title="Recent prompts"
            right={<a onClick={() => onNav('prompts')}>Open vault →</a>}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentPrompts.map(p => (
              <div key={p.id} className="prompt-card" style={{ minHeight: 0 }}>
                <div className="pc-head">
                  <div className="pc-title">{p.title}</div>
                </div>
                <div className="pc-body">{p.body}</div>
                <div className="pc-foot">
                  <span>{p.tool.toLowerCase()}</span>
                  <span>{p.frames > 0 ? `${p.frames} frames` : 'concept'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
