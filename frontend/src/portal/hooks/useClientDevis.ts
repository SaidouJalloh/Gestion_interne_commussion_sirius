import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';

export const useClientDevis = () => {
  const [devis, setDevis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevis = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.clientPortal.devis, { headers });
      const result = await response.json();
      if (result.success) setDevis(result.data);
      else setError(result.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitDevis = useCallback(async (data: { type_assurance: string; details: Record<string, unknown> }) => {
    const headers = await getApiHeaders(false);
    const response = await fetch(API_ENDPOINTS.clientPortal.createDevis, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    await fetchDevis();
    return result.data;
  }, [fetchDevis]);

  useEffect(() => { fetchDevis(); }, [fetchDevis]);

  return { devis, loading, error, refresh: fetchDevis, submitDevis };
};
