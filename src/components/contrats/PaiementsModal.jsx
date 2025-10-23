// // // src/components/contrats/PaiementsModal.jsx
// // import { useState, useEffect } from 'react';
// // import { supabase } from '../../lib/supabaseClient';

// // export const PaiementsModal = ({ contrat, onClose }) => {
// //     const [paiements, setPaiements] = useState([]);
// //     const [editingPaiement, setEditingPaiement] = useState(null);
// //     const [paiementForm, setPaiementForm] = useState({
// //         type_paiement: 'client_prime',
// //         montant: '',
// //         date_paiement: new Date().toISOString().split('T')[0],
// //         mode_paiement: '',
// //         notes: ''
// //     });

// //     useEffect(() => {
// //         if (contrat) {
// //             fetchPaiements();
// //         }
// //     }, [contrat]);

// //     const fetchPaiements = async () => {
// //         try {
// //             const { data, error } = await supabase
// //                 .from('paiements')
// //                 .select('*')
// //                 .eq('contrat_id', contrat.id)
// //                 .order('date_paiement', { ascending: false });

// //             if (error) throw error;
// //             setPaiements(data || []);
// //         } catch (error) {
// //             console.error('Erreur paiements:', error);
// //         }
// //     };

// //     const handlePaiementChange = (e) => {
// //         const { name, value } = e.target;
// //         setPaiementForm(prev => ({ ...prev, [name]: value }));
// //     };

// //     const handleAddPaiement = async (e) => {
// //         e.preventDefault();
// //         try {
// //             const { error } = await supabase.from('paiements').insert([{
// //                 contrat_id: contrat.id,
// //                 ...paiementForm,
// //                 montant: parseFloat(paiementForm.montant)
// //             }]);

// //             if (error) throw error;

// //             await fetchPaiements();
// //             setPaiementForm({
// //                 type_paiement: 'client_prime',
// //                 montant: '',
// //                 date_paiement: new Date().toISOString().split('T')[0],
// //                 mode_paiement: '',
// //                 notes: ''
// //             });
// //         } catch (error) {
// //             alert('Erreur: ' + error.message);
// //         }
// //     };

// //     const handleEditPaiement = (paiement) => {
// //         setEditingPaiement(paiement);
// //         setPaiementForm({
// //             type_paiement: paiement.type_paiement,
// //             montant: paiement.montant,
// //             date_paiement: paiement.date_paiement,
// //             mode_paiement: paiement.mode_paiement,
// //             notes: paiement.notes || ''
// //         });
// //     };

// //     const handleUpdatePaiement = async (e) => {
// //         e.preventDefault();
// //         try {
// //             const { error } = await supabase
// //                 .from('paiements')
// //                 .update({
// //                     ...paiementForm,
// //                     montant: parseFloat(paiementForm.montant)
// //                 })
// //                 .eq('id', editingPaiement.id);

// //             if (error) throw error;

// //             await fetchPaiements();
// //             setEditingPaiement(null);
// //             setPaiementForm({
// //                 type_paiement: 'client_prime',
// //                 montant: '',
// //                 date_paiement: new Date().toISOString().split('T')[0],
// //                 mode_paiement: '',
// //                 notes: ''
// //             });
// //         } catch (error) {
// //             alert('Erreur: ' + error.message);
// //         }
// //     };

// //     const handleDeletePaiement = async (paiementId) => {
// //         if (!window.confirm('Supprimer ce paiement ?')) return;
// //         try {
// //             const { error } = await supabase.from('paiements').delete().eq('id', paiementId);
// //             if (error) throw error;
// //             await fetchPaiements();
// //         } catch (error) {
// //             alert('Erreur: ' + error.message);
// //         }
// //     };

// //     const getTotalPaye = (type) => {
// //         return paiements
// //             .filter(p => p.type_paiement === type)
// //             .reduce((sum, p) => sum + parseFloat(p.montant), 0);
// //     };

// //     if (!contrat) return null;

