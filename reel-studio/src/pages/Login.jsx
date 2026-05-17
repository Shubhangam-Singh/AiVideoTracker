import { useState } from 'react';
import { useAuth } from '../lib/AuthProvider.jsx';

export default function Login() {
  const { login, error, setError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!username || !password) return;
    setBusy(true); setError(null);
    try { await login(username, password); }
    catch {}
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: '24px 18px' }}>
      <form onSubmit={submit} style={{ maxWidth: 380, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 48, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Reel<span style={{ fontStyle: 'italic', color: 'var(--terracotta)' }}>Studio</span>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--pencil)', textTransform: 'uppercase', marginTop: 12 }}>
            Two Hands · Est. 2026
          </div>
        </div>

        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--ink)', textAlign: 'center', marginBottom: 6 }}>
          Welcome back.
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--pencil)', textAlign: 'center', marginBottom: 32 }}>
          Sign in to the studio.
        </div>

        <label className="login-field">
          <span className="login-label">Username</span>
          <input
            className="login-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="shubhangam"
          />
        </label>

        <label className="login-field">
          <span className="login-label">Password</span>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--terracotta)', letterSpacing: '0.06em' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={busy || !username || !password} className="login-submit" style={{ marginTop: 22 }}>
          {busy ? 'opening…' : 'Sign in →'}
        </button>

        <div style={{ marginTop: 28, padding: 14, background: 'var(--surface)', borderRadius: 6, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--pencil)', letterSpacing: '0.06em', lineHeight: 1.7 }}>
          <div style={{ color: 'var(--ink)', marginBottom: 6, letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 9.5 }}>seed accounts</div>
          <div><b style={{ color: 'var(--ink)' }}>shubhangam</b> · changeme-shub</div>
          <div><b style={{ color: 'var(--ink)' }}>sanjeevani</b> · changeme-san</div>
          <div style={{ marginTop: 6, fontStyle: 'italic', fontFamily: 'var(--serif)' }}>change in Settings after first login.</div>
        </div>
      </form>
    </div>
  );
}
