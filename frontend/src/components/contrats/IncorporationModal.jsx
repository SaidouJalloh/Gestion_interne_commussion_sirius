// import { useState, useEffect } from 'react';
// import { supabase } from '../../lib/supabaseClient';
// import toast from 'react-hot-toast';
// import { useAuth } from '../../context/AuthContext';
// import {
//     calculerProrata,
//     calculerPrimeNette,
//     calculerPrimeProrata,
//     calculerCommission
// } from '../../utils/incorporationHelpers';

// export const IncorporationModal = ({ isOpen, onClose, contrat, onSuccess }) => {
//     const { profile } = useAuth();
//     const [loading, setLoading] = useState(false);

//     const [formData, setFormData] = useState({
//         nombre_elements: '',
//         prime_ttc: '',
//         fga: '',
//         taxes: '',
//         notes: ''
//     });

//     const [calculs, setCalculs] = useState({
//         prime_nette: 0,
//         jours_restants: 0,
//         pourcentage_prorata: 0,
//         prime_prorata: 0,
//         commission: 0,
//         date_effet: ''
//     });

//     useEffect(() => {
//         if (isOpen && contrat) {
//             const demain = new Date();
//             demain.setDate(demain.getDate() + 1);
//             const dateEffet = demain.toISOString().split('T')[0];

//             const { joursRestants, pourcentageProrata } = calculerProrata(
//                 dateEffet,
//                 contrat.date_expiration
//             );

//             setCalculs(prev => ({
//                 ...prev,
//                 date_effet: dateEffet,
//                 jours_restants: joursRestants,
//                 pourcentage_prorata: pourcentageProrata
//             }));
//         }
//     }, [isOpen, contrat]);

//     useEffect(() => {
//         if (!formData.prime_ttc || !formData.fga || !formData.taxes) return;

//         const primeTTC = parseFloat(formData.prime_ttc);
//         const fga = parseFloat(formData.fga);
//         const taxes = parseFloat(formData.taxes);

//         if (isNaN(primeTTC) || isNaN(fga) || isNaN(taxes)) return;

//         const primeNette = calculerPrimeNette(primeTTC, fga, taxes);
//         const primeProrata = calculerPrimeProrata(primeNette, calculs.pourcentage_prorata);

//         const tauxCommission = contrat.taux_commission ||
//             contrat.compagnie?.taux_commissions?.[contrat.type_contrat];

//         const commission = tauxCommission
//             ? calculerCommission(primeProrata, tauxCommission)
//             : 0;

//         setCalculs(prev => ({
//             ...prev,
//             prime_nette: primeNette,
//             prime_prorata: primeProrata,
//             commission: commission
//         }));

//     }, [formData.prime_ttc, formData.fga, formData.taxes, calculs.pourcentage_prorata, contrat]);

//     const handleChange = (e) => {
//         setFormData(prev => ({
//             ...prev,
//             [e.target.name]: e.target.value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             if (!formData.nombre_elements || !formData.prime_ttc || !formData.fga || !formData.taxes) {
//                 toast.error('Tous les champs obligatoires doivent être remplis');
//                 setLoading(false);
//                 return;
//             }

//             const nombreElements = parseInt(formData.nombre_elements);
//             if (nombreElements <= 0) {
//                 toast.error('Le nombre doit être supérieur à 0');
//                 setLoading(false);
//                 return;
//             }

//             if (calculs.jours_restants <= 0) {
//                 toast.error('Le contrat est expiré, incorporation impossible');
//                 setLoading(false);
//                 return;
//             }

//             // 1. Insérer l'incorporation
//             const { error: errorIncorp } = await supabase
//                 .from('incorporations')
//                 .insert([{
//                     contrat_id: contrat.id,
//                     date_effet: calculs.date_effet,
//                     nombre_elements: nombreElements,
//                     prime_ttc: parseFloat(formData.prime_ttc),
//                     fga: parseFloat(formData.fga),
//                     taxes: parseFloat(formData.taxes),
//                     prime_nette: calculs.prime_nette,
//                     prime_prorata: calculs.prime_prorata,
//                     commission: calculs.commission,
//                     jours_restants: calculs.jours_restants,
//                     pourcentage_prorata: calculs.pourcentage_prorata,
//                     notes: formData.notes?.trim() || null,
//                     created_by: profile.id
//                 }]);

