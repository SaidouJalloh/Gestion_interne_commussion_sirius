import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function GestionUtilisateurs() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        role: 'user',
        telephone: '',
        actif: true
    });
    const { profile } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data);
        } catch (error) {
            console.error('Erreur récupération utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            // 1. Créer l'utilisateur dans Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            // 2. Mettre à jour le profil avec les infos complètes
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        nom: formData.nom,
                        prenom: formData.prenom,
                        role: formData.role,
                        telephone: formData.telephone,
                        actif: formData.actif
                    })
                    .eq('id', authData.user.id);

                if (profileError) throw profileError;
            }

            alert('✅ Utilisateur créé avec succès !');
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Erreur création utilisateur:', error);
            alert('❌ Erreur : ' + error.message);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    nom: formData.nom,
                    prenom: formData.prenom,
                    role: formData.role,
                    telephone: formData.telephone,
                    actif: formData.actif
                })
                .eq('id', selectedUser.id);

            if (error) throw error;

            alert('✅ Utilisateur modifié avec succès !');
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Erreur modification utilisateur:', error);
            alert('❌ Erreur : ' + error.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            // Note: La suppression dans auth.users nécessite des permissions spéciales
            // Pour l'instant, on désactive juste l'utilisateur
            const { error } = await supabase
                .from('profiles')
                .update({ actif: false })
                .eq('id', userId);

            if (error) throw error;

            alert('✅ Utilisateur désactivé avec succès !');
            fetchUsers();
        } catch (error) {
            console.error('Erreur désactivation utilisateur:', error);
            alert('❌ Erreur : ' + error.message);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setSelectedUser(null);
        setShowModal(true);
    };

    const openEditModal = (user) => {
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

    const getRoleColor = (role) => {
        const colors = {
            superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            gestionnaire: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        };
        return colors[role] || colors.user;
    };

    const getRoleLabel = (role) => {
        const labels = {
            superadmin: 'Super Admin',
            admin: 'Admin',
            gestionnaire: 'Gestionnaire',
            user: 'Utilisateur'
        };
        return labels[role] || 'Utilisateur';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Gérez les utilisateurs et leurs permissions
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvel utilisateur
                </button>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Utilisateur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Rôle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Téléphone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                                            {user.email?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.nom && user.prenom ? `${user.prenom} ${user.nom}` : 'Non renseigné'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {user.email || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {user.telephone || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.actif ? (
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            Actif
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                            Inactif
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-3"
                                        disabled={user.id === profile?.id && user.role === 'superadmin'}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                        disabled={user.id === profile?.id}
                                    >
                                        Désactiver
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                            </h2>

                            <form onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        disabled={!!selectedUser}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                    />
                                </div>

                                {/* Password (uniquement création) */}
                                {!selectedUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Mot de passe *
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Min. 6 caractères"
                                            minLength={6}
                                        />
                                    </div>
                                )}

                                {/* Nom */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Prénom */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Téléphone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Rôle */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Rôle *
                                    </label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        disabled={selectedUser?.id === profile?.id && selectedUser?.role === 'superadmin'}
                                    >
                                        <option value="user">Utilisateur</option>
                                        <option value="gestionnaire">Gestionnaire</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                    </select>
                                </div>

                                {/* Statut */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="actif"
                                        checked={formData.actif}
                                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        disabled={selectedUser?.id === profile?.id}
                                    />
                                    <label htmlFor="actif" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Utilisateur actif
                                    </label>
                                </div>

                                {/* Boutons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        {selectedUser ? 'Modifier' : 'Créer'}
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