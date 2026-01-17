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

export const RoleProtectedRoute = ({ children, allowedRoles, redirectTo = '/login' }: RoleProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const { profile, status, refresh } = useProfileContext();
    const triedRefreshRef = useRef(false);
    const refreshRef = useRef(refresh);
    const [profileRefreshing, setProfileRefreshing] = useState(false);

    // Mettre à jour la référence de refresh sans déclencher de re-render
    refreshRef.current = refresh;

    // Toujours appeler les hooks avant tout return
    useEffect(() => {
        const run = async () => {
            if (user && !profile && !triedRefreshRef.current && status === 'loading') {
                console.log('🔄 RoleProtectedRoute: Tentative de rechargement du profil...');
                triedRefreshRef.current = true;
                setProfileRefreshing(true);

                // Timeout de sécurité pour éviter le blocage infini (30 secondes pour connexions lentes)
                const safetyTimeout = setTimeout(() => {
                    console.warn('⚠️ RoleProtectedRoute: Timeout de sécurité atteint (30s), arrêt du chargement');
                    setProfileRefreshing(false);
                }, 30000);

                try {
                    console.log('🔄 RoleProtectedRoute: Appel de refresh()...');
                    const result = await refreshRef.current();
                    console.log('✅ RoleProtectedRoute: Résultat refresh:', result ? 'Succès' : 'Échec (null)');

                    if (!result) {
                        console.error('❌ RoleProtectedRoute: refreshProfile n\'a rien retourné');
                    }
                } catch (error) {
                    console.error('❌ RoleProtectedRoute: Erreur lors du refresh:', error);
                } finally {
                    clearTimeout(safetyTimeout);
                    // Arrêter immédiatement l'état "refreshing" (pas de délai artificiel)
                    setProfileRefreshing(false);
                }
            }
        };
        run();
    }, [user, profile, status]);

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

    // Pendant le rafraîchissement du profil, afficher un loader seulement si on est vraiment en "loading"
    if (user && !profile && profileRefreshing && status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    // Si pas de profil après chargement complet, afficher une erreur (différencier not_found vs error)
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
                            ? 'Impossible de récupérer la session (Supabase). Réessayez.'
                            : 'Votre compte n\'a pas de profil associé dans la base de données.'}
                    </p>
                    <button
                        onClick={() => {
                            triedRefreshRef.current = false;
                            setProfileRefreshing(false);
                            refreshRef.current().catch(() => { });
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Réessayer
                    </button>
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
                    <button
                        onClick={() => window.location.href = redirectTo}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    // Si tout est bon, afficher le contenu
    return children;
};

export default RoleProtectedRoute;
