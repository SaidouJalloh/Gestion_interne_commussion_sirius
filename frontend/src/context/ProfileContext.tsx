import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useRef } from 'react';
import { useProfile } from './hooks/useProfile';
import { useAuth } from './AuthContext';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  organization_role?: string | null;
  organization_id?: string | null;
};

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
  const { user, loading: authLoading } = useAuth();
  const profileData = useProfile(user?.id || null);
  const refreshRef = useRef(profileData.refresh);
  refreshRef.current = profileData.refresh;

  // Si AuthContext est encore en train de charger, on reste en loading
  const effectiveStatus = authLoading && !user
    ? 'loading' as const
    : profileData.status;

  const value: ProfileContextValue = useMemo(() => ({
    profile: profileData.profile,
    status: effectiveStatus,
    error: profileData.error,
    refresh: () => refreshRef.current(),
  }), [
    profileData.profile?.id,
    effectiveStatus,
    profileData.error,
  ]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
