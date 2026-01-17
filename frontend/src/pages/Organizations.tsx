import React, { useState, useEffect } from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { API_ENDPOINTS, getApiHeaders } from '../config/api';
import toast from 'react-hot-toast';

interface OrganizationMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'pending' | 'active' | 'inactive';
  invited_at?: string;
  joined_at?: string;
  user?: {
    email: string;
  };
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  settings?: Record<string, unknown>;
  created_at?: string;
  members?: OrganizationMember[];
}

const Organizations: React.FC = () => {
  const { organizations, refreshOrganizations, currentOrganization, setCurrentOrganization } = useOrganization();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    refreshOrganizations();
  }, []);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.organizations.create, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Organisation créée avec succès');
        setShowCreateModal(false);
        setFormData({ name: '', slug: '' });
        await refreshOrganizations();
      } else {
        toast.error(result.message || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création de l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrganization = async (orgId: string) => {
    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.organizations.byId(orgId), {
        headers,
      });

      const result = await response.json();
      if (result.success) {
        setSelectedOrg(result.data);
        await loadMembers(orgId);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (orgId: string) => {
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.organizations.members(orgId), {
        headers,
      });

      const result = await response.json();
      if (result.success) {
        setMembers(result.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.organizations.inviteMember(selectedOrg.id), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: inviteEmail,
          role: 'member',
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Invitation envoyée');
        setShowInviteModal(false);
        setInviteEmail('');
        await loadMembers(selectedOrg.id);
      } else {
        toast.error(result.message || 'Erreur lors de l\'invitation');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!selectedOrg) return;

    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(
        API_ENDPOINTS.organizations.updateMemberRole(selectedOrg.id, memberId),
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ role: newRole }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Rôle mis à jour');
        await loadMembers(selectedOrg.id);
      } else {
        toast.error(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du rôle');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrg) return;
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;

    setLoading(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(
        API_ENDPOINTS.organizations.removeMember(selectedOrg.id, memberId),
        {
          method: 'DELETE',
          headers,
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Membre retiré');
        await loadMembers(selectedOrg.id);
      } else {
        toast.error(result.message || 'Erreur lors du retrait');
      }
    } catch (error) {
      toast.error('Erreur lors du retrait du membre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organisations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Créer une organisation
        </button>
      </div>

      {/* Liste des organisations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.map((org) => (
          <div
            key={org.id}
            onClick={() => handleSelectOrganization(org.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedOrg?.id === org.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600'
              }`}
          >
            <div className="flex items-center gap-3">
              {org.logo_url ? (
                <img src={org.logo_url} alt={org.name} className="w-12 h-12 rounded object-cover" />
              ) : (
                <div className="w-12 h-12 rounded bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                  {org.name[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{org.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{org.slug}</p>
                {org.role && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                    {org.role}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Détails de l'organisation sélectionnée */}
      {selectedOrg && (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedOrg.name}
            </h2>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Inviter un membre
            </button>
          </div>

          {/* Liste des membres */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Membres</h3>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {member.role} • {member.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      disabled={member.role === 'owner'}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Créer une organisation
            </h2>
            <form onSubmit={handleCreateOrganization}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="auto-généré si vide"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Inviter un membre
            </h2>
            <form onSubmit={handleInviteMember}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : 'Inviter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizations;
