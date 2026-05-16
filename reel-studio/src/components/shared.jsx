import { useState, useCallback } from 'react';
import clsx from 'clsx';

export { clsx };

const TWEAKS_KEY = 'reel.tweaks.v1';

// useTweaks hook
export function useTweaks(defaults) {
  const [values, setValues] = useState(() => {
    try {
      const saved = localStorage.getItem(TWEAKS_KEY);
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch {}
    return defaults;
  });
  const setTweak = useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => {
      const next = { ...prev, ...edits };
      try { localStorage.setItem(TWEAKS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*'); } catch (e) {}
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

export const TWEAK_DEFAULTS = {
  accents: 'ocean_rust',
  paper: 'cool',
  density: 'regular',
  fontScale: 14,
  chartStyle: 'area',
  ytFirst: true,
  annotations: true,
};

// Shared UI components
export function Avatar({ who, size }) {
  const cls = who === 's1' ? 's1' : 's2';
  const style = size ? { width: size, height: size, fontSize: Math.max(10, size * 0.45) } : null;
  return <div className={clsx('avatar', cls)} style={style}>S</div>;
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
