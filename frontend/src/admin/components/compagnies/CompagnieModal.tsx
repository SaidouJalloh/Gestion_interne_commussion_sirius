import type { FC, FormEvent } from 'react';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { LogoUpload } from './LogoUpload';
import { useCompagniesMutations } from '../../hooks/useCompagniesMutations';
import type { Tables } from '../../../types/supabase';

type Compagnie = Tables<'compagnies'>;

export type CompagnieFormData = {
    nom: string;
    sigle: string;
    description: string;
    logo_url: string;
    lien_souscription: string;
    actif: boolean;
};

type CompagnieModalProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedCompagnie: Compagnie | null;
    formData: CompagnieFormData;
    setFormData: (updater: (prev: CompagnieFormData) => CompagnieFormData) => void;
    onSuccess: () => void | Promise<void>;
};

export const CompagnieModal: FC<CompagnieModalProps> = ({
    isOpen,
    onClose,
    selectedCompagnie,
    formData,
    setFormData,
    onSuccess,
}) => {
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const { createCompagnie, updateCompagnie } = useCompagniesMutations();

    const handleChange = useCallback(
        (e: any) => {
            const value =
                e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            setFormData((prev) => ({ ...prev, [e.target.name]: value }));
        },
        [setFormData],
    );

    const handleLogoChange = useCallback(
        (url: string) => {
            setFormData((prev) => ({ ...prev, logo_url: url }));
        },
        [setFormData],
    );

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setFormError('');
            setFormLoading(true);

            try {
                if (!formData.nom?.trim() || !formData.sigle?.trim()) {
                    setFormError('Le nom et le sigle sont obligatoires');
                    setFormLoading(false);
                    return;
                }

                if (formData.lien_souscription?.trim()) {
                    try {
                        // eslint-disable-next-line no-new
                        new URL(formData.lien_souscription);
                    } catch {
                        setFormError('Le lien de souscription doit être une URL valide');
                        setFormLoading(false);
                        return;
                    }
                }

                const dataToSubmit = {
                    nom: formData.nom.trim(),
                    sigle: formData.sigle.trim().toUpperCase(),
                    description: formData.description?.trim() || '',
                    logo_url: formData.logo_url || '',
                    lien_souscription: formData.lien_souscription?.trim() || null,
                    actif: formData.actif,
                };

                if (selectedCompagnie) {
                    const promise = updateCompagnie(selectedCompagnie.id, dataToSubmit);
                    await toast.promise(promise, {
                        loading: 'Mise à jour...',
                        success: 'Compagnie mise à jour ! 🎉',
                        error: 'Erreur lors de la mise à jour',
                    });
                } else {
                    const promise = createCompagnie(dataToSubmit);
                    await toast.promise(promise, {
                        loading: 'Création...',
                        success: 'Compagnie créée ! 🎉',
                        error: 'Erreur lors de la création',
                    });
                }

                await onSuccess();
                onClose();
            } catch (err: any) {
                // eslint-disable-next-line no-console
                console.error('Erreur:', err);
                setFormError(err.message || 'Une erreur est survenue');
            } finally {
                setFormLoading(false);
            }
        },
        [formData, selectedCompagnie, onSuccess, onClose, createCompagnie, updateCompagnie],
    );

    const handleClose = useCallback(() => {
        if (!formLoading) {
            onClose();
        }
    }, [formLoading, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-strong max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">
                        {selectedCompagnie ? 'Modifier' : 'Ajouter'} une compagnie
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={formLoading}
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

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {formError && (
                        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <svg
                                className="w-5 h-5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            {formError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nom de la compagnie <span className="text-danger-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            required
                            placeholder="Ex: ASKIA ASSURANCES"
                            disabled={formLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Sigle <span className="text-danger-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="sigle"
                            value={formData.sigle}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all uppercase"
                            required
                            placeholder="Ex: ASKIA"
                            disabled={formLoading}
                            maxLength={10}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Le sigle sera automatiquement en majuscules
                        </p>
                    </div>

                    <LogoUpload
                        currentLogo={formData.logo_url}
                        onLogoChange={handleLogoChange}
                    />

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all"
                            placeholder="Description de la compagnie..."
                            disabled={formLoading}
                        />
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                            🌐 Lien de souscription / simulation
                            <span className="text-xs text-blue-600 ml-2">(Optionnel)</span>
                        </label>
                        <input
                            type="url"
                            name="lien_souscription"
                            value={formData.lien_souscription || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="https://portail-compagnie.com/login"
                            disabled={formLoading}
                        />
                        <div className="flex items-start gap-2 mt-2">
                            <svg
                                className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
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
                            <p className="text-xs text-blue-700">
                                Ce lien permettra d&apos;accéder au portail de souscription de
                                cette compagnie depuis le menu <strong>Souscription</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="actif"
                            checked={formData.actif}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            disabled={formLoading}
                        />
                        <label className="text-sm font-medium">Compagnie active</label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors"
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
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Enregistrement...
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
                                    {selectedCompagnie ? 'Mettre à jour' : 'Créer'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