// //     return (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
// //             <div className="bg-white rounded-xl shadow-strong max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
// //                 <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
// //                     <div className="flex justify-between items-center">
// //                         <div>
// //                             <h2 className="text-xl font-bold">💰 Paiements - {contrat.clients?.nom} {contrat.clients?.prenom}</h2>
// //                             <p className="text-sm text-gray-600">{contrat.type_contrat.replace(/_/g, ' ')} - {contrat.compagnies?.nom}</p>
// //                         </div>
// //                         <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
// //                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// //                             </svg>
// //                         </button>
// //                     </div>
// //                 </div>

// //                 <div className="p-6">
// //                     {/* Résumé */}
// //                     <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
// //                         <div>
// //                             <p className="text-xs text-gray-600 mb-1">Prime nette totale</p>
// //                             <p className="text-lg font-bold text-gray-900">{parseFloat(contrat.prime_nette).toLocaleString('fr-FR')} FCFA</p>
// //                             <p className="text-xs text-success-600 mt-1">Payé: {getTotalPaye('client_prime').toLocaleString('fr-FR')} FCFA</p>
// //                             <p className="text-xs text-warning-600">Restant: {(parseFloat(contrat.prime_nette) - getTotalPaye('client_prime')).toLocaleString('fr-FR')} FCFA</p>
// //                         </div>
// //                         <div>
// //                             <p className="text-xs text-gray-600 mb-1">Commission totale</p>
// //                             <p className="text-lg font-bold text-primary-600">{parseFloat(contrat.commission).toLocaleString('fr-FR')} FCFA</p>
// //                             <p className="text-xs text-success-600 mt-1">Reçu: {getTotalPaye('commission_compagnie').toLocaleString('fr-FR')} FCFA</p>
// //                             <p className="text-xs text-warning-600">Restant: {(parseFloat(contrat.commission) - getTotalPaye('commission_compagnie')).toLocaleString('fr-FR')} FCFA</p>
// //                         </div>
// //                     </div>

// //                     {/* Formulaire paiement */}
// //                     <form onSubmit={editingPaiement ? handleUpdatePaiement : handleAddPaiement} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
// //                         <h3 className="font-semibold text-blue-900 mb-3">{editingPaiement ? '✏️ Modifier' : '➕ Ajouter'} un paiement</h3>
// //                         <div className="grid md:grid-cols-5 gap-3">
// //                             <div>
// //                                 <label className="block text-xs font-medium text-blue-900 mb-1">Type</label>
// //                                 <select name="type_paiement" value={paiementForm.type_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required>
// //                                     <option value="client_prime">Prime client</option>
// //                                     <option value="commission_compagnie">Commission</option>
// //                                 </select>
// //                             </div>
// //                             <div>
// //                                 <label className="block text-xs font-medium text-blue-900 mb-1">Montant (FCFA)</label>
// //                                 <input type="number" name="montant" value={paiementForm.montant} onChange={handlePaiementChange} step="0.01" min="0" className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required />
// //                             </div>
// //                             <div>
// //                                 <label className="block text-xs font-medium text-blue-900 mb-1">Date</label>
// //                                 <input type="date" name="date_paiement" value={paiementForm.date_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required />
// //                             </div>
// //                             <div>
// //                                 <label className="block text-xs font-medium text-blue-900 mb-1">Mode</label>
// //                                 <select name="mode_paiement" value={paiementForm.mode_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required>
// //                                     <option value="">Sélectionner</option>
// //                                     <option value="cash">Cash</option>
// //                                     <option value="cheque">Chèque</option>
// //                                     <option value="virement">Virement</option>
// //                                     <option value="mobile_money">Mobile Money</option>
// //                                     <option value="carte_bancaire">Carte</option>
// //                                 </select>
// //                             </div>
// //                             <div className="flex items-end gap-2">
// //                                 <button type="submit" className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors">
// //                                     {editingPaiement ? 'Modifier' : 'Ajouter'}
// //                                 </button>
// //                                 {editingPaiement && (
// //                                     <button type="button" onClick={() => {
// //                                         setEditingPaiement(null);
// //                                         setPaiementForm({
// //                                             type_paiement: 'client_prime',
// //                                             montant: '',
// //                                             date_paiement: new Date().toISOString().split('T')[0],
// //                                             mode_paiement: '',
// //                                             notes: ''
// //                                         });
// //                                     }} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors">
// //                                         Annuler
// //                                     </button>
// //                                 )}
// //                             </div>
// //                         </div>
// //                     </form>

