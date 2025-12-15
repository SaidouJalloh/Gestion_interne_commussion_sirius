// code avec incorporation
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { useProfileContext } from '../context/ProfileContext';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboard } from '../hooks/useKeyboard';
import { useContratsData } from '../hooks/useContratsData';
import { useContractsMutations } from '../hooks/useContractsMutations';
import { ContratsFilters } from '../components/contrats/ContratsFilters';
import { ContratsTable } from '../components/contrats/ContratsTable';
import { ContratModal } from '../components/contrats/ContratModal';
import { PaiementsModal } from '../components/contrats/PaiementsModal';
import { DeleteConfirmModal } from '../components/contrats/DeleteConfirmModal';
import { FlotteModal } from '../components/contrats/FlotteModal';
import { IncorporationModal } from '../components/contrats/IncorporationModal';
import { isSanteContract, isAutoContract } from '../utils/contratHelpers';

// Migration progressive: on garde des types permissifs pour ne pas bloquer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContratLike = any;

type TauxSante = {
    commission_base: number;
    evacuation_sanitaire: number;
    commission_regulation: number;
};

type FormDataState = {
    client_id: string;
    compagnie_id: string;
    type_contrat: string;
    immatriculation: string;
    prime_ttc: string;
    prime_nette: string;
    montant_accessoire: string;
    fga: string;
    taxes: string;
    taux_commission: string | number;
    commission: string;
    date_effet: string;
    date_expiration: string;
    fractionnement: string;
    statut: string;
    notes: string;
    client_telephone: string;
    client_email: string;
    evacuation_sanitaire: string;
    prime_regulation: string;
};

