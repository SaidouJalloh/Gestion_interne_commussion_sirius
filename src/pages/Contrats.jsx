
// // new code avec gestion de fraction
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';

// export default function Contrats() {
//     const [contrats, setContrats] = useState([]);
//     const [clients, setClients] = useState([]);
//     const [compagnies, setCompagnies] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterStatut, setFilterStatut] = useState('all');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedContrat, setSelectedContrat] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const [paiementsModal, setPaiementsModal] = useState(null);
//     const [paiements, setPaiements] = useState([]);
//     const [paiementForm, setPaiementForm] = useState({
//         type_paiement: 'client_prime',
//         montant: '',
//         date_paiement: '',
//         mode_paiement: '',
//         notes: ''
//     });
//     const [editingPaiement, setEditingPaiement] = useState(null);
//     const { profile } = useAuth();

//     const [formData, setFormData] = useState({
//         client_id: '',
//         compagnie_id: '',
//         type_contrat: '',
//         prime_nette: '',
//         montant_accessoire: '0',
//         taux_commission: '',
//         commission: '0',
//         date_effet: '',
//         date_expiration: '',
//         fractionnement: 'annuel',
//         statut: 'actif',
//         notes: '',
//         client_telephone: '',
//         client_email: '',
//         evacuation_sanitaire: '',
//         prime_regulation: '',
//     });

//     const [typesDisponibles, setTypesDisponibles] = useState([]);
//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');
//     const [tauxSante, setTauxSante] = useState(null);

//     // ⭐ FONCTION HELPER : Vérifier si c'est un contrat santé
//     const isSanteContract = (typeContrat) => {
//         return typeContrat === 'SANTE_INDIVIDUELLE' || typeContrat === 'SANTE_FAMILIALE';
//     };

//     // ⭐ NOUVELLE FONCTION : Calculer la date d'expiration automatiquement
//     const calculateExpirationDate = (dateEffet, fractionnement) => {
//         if (!dateEffet) return '';

//         const date = new Date(dateEffet);

//         switch (fractionnement) {
//             case 'mensuel':
//                 date.setMonth(date.getMonth() + 1);
//                 break;
//             case 'trimestriel':
//                 date.setMonth(date.getMonth() + 3);
//                 break;
//             case 'semestriel':
//                 date.setMonth(date.getMonth() + 6);
//                 break;
//             case 'annuel':
//             default:
//                 date.setFullYear(date.getFullYear() + 1);
//                 break;
//         }

