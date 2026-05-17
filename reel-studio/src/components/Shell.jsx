import { useEffect } from 'react';
import clsx from 'clsx';
import { NAV } from '../data/index.js';

const FULL_NAV = [
  ...NAV,
  { id: 'settings', label: 'Settings', meta: '10' },
];

export function Sidebar({ active, onNav, currentUser }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="reel">Reel</div>
        <div className="studio">Studio</div>
        <div className="tag">Est. 2026 · Two Hands</div>
      </div>

      <nav className="nav">
        {FULL_NAV.map(item => (
          <button
            key={item.id}
            className={clsx('nav-item', active === item.id && 'active')}
            onClick={() => onNav(item.id)}
          >
            <span className="dot" />
            <span>{item.label}</span>
            <span className="meta">{item.meta}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="users">
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pencil)' }}>
          Signed in
        </div>
        {currentUser && (
          <div className="user-row">
            <div className={`avatar ${currentUser.id}`}>S</div>
            <div className="name">{currentUser.name}</div>
            <div className="status">on</div>
          </div>
        )}
      </div>
    </aside>
  );
}

export function Topbar({ active, currentUser }) {
  const item = FULL_NAV.find(n => n.id === active);
  return (
    <div className="topbar">
      <div className="crumbs">
        Reel Studio &nbsp;/&nbsp; <b>{item ? item.label : ''}</b>
      </div>
      <div className="right">
        {currentUser && <div className="date">Hi, {currentUser.name.split(' ')[0]}.</div>}
        <div className="weather">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
  );
}

export function Ledger({ active }) {
  return (
    <div className="ledger">
      <div>Reel Studio · v1.0 · live</div>
      <div className="dots">
        {FULL_NAV.map(n => <span key={n.id} className={active === n.id ? 'on' : ''} />)}
      </div>
      <div>Page {Math.max(1, FULL_NAV.findIndex(n => n.id === active) + 1)} / {FULL_NAV.length}</div>
    </div>
  );
}

export function MobileTopbar({ active, onMenu, backLabel, onBack }) {
  const item = FULL_NAV.find(n => n.id === active);
  return (
    <div className="mobile-topbar">
      {onBack ? (
        <button className="mobile-back-btn" onClick={onBack}>
          <span>‹</span> {backLabel || 'Back'}
        </button>
      ) : (
        <div className="mt-logo">Reel<i>Studio</i></div>
      )}
      <div style={{ flex: 1, minWidth: 0, textAlign: onBack ? 'left' : 'right' }}>
        <div className="mt-sub">{item ? '[ ' + item.meta + ' ]' : ''}</div>
        <div className="mt-title" style={{ textAlign: onBack ? 'left' : 'right' }}>{item ? item.label : ''}</div>
      </div>
      <button className="mt-action" onClick={onMenu} aria-label="Menu">
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 0 }}>···</span>
      </button>
    </div>
  );
}

export const ICONS = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="4" rx="1.5"/><rect x="13" y="10" width="7" height="10" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/></svg>,
  analytics: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-4"/><path d="M12 16V9"/><path d="M16 16v-7"/></svg>,
  chat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>,
  pipeline: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h8"/><path d="M6 8v8"/><path d="M18 8v8"/><path d="M8 18h8"/></svg>,
  more: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/></svg>,
  prompts: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h11l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 12h8"/><path d="M8 16h5"/></svg>,
  tasks: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l2 2 4-4"/><path d="M9 13l2 2 4-4"/><path d="M9 20l2 2 4-4"/><path d="M4 6h1"/><path d="M4 13h1"/><path d="M4 20h1"/></svg>,
  tools: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6-3 3-2-2-4 4 2 2-3 3-6-6 3-3 2 2 4-4-2-2z"/></svg>,
  targets: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/></svg>,
  strategy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h12a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2-2-1V5a1 1 0 0 1 1-1z"/><path d="M9 9h6"/><path d="M9 13h4"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
};

const MOBILE_PRIMARY = ['dashboard', 'chat', 'pipeline', 'tasks'];

export function MobileNav({ active, onNav, onOpenMore }) {
  const isPrimary = MOBILE_PRIMARY.includes(active);
  return (
    <div className="mobile-nav">
      {MOBILE_PRIMARY.map(id => {
        const item = FULL_NAV.find(n => n.id === id);
        return (
          <button
            key={id}
            className={active === id ? 'active' : ''}
            onClick={() => onNav(id)}
            aria-label={item.label}
          >
            <span className="mn-icon">{ICONS[id]}</span>
            {item.label}
          </button>
        );
      })}
      <button
        className={!isPrimary ? 'active' : ''}
        onClick={onOpenMore}
        aria-label="More"
      >
        <span className="mn-icon">{ICONS.more}</span>
        More
      </button>
    </div>
  );
}

export function MoreSheet({ active, onNav, onClose, onLogout }) {
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <>
      <div className="more-sheet-backdrop" onClick={onClose} />
      <div className="more-sheet" role="dialog" aria-label="More">
        <div className="more-sheet-handle" />
        <div className="more-sheet-title">More</div>
        {FULL_NAV.filter(n => !MOBILE_PRIMARY.includes(n.id)).map(n => (
          <button
            key={n.id}
            className={clsx('more-sheet-row', active === n.id && 'active')}
            onClick={() => { onNav(n.id); onClose(); }}
          >
            <span className="ms-dot" />
            <span style={{ width: 20, height: 20, color: 'var(--pencil)' }}>{ICONS[n.id]}</span>
            <span>{n.label}</span>
            <span className="ms-meta">{n.meta}</span>
          </button>
        ))}
        {onLogout && (
          <button
            className="more-sheet-row"
            onClick={() => { onLogout(); onClose(); }}
            style={{ color: 'var(--terracotta)' }}
          >
            <span className="ms-dot" />
            <span style={{ width: 20, height: 20 }} />
            Sign out
          </button>
        )}
        <button
          className="more-sheet-row"
          onClick={onClose}
          style={{ marginTop: 8, color: 'var(--pencil)', fontStyle: 'italic', fontSize: 15 }}
        >
          <span style={{ width: 6, height: 6 }} />
          <span style={{ width: 20, height: 20 }} />
          Close
        </button>
      </div>
    </>
  );
}
