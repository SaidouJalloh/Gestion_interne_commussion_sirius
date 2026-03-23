import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';

interface DashboardStats {
  contrats_actifs: number;
  total_contrats: number;
  sinistres_en_cours: number;
  total_sinistres: number;
  devis_en_attente: number;
  prochain_renouvellement: { date_expiration: string; type_contrat: string } | null;
}

interface DashboardData {
  stats: DashboardStats;
  derniers_contrats: any[];
  derniers_sinistres: any[];
}

export const useClientDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.clientPortal.dashboard, { headers });
      const result = await response.json();
      if (result.success) setData(result.data);
      else setError(result.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refresh: fetch_ };
};
