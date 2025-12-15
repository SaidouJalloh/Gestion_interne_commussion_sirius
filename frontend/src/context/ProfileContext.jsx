import { createContext, useContext } from 'react';
import { useProfile } from '../hooks/useProfile';

/**
 * @typedef {{ role?: string | null, [key: string]: any }} Profile
 */
/**
 * @typedef {{
 *   profile: Profile | null,
 *   status: string,
 *   error: any,
 *   refresh: () => Promise<Profile | null>
 * }} ProfileContextValue
 */

/** @type {import('react').Context<ProfileContextValue | null>} */
const ProfileContext = createContext(null);

export const useProfileContext = () => {
  /** @type {ProfileContextValue | null} */
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfileContext doit être utilisé dans ProfileProvider');
  }
  return ctx;
};

export const ProfileProvider = ({ children }) => {
  /** @type {ProfileContextValue} */
  const value = useProfile();
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};