// //                     {/* Liste paiements */}
// //                     <div>
// //                         <h3 className="font-semibold text-gray-900 mb-3">📋 Historique ({paiements.length})</h3>
// //                         {paiements.length === 0 ? (
// //                             <p className="text-gray-500 text-center py-8">Aucun paiement enregistré</p>
// //                         ) : (
// //                             <div className="space-y-2">
// //                                 {paiements.map((paiement) => (
// //                                     <div key={paiement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
// //                                         <div className="flex items-center gap-4 flex-1">
// //                                             <div className={`px-3 py-1 rounded-lg text-xs font-medium ${paiement.type_paiement === 'client_prime' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
// //                                                 {paiement.type_paiement === 'client_prime' ? 'Prime' : 'Commission'}
// //                                             </div>
// //                                             <div className="flex-1">
// //                                                 <p className="font-semibold text-gray-900">{parseFloat(paiement.montant).toLocaleString('fr-FR')} FCFA</p>
// //                                                 <p className="text-xs text-gray-500">
// //                                                     {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')} • {paiement.mode_paiement}
// //                                                 </p>
// //                                             </div>
// //                                         </div>
// //                                         <div className="flex gap-2">
// //                                             <button onClick={() => handleEditPaiement(paiement)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
// //                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
// //                                                 </svg>
// //                                             </button>
// //                                             <button onClick={() => handleDeletePaiement(paiement.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
// //                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
// //                                                 </svg>
// //                                             </button>
// //                                         </div>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };


