//         // Format YYYY-MM-DD pour l'input date
//         return date.toISOString().split('T')[0];
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     useEffect(() => {
//         if (paiementsModal) {
//             fetchPaiementsContrat(paiementsModal.id);
//         }
//     }, [paiementsModal]);

//     // ⭐ NOUVEAU USEEFFECT : Calcul automatique de la date d'expiration
//     useEffect(() => {
//         // Ne pas calculer automatiquement si on est en mode édition
//         // ou si la date d'effet n'est pas renseignée
//         if (!selectedContrat && formData.date_effet && formData.fractionnement) {
//             const newExpirationDate = calculateExpirationDate(formData.date_effet, formData.fractionnement);
//             setFormData(prev => ({
//                 ...prev,
//                 date_expiration: newExpirationDate
//             }));
//         }
//     }, [formData.date_effet, formData.fractionnement, selectedContrat]);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             const [contratsRes, clientsRes, compagniesRes] = await Promise.all([
//                 supabase.from('contrats').select(`
//                     *,
//                     clients(id, nom, prenom, type_client, telephone, email),
//                     compagnies(id, nom, sigle, logo_url)
//                 `).order('created_at', { ascending: false }),
//                 supabase.from('clients').select('id, nom, prenom, type_client, telephone, email').order('nom'),
//                 supabase.from('compagnies').select('*').eq('actif', true).order('nom')
//             ]);

//             if (contratsRes.error) throw contratsRes.error;
//             if (clientsRes.error) throw clientsRes.error;
//             if (compagniesRes.error) throw compagniesRes.error;

//             setContrats(contratsRes.data || []);
//             setClients(clientsRes.data || []);
//             setCompagnies(compagniesRes.data || []);
//         } catch (error) {
//             console.error('Erreur:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchPaiementsContrat = async (contratId) => {
//         try {
//             const { data, error } = await supabase
//                 .from('paiements')
//                 .select('*')
//                 .eq('contrat_id', contratId)
//                 .order('date_paiement', { ascending: false });

//             if (error) throw error;
//             setPaiements(data || []);
//         } catch (error) {
//             console.error('Erreur paiements:', error);
//         }
//     };

//     const openPaiementsModal = (contrat) => {
//         setPaiementsModal(contrat);
//         setPaiementForm({
//             type_paiement: 'client_prime',
//             montant: '',
//             date_paiement: new Date().toISOString().split('T')[0],
//             mode_paiement: '',
//             notes: ''
//         });
//         setEditingPaiement(null);
//     };

//     const handlePaiementChange = (e) => {
//         const { name, value } = e.target;
//         setPaiementForm(prev => ({ ...prev, [name]: value }));
//     };

//     const handleAddPaiement = async (e) => {
//         e.preventDefault();
//         try {
//             const { error } = await supabase.from('paiements').insert([{
//                 contrat_id: paiementsModal.id,
//                 ...paiementForm,
//                 montant: parseFloat(paiementForm.montant)
//             }]);

//             if (error) throw error;

//             await fetchPaiementsContrat(paiementsModal.id);
//             setPaiementForm({
//                 type_paiement: 'client_prime',
//                 montant: '',
//                 date_paiement: new Date().toISOString().split('T')[0],
//                 mode_paiement: '',
//                 notes: ''
//             });
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleEditPaiement = (paiement) => {
//         setEditingPaiement(paiement);
//         setPaiementForm({
//             type_paiement: paiement.type_paiement,
//             montant: paiement.montant,
//             date_paiement: paiement.date_paiement,
//             mode_paiement: paiement.mode_paiement,
//             notes: paiement.notes || ''
//         });
//     };

//     const handleUpdatePaiement = async (e) => {
//         e.preventDefault();
//         try {
//             const { error } = await supabase
//                 .from('paiements')
//                 .update({
//                     ...paiementForm,
//                     montant: parseFloat(paiementForm.montant)
//                 })
//                 .eq('id', editingPaiement.id);

//             if (error) throw error;

//             await fetchPaiementsContrat(paiementsModal.id);
//             setEditingPaiement(null);
//             setPaiementForm({
//                 type_paiement: 'client_prime',
//                 montant: '',
//                 date_paiement: new Date().toISOString().split('T')[0],
//                 mode_paiement: '',
//                 notes: ''
//             });
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleDeletePaiement = async (paiementId) => {
//         if (!window.confirm('Supprimer ce paiement ?')) return;
//         try {
//             const { error } = await supabase.from('paiements').delete().eq('id', paiementId);
//             if (error) throw error;
//             await fetchPaiementsContrat(paiementsModal.id);
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const getTotalPaye = (type) => {
//         return paiements
//             .filter(p => p.type_paiement === type)
//             .reduce((sum, p) => sum + parseFloat(p.montant), 0);
//     };

//     // ⭐ Récupérer les types disponibles quand on change de compagnie
//     useEffect(() => {
//         if (formData.compagnie_id) {
//             const compagnie = compagnies.find(c => c.id === formData.compagnie_id);
//             if (compagnie?.taux_commissions) {
//                 const types = Object.keys(compagnie.taux_commissions);
//                 setTypesDisponibles(types);
//             } else {
//                 setTypesDisponibles([]);
//             }
//         } else {
//             setTypesDisponibles([]);
//             setTauxSante(null);
//         }
//     }, [formData.compagnie_id, compagnies]);

//     // ⭐ Charger les taux spécifiques quand on sélectionne un type
//     useEffect(() => {
//         if (formData.compagnie_id && formData.type_contrat) {
//             const compagnie = compagnies.find(c => c.id === formData.compagnie_id);

//             if (compagnie?.taux_commissions?.[formData.type_contrat]) {
//                 const tauxConfig = compagnie.taux_commissions[formData.type_contrat];

//                 if (isSanteContract(formData.type_contrat) && typeof tauxConfig === 'object') {
//                     setTauxSante({
//                         commission_base: tauxConfig.commission_base || 0.16,
//                         evacuation_sanitaire: tauxConfig.evacuation_sanitaire || 0.08,
//                         commission_regulation: tauxConfig.commission_regulation || 0.16
//                     });
//                     setFormData(prev => ({
//                         ...prev,
//                         taux_commission: tauxConfig.commission_base || 0.16
//                     }));
//                 } else {
//                     setTauxSante(null);
//                     setFormData(prev => ({
//                         ...prev,
//                         taux_commission: tauxConfig
//                     }));
//                 }
//             }
//         }
//     }, [formData.type_contrat, formData.compagnie_id, compagnies]);

//     // ⭐ CALCUL DE COMMISSION OPTIMISÉ
//     useEffect(() => {
//         if (!formData.prime_nette || !formData.taux_commission) {
//             return;
//         }

//         const primeNette = parseFloat(formData.prime_nette) || 0;
//         const montantAccessoire = parseFloat(formData.montant_accessoire) || 0;
//         let commission = 0;

//         if (isSanteContract(formData.type_contrat) && tauxSante) {
//             const evacuationSanitaire = parseFloat(formData.evacuation_sanitaire) || 0;
//             const primeRegulation = parseFloat(formData.prime_regulation) || 0;

//             if (primeRegulation > 0) {
//                 // CAS EXCEPTIONNEL
//                 commission = ((primeNette + primeRegulation) * tauxSante.commission_regulation)
//                     + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
//             } else if (evacuationSanitaire > 0) {
//                 // CAS NORMAL
//                 commission = (primeNette * tauxSante.commission_base)
//                     + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
//             } else {
//                 // CAS SANS ÉVACUATION
//                 commission = primeNette * tauxSante.commission_base;
//             }
//         } else {
//             // CALCUL NORMAL AUTRES TYPES
//             const tauxCommission = parseFloat(formData.taux_commission) || 0;
//             commission = (primeNette * tauxCommission) + montantAccessoire;
//         }

//         setFormData(prev => ({ ...prev, commission: commission.toFixed(2) }));
//     }, [
//         formData.prime_nette,
//         formData.taux_commission,
//         formData.montant_accessoire,
//         formData.type_contrat,
//         formData.evacuation_sanitaire,
//         formData.prime_regulation,
//         tauxSante
//     ]);

//     // Mettre à jour les champs client
//     useEffect(() => {
//         if (formData.client_id) {
//             const selectedClient = clients.find(c => c.id === formData.client_id);
//             if (selectedClient) {
//                 setFormData(prev => ({
//                     ...prev,
//                     client_telephone: selectedClient.telephone || '',
//                     client_email: selectedClient.email || '',
//                 }));
//             }
//         }
//     }, [formData.client_id, clients]);

//     const filteredContrats = contrats.filter(contrat => {
//         const matchSearch =
//             contrat.numero_police?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             contrat.clients?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             contrat.clients?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             contrat.compagnies?.nom.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchStatut = filterStatut === 'all' || contrat.statut === filterStatut;
//         return matchSearch && matchStatut;
//     });

//     const resetForm = () => {
//         setFormData({
//             client_id: '',
//             compagnie_id: '',
//             type_contrat: '',
//             prime_nette: '',
//             montant_accessoire: '0',
//             taux_commission: '',
//             commission: '0',
//             date_effet: '',
//             date_expiration: '',
//             fractionnement: 'annuel',
//             statut: 'actif',
//             notes: '',
//             client_telephone: '',
//             client_email: '',
//             evacuation_sanitaire: '',
//             prime_regulation: '',
//         });
//         setTypesDisponibles([]);
//         setTauxSante(null);
//         setFormError('');
//     };

//     const handleAdd = () => {
//         resetForm();
//         setSelectedContrat(null);
//         setIsModalOpen(true);
//     };

//     const handleEdit = (contrat) => {
//         setSelectedContrat(contrat);
//         setFormData({
//             client_id: contrat.client_id || '',
//             compagnie_id: contrat.compagnie_id || '',
//             type_contrat: contrat.type_contrat || '',
//             prime_nette: contrat.prime_nette || '',
//             montant_accessoire: contrat.montant_accessoire || '0',
//             taux_commission: contrat.taux_commission || '',
//             commission: contrat.commission || '0',
//             date_effet: contrat.date_effet || '',
//             date_expiration: contrat.date_expiration || '',
//             fractionnement: contrat.fractionnement || 'annuel',
//             statut: contrat.statut || 'actif',
//             notes: contrat.notes || '',
//             client_telephone: '',
//             client_email: '',
//             evacuation_sanitaire: contrat.evacuation_sanitaire || '',
//             prime_regulation: contrat.prime_regulation || '',
//         });
//         setFormError('');
//         setIsModalOpen(true);
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));

//         // ⭐ MODIFICATION : Si on change le fractionnement et qu'on a une date d'effet, recalculer la date d'expiration
//         // Mais uniquement en mode création (pas en édition)
//         if (!selectedContrat && name === 'fractionnement' && formData.date_effet) {
//             const newExpirationDate = calculateExpirationDate(formData.date_effet, value);
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: value,
//                 date_expiration: newExpirationDate
//             }));
//         } else if (!selectedContrat && name === 'date_effet' && value) {
//             // Si on change la date d'effet, recalculer avec le fractionnement actuel
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

//             await fetchData();
//             setIsModalOpen(false);
//             resetForm();
//         } catch (err) {
//             setFormError(err.message || 'Une erreur est survenue');
//         } finally {
//             setFormLoading(false);
//         }
//     };

//     const handleDelete = async (contratId) => {
//         try {
//             const { error } = await supabase.from('contrats').delete().eq('id', contratId);
//             if (error) throw error;
//             await fetchData();
//             setDeleteConfirm(null);
//         } catch (error) {
//             alert('Erreur lors de la suppression');
//         }
//     };

//     const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

//     const getStatutBadge = (statut) => {
//         const styles = {
//             actif: 'bg-success-100 text-success-700',
//             expiré: 'bg-gray-100 text-gray-700',
//             annulé: 'bg-danger-100 text-danger-700',
//         };
//         return styles[statut] || 'bg-gray-100 text-gray-700';
//     };

//     // ⭐ RENDU COMMENCE ICI - Suite dans PARTIE 2
//     return (
//         <>
//             <div className="mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900">Gestion des Contrats</h1>
//                         <p className="text-gray-600 mt-1">{filteredContrats.length} contrat{filteredContrats.length > 1 ? 's' : ''}</p>
//                     </div>
//                     <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                         </svg>
//                         Nouveau contrat
//                     </button>
//                 </div>
//             </div>

//             {/* Barre de recherche et filtres */}
//             <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
//                 <div className="flex flex-col md:flex-row gap-4">
//                     <div className="flex-1 relative">
//                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                         </svg>
//                         <input type="text" placeholder="Rechercher un contrat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                     </div>
//                     <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
//                         <option value="all">Tous les statuts</option>
//                         <option value="actif">Actifs</option>
//                         <option value="expiré">Expirés</option>
//                         <option value="annulé">Annulés</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Tableau des contrats */}
//             <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//                 {loading ? (
//                     <div className="flex items-center justify-center py-12">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                     </div>
//                 ) : filteredContrats.length === 0 ? (
//                     <div className="text-center py-12">
//                         <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                         <p className="text-gray-500 text-lg font-medium">Aucun contrat trouvé</p>
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-gray-50 border-b">
//                                 <tr>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Compagnie</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Taux</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
//                                     <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y">
//                                 {filteredContrats.map((contrat) => (
//                                     <tr key={contrat.id} className="hover:bg-gray-50">
//                                         <td className="px-6 py-4">
//                                             <p className="font-medium text-gray-900">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                             <span className={`text-xs px-2 py-0.5 rounded-full ${contrat.clients?.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                                 {contrat.clients?.type_client === 'particulier' ? 'Particulier' : 'Entreprise'}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-2">
//                                                 {contrat.compagnies?.logo_url && (
//                                                     <img src={contrat.compagnies.logo_url} alt={contrat.compagnies.nom} className="w-8 h-8 rounded object-cover" onError={(e) => {
//                                                         e.target.style.display = 'none';
//                                                     }} />
//                                                 )}
//                                                 <div>
//                                                     <p className="font-medium text-gray-900">{contrat.compagnies?.nom}</p>
//                                                     <p className="text-xs text-gray-500">{contrat.compagnies?.sigle}</p>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <p className="text-sm font-medium text-gray-900">{contrat.type_contrat.replace(/_/g, ' ')}</p>
//                                             <p className="text-xs text-gray-500">{new Date(contrat.date_effet).toLocaleDateString('fr-FR')}</p>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="px-2.5 py-1 bg-accent-100 text-accent-700 rounded-lg text-sm font-semibold">
//                                                 {(parseFloat(contrat.taux_commission) * 100).toFixed(2)}%
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm font-semibold text-gray-900">{parseFloat(contrat.prime_nette).toLocaleString('fr-FR')} FCFA</td>
//                                         <td className="px-6 py-4 text-sm font-semibold text-primary-600">{parseFloat(contrat.commission).toLocaleString('fr-FR')} FCFA</td>
//                                         <td className="px-6 py-4">
//                                             <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatutBadge(contrat.statut)}`}>
//                                                 {contrat.statut}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex justify-end gap-2">
//                                                 <button onClick={() => openPaiementsModal(contrat)} className="p-2 text-success-600 hover:bg-success-50 rounded-lg" title="Gérer paiements">
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                                                     </svg>
//                                                 </button>
//                                                 <button onClick={() => handleEdit(contrat)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Modifier">
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                     </svg>
//                                                 </button>
//                                                 {canDelete && (
//                                                     <button onClick={() => setDeleteConfirm(contrat.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
//                                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                         </svg>
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>

//             {/* ⭐ MODAL D'AJOUT/ÉDITION - OPTIMISÉ */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
//                             <h2 className="text-xl font-bold">{selectedContrat ? 'Modifier' : 'Nouveau'} contrat</h2>
//                             <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                             {formError && (
//                                 <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                     {formError}
//                                 </div>
//                             )}

//                             {/* Client et Compagnie */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Client <span className="text-danger-500">*</span></label>
//                                     <select name="client_id" value={formData.client_id} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
//                                         <option value="">Sélectionner un client</option>
//                                         {clients.map(client => (
//                                             <option key={client.id} value={client.id}>
//                                                 {client.nom} {client.prenom} ({client.type_client})
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Compagnie <span className="text-danger-500">*</span></label>
//                                     <select name="compagnie_id" value={formData.compagnie_id} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
//                                         <option value="">Sélectionner une compagnie</option>
//                                         {compagnies.map(compagnie => (
//                                             <option key={compagnie.id} value={compagnie.id}>
//                                                 {compagnie.nom}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>

//                             {/* Contacts client */}
//                             {formData.client_id && (
//                                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                                     <p className="text-sm font-medium text-blue-900 mb-3">📞 Contacts pour notifications</p>
//                                     <div className="grid md:grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-xs font-medium text-blue-900 mb-1">Téléphone</label>
//                                             <input
//                                                 type="tel"
//                                                 name="client_telephone"
//                                                 value={formData.client_telephone || ''}
//                                                 onChange={handleChange}
//                                                 className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
//                                                 placeholder="+221 77 123 45 67"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs font-medium text-blue-900 mb-1">Email</label>
//                                             <input
//                                                 type="email"
//                                                 name="client_email"
//                                                 value={formData.client_email || ''}
//                                                 onChange={handleChange}
//                                                 className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
//                                                 placeholder="client@email.com"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Type et taux */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Type de contrat <span className="text-danger-500">*</span></label>
//                                     <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} disabled={!formData.compagnie_id} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100" required>
//                                         <option value="">Sélectionner un type</option>
//                                         {typesDisponibles.map(type => (
//                                             <option key={type} value={type}>
//                                                 {type.replace(/_/g, ' ')}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Taux de commission</label>
//                                     <div className="relative">
//                                         <input
//                                             type="text"
//                                             value={formData.taux_commission ? `${(parseFloat(formData.taux_commission) * 100).toFixed(2)} %` : ''}
//                                             placeholder="Sélectionnez d'abord un type"
//                                             className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold outline-none"
//                                             readOnly
//                                         />
//                                         {formData.taux_commission && (
//                                             <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                                                 <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                 </svg>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Prime nette et accessoire */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Prime nette (FCFA) <span className="text-danger-500">*</span></label>
//                                     <input type="number" name="prime_nette" value={formData.prime_nette} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                                 {!isSanteContract(formData.type_contrat) && (
//                                     <div>
//                                         <label className="block text-sm font-medium mb-2">Montant accessoire (FCFA)</label>
//                                         <input type="number" name="montant_accessoire" value={formData.montant_accessoire} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0" />
//                                     </div>
//                                 )}
//                             </div>

//                             {/* ⭐ CHAMPS SANTÉ */}
//                             {isSanteContract(formData.type_contrat) && (
//                                 <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5 space-y-4">
//                                     <div className="flex items-center gap-2 mb-3">
//                                         <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
//                                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                                             </svg>
//                                         </div>
//                                         <div>
//                                             <p className="text-sm font-bold text-green-900">Assurance Santé</p>
//                                             <p className="text-xs text-green-700">Configuration spécifique</p>
//                                         </div>
//                                     </div>

//                                     <div className="grid md:grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-green-900 mb-2">
//                                                 Évacuation Sanitaire (FCFA)
//                                                 {parseFloat(formData.prime_regulation || 0) > 0 && <span className="text-danger-500 ml-1">*</span>}
//                                             </label>
//                                             <input
//                                                 type="number"
//                                                 name="evacuation_sanitaire"
//                                                 value={formData.evacuation_sanitaire}
//                                                 onChange={handleChange}
//                                                 step="0.01"
//                                                 min="0"
//                                                 className="w-full px-4 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//                                                 placeholder="Montant évacuation"
//                                                 required={parseFloat(formData.prime_regulation || 0) > 0}
//                                             />
//                                             {tauxSante && (
//                                                 <p className="text-xs text-green-700 mt-1 font-medium">
//                                                     Taux: {(tauxSante.evacuation_sanitaire * 100).toFixed(2)}%
//                                                 </p>
//                                             )}
//                                         </div>

//                                         <div>
//                                             <label className="block text-sm font-medium text-green-900 mb-2">
//                                                 Prime de Régulation (FCFA)
//                                                 <span className="text-xs text-orange-700 ml-2 font-normal">(Cas exceptionnel)</span>
//                                             </label>
//                                             <input
//                                                 type="number"
//                                                 name="prime_regulation"
//                                                 value={formData.prime_regulation}
//                                                 onChange={handleChange}
//                                                 step="0.01"
//                                                 min="0"
//                                                 className="w-full px-4 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//                                                 placeholder="Prime de régulation"
//                                             />
//                                             {tauxSante && (
//                                                 <p className="text-xs text-green-700 mt-1 font-medium">
//                                                     Taux: {(tauxSante.commission_regulation * 100).toFixed(2)}%
//                                                 </p>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* ⭐ INDICATEUR DE CAS */}
//                                     <div className="bg-white border-2 border-green-300 rounded-lg p-4">
//                                         <div className="flex items-start gap-3">
//                                             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                                 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                                                 </svg>
//                                             </div>
//                                             <div className="flex-1">
//                                                 <p className="text-xs font-semibold text-green-900 mb-1">Mode de calcul détecté:</p>
//                                                 {parseFloat(formData.prime_regulation || 0) > 0 ? (
//                                                     <p className="text-sm text-green-800">
//                                                         <span className="font-bold text-orange-600">⚡ Cas Exceptionnel:</span><br />
//                                                         (Prime nette + Prime régulation) × {tauxSante ? (tauxSante.commission_regulation * 100).toFixed(2) : '16'}% + Évacuation × {tauxSante ? (tauxSante.evacuation_sanitaire * 100).toFixed(2) : '8'}%
//                                                     </p>
//                                                 ) : parseFloat(formData.evacuation_sanitaire || 0) > 0 ? (
//                                                     <p className="text-sm text-green-800">
//                                                         <span className="font-bold text-green-600">✓ Cas Normal:</span><br />
//                                                         Prime nette × {tauxSante ? (tauxSante.commission_base * 100).toFixed(2) : '16'}% + Évacuation × {tauxSante ? (tauxSante.evacuation_sanitaire * 100).toFixed(2) : '8'}%
//                                                     </p>
//                                                 ) : (
//                                                     <p className="text-sm text-green-800">
//                                                         <span className="font-bold text-blue-600">○ Sans évacuation:</span><br />
//                                                         Prime nette × {tauxSante ? (tauxSante.commission_base * 100).toFixed(2) : '16'}%
//                                                     </p>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {parseFloat(formData.prime_regulation || 0) > 0 && !formData.evacuation_sanitaire && (
//                                         <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2">
//                                             <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                             </svg>
//                                             <p className="text-xs text-red-800 font-medium">
//                                                 L'évacuation sanitaire est obligatoire avec la prime de régulation
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* Commission calculée */}
//                             <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-4">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-primary-900">Commission calculée</p>
//                                         <p className="text-xs text-primary-700 mt-0.5">Calcul automatique</p>
//                                     </div>
//                                     <p className="text-3xl font-bold text-primary-600">{parseFloat(formData.commission || 0).toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
//                                 </div>
//                             </div>

//                             {/* Dates avec indicateur de calcul automatique */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Date d'effet <span className="text-danger-500">*</span></label>
//                                     <input type="date" name="date_effet" value={formData.date_effet} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">
//                                         Date d'expiration <span className="text-danger-500">*</span>
//                                         {!selectedContrat && formData.date_effet && (
//                                             <span className="text-xs text-primary-600 ml-2">(Calculée automatiquement)</span>
//                                         )}
//                                     </label>
//                                     <input type="date" name="date_expiration" value={formData.date_expiration} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                             </div>

//                             {/* Fractionnement et statut */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">
//                                         Fractionnement
//                                         {!selectedContrat && (
//                                             <span className="text-xs text-gray-500 ml-2">(Détermine la durée)</span>
//                                         )}
//                                     </label>
//                                     <select name="fractionnement" value={formData.fractionnement} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
//                                         <option value="mensuel">Mensuel (1 mois)</option>
//                                         <option value="trimestriel">Trimestriel (3 mois)</option>
//                                         <option value="semestriel">Semestriel (6 mois)</option>
//                                         <option value="annuel">Annuel (12 mois)</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Statut</label>
//                                     <select name="statut" value={formData.statut} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
//                                         <option value="actif">Actif</option>
//                                         <option value="expiré">Expiré</option>
//                                         <option value="annulé">Annulé</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             {/* Notes */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Notes</label>
//                                 <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Informations complémentaires..." />
//                             </div>

//                             {/* Boutons */}
//                             <div className="flex gap-3 pt-4 border-t">
//                                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors" disabled={formLoading}>
//                                     Annuler
//                                 </button>
//                                 <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
//                                     {formLoading ? (
//                                         <>
//                                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                             Enregistrement...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                             </svg>
//                                             {selectedContrat ? 'Mettre à jour' : 'Créer le contrat'}
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* ⭐ MODAL DE GESTION DES PAIEMENTS */}
//             {paiementsModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
//                             <div className="flex justify-between items-center">
//                                 <div>
//                                     <h2 className="text-xl font-bold">💰 Paiements - {paiementsModal.clients?.nom} {paiementsModal.clients?.prenom}</h2>
//                                     <p className="text-sm text-gray-600">{paiementsModal.type_contrat.replace(/_/g, ' ')} - {paiementsModal.compagnies?.nom}</p>
//                                 </div>
//                                 <button onClick={() => setPaiementsModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="p-6">
//                             {/* Résumé */}
//                             <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
//                                 <div>
//                                     <p className="text-xs text-gray-600 mb-1">Prime nette totale</p>
//                                     <p className="text-lg font-bold text-gray-900">{parseFloat(paiementsModal.prime_nette).toLocaleString('fr-FR')} FCFA</p>
//                                     <p className="text-xs text-success-600 mt-1">Payé: {getTotalPaye('client_prime').toLocaleString('fr-FR')} FCFA</p>
//                                     <p className="text-xs text-warning-600">Restant: {(parseFloat(paiementsModal.prime_nette) - getTotalPaye('client_prime')).toLocaleString('fr-FR')} FCFA</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-gray-600 mb-1">Commission totale</p>
//                                     <p className="text-lg font-bold text-primary-600">{parseFloat(paiementsModal.commission).toLocaleString('fr-FR')} FCFA</p>
//                                     <p className="text-xs text-success-600 mt-1">Reçu: {getTotalPaye('commission_compagnie').toLocaleString('fr-FR')} FCFA</p>
//                                     <p className="text-xs text-warning-600">Restant: {(parseFloat(paiementsModal.commission) - getTotalPaye('commission_compagnie')).toLocaleString('fr-FR')} FCFA</p>
//                                 </div>
//                             </div>

//                             {/* Formulaire paiement */}
//                             <form onSubmit={editingPaiement ? handleUpdatePaiement : handleAddPaiement} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//                                 <h3 className="font-semibold text-blue-900 mb-3">{editingPaiement ? '✏️ Modifier' : '➕ Ajouter'} un paiement</h3>
//                                 <div className="grid md:grid-cols-5 gap-3">
//                                     <div>
//                                         <label className="block text-xs font-medium text-blue-900 mb-1">Type</label>
//                                         <select name="type_paiement" value={paiementForm.type_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required>
//                                             <option value="client_prime">Prime client</option>
//                                             <option value="commission_compagnie">Commission</option>
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-medium text-blue-900 mb-1">Montant (FCFA)</label>
//                                         <input type="number" name="montant" value={paiementForm.montant} onChange={handlePaiementChange} step="0.01" min="0" className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required />
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-medium text-blue-900 mb-1">Date</label>
//                                         <input type="date" name="date_paiement" value={paiementForm.date_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required />
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-medium text-blue-900 mb-1">Mode</label>
//                                         <select name="mode_paiement" value={paiementForm.mode_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required>
//                                             <option value="">Sélectionner</option>
//                                             <option value="cash">Cash</option>
//                                             <option value="cheque">Chèque</option>
//                                             <option value="virement">Virement</option>
//                                             <option value="mobile_money">Mobile Money</option>
//                                             <option value="carte_bancaire">Carte</option>
//                                         </select>
//                                     </div>
//                                     <div className="flex items-end gap-2">
//                                         <button type="submit" className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors">
//                                             {editingPaiement ? 'Modifier' : 'Ajouter'}
//                                         </button>
//                                         {editingPaiement && (
//                                             <button type="button" onClick={() => {
//                                                 setEditingPaiement(null);
//                                                 setPaiementForm({
//                                                     type_paiement: 'client_prime',
//                                                     montant: '',
//                                                     date_paiement: new Date().toISOString().split('T')[0],
//                                                     mode_paiement: '',
//                                                     notes: ''
//                                                 });
//                                             }} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors">
//                                                 Annuler
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>
//                             </form>

//                             {/* Liste paiements */}
//                             <div>
//                                 <h3 className="font-semibold text-gray-900 mb-3">📋 Historique ({paiements.length})</h3>
//                                 {paiements.length === 0 ? (
//                                     <p className="text-gray-500 text-center py-8">Aucun paiement enregistré</p>
//                                 ) : (
//                                     <div className="space-y-2">
//                                         {paiements.map((paiement) => (
//                                             <div key={paiement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                                                 <div className="flex items-center gap-4 flex-1">
//                                                     <div className={`px-3 py-1 rounded-lg text-xs font-medium ${paiement.type_paiement === 'client_prime' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                                         {paiement.type_paiement === 'client_prime' ? 'Prime' : 'Commission'}
//                                                     </div>
//                                                     <div className="flex-1">
//                                                         <p className="font-semibold text-gray-900">{parseFloat(paiement.montant).toLocaleString('fr-FR')} FCFA</p>
//                                                         <p className="text-xs text-gray-500">
//                                                             {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')} • {paiement.mode_paiement}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex gap-2">
//                                                     <button onClick={() => handleEditPaiement(paiement)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
//                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                         </svg>
//                                                     </button>
//                                                     <button onClick={() => handleDeletePaiement(paiement.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
//                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                         </svg>
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ⭐ MODAL CONFIRMATION SUPPRESSION */}
//             {deleteConfirm && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-md w-full animate-scale-in">
//                         <div className="p-6">
//                             <div className="flex items-center gap-4 mb-4">
//                                 <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                     <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                     </svg>
//                                 </div>
//                                 <div>
//                                     <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
//                                     <p className="text-sm text-gray-600 mt-1">Cette action est irréversible</p>
//                                 </div>
//                             </div>
//                             <p className="text-gray-700 mb-6">
//                                 Êtes-vous sûr de vouloir supprimer ce contrat ? Tous les paiements associés seront également supprimés.
//                             </p>
//                             <div className="flex gap-3">
//                                 <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors">
//                                     Annuler
//                                 </button>
//                                 <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 font-medium transition-colors">
//                                     Supprimer
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }
















