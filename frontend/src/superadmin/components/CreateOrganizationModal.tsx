import React, { useState } from 'react';
import { OrganizationForm } from './OrganizationForm';
import type { CreateOrganizationData, UpdateOrganizationData } from '../hooks/useSuperAdminOrganizations';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateOrganizationData) => Promise<void>;
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateOrganizationData | UpdateOrganizationData) => {
    console.log('[CreateOrganizationModal] handleSubmit appelé avec:', { ...data, admin_password: '***' });
    
    // Dans ce contexte, on sait que c'est toujours CreateOrganizationData car isEdit={false}
    // Vérification de type pour TypeScript
    if (!('slug' in data)) {
      console.error('[CreateOrganizationModal] Erreur: slug manquant');
      throw new Error('Les données doivent contenir un slug pour la création');
    }

    console.log('[CreateOrganizationModal] Définition de loading à true');
    setLoading(true);
    
    try {
      console.log('[CreateOrganizationModal] Appel de onCreate...');
      await onCreate(data as CreateOrganizationData);
      console.log('[CreateOrganizationModal] onCreate terminé avec succès, fermeture du modal');
      onClose();
    } catch (error) {
      console.error('[CreateOrganizationModal] Erreur lors de la création:', error);
      // L'erreur est déjà gérée par le hook useSuperAdminOrganizations (toast.error)
      // On ne ferme pas le modal pour permettre à l'utilisateur de corriger les erreurs
    } finally {
      console.log('[CreateOrganizationModal] Finally: définition de loading à false');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Créer une nouvelle organisation
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <OrganizationForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isEdit={false}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};
