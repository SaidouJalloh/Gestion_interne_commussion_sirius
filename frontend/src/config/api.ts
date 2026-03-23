import { supabase } from '../lib/supabaseClient';

/**
 * Configuration centralisÃ©e des endpoints API
 */

/**
 * URL de base de l'API backend
 * Utilise la variable d'environnement REACT_APP_API_URL si disponible,
 * sinon utilise l'URL par dÃ©faut en dÃ©veloppement
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.length > 0
    ? process.env.REACT_APP_API_URL
    : 'http://localhost:4000';

/**
 * Endpoints API disponibles
 */
export const API_ENDPOINTS = {
  // Compagnies
  compagnies: {
    list: `${API_BASE_URL}/api/compagnies`,
    byId: (id: string) => `${API_BASE_URL}/api/compagnies/${id}`,
    create: `${API_BASE_URL}/api/compagnies`,
    update: (id: string) => `${API_BASE_URL}/api/compagnies/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/compagnies/${id}`,
  },

  // Contrats
  contracts: {
    list: `${API_BASE_URL}/api/contracts`,
    byId: (id: string) => `${API_BASE_URL}/api/contracts/${id}`,
    create: `${API_BASE_URL}/api/contracts`,
    update: (id: string) => `${API_BASE_URL}/api/contracts/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/contracts/${id}`,
  },

  // Clients
  clients: {
    list: `${API_BASE_URL}/api/clients`,
    byId: (id: string) => `${API_BASE_URL}/api/clients/${id}`,
    create: `${API_BASE_URL}/api/clients`,
    update: (id: string) => `${API_BASE_URL}/api/clients/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/clients/${id}`,
  },

  // Dashboard
  dashboard: {
    get: `${API_BASE_URL}/api/dashboard`,
  },

  // Payments
  payments: {
    list: `${API_BASE_URL}/api/payments`,
    byId: (id: string) => `${API_BASE_URL}/api/payments/${id}`,
    create: `${API_BASE_URL}/api/payments`,
    update: (id: string) => `${API_BASE_URL}/api/payments/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/payments/${id}`,
  },

  // Folders (Medias)
  folders: {
    list: `${API_BASE_URL}/api/folders`,
    byId: (id: string) => `${API_BASE_URL}/api/folders/${id}`,
    create: `${API_BASE_URL}/api/folders`,
    update: (id: string) => `${API_BASE_URL}/api/folders/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/folders/${id}`,
  },

  // Media (Medias)
  media: {
    list: `${API_BASE_URL}/api/media`,
    byId: (id: string) => `${API_BASE_URL}/api/media/${id}`,
    create: `${API_BASE_URL}/api/media`,
    update: (id: string) => `${API_BASE_URL}/api/media/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/media/${id}`,
    trash: (id: string) => `${API_BASE_URL}/api/media/${id}/trash`,
    restore: (id: string) => `${API_BASE_URL}/api/media/${id}/restore`,
  },

  // Vehicules (Flottes)
  vehicules: {
    list: `${API_BASE_URL}/api/vehicules`,
    byId: (id: string) => `${API_BASE_URL}/api/vehicules/${id}`,
    create: `${API_BASE_URL}/api/vehicules`,
    update: (id: string) => `${API_BASE_URL}/api/vehicules/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/vehicules/${id}`,
  },

  // Incorporations
  incorporations: {
    list: `${API_BASE_URL}/api/incorporations`,
    byId: (id: string) => `${API_BASE_URL}/api/incorporations/${id}`,
    create: `${API_BASE_URL}/api/incorporations`,
  },

  // Notifications
  notifications: {
    list: `${API_BASE_URL}/api/notifications`,
    byId: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
  },

  // Recherche globale
  search: {
    get: `${API_BASE_URL}/api/search`,
  },

  // Organisations (multi-tenant)
  organizations: {
    list: `${API_BASE_URL}/api/organizations`,
    byId: (id: string) => `${API_BASE_URL}/api/organizations/${id}`,
    create: `${API_BASE_URL}/api/organizations`,
    update: (id: string) => `${API_BASE_URL}/api/organizations/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/organizations/${id}`,
    members: (id: string) => `${API_BASE_URL}/api/organizations/${id}/members`,
    inviteMember: (id: string) => `${API_BASE_URL}/api/organizations/${id}/members`,
    updateMemberRole: (id: string, memberId: string) =>
      `${API_BASE_URL}/api/organizations/${id}/members/${memberId}/role`,
    removeMember: (id: string, memberId: string) =>
      `${API_BASE_URL}/api/organizations/${id}/members/${memberId}`,
    acceptInvitation: (id: string) =>
      `${API_BASE_URL}/api/organizations/${id}/accept-invitation`,
  },

  // Utilisateurs
  users: {
    list: `${API_BASE_URL}/api/users`,
    byId: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    create: `${API_BASE_URL}/api/users`,
    update: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/users/${id}`, // Uses deactivate endpoint
  },
} as const;

/**
 * Configuration des en-tÃªtes par dÃ©faut pour les requÃªtes API
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

/**
 * Timeout par dÃ©faut pour les requÃªtes API (en millisecondes)
 */
export const API_TIMEOUT = 30000;

/**
 * Fonction helper pour créer les headers avec authentification et organisation
 */
export const getApiHeaders = async (
  includeOrganization = true,
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS };

  // Récupérer le token d'authentification - essayer d'abord depuis le storage (plus rapide)
  // pour éviter que getSession() bloque indéfiniment
  let token: string | null = null;
  
  try {
    // Essayer d'abord depuis le storage directement (évite le blocage de getSession)
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    if (supabaseUrl) {
      // Supabase stocke la session avec une clé basée sur l'URL du projet
      // Format: sb-{project_ref}-auth-token
      const urlParts = supabaseUrl.replace(/https?:\/\//, '').split('.');
      const projectRef = urlParts[0];
      const storageKey = `sb-${projectRef}-auth-token`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          token = parsed?.access_token || null;
          if (token) {
            console.log('[getApiHeaders] Token récupéré depuis le storage');
          }
        } catch (e) {
          console.warn('[getApiHeaders] Erreur parsing storage:', e);
        }
      }
    }
  } catch (error) {
    console.warn('[getApiHeaders] Erreur lors de la récupération depuis storage:', error);
  }

  // Si pas de token dans le storage, essayer getSession() avec timeout court
  if (!token) {
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 2000)
      );
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
      token = session?.access_token || null;
    } catch (error) {
      console.warn('[getApiHeaders] getSession() a échoué ou timeout:', error);
    }
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('[getApiHeaders] Aucun token d\'authentification trouvé');
  }

  // Ajouter l'organization_id si disponible
  if (includeOrganization) {
    const orgId = localStorage.getItem('currentOrganizationId');
    if (orgId) {
      headers['X-Organization-Id'] = orgId;
    }
  }

  return headers;
};
