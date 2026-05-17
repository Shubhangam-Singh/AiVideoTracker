export default function Login({ onLogin }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--paper)',
      padding: '24px 18px',
    }}>
      <div style={{ maxWidth: 380, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 48, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Reel<span style={{ fontStyle: 'italic', color: 'var(--terracotta)' }}>Studio</span>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--pencil)', textTransform: 'uppercase', marginTop: 12 }}>
            Two Hands · Est. 2026
          </div>
        </div>

        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--ink)', textAlign: 'center', marginBottom: 6 }}>
          Who's here?
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--pencil)', textAlign: 'center', marginBottom: 32 }}>
          Choose your identity — saved for this session.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { who: 's1', name: 'Shubhangam', role: 'Creator · Director' },
            { who: 's2', name: 'Sanjeevani', role: 'Editor · Producer' },
          ].map(({ who, name, role }) => (
            <button
              key={who}
              onClick={() => onLogin(who)}
              className="login-choice-btn"
            >
              <div className={`login-avatar avatar ${who}`}>S</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>{name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 5 }}>{role}</div>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--pencil)', lineHeight: 1 }}>›</div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button
            onClick={() => onLogin('guest')}
            style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.12em', borderBottom: '0.5px solid var(--hair-strong)', paddingBottom: 1 }}
          >
            Browse as guest →
          </button>
        </div>
      </div>
    </div>
  );
}
