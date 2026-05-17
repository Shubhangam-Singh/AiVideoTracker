import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { TASKS } from './data/index.js';
import { useTweaks, TWEAK_DEFAULTS } from './components/shared.jsx';
import {
  Sidebar, Topbar, Ledger, MobileTopbar, MobileNav, MoreSheet,
} from './components/Shell.jsx';
import {
  TweaksPanel, TweakSection, TweakSelect, TweakRadio, TweakSlider, TweakToggle, TweakButton,
} from './components/TweaksPanel.jsx';
import Login    from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';
import Chat     from './pages/Chat.jsx';
import Pipeline  from './pages/Pipeline.jsx';
import Prompts   from './pages/Prompts.jsx';
import Tasks     from './pages/Tasks.jsx';
import Tools     from './pages/Tools.jsx';
import Targets   from './pages/Targets.jsx';
import Strategy  from './pages/Strategy.jsx';

const paperMap = {
  warm:  { paper: '#F7F5F0', ink: '#1A1A18', surface: '#ECEAE4', surface2: '#E4E1DA' },
  cool:  { paper: '#F2F3F2', ink: '#1A1B1C', surface: '#E6E8E7', surface2: '#DCDEDD' },
  cream: { paper: '#FBF6E9', ink: '#1F1B12', surface: '#F0E9D2', surface2: '#E6DEC2' },
  dusk:  { paper: '#211F1B', ink: '#EDE9DF', surface: '#2A2823', surface2: '#34322C' },
};

