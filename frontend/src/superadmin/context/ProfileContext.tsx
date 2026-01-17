import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useRef } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from './AuthContext';
import type { Database } from '../../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

type ProfileContextValue = {
  profile: Profile | null;
  status: 'loading' | 'loaded' | 'not_found' | 'error';
  error: unknown | null;
  refresh: () => Promise<Profile | null>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export const useProfileContext = () => {
  const ctx = useContext(ProfileContext);
  if (ctx === null) {
    throw new Error('useProfileContext doit être utilisé dans ProfileProvider');
  }
  return ctx;
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  // Récupérer le userId depuis AuthContext au lieu de rappeler getSession
  const { user, loading: authLoading } = useAuth();
  const profileData = useProfile(user?.id || null);
  const refreshRef = useRef(profileData.refresh);
  // Toujours mettre à jour la ref avec la dernière version de refresh
  refreshRef.current = profileData.refresh;
  
  // Si AuthContext est encore en train de charger, on reste en loading
  // pour éviter de passer trop rapidement à not_found
  const effectiveStatus = authLoading && !user 
    ? 'loading' as const
    : profileData.status;
  
  // Mémoriser la valeur du contexte pour éviter les re-renders inutiles
  // Ne pas inclure refresh dans les dépendances car il change à chaque remontage
  // Utiliser une fonction wrapper stable qui appelle toujours la dernière version via ref
  const value: ProfileContextValue = useMemo(() => ({
    profile: profileData.profile,
    status: effectiveStatus,
    error: profileData.error,
    refresh: () => refreshRef.current(),
  }), [
    profileData.profile?.id, // Utiliser l'ID plutôt que l'objet entier pour éviter les comparaisons d'objets
    effectiveStatus,
    profileData.error,
    // refresh n'est PAS dans les dépendances - on utilise une ref pour toujours avoir la dernière version
  ]);
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
