import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '48px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 320,
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--terracotta)', marginBottom: 12 }}>
            Something went wrong.
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--pencil)', letterSpacing: '0.08em', marginBottom: 24 }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--ink)',
              border: '0.5px solid var(--hair-strong)', padding: '8px 20px', borderRadius: 4,
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
