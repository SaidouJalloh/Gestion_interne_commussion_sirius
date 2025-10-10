// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export const ProtectedRoute = ({ children, allowedRoles = [], requireDashboardAccess = false }) => {
//     const { user, profile, loading, hasRole, canAccessDashboard } = useAuth();

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//         );
//     }

//     if (!user) {
//         return <Navigate to="/login" replace />;
//     }

//     // Vérifier l'accès au dashboard
//     if (requireDashboardAccess && !canAccessDashboard()) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-100">
//                 <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
//                     <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
//                     <p className="text-gray-600">
//                         Vous n'avez pas les permissions nécessaires pour accéder au dashboard.
//                     </p>
//                     <Navigate to="/clients" replace />
//                 </div>
//             </div>
//         );
//     }

//     // Vérifier les rôles spécifiques
//     if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-100">
//                 <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
//                     <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
//                     <p className="text-gray-600">
//                         Vous n'avez pas les permissions nécessaires pour accéder à cette page.
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     return children;
// };


import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};