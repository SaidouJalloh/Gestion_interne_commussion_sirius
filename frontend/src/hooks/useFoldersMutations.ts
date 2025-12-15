import { useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../utils/apiClient';
type FolderRow = any;

export type FolderPayload = {
  nom: string;
  couleur?: string | null;
  parent_id?: string | null;
  contrat_id?: string | null;
  client_id?: string | null;
};

export const useFoldersMutations = () => {
  const createFolder = useCallback(async (payload: FolderPayload): Promise<FolderRow> => {
    return apiRequest<FolderRow>(API_ENDPOINTS.folders.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }, []);

  const updateFolder = useCallback(
    async (id: string, payload: Partial<FolderPayload>): Promise<FolderRow> => {
      return apiRequest<FolderRow>(API_ENDPOINTS.folders.update(id), {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    [],
  );

  const deleteFolder = useCallback(async (id: string): Promise<void> => {
    await apiRequest<unknown>(API_ENDPOINTS.folders.delete(id), { method: 'DELETE' });
  }, []);

  return { createFolder, updateFolder, deleteFolder };
};



