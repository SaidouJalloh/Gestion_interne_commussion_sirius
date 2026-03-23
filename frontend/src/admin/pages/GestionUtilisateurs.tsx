import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, Shield, UserX, CheckCircle, XCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useProfileContext } from '../../context/ProfileContext';
import { useOrganization } from '../../context/OrganizationContext';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';

export default function GestionUtilisateurs() {
    const location = useLocation();
    const { currentOrganization } = useOrganization();
    const isSuperAdminMode = location.pathname.startsWith('/superadmin');
    type UserProfile = {
        id: string;
        email?: string | null;
        nom?: string | null;
        prenom?: string | null;
        role?: string | null;
        telephone?: string | null;
        actif?: boolean | null;
        created_at?: string | null;
        [key: string]: unknown;
    };

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        role: 'user',
        telephone: '',
        actif: true
    });
    const { profile } = useProfileContext();

    const getErrorMessage = (err: unknown) =>
        err instanceof Error ? err.message : String((err as { message?: unknown } | null)?.message ?? err);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            if (isSuperAdminMode) {
                // Mode superadmin : Afficher les superadmins via l'API backend
                const superAdmins = await apiRequest<UserProfile[]>(
                    `${API_ENDPOINTS.users.list}?isSuperAdminMode=true`
                );
                
                setUsers(superAdmins || []);
            } else {
                // Mode admin : Afficher les utilisateurs de l'organisation actuelle
                if (!currentOrganization?.id) {
                    setUsers([]);
                    setLoading(false);
                    return;
                }

                // Récupérer les utilisateurs via l'API backend
                const orgUsers = await apiRequest<UserProfile[]>(
                    API_ENDPOINTS.users.list
                );

                setUsers(orgUsers || []);
            }
        } catch (error) {
            console.error('Erreur récupération utilisateurs:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [isSuperAdminMode, currentOrganization?.id]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCreateUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            // Appeler l'API backend pour créer l'utilisateur
            await apiRequest(API_ENDPOINTS.users.create, {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password || undefined,
                    nom: formData.nom,
                    prenom: formData.prenom,
                    role: formData.role,
                    telephone: formData.telephone,
                    actif: formData.actif
                }),
            });

            alert('✅ Utilisateur créé avec succès !');
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Erreur création utilisateur:', error);
            alert('❌ Erreur : ' + getErrorMessage(error));
        }
    };

    const handleUpdateUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!selectedUser?.id) throw new Error('Utilisateur non sélectionné');
            
            await apiRequest(API_ENDPOINTS.users.update(selectedUser.id), {
                method: 'PUT',
                body: JSON.stringify({
                    nom: formData.nom,
                    prenom: formData.prenom,
                    role: formData.role,
                    telephone: formData.telephone,
                    actif: formData.actif
                }),
            });

            alert('✅ Utilisateur modifié avec succès !');
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Erreur modification utilisateur:', error);
            alert('❌ Erreur : ' + getErrorMessage(error));
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            await apiRequest(API_ENDPOINTS.users.delete(userId), {
                method: 'DELETE',
            });

            alert('✅ Utilisateur désactivé avec succès !');
            fetchUsers();
        } catch (error) {
            console.error('Erreur désactivation utilisateur:', error);
            alert('❌ Erreur : ' + getErrorMessage(error));
        }
    };

    const openCreateModal = () => {
        resetForm();
        setSelectedUser(null);
        setShowModal(true);
    };

    const openEditModal = (user: UserProfile) => {
        setSelectedUser(user);
        setFormData({
            email: user.email || '',
            password: '',
            nom: user.nom || '',
            prenom: user.prenom || '',
            role: user.role || 'user',
            telephone: user.telephone || '',
            actif: user.actif ?? true
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            nom: '',
            prenom: '',
            role: 'user',
            telephone: '',
            actif: true
        });
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            superadmin: 'bg-purple-100/50 text-purple-700 border border-purple-200/50',
            admin: 'bg-blue-100/50 text-blue-700 border border-blue-200/50',
            gestionnaire: 'bg-emerald-100/50 text-emerald-700 border border-emerald-200/50',
            user: 'bg-slate-100 text-slate-700 border border-slate-200'
        };
        return colors[role] || colors.user;
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            superadmin: 'Super Admin',
            admin: 'Admin',
            gestionnaire: 'Gestionnaire',
            user: 'Utilisateur'
        };
        return labels[role] || 'Utilisateur';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestion des Utilisateurs</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {isSuperAdminMode
                            ? 'Gérez les superadmins de la plateforme'
                            : `Gérez les membres de l'organisation ${currentOrganization?.name || ''}`}
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nouvel utilisateur
                </button>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Rôle
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                                {user.email?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {user.nom && user.prenom ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium">Créé le {new Date(user.created_at || '').toLocaleDateString('fr-FR')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                {user.email || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                {user.telephone || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Shield className={`w-4 h-4 ${user.role === 'superadmin' ? 'text-purple-500' : 'text-slate-400'}`} />
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${getRoleColor(String(user.role ?? 'user'))}`}>
                                                {getRoleLabel(String(user.role ?? 'user'))}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.actif ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100/50 text-emerald-700 border border-emerald-200/50">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Actif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                                <XCircle className="w-3.5 h-3.5" />
                                                Inactif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-30"
                                                disabled={user.id === profile?.id && user.role === 'superadmin'}
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30"
                                                disabled={user.id === profile?.id}
                                                title="Désactiver"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-slate-100">
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-slate-800">
                                {selectedUser ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        disabled={!!selectedUser}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium text-slate-700 disabled:opacity-50 disabled:bg-slate-50"
                                    />
                                </div>

                                {/* Password (uniquement création) */}
                                {!selectedUser && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Mot de passe <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium text-slate-700"
                                            placeholder="Min. 6 caractères"
                                            minLength={6}
                                        />
                                    </div>
                                )}

                                {/* Nom */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium text-slate-700"
                                    />
                                </div>

                                {/* Prénom */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium text-slate-700"
                                    />
                                </div>

                                {/* Téléphone */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium text-slate-700"
                                    />
                                </div>

                                {/* Rôle */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Rôle <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium text-slate-700 disabled:opacity-50 disabled:bg-slate-50"
                                        disabled={selectedUser?.id === profile?.id && selectedUser?.role === 'superadmin'}
                                    >
                                        <option value="user">Utilisateur</option>
                                        <option value="gestionnaire">Gestionnaire</option>
                                        <option value="admin">Admin</option>
                                        {profile?.is_superadmin && (
                                            <option value="superadmin">Super Admin</option>
                                        )}
                                    </select>
                                </div>

                                {/* Statut */}
                                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <input
                                        type="checkbox"
                                        id="actif"
                                        checked={formData.actif}
                                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-colors"
                                        disabled={selectedUser?.id === profile?.id}
                                    />
                                    <label htmlFor="actif" className="text-sm font-bold text-slate-700">
                                        Compte utilisateur actif
                                    </label>
                                </div>

                                {/* Boutons */}
                                <div className="flex gap-3 pt-6 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-sm hover:shadow-md transition-all"
                                    >
                                        {selectedUser ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}