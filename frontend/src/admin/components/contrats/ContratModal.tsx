import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { isSanteContract, isAutoContract, calculateExpirationDate } from '../../utils/contratHelpers';
import { useVehicules } from '../../hooks/useVehicules';
import { useClientsMutations } from '../../hooks/useClientsMutations';
import { useContractsMutations } from '../../hooks/useContractsMutations';
import { VehiculesInput } from './VehiculesInput';
import { SimulationForm } from './SimulationForm';
import { API_ENDPOINTS } from '../../../config/api';
import { apiRequest } from '../../utils/apiClient';
import type { SimulationResult } from '../../hooks/useInsuranceProvider';

type TauxSante = {
    commission_base: number;
    evacuation_sanitaire: number;
    commission_regulation: number;
};

export type ContratFormData = Record<string, unknown> & {
    client_id: string;
    compagnie_id: string;
    type_contrat: string;
    immatriculation: string;
    date_effet: string;
    date_expiration: string;
    fractionnement: string;
    statut: string;
    notes: string;
    prime_regulation?: string | number | null;
    evacuation_sanitaire?: string | number | null;
    client_telephone?: string;
    client_email?: string;
    prime_ttc: string | number | null;
    prime_nette: string | number | null;
    montant_accessoire: string | number | null;
    fga: string | number | null;
    taxes: string | number | null;
    taux_commission: string | number | null;
    commission: string | number | null;
    is_flotte?: boolean;
    provider_ref?: Record<string, unknown> | null;
};

type ContratLike = Record<string, unknown> & { id: string };
type ClientLike = Record<string, unknown> & {
    id: string;
    nom?: string | null;
    prenom?: string | null;
    telephone?: string | null;
    email?: string | null;
};
type CompagnieLike = Record<string, unknown> & { id: string; nom?: string | null; taux_commissions?: unknown | null };
type VehiculeLike = Record<string, unknown> & {
    id?: string;
    tempId?: number;
    immatriculation: string;
    actif?: boolean | null;
};

type ContratModalProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedContrat?: ContratLike | null;
    formData: ContratFormData;
    setFormData: Dispatch<SetStateAction<ContratFormData>>;
    typesDisponibles: string[];
    tauxSante: TauxSante | null;
    clients: ClientLike[];
    compagnies: CompagnieLike[];
    onSuccess?: () => void;
};

