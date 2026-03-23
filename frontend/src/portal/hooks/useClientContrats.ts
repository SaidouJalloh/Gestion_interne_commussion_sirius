import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';

export const useClientContrats = () => {
  const [contrats, setContrats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.clientPortal.contrats, { headers });
      const result = await response.json();
      if (result.success) setContrats(result.data);
      else setError(result.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { contrats, loading, error, refresh: fetch_ };
};
