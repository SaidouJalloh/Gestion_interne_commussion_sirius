import React, { useState, useRef, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { useNavigate } from 'react-router-dom';

export const OrganizationSelector: React.FC = () => {
  const { currentOrganization, organizations, setCurrentOrganization, loading } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectOrganization = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      setIsOpen(false);
      // Recharger la page pour mettre à jour les données avec la nouvelle organisation
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
        <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  if (!currentOrganization && organizations.length === 0) {
    return (
      <button
        onClick={() => navigate('/org/organizations')}
        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        Créer une organisation
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {currentOrganization?.logo_url ? (
          <img
            src={currentOrganization.logo_url}
            alt={currentOrganization.name}
            className="w-6 h-6 rounded object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
            {currentOrganization?.name?.[0]?.toUpperCase() || 'O'}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
          {currentOrganization?.name || 'Sélectionner'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {organizations.length > 0 ? (
            <>
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                  Organisations
                </p>
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSelectOrganization(org.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    currentOrganization?.id === org.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  {org.logo_url ? (
                    <img
                      src={org.logo_url}
                      alt={org.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {org.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {org.name}
                    </p>
                    {org.role && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {org.role}
                      </p>
                    )}
                  </div>
                  {currentOrganization?.id === org.id && (
                    <svg
                      className="w-5 h-5 text-primary-600 dark:text-primary-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/organizations');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Gérer les organisations
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Aucune organisation
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/organizations');
                }}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Créer une organisation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
