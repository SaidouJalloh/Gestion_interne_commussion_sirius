import React, { useEffect, useState } from 'react';
import type { Organization, OrganizationMember } from '../hooks/useSuperAdminOrganizations';

interface OrganizationDetailsProps {
  organization: Organization;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getMembers: (id: string) => Promise<OrganizationMember[]>;
}

export const OrganizationDetails: React.FC<OrganizationDetailsProps> = ({
  organization,
  onClose,
  onEdit,
  onDelete,
  getMembers,
}) => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      setLoadingMembers(true);
      try {
        const orgMembers = await getMembers(organization.id);
        setMembers(orgMembers);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [organization.id, getMembers]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {organization.logo_url ? (
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
              {organization.name[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {organization.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{organization.slug}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Informations générales
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ID:</span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-mono">
                {organization.id}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Créée le:
              </span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(organization.created_at)}
              </span>
            </div>
            {organization.updated_at && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modifiée le:
                </span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(organization.updated_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Statistiques
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de membres:
              </span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {members.length}
              </span>
            </div>
            {organization.role && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Votre rôle:
                </span>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                    organization.role,
                  )}`}
                >
                  {organization.role}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Membres */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Membres ({members.length})
        </h3>
        {loadingMembers ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Chargement des membres...
            </p>
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            Aucun membre dans cette organisation
          </p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                    {member.user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.user?.email || 'Utilisateur'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(
                          member.role,
                        )}`}
                      >
                        {member.role}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeColor(
                          member.status,
                        )}`}
                      >
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {member.joined_at
                    ? `Rejoint le ${formatDate(member.joined_at)}`
                    : member.invited_at
                      ? `Invité le ${formatDate(member.invited_at)}`
                      : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Fermer
        </button>
        <button
          onClick={() => onEdit(organization.id)}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(organization.id)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};
