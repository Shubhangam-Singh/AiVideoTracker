import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTweaks, TWEAK_DEFAULTS } from './components/shared.jsx';
import {
  Sidebar, Topbar, Ledger, MobileTopbar, MobileNav, MoreSheet,
} from './components/Shell.jsx';
import { AuthProvider, useAuth } from './lib/AuthProvider.jsx';
import Login     from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';
import Chat      from './pages/Chat.jsx';
import Pipeline  from './pages/Pipeline.jsx';
import Prompts   from './pages/Prompts.jsx';
import Tasks     from './pages/Tasks.jsx';
import Tools     from './pages/Tools.jsx';
import Targets   from './pages/Targets.jsx';
import Strategy  from './pages/Strategy.jsx';
import Settings  from './pages/Settings.jsx';

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

function Shell() {
  const { user, loading, logout } = useAuth();
  const [tweaks, setTweak, resetTweaks] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useState(() => localStorage.getItem('reel.page') || 'dashboard');
  const [moreOpen, setMoreOpen] = useState(false);
  const [chatThreadOpen, setChatThreadOpen] = useState(false);

  useEffect(() => { if (active !== 'chat') setChatThreadOpen(false); }, [active]);
  useEffect(() => {
    localStorage.setItem('reel.page', active);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [active]);

  const p  = paperMap[tweaks.paper]   || paperMap.warm;
  const ac = accentMap[tweaks.accents] || accentMap.sage_terra;
  const rootStyle = {
    '--paper': p.paper, '--ink': p.ink, '--surface': p.surface, '--surface-2': p.surface2,
    '--sage': ac.a, '--terracotta': ac.b, '--sage-soft': ac.as, '--terracotta-soft': ac.bs,
    fontSize: tweaks.fontScale + 'px',
  };
  if (tweaks.paper === 'dusk') {
    rootStyle['--hair'] = 'rgba(237,233,223,0.16)';
    rootStyle['--hair-strong'] = 'rgba(237,233,223,0.34)';
    rootStyle['--pencil'] = '#7E7B72';
    rootStyle['--pencil-soft'] = '#3D3B36';
  }
  const densityClass = `density-${tweaks.density || 'regular'}`;

  if (loading) {
    return (
      <div className={clsx('app', densityClass)} style={{ ...rootStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 18 }}>opening the studio…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={clsx('app', densityClass)} style={{ ...rootStyle, display: 'block' }}>
        <Login />
      </div>
    );
  }

  let pageEl = null;
  switch (active) {
    case 'dashboard': pageEl = <Dashboard onNav={setActive} currentUser={user.id} />; break;
    case 'analytics': pageEl = <Analytics tweaks={tweaks} />; break;
    case 'chat':      pageEl = <Chat onMobileThreadOpenChange={setChatThreadOpen} currentUser={user.id} />; break;
    case 'pipeline':  pageEl = <Pipeline currentUser={user.id} />; break;
    case 'prompts':   pageEl = <Prompts currentUser={user.id} />; break;
    case 'tasks':     pageEl = <Tasks currentUser={user.id} />; break;
    case 'tools':     pageEl = <Tools />; break;
    case 'targets':   pageEl = <Targets />; break;
    case 'strategy':  pageEl = <Strategy />; break;
    case 'settings':  pageEl = <Settings tweaks={tweaks} setTweak={setTweak} resetTweaks={resetTweaks} onLogout={logout} />; break;
    default:          pageEl = <Dashboard onNav={setActive} currentUser={user.id} />;
  }

  return (
    <div className={clsx('app', densityClass)} style={rootStyle}>
      <Sidebar active={active} onNav={setActive} currentUser={user} />
      <main>
        <Topbar active={active} currentUser={user} />
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
      {moreOpen && (
        <MoreSheet
          active={active}
          onNav={setActive}
          onClose={() => setMoreOpen(false)}
          onLogout={logout}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
