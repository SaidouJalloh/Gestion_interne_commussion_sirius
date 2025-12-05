// code avec incorporation
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProfileContext } from '../context/ProfileContext';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboard } from '../hooks/useKeyboard';
import { useContratsData } from '../hooks/useContratsData';
import { ContratsFilters } from '../components/contrats/ContratsFilters';
import { ContratsTable } from '../components/contrats/ContratsTable';
import { ContratModal } from '../components/contrats/ContratModal';
import { PaiementsModal } from '../components/contrats/PaiementsModal';
import { DeleteConfirmModal } from '../components/contrats/DeleteConfirmModal';
import { FlotteModal } from '../components/contrats/FlotteModal';
import { IncorporationModal } from '../components/contrats/IncorporationModal'; // 👈 NOUVEAU
import { isSanteContract, isAutoContract } from '../utils/contratHelpers';

export default function Contrats() {
    const { profile } = useProfileContext();
    const { contrats, clients, compagnies, loading, refetch } = useContratsData();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatut, setFilterStatut] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContrat, setSelectedContrat] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [paiementsModal, setPaiementsModal] = useState(null);
    const [flotteModal, setFlotteModal] = useState(null);
    const [incorporationModal, setIncorporationModal] = useState(null); // 👈 NOUVEAU
    const searchRef = useRef(null);

    const debouncedSearch = useDebounce(searchTerm, 300);

    const [formData, setFormData] = useState({
        client_id: '',
        compagnie_id: '',
        type_contrat: '',
        immatriculation: '',
        prime_ttc: '',
        prime_nette: '',
        montant_accessoire: '0',
        fga: '0',
        taxes: '0',
        taux_commission: '',
        commission: '0',
        date_effet: '',
        date_expiration: '',
        fractionnement: 'annuel',
        statut: 'actif',
        notes: '',
        client_telephone: '',
        client_email: '',
        evacuation_sanitaire: '',
        prime_regulation: '',
    });

    const [typesDisponibles, setTypesDisponibles] = useState([]);
    const [tauxSante, setTauxSante] = useState(null);

    const stats = useMemo(() => {
        const total = contrats.length;
        const actifs = contrats.filter(c => c.statut === 'actif').length;
        const totalPrimes = contrats.reduce((sum, c) => sum + parseFloat(c.prime_ttc || 0), 0);
        const totalCommissions = contrats.reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);

        return { total, actifs, totalPrimes, totalCommissions };
    }, [contrats]);

    const filteredContrats = useMemo(() => {
        return contrats.filter(contrat => {
            const matchSearch = !debouncedSearch ||
                contrat.clients?.nom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                contrat.clients?.prenom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                contrat.compagnies?.nom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                contrat.type_contrat?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                contrat.immatriculation?.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchStatut = filterStatut === 'all' || contrat.statut === filterStatut;

            return matchSearch && matchStatut;
        });
    }, [contrats, debouncedSearch, filterStatut]);

    useEffect(() => {
        if (formData.compagnie_id) {
            const compagnie = compagnies.find(c => c.id === formData.compagnie_id);
            if (compagnie?.taux_commissions) {
                const types = Object.keys(compagnie.taux_commissions);
                setTypesDisponibles(types);
            } else {
                setTypesDisponibles([]);
            }
        } else {
            setTypesDisponibles([]);
            setTauxSante(null);
        }
    }, [formData.compagnie_id, compagnies]);

    useEffect(() => {
        if (formData.compagnie_id && formData.type_contrat) {
            const compagnie = compagnies.find(c => c.id === formData.compagnie_id);

            if (compagnie?.taux_commissions?.[formData.type_contrat]) {
                const tauxConfig = compagnie.taux_commissions[formData.type_contrat];

                if (isSanteContract(formData.type_contrat) && typeof tauxConfig === 'object') {
                    setTauxSante({
                        commission_base: tauxConfig.commission_base || 0.16,
                        evacuation_sanitaire: tauxConfig.evacuation_sanitaire || 0.08,
                        commission_regulation: tauxConfig.commission_regulation || 0.16
                    });
                    setFormData(prev => ({
                        ...prev,
                        taux_commission: tauxConfig.commission_base || 0.16
                    }));
                } else {
                    setTauxSante(null);
                    setFormData(prev => ({
                        ...prev,
                        taux_commission: tauxConfig
                    }));
                }
            }
        }
    }, [formData.type_contrat, formData.compagnie_id, compagnies]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (formData.type_contrat && !isAutoContract(formData.type_contrat)) {
            if (parseFloat(formData.fga) !== 0) {
                setFormData(prev => ({
                    ...prev,
                    fga: '0'
                }));
            }
        }
    }, [formData.type_contrat]);

    useEffect(() => {
        const primeTtc = parseFloat(formData.prime_ttc) || 0;
        const accessoire = parseFloat(formData.montant_accessoire) || 0;
        const taxes = parseFloat(formData.taxes) || 0;

        let primeNette = 0;

        if (isAutoContract(formData.type_contrat)) {
            const fga = parseFloat(formData.fga) || 0;
            primeNette = primeTtc - accessoire - fga - taxes;
        } else if (isSanteContract(formData.type_contrat)) {
            const evacuationSanitaire = parseFloat(formData.evacuation_sanitaire) || 0;
            primeNette = primeTtc - accessoire - taxes - evacuationSanitaire;
        } else {
            primeNette = primeTtc - accessoire - taxes;
        }

        if (primeNette >= 0 && primeNette !== parseFloat(formData.prime_nette)) {
            setFormData(prev => ({
                ...prev,
                prime_nette: primeNette.toFixed(2)
            }));
        } else if (primeNette < 0) {
            setFormData(prev => ({
                ...prev,
                prime_nette: '0'
            }));
        }
    }, [formData.prime_ttc, formData.montant_accessoire, formData.fga, formData.taxes, formData.evacuation_sanitaire, formData.type_contrat, formData.prime_nette]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!formData.prime_nette || !formData.taux_commission) {
            return;
        }

        const primeNette = parseFloat(formData.prime_nette) || 0;
        const montantAccessoire = parseFloat(formData.montant_accessoire) || 0;
        let commission = 0;

        if (isSanteContract(formData.type_contrat) && tauxSante) {
            const evacuationSanitaire = parseFloat(formData.evacuation_sanitaire) || 0;
            const primeRegulation = parseFloat(formData.prime_regulation) || 0;

            if (primeRegulation > 0) {
                commission = ((primeNette + primeRegulation) * tauxSante.commission_regulation)
                    + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
            } else if (evacuationSanitaire > 0) {
                commission = (primeNette * tauxSante.commission_base)
                    + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
            } else {
                commission = primeNette * tauxSante.commission_base;
            }
        } else {
            const tauxCommission = parseFloat(formData.taux_commission) || 0;
            commission = (primeNette * tauxCommission) + montantAccessoire;
        }

        setFormData(prev => ({ ...prev, commission: commission.toFixed(2) }));
    }, [
        formData.taux_commission,
        formData.montant_accessoire,
        formData.type_contrat,
        formData.evacuation_sanitaire,
        formData.prime_regulation,
        tauxSante
    ]);

    const resetForm = useCallback(() => {
        setFormData({
            client_id: '',
            compagnie_id: '',
            type_contrat: '',
            immatriculation: '',
            prime_ttc: '',
            prime_nette: '',
            montant_accessoire: '0',
            fga: '0',
            taxes: '0',
            taux_commission: '',
            commission: '0',
            date_effet: '',
            date_expiration: '',
            fractionnement: 'annuel',
            statut: 'actif',
            notes: '',
            client_telephone: '',
            client_email: '',
            evacuation_sanitaire: '',
            prime_regulation: '',
        });
        setTypesDisponibles([]);
        setTauxSante(null);
    }, []);

    const handleAdd = useCallback(() => {
        resetForm();
        setSelectedContrat(null);
        setIsModalOpen(true);
    }, [resetForm]);

    const handleEdit = useCallback((contrat) => {
        setSelectedContrat(contrat);
        setFormData({
            client_id: contrat.client_id || '',
            compagnie_id: contrat.compagnie_id || '',
            type_contrat: contrat.type_contrat || '',
            immatriculation: contrat.immatriculation || '',
            prime_ttc: contrat.prime_ttc || '',
            prime_nette: contrat.prime_nette || '',
            montant_accessoire: contrat.montant_accessoire || '0',
            fga: contrat.fga || '0',
            taxes: contrat.taxes || '0',
            taux_commission: contrat.taux_commission || '',
            commission: contrat.commission || '0',
            date_effet: contrat.date_effet || '',
            date_expiration: contrat.date_expiration || '',
            fractionnement: contrat.fractionnement || 'annuel',
            statut: contrat.statut || 'actif',
            notes: contrat.notes || '',
            client_telephone: '',
            client_email: '',
            evacuation_sanitaire: contrat.evacuation_sanitaire || '',
            prime_regulation: contrat.prime_regulation || '',
        });
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (contratId) => {
        try {
            const promise = supabase
                .from('contrats')
                .delete()
                .eq('id', contratId);

            await toast.promise(promise, {
                loading: 'Suppression...',
                success: 'Contrat supprimé avec succès ! 🗑️',
                error: 'Erreur lors de la suppression',
            });

            await refetch();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Erreur:', error);
        }
    }, [refetch]);

    const openPaiementsModal = useCallback((contrat) => {
        setPaiementsModal(contrat);
    }, []);

    const openFlotteModal = useCallback((contrat) => {
        setFlotteModal(contrat);
    }, []);

    // 👇 NOUVELLE FONCTION
    const openIncorporationModal = useCallback((contrat) => {
        setIncorporationModal(contrat);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedContrat(null);
        resetForm();
    }, [resetForm]);

    const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

    useKeyboard('n', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleAdd();
        }
    }, [handleAdd]);

    useKeyboard('Escape', () => {
        if (isModalOpen) setIsModalOpen(false);
        if (deleteConfirm) setDeleteConfirm(null);
        if (paiementsModal) setPaiementsModal(null);
        if (flotteModal) setFlotteModal(null);
        if (incorporationModal) setIncorporationModal(null); // 👈 NOUVEAU
    }, [isModalOpen, deleteConfirm, paiementsModal, flotteModal, incorporationModal]);

    useKeyboard('/', (e) => {
        e.preventDefault();
        searchRef.current?.focus();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Contrats</h1>
                        <p className="text-gray-600">Gérez vos contrats d'assurance</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover-lift flex items-center gap-2 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nouveau contrat
                        <span className="hidden sm:inline text-xs opacity-75">(Ctrl+N)</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Contrats</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                📋
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Actifs</p>
                                <p className="text-3xl font-bold mt-1">{stats.actifs}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                ✅
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Total Primes TTC</p>
                                <p className="text-2xl font-bold mt-1">{stats.totalPrimes.toLocaleString()} FCFA</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                💰
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Total Commissions</p>
                                <p className="text-2xl font-bold mt-1">{stats.totalCommissions.toLocaleString()} FCFA</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                💵
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ContratsFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatut={filterStatut}
                setFilterStatut={setFilterStatut}
                searchRef={searchRef}
            />

            {/* 👇 MODIFIÉ : Ajout de onIncorporer */}
            <ContratsTable
                contrats={filteredContrats}
                loading={loading}
                onEdit={handleEdit}
                onDelete={setDeleteConfirm}
                onOpenPaiements={openPaiementsModal}
                onManageFlotte={openFlotteModal}
                onIncorporer={openIncorporationModal} // 👈 NOUVEAU
                canDelete={canDelete}
            />

            <ContratModal
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedContrat={selectedContrat}
                formData={formData}
                setFormData={setFormData}
                typesDisponibles={typesDisponibles}
                tauxSante={tauxSante}
                clients={clients}
                compagnies={compagnies}
                onSuccess={async () => {
                    closeModal();
                    toast.success(selectedContrat ? 'Contrat mis à jour ! 🎉' : 'Contrat créé ! 🎉');
                    setTimeout(async () => {
                        await refetch();
                    }, 400);
                }}
            />

            <PaiementsModal
                contrat={paiementsModal}
                onClose={() => setPaiementsModal(null)}
            />

            <DeleteConfirmModal
                contratId={deleteConfirm}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
            />

            {flotteModal && (
                <FlotteModal
                    contrat={flotteModal}
                    onClose={() => setFlotteModal(null)}
                />
            )}

            {/* 👇 NOUVEAU MODAL D'INCORPORATION */}
            {incorporationModal && (
                <IncorporationModal
                    isOpen={true}
                    onClose={() => setIncorporationModal(null)}
                    contrat={incorporationModal}
                    onSuccess={async () => {
                        toast.success('Incorporation enregistrée ! 🎉');
                        setTimeout(async () => {
                            await refetch();
                        }, 500);
                    }}
                />
            )}
        </div>
    );
}