export const ContratModal = ({
    isOpen,
    onClose,
    selectedContrat,
    formData,
    setFormData,
    typesDisponibles,
    tauxSante,
    clients,
    compagnies,
    onSuccess
}: ContratModalProps) => {
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [localVehicules, setLocalVehicules] = useState<VehiculeLike[]>([]);

    const { updateClient } = useClientsMutations();
    const { createContract, updateContract } = useContractsMutations();

    const { vehicules: existingVehicules } = useVehicules(selectedContrat?.id);

    useEffect(() => {
        if (selectedContrat?.id && existingVehicules.length > 0) {
            setLocalVehicules(
                (existingVehicules as unknown as VehiculeLike[]).map((v) => ({
                    ...v,
                    immatriculation: String((v as { immatriculation?: unknown }).immatriculation ?? ''),
                })),
            );
        }
    }, [selectedContrat, existingVehicules]);

    if (!isOpen) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked =
            type === 'checkbox' && 'checked' in e.target ? (e.target as HTMLInputElement).checked : false;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
            if (name === 'is_flotte' && !checked) {
                setLocalVehicules([]);
            }
        } else if (!selectedContrat && name === 'fractionnement' && formData.date_effet) {
            const newExpirationDate = calculateExpirationDate(formData.date_effet, value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                date_expiration: newExpirationDate
            }));
        } else if (!selectedContrat && name === 'date_effet' && value) {
            const newExpirationDate = calculateExpirationDate(value, formData.fractionnement ?? 'annuel');
            setFormData(prev => ({
                ...prev,
                [name]: value,
                date_expiration: newExpirationDate
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            if (!formData.client_id || !formData.compagnie_id || !formData.type_contrat) {
                setFormError('Client, compagnie et type de contrat sont obligatoires');
                setFormLoading(false);
                return;
            }
            if (!formData.date_effet || !formData.date_expiration) {
                setFormError('Dates d’effet et d’expiration sont obligatoires');
                setFormLoading(false);
                return;
            }

            // Après la validation ci-dessus, ces champs sont garantis non-vides.
            const clientId = formData.client_id;
            const compagnieId = formData.compagnie_id;
            const typeContrat = formData.type_contrat;

            if (isSanteContract(formData.type_contrat)) {
                if (parseFloat(String(formData.prime_regulation ?? 0)) > 0 && !formData.evacuation_sanitaire) {
                    setFormError('L\'évacuation sanitaire est obligatoire avec la prime de régulation');
                    setFormLoading(false);
                    return;
                }
            }

            if (formData.client_telephone || formData.client_email) {
                const clientUpdate: { telephone?: string; email?: string } = {};
                if (formData.client_telephone) clientUpdate.telephone = formData.client_telephone;
                if (formData.client_email) clientUpdate.email = formData.client_email;

                try {
                    await updateClient(formData.client_id, clientUpdate);
                } catch (e) {
                    console.warn('Erreur mise à jour client (API backend):', e);
                }
            }

            const { client_telephone, client_email, ...contratData } = formData;

            const toNullableNumber = (value: unknown): number | null => {
                if (value === null || typeof value === 'undefined') return null;
                const s = String(value).trim();
                if (s.length === 0) return null;
                const n = parseFloat(s);
                return Number.isFinite(n) ? n : null;
            };

            const toNumberOrZero = (value: unknown): number => {
                const n = toNullableNumber(value);
                return n === null ? 0 : n;
            };

            const primeTtc = toNullableNumber(formData.prime_ttc);
            const primeNette = toNullableNumber(formData.prime_nette);
            const tauxCommission = toNullableNumber(formData.taux_commission);
            const commission = toNullableNumber(formData.commission);

            if (primeNette === null || tauxCommission === null || commission === null) {
                setFormError('Prime nette, taux de commission et commission sont obligatoires');
                setFormLoading(false);
                return;
            }

            const dataToSubmit = {
                ...contratData,
                client_id: clientId,
                compagnie_id: compagnieId,
                type_contrat: typeContrat,
                date_effet: formData.date_effet,
                date_expiration: formData.date_expiration,
                is_flotte: formData.is_flotte || false,
                prime_ttc: primeTtc,
                prime_nette: primeNette,
                montant_accessoire: toNumberOrZero(formData.montant_accessoire),
                fga: toNumberOrZero(formData.fga),
                taxes: toNumberOrZero(formData.taxes),
                taux_commission: tauxCommission,
                commission: commission,
                evacuation_sanitaire: toNullableNumber(formData.evacuation_sanitaire),
                prime_regulation: toNullableNumber(formData.prime_regulation),
                provider_ref: formData.provider_ref ?? undefined,
            };

            if (selectedContrat) {
                await updateContract(selectedContrat.id, dataToSubmit);
            } else {
                const newContrat = await createContract(dataToSubmit);

                if (formData.is_flotte && localVehicules.length > 0) {
                    const vehiculesToInsert = localVehicules
                        .map(v => String(v?.immatriculation || '').trim())
                        .filter(Boolean)
                        .map((immatriculation) => ({ contrat_id: newContrat.id, immatriculation }));

                    if (vehiculesToInsert.length > 0) {
                        const results = await Promise.allSettled(
                            vehiculesToInsert.map((v) =>
                                apiRequest(API_ENDPOINTS.vehicules.create, {
                                    method: 'POST',
                                    body: JSON.stringify(v),
                                }),
                            ),
                        );

                        const rejected = results.filter((r) => r.status === 'rejected');
                        if (rejected.length > 0) {
                            console.warn('Erreur ajout véhicules (API backend):', rejected);
                        }
                    }
                }
            }

            setFormLoading(false);
            onSuccess?.();
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            const message =
                error && typeof error === 'object' && 'message' in error
                    ? String((error as { message?: unknown }).message)
                    : 'Une erreur est survenue';
            setFormError(message);
            setFormLoading(false);
        }
    };

    const handleClientChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        setFormData(prev => ({ ...prev, client_id: clientId }));

        const selectedClient = clients.find(c => c.id === clientId) as (ClientLike & { telephone?: string | null; email?: string | null }) | undefined;
        if (selectedClient) {
            setFormData(prev => ({
                ...prev,
                client_telephone: selectedClient.telephone || '',
                client_email: selectedClient.email || ''
            }));
        }
    };

    const handleVehiculesChange = (newVehicules: VehiculeLike[]) => {
        setLocalVehicules(newVehicules);
    };

    // Check if selected compagnie has an API provider configured
    const selectedCompagnie = compagnies.find(c => c.id === formData.compagnie_id);
    const hasProvider = !!(
        selectedCompagnie &&
        (selectedCompagnie as any).api_config &&
        typeof (selectedCompagnie as any).api_config === 'object' &&
        (selectedCompagnie as any).api_config.provider
    );

    const handleSimulationResult = (result: SimulationResult) => {
        setFormData(prev => ({
            ...prev,
            prime_ttc: String(result.prime_ttc),
            prime_nette: String(result.prime_nette),
            montant_accessoire: String(result.accessoire),
            fga: String(result.fga),
            taxes: String(result.taxe),
            commission: String(result.commission),
            taux_commission: prev.taux_commission || '0',
            provider_ref: {
                provider: ((selectedCompagnie as any)?.api_config as any)?.provider ?? 'unknown',
                id_saisie: result.id_saisie,
                simulated_at: new Date().toISOString(),
            },
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{selectedContrat ? 'Modifier' : 'Nouveau'} Contrat</h2>
                            <p className="text-sm text-primary-100">Remplissez les informations du contrat</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {formError && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3 animate-shake">
                            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-800 font-medium">{formError}</p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Client <span className="text-danger-500">*</span></label>
                            <select name="client_id" value={formData.client_id} onChange={handleClientChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
                                <option value="">Sélectionner un client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.nom} {client.prenom}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Compagnie <span className="text-danger-500">*</span></label>
                            <select name="compagnie_id" value={formData.compagnie_id} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
                                <option value="">Sélectionner une compagnie</option>
                                {compagnies.map(compagnie => (
                                    <option key={compagnie.id} value={compagnie.id}>
                                        {compagnie.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Type de contrat <span className="text-danger-500">*</span></label>
                            <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required disabled={!formData.compagnie_id}>
                                <option value="">Sélectionner un type</option>
                                {typesDisponibles.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {!formData.compagnie_id && (
                                <p className="text-xs text-gray-500 mt-1">Sélectionnez d'abord une compagnie</p>
                            )}
                        </div>
                        {formData.client_id && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Téléphone client (optionnel)</label>
                                <input
                                    type="tel"
                                    name="client_telephone"
                                    value={formData.client_telephone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="77 123 45 67"
                                />
                            </div>
                        )}
                    </div>

                    {isAutoContract(formData.type_contrat) && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    id="is_flotte"
                                    name="is_flotte"
                                    checked={formData.is_flotte || false}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <label htmlFor="is_flotte" className="text-sm font-medium text-blue-900 cursor-pointer">
                                    Contrat de flotte (plusieurs véhicules)
                                </label>
                            </div>

                            {formData.is_flotte ? (
                                selectedContrat ? (
                                    <div className="text-sm text-blue-800">
                                        <p className="mb-2">✓ Véhicules existants: {existingVehicules.length}</p>
                                        <p className="text-xs text-blue-600">La modification des véhicules de flotte n'est pas disponible en édition.</p>
                                    </div>
                                ) : (
                                    <VehiculesInput
                                        vehicules={localVehicules}
                                        onChange={handleVehiculesChange}
                                    />
                                )
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Immatriculation</label>
                                    <input
                                        type="text"
                                        name="immatriculation"
                                        value={formData.immatriculation ?? ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="DK-1234-AA"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Simulation Form (when provider configured) ─── */}
                    {hasProvider && formData.type_contrat && !selectedContrat && (
                        <SimulationForm
                            compagnieId={formData.compagnie_id}
                            typeContrat={formData.type_contrat}
                            onSimulationResult={handleSimulationResult}
                        />
                    )}

                    {/* ─── Manual premium inputs (when NO provider or editing) ─── */}
                    {(!hasProvider || selectedContrat) && (
                        <>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Prime TTC (FCFA) <span className="text-danger-500">*</span></label>
                                    <input type="number" step="0.01" name="prime_ttc" value={formData.prime_ttc ?? ''} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Taux de commission <span className="text-danger-500">*</span></label>
                                    <div className="relative">
                                        <input type="number" step="0.01" name="taux_commission" value={formData.taux_commission ?? ''} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-12" required />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`grid gap-4 ${isAutoContract(formData.type_contrat) ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Montant accessoire (FCFA)</label>
                                    <input type="number" step="0.01" name="montant_accessoire" value={formData.montant_accessoire ?? ''} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>

                                {isAutoContract(formData.type_contrat) && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            FGA (FCFA)
                                            <span className="text-xs text-primary-600 ml-2">(Fonds de Garantie Auto)</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="fga"
                                            value={formData.fga ?? ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder="0.00"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Uniquement pour Auto, Moto et Flotte
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">Taxes (FCFA)</label>
                                    <input type="number" step="0.01" name="taxes" value={formData.taxes ?? ''} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                            </div>

                            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                                <label className="block text-sm font-medium mb-2">Prime nette calculee (FCFA)</label>
                                <input type="number" step="0.01" name="prime_nette" value={formData.prime_nette ?? ''} className="w-full px-4 py-2.5 border rounded-lg bg-white font-semibold text-primary-600" readOnly />
                                <p className="text-xs text-gray-600 mt-1">
                                    {isAutoContract(formData.type_contrat)
                                        ? "Prime TTC - Accessoires - FGA - Taxes"
                                        : formData.type_contrat && isSanteContract(formData.type_contrat)
                                            ? "Prime TTC - Frais gestion - Taxes - Assistance"
                                            : "Prime TTC - Accessoires - Taxes"}
                                </p>
                            </div>
                        </>
                    )}

                    {/* ─── Summary when values come from simulation ─── */}
                    {hasProvider && formData.provider_ref && !selectedContrat && (
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium text-slate-700">Valeurs issues de la simulation</p>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div><span className="text-slate-500">Prime TTC:</span> <span className="font-semibold">{Number(formData.prime_ttc).toLocaleString('fr-FR')} FCFA</span></div>
                                <div><span className="text-slate-500">Prime nette:</span> <span className="font-semibold">{Number(formData.prime_nette).toLocaleString('fr-FR')} FCFA</span></div>
                                <div><span className="text-slate-500">FGA:</span> <span className="font-semibold">{Number(formData.fga).toLocaleString('fr-FR')} FCFA</span></div>
                                <div><span className="text-slate-500">Taxes:</span> <span className="font-semibold">{Number(formData.taxes).toLocaleString('fr-FR')} FCFA</span></div>
                                <div><span className="text-slate-500">Accessoire:</span> <span className="font-semibold">{Number(formData.montant_accessoire).toLocaleString('fr-FR')} FCFA</span></div>
                                <div><span className="text-slate-500">Commission:</span> <span className="font-semibold">{Number(formData.commission).toLocaleString('fr-FR')} FCFA</span></div>
                            </div>
                        </div>
                    )}

                    {formData.type_contrat && isSanteContract(formData.type_contrat) && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-4">
                            <h3 className="font-semibold text-green-900 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Contrat Santé - Paramètres spécifiques
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Évacuation sanitaire (FCFA)</label>
                                    <input type="number" step="0.01" name="evacuation_sanitaire" value={formData.evacuation_sanitaire ?? ''} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                    {tauxSante && (
                                        <p className="text-xs text-gray-600 mt-1">Taux commission: {(tauxSante.evacuation_sanitaire * 100).toFixed(2)}%</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Prime de régulation (FCFA)</label>
                                    <input type="number" step="0.01" name="prime_regulation" value={formData.prime_regulation ?? ''} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                    {tauxSante && (
                                        <p className="text-xs text-gray-600 mt-1">Taux commission: {(tauxSante.commission_regulation * 100).toFixed(2)}%</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white border-2 border-green-300 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-green-900 mb-1">Mode de calcul détecté:</p>
                                        {parseFloat(String(formData.prime_regulation ?? 0)) > 0 ? (
                                            <p className="text-sm text-green-800">
                                                <span className="font-bold text-orange-600">⚡ Cas Exceptionnel:</span><br />
                                                (Prime nette + Prime régulation) × {tauxSante ? (tauxSante.commission_regulation * 100).toFixed(2) : '16'}% + Évacuation × {tauxSante ? (tauxSante.evacuation_sanitaire * 100).toFixed(2) : '8'}%
                                            </p>
                                        ) : parseFloat(String(formData.evacuation_sanitaire ?? 0)) > 0 ? (
                                            <p className="text-sm text-green-800">
                                                <span className="font-bold text-green-600">✓ Cas Normal:</span><br />
                                                Prime nette × {tauxSante ? (tauxSante.commission_base * 100).toFixed(2) : '16'}% + Évacuation × {tauxSante ? (tauxSante.evacuation_sanitaire * 100).toFixed(2) : '8'}%
                                            </p>
                                        ) : (
                                            <p className="text-sm text-green-800">
                                                <span className="font-bold text-blue-600">○ Sans évacuation:</span><br />
                                                Prime nette × {tauxSante ? (tauxSante.commission_base * 100).toFixed(2) : '16'}%
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {parseFloat(String(formData.prime_regulation ?? 0)) > 0 && !formData.evacuation_sanitaire && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-xs text-red-800 font-medium">
                                        L'évacuation sanitaire est obligatoire avec la prime de régulation
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-primary-900">Commission calculée</p>
                                <p className="text-xs text-primary-700 mt-0.5">Calcul automatique basé sur la prime nette</p>
                            </div>
                            <p className="text-3xl font-bold text-primary-600">
                                {parseFloat(String(formData.commission ?? 0)).toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Date d'effet <span className="text-danger-500">*</span></label>
                            <input type="date" name="date_effet" value={formData.date_effet} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Date d'expiration <span className="text-danger-500">*</span>
                                {!selectedContrat && formData.date_effet && (
                                    <span className="text-xs text-primary-600 ml-2">(Calculée automatiquement)</span>
                                )}
                            </label>
                            <input type="date" name="date_expiration" value={formData.date_expiration} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Fractionnement
                                {!selectedContrat && (
                                    <span className="text-xs text-gray-500 ml-2">(Détermine la durée)</span>
                                )}
                            </label>
                            <select name="fractionnement" value={formData.fractionnement} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                                <option value="mensuel">Mensuel (1 mois)</option>
                                <option value="trimestriel">Trimestriel (3 mois)</option>
                                <option value="semestriel">Semestriel (6 mois)</option>
                                <option value="annuel">Annuel (12 mois)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Statut</label>
                            <select name="statut" value={formData.statut} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                                <option value="actif">Actif</option>
                                <option value="expiré">Expiré</option>
                                <option value="annulé">Annulé</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Informations complémentaires..." />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors" disabled={formLoading}>
                            Annuler
                        </button>
                        <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
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
                                    {selectedContrat ? 'Mettre à jour' : 'Créer le contrat'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};