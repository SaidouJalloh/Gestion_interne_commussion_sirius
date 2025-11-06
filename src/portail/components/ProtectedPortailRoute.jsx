import { Navigate } from 'react-router-dom';
import { usePortailAuth } from '../context/PortailAuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedPortailRoute = ({ children }) => {
    const { isAuthenticated, loading } = usePortailAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/portail/login" replace />;
    }

    return children;
};

// ✅ CHANGEMENT : Export par défaut
export default ProtectedPortailRoute;