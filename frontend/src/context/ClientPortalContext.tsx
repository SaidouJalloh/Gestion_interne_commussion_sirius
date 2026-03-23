import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS, getApiHeaders } from '../config/api';

interface ClientProfile {
  id: string;
  organization_id: string;
  user_id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  type_client: string;
  adresse: string | null;
  ville: string | null;
  code_postal: string | null;
  organizations: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
}

interface ClientPortalContextType {
  clientProfile: ClientProfile | null;
  loading: boolean;
  error: string | null;
  isClient: boolean;
  fetched: boolean;
  refresh: () => Promise<void>;
}

const ClientPortalContext = createContext<ClientPortalContextType>({
  clientProfile: null,
  loading: false,
  error: null,
  isClient: false,
  fetched: false,
  refresh: async () => {},
});

export const useClientPortal = () => useContext(ClientPortalContext);

/**
 * ClientPortalProvider : ne fait PAS de fetch automatique au mount.
 * Le fetch est déclenché par ClientProtectedRoute (lazy loading)
 * pour éviter des appels 403 inutiles pour les admins.
 */
export const ClientPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const fetchingRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (!user || fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.clientPortal.me, { headers });
      const result = await response.json();

      if (result.success && result.data) {
        setClientProfile(result.data);
      } else {
        setClientProfile(null);
        setError(result.message || null);
      }
    } catch {
      setClientProfile(null);
    } finally {
      setLoading(false);
      setFetched(true);
      fetchingRef.current = false;
    }
  }, [user]);

  return (
    <ClientPortalContext.Provider
      value={{
        clientProfile,
        loading,
        error,
        isClient: !!clientProfile,
        fetched,
        refresh: fetchProfile,
      }}
    >
      {children}
    </ClientPortalContext.Provider>
  );
};
