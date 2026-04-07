import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';

// ─── Types ──────────────────────────────────────────────────────────

export type SimulationType =
  | 'AUTOMOBILE'
  | 'AUTOMOBILE_PACK'
  | 'VOYAGE'
  | 'MRH'
  | 'RAPATRIEMENT';

export interface SimulationResult {
  id_saisie: string;
  prime_nette: number;
  accessoire: number;
  fga: number;
  commission: number;
  taxe: number;
  prime_ttc: number;
}

export type ReferentielType =
  | 'packs'
  | 'branches'
  | 'categories'
  | 'sous_categories'
  | 'marques'
  | 'pays'
  | 'type_piece'
  | 'carrosseries';

export interface ProviderInfo {
  provider: string;
  configured: boolean;
}

type ReferentielItem = { code: string; libelle: string; [key: string]: unknown };

// ─── Hook ───────────────────────────────────────────────────────────

export function useInsuranceProvider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProviderInfo = useCallback(
    async (compagnieId: string): Promise<ProviderInfo | null> => {
      try {
        const result = await apiRequest<ProviderInfo>(
          API_ENDPOINTS.insuranceProvider.info(compagnieId),
        );
        return result.configured ? result : null;
      } catch {
        return null;
      }
    },
    [],
  );

  const simulate = useCallback(
    async (
      compagnieId: string,
      type: SimulationType,
      params: Record<string, unknown>,
    ): Promise<SimulationResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiRequest<SimulationResult>(
          API_ENDPOINTS.insuranceProvider.simulate,
          {
            method: 'POST',
            body: JSON.stringify({ compagnie_id: compagnieId, type, params }),
          },
        );
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur lors de la simulation';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchReferentiel = useCallback(
    async (
      compagnieId: string,
      type: ReferentielType,
      filters?: Record<string, string>,
    ): Promise<ReferentielItem[]> => {
      try {
        const queryParams = new URLSearchParams({ type, ...filters });
        const url = `${API_ENDPOINTS.insuranceProvider.referentiel(compagnieId)}?${queryParams}`;
        return await apiRequest<ReferentielItem[]>(url);
      } catch {
        return [];
      }
    },
    [],
  );

  return {
    loading,
    error,
    getProviderInfo,
    simulate,
    fetchReferentiel,
  };
}
