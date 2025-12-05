import type { FC } from 'react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { isSanteType, normalizeTypeName } from '../../utils/compagnieHelpers';
import { useCompagniesMutations } from '../../hooks/useCompagniesMutations';
import type { Tables } from '../../types/supabase';

type Compagnie = Tables<'compagnies'>;

type SanteTaux = {
    commission_base: number;
    evacuation_sanitaire: number;
    commission_regulation: number;
};

type TauxData = Record<string, number | SanteTaux>;

type TauxModalProps = {
    compagnie: Compagnie | null;
    onClose: () => void;
    onSuccess: () => void | Promise<void>;
};

export const TauxModal: FC<TauxModalProps> = ({
    compagnie,
    onClose,
    onSuccess,
}) => {
    const [tauxData, setTauxData] = useState<TauxData>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newTauxType, setNewTauxType] = useState('');
    const [newTauxValue, setNewTauxValue] = useState('');
    const [newTauxSante, setNewTauxSante] = useState({
        commission_base: '',
        evacuation_sanitaire: '',
        commission_regulation: '',
    });

    const [editingTaux, setEditingTaux] = useState<string | null>(null);
    const [editTypeName, setEditTypeName] = useState('');
    const [editValue, setEditValue] = useState('');
    const [editSanteValues, setEditSanteValues] = useState({
        commission_base: '',
        evacuation_sanitaire: '',
        commission_regulation: '',
    });

    const { updateCompagnieTaux } = useCompagniesMutations();

    useEffect(() => {
        if (compagnie) {
            const raw = compagnie.taux_commissions as unknown;
            if (raw && typeof raw === 'object') {
                setTauxData(raw as TauxData);
            } else {
                setTauxData({});
            }
            setHasChanges(false);
        }
    }, [compagnie]);

    if (!compagnie) return null;

    const startEditTaux = (type: string, currentValue: any) => {
        setEditingTaux(type);
        setEditTypeName(type);

        if (typeof currentValue === 'object' && currentValue !== null) {
            setEditSanteValues({
                commission_base: ((currentValue.commission_base || 0) * 100).toFixed(2),
                evacuation_sanitaire: ((currentValue.evacuation_sanitaire || 0) * 100).toFixed(2),
                commission_regulation: ((currentValue.commission_regulation || 0) * 100).toFixed(2),
            });
            setEditValue('');
        } else {
            setEditValue(((currentValue || 0) * 100).toFixed(2));
            setEditSanteValues({
                commission_base: '',
                evacuation_sanitaire: '',
                commission_regulation: '',
            });
        }
    };

    const cancelEditTaux = () => {
        setEditingTaux(null);
        setEditTypeName('');
        setEditValue('');
        setEditSanteValues({
            commission_base: '',
            evacuation_sanitaire: '',
            commission_regulation: '',
        });
    };

    const saveEditTaux = (oldType: string) => {
        const newType = normalizeTypeName(editTypeName);

        if (isSanteType(newType)) {
            const base = parseFloat(editSanteValues.commission_base);
            const evac = parseFloat(editSanteValues.evacuation_sanitaire);
            const regul = parseFloat(editSanteValues.commission_regulation);

            if (Number.isNaN(base) || Number.isNaN(evac) || Number.isNaN(regul)) {
                toast.error('Valeurs invalides');
                return;
            }

            setTauxData((prev) => {
                const updated: TauxData = { ...prev };
                if (oldType !== newType) delete updated[oldType];
                updated[newType] = {
                    commission_base: base / 100,
                    evacuation_sanitaire: evac / 100,
                    commission_regulation: regul / 100,
                };
                return updated;
            });
        } else {
            const value = parseFloat(editValue);
            if (Number.isNaN(value) || value <= 0) {
                toast.error('Valeur invalide');
                return;
            }

            setTauxData((prev) => {
                const updated: TauxData = { ...prev };
                if (oldType !== newType) delete updated[oldType];
                updated[newType] = value / 100;
                return updated;
            });
        }

        setHasChanges(true);
        cancelEditTaux();
        toast.success('Modifié');
    };

    const addNewTaux = () => {
        if (!newTauxType.trim()) {
            toast.error('Nom du type obligatoire');
            return;
        }

        const type = normalizeTypeName(newTauxType);

        if (tauxData[type]) {
            toast.error(`Type "${type}" existe déjà`);
            return;
        }

        if (isSanteType(type)) {
            const base = parseFloat(newTauxSante.commission_base);
            const evac = parseFloat(newTauxSante.evacuation_sanitaire);
            const regul = parseFloat(newTauxSante.commission_regulation);

            if (
                Number.isNaN(base) ||
                Number.isNaN(evac) ||
                Number.isNaN(regul) ||
                base <= 0 ||
                evac <= 0 ||
                regul <= 0 ||
                base > 100 ||
                evac > 100 ||
                regul > 100
            ) {
                toast.error('Taux santé invalides (0-100)');
                return;
            }

            setTauxData((prev) => ({
                ...prev,
                [type]: {
                    commission_base: base / 100,
                    evacuation_sanitaire: evac / 100,
                    commission_regulation: regul / 100,
                },
            }));

            setNewTauxSante({
                commission_base: '',
                evacuation_sanitaire: '',
                commission_regulation: '',
            });
        } else {
            const value = parseFloat(newTauxValue);

            if (Number.isNaN(value) || value <= 0 || value > 100) {
                toast.error('Taux invalide (0-100)');
                return;
            }

            setTauxData((prev) => ({ ...prev, [type]: value / 100 }));
            setNewTauxValue('');
        }

        setHasChanges(true);
        setNewTauxType('');
        toast.success(`${type} ajouté`);
    };

    const removeTaux = (type: string) => {
        if (!window.confirm(`Supprimer "${type}" ?`)) return;

        setTauxData((prev) => {
            const updated: TauxData = { ...prev };
            delete updated[type];
            return updated;
        });

        setHasChanges(true);
        toast.success('Supprimé');
    };

    const saveTaux = async () => {
        if (Object.keys(tauxData).length === 0) {
            toast.error('Aucun taux à sauvegarder');
            return;
        }

        try {
            setSaving(true);

            const hasInvalidValues = Object.entries(tauxData).some(([, taux]) => {
                if (typeof taux === 'object' && taux !== null) {
                    return (
                        Number.isNaN(taux.commission_base) ||
                        Number.isNaN(taux.evacuation_sanitaire) ||
                        Number.isNaN(taux.commission_regulation)
                    );
                }
                return Number.isNaN(taux as number) || taux === null || taux === undefined;
            });

            if (hasInvalidValues) {
                toast.error('Valeurs invalides détectées');
                setSaving(false);
                return;
            }

            await updateCompagnieTaux(compagnie.id, tauxData as any);

            setHasChanges(false);
            toast.success('Taux sauvegardés ! 🎉');

            await onSuccess();

            setSaving(false);
            onClose();
        } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error('Erreur:', error);
            toast.error(`Erreur: ${error.message}`);
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (hasChanges) {
            if (
                window.confirm(
                    'Modifications non sauvegardées seront perdues. Continuer ?',
                )
            ) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[85vh] overflow-hidden animate-scale-in flex flex-col">
                <div className="border-b px-6 py-4 flex justify-between items-center bg-gradient-to-r from-primary-50 to-primary-100">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {compagnie.nom}
                            </h2>
                            <p className="text-sm text-gray-600">
                                Configuration des taux de commissions
                            </p>
                        </div>
                        {hasChanges && (
                            <span className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                Non sauvegardé
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        disabled={saving}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-5 mb-6">
                        <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Ajouter un type d&apos;assurance
                        </h3>

                        <div className="mb-4">
                            <input
                                type="text"
                                value={newTauxType}
                                onChange={(e) => setNewTauxType(e.target.value)}
                                placeholder="Nom du type (ex: AUTO_PARTICULIER, SANTE_INDIVIDUELLE, FLOTTE)"
                                className="w-full px-4 py-2.5 border-2 border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                                disabled={saving}
                            />
                            <p className="text-xs text-primary-700 mt-2 flex items-center gap-1">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Pour la santé : <strong>SANTE_INDIVIDUELLE</strong>,{' '}
                                <strong>SANTE_FAMILIALE</strong> ou{' '}
                                <strong>SANTE_GROUPE</strong>
                            </p>
                        </div>

                        {isSanteType(newTauxType) ? (
                            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-6 h-6 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-green-900">
                                            Configuration Assurance Santé
                                        </p>
                                        <p className="text-xs text-green-700">3 taux requis</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-green-900 mb-2">
                                            Commission base (%) *
                                        </label>
                                        <input
                                            type="number"
                                            value={newTauxSante.commission_base}
                                            onChange={(e) =>
                                                setNewTauxSante((prev) => ({
                                                    ...prev,
                                                    commission_base: e.target.value,
                                                }))
                                            }
                                            placeholder="16"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-3 py-2.5 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold"
                                            disabled={saving}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-green-900 mb-2">
                                            Évacuation sanitaire (%) *
                                        </label>
                                        <input
                                            type="number"
                                            value={newTauxSante.evacuation_sanitaire}
                                            onChange={(e) =>
                                                setNewTauxSante((prev) => ({
                                                    ...prev,
                                                    evacuation_sanitaire: e.target.value,
                                                }))
                                            }
                                            placeholder="8"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-3 py-2.5 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold"
                                            disabled={saving}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-green-900 mb-2">
                                            Commission régulation (%) *
                                        </label>
                                        <input
                                            type="number"
                                            value={newTauxSante.commission_regulation}
                                            onChange={(e) =>
                                                setNewTauxSante((prev) => ({
                                                    ...prev,
                                                    commission_regulation: e.target.value,
                                                }))
                                            }
                                            placeholder="16"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-full px-3 py-2.5 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold"
                                            disabled={saving}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addNewTaux}
                                    disabled={saving}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Ajouter type Santé
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    value={newTauxValue}
                                    onChange={(e) => setNewTauxValue(e.target.value)}
                                    placeholder="Taux en %"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="flex-1 px-4 py-2.5 border-2 border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-semibold"
                                    disabled={saving}
                                />
                                <button
                                    type="button"
                                    onClick={addNewTaux}
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Ajouter
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-primary-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            Types configurés ({Object.keys(tauxData).length})
                        </h3>
                        {Object.keys(tauxData).length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <svg
                                    className="w-16 h-16 mx-auto mb-3 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                                <p className="text-gray-500 font-medium">
                                    Aucun type configuré
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Ajoutez votre premier type ci-dessus
                                </p>
                            </div>
                        ) : (
                            Object.entries(tauxData).map(([type, taux]) => (
                                <div
                                    key={type}
                                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group border border-gray-200"
                                >
                                    {editingTaux === type ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editTypeName}
                                                onChange={(e) => setEditTypeName(e.target.value)}
                                                className="flex-1 px-3 py-2 border-2 border-primary-500 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-semibold"
                                                placeholder="Nom du type"
                                            />

                                            {typeof taux === 'object' && taux !== null ? (
                                                <div className="flex gap-2">
                                                    <div className="flex flex-col">
                                                        <label className="text-xs text-gray-600 mb-1">
                                                            Base %
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={editSanteValues.commission_base}
                                                            onChange={(e) =>
                                                                setEditSanteValues((prev) => ({
                                                                    ...prev,
                                                                    commission_base: e.target.value,
                                                                }))
                                                            }
                                                            step="0.01"
                                                            className="w-20 px-2 py-1.5 border-2 border-primary-500 rounded text-sm font-semibold"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-xs text-gray-600 mb-1">
                                                            Évac %
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={editSanteValues.evacuation_sanitaire}
                                                            onChange={(e) =>
                                                                setEditSanteValues((prev) => ({
                                                                    ...prev,
                                                                    evacuation_sanitaire: e.target.value,
                                                                }))
                                                            }
                                                            step="0.01"
                                                            className="w-20 px-2 py-1.5 border-2 border-primary-500 rounded text-sm font-semibold"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-xs text-gray-600 mb-1">
                                                            Régul %
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={editSanteValues.commission_regulation}
                                                            onChange={(e) =>
                                                                setEditSanteValues((prev) => ({
                                                                    ...prev,
                                                                    commission_regulation: e.target.value,
                                                                }))
                                                            }
                                                            step="0.01"
                                                            className="w-20 px-2 py-1.5 border-2 border-primary-500 rounded text-sm font-semibold"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        className="w-28 px-3 py-2 border-2 border-primary-500 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-semibold"
                                                    />
                                                    <span className="text-sm font-semibold text-primary-600">
                                                        %
                                                    </span>
                                                </>
                                            )}

                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => saveEditTaux(type)}
                                                    className="p-2 text-white bg-success-600 hover:bg-success-700 rounded-lg transition-colors"
                                                    title="Valider"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditTaux}
                                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                    title="Annuler"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <svg
                                                        className="w-5 h-5 text-primary-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-sm font-semibold text-gray-800 block mb-1">
                                                        {type.replace(/_/g, ' ')}
                                                    </span>
                                                    {typeof taux === 'object' && taux !== null ? (
                                                        <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-2 inline-flex gap-4">
                                                            <span className="text-xs text-green-900">
                                                                Base:{' '}
                                                                <span className="font-bold">
                                                                    {((taux as SanteTaux).commission_base * 100).toFixed(2)}%
                                                                </span>
                                                            </span>
                                                            <span className="text-xs text-green-900">
                                                                Évac:{' '}
                                                                <span className="font-bold">
                                                                    {((taux as SanteTaux).evacuation_sanitaire * 100).toFixed(2)}%
                                                                </span>
                                                            </span>
                                                            <span className="text-xs text-green-900">
                                                                Régul:{' '}
                                                                <span className="font-bold">
                                                                    {((taux as SanteTaux).commission_regulation * 100).toFixed(2)}%
                                                                </span>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-lg font-bold text-gray-900">
                                                            {((taux as number) * 100).toFixed(2)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditTaux(type, taux)}
                                                    className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                                                    title="Modifier"
                                                    disabled={saving}
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTaux(type)}
                                                    className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                    disabled={saving}
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center gap-3">
                    <div className="text-sm text-gray-600">
                        {hasChanges && (
                            <span className="flex items-center gap-2 text-warning-700 font-medium">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                Modifications non sauvegardées
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-white font-semibold transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={saveTaux}
                            disabled={saving || !hasChanges}
                            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sauvegarde...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


