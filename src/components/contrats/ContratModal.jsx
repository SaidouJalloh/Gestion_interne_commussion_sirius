// code qui marche bien mais sans ttc
// // src/components/contrats/ContratModal.jsx
// import { useState } from 'react';
// import { supabase } from '../../lib/supabaseClient';
// import { isSanteContract, isAutoContract, calculateExpirationDate } from '../../utils/contratHelpers';

// export const ContratModal = ({
//     isOpen,
//     onClose,
//     selectedContrat,
//     formData,
//     setFormData,
//     typesDisponibles,
//     tauxSante,
//     clients,
//     compagnies,
//     onSuccess
// }) => {
//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');

//     if (!isOpen) return null;

//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         if (!selectedContrat && name === 'fractionnement' && formData.date_effet) {
//             const newExpirationDate = calculateExpirationDate(formData.date_effet, value);
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: value,
//                 date_expiration: newExpirationDate
//             }));
//         } else if (!selectedContrat && name === 'date_effet' && value) {
//             const newExpirationDate = calculateExpirationDate(value, formData.fractionnement);
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: value,
//                 date_expiration: newExpirationDate
//             }));
//         } else {
//             setFormData(prev => ({ ...prev, [name]: value }));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setFormError('');
//         setFormLoading(true);

//         try {
//             if (!formData.client_id || !formData.compagnie_id || !formData.type_contrat) {
//                 setFormError('Client, compagnie et type de contrat sont obligatoires');
//                 setFormLoading(false);
//                 return;
//             }

//             // Validation santé
//             if (isSanteContract(formData.type_contrat)) {
//                 if (parseFloat(formData.prime_regulation || 0) > 0 && !formData.evacuation_sanitaire) {
//                     setFormError('L\'évacuation sanitaire est obligatoire avec la prime de régulation');
//                     setFormLoading(false);
//                     return;
//                 }
//             }

//             // Mettre à jour client si nécessaire
//             if (formData.client_telephone || formData.client_email) {
//                 const clientUpdate = {};
//                 if (formData.client_telephone) clientUpdate.telephone = formData.client_telephone;
//                 if (formData.client_email) clientUpdate.email = formData.client_email;

//                 const { error: clientError } = await supabase
//                     .from('clients')
//                     .update(clientUpdate)
//                     .eq('id', formData.client_id);

//                 if (clientError) console.warn('Erreur mise à jour client:', clientError);
//             }

//             // Préparer les données
//             const { client_telephone, client_email, ...contratData } = formData;

//             const dataToSubmit = {
//                 ...contratData,
//                 prime_nette: parseFloat(formData.prime_nette),
//                 montant_accessoire: parseFloat(formData.montant_accessoire || 0),
//                 taux_commission: parseFloat(formData.taux_commission),
//                 commission: parseFloat(formData.commission),
//                 evacuation_sanitaire: formData.evacuation_sanitaire ? parseFloat(formData.evacuation_sanitaire) : null,
//                 prime_regulation: formData.prime_regulation ? parseFloat(formData.prime_regulation) : null,
//             };

//             if (selectedContrat) {
//                 const { error } = await supabase
//                     .from('contrats')
//                     .update(dataToSubmit)
//                     .eq('id', selectedContrat.id);
//                 if (error) throw error;
//             } else {
//                 const { error } = await supabase
//                     .from('contrats')
//                     .insert([dataToSubmit]);
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
//             <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//                 <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
//                     <h2 className="text-xl font-bold">{selectedContrat ? 'Modifier' : 'Nouveau'} contrat</h2>
//                     <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                     {formError && (
//                         <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
//                             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             {formError}
//                         </div>
//                     )}

//                     {/* Client et Compagnie */}
//                     <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium mb-2">Client <span className="text-danger-500">*</span></label>
//                             <select name="client_id" value={formData.client_id} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
//                                 <option value="">Sélectionner un client</option>
//                                 {clients.map(client => (
//                                     <option key={client.id} value={client.id}>
//                                         {client.nom} {client.prenom} ({client.type_client})
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium mb-2">Compagnie <span className="text-danger-500">*</span></label>
//                             <select name="compagnie_id" value={formData.compagnie_id} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
//                                 <option value="">Sélectionner une compagnie</option>
//                                 {compagnies.map(compagnie => (
//                                     <option key={compagnie.id} value={compagnie.id}>
//                                         {compagnie.nom}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>