export default function Contrats() {
    const { profile } = useProfileContext();
    const { contrats, clients, compagnies, loading, refetch } = useContratsData();
    const { deleteContract } = useContractsMutations();

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatut, setFilterStatut] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedContrat, setSelectedContrat] = useState<ContratLike | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [paiementsModal, setPaiementsModal] = useState<ContratLike | null>(null);
    const [flotteModal, setFlotteModal] = useState<ContratLike | null>(null);
    const [incorporationModal, setIncorporationModal] = useState<ContratLike | null>(null);

    const searchRef = useRef<HTMLInputElement | null>(null);

    const debouncedSearch = useDebounce(searchTerm, 300);

    const [formData, setFormData] = useState<FormDataState>({
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

    const [typesDisponibles, setTypesDisponibles] = useState<string[]>([]);
    const [tauxSante, setTauxSante] = useState<TauxSante | null>(null);

    const stats = useMemo(() => {
        const total = contrats.length;
        const actifs = contrats.filter((c: any) => c.statut === 'actif').length;
        const totalPrimes = contrats.reduce(
            (sum: number, c: any) => sum + parseFloat(c.prime_ttc || 0),
            0,
        );
        const totalCommissions = contrats.reduce(
            (sum: number, c: any) => sum + parseFloat(c.commission || 0),
            0,
        );

        return { total, actifs, totalPrimes, totalCommissions };
    }, [contrats]);

    const filteredContrats = useMemo(() => {
        return contrats.filter((contrat: any) => {
            const matchSearch =
                !debouncedSearch ||
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
            const compagnie: any = compagnies.find((c: any) => c.id === formData.compagnie_id);
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
            const compagnie: any = compagnies.find((c: any) => c.id === formData.compagnie_id);

            if (compagnie?.taux_commissions?.[formData.type_contrat]) {
                const tauxConfig: any = compagnie.taux_commissions[formData.type_contrat];

                if (isSanteContract(formData.type_contrat) && typeof tauxConfig === 'object') {
                    setTauxSante({
                        commission_base: tauxConfig.commission_base || 0.16,
                        evacuation_sanitaire: tauxConfig.evacuation_sanitaire || 0.08,
                        commission_regulation: tauxConfig.commission_regulation || 0.16,
                    });
                    setFormData((prev) => ({
                        ...prev,
                        taux_commission: tauxConfig.commission_base || 0.16,
                    }));
                } else {
                    setTauxSante(null);
                    setFormData((prev) => ({
                        ...prev,
                        taux_commission: tauxConfig,
                    }));
                }
            }
        }
    }, [formData.type_contrat, formData.compagnie_id, compagnies]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (formData.type_contrat && !isAutoContract(formData.type_contrat)) {
            if (parseFloat(formData.fga) !== 0) {
                setFormData((prev) => ({
                    ...prev,
                    fga: '0',
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
            setFormData((prev) => ({
                ...prev,
                prime_nette: primeNette.toFixed(2),
            }));
        } else if (primeNette < 0) {
            setFormData((prev) => ({
                ...prev,
                prime_nette: '0',
            }));
        }
    }, [
        formData.prime_ttc,
        formData.montant_accessoire,
        formData.fga,
        formData.taxes,
        formData.evacuation_sanitaire,
        formData.type_contrat,
        formData.prime_nette,
    ]);

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
                commission =
                    (primeNette + primeRegulation) * tauxSante.commission_regulation +
                    evacuationSanitaire * tauxSante.evacuation_sanitaire;
            } else if (evacuationSanitaire > 0) {
                commission =
                    primeNette * tauxSante.commission_base +
                    evacuationSanitaire * tauxSante.evacuation_sanitaire;
            } else {
                commission = primeNette * tauxSante.commission_base;
            }
        } else {
            const tauxCommission = parseFloat(String(formData.taux_commission)) || 0;
            commission = primeNette * tauxCommission + montantAccessoire;
        }

        setFormData((prev) => ({ ...prev, commission: commission.toFixed(2) }));
    }, [
        formData.taux_commission,
        formData.montant_accessoire,
        formData.type_contrat,
        formData.evacuation_sanitaire,
        formData.prime_regulation,
        tauxSante,
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

    const handleEdit = useCallback((contrat: any) => {
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

    const handleDelete = useCallback(
        async (contratId: string) => {
            try {
                const promise = deleteContract(contratId);

                await toast.promise(promise, {
                    loading: 'Suppression...',
                    success: 'Contrat supprimé avec succès !',
                    error: 'Erreur lors de la suppression',
                });

                await refetch();
                setDeleteConfirm(null);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Erreur:', error);
            }
        },
        [deleteContract, refetch],
    );

    const openPaiementsModal = useCallback((contrat: any) => {
        setPaiementsModal(contrat);
    }, []);

    const openFlotteModal = useCallback((contrat: any) => {
        setFlotteModal(contrat);
    }, []);

    const openIncorporationModal = useCallback((contrat: any) => {
        setIncorporationModal(contrat);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedContrat(null);
        resetForm();
    }, [resetForm]);

    const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

    useKeyboard(
        'n',
        (e: any) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                handleAdd();
            }
        },
        [handleAdd],
    );

    useKeyboard(
        'Escape',
        () => {
            if (isModalOpen) setIsModalOpen(false);
            if (deleteConfirm) setDeleteConfirm(null);
            if (paiementsModal) setPaiementsModal(null);
            if (flotteModal) setFlotteModal(null);
            if (incorporationModal) setIncorporationModal(null);
        },
        [isModalOpen, deleteConfirm, paiementsModal, flotteModal, incorporationModal],
    );

    useKeyboard(
        '/',
        (e: any) => {
            e.preventDefault();
            searchRef.current?.focus();
        },
        [],
    );

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
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">📋</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Actifs</p>
                                <p className="text-3xl font-bold mt-1">{stats.actifs}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">✅</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Total Primes TTC</p>
                                <p className="text-2xl font-bold mt-1">{stats.totalPrimes.toLocaleString()} FCFA</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">💰</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Total Commissions</p>
                                <p className="text-2xl font-bold mt-1">{stats.totalCommissions.toLocaleString()} FCFA</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">💵</div>
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

            <ContratsTable
                contrats={filteredContrats}
                loading={loading}
                onEdit={handleEdit}
                onDelete={setDeleteConfirm}
                onOpenPaiements={openPaiementsModal}
                onManageFlotte={openFlotteModal}
                onIncorporer={openIncorporationModal}
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
                    toast.success(selectedContrat ? 'Contrat mis à jour !' : 'Contrat créé !');
                    setTimeout(async () => {
                        await refetch();
                    }, 400);
                }}
            />

            <PaiementsModal contrat={paiementsModal} onClose={() => setPaiementsModal(null)} />

            <DeleteConfirmModal
                contratId={deleteConfirm}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
            />

            {flotteModal && <FlotteModal contrat={flotteModal} onClose={() => setFlotteModal(null)} />}

            {incorporationModal && (
                <IncorporationModal
                    isOpen={true}
                    onClose={() => setIncorporationModal(null)}
                    contrat={incorporationModal}
                    onSuccess={async () => {
                        toast.success('Incorporation enregistrée !');
                        setTimeout(async () => {
                            await refetch();
                        }, 500);
                    }}
                />
            )}
        </div>
    );
}

