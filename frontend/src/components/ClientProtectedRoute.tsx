import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useClientPortal } from '../context/ClientPortalContext';

interface ClientProtectedRouteProps {
  children: React.ReactNode;
}

export const ClientProtectedRoute: React.FC<ClientProtectedRouteProps> = ({ children }) => {
  const { isClient, loading, fetched, refresh } = useClientPortal();

  // Déclencher le fetch une seule fois quand on accède à une route /client/*
  useEffect(() => {
    if (!fetched && !loading) {
      refresh();
    }
  }, [fetched, loading, refresh]);

  if (!fetched || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement du portail client...</p>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
