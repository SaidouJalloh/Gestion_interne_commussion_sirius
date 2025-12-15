import { useCallback } from 'react';
import type { Tables } from '../types/supabase';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../utils/apiClient';

type CompagnieRow = Tables<'compagnies'>;

export type CompagnieMutationPayload = {
  nom: string;
  sigle: string;
  description?: string;
  logo_url?: string;
  lien_souscription?: string | null;
  actif: boolean;
};

export const useCompagniesMutations = () => {
  const createCompagnie = useCallback(
    async (payload: CompagnieMutationPayload): Promise<CompagnieRow> => {
      return apiRequest<CompagnieRow>(API_ENDPOINTS.compagnies.create, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    [],
  );

  const updateCompagnie = useCallback(
    async (
      id: string,
      payload: Partial<CompagnieMutationPayload>,
    ): Promise<CompagnieRow> => {
      return apiRequest<CompagnieRow>(API_ENDPOINTS.compagnies.update(id), {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    [],
  );

  const deleteCompagnie = useCallback(async (id: string): Promise<void> => {
    await apiRequest<unknown>(API_ENDPOINTS.compagnies.delete(id), { method: 'DELETE' });
  }, []);

  const updateCompagnieTaux = useCallback(
    async (id: string, tauxData: CompagnieRow['taux_commissions']) => {
      return apiRequest<CompagnieRow>(API_ENDPOINTS.compagnies.update(id), {
        method: 'PUT',
        body: JSON.stringify({ taux_commissions: tauxData }),
      });
    },
    [],
  );

  return {
    createCompagnie,
    updateCompagnie,
    deleteCompagnie,
    updateCompagnieTaux,
  };
};


