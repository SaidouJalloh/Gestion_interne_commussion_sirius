


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
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Récupérer le profil utilisateur avec son rôle
    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Erreur récupération profil:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('fetchUserProfile error:', error);
            return null;
        }
    };

    // Initialiser l'utilisateur au chargement
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Récupérer la session actuelle
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    const userProfile = await fetchUserProfile(session.user.id);
                    setProfile(userProfile);
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
                    const userProfile = await fetchUserProfile(session.user.id);
                    setProfile(userProfile);
                } else {
                    setUser(null);
                    setProfile(null);
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
                const userProfile = await fetchUserProfile(data.user.id);
                setProfile(userProfile);
            }

            return { data, error: null };
        } catch (error) {
            console.error('Erreur connexion:', error);
            return { data: null, error };
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
            setProfile(null);
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    };

    // Fonctions de vérification des rôles
    const hasRole = (roles) => {
        if (!profile) return false;
        return Array.isArray(roles)
            ? roles.includes(profile.role)
            : profile.role === roles;
    };

    const canAccessDashboard = () => hasRole(['admin', 'superadmin']);
    const canAccessCompagnies = () => hasRole(['admin', 'superadmin']);
    const canAccessClients = () => hasRole(['gestionnaire', 'admin', 'superadmin']);
    const canAccessContrats = () => hasRole(['gestionnaire', 'admin', 'superadmin']);
    const canAccessMedias = () => hasRole(['gestionnaire', 'admin', 'superadmin']);
    const canManageUsers = () => hasRole('superadmin');
    const isAdmin = () => hasRole(['admin', 'superadmin']);
    const isSuperAdmin = () => hasRole('superadmin');

    const value = {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
        canAccessDashboard,
        canAccessCompagnies,
        canAccessClients,
        canAccessContrats,
        canAccessMedias,
        canManageUsers,
        isAdmin,
        isSuperAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};