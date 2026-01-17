import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  settings?: Record<string, unknown>;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at?: string | null;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  setCurrentOrganization: (org: Organization | null) => void;
  refreshOrganizations: () => Promise<Organization[]>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization doit être utilisé dans OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les organisations depuis l'API
  const refreshOrganizations = async (): Promise<Organization[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setOrganizations([]);
        setCurrentOrganizationState(null);
        setLoading(false);
        return [];
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/organizations`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const orgs = result.data as Organization[];
          setOrganizations(orgs);

          // Restaurer l'organisation sélectionnée depuis localStorage
          const savedOrgId = localStorage.getItem('currentOrganizationId');
          if (savedOrgId) {
            const savedOrg = orgs.find((org) => org.id === savedOrgId);
            if (savedOrg) {
              setCurrentOrganizationState(savedOrg);
            } else if (orgs.length > 0) {
              // Si l'organisation sauvegardée n'existe plus, utiliser la première
              setCurrentOrganizationState(orgs[0]);
              localStorage.setItem('currentOrganizationId', orgs[0].id);
            }
          } else if (orgs.length > 0) {
            // Aucune organisation sauvegardée, utiliser la première
            setCurrentOrganizationState(orgs[0]);
            localStorage.setItem('currentOrganizationId', orgs[0].id);
          }

          setLoading(false);
          return orgs;
        }
      }
      setLoading(false);
      return [];
    } catch (error) {
      console.error('Erreur lors du chargement des organisations:', error);
      setLoading(false);
      return [];
    }
  };

  // Charger les organisations au montage
  useEffect(() => {
    refreshOrganizations();
  }, []);

  // Écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await refreshOrganizations();
      } else if (event === 'SIGNED_OUT') {
        setOrganizations([]);
        setCurrentOrganizationState(null);
        localStorage.removeItem('currentOrganizationId');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setCurrentOrganization = (org: Organization | null) => {
    setCurrentOrganizationState(org);
    if (org) {
      localStorage.setItem('currentOrganizationId', org.id);
    } else {
      localStorage.removeItem('currentOrganizationId');
    }
  };

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    loading,
    setCurrentOrganization,
    refreshOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
