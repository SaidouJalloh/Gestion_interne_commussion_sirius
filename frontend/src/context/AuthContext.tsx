import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthResponse, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type SignInResult = { data: AuthResponse['data'] | null; error: unknown | null };
type SignUpResult = { data: AuthResponse['data'] | null; error: unknown | null };

export type AuthContextValue = {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<SignInResult>;
    signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<SignUpResult>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialiser l'utilisateur au chargement
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Récupérer la session actuelle
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                }
            } catch (error) {
                console.error('Erreur initialisation auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    setUser(session.user);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Connexion
    const signIn = async (email: string, password: string): Promise<SignInResult> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                setUser(data.user);
                // Forcer un rafraîchissement de session pour propager les nouveaux tokens immédiatement
                try {
                    await supabase.auth.refreshSession();
                } catch (e) {
                    console.warn('refreshSession a échoué (non bloquant):', e);
                }
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erreur connexion:', error);
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    // Inscription
    const signUp = async (
        email: string,
        password: string,
        metadata: Record<string, unknown> = {},
    ): Promise<SignUpResult> => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            console.error('Erreur inscription:', error);
            return { data: null, error };
        }
    };

    // Déconnexion
    const signOut = async (): Promise<void> => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
