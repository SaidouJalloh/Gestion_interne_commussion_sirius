import { useCallback } from 'react';
import type { Tables } from '../types/supabase';
import { API_ENDPOINTS, DEFAULT_HEADERS } from '../config/api';

type CompagnieRow = Tables<'compagnies'>;

export type CompagnieMutationPayload = {
  nom: string;
  sigle: string;
  description?: string;
  logo_url?: string;
  lien_souscription?: string | null;
  actif: boolean;
};

type ApiSuccessWrapper<T> = {
  success?: boolean;
  data?: T;
};

const parseApiResponse = async <T>(response: Response): Promise<T> => {
  const raw = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      raw && typeof raw === 'object' && 'message' in raw
        ? String((raw as { message?: unknown }).message)
        : `Erreur HTTP ${response.status}`;
    throw new Error(message);
  }

  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as ApiSuccessWrapper<T>).data as T;
  }

  return raw as T;
};

export const useCompagniesMutations = () => {
  const createCompagnie = useCallback(
    async (payload: CompagnieMutationPayload): Promise<CompagnieRow> => {
      const response = await fetch(API_ENDPOINTS.compagnies.create, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload),
      });

      return parseApiResponse<CompagnieRow>(response);
    },
    [],
  );

  const updateCompagnie = useCallback(
    async (
      id: string,
      payload: Partial<CompagnieMutationPayload>,
    ): Promise<CompagnieRow> => {
      const response = await fetch(API_ENDPOINTS.compagnies.update(id), {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload),
      });

      return parseApiResponse<CompagnieRow>(response);
    },
    [],
  );

  const deleteCompagnie = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(API_ENDPOINTS.compagnies.delete(id), {
      method: 'DELETE',
      headers: DEFAULT_HEADERS,
    });

    // On parse pour attraper une éventuelle erreur structurée,
    // mais on ignore la valeur de retour.
    await parseApiResponse<unknown>(response);
  }, []);

  const updateCompagnieTaux = useCallback(
    async (id: string, tauxData: CompagnieRow['taux_commissions']) => {
      const response = await fetch(API_ENDPOINTS.compagnies.update(id), {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ taux_commissions: tauxData }),
      });

      return parseApiResponse<CompagnieRow>(response);
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


