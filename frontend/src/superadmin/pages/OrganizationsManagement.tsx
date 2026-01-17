import React, { useEffect, useState, useMemo } from 'react';
import { useSuperAdminOrganizations, type Organization } from '../hooks/useSuperAdminOrganizations';
import { OrganizationsList } from '../components/OrganizationsList';
import { OrganizationDetails } from '../components/OrganizationDetails';
import { CreateOrganizationModal } from '../components/CreateOrganizationModal';
import { OrganizationForm } from '../components/OrganizationForm';
import { CardSkeleton } from '../../admin/components/LoadingStates';
import toast from 'react-hot-toast';

export default function OrganizationsManagement() {
  const {
    organizations,
    loading,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationDetails,
    getOrganizationMembers,
  } = useSuperAdminOrganizations();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Compteurs de membres directement depuis l'objet organization
  // Plus besoin de charger séparément
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleCreate = async (data: Parameters<typeof createOrganization>[0]) => {
    const result = await createOrganization(data);
    if (result) {
      setShowCreateModal(false);
    }
  };

  const handleView = async (id: string) => {
    const org = await getOrganizationDetails(id);
    if (org) {
      setSelectedOrg(org);
      setSelectedOrgId(id);
    }
  };

  const handleEdit = async (id: string) => {
    const org = await getOrganizationDetails(id);
    if (org) {
      setEditingOrg(org);
      setEditingOrgId(id);
    }
  };

  const handleUpdate = async (data: Parameters<typeof updateOrganization>[1]) => {
    if (!editingOrgId) return;
    const result = await updateOrganization(editingOrgId, data);
    if (result) {
      setEditingOrg(null);
      setEditingOrgId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette organisation ? Cette action est irréversible.')) {
      return;
    }

    const success = await deleteOrganization(id);
    if (success) {
      if (selectedOrgId === id) {
        setSelectedOrg(null);
        setSelectedOrgId(null);
      }
      if (editingOrgId === id) {
        setEditingOrg(null);
        setEditingOrgId(null);
      }
    }
  };

  const stats = useMemo(() => {
    const totalMembers = organizations.reduce((sum, org) => sum + (org.member_count || 0), 0);
    return {
      total: organizations.length,
      totalMembers,
      averageMembers: organizations.length > 0 ? Math.round(totalMembers / organizations.length) : 0,
    };
  }, [organizations]);

  if (loading && organizations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Organisations
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Organisations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Créez et gérez toutes les organisations du système
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Créer une organisation
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total d'organisations
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de membres
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalMembers}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Membres par organisation
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.averageMembers}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des organisations */}
      {selectedOrg ? (
        <OrganizationDetails
          organization={selectedOrg}
          onClose={() => {
            setSelectedOrg(null);
            setSelectedOrgId(null);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getMembers={getOrganizationMembers}
        />
      ) : editingOrg ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Modifier l'organisation
            </h2>
            <button
              onClick={() => {
                setEditingOrg(null);
                setEditingOrgId(null);
              }}
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
          <OrganizationForm
            initialData={{
              name: editingOrg.name,
              slug: editingOrg.slug,
              logo_url: editingOrg.logo_url,
            }}
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditingOrg(null);
              setEditingOrgId(null);
            }}
            isEdit={true}
            loading={false}
          />
        </div>
      ) : (
        <OrganizationsList
          organizations={organizations}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal de création */}
      <CreateOrganizationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