//             if (errorIncorp) throw errorIncorp;

//             // 2. Mettre à jour le contrat
//             const { data: { session } } = await supabase.auth.getSession();
//             const supabaseUrl = supabase.supabaseUrl;
//             const supabaseKey = supabase.supabaseKey;

//             const nouveauPrimeTTC = (contrat.prime_ttc || 0) + calculs.prime_prorata;
//             const nouveauPrimeNette = (contrat.prime_nette || 0) + calculs.prime_nette;
//             const nouveauFGA = (contrat.fga || 0) + parseFloat(formData.fga);
//             const nouveauTaxes = (contrat.taxes || 0) + parseFloat(formData.taxes);
//             const nouveauMontantIncorp = (contrat.montant_incorporations || 0) + calculs.prime_prorata;
//             const nouveauNombreIncorp = (contrat.nombre_incorporations || 0) + 1;
//             const nouvelleCommission = (contrat.commission || 0) + calculs.commission;

//             const response = await fetch(
//                 `${supabaseUrl}/rest/v1/contrats?id=eq.${contrat.id}`,
//                 {
//                     method: 'PATCH',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${session.access_token}`,
//                         'apikey': supabaseKey,
//                         'Prefer': 'return=minimal'
//                     },
//                     body: JSON.stringify({
//                         prime_ttc: nouveauPrimeTTC,
//                         prime_nette: nouveauPrimeNette,
//                         fga: nouveauFGA,
//                         taxes: nouveauTaxes,
//                         montant_incorporations: nouveauMontantIncorp,
//                         nombre_incorporations: nouveauNombreIncorp,
//                         commission: nouvelleCommission
//                     })
//                 }
//             );

//             if (!response.ok) throw new Error('Erreur mise à jour contrat');

//             toast.success('Incorporation enregistrée ! 🎉');

//             if (onSuccess) await onSuccess();

//             await new Promise(resolve => setTimeout(resolve, 500));

//             setLoading(false);
//             onClose();
//             resetForm();

//         } catch (error) {
//             console.error('Erreur incorporation:', error);
//             toast.error(`Erreur: ${error.message}`);
//             setLoading(false);
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             nombre_elements: '',
//             prime_ttc: '',
//             fga: '',
//             taxes: '',
//             notes: ''
//         });
//     };

//     if (!isOpen) return null;

//     const formatCurrency = (value) => {
//         return new Intl.NumberFormat('fr-FR', {
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0
//         }).format(value);
//     };

//     const labelElements = contrat?.is_flotte ? 'de véhicules' :
//         (contrat?.type_contrat?.toUpperCase().includes('SANTE') ? 'de personnes' : 'd\'éléments');

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                 <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b px-6 py-4 flex justify-between items-center">
//                     <div>
//                         <h2 className="text-xl font-bold text-gray-900">📝 Incorporation</h2>
//                         <p className="text-sm text-gray-600">
//                             {contrat?.type_contrat} {contrat?.is_flotte && '(Flotte)'}
//                         </p>
//                     </div>
//                     <button onClick={onClose} disabled={loading} className="p-2 hover:bg-white rounded-lg transition-colors">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                     <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                             <div>
//                                 <span className="text-gray-600">Type:</span>
//                                 <span className="ml-2 font-semibold">{contrat?.type_contrat}</span>
//                             </div>
//                             <div>
//                                 <span className="text-gray-600">Expiration:</span>
//                                 <span className="ml-2 font-semibold">
//                                     {new Date(contrat?.date_expiration).toLocaleDateString('fr-FR')}
//                                 </span>
//                             </div>
//                             <div>
//                                 <span className="text-gray-600">Date effet:</span>
//                                 <span className="ml-2 font-semibold text-blue-600">
//                                     {new Date(calculs.date_effet).toLocaleDateString('fr-FR')}
//                                 </span>
//                             </div>
//                             <div>
//                                 <span className="text-gray-600">Jours restants:</span>
//                                 <span className="ml-2 font-semibold text-blue-600">
//                                     {calculs.jours_restants} jours ({calculs.pourcentage_prorata}%)
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium mb-2">
//                                 Nombre {labelElements} <span className="text-danger-500">*</span>
//                             </label>
//                             <input
//                                 type="number"
//                                 name="nombre_elements"
//                                 value={formData.nombre_elements}
//                                 onChange={handleChange}
//                                 min="1"
//                                 className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                                 required
//                                 disabled={loading}
//                             />
//                         </div>

