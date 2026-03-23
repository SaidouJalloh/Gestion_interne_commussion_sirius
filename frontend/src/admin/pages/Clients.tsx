// Admin Clients Page
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useProfileContext } from '../../context/ProfileContext';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboard } from '../hooks/useKeyboard';
import { useClientsData } from '../hooks/useClientsData';
import { useClientsMutations } from '../hooks/useClientsMutations';
import { CardSkeleton } from '../components/LoadingStates';

type ClientLike = {
    id: string;
    nom?: string | null;
    prenom?: string | null;
    email?: string | null;
    telephone?: string | null;
    type_client?: string | null;
    adresse?: string | null;
    ville?: string | null;
    code_postal?: string | null;
    notes?: string | null;
    [key: string]: unknown;
};

export default function Clients() {
    const location = useLocation();
    // ⚡ Utilise le hook personnalisé
    const { clients, loading, refetch } = useClientsData();
    const { createClient, updateClient, deleteClient } = useClientsMutations();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientLike | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const { profile } = useProfileContext();
    const role = profile?.role ?? 'user';
    const isAdmin = ['admin', 'superadmin'].includes(role);
    const searchRef = useRef<HTMLInputElement | null>(null);

    const debouncedSearch = useDebounce(searchTerm, 300);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        type_client: 'particulier',
        adresse: '',
        ville: '',
        code_postal: '',
        notes: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // ⚡ OPTIMISATION : Memoize filtrage
    const filteredClients = useMemo(() => {
        if (!debouncedSearch && filterType === 'all') return clients;

        return clients.filter((client: ClientLike) => {
            const matchSearch = !debouncedSearch ||
                client.nom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                client.prenom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                client.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                client.telephone?.includes(debouncedSearch);
            const matchType = filterType === 'all' || client.type_client === filterType;
            return matchSearch && matchType;
        });
    }, [clients, debouncedSearch, filterType]);

    // ⚡ OPTIMISATION : Memoize stats
    const stats = useMemo(() => ({
        total: clients.length,
        particuliers: clients.filter(c => c.type_client === 'particulier').length,
        entreprises: clients.filter(c => c.type_client === 'entreprise').length,
    }), [clients]);

    const resetForm = useCallback(() => {
        setFormData({
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            type_client: 'particulier',
            adresse: '',
            ville: '',
            code_postal: '',
            notes: '',
        });
        setFormError('');
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleTypeChange: (type: string) => void = useCallback((type) => {
        setFormData(prev => ({ ...prev, type_client: type }));
    }, []);

    const handleAdd = useCallback(() => {
        resetForm();
        setSelectedClient(null);
        setIsModalOpen(true);
    }, [resetForm]);

    // Ouvrir le modal si demandé depuis le dashboard
    useEffect(() => {
        if ((location.state as { openModal?: boolean })?.openModal) {
            handleAdd();
            // Nettoyer l'état pour éviter de rouvrir le modal à chaque navigation
            window.history.replaceState({}, document.title);
        }
    }, [location.state, handleAdd]);

    const handleEdit = useCallback((client: ClientLike) => {
        setSelectedClient(client);
        setFormData({
            nom: client.nom || '',
            prenom: client.prenom || '',
            email: client.email || '',
            telephone: client.telephone || '',
            type_client: client.type_client || 'particulier',
            adresse: client.adresse || '',
            ville: client.ville || '',
            code_postal: client.code_postal || '',
            notes: client.notes || '',
        });
        setFormError('');
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedClient(null);
        resetForm();
    }, [resetForm]);

    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            if (!formData.nom || !formData.prenom) {
                setFormError('Nom et prénom sont obligatoires');
                setFormLoading(false);
                return;
            }

            // ✅ NETTOYER les données : string vide → null
            const cleanData = {
                nom: formData.nom.trim(),
                prenom: formData.prenom.trim(),
                email: formData.email?.trim() || null,  // ← FIX ICI
                telephone: formData.telephone?.trim() || null,
                type_client: formData.type_client,
                adresse: formData.adresse?.trim() || null,
                ville: formData.ville?.trim() || null,
                code_postal: formData.code_postal?.trim() || null,
                notes: formData.notes?.trim() || null,
            };

            if (selectedClient) {
                await updateClient(selectedClient.id, cleanData);
                toast.success('Client mis à jour ! 🎉');
            } else {
                await createClient({
                    ...cleanData,
                    created_by: profile?.id ?? null,
                });
                toast.success('Client créé ! 🎉');
            }

            await refetch();
            closeModal();
        } catch (err: unknown) {
            console.error('Erreur:', err);

            const message =
                err instanceof Error
                    ? err.message
                    : String((err as { message?: unknown } | null)?.message ?? 'Une erreur est survenue');
            if (
                typeof message === 'string' &&
                (message.toLowerCase().includes('email') &&
                    (message.toLowerCase().includes('déjà') ||
                        message.toLowerCase().includes('deja') ||
                        message.toLowerCase().includes('conflit') ||
                        message.toLowerCase().includes('unicité') ||
                        message.toLowerCase().includes('unicite')))
            ) {
                setFormError('Cet email est déjà utilisé');
            } else {
                setFormError(message);
            }
        } finally {
            setFormLoading(false);
        }
    }, [formData, selectedClient, refetch, closeModal, createClient, updateClient, profile?.id]);

    const handleDelete = useCallback(async (clientId: string) => {
        try {
            const promise = deleteClient(clientId);

            await toast.promise(promise, {
                loading: 'Suppression...',
                success: 'Client supprimé ! 🗑️',
                error: 'Erreur lors de la suppression',
            });

            await refetch();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Erreur:', error);
        }
    }, [deleteClient, refetch]);

    // Raccourcis clavier
    useKeyboard('n', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleAdd();
        }
    }, [handleAdd]);

    useKeyboard('Escape', () => {
        if (isModalOpen) closeModal();
        if (deleteConfirm) setDeleteConfirm(null);
    }, [isModalOpen, deleteConfirm, closeModal]);

    useKeyboard('/', (e) => {
        e.preventDefault();
        (searchRef.current as HTMLInputElement | null)?.focus();
    }, []);

    return (
        <div className="animate-fade-in">
            {/* Header avec stats */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Clients</h1>
                        <p className="text-gray-600">Gérez votre portefeuille clients</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover-lift flex items-center gap-2 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nouveau client
                        <span className="hidden sm:inline text-xs opacity-75">(Ctrl+N)</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Clients</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                👥
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Particuliers</p>
                                <p className="text-3xl font-bold mt-1">{stats.particuliers}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                👤
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Entreprises</p>
                                <p className="text-3xl font-bold mt-1">{stats.entreprises}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                🏢
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher un client... (Appuyez sur /)"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="all">Tous les types</option>
                        <option value="particulier">Particuliers</option>
                        <option value="entreprise">Entreprises</option>
                    </select>
                </div>
            </div>

            {/* Liste des clients */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-soft">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">Aucun client trouvé</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="bg-white rounded-xl shadow-soft p-6 hover-lift">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${client.type_client === 'entreprise' ? 'bg-purple-100' : 'bg-blue-100'
                                        }`}>
                                        {client.type_client === 'entreprise' ? '🏢' : '👤'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{client.nom} {client.prenom}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${client.type_client === 'entreprise'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {client.type_client === 'entreprise' ? 'Entreprise' : 'Particulier'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {client.email && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {client.email}
                                    </p>
                                )}
                                {client.telephone && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {client.telephone}
                                    </p>
                                )}
                                {client.ville && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {client.ville}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    onClick={() => handleEdit(client)}
                                    className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 font-medium transition-colors"
                                >
                                    Modifier
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => setDeleteConfirm(client.id)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Formulaire */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold">{selectedClient ? 'Modifier' : 'Nouveau'} client</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {formError}
                                </div>
                            )}

                            {/* Type de client */}
                            <div>
                                <label className="block text-sm font-medium mb-3">Type de client</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('particulier')}
                                        className={`p-4 border-2 rounded-lg transition-all ${formData.type_client === 'particulier'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'particulier' ? 'bg-primary-100' : 'bg-gray-100'
                                                }`}>
                                                👤
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Particulier</p>
                                                <p className="text-xs text-gray-500">Personne physique</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('entreprise')}
                                        className={`p-4 border-2 rounded-lg transition-all ${formData.type_client === 'entreprise'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'entreprise' ? 'bg-primary-100' : 'bg-gray-100'
                                                }`}>
                                                🏢
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Entreprise</p>
                                                <p className="text-xs text-gray-500">Personne morale</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Nom & Prénom */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        required
                                        placeholder="Dupont"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        required
                                        placeholder="Jean"
                                    />
                                </div>
                            </div>

                            {/* Email & Téléphone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="jean.dupont@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Téléphone</label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="+221 77 123 45 67"
                                    />
                                </div>
                            </div>

                            {/* Adresse */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Adresse</label>
                                <input
                                    type="text"
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="123 Rue de la Paix"
                                />
                            </div>

                            {/* Ville & Code Postal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ville</label>
                                    <input
                                        type="text"
                                        name="ville"
                                        value={formData.ville}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Dakar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Code postal</label>
                                    <input
                                        type="text"
                                        name="code_postal"
                                        value={formData.code_postal}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="10000"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
                                    placeholder="Informations complémentaires..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    disabled={formLoading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                                >
                                    {formLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {selectedClient ? 'Mettre à jour' : 'Créer'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmation Suppression */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-md w-full p-6 animate-scale-in">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
                                <p className="text-sm text-gray-600">Cette action est irréversible</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
