import { useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';
type MediaRow = any;

export type MediaPayload = {
  nom: string;
  type_fichier?: string | null;
  taille?: number | string | null;
  url: string;
  dossier_id?: string | null;
  contrat_id?: string | null;
  client_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
};

export const useMediaMutations = () => {
  const createMedia = useCallback(async (payload: MediaPayload): Promise<MediaRow> => {
    return apiRequest<MediaRow>(API_ENDPOINTS.media.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }, []);

  const updateMedia = useCallback(
    async (id: string, payload: Partial<MediaPayload>): Promise<MediaRow> => {
      return apiRequest<MediaRow>(API_ENDPOINTS.media.update(id), {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    [],
  );

  const trashMedia = useCallback(async (id: string): Promise<MediaRow> => {
    return apiRequest<MediaRow>(API_ENDPOINTS.media.trash(id), { method: 'PATCH' });
  }, []);

  const restoreMedia = useCallback(async (id: string): Promise<MediaRow> => {
    return apiRequest<MediaRow>(API_ENDPOINTS.media.restore(id), { method: 'PATCH' });
  }, []);

  const deleteMedia = useCallback(async (id: string): Promise<void> => {
    await apiRequest<unknown>(API_ENDPOINTS.media.delete(id), { method: 'DELETE' });
  }, []);

  return { createMedia, updateMedia, trashMedia, restoreMedia, deleteMedia };
};