//                         <div className="grid grid-cols-3 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">
//                                     Prime TTC (FCFA) <span className="text-danger-500">*</span>
//                                 </label>
//                                 <input
//                                     type="number"
//                                     name="prime_ttc"
//                                     value={formData.prime_ttc}
//                                     onChange={handleChange}
//                                     step="0.01"
//                                     min="0"
//                                     className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                                     required
//                                     disabled={loading}
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">
//                                     FGA (FCFA) <span className="text-danger-500">*</span>
//                                 </label>
//                                 <input
//                                     type="number"
//                                     name="fga"
//                                     value={formData.fga}
//                                     onChange={handleChange}
//                                     step="0.01"
//                                     min="0"
//                                     className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                                     required
//                                     disabled={loading}
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">
//                                     Taxes (FCFA) <span className="text-danger-500">*</span>
//                                 </label>
//                                 <input
//                                     type="number"
//                                     name="taxes"
//                                     value={formData.taxes}
//                                     onChange={handleChange}
//                                     step="0.01"
//                                     min="0"
//                                     className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                                     required
//                                     disabled={loading}
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium mb-2">Notes</label>
//                             <textarea
//                                 name="notes"
//                                 value={formData.notes}
//                                 onChange={handleChange}
//                                 rows={2}
//                                 className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
//                                 placeholder="Informations complémentaires..."
//                                 disabled={loading}
//                             />
//                         </div>
//                     </div>

//                     <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-2">
//                         <h3 className="font-semibold text-green-900 mb-3">📊 Calculs automatiques</h3>
//                         <div className="grid grid-cols-2 gap-3 text-sm">
//                             <div className="flex justify-between">
//                                 <span className="text-gray-700">Prime nette:</span>
//                                 <span className="font-bold text-gray-900">{formatCurrency(calculs.prime_nette)} FCFA</span>
//                             </div>
//                             <div className="flex justify-between">
//                                 <span className="text-gray-700">Prime prorata:</span>
//                                 <span className="font-bold text-green-600">{formatCurrency(calculs.prime_prorata)} FCFA</span>
//                             </div>
//                             <div className="flex justify-between col-span-2">
//                                 <span className="text-gray-700">Commission:</span>
//                                 <span className="font-bold text-blue-600">{formatCurrency(calculs.commission)} FCFA</span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="flex gap-3 pt-4 border-t">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             disabled={loading}
//                             className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
//                         >
//                             Annuler
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     Enregistrement...
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                     </svg>
//                                     Enregistrer
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };





























import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { calculerPrimeNette, calculerCommission, isAutoFlotte } from '../../utils/incorporationHelpers';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../../utils/apiClient';

