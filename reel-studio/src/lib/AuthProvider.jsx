import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';
import { socket } from './socket.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const u = await api.get('/api/auth/me');
      setUser(u);
    } catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // When any API call receives 401, force re-check (session expired)
  useEffect(() => {
    const onUnauth = () => setUser(null);
    window.addEventListener('reel:unauthorized', onUnauth);
    return () => window.removeEventListener('reel:unauthorized', onUnauth);
  }, []);

  useEffect(() => {
    if (user) socket.start();
    else socket.stop();
  }, [user]);

  const login = async (username, password) => {
    setError(null);
    try {
      const u = await api.post('/api/auth/login', { username, password });
      setUser(u);
      return u;
    } catch (e) {
      setError(e.message || 'login failed');
      throw e;
    }
  };

  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refresh, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
