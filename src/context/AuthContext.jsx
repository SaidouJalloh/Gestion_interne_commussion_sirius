


// // code qui marche bien
// import { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '../lib/supabaseClient';

// const AuthContext = createContext({});

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         checkUser();

//         const { data: authListener } = supabase.auth.onAuthStateChange(
//             async (event, session) => {
//                 setUser(session?.user ?? null);
//                 setLoading(false);
//             }
//         );

//         return () => {
//             authListener.subscription.unsubscribe();
//         };
//     }, []);

//     const checkUser = async () => {
//         try {
//             const { data: { user } } = await supabase.auth.getUser();
//             setUser(user);
//         } catch (error) {
//             console.error('Error checking user:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const signIn = async (email, password) => {
//         try {
//             const { data, error } = await supabase.auth.signInWithPassword({
//                 email,
//                 password,
//             });

//             if (error) throw error;

//             setUser(data.user);
//             return { data: data.user, error: null };
//         } catch (error) {
//             console.error('Error signing in:', error);
//             return { data: null, error };
//         }
//     };

//     const signUp = async (email, password, fullName) => {
//         try {
//             const { data, error } = await supabase.auth.signUp({
//                 email,
//                 password,
//                 options: {
//                     data: { full_name: fullName }
//                 }
//             });

//             if (error) throw error;
//             return { data, error: null };
//         } catch (error) {
//             console.error('Error signing up:', error);
//             return { data: null, error };
//         }
//     };

//     const signOut = async () => {
//         try {
//             const { error } = await supabase.auth.signOut();
//             if (error) throw error;
//             setUser(null);
//         } catch (error) {
//             console.error('Error signing out:', error);
//         }
//     };

//     const value = {
//         user,
//         loading,
//         signIn,
//         signUp,
//         signOut,
//     };

//     return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };








// n1

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
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
            async (event, session) => {
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
    const signIn = async (email, password) => {
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
    const signUp = async (email, password, metadata = {}) => {
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
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            // Rien dans le localStorage n'est utilisé pour les rôles; le ProfileProvider écoute SIGNED_OUT et nettoiera le profil
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