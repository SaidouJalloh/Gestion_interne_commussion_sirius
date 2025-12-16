import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useProfile } from '../hooks/useProfile';
import type { Database } from '../types/supabase';

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
  const value: ProfileContextValue = useProfile();
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};