// same code for date d'echeance j-1

// // // new code avec gestion de fraction
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';

// export default function Contrats() {
//     const [contrats, setContrats] = useState([]);
//     const [clients, setClients] = useState([]);
//     const [compagnies, setCompagnies] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterStatut, setFilterStatut] = useState('all');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedContrat, setSelectedContrat] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const [paiementsModal, setPaiementsModal] = useState(null);
//     const [paiements, setPaiements] = useState([]);
//     const [paiementForm, setPaiementForm] = useState({
//         type_paiement: 'client_prime',
//         montant: '',
//         date_paiement: '',
//         mode_paiement: '',
//         notes: ''
//     });
//     const [editingPaiement, setEditingPaiement] = useState(null);
//     const { profile } = useAuth();

//     const [formData, setFormData] = useState({
//         client_id: '',
//         compagnie_id: '',
//         type_contrat: '',
//         prime_nette: '',
//         montant_accessoire: '0',
//         taux_commission: '',
//         commission: '0',
//         date_effet: '',
//         date_expiration: '',
//         fractionnement: 'annuel',
//         statut: 'actif',
//         notes: '',
//         client_telephone: '',
//         client_email: '',
//         evacuation_sanitaire: '',
//         prime_regulation: '',
//     });

//     const [typesDisponibles, setTypesDisponibles] = useState([]);
//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');
//     const [tauxSante, setTauxSante] = useState(null);

