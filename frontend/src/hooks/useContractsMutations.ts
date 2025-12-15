import { useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../utils/apiClient';

export type ContractPayload = {
  client_id: string;
  compagnie_id: string;
  type_contrat: string;
  prime_nette: number | string;
  montant_accessoire?: number | string | null;
  taux_commission: number | string;
  commission: number | string;
  date_effet: string; // YYYY-MM-DD
  date_expiration: string; // YYYY-MM-DD
  statut?: string | null;
  fractionnement?: string | null;
  notes?: string | null;
  evacuation_sanitaire?: number | string | null;
  prime_regulation?: number | string | null;
  immatriculation?: string | null;
  prime_ttc?: number | string | null;
  fga?: number | string | null;
  taxes?: number | string | null;
  is_flotte?: boolean;
  prime_ttc_initial?: number | string | null;
};

export const useContractsMutations = () => {
  const createContract = useCallback(async (payload: ContractPayload) => {
    return apiRequest<any>(API_ENDPOINTS.contracts.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }, []);

  const updateContract = useCallback(async (id: string, payload: Partial<ContractPayload>) => {
    return apiRequest<any>(API_ENDPOINTS.contracts.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }, []);

  const deleteContract = useCallback(async (id: string) => {
    await apiRequest<unknown>(API_ENDPOINTS.contracts.delete(id), { method: 'DELETE' });
  }, []);

  return { createContract, updateContract, deleteContract };
};

