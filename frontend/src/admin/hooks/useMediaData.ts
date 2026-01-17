import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';
import { useOrganization } from '../../context/OrganizationContext';
type MediaRow = any;

export type MediaQuery = {
  folderId?: string | null;
  trashed?: boolean;
};

export const useMediaData = (query: MediaQuery) => {
  const { currentOrganization } = useOrganization();
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (query.folderId) params.set('folderId', query.folderId);
    if (typeof query.trashed === 'boolean') params.set('trashed', String(query.trashed));
    const qs = params.toString();
    return qs ? `${API_ENDPOINTS.media.list}?${qs}` : API_ENDPOINTS.media.list;
  }, [query.folderId, query.trashed]);

  const fetchMedia = useCallback(async () => {
    if (!currentOrganization) {
      setMedia([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<MediaRow[]>(url);
      setMedia(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Erreur chargement medias (API backend):', e);
      toast.error('Erreur lors du chargement des fichiers');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [url, currentOrganization]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return { media, loading, refetch: fetchMedia };
};