export const IncorporationModal = ({ isOpen, onClose, contrat, onSuccess }) => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nombre_elements: '',
        prime_ttc: '',
        fga: '0',
        taxes: '0',
        montant_accessoire: '0',
        notes: ''
    });

    const [calculs, setCalculs] = useState({
        prime_nette: 0,
        commission: 0,
        date_effet: ''
    });

    useEffect(() => {
        if (isOpen && contrat) {
            // Date d'effet = Date du jour
            const aujourdhui = new Date();
            const dateEffet = aujourdhui.toISOString().split('T')[0];

            setCalculs(prev => ({
                ...prev,
                date_effet: dateEffet
            }));

            // Réinitialiser FGA à 0 si pas auto/flotte
            if (!isAutoFlotte(contrat.type_contrat)) {
                setFormData(prev => ({
                    ...prev,
                    fga: '0'
                }));
            }
        }
    }, [isOpen, contrat]);

    // Recalculer quand les champs changent
    useEffect(() => {
        if (!formData.prime_ttc) return;

        const primeTTC = parseFloat(formData.prime_ttc);
        const fga = parseFloat(formData.fga) || 0;
        const taxes = parseFloat(formData.taxes) || 0;
        const accessoire = parseFloat(formData.montant_accessoire) || 0;

        if (isNaN(primeTTC)) return;

        // Calculer prime nette
        const primeNette = calculerPrimeNette(primeTTC, fga, taxes, accessoire);

        // Récupérer le taux de commission du contrat
        const tauxCommission = contrat.taux_commission ||
            contrat.compagnies?.taux_commissions?.[contrat.type_contrat];

        // Calculer commission
        const commission = tauxCommission
            ? calculerCommission(primeNette, tauxCommission)
            : 0;

        setCalculs(prev => ({
            ...prev,
            prime_nette: primeNette,
            commission: commission
        }));

    }, [formData.prime_ttc, formData.fga, formData.taxes, formData.montant_accessoire, contrat]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.nombre_elements || !formData.prime_ttc || !formData.taxes) {
                toast.error('Tous les champs obligatoires doivent être remplis');
                setLoading(false);
                return;
            }

            const nombreElements = parseInt(formData.nombre_elements);
            if (nombreElements <= 0) {
                toast.error('Le nombre doit être supérieur à 0');
                setLoading(false);
                return;
            }

            if (calculs.prime_nette <= 0) {
                toast.error('La prime nette doit être supérieure à 0');
                setLoading(false);
                return;
            }

            // ✅ API backend: crée l'incorporation + met à jour le contrat en transaction
            await apiRequest(API_ENDPOINTS.incorporations.create, {
                method: 'POST',
                body: JSON.stringify({
                    contrat_id: contrat.id,
                    date_effet: calculs.date_effet,
                    date_expiration: typeof contrat.date_expiration === 'string'
                        ? contrat.date_expiration.slice(0, 10)
                        : new Date(contrat.date_expiration).toISOString().slice(0, 10),
                    nombre_elements: nombreElements,
                    prime_ttc: Number(formData.prime_ttc),
                    fga: Number(formData.fga) || 0,
                    taxes: Number(formData.taxes) || 0,
                    montant_accessoire: Number(formData.montant_accessoire) || 0,
                    prime_nette: calculs.prime_nette,
                    commission: calculs.commission,
                    notes: formData.notes?.trim() || null,
                    created_by: profile?.id ?? null,
                }),
            });

            toast.success('Incorporation enregistrée ! 🎉');

            if (onSuccess) await onSuccess();

            await new Promise(resolve => setTimeout(resolve, 500));

            setLoading(false);
            onClose();
            resetForm();

        } catch (error) {
            console.error('Erreur incorporation:', error);
            toast.error(`Erreur: ${error.message}`);
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre_elements: '',
            prime_ttc: '',
            fga: '0',
            taxes: '0',
            montant_accessoire: '0',
            notes: ''
        });
    };

    if (!isOpen) return null;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const labelElements = contrat?.is_flotte ? 'de véhicules' :
        (contrat?.type_contrat?.toUpperCase().includes('SANTE') ? 'de personnes' : 'd\'éléments');

    const showFGA = isAutoFlotte(contrat?.type_contrat);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">📝 Incorporation</h2>
                        <p className="text-sm text-gray-600">
                            {contrat?.type_contrat} {contrat?.is_flotte && '(Flotte)'}
                        </p>
                    </div>
                    <button onClick={onClose} disabled={loading} className="p-2 hover:bg-white rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Type:</span>
                                <span className="ml-2 font-semibold">{contrat?.type_contrat}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Expiration contrat:</span>
                                <span className="ml-2 font-semibold">
                                    {new Date(contrat?.date_expiration).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-600">Date d'effet incorporation:</span>
                                <span className="ml-2 font-semibold text-blue-600">
                                    {new Date(calculs.date_effet).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Nombre {labelElements} <span className="text-danger-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="nombre_elements"
                                value={formData.nombre_elements}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className={showFGA ? '' : 'col-span-2'}>
                                <label className="block text-sm font-medium mb-2">
                                    Prime TTC (FCFA) <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="prime_ttc"
                                    value={formData.prime_ttc}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {showFGA && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        FGA (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        name="fga"
                                        value={formData.fga}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        disabled={loading}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Taxes (FCFA) <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="taxes"
                                    value={formData.taxes}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Accessoire (FCFA)
                                </label>
                                <input
                                    type="number"
                                    name="montant_accessoire"
                                    value={formData.montant_accessoire}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Informations complémentaires..."
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-2">
                        <h3 className="font-semibold text-green-900 mb-3">📊 Calculs automatiques</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-700">Prime nette:</span>
                                <span className="font-bold text-gray-900">{formatCurrency(calculs.prime_nette)} FCFA</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Commission:</span>
                                <span className="font-bold text-blue-600">{formatCurrency(calculs.commission)} FCFA</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};