//                     {/* Contacts client */}
//                     {formData.client_id && (
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                             <p className="text-sm font-medium text-blue-900 mb-3">📞 Contacts pour notifications</p>
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-xs font-medium text-blue-900 mb-1">Téléphone</label>
//                                     <input
//                                         type="tel"
//                                         name="client_telephone"
//                                         value={formData.client_telephone || ''}
//                                         onChange={handleChange}
//                                         className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
//                                         placeholder="+221 77 123 45 67"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs font-medium text-blue-900 mb-1">Email</label>
//                                     <input
//                                         type="email"
//                                         name="client_email"
//                                         value={formData.client_email || ''}
//                                         onChange={handleChange}
//                                         className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
//                                         placeholder="client@email.com"
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Type et taux */}
//                     <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium mb-2">Type de contrat <span className="text-danger-500">*</span></label>
//                             <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} disabled={!formData.compagnie_id} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100" required>
//                                 <option value="">Sélectionner un type</option>
//                                 {typesDisponibles.map(type => (
//                                     <option key={type} value={type}>
//                                         {type.replace(/_/g, ' ')}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium mb-2">Taux de commission</label>
//                             <div className="relative">
//                                 <input
//                                     type="text"
//                                     value={formData.taux_commission ? `${(parseFloat(formData.taux_commission) * 100).toFixed(2)} %` : ''}
//                                     placeholder="Sélectionnez d'abord un type"
//                                     className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold outline-none"
//                                     readOnly
//                                 />
//                                 {formData.taux_commission && (
//                                     <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                                         <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Champ Immatriculation pour contrats AUTO */}
//                     {isAutoContract(formData.type_contrat) && (
//                         <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
//                             <div className="flex items-center gap-2 mb-3">
//                                 <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
//                                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
//                                     </svg>
//                                 </div>
//                                 <div>
//                                     <p className="text-sm font-bold text-amber-900">🚗 Assurance Automobile</p>
//                                     <p className="text-xs text-amber-700">Informations du véhicule</p>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-amber-900 mb-2">
//                                     Numéro d'immatriculation
//                                     <span className="text-xs text-amber-700 ml-2 font-normal">(Ex: DK-1234-AB)</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="immatriculation"
//                                     value={formData.immatriculation}
//                                     onChange={handleChange}
//                                     placeholder="DK-1234-AB"
//                                     className="w-full px-4 py-2.5 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 font-medium uppercase"
//                                 />
//                             </div>
//                         </div>
//                     )}

//                     {/* Prime nette et accessoire */}
//                     <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium mb-2">Prime nette (FCFA) <span className="text-danger-500">*</span></label>
//                             <input type="number" name="prime_nette" value={formData.prime_nette} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                         </div>
//                         {!isSanteContract(formData.type_contrat) && (
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Montant accessoire (FCFA)</label>
//                                 <input type="number" name="montant_accessoire" value={formData.montant_accessoire} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0" />
//                             </div>
//                         )}
//                     </div>

//                     {/* CHAMPS SANTÉ */}
//                     {isSanteContract(formData.type_contrat) && (
//                         <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5 space-y-4">
//                             <div className="flex items-center gap-2 mb-3">
//                                 <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
//                                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                                     </svg>
//                                 </div>
//                                 <div>
//                                     <p className="text-sm font-bold text-green-900">Assurance Santé</p>
//                                     <p className="text-xs text-green-700">Configuration spécifique</p>
//                                 </div>
//                             </div>

