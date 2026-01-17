import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at?: string;
  member_count?: number;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'pending' | 'active' | 'inactive';
  invited_at?: string;
  joined_at?: string;
  user?: {
    email: string;
  };
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  logo_url?: string | null;
  admin_email?: string;
  admin_password?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  logo_url?: string | null;
}

export const useSuperAdminOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Ne PAS inclure l'ID de l'organisation courante car en tant que superadmin,
      // on veut voir toutes les organisations, pas seulement celle où on est connecté
      const headers = await getApiHeaders(false);

      const response = await fetch(API_ENDPOINTS.organizations.list, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des organisations');
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setOrganizations(result.data);
      } else {
        setOrganizations([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des organisations');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrganization = useCallback(async (data: CreateOrganizationData): Promise<Organization | null> => {
    console.log('[useSuperAdminOrganizations] createOrganization appelé avec:', { ...data, admin_password: '***' });
    
    try {
      setError(null);
      console.log('[useSuperAdminOrganizations] Récupération des headers...');
      const headers = await getApiHeaders(false);
      console.log('[useSuperAdminOrganizations] Headers récupérés:', Object.keys(headers));
      
      // Vérifier qu'on a au moins un token d'authentification
      if (!headers.Authorization) {
        console.warn('[useSuperAdminOrganizations] Aucun token d\'authentification trouvé');
        throw new Error('Vous devez être connecté pour créer une organisation. Veuillez vous reconnecter.');
      }
      
      // Ajouter un timeout pour éviter les requêtes infinies
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('[useSuperAdminOrganizations] Timeout déclenché après 30 secondes');
        controller.abort();
      }, 30000); // 30 secondes timeout
      
      console.log('[useSuperAdminOrganizations] Envoi de la requête fetch...');
      console.log('[useSuperAdminOrganizations] URL:', API_ENDPOINTS.organizations.create);
      console.log('[useSuperAdminOrganizations] Body:', JSON.stringify(data));
      
      const response = await fetch(API_ENDPOINTS.organizations.create, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('[useSuperAdminOrganizations] Réponse reçue:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de l\'organisation';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Si le JSON ne peut pas être lu, utiliser le message d'erreur par défaut
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success && result.data) {
        toast.success('Organisation créée avec succès');
        await fetchOrganizations();
        return result.data;
      }
      throw new Error(result.message || 'Réponse invalide du serveur');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? (err.name === 'AbortError' 
          ? 'La requête a pris trop de temps. Veuillez réessayer.' 
          : err.message)
        : 'Erreur lors de la création';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Propager l'erreur pour que le modal puisse la gérer
    }
  }, [fetchOrganizations]);

  const updateOrganization = useCallback(async (
    id: string,
    data: UpdateOrganizationData
  ): Promise<Organization | null> => {
    try {
      setError(null);
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.organizations.update(id), {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();
      if (result.success && result.data) {
        toast.success('Organisation mise à jour avec succès');
        await fetchOrganizations();
        return result.data;
      }
      throw new Error('Réponse invalide du serveur');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [fetchOrganizations]);

  const deleteOrganization = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.organizations.delete(id), {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      toast.success('Organisation supprimée avec succès');
      await fetchOrganizations();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [fetchOrganizations]);

  const getOrganizationDetails = useCallback(async (id: string): Promise<Organization | null> => {
    try {
      setError(null);
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.organizations.byId(id), {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des détails');
      }

      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  const getOrganizationMembers = useCallback(async (id: string): Promise<OrganizationMember[]> => {
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.organizations.members(id), {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des membres');
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Erreur lors du chargement des membres:', err);
      return [];
    }
  }, []);

  return {
    organizations,
    loading,
    error,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationDetails,
    getOrganizationMembers,
  };
};