// // avec ttc
// src/components/contrats/PaiementsModal.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const PaiementsModal = ({ contrat, onClose }) => {
    const [paiements, setPaiements] = useState([]);
    const [editingPaiement, setEditingPaiement] = useState(null);
    const [paiementForm, setPaiementForm] = useState({
        type_paiement: 'client_prime',
        montant: '',
        date_paiement: new Date().toISOString().split('T')[0],
        mode_paiement: '',
        notes: ''
    });

    useEffect(() => {
        if (contrat) {
            fetchPaiements();
        }
    }, [contrat]);

    const fetchPaiements = async () => {
        try {
            const { data, error } = await supabase
                .from('paiements')
                .select('*')
                .eq('contrat_id', contrat.id)
                .order('date_paiement', { ascending: false });

            if (error) throw error;
            setPaiements(data || []);
        } catch (error) {
            console.error('Erreur paiements:', error);
        }
    };

    const handlePaiementChange = (e) => {
        const { name, value } = e.target;
        setPaiementForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPaiement = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('paiements').insert([{
                contrat_id: contrat.id,
                ...paiementForm,
                montant: parseFloat(paiementForm.montant)
            }]);

            if (error) throw error;

            await fetchPaiements();
            setPaiementForm({
                type_paiement: 'client_prime',
                montant: '',
                date_paiement: new Date().toISOString().split('T')[0],
                mode_paiement: '',
                notes: ''
            });
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    };

    const handleEditPaiement = (paiement) => {
        setEditingPaiement(paiement);
        setPaiementForm({
            type_paiement: paiement.type_paiement,
            montant: paiement.montant,
            date_paiement: paiement.date_paiement,
            mode_paiement: paiement.mode_paiement,
            notes: paiement.notes || ''
        });
    };

    const handleUpdatePaiement = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('paiements')
                .update({
                    ...paiementForm,
                    montant: parseFloat(paiementForm.montant)
                })
                .eq('id', editingPaiement.id);

            if (error) throw error;

            await fetchPaiements();
            setEditingPaiement(null);
            setPaiementForm({
                type_paiement: 'client_prime',
                montant: '',
                date_paiement: new Date().toISOString().split('T')[0],
                mode_paiement: '',
                notes: ''
            });
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    };

    const handleDeletePaiement = async (paiementId) => {
        if (!window.confirm('Supprimer ce paiement ?')) return;
        try {
            const { error } = await supabase.from('paiements').delete().eq('id', paiementId);
            if (error) throw error;
            await fetchPaiements();
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    };

    const getTotalPaye = (type) => {
        return paiements
            .filter(p => p.type_paiement === type)
            .reduce((sum, p) => sum + parseFloat(p.montant), 0);
    };

    if (!contrat) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-strong max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">💰 Paiements - {contrat.clients?.nom} {contrat.clients?.prenom}</h2>
                            <p className="text-sm text-gray-600">{contrat.type_contrat.replace(/_/g, ' ')} - {contrat.compagnies?.nom}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Résumé - ✅ MODIFIÉ: Utilise Prime TTC pour les paiements clients */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Prime TTC totale</p>
                            <p className="text-lg font-bold text-blue-600">
                                {parseFloat(contrat.prime_ttc || 0).toLocaleString('fr-FR')} FCFA
                            </p>
                            <p className="text-xs text-success-600 mt-1">
                                Payé: {getTotalPaye('client_prime').toLocaleString('fr-FR')} FCFA
                            </p>
                            <p className="text-xs text-warning-600">
                                Restant: {(parseFloat(contrat.prime_ttc || 0) - getTotalPaye('client_prime')).toLocaleString('fr-FR')} FCFA
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Commission totale</p>
                            <p className="text-lg font-bold text-primary-600">{parseFloat(contrat.commission).toLocaleString('fr-FR')} FCFA</p>
                            <p className="text-xs text-success-600 mt-1">Reçu: {getTotalPaye('commission_compagnie').toLocaleString('fr-FR')} FCFA</p>
                            <p className="text-xs text-warning-600">Restant: {(parseFloat(contrat.commission) - getTotalPaye('commission_compagnie')).toLocaleString('fr-FR')} FCFA</p>
                        </div>
                    </div>

                    {/* Formulaire paiement */}
                    <form onSubmit={editingPaiement ? handleUpdatePaiement : handleAddPaiement} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-3">{editingPaiement ? '✏️ Modifier' : '➕ Ajouter'} un paiement</h3>
                        <div className="grid md:grid-cols-5 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-blue-900 mb-1">Type</label>
                                <select name="type_paiement" value={paiementForm.type_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required>
                                    <option value="client_prime">Prime client</option>
                                    <option value="commission_compagnie">Commission</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-blue-900 mb-1">Montant (FCFA)</label>
                                <input type="number" name="montant" value={paiementForm.montant} onChange={handlePaiementChange} step="0.01" min="0" className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-blue-900 mb-1">Date</label>
                                <input type="date" name="date_paiement" value={paiementForm.date_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-blue-900 mb-1">Mode</label>
                                <select name="mode_paiement" value={paiementForm.mode_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required>
                                    <option value="">Sélectionner</option>
                                    <option value="cash">Cash</option>
                                    <option value="cheque">Chèque</option>
                                    <option value="virement">Virement</option>
                                    <option value="mobile_money">Mobile Money</option>
                                    <option value="carte_bancaire">Carte</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <button type="submit" className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors">
                                    {editingPaiement ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingPaiement && (
                                    <button type="button" onClick={() => {
                                        setEditingPaiement(null);
                                        setPaiementForm({
                                            type_paiement: 'client_prime',
                                            montant: '',
                                            date_paiement: new Date().toISOString().split('T')[0],
                                            mode_paiement: '',
                                            notes: ''
                                        });
                                    }} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors">
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Liste paiements */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">📋 Historique ({paiements.length})</h3>
                        {paiements.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Aucun paiement enregistré</p>
                        ) : (
                            <div className="space-y-2">
                                {paiements.map((paiement) => (
                                    <div key={paiement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${paiement.type_paiement === 'client_prime' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {paiement.type_paiement === 'client_prime' ? 'Prime' : 'Commission'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{parseFloat(paiement.montant).toLocaleString('fr-FR')} FCFA</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')} • {paiement.mode_paiement}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditPaiement(paiement)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDeletePaiement(paiement.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};