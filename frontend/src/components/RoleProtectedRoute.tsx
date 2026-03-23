import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useProfileContext } from '../context/ProfileContext';

type RoleProtectedRouteProps = {
    children: ReactNode;
    allowedRoles?: string[];
    redirectTo?: string;
};

export const RoleProtectedRoute = ({ children, allowedRoles, redirectTo = '/org/dashboard' }: RoleProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const { profile, status, refresh } = useProfileContext();
    const triedRefreshRef = useRef(false);
    const refreshRef = useRef(refresh);
    const [profileRefreshing, setProfileRefreshing] = useState(false);

    refreshRef.current = refresh;

    useEffect(() => {
        const run = async () => {
            if (user && !profile && !triedRefreshRef.current && status !== 'loaded') {
                triedRefreshRef.current = true;
                setProfileRefreshing(true);

                const safetyTimeout = setTimeout(() => {
                    setProfileRefreshing(false);
                }, 15000);

                try {
                    await refreshRef.current();
                } catch {
                    // Erreur geree dans le hook useProfile
                } finally {
                    clearTimeout(safetyTimeout);
                    setProfileRefreshing(false);
                }
            }
        };
        run();
    }, [user, profile, status]);

    // Loader pendant verification auth
    if (loading && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Vérification des permissions...</p>
                </div>
            </div>
        );
    }

    // Pas connecte -> login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Profil en cours de chargement
    if (user && !profile && (profileRefreshing || status === 'loading')) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    // Profil non trouve apres chargement
    if (!profile && status !== 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {status === 'error' ? 'Erreur de chargement' : 'Profil non trouvé'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {status === 'error'
                            ? 'Impossible de récupérer votre profil. Réessayez.'
                            : 'Votre compte n\'a pas de profil associé dans la base de données.'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        User ID: <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{user?.id}</code>
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                triedRefreshRef.current = false;
                                setProfileRefreshing(false);
                                refreshRef.current().catch(() => {});
                            }}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Réessayer
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Se déconnecter
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Mapping des rôles BDD -> Frontend attendus (owner -> admin, admin -> gestionnaire, member -> user)
    const getMappedOrgRole = (role?: string | null) => {
        if (role === 'owner') return 'admin';
        if (role === 'admin') return 'gestionnaire';
        if (role === 'member') return 'user';
        return role;
    };

    const effectiveRole = profile?.is_superadmin ? 'superadmin' : getMappedOrgRole(profile?.organization_role) || profile?.role;

    // Verifier le role
    if (profile && allowedRoles && Array.isArray(allowedRoles) && (!effectiveRole || !allowedRoles.includes(effectiveRole as string))) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
                    <svg className="w-20 h-20 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Accès refusé</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                        Rôle actuel : <span className="font-semibold text-primary-600 dark:text-primary-400">{effectiveRole || 'Aucun'}</span>
                    </p>
                    <button
                        onClick={() => window.location.href = redirectTo}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default RoleProtectedRoute;