const accentMap = {
  sage_terra: { a: '#8FAF8A', b: '#C4856A', as: '#cbd9c7', bs: '#e8cbbd' },
  ocean_rust: { a: '#6E94B8', b: '#B8745A', as: '#c8d5e1', bs: '#e1c4b3' },
  plum_olive: { a: '#94886E', b: '#9D7BA0', as: '#d6cfbf', bs: '#d4c4d5' },
  ink_gold:   { a: '#8C8678', b: '#B89A56', as: '#cfcbc1', bs: '#e3d4ad' },
};

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [currentUser, setCurrentUser] = useState(() => {
    try { return localStorage.getItem('reel.user') || null; } catch { return null; }
  });
  const login  = (who) => { try { localStorage.setItem('reel.user', who); } catch {} setCurrentUser(who); };
  const logout = ()    => { try { localStorage.removeItem('reel.user'); } catch {} setCurrentUser(null); };

  const [active, setActive] = useState(() => localStorage.getItem('reel.page') || 'dashboard');
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('reel.tasks');
      if (saved) {
        const savedMap = new Map(JSON.parse(saved).map(t => [t.id, t]));
        return TASKS.map(t => savedMap.has(t.id) ? { ...t, done: savedMap.get(t.id).done } : t);
      }
    } catch {}
    return TASKS;
  });
  const [moreOpen, setMoreOpen] = useState(false);
  const [chatThreadOpen, setChatThreadOpen] = useState(false);

  useEffect(() => { if (active !== 'chat') setChatThreadOpen(false); }, [active]);
  useEffect(() => {
    localStorage.setItem('reel.page', active);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [active]);

  const p  = paperMap[t.paper]   || paperMap.warm;
  const ac = accentMap[t.accents] || accentMap.sage_terra;
  const rootStyle = {
    '--paper': p.paper, '--ink': p.ink, '--surface': p.surface, '--surface-2': p.surface2,
    '--sage': ac.a, '--terracotta': ac.b, '--sage-soft': ac.as, '--terracotta-soft': ac.bs,
    fontSize: t.fontScale + 'px',
  };
  if (t.paper === 'dusk') {
    rootStyle['--hair'] = 'rgba(237,233,223,0.16)';
    rootStyle['--hair-strong'] = 'rgba(237,233,223,0.34)';
    rootStyle['--pencil'] = '#7E7B72';
    rootStyle['--pencil-soft'] = '#3D3B36';
  }
  const densityClass = `density-${t.density || 'regular'}`;

  const onToggleTask = (id) => {
    setTasks(prev => {
      const next = prev.map(task => task.id === id ? { ...task, done: !task.done } : task);
      try { localStorage.setItem('reel.tasks', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const onAddTask = ({ label, who, due = 'Soon', video = '—' }) => {
    const newTask = { id: 'task-' + Date.now(), label, who, due, video, done: false };
    setTasks(prev => {
      const next = [...prev, newTask];
      try { localStorage.setItem('reel.tasks', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const onDeleteTask = (id) => {
    setTasks(prev => {
      const next = prev.filter(task => task.id !== id);
      try { localStorage.setItem('reel.tasks', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Show login screen before the full app shell
  if (!currentUser) {
    return (
      <div className={clsx('app', densityClass)} style={{ ...rootStyle, display: 'block' }}>
        <Login onLogin={login} />
      </div>
    );
  }

  let pageEl = null;
  switch (active) {
    case 'dashboard': pageEl = <Dashboard tasks={tasks} onToggleTask={onToggleTask} onNav={setActive} currentUser={currentUser} />; break;
    case 'analytics': pageEl = <Analytics tweaks={t} />; break;
    case 'chat':      pageEl = <Chat onMobileThreadOpenChange={setChatThreadOpen} currentUser={currentUser} />; break;
    case 'pipeline':  pageEl = <Pipeline />; break;
    case 'prompts':   pageEl = <Prompts />; break;
    case 'tasks':     pageEl = <Tasks tasks={tasks} onToggleTask={onToggleTask} onAddTask={onAddTask} onDeleteTask={onDeleteTask} />; break;
    case 'tools':     pageEl = <Tools />; break;
    case 'targets':   pageEl = <Targets />; break;
    case 'strategy':  pageEl = <Strategy />; break;
    default:          pageEl = <Dashboard tasks={tasks} onToggleTask={onToggleTask} onNav={setActive} currentUser={currentUser} />;
  }

  return (
    <div className={clsx('app', densityClass)} style={rootStyle}>
      <Sidebar active={active} onNav={setActive} currentUser={currentUser} />
      <main>
        <Topbar active={active} currentUser={currentUser} />
        <MobileTopbar
          active={active}
          onMenu={() => setMoreOpen(true)}
          onBack={chatThreadOpen ? () => { window.dispatchEvent(new CustomEvent('reel:chat-back')); } : null}
          backLabel="Threads"
        />
        <div className="page" key={active}>
          {pageEl}
        </div>
        <Ledger active={active} />
      </main>
      <MobileNav active={active} onNav={setActive} onOpenMore={() => setMoreOpen(true)} />
      {moreOpen && <MoreSheet active={active} onNav={setActive} onClose={() => setMoreOpen(false)} onLogout={logout} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette" />
        <TweakSelect label="Pair" value={t.accents}
          options={[
            { value: 'sage_terra', label: 'Sage · Terracotta' },
            { value: 'ocean_rust', label: 'Ocean · Rust' },
            { value: 'plum_olive', label: 'Olive · Plum' },
            { value: 'ink_gold',   label: 'Stone · Gold' },
          ]}
          onChange={v => setTweak('accents', v)} />
        <TweakSelect label="Paper" value={t.paper}
          options={[
            { value: 'warm', label: 'Warm off-white' },
            { value: 'cool', label: 'Cool gray' },
            { value: 'cream', label: 'Cream' },
            { value: 'dusk', label: 'Dusk (dark)' },
          ]}
          onChange={v => setTweak('paper', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={['compact', 'regular', 'spacious']} onChange={v => setTweak('density', v)} />
        <TweakSlider label="Font scale" value={t.fontScale} min={12} max={17} step={1} unit="px" onChange={v => setTweak('fontScale', v)} />
        <TweakSection label="Analytics" />
        <TweakRadio label="Chart style" value={t.chartStyle} options={['area', 'line', 'bars']} onChange={v => setTweak('chartStyle', v)} />
        <TweakToggle label="YouTube uses warm color" value={t.ytFirst} onChange={v => setTweak('ytFirst', v)} />
        <TweakSection label="Detail" />
        <TweakToggle label="Editorial annotations" value={t.annotations} onChange={v => setTweak('annotations', v)} />
        <TweakButton label="Jump to Analytics" onClick={() => setActive('analytics')} />
        <TweakButton label="Switch user" onClick={logout} secondary />
      </TweaksPanel>
    </div>
  );
}