//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-green-900 mb-2">
//                                         Évacuation Sanitaire (FCFA)
//                                         {parseFloat(formData.prime_regulation || 0) > 0 && <span className="text-danger-500 ml-1">*</span>}
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="evacuation_sanitaire"
//                                         value={formData.evacuation_sanitaire}
//                                         onChange={handleChange}
//                                         step="0.01"
//                                         min="0"
//                                         className="w-full px-4 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//                                         placeholder="Montant évacuation"
//                                         required={parseFloat(formData.prime_regulation || 0) > 0}
//                                     />
//                                     {tauxSante && (
//                                         <p className="text-xs text-green-700 mt-1 font-medium">
//                                             Taux: {(tauxSante.evacuation_sanitaire * 100).toFixed(2)}%
//                                         </p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-green-900 mb-2">
//                                         Prime de Régulation (FCFA)
//                                         <span className="text-xs text-orange-700 ml-2 font-normal">(Cas exceptionnel)</span>
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="prime_regulation"
//                                         value={formData.prime_regulation}
//                                         onChange={handleChange}
//                                         step="0.01"
//                                         min="0"
//                                         className="w-full px-4 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//                                         placeholder="Prime de régulation"
//                                     />
//                                     {tauxSante && (
//                                         <p className="text-xs text-green-700 mt-1 font-medium">
//                                             Taux: {(tauxSante.commission_regulation * 100).toFixed(2)}%
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Indicateur de cas */}
//                             <div className="bg-white border-2 border-green-300 rounded-lg p-4">
//                                 <div className="flex items-start gap-3">
//                                     <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                         <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                                         </svg>
//                                     </div>
//                                     <div className="flex-1">
//                                         <p className="text-xs font-semibold text-green-900 mb-1">Mode de calcul détecté:</p>
//                                         {parseFloat(formData.prime_regulation || 0) > 0 ? (
//                                             <p className="text-sm text-green-800">
//                                                 <span className="font-bold text-orange-600">⚡ Cas Exceptionnel:</span><br />
//                                                 (Prime nette + Prime régulation) × {tauxSante ? (tauxSante.commission_regulation * 100).toFixed(2) : '16'}% + Évacuation × {tauxSante ? (tauxSante.evacuation_sanitaire * 100).toFixed(2) : '8'}%
//                                             </p>
//                                         ) : parseFloat(formData.evacuation_sanitaire || 0) > 0 ? (
//                                             <p className="text-sm text-green-800">
//                                                 <span className="font-bold text-green-600">✓ Cas Normal:</span><br />
//                                                 Prime nette × {tauxSante ? (tauxSante.commission_base * 100).toFixed(2) : '16'}% + Évacuation × {tauxSante ? (tauxSante.evacuation_sanitaire * 100).toFixed(2) : '8'}%
//                                             </p>
//                                         ) : (
//                                             <p className="text-sm text-green-800">
//                                                 <span className="font-bold text-blue-600">○ Sans évacuation:</span><br />
//                                                 Prime nette × {tauxSante ? (tauxSante.commission_base * 100).toFixed(2) : '16'}%
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {parseFloat(formData.prime_regulation || 0) > 0 && !formData.evacuation_sanitaire && (
//                                 <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2">
//                                     <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                     </svg>
//                                     <p className="text-xs text-red-800 font-medium">
//                                         L'évacuation sanitaire est obligatoire avec la prime de régulation
//                                     </p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Commission calculée */}
//                     <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm font-medium text-primary-900">Commission calculée</p>
//                                 <p className="text-xs text-primary-700 mt-0.5">Calcul automatique</p>
//                             </div>
//                             <p className="text-3xl font-bold text-primary-600">
//                                 {parseFloat(formData.commission || 0).toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
//                             </p>
//                         </div>
//                     </div>

//                     {/* Dates */}
//                     <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium mb-2">Date d'effet <span className="text-danger-500">*</span></label>
//                             <input type="date" name="date_effet" value={formData.date_effet} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium mb-2">
//                                 Date d'expiration <span className="text-danger-500">*</span>
//                                 {!selectedContrat && formData.date_effet && (
//                                     <span className="text-xs text-primary-600 ml-2">(Calculée automatiquement)</span>
//                                 )}
//                             </label>
//                             <input type="date" name="date_expiration" value={formData.date_expiration} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                         </div>
//                     </div>

//                     {/* Fractionnement et statut */}
//                     <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium mb-2">
//                                 Fractionnement
//                                 {!selectedContrat && (
//                                     <span className="text-xs text-gray-500 ml-2">(Détermine la durée)</span>
//                                 )}
//                             </label>
//                             <select name="fractionnement" value={formData.fractionnement} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
//                                 <option value="mensuel">Mensuel (1 mois)</option>
//                                 <option value="trimestriel">Trimestriel (3 mois)</option>
//                                 <option value="semestriel">Semestriel (6 mois)</option>
//                                 <option value="annuel">Annuel (12 mois)</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium mb-2">Statut</label>
//                             <select name="statut" value={formData.statut} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
//                                 <option value="actif">Actif</option>
//                                 <option value="expiré">Expiré</option>
//                                 <option value="annulé">Annulé</option>
//                             </select>
//                         </div>
//                     </div>

//                     {/* Notes */}
//                     <div>
//                         <label className="block text-sm font-medium mb-2">Notes</label>
//                         <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Informations complémentaires..." />
//                     </div>

//                     {/* Boutons */}
//                     <div className="flex gap-3 pt-4 border-t">
//                         <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors" disabled={formLoading}>
//                             Annuler
//                         </button>
//                         <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
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
//                                     {selectedContrat ? 'Mettre à jour' : 'Créer le contrat'}
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };









// code avec ttc
// src/components/contrats/ContratModal.jsx
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { isSanteContract, isAutoContract, calculateExpirationDate } from '../../utils/contratHelpers';

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
}) => {
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (!selectedContrat && name === 'fractionnement' && formData.date_effet) {
            const newExpirationDate = calculateExpirationDate(formData.date_effet, value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                date_expiration: newExpirationDate
            }));
        } else if (!selectedContrat && name === 'date_effet' && value) {
            const newExpirationDate = calculateExpirationDate(value, formData.fractionnement);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                date_expiration: newExpirationDate
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            if (!formData.client_id || !formData.compagnie_id || !formData.type_contrat) {
                setFormError('Client, compagnie et type de contrat sont obligatoires');
                setFormLoading(false);
                return;
            }

            // Validation santé
            if (isSanteContract(formData.type_contrat)) {
                if (parseFloat(formData.prime_regulation || 0) > 0 && !formData.evacuation_sanitaire) {
                    setFormError('L\'évacuation sanitaire est obligatoire avec la prime de régulation');
                    setFormLoading(false);
                    return;
                }
            }

            // Mettre à jour client si nécessaire
            if (formData.client_telephone || formData.client_email) {
                const clientUpdate = {};
                if (formData.client_telephone) clientUpdate.telephone = formData.client_telephone;
                if (formData.client_email) clientUpdate.email = formData.client_email;

                const { error: clientError } = await supabase
                    .from('clients')
                    .update(clientUpdate)
                    .eq('id', formData.client_id);

                if (clientError) console.warn('Erreur mise à jour client:', clientError);
            }

            // Préparer les données
            const { client_telephone, client_email, ...contratData } = formData;

            const dataToSubmit = {
                ...contratData,
                prime_ttc: parseFloat(formData.prime_ttc),
                prime_nette: parseFloat(formData.prime_nette),
                montant_accessoire: parseFloat(formData.montant_accessoire || 0),
                fga: parseFloat(formData.fga || 0),
                taxes: parseFloat(formData.taxes || 0),
                taux_commission: parseFloat(formData.taux_commission),
                commission: parseFloat(formData.commission),
                evacuation_sanitaire: formData.evacuation_sanitaire ? parseFloat(formData.evacuation_sanitaire) : null,
                prime_regulation: formData.prime_regulation ? parseFloat(formData.prime_regulation) : null,
            };

            if (selectedContrat) {
                const { error } = await supabase
                    .from('contrats')
                    .update(dataToSubmit)
                    .eq('id', selectedContrat.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('contrats')
                    .insert([dataToSubmit]);
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
            <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">{selectedContrat ? 'Modifier' : 'Nouveau'} contrat</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {formError && (
                        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formError}
                        </div>
                    )}

                    {/* Client et Compagnie */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Client <span className="text-danger-500">*</span></label>
                            <select name="client_id" value={formData.client_id} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
                                <option value="">Sélectionner un client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.nom} {client.prenom} ({client.type_client})
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

                    {/* Type de contrat */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Type de contrat <span className="text-danger-500">*</span></label>
                        <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required disabled={!formData.compagnie_id}>
                            <option value="">Sélectionner un type</option>
                            {typesDisponibles.map(type => (
                                <option key={type} value={type}>
                                    {type.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        {!formData.compagnie_id && (
                            <p className="text-xs text-gray-500 mt-1">⚠️ Sélectionnez d'abord une compagnie</p>
                        )}
                    </div>

                    {/* Immatriculation (pour auto) */}
                    {isAutoContract(formData.type_contrat) && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Immatriculation</label>
                            <input type="text" name="immatriculation" value={formData.immatriculation} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ex: DK-1234-AB" />
                        </div>
                    )}

                    {/* ==================== NOUVELLE SECTION: PRIMES ET CALCULS ==================== */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Primes et Calculs
                        </h3>

                        {/* Ligne 1: Prime TTC */}
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-2">
                                Prime TTC (Toutes Taxes Comprises) <span className="text-danger-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="prime_ttc"
                                    value={formData.prime_ttc}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-lg"
                                    placeholder="Montant total TTC"
                                    required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">FCFA</span>
                            </div>
                        </div>

                        {/* Ligne 2: Accessoire, FGA, Taxes (3 colonnes) */}
                        <div className="grid md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-2">Accessoire</label>
                                <input
                                    type="number"
                                    name="montant_accessoire"
                                    value={formData.montant_accessoire}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-2">FGA</label>
                                <input
                                    type="number"
                                    name="fga"
                                    value={formData.fga}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-2">Taxes</label>
                                <input
                                    type="number"
                                    name="taxes"
                                    value={formData.taxes}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Ligne 3: Prime Nette calculée (lecture seule) */}
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-green-900">Prime Nette (calculée)</p>
                                        <p className="text-xs text-green-700">Prime TTC - Accessoire - FGA - Taxes</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-green-700">
                                    {parseFloat(formData.prime_nette || 0).toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
                                </p>
                            </div>
                        </div>

                        {/* Explication du calcul */}
                        <div className="bg-white border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-gray-600">
                                <span className="font-semibold">📊 Formule:</span> Prime Nette = {parseFloat(formData.prime_ttc || 0).toLocaleString('fr-FR')} - {parseFloat(formData.montant_accessoire || 0).toLocaleString('fr-FR')} - {parseFloat(formData.fga || 0).toLocaleString('fr-FR')} - {parseFloat(formData.taxes || 0).toLocaleString('fr-FR')} = <span className="font-bold text-green-600">{parseFloat(formData.prime_nette || 0).toLocaleString('fr-FR')} FCFA</span>
                            </p>
                        </div>
                    </div>
                    {/* ==================== FIN NOUVELLE SECTION ==================== */}

                    {/* Taux de commission */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Taux de commission
                            {formData.type_contrat && (
                                <span className="text-xs text-primary-600 ml-2">(Automatique selon le type)</span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="taux_commission"
                                value={formData.taux_commission}
                                onChange={handleChange}
                                step="0.001"
                                min="0"
                                max="1"
                                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50"
                                readOnly={!!formData.type_contrat}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                {(parseFloat(formData.taux_commission || 0) * 100).toFixed(2)}%
                            </span>
                        </div>
                    </div>

                    {/* Section spéciale pour contrats santé */}
                    {isSanteContract(formData.type_contrat) && tauxSante && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Options Santé
                            </h3>

                            <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-purple-900 mb-2">
                                        Évacuation sanitaire
                                        <span className="text-xs text-purple-600 ml-1">(Optionnel)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="evacuation_sanitaire"
                                        value={formData.evacuation_sanitaire}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Montant"
                                    />
                                    {formData.evacuation_sanitaire && (
                                        <p className="text-xs text-purple-600 mt-1">
                                            Commission évacuation: {(parseFloat(formData.evacuation_sanitaire) * tauxSante.evacuation_sanitaire).toFixed(2)} FCFA ({(tauxSante.evacuation_sanitaire * 100).toFixed(2)}%)
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-purple-900 mb-2">
                                        Prime de régulation
                                        <span className="text-xs text-orange-600 ml-1">(Cas exceptionnel)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="prime_regulation"
                                        value={formData.prime_regulation}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Montant"
                                    />
                                    {formData.prime_regulation && (
                                        <p className="text-xs text-orange-600 mt-1">
                                            ⚠️ Mode régulation: {(tauxSante.commission_regulation * 100).toFixed(2)}% sur (Prime nette + Régulation)
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Indicateur de cas */}
                            <div className="bg-white border-2 border-green-300 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-green-900 mb-1">Mode de calcul détecté:</p>
                                        {parseFloat(formData.prime_regulation || 0) > 0 ? (
                                            <p className="text-sm text-green-800">
                                                <span className="font-bold text-orange-600">⚡ Cas Exceptionnel:</span><br />
                                                (Prime nette + Prime régulation) × {tauxSante ? (tauxSante.commission_regulation * 100).toFixed(2) : '16'}% + Évacuation × {tauxSante ? (tauxSante.evacuation_sanitaire * 100).toFixed(2) : '8'}%
                                            </p>
                                        ) : parseFloat(formData.evacuation_sanitaire || 0) > 0 ? (
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

                            {parseFloat(formData.prime_regulation || 0) > 0 && !formData.evacuation_sanitaire && (
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

                    {/* Commission calculée */}
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-primary-900">Commission calculée</p>
                                <p className="text-xs text-primary-700 mt-0.5">Calcul automatique basé sur la prime nette</p>
                            </div>
                            <p className="text-3xl font-bold text-primary-600">
                                {parseFloat(formData.commission || 0).toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
                            </p>
                        </div>
                    </div>

                    {/* Dates */}
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

                    {/* Fractionnement et statut */}
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

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Informations complémentaires..." />
                    </div>

                    {/* Boutons */}
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