// // src/components/compagnies/CompagnieModal.jsx
// import { useState } from 'react';
// import { supabase } from '../../lib/supabaseClient';
// import { LogoUpload } from './LogoUpload';

// export const CompagnieModal = ({
//     isOpen,
//     onClose,
//     selectedCompagnie,
//     formData,
//     setFormData,
//     onSuccess
// }) => {
//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');

//     if (!isOpen) return null;

//     const handleChange = (e) => {
//         const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
//         setFormData({ ...formData, [e.target.name]: value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setFormError('');
//         setFormLoading(true);

//         try {
//             if (!formData.nom.trim() || !formData.sigle.trim()) {
//                 setFormError('Le nom et le sigle sont obligatoires');
//                 setFormLoading(false);
//                 return;
//             }

//             if (selectedCompagnie) {
//                 const { error } = await supabase
//                     .from('compagnies')
//                     .update(formData)
//                     .eq('id', selectedCompagnie.id);
//                 if (error) throw error;
//             } else {
//                 const { error } = await supabase
//                     .from('compagnies')
//                     .insert([{ ...formData, taux_commissions: {} }]);
//                 if (error) throw error;
//             }

//             onSuccess();
//             onClose();
//         } catch (err) {
//             setFormError(err.message || 'Une erreur est survenue');
//         } finally {
//             setFormLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//             <div className="bg-white rounded-xl shadow-strong max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto">
//                 <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
//                     <h2 className="text-xl font-bold">
//                         {selectedCompagnie ? 'Modifier' : 'Ajouter'} une compagnie
//                     </h2>
//                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="p-6 space-y-4">
//                     {formError && (
//                         <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
//                             {formError}
//                         </div>
//                     )}

//                     <div>
//                         <label className="block text-sm font-medium mb-2">
//                             Nom de la compagnie <span className="text-danger-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="nom"
//                             value={formData.nom}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                             required
//                             placeholder="Ex: ASKIA ASSURANCES"
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium mb-2">
//                             Sigle <span className="text-danger-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="sigle"
//                             value={formData.sigle}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                             required
//                             placeholder="Ex: ASKIA"
//                         />
//                     </div>

//                     <LogoUpload
//                         currentLogo={formData.logo_url}
//                         onLogoChange={(url) => setFormData({ ...formData, logo_url: url })}
//                     />

//                     <div>
//                         <label className="block text-sm font-medium mb-2">Description</label>
//                         <textarea
//                             name="description"
//                             value={formData.description}
//                             onChange={handleChange}
//                             rows={3}
//                             className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
//                             placeholder="Description de la compagnie..."
//                         />
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <input
//                             type="checkbox"
//                             name="actif"
//                             checked={formData.actif}
//                             onChange={handleChange}
//                             className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
//                         />
//                         <label className="text-sm font-medium">Compagnie active</label>
//                     </div>

//                     <div className="flex gap-3 pt-4 border-t">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium"
//                             disabled={formLoading}
//                         >
//                             Annuler
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={formLoading}
//                             className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
//                         >
//                             {formLoading ? (
//                                 <>
//                                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     Enregistrement...
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                     </svg>
//                                     {selectedCompagnie ? 'Mettre à jour' : 'Créer'}
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };











// avec souscription
// src/components/compagnies/CompagnieModal.jsx
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { LogoUpload } from './LogoUpload';

export const CompagnieModal = ({
    isOpen,
    onClose,
    selectedCompagnie,
    formData,
    setFormData,
    onSuccess
}) => {
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            if (!formData.nom.trim() || !formData.sigle.trim()) {
                setFormError('Le nom et le sigle sont obligatoires');
                setFormLoading(false);
                return;
            }

            if (selectedCompagnie) {
                const { error } = await supabase
                    .from('compagnies')
                    .update(formData)
                    .eq('id', selectedCompagnie.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('compagnies')
                    .insert([{ ...formData, taux_commissions: {} }]);
                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (err) {
            setFormError(err.message || 'Une erreur est survenue');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-strong max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">
                        {selectedCompagnie ? 'Modifier' : 'Ajouter'} une compagnie
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {formError && (
                        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
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
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                            placeholder="Ex: ASKIA ASSURANCES"
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
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                            placeholder="Ex: ASKIA"
                        />
                    </div>

                    <LogoUpload
                        currentLogo={formData.logo_url}
                        onLogoChange={(url) => setFormData({ ...formData, logo_url: url })}
                    />

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            placeholder="Description de la compagnie..."
                        />
                    </div>

                    {/* ✅ NOUVEAU CHAMP: Lien de souscription */}
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
                            className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://portail-compagnie.com/login"
                        />
                        <div className="flex items-start gap-2 mt-2">
                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-blue-700">
                                Ce lien permettra d'accéder au portail de souscription de cette compagnie depuis le menu <strong>Souscription</strong>.
                                Exemple : https://ixperta-sn.groupensia.com/Login.aspx
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
                        />
                        <label className="text-sm font-medium">Compagnie active</label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium"
                            disabled={formLoading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={formLoading}
                            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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