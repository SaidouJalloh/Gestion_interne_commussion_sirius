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
    const [profileRefreshing, setProfileRefreshing] = useState(false);

    // Toujours appeler les hooks avant tout return
    useEffect(() => {
        const run = async () => {
            if (user && !profile && !triedRefreshRef.current) {
                console.log('🔄 RoleProtectedRoute: Tentative de rechargement du profil...');
                triedRefreshRef.current = true;
                setProfileRefreshing(true);

                try {
                    const result = await refresh();
                    if (!result) {
                        console.error('❌ RoleProtectedRoute: refreshProfile n\'a rien retourné');
                    }
                } catch (error) {
                    console.error('❌ RoleProtectedRoute: Erreur lors du refresh:', error);
                } finally {
                    // Timeout de sécurité pour éviter le blocage infini
                    setTimeout(() => {
                        setProfileRefreshing(false);
                    }, 100);
                }
            }
        };
        run();
    }, [user, profile, refresh]);

    // Afficher un loader pendant la vérification
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

    // Si pas connecté, rediriger vers login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Pendant le rafraîchissement du profil, afficher un loader court
    if (user && !profile && profileRefreshing) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    // Si pas de profil après chargement complet, afficher une erreur
    if (!profile && status !== 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Profil non trouvé</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Votre compte n'a pas de profil associé dans la base de données.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        User ID: <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{user?.id}</code>
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Actualiser la page
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Si le problème persiste, contactez l'administrateur.
                    </p>
                </div>
            </div>
        );
    }

    // Vérifier si l'utilisateur a le bon rôle
    if (profile && allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(profile.role)) {
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
                        Rôle actuel : <span className="font-semibold text-primary-600 dark:text-primary-400">{profile.role}</span>
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

    // Si tout est bon, afficher le contenu
    return children;
};

export default RoleProtectedRoute;