//     // ⭐ FONCTION HELPER : Vérifier si c'est un contrat santé
//     const isSanteContract = (typeContrat) => {
//         return typeContrat === 'SANTE_INDIVIDUELLE' || typeContrat === 'SANTE_FAMILIALE';
//     };

//     // ⭐ NOUVELLE FONCTION : Calculer la date d'expiration automatiquement
//     const calculateExpirationDate = (dateEffet, fractionnement) => {
//         if (!dateEffet) return '';

//         const date = new Date(dateEffet);

//         switch (fractionnement) {
//             case 'mensuel':
//                 date.setMonth(date.getMonth() + 1);
//                 break;
//             case 'trimestriel':
//                 date.setMonth(date.getMonth() + 3);
//                 break;
//             case 'semestriel':
//                 date.setMonth(date.getMonth() + 6);
//                 break;
//             case 'annuel':
//             default:
//                 date.setFullYear(date.getFullYear() + 1);
//                 break;
//         }

//         // ⭐ MODIFICATION : Soustraire 1 jour pour avoir exactement 12 mois
//         date.setDate(date.getDate() - 1);

//         // Format YYYY-MM-DD pour l'input date
//         return date.toISOString().split('T')[0];
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     useEffect(() => {
//         if (paiementsModal) {
//             fetchPaiementsContrat(paiementsModal.id);
//         }
//     }, [paiementsModal]);

//     // ⭐ NOUVEAU USEEFFECT : Calcul automatique de la date d'expiration
//     useEffect(() => {
//         // Ne pas calculer automatiquement si on est en mode édition
//         // ou si la date d'effet n'est pas renseignée
//         if (!selectedContrat && formData.date_effet && formData.fractionnement) {
//             const newExpirationDate = calculateExpirationDate(formData.date_effet, formData.fractionnement);
//             setFormData(prev => ({
//                 ...prev,
//                 date_expiration: newExpirationDate
//             }));
//         }
//     }, [formData.date_effet, formData.fractionnement, selectedContrat]);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             const [contratsRes, clientsRes, compagniesRes] = await Promise.all([
//                 supabase.from('contrats').select(`
//                     *,
//                     clients(id, nom, prenom, type_client, telephone, email),
//                     compagnies(id, nom, sigle, logo_url)
//                 `).order('created_at', { ascending: false }),
//                 supabase.from('clients').select('id, nom, prenom, type_client, telephone, email').order('nom'),
//                 supabase.from('compagnies').select('*').eq('actif', true).order('nom')
//             ]);

//             if (contratsRes.error) throw contratsRes.error;
//             if (clientsRes.error) throw clientsRes.error;
//             if (compagniesRes.error) throw compagniesRes.error;

//             setContrats(contratsRes.data || []);
//             setClients(clientsRes.data || []);
//             setCompagnies(compagniesRes.data || []);
//         } catch (error) {
//             console.error('Erreur:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchPaiementsContrat = async (contratId) => {
//         try {
//             const { data, error } = await supabase
//                 .from('paiements')
//                 .select('*')
//                 .eq('contrat_id', contratId)
//                 .order('date_paiement', { ascending: false });

//             if (error) throw error;
//             setPaiements(data || []);
//         } catch (error) {
//             console.error('Erreur paiements:', error);
//         }
//     };

//     const openPaiementsModal = (contrat) => {
//         setPaiementsModal(contrat);
//         setPaiementForm({
//             type_paiement: 'client_prime',
//             montant: '',
//             date_paiement: new Date().toISOString().split('T')[0],
//             mode_paiement: '',
//             notes: ''
//         });
//         setEditingPaiement(null);
//     };

//     const handlePaiementChange = (e) => {
//         const { name, value } = e.target;
//         setPaiementForm(prev => ({ ...prev, [name]: value }));
//     };

//     const handleAddPaiement = async (e) => {
//         e.preventDefault();
//         try {
//             const { error } = await supabase.from('paiements').insert([{
//                 contrat_id: paiementsModal.id,
//                 ...paiementForm,
//                 montant: parseFloat(paiementForm.montant)
//             }]);

//             if (error) throw error;

//             await fetchPaiementsContrat(paiementsModal.id);
//             setPaiementForm({
//                 type_paiement: 'client_prime',
//                 montant: '',
//                 date_paiement: new Date().toISOString().split('T')[0],
//                 mode_paiement: '',
//                 notes: ''
//             });
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleEditPaiement = (paiement) => {
//         setEditingPaiement(paiement);
//         setPaiementForm({
//             type_paiement: paiement.type_paiement,
//             montant: paiement.montant,
//             date_paiement: paiement.date_paiement,
//             mode_paiement: paiement.mode_paiement,
//             notes: paiement.notes || ''
//         });
//     };

//     const handleUpdatePaiement = async (e) => {
//         e.preventDefault();
//         try {
//             const { error } = await supabase
//                 .from('paiements')
//                 .update({
//                     ...paiementForm,
//                     montant: parseFloat(paiementForm.montant)
//                 })
//                 .eq('id', editingPaiement.id);

//             if (error) throw error;

//             await fetchPaiementsContrat(paiementsModal.id);
//             setEditingPaiement(null);
//             setPaiementForm({
//                 type_paiement: 'client_prime',
//                 montant: '',
//                 date_paiement: new Date().toISOString().split('T')[0],
//                 mode_paiement: '',
//                 notes: ''
//             });
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleDeletePaiement = async (paiementId) => {
//         if (!window.confirm('Supprimer ce paiement ?')) return;
//         try {
//             const { error } = await supabase.from('paiements').delete().eq('id', paiementId);
//             if (error) throw error;
//             await fetchPaiementsContrat(paiementsModal.id);
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const getTotalPaye = (type) => {
//         return paiements
//             .filter(p => p.type_paiement === type)
//             .reduce((sum, p) => sum + parseFloat(p.montant), 0);
//     };

//     // ⭐ Récupérer les types disponibles quand on change de compagnie
//     useEffect(() => {
//         if (formData.compagnie_id) {
//             const compagnie = compagnies.find(c => c.id === formData.compagnie_id);
//             if (compagnie?.taux_commissions) {
//                 const types = Object.keys(compagnie.taux_commissions);
//                 setTypesDisponibles(types);
//             } else {
//                 setTypesDisponibles([]);
//             }
//         } else {
//             setTypesDisponibles([]);
//             setTauxSante(null);
//         }
//     }, [formData.compagnie_id, compagnies]);

//     // ⭐ Charger les taux spécifiques quand on sélectionne un type
//     useEffect(() => {
//         if (formData.compagnie_id && formData.type_contrat) {
//             const compagnie = compagnies.find(c => c.id === formData.compagnie_id);

//             if (compagnie?.taux_commissions?.[formData.type_contrat]) {
//                 const tauxConfig = compagnie.taux_commissions[formData.type_contrat];

//                 if (isSanteContract(formData.type_contrat) && typeof tauxConfig === 'object') {
//                     setTauxSante({
//                         commission_base: tauxConfig.commission_base || 0.16,
//                         evacuation_sanitaire: tauxConfig.evacuation_sanitaire || 0.08,
//                         commission_regulation: tauxConfig.commission_regulation || 0.16
//                     });
//                     setFormData(prev => ({
//                         ...prev,
//                         taux_commission: tauxConfig.commission_base || 0.16
//                     }));
//                 } else {
//                     setTauxSante(null);
//                     setFormData(prev => ({
//                         ...prev,
//                         taux_commission: tauxConfig
//                     }));
//                 }
//             }
//         }
//     }, [formData.type_contrat, formData.compagnie_id, compagnies]);

//     // ⭐ CALCUL DE COMMISSION OPTIMISÉ
//     useEffect(() => {
//         if (!formData.prime_nette || !formData.taux_commission) {
//             return;
//         }

//         const primeNette = parseFloat(formData.prime_nette) || 0;
//         const montantAccessoire = parseFloat(formData.montant_accessoire) || 0;
//         let commission = 0;

//         if (isSanteContract(formData.type_contrat) && tauxSante) {
//             const evacuationSanitaire = parseFloat(formData.evacuation_sanitaire) || 0;
//             const primeRegulation = parseFloat(formData.prime_regulation) || 0;

//             if (primeRegulation > 0) {
//                 // CAS EXCEPTIONNEL
//                 commission = ((primeNette + primeRegulation) * tauxSante.commission_regulation)
//                     + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
//             } else if (evacuationSanitaire > 0) {
//                 // CAS NORMAL
//                 commission = (primeNette * tauxSante.commission_base)
//                     + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
//             } else {
//                 // CAS SANS ÉVACUATION
//                 commission = primeNette * tauxSante.commission_base;
//             }
//         } else {
//             // CALCUL NORMAL AUTRES TYPES
//             const tauxCommission = parseFloat(formData.taux_commission) || 0;
//             commission = (primeNette * tauxCommission) + montantAccessoire;
//         }

//         setFormData(prev => ({ ...prev, commission: commission.toFixed(2) }));
//     }, [
//         formData.prime_nette,
//         formData.taux_commission,
//         formData.montant_accessoire,
//         formData.type_contrat,
//         formData.evacuation_sanitaire,
//         formData.prime_regulation,
//         tauxSante
//     ]);

//     // Mettre à jour les champs client
//     useEffect(() => {
//         if (formData.client_id) {
//             const selectedClient = clients.find(c => c.id === formData.client_id);
//             if (selectedClient) {
//                 setFormData(prev => ({
//                     ...prev,
//                     client_telephone: selectedClient.telephone || '',
//                     client_email: selectedClient.email || '',
//                 }));
//             }
//         }
//     }, [formData.client_id, clients]);

//     const filteredContrats = contrats.filter(contrat => {
//         const matchSearch =
//             contrat.numero_police?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             contrat.clients?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             contrat.clients?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             contrat.compagnies?.nom.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchStatut = filterStatut === 'all' || contrat.statut === filterStatut;
//         return matchSearch && matchStatut;
//     });

//     const resetForm = () => {
//         setFormData({
//             client_id: '',
//             compagnie_id: '',
//             type_contrat: '',
//             prime_nette: '',
//             montant_accessoire: '0',
//             taux_commission: '',
//             commission: '0',
//             date_effet: '',
//             date_expiration: '',
//             fractionnement: 'annuel',
//             statut: 'actif',
//             notes: '',
//             client_telephone: '',
//             client_email: '',
//             evacuation_sanitaire: '',
//             prime_regulation: '',
//         });
//         setTypesDisponibles([]);
//         setTauxSante(null);
//         setFormError('');
//     };

//     const handleAdd = () => {
//         resetForm();
//         setSelectedContrat(null);
//         setIsModalOpen(true);
//     };

//     const handleEdit = (contrat) => {
//         setSelectedContrat(contrat);
//         setFormData({
//             client_id: contrat.client_id || '',
//             compagnie_id: contrat.compagnie_id || '',
//             type_contrat: contrat.type_contrat || '',
//             prime_nette: contrat.prime_nette || '',
//             montant_accessoire: contrat.montant_accessoire || '0',
//             taux_commission: contrat.taux_commission || '',
//             commission: contrat.commission || '0',
//             date_effet: contrat.date_effet || '',
//             date_expiration: contrat.date_expiration || '',
//             fractionnement: contrat.fractionnement || 'annuel',
//             statut: contrat.statut || 'actif',
//             notes: contrat.notes || '',
//             client_telephone: '',
//             client_email: '',
//             evacuation_sanitaire: contrat.evacuation_sanitaire || '',
//             prime_regulation: contrat.prime_regulation || '',
//         });
//         setFormError('');
//         setIsModalOpen(true);
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));

//         // ⭐ MODIFICATION : Si on change le fractionnement et qu'on a une date d'effet, recalculer la date d'expiration
//         // Mais uniquement en mode création (pas en édition)
//         if (!selectedContrat && name === 'fractionnement' && formData.date_effet) {
//             const newExpirationDate = calculateExpirationDate(formData.date_effet, value);
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: value,
//                 date_expiration: newExpirationDate
//             }));
//         } else if (!selectedContrat && name === 'date_effet' && value) {
//             // Si on change la date d'effet, recalculer avec le fractionnement actuel
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

//             await fetchData();
//             setIsModalOpen(false);
//             resetForm();
//         } catch (err) {
//             setFormError(err.message || 'Une erreur est survenue');
//         } finally {
//             setFormLoading(false);
//         }
//     };

//     const handleDelete = async (contratId) => {
//         try {
//             const { error } = await supabase.from('contrats').delete().eq('id', contratId);
//             if (error) throw error;
//             await fetchData();
//             setDeleteConfirm(null);
//         } catch (error) {
//             alert('Erreur lors de la suppression');
//         }
//     };

//     const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

//     const getStatutBadge = (statut) => {
//         const styles = {
//             actif: 'bg-success-100 text-success-700',
//             expiré: 'bg-gray-100 text-gray-700',
//             annulé: 'bg-danger-100 text-danger-700',
//         };
//         return styles[statut] || 'bg-gray-100 text-gray-700';
//     };

//     // ⭐ RENDU COMMENCE ICI - Suite dans PARTIE 2
//     return (
//         <>
//             <div className="mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900">Gestion des Contrats</h1>
//                         <p className="text-gray-600 mt-1">{filteredContrats.length} contrat{filteredContrats.length > 1 ? 's' : ''}</p>
//                     </div>
//                     <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                         </svg>
//                         Nouveau contrat
//                     </button>
//                 </div>
//             </div>

//             {/* Barre de recherche et filtres */}
//             <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
//                 <div className="flex flex-col md:flex-row gap-4">
//                     <div className="flex-1 relative">
//                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                         </svg>
//                         <input type="text" placeholder="Rechercher un contrat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                     </div>
//                     <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
//                         <option value="all">Tous les statuts</option>
//                         <option value="actif">Actifs</option>
//                         <option value="expiré">Expirés</option>
//                         <option value="annulé">Annulés</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Tableau des contrats */}
//             <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//                 {loading ? (
//                     <div className="flex items-center justify-center py-12">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                     </div>
//                 ) : filteredContrats.length === 0 ? (
//                     <div className="text-center py-12">
//                         <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                         <p className="text-gray-500 text-lg font-medium">Aucun contrat trouvé</p>
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-gray-50 border-b">
//                                 <tr>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Compagnie</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Taux</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
//                                     <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y">
//                                 {filteredContrats.map((contrat) => (
//                                     <tr key={contrat.id} className="hover:bg-gray-50">
//                                         <td className="px-6 py-4">
//                                             <p className="font-medium text-gray-900">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                             <span className={`text-xs px-2 py-0.5 rounded-full ${contrat.clients?.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                                 {contrat.clients?.type_client === 'particulier' ? 'Particulier' : 'Entreprise'}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-2">
//                                                 {contrat.compagnies?.logo_url && (
//                                                     <img src={contrat.compagnies.logo_url} alt={contrat.compagnies.nom} className="w-8 h-8 rounded object-cover" onError={(e) => {
//                                                         e.target.style.display = 'none';
//                                                     }} />
//                                                 )}
//                                                 <div>
//                                                     <p className="font-medium text-gray-900">{contrat.compagnies?.nom}</p>
//                                                     <p className="text-xs text-gray-500">{contrat.compagnies?.sigle}</p>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <p className="text-sm font-medium text-gray-900">{contrat.type_contrat.replace(/_/g, ' ')}</p>
//                                             <p className="text-xs text-gray-500">{new Date(contrat.date_effet).toLocaleDateString('fr-FR')}</p>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="px-2.5 py-1 bg-accent-100 text-accent-700 rounded-lg text-sm font-semibold">
//                                                 {(parseFloat(contrat.taux_commission) * 100).toFixed(2)}%
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm font-semibold text-gray-900">{parseFloat(contrat.prime_nette).toLocaleString('fr-FR')} FCFA</td>
//                                         <td className="px-6 py-4 text-sm font-semibold text-primary-600">{parseFloat(contrat.commission).toLocaleString('fr-FR')} FCFA</td>
//                                         <td className="px-6 py-4">
//                                             <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatutBadge(contrat.statut)}`}>
//                                                 {contrat.statut}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex justify-end gap-2">
//                                                 <button onClick={() => openPaiementsModal(contrat)} className="p-2 text-success-600 hover:bg-success-50 rounded-lg" title="Gérer paiements">
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                                                     </svg>
//                                                 </button>
//                                                 <button onClick={() => handleEdit(contrat)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Modifier">
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                     </svg>
//                                                 </button>
//                                                 {canDelete && (
//                                                     <button onClick={() => setDeleteConfirm(contrat.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
//                                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                         </svg>
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>

//             {/* ⭐ MODAL D'AJOUT/ÉDITION - OPTIMISÉ */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
//                             <h2 className="text-xl font-bold">{selectedContrat ? 'Modifier' : 'Nouveau'} contrat</h2>
//                             <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                             {formError && (
//                                 <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                     {formError}
//                                 </div>
//                             )}

//                             {/* Client et Compagnie */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Client <span className="text-danger-500">*</span></label>
//                                     <select name="client_id" value={formData.client_id} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
//                                         <option value="">Sélectionner un client</option>
//                                         {clients.map(client => (
//                                             <option key={client.id} value={client.id}>
//                                                 {client.nom} {client.prenom} ({client.type_client})
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Compagnie <span className="text-danger-500">*</span></label>
//                                     <select name="compagnie_id" value={formData.compagnie_id} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
//                                         <option value="">Sélectionner une compagnie</option>
//                                         {compagnies.map(compagnie => (
//                                             <option key={compagnie.id} value={compagnie.id}>
//                                                 {compagnie.nom}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>

//                             {/* Contacts client */}
//                             {formData.client_id && (
//                                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                                     <p className="text-sm font-medium text-blue-900 mb-3">📞 Contacts pour notifications</p>
//                                     <div className="grid md:grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-xs font-medium text-blue-900 mb-1">Téléphone</label>
//                                             <input
//                                                 type="tel"
//                                                 name="client_telephone"
//                                                 value={formData.client_telephone || ''}
//                                                 onChange={handleChange}
//                                                 className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
//                                                 placeholder="+221 77 123 45 67"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs font-medium text-blue-900 mb-1">Email</label>
//                                             <input
//                                                 type="email"
//                                                 name="client_email"
//                                                 value={formData.client_email || ''}
//                                                 onChange={handleChange}
//                                                 className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
//                                                 placeholder="client@email.com"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Type et taux */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Type de contrat <span className="text-danger-500">*</span></label>
//                                     <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} disabled={!formData.compagnie_id} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100" required>
//                                         <option value="">Sélectionner un type</option>
//                                         {typesDisponibles.map(type => (
//                                             <option key={type} value={type}>
//                                                 {type.replace(/_/g, ' ')}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Taux de commission</label>
//                                     <div className="relative">
//                                         <input
//                                             type="text"
//                                             value={formData.taux_commission ? `${(parseFloat(formData.taux_commission) * 100).toFixed(2)} %` : ''}
//                                             placeholder="Sélectionnez d'abord un type"
//                                             className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold outline-none"
//                                             readOnly
//                                         />
//                                         {formData.taux_commission && (
//                                             <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                                                 <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                 </svg>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Prime nette et accessoire */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Prime nette (FCFA) <span className="text-danger-500">*</span></label>
//                                     <input type="number" name="prime_nette" value={formData.prime_nette} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                                 {!isSanteContract(formData.type_contrat) && (
//                                     <div>
//                                         <label className="block text-sm font-medium mb-2">Montant accessoire (FCFA)</label>
//                                         <input type="number" name="montant_accessoire" value={formData.montant_accessoire} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0" />
//                                     </div>
//                                 )}
//                             </div>

//                             {/* ⭐ CHAMPS SANTÉ */}
//                             {isSanteContract(formData.type_contrat) && (
//                                 <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5 space-y-4">
//                                     <div className="flex items-center gap-2 mb-3">
//                                         <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
//                                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                                             </svg>
//                                         </div>
//                                         <div>
//                                             <p className="text-sm font-bold text-green-900">Assurance Santé</p>
//                                             <p className="text-xs text-green-700">Configuration spécifique</p>
//                                         </div>
//                                     </div>

//                                     <div className="grid md:grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-green-900 mb-2">
//                                                 Évacuation Sanitaire (FCFA)
//                                                 {parseFloat(formData.prime_regulation || 0) > 0 && <span className="text-danger-500 ml-1">*</span>}
//                                             </label>
//                                             <input
//                                                 type="number"
//                                                 name="evacuation_sanitaire"
//                                                 value={formData.evacuation_sanitaire}
//                                                 onChange={handleChange}
//                                                 step="0.01"
//                                                 min="0"
//                                                 className="w-full px-4 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//                                                 placeholder="Montant évacuation"
//                                                 required={parseFloat(formData.prime_regulation || 0) > 0}
//                                             />
//                                             {tauxSante && (
//                                                 <p className="text-xs text-green-700 mt-1 font-medium">
//                                                     Taux: {(tauxSante.evacuation_sanitaire * 100).toFixed(2)}%
//                                                 </p>
//                                             )}
//                                         </div>

//                                         <div>
//                                             <label className="block text-sm font-medium text-green-900 mb-2">
//                                                 Prime de Régulation (FCFA)
//                                                 <span className="text-xs text-orange-700 ml-2 font-normal">(Cas exceptionnel)</span>
//                                             </label>
//                                             <input
//                                                 type="number"
//                                                 name="prime_regulation"
//                                                 value={formData.prime_regulation}
//                                                 onChange={handleChange}
//                                                 step="0.01"
//                                                 min="0"
//                                                 className="w-full px-4 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//                                                 placeholder="Prime de régulation"
//                                             />
//                                             {tauxSante && (
//                                                 <p className="text-xs text-green-700 mt-1 font-medium">
//                                                     Taux: {(tauxSante.commission_regulation * 100).toFixed(2)}%
//                                                 </p>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* ⭐ INDICATEUR DE CAS */}
//                                     <div className="bg-white border-2 border-green-300 rounded-lg p-4">
//                                         <div className="flex items-start gap-3">
//                                             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                                 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                                                 </svg>
//                                             </div>
//                                             <div className="flex-1">
//                                                 <p className="text-xs font-semibold text-green-900 mb-1">Mode de calcul détecté:</p>
//                                                 {parseFloat(formData.prime_regulation || 0) > 0 ? (
//                                                     <p className="text-sm text-green-800">
//                                                         <span className="font-bold text-orange-600">⚡ Cas Exceptionnel:</span><br />
//                                                         (Prime nette + Prime régulation) × {tauxSante ? (tauxSante.commission_regulation * 100).toFixed(2) : '16'}% + Évacuation × {tauxSante ? (tauxSante.evacuation_sanitaire * 100).toFixed(2) : '8'}%
//                                                     </p>
//                                                 ) : parseFloat(formData.evacuation_sanitaire || 0) > 0 ? (
//                                                     <p className="text-sm text-green-800">
//                                                         <span className="font-bold text-green-600">✓ Cas Normal:</span><br />
//                                                         Prime nette × {tauxSante ? (tauxSante.commission_base * 100).toFixed(2) : '16'}% + Évacuation × {tauxSante ? (tauxSante.evacuation_sanitaire * 100).toFixed(2) : '8'}%
//                                                     </p>
//                                                 ) : (
//                                                     <p className="text-sm text-green-800">
//                                                         <span className="font-bold text-blue-600">○ Sans évacuation:</span><br />
//                                                         Prime nette × {tauxSante ? (tauxSante.commission_base * 100).toFixed(2) : '16'}%
//                                                     </p>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {parseFloat(formData.prime_regulation || 0) > 0 && !formData.evacuation_sanitaire && (
//                                         <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2">
//                                             <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                             </svg>
//                                             <p className="text-xs text-red-800 font-medium">
//                                                 L'évacuation sanitaire est obligatoire avec la prime de régulation
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* Commission calculée */}
//                             <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-4">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-primary-900">Commission calculée</p>
//                                         <p className="text-xs text-primary-700 mt-0.5">Calcul automatique</p>
//                                     </div>
//                                     <p className="text-3xl font-bold text-primary-600">{parseFloat(formData.commission || 0).toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
//                                 </div>
//                             </div>

//                             {/* Dates avec indicateur de calcul automatique */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Date d'effet <span className="text-danger-500">*</span></label>
//                                     <input type="date" name="date_effet" value={formData.date_effet} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">
//                                         Date d'expiration <span className="text-danger-500">*</span>
//                                         {!selectedContrat && formData.date_effet && (
//                                             <span className="text-xs text-primary-600 ml-2">(Calculée automatiquement)</span>
//                                         )}
//                                     </label>
//                                     <input type="date" name="date_expiration" value={formData.date_expiration} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                             </div>

//                             {/* Fractionnement et statut */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">
//                                         Fractionnement
//                                         {!selectedContrat && (
//                                             <span className="text-xs text-gray-500 ml-2">(Détermine la durée)</span>
//                                         )}
//                                     </label>
//                                     <select name="fractionnement" value={formData.fractionnement} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
//                                         <option value="mensuel">Mensuel (1 mois)</option>
//                                         <option value="trimestriel">Trimestriel (3 mois)</option>
//                                         <option value="semestriel">Semestriel (6 mois)</option>
//                                         <option value="annuel">Annuel (12 mois)</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Statut</label>
//                                     <select name="statut" value={formData.statut} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
//                                         <option value="actif">Actif</option>
//                                         <option value="expiré">Expiré</option>
//                                         <option value="annulé">Annulé</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             {/* Notes */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Notes</label>
//                                 <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Informations complémentaires..." />
//                             </div>

//                             {/* Boutons */}
//                             <div className="flex gap-3 pt-4 border-t">
//                                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors" disabled={formLoading}>
//                                     Annuler
//                                 </button>
//                                 <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
//                                     {formLoading ? (
//                                         <>
//                                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                             Enregistrement...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                             </svg>
//                                             {selectedContrat ? 'Mettre à jour' : 'Créer le contrat'}
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* ⭐ MODAL DE GESTION DES PAIEMENTS */}
//             {paiementsModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
//                             <div className="flex justify-between items-center">
//                                 <div>
//                                     <h2 className="text-xl font-bold">💰 Paiements - {paiementsModal.clients?.nom} {paiementsModal.clients?.prenom}</h2>
//                                     <p className="text-sm text-gray-600">{paiementsModal.type_contrat.replace(/_/g, ' ')} - {paiementsModal.compagnies?.nom}</p>
//                                 </div>
//                                 <button onClick={() => setPaiementsModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="p-6">
//                             {/* Résumé */}
//                             <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
//                                 <div>
//                                     <p className="text-xs text-gray-600 mb-1">Prime nette totale</p>
//                                     <p className="text-lg font-bold text-gray-900">{parseFloat(paiementsModal.prime_nette).toLocaleString('fr-FR')} FCFA</p>
//                                     <p className="text-xs text-success-600 mt-1">Payé: {getTotalPaye('client_prime').toLocaleString('fr-FR')} FCFA</p>
//                                     <p className="text-xs text-warning-600">Restant: {(parseFloat(paiementsModal.prime_nette) - getTotalPaye('client_prime')).toLocaleString('fr-FR')} FCFA</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-gray-600 mb-1">Commission totale</p>
//                                     <p className="text-lg font-bold text-primary-600">{parseFloat(paiementsModal.commission).toLocaleString('fr-FR')} FCFA</p>
//                                     <p className="text-xs text-success-600 mt-1">Reçu: {getTotalPaye('commission_compagnie').toLocaleString('fr-FR')} FCFA</p>
//                                     <p className="text-xs text-warning-600">Restant: {(parseFloat(paiementsModal.commission) - getTotalPaye('commission_compagnie')).toLocaleString('fr-FR')} FCFA</p>
//                                 </div>
//                             </div>

//                             {/* Formulaire paiement */}
//                             <form onSubmit={editingPaiement ? handleUpdatePaiement : handleAddPaiement} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//                                 <h3 className="font-semibold text-blue-900 mb-3">{editingPaiement ? '✏️ Modifier' : '➕ Ajouter'} un paiement</h3>
//                                 <div className="grid md:grid-cols-5 gap-3">
//                                     <div>
//                                         <label className="block text-xs font-medium text-blue-900 mb-1">Type</label>
//                                         <select name="type_paiement" value={paiementForm.type_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required>
//                                             <option value="client_prime">Prime client</option>
//                                             <option value="commission_compagnie">Commission</option>
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-medium text-blue-900 mb-1">Montant (FCFA)</label>
//                                         <input type="number" name="montant" value={paiementForm.montant} onChange={handlePaiementChange} step="0.01" min="0" className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required />
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-medium text-blue-900 mb-1">Date</label>
//                                         <input type="date" name="date_paiement" value={paiementForm.date_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required />
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-medium text-blue-900 mb-1">Mode</label>
//                                         <select name="mode_paiement" value={paiementForm.mode_paiement} onChange={handlePaiementChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm" required>
//                                             <option value="">Sélectionner</option>
//                                             <option value="cash">Cash</option>
//                                             <option value="cheque">Chèque</option>
//                                             <option value="virement">Virement</option>
//                                             <option value="mobile_money">Mobile Money</option>
//                                             <option value="carte_bancaire">Carte</option>
//                                         </select>
//                                     </div>
//                                     <div className="flex items-end gap-2">
//                                         <button type="submit" className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors">
//                                             {editingPaiement ? 'Modifier' : 'Ajouter'}
//                                         </button>
//                                         {editingPaiement && (
//                                             <button type="button" onClick={() => {
//                                                 setEditingPaiement(null);
//                                                 setPaiementForm({
//                                                     type_paiement: 'client_prime',
//                                                     montant: '',
//                                                     date_paiement: new Date().toISOString().split('T')[0],
//                                                     mode_paiement: '',
//                                                     notes: ''
//                                                 });
//                                             }} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors">
//                                                 Annuler
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>
//                             </form>

//                             {/* Liste paiements */}
//                             <div>
//                                 <h3 className="font-semibold text-gray-900 mb-3">📋 Historique ({paiements.length})</h3>
//                                 {paiements.length === 0 ? (
//                                     <p className="text-gray-500 text-center py-8">Aucun paiement enregistré</p>
//                                 ) : (
//                                     <div className="space-y-2">
//                                         {paiements.map((paiement) => (
//                                             <div key={paiement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                                                 <div className="flex items-center gap-4 flex-1">
//                                                     <div className={`px-3 py-1 rounded-lg text-xs font-medium ${paiement.type_paiement === 'client_prime' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                                         {paiement.type_paiement === 'client_prime' ? 'Prime' : 'Commission'}
//                                                     </div>
//                                                     <div className="flex-1">
//                                                         <p className="font-semibold text-gray-900">{parseFloat(paiement.montant).toLocaleString('fr-FR')} FCFA</p>
//                                                         <p className="text-xs text-gray-500">
//                                                             {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')} • {paiement.mode_paiement}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex gap-2">
//                                                     <button onClick={() => handleEditPaiement(paiement)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
//                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                         </svg>
//                                                     </button>
//                                                     <button onClick={() => handleDeletePaiement(paiement.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
//                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                         </svg>
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ⭐ MODAL CONFIRMATION SUPPRESSION */}
//             {deleteConfirm && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-md w-full animate-scale-in">
//                         <div className="p-6">
//                             <div className="flex items-center gap-4 mb-4">
//                                 <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                     <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                     </svg>
//                                 </div>
//                                 <div>
//                                     <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
//                                     <p className="text-sm text-gray-600 mt-1">Cette action est irréversible</p>
//                                 </div>
//                             </div>
//                             <p className="text-gray-700 mb-6">
//                                 Êtes-vous sûr de vouloir supprimer ce contrat ? Tous les paiements associés seront également supprimés.
//                             </p>
//                             <div className="flex gap-3">
//                                 <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors">
//                                     Annuler
//                                 </button>
//                                 <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 font-medium transition-colors">
//                                     Supprimer
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }











