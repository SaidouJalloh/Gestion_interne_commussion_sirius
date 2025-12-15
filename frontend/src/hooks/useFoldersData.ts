import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../utils/apiClient';
type FolderRow = any;

export type FoldersQuery = {
  parentId?: string | null;
};

export const useFoldersData = (query: FoldersQuery) => {
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (query.parentId) params.set('parentId', query.parentId);
    const qs = params.toString();
    return qs ? `${API_ENDPOINTS.folders.list}?${qs}` : API_ENDPOINTS.folders.list;
  }, [query.parentId]);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest<FolderRow[]>(url);
      setFolders(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Erreur chargement dossiers (API backend):', e);
      toast.error('Erreur lors du chargement des dossiers');
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return { folders, loading, refetch: fetchFolders };
};



