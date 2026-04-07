// code avec incorporation
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    FileText, 
    CheckCircle2, 
    Banknote, 
    TrendingUp, 
    Plus
} from 'lucide-react';
import { useProfileContext } from '../../context/ProfileContext';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboard } from '../hooks/useKeyboard';
import { useContratsData } from '../hooks/useContratsData';
import { useContractsMutations } from '../hooks/useContractsMutations';
import { useInsuranceProvider } from '../hooks/useInsuranceProvider';
import { ContratsFilters } from '../components/contrats/ContratsFilters';
import { ContratsTable } from '../components/contrats/ContratsTable';
import { ContratModal, type ContratFormData } from '../components/contrats/ContratModal';
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

type FormDataState = ContratFormData;

export default function Contrats() {
    const { profile } = useProfileContext();
    const { contrats, clients, compagnies, loading, refetch } = useContratsData();
    const { deleteContract } = useContractsMutations();
    const { fetchReferentiel } = useInsuranceProvider();

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatut, setFilterStatut] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedContrat, setSelectedContrat] = useState<ContratLike | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [paiementsModal, setPaiementsModal] = useState<ContratLike | null>(null);
    const [flotteModal, setFlotteModal] = useState<ContratLike | null>(null);
    const [incorporationModal, setIncorporationModal] = useState<ContratLike | null>(null);

    const searchRef = useRef<HTMLInputElement>(null!);

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
        provider_ref: null,
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
        if (!formData.compagnie_id) {
            setTypesDisponibles([]);
            setTauxSante(null);
            return;
        }

        const compagnie: any = compagnies.find((c: any) => c.id === formData.compagnie_id);
        const hasApiConfig = compagnie?.api_config?.provider;

        if (hasApiConfig) {
            // Show the 4 main ASKIA product types
            setTypesDisponibles(['AUTOMOBILE', 'VOYAGE', 'MRH', 'RAPATRIEMENT']);
        } else if (compagnie?.taux_commissions) {
            setTypesDisponibles(Object.keys(compagnie.taux_commissions));
        } else {
            setTypesDisponibles([]);
        }
    }, [formData.compagnie_id, compagnies, fetchReferentiel]);

    useEffect(() => {
        // Reset provider_ref when type changes (new simulation needed)
        if (formData.provider_ref) {
            setFormData(prev => ({ ...prev, provider_ref: null }));
        }

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

    useEffect(() => {
        const typeContrat = String(formData.type_contrat ?? '');
        if (typeContrat && !isAutoContract(typeContrat)) {
            if (parseFloat(String(formData.fga ?? 0)) !== 0) {
                setFormData((prev) => ({
                    ...prev,
                    fga: '0',
                }));
            }
        }
    }, [formData.type_contrat, formData.fga]);

    useEffect(() => {
        // Skip auto-calculation when values come from provider simulation
        if (formData.provider_ref) return;

        const typeContrat = String(formData.type_contrat ?? '');
        const primeTtc = parseFloat(String(formData.prime_ttc ?? 0)) || 0;
        const accessoire = parseFloat(String(formData.montant_accessoire ?? 0)) || 0;
        const taxes = parseFloat(String(formData.taxes ?? 0)) || 0;

        let primeNette = 0;

        if (isAutoContract(typeContrat)) {
            const fga = parseFloat(String(formData.fga ?? 0)) || 0;
            primeNette = primeTtc - accessoire - fga - taxes;
        } else if (isSanteContract(typeContrat)) {
            const evacuationSanitaire = parseFloat(String(formData.evacuation_sanitaire ?? 0)) || 0;
            primeNette = primeTtc - accessoire - taxes - evacuationSanitaire;
        } else {
            primeNette = primeTtc - accessoire - taxes;
        }

        if (primeNette >= 0 && primeNette !== parseFloat(String(formData.prime_nette ?? 0))) {
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
        formData.provider_ref,
    ]);

    useEffect(() => {
        // Skip auto-calculation when values come from provider simulation
        if (formData.provider_ref) return;

        if (!formData.prime_nette || !formData.taux_commission) {
            return;
        }

        const typeContrat = formData.type_contrat ?? '';
        const primeNette = parseFloat(String(formData.prime_nette ?? 0)) || 0;
        const montantAccessoire = parseFloat(String(formData.montant_accessoire ?? 0)) || 0;
        let commission = 0;

        if (isSanteContract(typeContrat) && tauxSante) {
            const evacuationSanitaire = parseFloat(String(formData.evacuation_sanitaire ?? 0)) || 0;
            const primeRegulation = parseFloat(String(formData.prime_regulation ?? 0)) || 0;

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
            const tauxCommission = parseFloat(String(formData.taux_commission ?? 0)) || 0;
            commission = primeNette * tauxCommission + montantAccessoire;
        }

        setFormData((prev) => ({ ...prev, commission: commission.toFixed(2) }));
    }, [
        formData.taux_commission,
        formData.montant_accessoire,
        formData.type_contrat,
        formData.evacuation_sanitaire,
        formData.prime_regulation,
        formData.prime_nette,
        formData.provider_ref,
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
            provider_ref: null,
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
                        <h1 className="text-3xl font-bold font-title text-slate-900 mb-2">Contrats</h1>
                        <p className="text-slate-500 text-sm">Gérez vos contrats d'assurance</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau contrat
                        <span className="hidden sm:inline text-xs opacity-75 font-normal">(Ctrl+N)</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Total Contrats</p>
                                <p className="text-4xl font-mono font-bold mt-2">{stats.total}</p>
                            </div>
                            <FileText className="w-10 h-10 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Actifs</p>
                                <p className="text-4xl font-mono font-bold mt-2">{stats.actifs}</p>
                            </div>
                            <CheckCircle2 className="w-10 h-10 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium uppercase tracking-wider">Total Primes TTC</p>
                                <p className="text-2xl font-mono font-bold mt-2">{stats.totalPrimes.toLocaleString()} FCFA</p>
                            </div>
                            <Banknote className="w-10 h-10 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium uppercase tracking-wider">Total Commissions</p>
                                <p className="text-2xl font-mono font-bold mt-2">{stats.totalCommissions.toLocaleString()} FCFA</p>
                            </div>
                            <TrendingUp className="w-10 h-10 opacity-80" />
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