// code avec imma
// PARTIE 1 - Code Contrats avec Immatriculation
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Contrats() {
    const [contrats, setContrats] = useState([]);
    const [clients, setClients] = useState([]);
    const [compagnies, setCompagnies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatut, setFilterStatut] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContrat, setSelectedContrat] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [paiementsModal, setPaiementsModal] = useState(null);
    const [paiements, setPaiements] = useState([]);
    const [paiementForm, setPaiementForm] = useState({
        type_paiement: 'client_prime',
        montant: '',
        date_paiement: '',
        mode_paiement: '',
        notes: ''
    });
    const [editingPaiement, setEditingPaiement] = useState(null);
    const { profile } = useAuth();

    const [formData, setFormData] = useState({
        client_id: '',
        compagnie_id: '',
        type_contrat: '',
        immatriculation: '',
        prime_nette: '',
        montant_accessoire: '0',
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
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [tauxSante, setTauxSante] = useState(null);

    // ⭐ FONCTION HELPER : Vérifier si c'est un contrat santé
    const isSanteContract = (typeContrat) => {
        return typeContrat === 'SANTE_INDIVIDUELLE' || typeContrat === 'SANTE_FAMILIALE';
    };
    // ⭐ NOUVELLE FONCTION HELPER : Vérifier si c'est un contrat AUTO
    const isAutoContract = (typeContrat) => {
        return typeContrat?.includes('AUTO') || typeContrat?.includes('AUTOMOBILE');
    };
    // ⭐ NOUVELLE FONCTION : Calculer la date d'expiration automatiquement
    const calculateExpirationDate = (dateEffet, fractionnement) => {
        if (!dateEffet) return '';

        const date = new Date(dateEffet);

        switch (fractionnement) {
            case 'mensuel':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'trimestriel':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'semestriel':
                date.setMonth(date.getMonth() + 6);
                break;
            case 'annuel':
            default:
                date.setFullYear(date.getFullYear() + 1);
                break;
        }

        // ⭐ MODIFICATION : Soustraire 1 jour pour avoir exactement 12 mois
        date.setDate(date.getDate() - 1);

        // Format YYYY-MM-DD pour l'input date
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (paiementsModal) {
            fetchPaiementsContrat(paiementsModal.id);
        }
    }, [paiementsModal]);

    // ⭐ NOUVEAU USEEFFECT : Calcul automatique de la date d'expiration
    useEffect(() => {
        // Ne pas calculer automatiquement si on est en mode édition
        // ou si la date d'effet n'est pas renseignée
        if (!selectedContrat && formData.date_effet && formData.fractionnement) {
            const newExpirationDate = calculateExpirationDate(formData.date_effet, formData.fractionnement);
            setFormData(prev => ({
                ...prev,
                date_expiration: newExpirationDate
            }));
        }
    }, [formData.date_effet, formData.fractionnement, selectedContrat]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [contratsRes, clientsRes, compagniesRes] = await Promise.all([
                supabase.from('contrats').select(`
                    *,
                    clients(id, nom, prenom, type_client, telephone, email),
                    compagnies(id, nom, sigle, logo_url)
                `).order('created_at', { ascending: false }),
                supabase.from('clients').select('id, nom, prenom, type_client, telephone, email').order('nom'),
                supabase.from('compagnies').select('*').eq('actif', true).order('nom')
            ]);

            if (contratsRes.error) throw contratsRes.error;
            if (clientsRes.error) throw clientsRes.error;
            if (compagniesRes.error) throw compagniesRes.error;

            setContrats(contratsRes.data || []);
            setClients(clientsRes.data || []);
            setCompagnies(compagniesRes.data || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaiementsContrat = async (contratId) => {
        try {
            const { data, error } = await supabase
                .from('paiements')
                .select('*')
                .eq('contrat_id', contratId)
                .order('date_paiement', { ascending: false });

            if (error) throw error;
            setPaiements(data || []);
        } catch (error) {
            console.error('Erreur paiements:', error);
        }
    };

    const openPaiementsModal = (contrat) => {
        setPaiementsModal(contrat);
        setPaiementForm({
            type_paiement: 'client_prime',
            montant: '',
            date_paiement: new Date().toISOString().split('T')[0],
            mode_paiement: '',
            notes: ''
        });
        setEditingPaiement(null);
    };

    const handlePaiementChange = (e) => {
        const { name, value } = e.target;
        setPaiementForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPaiement = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('paiements').insert([{
                contrat_id: paiementsModal.id,
                ...paiementForm,
                montant: parseFloat(paiementForm.montant)
            }]);

            if (error) throw error;

            await fetchPaiementsContrat(paiementsModal.id);
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

            await fetchPaiementsContrat(paiementsModal.id);
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
            await fetchPaiementsContrat(paiementsModal.id);
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    };

    const getTotalPaye = (type) => {
        return paiements
            .filter(p => p.type_paiement === type)
            .reduce((sum, p) => sum + parseFloat(p.montant), 0);
    };

    // ⭐ Récupérer les types disponibles quand on change de compagnie
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

    // ⭐ Charger les taux spécifiques quand on sélectionne un type
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

    // ⭐ CALCUL DE COMMISSION OPTIMISÉ
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
                // CAS EXCEPTIONNEL
                commission = ((primeNette + primeRegulation) * tauxSante.commission_regulation)
                    + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
            } else if (evacuationSanitaire > 0) {
                // CAS NORMAL
                commission = (primeNette * tauxSante.commission_base)
                    + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
            } else {
                // CAS SANS ÉVACUATION
                commission = primeNette * tauxSante.commission_base;
            }
        } else {
            // CALCUL NORMAL AUTRES TYPES
            const tauxCommission = parseFloat(formData.taux_commission) || 0;
            commission = (primeNette * tauxCommission) + montantAccessoire;
        }

        setFormData(prev => ({ ...prev, commission: commission.toFixed(2) }));
    }, [
        formData.prime_nette,
        formData.taux_commission,
        formData.montant_accessoire,
        formData.type_contrat,
        formData.evacuation_sanitaire,
        formData.prime_regulation,
        tauxSante
    ]);

    // Mettre à jour les champs client
    useEffect(() => {
        if (formData.client_id) {
            const selectedClient = clients.find(c => c.id === formData.client_id);
            if (selectedClient) {
                setFormData(prev => ({
                    ...prev,
                    client_telephone: selectedClient.telephone || '',
                    client_email: selectedClient.email || '',
                }));
            }
        }
    }, [formData.client_id, clients]);

    const filteredContrats = contrats.filter(contrat => {
        const matchSearch =
            contrat.numero_police?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contrat.clients?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contrat.clients?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contrat.compagnies?.nom.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatut = filterStatut === 'all' || contrat.statut === filterStatut;
        return matchSearch && matchStatut;
    });

    const resetForm = () => {
        setFormData({
            client_id: '',
            compagnie_id: '',
            type_contrat: '',
            immatriculation: '',
            prime_nette: '',
            montant_accessoire: '0',
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
        setFormError('');
    };

    const handleAdd = () => {
        resetForm();
        setSelectedContrat(null);
        setIsModalOpen(true);
    };

    const handleEdit = (contrat) => {
        setSelectedContrat(contrat);
        setFormData({
            client_id: contrat.client_id || '',
            compagnie_id: contrat.compagnie_id || '',
            type_contrat: contrat.type_contrat || '',
            immatriculation: contrat.immatriculation || '',
            prime_nette: contrat.prime_nette || '',
            montant_accessoire: contrat.montant_accessoire || '0',
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
        setFormError('');
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // ⭐ MODIFICATION : Si on change le fractionnement et qu'on a une date d'effet, recalculer la date d'expiration
        // Mais uniquement en mode création (pas en édition)
        if (!selectedContrat && name === 'fractionnement' && formData.date_effet) {
            const newExpirationDate = calculateExpirationDate(formData.date_effet, value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                date_expiration: newExpirationDate
            }));
        } else if (!selectedContrat && name === 'date_effet' && value) {
            // Si on change la date d'effet, recalculer avec le fractionnement actuel
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
                prime_nette: parseFloat(formData.prime_nette),
                montant_accessoire: parseFloat(formData.montant_accessoire || 0),
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

            await fetchData();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            setFormError(err.message || 'Une erreur est survenue');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (contratId) => {
        try {
            const { error } = await supabase.from('contrats').delete().eq('id', contratId);
            if (error) throw error;
            await fetchData();
            setDeleteConfirm(null);
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

    const getStatutBadge = (statut) => {
        const styles = {
            actif: 'bg-success-100 text-success-700',
            expiré: 'bg-gray-100 text-gray-700',
            annulé: 'bg-danger-100 text-danger-700',
        };
        return styles[statut] || 'bg-gray-100 text-gray-700';
    };

    // ⭐ RENDU COMMENCE ICI - Suite dans PARTIE 2
    return (
        <>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Contrats</h1>
                        <p className="text-gray-600 mt-1">{filteredContrats.length} contrat{filteredContrats.length > 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nouveau contrat
                    </button>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Rechercher un contrat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                        <option value="all">Tous les statuts</option>
                        <option value="actif">Actifs</option>
                        <option value="expiré">Expirés</option>
                        <option value="annulé">Annulés</option>
                    </select>
                </div>
            </div>

            {/* Tableau des contrats */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredContrats.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Aucun contrat trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Compagnie</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Taux</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredContrats.map((contrat) => (
                                    <tr key={contrat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${contrat.clients?.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {contrat.clients?.type_client === 'particulier' ? 'Particulier' : 'Entreprise'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {contrat.compagnies?.logo_url && (
                                                    <img src={contrat.compagnies.logo_url} alt={contrat.compagnies.nom} className="w-8 h-8 rounded object-cover" onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }} />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{contrat.compagnies?.nom}</p>
                                                    <p className="text-xs text-gray-500">{contrat.compagnies?.sigle}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">{contrat.type_contrat.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-gray-500">{new Date(contrat.date_effet).toLocaleDateString('fr-FR')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-accent-100 text-accent-700 rounded-lg text-sm font-semibold">
                                                {(parseFloat(contrat.taux_commission) * 100).toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{parseFloat(contrat.prime_nette).toLocaleString('fr-FR')} FCFA</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-primary-600">{parseFloat(contrat.commission).toLocaleString('fr-FR')} FCFA</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatutBadge(contrat.statut)}`}>
                                                {contrat.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openPaiementsModal(contrat)} className="p-2 text-success-600 hover:bg-success-50 rounded-lg" title="Gérer paiements">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleEdit(contrat)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Modifier">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {canDelete && (
                                                    <button onClick={() => setDeleteConfirm(contrat.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ⭐ MODAL D'AJOUT/ÉDITION - OPTIMISÉ */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold">{selectedContrat ? 'Modifier' : 'Nouveau'} contrat</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
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

                            {/* Contacts client */}
                            {formData.client_id && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-blue-900 mb-3">📞 Contacts pour notifications</p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-blue-900 mb-1">Téléphone</label>
                                            <input
                                                type="tel"
                                                name="client_telephone"
                                                value={formData.client_telephone || ''}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                placeholder="+221 77 123 45 67"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-blue-900 mb-1">Email</label>
                                            <input
                                                type="email"
                                                name="client_email"
                                                value={formData.client_email || ''}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                placeholder="client@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Type et taux */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type de contrat <span className="text-danger-500">*</span></label>
                                    <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} disabled={!formData.compagnie_id} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100" required>
                                        <option value="">Sélectionner un type</option>
                                        {typesDisponibles.map(type => (
                                            <option key={type} value={type}>
                                                {type.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Taux de commission</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.taux_commission ? `${(parseFloat(formData.taux_commission) * 100).toFixed(2)} %` : ''}
                                            placeholder="Sélectionnez d'abord un type"
                                            className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold outline-none"
                                            readOnly
                                        />
                                        {formData.taux_commission && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ⭐ NOUVEAU : Champ Immatriculation pour contrats AUTO */}
                            {isAutoContract(formData.type_contrat) && (
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-amber-900">🚗 Assurance Automobile</p>
                                            <p className="text-xs text-amber-700">Informations du véhicule</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-amber-900 mb-2">
                                            Numéro d'immatriculation
                                            <span className="text-xs text-amber-700 ml-2 font-normal">(Ex: DK-1234-AB)</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="immatriculation"
                                            value={formData.immatriculation}
                                            onChange={handleChange}
                                            placeholder="DK-1234-AB"
                                            className="w-full px-4 py-2.5 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 font-medium uppercase"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Prime nette et accessoire */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Prime nette (FCFA) <span className="text-danger-500">*</span></label>
                                    <input type="number" name="prime_nette" value={formData.prime_nette} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                                </div>
                                {!isSanteContract(formData.type_contrat) && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Montant accessoire (FCFA)</label>
                                        <input type="number" name="montant_accessoire" value={formData.montant_accessoire} onChange={handleChange} step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0" />
                                    </div>
                                )}
                            </div>

                            {/* ⭐ CHAMPS SANTÉ */}
                            {isSanteContract(formData.type_contrat) && (
                                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5 space-y-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-green-900">Assurance Santé</p>
                                            <p className="text-xs text-green-700">Configuration spécifique</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-green-900 mb-2">
                                                Évacuation Sanitaire (FCFA)
                                                {parseFloat(formData.prime_regulation || 0) > 0 && <span className="text-danger-500 ml-1">*</span>}
                                            </label>
                                            <input
                                                type="number"
                                                name="evacuation_sanitaire"
                                                value={formData.evacuation_sanitaire}
                                                onChange={handleChange}
                                                step="0.01"
                                                min="0"
                                                className="w-full px-4 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Montant évacuation"
                                                required={parseFloat(formData.prime_regulation || 0) > 0}
                                            />
                                            {tauxSante && (
                                                <p className="text-xs text-green-700 mt-1 font-medium">
                                                    Taux: {(tauxSante.evacuation_sanitaire * 100).toFixed(2)}%
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-green-900 mb-2">
                                                Prime de Régulation (FCFA)
                                                <span className="text-xs text-orange-700 ml-2 font-normal">(Cas exceptionnel)</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="prime_regulation"
                                                value={formData.prime_regulation}
                                                onChange={handleChange}
                                                step="0.01"
                                                min="0"
                                                className="w-full px-4 py-2.5 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="Prime de régulation"
                                            />
                                            {tauxSante && (
                                                <p className="text-xs text-green-700 mt-1 font-medium">
                                                    Taux: {(tauxSante.commission_regulation * 100).toFixed(2)}%
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* ⭐ INDICATEUR DE CAS */}
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
                                        <p className="text-xs text-primary-700 mt-0.5">Calcul automatique</p>
                                    </div>
                                    <p className="text-3xl font-bold text-primary-600">{parseFloat(formData.commission || 0).toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
                                </div>
                            </div>

                            {/* Dates avec indicateur de calcul automatique */}
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
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors" disabled={formLoading}>
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
            )}

            {/* ⭐ MODAL DE GESTION DES PAIEMENTS */}
            {paiementsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">💰 Paiements - {paiementsModal.clients?.nom} {paiementsModal.clients?.prenom}</h2>
                                    <p className="text-sm text-gray-600">{paiementsModal.type_contrat.replace(/_/g, ' ')} - {paiementsModal.compagnies?.nom}</p>
                                </div>
                                <button onClick={() => setPaiementsModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Résumé */}
                            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Prime nette totale</p>
                                    <p className="text-lg font-bold text-gray-900">{parseFloat(paiementsModal.prime_nette).toLocaleString('fr-FR')} FCFA</p>
                                    <p className="text-xs text-success-600 mt-1">Payé: {getTotalPaye('client_prime').toLocaleString('fr-FR')} FCFA</p>
                                    <p className="text-xs text-warning-600">Restant: {(parseFloat(paiementsModal.prime_nette) - getTotalPaye('client_prime')).toLocaleString('fr-FR')} FCFA</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Commission totale</p>
                                    <p className="text-lg font-bold text-primary-600">{parseFloat(paiementsModal.commission).toLocaleString('fr-FR')} FCFA</p>
                                    <p className="text-xs text-success-600 mt-1">Reçu: {getTotalPaye('commission_compagnie').toLocaleString('fr-FR')} FCFA</p>
                                    <p className="text-xs text-warning-600">Restant: {(parseFloat(paiementsModal.commission) - getTotalPaye('commission_compagnie')).toLocaleString('fr-FR')} FCFA</p>
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
            )}

            {/* ⭐ MODAL CONFIRMATION SUPPRESSION */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-md w-full animate-scale-in">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
                                    <p className="text-sm text-gray-600 mt-1">Cette action est irréversible</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Êtes-vous sûr de vouloir supprimer ce contrat ? Tous les paiements associés seront également supprimés.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors">
                                    Annuler
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 font-medium transition-colors">
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}