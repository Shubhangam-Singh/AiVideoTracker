import { useState, useCallback } from 'react';
import clsx from 'clsx';

export { clsx };

// useTweaks hook
export function useTweaks(defaults) {
  const [values, setValues] = useState(defaults);
  const setTweak = useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    // post to parent in case embedded in iframe context
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
