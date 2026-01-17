import { useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';

export type UpdateClientPayload = {
  nom?: string;
  prenom?: string;
  type_client?: string;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  code_postal?: string | null;
  notes?: string | null;
};

export type CreateClientPayload = {
  nom: string;
  prenom: string;
  type_client: string;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  code_postal?: string | null;
  notes?: string | null;
  created_by?: string | null;
};

export const useClientsMutations = () => {
  const createClient = useCallback(async (payload: CreateClientPayload) => {
    return apiRequest<any>(API_ENDPOINTS.clients.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }, []);

  const updateClient = useCallback(async (id: string, payload: UpdateClientPayload) => {
    return apiRequest<any>(API_ENDPOINTS.clients.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    await apiRequest<unknown>(API_ENDPOINTS.clients.delete(id), { method: 'DELETE' });
  }, []);

  return { createClient, updateClient, deleteClient };
};

