import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';

export const useClientSinistres = () => {
  const [sinistres, setSinistres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.clientPortal.sinistres, { headers });
      const result = await response.json();
      if (result.success) setSinistres(result.data);
      else setError(result.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { sinistres, loading, error, refresh: fetch_ };
};
