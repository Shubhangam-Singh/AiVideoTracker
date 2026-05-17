import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { api } from '../lib/api.js';

export { clsx };

export const TWEAK_DEFAULTS = {
  accents: 'sage_terra',
  paper: 'warm',
  density: 'regular',
  fontScale: 14,
  chartStyle: 'area',
  ytFirst: false,
  annotations: true,
};

// Server-backed tweaks. Loads on mount, debounces writes, refetches after login.
export function useTweaks(defaults = TWEAK_DEFAULTS) {
  const [values, setValues] = useState(defaults);
  const saveTimer = useRef(null);
  const defaultsRef = useRef(defaults);

  // Load from server on mount AND when re-auth happens (so user-switch refreshes prefs)
  useEffect(() => {
    let cancelled = false;
    const load = () => api.get('/api/settings/me')
      .then(s => { if (!cancelled) setValues({ ...defaultsRef.current, ...(s || {}) }); })
      .catch(() => {});
    load();
    const onAuth = () => load();
    window.addEventListener('reel:authed', onAuth);
    return () => { cancelled = true; window.removeEventListener('reel:authed', onAuth); };
  }, []);

  const setTweak = useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => {
      const next = { ...prev, ...edits };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        api.put('/api/settings/me', next).catch(() => {});
      }, 250);
      return next;
    });
  }, []);

  const reset = useCallback(async () => {
    try { await api.delete('/api/settings/me'); } catch {}
    setValues(defaultsRef.current);
  }, []);

  return [values, setTweak, reset];
}

export function Avatar({ who, size }) {
  const cls = who === 'ai' ? 'ai' : who === 's1' ? 's1' : 's2';
  const style = size ? { width: size, height: size, fontSize: Math.max(10, size * 0.42) } : null;
  // Distinguishable initials so both users aren't just "S"
  const label = who === 'ai' ? '✦' : who === 's1' ? 'Sh' : who === 's2' ? 'Sa' : (who || '?').slice(0, 2).toUpperCase();
  return <div className={clsx('avatar', cls)} style={style}>{label}</div>;
}

export function AvatarStack({ whos }) {
  return (
    <div className="assignees">
      {whos.map((w, i) => <Avatar key={i} who={w} />)}
    </div>
  );
}

export function Pill({ kind, children }) {
  return <span className={clsx('pill', kind)}>{children}</span>;
}

export function SectionHead({ num, title, sub, right }) {
  return (
    <div className="section-head">
      <span className="num-badge">{num}</span>
      <h2>{title}</h2>
      {sub && <span className="sub">{sub}</span>}
      {right && <div className="right">{right}</div>}
    </div>
  );
}

// Common modal shell
export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={clsx('modal', wide && 'modal-wide')} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// Confirm dialog
export function useConfirm() {
  return (msg) => window.confirm(msg);
}
