import { createContext, useContext } from 'react';
import { useProfile } from '../hooks/useProfile';

const ProfileContext = createContext(null);

export const useProfileContext = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfileContext doit être utilisé dans ProfileProvider');
  }
  return ctx;
};

export const ProfileProvider = ({ children }) => {
  const value = useProfile();
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};


