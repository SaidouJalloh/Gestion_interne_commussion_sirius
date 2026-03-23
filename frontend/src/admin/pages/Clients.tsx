// Admin Clients Page
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Users, User, Building2, Search, Filter, Mail, Phone, MapPin, Edit2, Trash2, Plus, X, AlertTriangle, Save } from 'lucide-react';
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
                        <h1 className="text-3xl font-bold font-title text-slate-900 mb-2">Clients</h1>
                        <p className="text-slate-500 text-sm">Gérez votre portefeuille clients</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau client
                        <span className="hidden sm:inline text-xs opacity-75 font-normal">(Ctrl+N)</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Total Clients</p>
                                <p className="text-4xl font-mono font-bold mt-2">{stats.total}</p>
                            </div>
                            <Users className="w-10 h-10 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Particuliers</p>
                                <p className="text-4xl font-mono font-bold mt-2">{stats.particuliers}</p>
                            </div>
                            <User className="w-10 h-10 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium uppercase tracking-wider">Entreprises</p>
                                <p className="text-4xl font-mono font-bold mt-2">{stats.entreprises}</p>
                            </div>
                            <Building2 className="w-10 h-10 opacity-80" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <input
                        ref={searchRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un client... (Appuyez sur /)"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white shadow-sm font-medium text-slate-700"
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="relative">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="appearance-none pl-10 pr-10 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white shadow-sm text-slate-700 font-medium whitespace-nowrap cursor-pointer"
                    >
                        <option value="all">Tous les types</option>
                        <option value="particulier">Particuliers</option>
                        <option value="entreprise">Entreprises</option>
                    </select>
                    <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            {/* Liste des clients */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 text-lg font-medium">Aucun client trouvé</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover-lift hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${client.type_client === 'entreprise' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {client.type_client === 'entreprise' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold font-title text-slate-900">{client.nom} {client.prenom}</h3>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md mt-1 inline-block ${client.type_client === 'entreprise'
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
                                    <p className="text-sm text-slate-600 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {client.email}
                                    </p>
                                )}
                                {client.telephone && (
                                    <p className="text-sm text-slate-600 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {client.telephone}
                                    </p>
                                )}
                                {client.ville && (
                                    <p className="text-sm text-slate-600 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {client.ville}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4">
                                <button
                                    onClick={() => handleEdit(client)}
                                    className="flex-1 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Modifier
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => setDeleteConfirm(client.id)}
                                        className="px-4 py-2 bg-red-50 text-red-600 border border-transparent rounded-lg hover:bg-red-100 font-medium transition-colors flex items-center justify-center p-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Formulaire */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-slate-100">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-semibold font-title text-slate-900">{selectedClient ? 'Modifier' : 'Nouveau'} client</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
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
                                        className={`p-4 border-2 rounded-xl transition-all text-left ${formData.type_client === 'particulier'
                                            ? 'border-blue-500 bg-blue-50/50'
                                            : 'border-slate-200 hover:border-blue-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.type_client === 'particulier' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">Particulier</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Personne physique</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('entreprise')}
                                        className={`p-4 border-2 rounded-xl transition-all text-left ${formData.type_client === 'entreprise'
                                            ? 'border-purple-500 bg-purple-50/50'
                                            : 'border-slate-200 hover:border-purple-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.type_client === 'entreprise' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">Entreprise</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Personne morale</p>
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
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        required
                                        placeholder="Jean"
                                    />
                                </div>
                            </div>

                            {/* Email & Téléphone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="jean.dupont@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="+221 77 123 45 67"
                                    />
                                </div>
                            </div>

                            {/* Adresse */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                                <input
                                    type="text"
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="123 Rue de la Paix"
                                />
                            </div>

                            {/* Ville & Code Postal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Ville</label>
                                    <input
                                        type="text"
                                        name="ville"
                                        value={formData.ville}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="Dakar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Code postal</label>
                                    <input
                                        type="text"
                                        name="code_postal"
                                        value={formData.code_postal}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="10000"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all text-sm"
                                    placeholder="Informations complémentaires..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                                    disabled={formLoading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
                                >
                                    {formLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
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
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in border border-slate-100">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 border border-red-100">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="pt-1">
                                <h3 className="text-lg font-bold font-title text-slate-900">Confirmer la suppression</h3>
                                <p className="text-sm text-slate-500 mt-1">Cette action est irréversible et supprimera toutes les données.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors shadow-sm"
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
