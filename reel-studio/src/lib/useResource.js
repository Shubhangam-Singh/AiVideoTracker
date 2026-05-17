import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

export function useResource(url, { auto = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);
  const urlRef = useRef(url);
  urlRef.current = url;

  const refetch = useCallback(async () => {
    if (!urlRef.current) return;
    setLoading(true); setError(null);
    try {
      const d = await api.get(urlRef.current);
      setData(d);
    } catch (e) { setError(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (auto && url) refetch(); /* eslint-disable-next-line */ }, [url, auto]);

  return { data, setData, loading, error, refetch };
}
