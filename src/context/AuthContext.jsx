// import { createContext, useContext, useEffect, useState } from 'react';
// import { supabase, getUserProfile } from '../lib/supabaseClient';

// const AuthContext = createContext({});

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuth must be used within AuthProvider');
//     }
//     return context;
// };

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [profile, setProfile] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         // Vérifier la session active au chargement
//         checkUser();

//         // Écouter les changements d'authentification
//         const { data: authListener } = supabase.auth.onAuthStateChange(
//             async (event, session) => {
//                 if (session?.user) {
//                     const userProfile = await getUserProfile();
//                     setUser(session.user);
//                     setProfile(userProfile);
//                 } else {
//                     setUser(null);
//                     setProfile(null);
//                 }
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
//             if (user) {
//                 const userProfile = await getUserProfile();
//                 setUser(user);
//                 setProfile(userProfile);
//             }
//         } catch (error) {
//             console.error('Error checking user:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Connexion
//     const signIn = async (email, password) => {
//         try {
//             const { data, error } = await supabase.auth.signInWithPassword({
//                 email,
//                 password,
//             });

//             if (error) throw error;

//             const userProfile = await getUserProfile();
//             setUser(data.user);
//             setProfile(userProfile);

//             return { data: userProfile, error: null };
//         } catch (error) {
//             console.error('Error signing in:', error);
//             return { data: null, error };
//         }
//     };

//     // Inscription (réservée aux superadmins)
//     const signUp = async (email, password, fullName, role = 'gestionnaire') => {
//         try {
//             const { data, error } = await supabase.auth.signUp({
//                 email,
//                 password,
//                 options: {
//                     data: {
//                         full_name: fullName,
//                         role: role,
//                     },
//                 },
//             });

//             if (error) throw error;

//             return { data, error: null };
//         } catch (error) {
//             console.error('Error signing up:', error);
//             return { data: null, error };
//         }
//     };

//     // Déconnexion
//     const signOut = async () => {
//         try {
//             const { error } = await supabase.auth.signOut();
//             if (error) throw error;

//             setUser(null);
//             setProfile(null);
//         } catch (error) {
//             console.error('Error signing out:', error);
//         }
//     };

//     // Vérifier si l'utilisateur a un rôle spécifique
//     const hasRole = (allowedRoles = []) => {
//         if (!profile) return false;
//         return allowedRoles.includes(profile.role);
//     };

//     // Vérifier si l'utilisateur peut accéder au dashboard
//     const canAccessDashboard = () => {
//         return hasRole(['superadmin', 'admin']);
//     };

//     const value = {
//         user,
//         profile,
//         loading,
//         signIn,
//         signUp,
//         signOut,
//         hasRole,
//         canAccessDashboard,
//     };

//     return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };



import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } catch (error) {
            console.error('Error checking user:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            setUser(data.user);
            return { data: data.user, error: null };
        } catch (error) {
            console.error('Error signing in:', error);
            return { data: null, error };
        }
    };

    const signUp = async (email, password, fullName) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error signing up:', error);
            return { data: null, error };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};