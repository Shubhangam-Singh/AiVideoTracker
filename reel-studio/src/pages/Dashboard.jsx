import clsx from 'clsx';
import { STATUS_TO_DOT, STATUS_TO_PILL } from '../data/index.js';
import { SectionHead, Pill, AvatarStack } from '../components/shared.jsx';
import { useResource } from '../lib/useResource.js';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/AuthProvider.jsx';

export default function Dashboard({ onNav }) {
  const { user } = useAuth();
  const { data: videos } = useResource('/api/videos');
  const { data: tasks, setData: setTasks } = useResource('/api/tasks');
  const { data: prompts } = useResource('/api/prompts');
  const { data: tools } = useResource('/api/tools');

  const v = videos || []; const t = tasks || []; const p = prompts || []; const tl = tools || [];

  const userName = user?.name || 'there';
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const inProgress = v.filter(x => x.stage === 'editing' || x.stage === 'generating').length;
  const toolsActive = tl.filter(x => x.status === 'active').length;
  const dueToday = t.filter(x => !x.done && x.due === 'Today').length;
  const pipelineRows = v.filter(x => x.stage !== 'done').slice(0, 5);
  const todayTasks = t.slice(0, 5);
  const recentPrompts = p.slice(0, 3);

  const onToggleTask = async (task) => {
    setTasks(prev => (prev || []).map(x => x.id === task.id ? { ...x, done: !x.done } : x));
    try { await api.patch('/api/tasks/' + task.id, { done: !task.done }); } catch {}
  };

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 01 ] &nbsp; Dashboard &nbsp;— &nbsp; today</div>
          <h1>{timeGreet}, <span style={{ fontStyle: 'italic' }}>{userName}.</span></h1>
          <div className="sub">{v.filter(x => x.stage !== 'done').length} videos in pipeline &nbsp;·&nbsp; {dueToday} task{dueToday === 1 ? '' : 's'} due today.</div>
        </div>
        <div className="right">
          <div className="label">Open tasks</div>
          <div className="value">{t.filter(x => !x.done).length}</div>
          <div className="note">across both hands</div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="corner">all</div>
          <div className="label">Projects</div>
          <div className="num">{v.length}</div>
          <div className="delta"><b>{v.filter(x => x.stage === 'done').length}</b> shipped</div>
        </div>
        <div className="stat terra">
          <div className="corner">live</div>
          <div className="label">In progress</div>
          <div className="num">{inProgress}</div>
          <div className="delta"><b>{v.filter(x => x.stage === 'editing').length}</b> editing · <b>{v.filter(x => x.stage === 'generating').length}</b> generating</div>
        </div>
        <div className="stat sage">
          <div className="corner">stack</div>
          <div className="label">Tools active</div>
          <div className="num">{toolsActive}</div>
          <div className="delta"><b>{tl.filter(x => x.status === 'backup').length}</b> on backup</div>
        </div>
        <div className="stat">
          <div className="corner">today</div>
          <div className="label">Tasks done</div>
          <div className="num">{t.filter(x => x.done).length}</div>
          <div className="delta"><b>{t.filter(x => !x.done).length}</b> to go</div>
        </div>
      </div>

      <SectionHead num="02" title="Pipeline" sub="up to five projects in motion"
        right={<a onClick={() => onNav('pipeline')}>Open kanban →</a>} />
      <div className="plist">
        {pipelineRows.map(x => (
          <div className="prow" key={x.id} onClick={() => onNav('pipeline')}>
            <span className={`status-dot ${STATUS_TO_DOT[x.status] || 'gray'}`} />
            <div className="title">{x.title}{x.part && <small>— {x.part}</small>}</div>
            <div className="tool">{x.tool}</div>
            <AvatarStack whos={x.assignees || []} />
            <div className="right-pill"><Pill kind={STATUS_TO_PILL[x.status] || 'gray'}>{x.status}</Pill></div>
          </div>
        ))}
        {pipelineRows.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>
            All caught up. Add a project on the Pipeline page.
          </div>
        )}
      </div>

      <div className="two-col" style={{ marginTop: 64 }}>
        <div>
          <SectionHead num="03" title="Today" sub="small, finishable"
            right={<a onClick={() => onNav('tasks')}>All tasks →</a>} />
          <div className="task-list">
            {todayTasks.map(x => (
              <div key={x.id} className={clsx('task', x.done && 'done')} onClick={() => onToggleTask(x)}>
                <span className="check" />
                <div className="t-label">{x.label}</div>
                <div className="t-meta">{x.due}</div>
                <div className="t-link">{x.video}</div>
              </div>
            ))}
            {todayTasks.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>
                Nothing on the list — add one on the Tasks page.
              </div>
            )}
          </div>
        </div>

        <div>
          <SectionHead num="04" title="Recent prompts"
            right={<a onClick={() => onNav('prompts')}>Open vault →</a>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentPrompts.map(pr => (
              <div key={pr.id} className="prompt-card" style={{ minHeight: 0 }}>
                <div className="pc-head"><div className="pc-title">{pr.title}</div></div>
                <div className="pc-body">{pr.body}</div>
                <div className="pc-foot">
                  <span>{pr.tool.toLowerCase()}</span>
                  <span>{pr.frames > 0 ? `${pr.frames} frames` : 'concept'}</span>
                </div>
              </div>
            ))}
            {recentPrompts.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>
                Vault is empty.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
