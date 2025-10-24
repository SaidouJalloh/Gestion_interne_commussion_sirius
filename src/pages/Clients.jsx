
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';

// export default function Clients() {
//     const [clients, setClients] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterType, setFilterType] = useState('all');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedClient, setSelectedClient] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const { profile, isAdmin } = useAuth();

//     // 🔍 DEBUG - À retirer après vérification
//     console.log('🔍 Profile:', profile);
//     console.log('🔍 Role:', profile?.role);
//     console.log('🔍 Type of role:', typeof profile?.role);

//     const [formData, setFormData] = useState({
//         nom: '',
//         prenom: '',
//         email: '',
//         telephone: '',
//         type_client: 'particulier',
//         adresse: '',
//         ville: '',
//         code_postal: '',
//         notes: '',
//     });
//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');

//     useEffect(() => {
//         fetchClients();
//     }, []);

//     const fetchClients = async () => {
//         try {
//             setLoading(true);
//             const { data, error } = await supabase
//                 .from('clients')
//                 .select('*')
//                 .order('created_at', { ascending: false });
//             if (error) throw error;
//             setClients(data || []);
//         } catch (error) {
//             console.error('Erreur:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filteredClients = clients.filter(client => {
//         const matchSearch =
//             client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             client.telephone?.includes(searchTerm);
//         const matchType = filterType === 'all' || client.type_client === filterType;
//         return matchSearch && matchType;
//     });

//     const resetForm = () => {
//         setFormData({
//             nom: '',
//             prenom: '',
//             email: '',
//             telephone: '',
//             type_client: 'particulier',
//             adresse: '',
//             ville: '',
//             code_postal: '',
//             notes: '',
//         });
//         setFormError('');
//     };

//     const handleAdd = () => {
//         resetForm();
//         setSelectedClient(null);
//         setIsModalOpen(true);
//     };

//     const handleEdit = (client) => {
//         setSelectedClient(client);
//         setFormData({
//             nom: client.nom || '',
//             prenom: client.prenom || '',
//             email: client.email || '',
//             telephone: client.telephone || '',
//             type_client: client.type_client || 'particulier',
//             adresse: client.adresse || '',
//             ville: client.ville || '',
//             code_postal: client.code_postal || '',
//             notes: client.notes || '',
//         });
//         setFormError('');
//         setIsModalOpen(true);
//     };

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setFormError('');
//         setFormLoading(true);
//         try {
//             if (!formData.nom.trim() || !formData.prenom.trim() || !formData.telephone.trim()) {
//                 setFormError('Le nom, le prénom et le téléphone sont obligatoires');
//                 setFormLoading(false);
//                 return;
//             }
//             if (selectedClient) {
//                 const { error } = await supabase.from('clients').update(formData).eq('id', selectedClient.id);
//                 if (error) throw error;
//             } else {
//                 const { error } = await supabase.from('clients').insert([formData]);
//                 if (error) throw error;
//             }
//             await fetchClients();
//             setIsModalOpen(false);
//             resetForm();
//         } catch (err) {
//             setFormError(err.message || 'Une erreur est survenue');
//         } finally {
//             setFormLoading(false);
//         }
//     };

//     const handleDelete = async (clientId) => {
//         console.log('🗑️ Tentative de suppression du client:', clientId);
//         try {
//             const { data, error } = await supabase.from('clients').delete().eq('id', clientId);
//             console.log('🗑️ Résultat suppression - data:', data);
//             console.log('🗑️ Résultat suppression - error:', error);
//             if (error) throw error;
//             console.log('✅ Suppression réussie');
//             await fetchClients();
//             setDeleteConfirm(null);
//         } catch (error) {
//             console.error('❌ Erreur lors de la suppression:', error);
//             alert('Erreur lors de la suppression: ' + error.message);
//         }
//     };

//     const canDelete = isAdmin();
//     console.log('🔍 Can Delete:', canDelete);

//     return (
//         <>
//             <div className="mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
//                         <p className="text-gray-600 mt-1">{filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}</p>
//                     </div>
//                     <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                         </svg>
//                         Ajouter un client
//                     </button>
//                 </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
//                 <div className="flex flex-col md:flex-row gap-4">
//                     <div className="flex-1 relative">
//                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                         </svg>
//                         <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                     </div>
//                     <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
//                         <option value="all">Tous les types</option>
//                         <option value="particulier">Particuliers</option>
//                         <option value="entreprise">Entreprises</option>
//                     </select>
//                 </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//                 {loading ? (
//                     <div className="flex items-center justify-center py-12">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                     </div>
//                 ) : filteredClients.length === 0 ? (
//                     <div className="text-center py-12">
//                         <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                         </svg>
//                         <p className="text-gray-500 text-lg font-medium">Aucun client trouvé</p>
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-gray-50 border-b">
//                                 <tr>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ville</th>
//                                     <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y">
//                                 {filteredClients.map((client) => (
//                                     <tr key={client.id} className="hover:bg-gray-50">
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
//                                                     {client.nom[0]}{client.prenom[0]}
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-semibold text-gray-900">{client.nom} {client.prenom}</p>
//                                                     {client.notes && <p className="text-xs text-gray-500 truncate max-w-xs">{client.notes}</p>}
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm">
//                                             {client.email && <p className="text-gray-900">{client.email}</p>}
//                                             {client.telephone && <p className="text-gray-600">{client.telephone}</p>}
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                                 {client.type_client === 'particulier' ? '👤 Particulier' : '🏢 Entreprise'}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm">{client.ville || '-'}</td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex justify-end gap-2">
//                                                 <button onClick={() => handleEdit(client)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Modifier">
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                     </svg>
//                                                 </button>
//                                                 {canDelete && (
//                                                     <button onClick={() => setDeleteConfirm(client.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
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

//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                             <h2 className="text-xl font-bold">{selectedClient ? 'Modifier' : 'Ajouter'} un client</h2>
//                             <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                             {formError && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">{formError}</div>}

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Type <span className="text-danger-500">*</span></label>
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <button type="button" onClick={() => setFormData({ ...formData, type_client: 'particulier' })} className={`p-4 rounded-lg border-2 ${formData.type_client === 'particulier' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'particulier' ? 'bg-primary-100' : 'bg-gray-100'}`}>👤</div>
//                                             <div className="text-left">
//                                                 <p className="font-semibold">Particulier</p>
//                                                 <p className="text-xs text-gray-500">Personne physique</p>
//                                             </div>
//                                         </div>
//                                     </button>
//                                     <button type="button" onClick={() => setFormData({ ...formData, type_client: 'entreprise' })} className={`p-4 rounded-lg border-2 ${formData.type_client === 'entreprise' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'entreprise' ? 'bg-primary-100' : 'bg-gray-100'}`}>🏢</div>
//                                             <div className="text-left">
//                                                 <p className="font-semibold">Entreprise</p>
//                                                 <p className="text-xs text-gray-500">Personne morale</p>
//                                             </div>
//                                         </div>
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Nom <span className="text-danger-500">*</span></label>
//                                     <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Prénom <span className="text-danger-500">*</span></label>
//                                     <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                             </div>

//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Email</label>
//                                     <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Téléphone <span className="text-danger-500">*</span></label>
//                                     <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Adresse</label>
//                                 <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                             </div>

//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Ville</label>
//                                     <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Code postal</label>
//                                     <input type="text" name="code_postal" value={formData.code_postal} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Notes</label>
//                                 <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
//                             </div>

//                             <div className="flex gap-3 pt-4 border-t">
//                                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium" disabled={formLoading}>Annuler</button>
//                                 <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
//                                     {formLoading ? (
//                                         <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Enregistrement...</>
//                                     ) : (
//                                         <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{selectedClient ? 'Mettre à jour' : 'Créer'}</>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {deleteConfirm && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-md w-full p-6 animate-scale-in">
//                         <div className="flex items-center gap-3 mb-4">
//                             <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
//                                 <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                 </svg>
//                             </div>
//                             <div>
//                                 <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
//                                 <p className="text-sm text-gray-600">Cette action est irréversible</p>
//                             </div>
//                         </div>
//                         <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer ce client ?</p>
//                         <div className="flex gap-3">
//                             <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
//                             <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 font-medium">Supprimer</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }


















// file for client avec phone obligatoire 
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';

// export default function Clients() {
//     const [clients, setClients] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterType, setFilterType] = useState('all');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedClient, setSelectedClient] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const { profile, isAdmin } = useAuth();

//     const [formData, setFormData] = useState({
//         nom: '',
//         prenom: '',
//         email: '',
//         telephone: '',
//         type_client: 'particulier',
//         adresse: '',
//         ville: '',
//         code_postal: '',
//         notes: '',
//     });
//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');

//     // ✅ Fetch Clients - Optimisé avec useCallback
//     const fetchClients = useCallback(async () => {
//         try {
//             setLoading(true);
//             const { data, error } = await supabase
//                 .from('clients')
//                 .select('*')
//                 .order('created_at', { ascending: false });
//             if (error) throw error;
//             setClients(data || []);
//         } catch (error) {
//             console.error('Erreur:', error);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchClients();
//     }, [fetchClients]);

//     // ✅ Filtering - Optimisé avec useMemo pour éviter les recalculs inutiles
//     const filteredClients = useMemo(() => {
//         return clients.filter(client => {
//             const matchSearch =
//                 client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 client.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 client.telephone?.includes(searchTerm);
//             const matchType = filterType === 'all' || client.type_client === filterType;
//             return matchSearch && matchType;
//         });
//     }, [clients, searchTerm, filterType]);

//     // ✅ Reset Form - Optimisé avec useCallback
//     const resetForm = useCallback(() => {
//         setFormData({
//             nom: '',
//             prenom: '',
//             email: '',
//             telephone: '',
//             type_client: 'particulier',
//             adresse: '',
//             ville: '',
//             code_postal: '',
//             notes: '',
//         });
//         setFormError('');
//     }, []);

//     // ✅ Handle Change - Optimisé
//     const handleChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     }, []);

//     // Handle Add
//     const handleAdd = useCallback(() => {
//         resetForm();
//         setSelectedClient(null);
//         setIsModalOpen(true);
//     }, [resetForm]);

//     // Handle Edit
//     const handleEdit = useCallback((client) => {
//         setSelectedClient(client);
//         setFormData({
//             nom: client.nom || '',
//             prenom: client.prenom || '',
//             email: client.email || '',
//             telephone: client.telephone || '',
//             type_client: client.type_client || 'particulier',
//             adresse: client.adresse || '',
//             ville: client.ville || '',
//             code_postal: client.code_postal || '',
//             notes: client.notes || '',
//         });
//         setFormError('');
//         setIsModalOpen(true);
//     }, []);

//     // Handle Submit
//     const handleSubmit = useCallback(async (e) => {
//         e.preventDefault();
//         setFormError('');
//         setFormLoading(true);
//         try {
//             if (!formData.nom.trim() || !formData.prenom.trim() || !formData.telephone.trim()) {
//                 setFormError('Le nom, le prénom et le téléphone sont obligatoires');
//                 setFormLoading(false);
//                 return;
//             }

//             const clientData = { ...formData };
//             if (!formData.email) {
//                 delete clientData.email;
//             }

//             const { error } = selectedClient
//                 ? await supabase.from('clients').update(clientData).eq('id', selectedClient.id)
//                 : await supabase.from('clients').insert([clientData]);

//             if (error) throw error;

//             await fetchClients();
//             setIsModalOpen(false);
//             resetForm();
//         } catch (err) {
//             setFormError(err.message || 'Une erreur est survenue');
//         } finally {
//             setFormLoading(false);
//         }
//     }, [formData, selectedClient, fetchClients, resetForm]);

//     // ✅ Handle Delete - CORRIGÉ ET OPTIMISÉ avec mise à jour optimiste
//     const handleDelete = useCallback(async (clientId) => {
//         try {
//             const { error } = await supabase.from('clients').delete().eq('id', clientId);
//             if (error) throw error;

//             // Mise à jour optimiste de l'état local (plus rapide)
//             setClients(prev => prev.filter(c => c.id !== clientId));
//             setDeleteConfirm(null);
//         } catch (error) {
//             console.error('Erreur lors de la suppression:', error);
//             alert('Erreur lors de la suppression: ' + error.message);
//             // Recharger en cas d'erreur
//             fetchClients();
//         }
//     }, [fetchClients]);

//     // Change Type Client
//     const handleTypeChange = useCallback((type) => {
//         setFormData(prev => ({ ...prev, type_client: type }));
//     }, []);

//     // Close Modal
//     const closeModal = useCallback(() => {
//         setIsModalOpen(false);
//     }, []);

//     // ✅ Can Delete Check - Optimisé avec useMemo
//     const canDelete = useMemo(() => isAdmin(), [isAdmin]);

//     return (
//         <>
//             <div className="mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
//                         <p className="text-gray-600 mt-1">{filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}</p>
//                     </div>
//                     <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                         </svg>
//                         Ajouter un client
//                     </button>
//                 </div>
//             </div>

//             {/* Search and Filter */}
//             <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
//                 <div className="flex flex-col md:flex-row gap-4">
//                     <div className="flex-1 relative">
//                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                         </svg>
//                         <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                     </div>
//                     <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
//                         <option value="all">Tous les types</option>
//                         <option value="particulier">Particuliers</option>
//                         <option value="entreprise">Entreprises</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Clients Table */}
//             <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//                 {loading ? (
//                     <div className="flex items-center justify-center py-12">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                     </div>
//                 ) : filteredClients.length === 0 ? (
//                     <div className="text-center py-12">
//                         <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                         </svg>
//                         <p className="text-gray-500 text-lg font-medium">Aucun client trouvé</p>
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-gray-50 border-b">
//                                 <tr>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ville</th>
//                                     <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y">
//                                 {filteredClients.map((client) => (
//                                     <tr key={client.id} className="hover:bg-gray-50">
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
//                                                     {client.nom?.[0]}{client.prenom?.[0]}
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-semibold text-gray-900">{client.nom} {client.prenom}</p>
//                                                     {client.notes && <p className="text-xs text-gray-500 truncate max-w-xs">{client.notes}</p>}
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm">
//                                             {client.email && <p className="text-gray-900">{client.email}</p>}
//                                             {client.telephone && <p className="text-gray-600">{client.telephone}</p>}
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                                 {client.type_client === 'particulier' ? '👤 Particulier' : '🏢 Entreprise'}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm">{client.ville || '-'}</td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex justify-end gap-2">
//                                                 <button onClick={() => handleEdit(client)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Modifier">
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                     </svg>
//                                                 </button>
//                                                 {canDelete && (
//                                                     <button onClick={() => setDeleteConfirm(client.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
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

//             {/* ✅ Modal de confirmation de suppression - AJOUTÉ */}
//             {deleteConfirm && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-strong max-w-md w-full p-6 animate-scale-in">
//                         <div className="flex items-center gap-4 mb-4">
//                             <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center">
//                                 <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                 </svg>
//                             </div>
//                             <div>
//                                 <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
//                                 <p className="text-sm text-gray-600">Cette action est irréversible</p>
//                             </div>
//                         </div>
//                         <div className="flex gap-3">
//                             <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">
//                                 Annuler
//                             </button>
//                             <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 font-medium">
//                                 Supprimer
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Modal Form for Add/Edit */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                             <h2 className="text-xl font-bold">{selectedClient ? 'Modifier' : 'Ajouter'} un client</h2>
//                             <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                             {formError && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">{formError}</div>}

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Type <span className="text-danger-500">*</span></label>
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <button type="button" onClick={() => handleTypeChange('particulier')} className={`p-4 rounded-lg border-2 transition-all ${formData.type_client === 'particulier' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'particulier' ? 'bg-primary-100' : 'bg-gray-100'}`}>👤</div>
//                                             <div className="text-left">
//                                                 <p className="font-semibold">Particulier</p>
//                                                 <p className="text-xs text-gray-500">Personne physique</p>
//                                             </div>
//                                         </div>
//                                     </button>
//                                     <button type="button" onClick={() => handleTypeChange('entreprise')} className={`p-4 rounded-lg border-2 transition-all ${formData.type_client === 'entreprise' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'entreprise' ? 'bg-primary-100' : 'bg-gray-100'}`}>🏢</div>
//                                             <div className="text-left">
//                                                 <p className="font-semibold">Entreprise</p>
//                                                 <p className="text-xs text-gray-500">Personne morale</p>
//                                             </div>
//                                         </div>
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Nom <span className="text-danger-500">*</span></label>
//                                     <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Prénom <span className="text-danger-500">*</span></label>
//                                     <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                             </div>

//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Email</label>
//                                     <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Téléphone <span className="text-danger-500">*</span></label>
//                                     <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Adresse</label>
//                                 <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                             </div>

//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Ville</label>
//                                     <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Code postal</label>
//                                     <input type="text" name="code_postal" value={formData.code_postal} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Notes</label>
//                                 <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
//                             </div>

//                             <div className="flex gap-3 pt-4 border-t">
//                                 <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium" disabled={formLoading}>Annuler</button>
//                                 <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
//                                     {formLoading ? (
//                                         <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Enregistrement...</>
//                                     ) : (
//                                         <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{selectedClient ? 'Mettre à jour' : 'Créer'}</>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }

















// code avec phone et email optionel pour changer on use last code et les deux tables dans la bd
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';
// // import toast from 'react-hot-toast';
// export default function Clients() {
//     const [clients, setClients] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterType, setFilterType] = useState('all');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedClient, setSelectedClient] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const { isAdmin } = useAuth();

//     const [formData, setFormData] = useState({
//         nom: '',
//         prenom: '',
//         email: '',
//         telephone: '',
//         type_client: 'particulier',
//         adresse: '',
//         ville: '',
//         code_postal: '',
//         notes: '',
//     });
//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');

//     // Fetch Clients - Optimisé avec useCallback
//     const fetchClients = useCallback(async () => {
//         try {
//             setLoading(true);
//             const { data, error } = await supabase
//                 .from('clients')
//                 .select('*')
//                 .order('created_at', { ascending: false });
//             if (error) throw error;
//             setClients(data || []);
//         } catch (error) {
//             console.error('Erreur:', error);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchClients();
//     }, [fetchClients]);

//     // Filtering - Optimisé avec useMemo
//     const filteredClients = useMemo(() => {
//         return clients.filter(client => {
//             const matchSearch =
//                 client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 client.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 client.telephone?.includes(searchTerm);
//             const matchType = filterType === 'all' || client.type_client === filterType;
//             return matchSearch && matchType;
//         });
//     }, [clients, searchTerm, filterType]);

//     // Reset Form
//     const resetForm = useCallback(() => {
//         setFormData({
//             nom: '',
//             prenom: '',
//             email: '',
//             telephone: '',
//             type_client: 'particulier',
//             adresse: '',
//             ville: '',
//             code_postal: '',
//             notes: '',
//         });
//         setFormError('');
//     }, []);

//     // Handle Change
//     const handleChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     }, []);

//     // Handle Add
//     const handleAdd = useCallback(() => {
//         resetForm();
//         setSelectedClient(null);
//         setIsModalOpen(true);
//     }, [resetForm]);

//     // Handle Edit
//     const handleEdit = useCallback((client) => {
//         setSelectedClient(client);
//         setFormData({
//             nom: client.nom || '',
//             prenom: client.prenom || '',
//             email: client.email || '',
//             telephone: client.telephone || '',
//             type_client: client.type_client || 'particulier',
//             adresse: client.adresse || '',
//             ville: client.ville || '',
//             code_postal: client.code_postal || '',
//             notes: client.notes || '',
//         });
//         setFormError('');
//         setIsModalOpen(true);
//     }, []);

//     // Handle Submit - ✅ TÉLÉPHONE OPTIONNEL
//     const handleSubmit = useCallback(async (e) => {
//         e.preventDefault();
//         setFormError('');
//         setFormLoading(true);
//         try {
//             // ✅ Seuls nom et prénom sont obligatoires maintenant
//             if (!formData.nom.trim() || !formData.prenom.trim()) {
//                 setFormError('Le nom et le prénom sont obligatoires');
//                 setFormLoading(false);
//                 return;
//             }

//             const clientData = { ...formData };

//             // Nettoyer les champs vides
//             if (!formData.email) {
//                 delete clientData.email;
//             }
//             if (!formData.telephone) {
//                 delete clientData.telephone;
//             }

//             const { error } = selectedClient
//                 ? await supabase.from('clients').update(clientData).eq('id', selectedClient.id)
//                 : await supabase.from('clients').insert([clientData]);

//             if (error) throw error;

//             await fetchClients();
//             setIsModalOpen(false);
//             resetForm();
//         } catch (err) {
//             setFormError(err.message || 'Une erreur est survenue');
//         } finally {
//             setFormLoading(false);
//         }
//     }, [formData, selectedClient, fetchClients, resetForm]);

//     // Handle Delete
//     const handleDelete = useCallback(async (clientId) => {
//         try {
//             const { error } = await supabase.from('clients').delete().eq('id', clientId);
//             if (error) throw error;

//             setClients(prev => prev.filter(c => c.id !== clientId));
//             setDeleteConfirm(null);
//         } catch (error) {
//             console.error('Erreur lors de la suppression:', error);
//             alert('Erreur lors de la suppression: ' + error.message);
//             fetchClients();
//         }
//     }, [fetchClients]);

//     // Change Type Client
//     const handleTypeChange = useCallback((type) => {
//         setFormData(prev => ({ ...prev, type_client: type }));
//     }, []);

//     // Close Modal
//     const closeModal = useCallback(() => {
//         setIsModalOpen(false);
//     }, []);

//     // Can Delete Check
//     const canDelete = useMemo(() => isAdmin(), [isAdmin]);

//     return (
//         <>
//             <div className="mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
//                         <p className="text-gray-600 mt-1">{filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}</p>
//                     </div>
//                     <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                         </svg>
//                         Ajouter un client
//                     </button>
//                 </div>
//             </div>

//             {/* Search and Filter */}
//             <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
//                 <div className="flex flex-col md:flex-row gap-4">
//                     <div className="flex-1 relative">
//                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                         </svg>
//                         <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                     </div>
//                     <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
//                         <option value="all">Tous les types</option>
//                         <option value="particulier">Particuliers</option>
//                         <option value="entreprise">Entreprises</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Clients Table */}
//             <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//                 {loading ? (
//                     <div className="flex items-center justify-center py-12">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                     </div>
//                 ) : filteredClients.length === 0 ? (
//                     <div className="text-center py-12">
//                         <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                         </svg>
//                         <p className="text-gray-500 text-lg font-medium">Aucun client trouvé</p>
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-gray-50 border-b">
//                                 <tr>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ville</th>
//                                     <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y">
//                                 {filteredClients.map((client) => (
//                                     <tr key={client.id} className="hover:bg-gray-50">
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
//                                                     {client.nom?.[0]}{client.prenom?.[0]}
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-semibold text-gray-900">{client.nom} {client.prenom}</p>
//                                                     {client.notes && <p className="text-xs text-gray-500 truncate max-w-xs">{client.notes}</p>}
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm">
//                                             {client.email && <p className="text-gray-900">{client.email}</p>}
//                                             {client.telephone && <p className="text-gray-600">{client.telephone}</p>}
//                                             {!client.email && !client.telephone && <p className="text-gray-400">-</p>}
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                                 {client.type_client === 'particulier' ? '👤 Particulier' : '🏢 Entreprise'}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm">{client.ville || '-'}</td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex justify-end gap-2">
//                                                 <button onClick={() => handleEdit(client)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Modifier">
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                     </svg>
//                                                 </button>
//                                                 {canDelete && (
//                                                     <button onClick={() => setDeleteConfirm(client.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
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

//             {/* Modal de confirmation de suppression */}
//             {deleteConfirm && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-strong max-w-md w-full p-6 animate-scale-in">
//                         <div className="flex items-center gap-4 mb-4">
//                             <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center">
//                                 <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                 </svg>
//                             </div>
//                             <div>
//                                 <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
//                                 <p className="text-sm text-gray-600">Cette action est irréversible</p>
//                             </div>
//                         </div>
//                         <div className="flex gap-3">
//                             <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">
//                                 Annuler
//                             </button>
//                             <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 font-medium">
//                                 Supprimer
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Modal Form */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                             <h2 className="text-xl font-bold">{selectedClient ? 'Modifier' : 'Ajouter'} un client</h2>
//                             <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                             {formError && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">{formError}</div>}

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Type <span className="text-danger-500">*</span></label>
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <button type="button" onClick={() => handleTypeChange('particulier')} className={`p-4 rounded-lg border-2 transition-all ${formData.type_client === 'particulier' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'particulier' ? 'bg-primary-100' : 'bg-gray-100'}`}>👤</div>
//                                             <div className="text-left">
//                                                 <p className="font-semibold">Particulier</p>
//                                                 <p className="text-xs text-gray-500">Personne physique</p>
//                                             </div>
//                                         </div>
//                                     </button>
//                                     <button type="button" onClick={() => handleTypeChange('entreprise')} className={`p-4 rounded-lg border-2 transition-all ${formData.type_client === 'entreprise' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'entreprise' ? 'bg-primary-100' : 'bg-gray-100'}`}>🏢</div>
//                                             <div className="text-left">
//                                                 <p className="font-semibold">Entreprise</p>
//                                                 <p className="text-xs text-gray-500">Personne morale</p>
//                                             </div>
//                                         </div>
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Nom <span className="text-danger-500">*</span></label>
//                                     <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Prénom <span className="text-danger-500">*</span></label>
//                                     <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
//                                 </div>
//                             </div>

//                             {/* ✅ EMAIL ET TÉLÉPHONE OPTIONNELS */}
//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Email</label>
//                                     <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Téléphone</label>
//                                     <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Adresse</label>
//                                 <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                             </div>

//                             <div className="grid md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Ville</label>
//                                     <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Code postal</label>
//                                     <input type="text" name="code_postal" value={formData.code_postal} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Notes</label>
//                                 <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
//                             </div>

//                             <div className="flex gap-3 pt-4 border-t">
//                                 <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium" disabled={formLoading}>Annuler</button>
//                                 <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
//                                     {formLoading ? (
//                                         <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Enregistrement...</>
//                                     ) : (
//                                         <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{selectedClient ? 'Mettre à jour' : 'Créer'}</>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }














// // ============================================
// // CLIENTS.JSX - VERSION OPTIMISÉE COMPLÈTE
// // ============================================
// import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';
// import toast from 'react-hot-toast';
// import { useDebounce } from '../hooks/useDebounce';
// import { useKeyboard } from '../hooks/useKeyboard';
// import { CardSkeleton } from '../components/LoadingStates';

// export default function Clients() {
//     const [clients, setClients] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterType, setFilterType] = useState('all');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedClient, setSelectedClient] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const { isAdmin } = useAuth();
//     const searchRef = useRef(null);

//     // ✅ Debounce pour recherche fluide
//     const debouncedSearch = useDebounce(searchTerm, 300);

//     const [formData, setFormData] = useState({
//         nom: '',
//         prenom: '',
//         email: '',
//         telephone: '',
//         type_client: 'particulier',
//         adresse: '',
//         ville: '',
//         code_postal: '',
//         notes: '',
//     });
//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');

//     // ============================================
//     // RACCOURCIS CLAVIER
//     // ============================================

//     // Ctrl+N pour ouvrir modal
//     useKeyboard('n', (e) => {
//         if (e.ctrlKey || e.metaKey) {
//             e.preventDefault();
//             handleAdd();
//         }
//     }, []);

//     // Escape pour fermer modal
//     useKeyboard('Escape', () => {
//         if (isModalOpen) closeModal();
//         if (deleteConfirm) setDeleteConfirm(null);
//     }, [isModalOpen, deleteConfirm]);

//     // / pour focus sur recherche
//     useKeyboard('/', (e) => {
//         e.preventDefault();
//         searchRef.current?.focus();
//     }, []);

//     // ============================================
//     // FETCH CLIENTS
//     // ============================================

//     const fetchClients = useCallback(async () => {
//         try {
//             setLoading(true);
//             const { data, error } = await supabase
//                 .from('clients')
//                 .select('*')
//                 .order('created_at', { ascending: false });

//             if (error) throw error;
//             setClients(data || []);
//         } catch (error) {
//             console.error('Erreur:', error);
//             toast.error('Erreur lors du chargement des clients');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchClients();
//     }, [fetchClients]);

//     // ============================================
//     // FILTERING (Optimisé avec useMemo + debounce)
//     // ============================================

//     const filteredClients = useMemo(() => {
//         return clients.filter(client => {
//             const matchSearch =
//                 client.nom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//                 client.prenom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//                 client.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//                 client.telephone?.includes(debouncedSearch);
//             const matchType = filterType === 'all' || client.type_client === filterType;
//             return matchSearch && matchType;
//         });
//     }, [clients, debouncedSearch, filterType]);

//     // Statistiques
//     const stats = useMemo(() => ({
//         total: clients.length,
//         particuliers: clients.filter(c => c.type_client === 'particulier').length,
//         entreprises: clients.filter(c => c.type_client === 'entreprise').length,
//     }), [clients]);

//     // ============================================
//     // FORM HANDLERS
//     // ============================================

//     const resetForm = useCallback(() => {
//         setFormData({
//             nom: '',
//             prenom: '',
//             email: '',
//             telephone: '',
//             type_client: 'particulier',
//             adresse: '',
//             ville: '',
//             code_postal: '',
//             notes: '',
//         });
//         setFormError('');
//     }, []);

//     const handleChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     }, []);

//     const handleTypeChange = useCallback((type) => {
//         setFormData(prev => ({ ...prev, type_client: type }));
//     }, []);

//     const handleAdd = useCallback(() => {
//         resetForm();
//         setSelectedClient(null);
//         setIsModalOpen(true);
//     }, [resetForm]);

//     const handleEdit = useCallback((client) => {
//         setSelectedClient(client);
//         setFormData({
//             nom: client.nom || '',
//             prenom: client.prenom || '',
//             email: client.email || '',
//             telephone: client.telephone || '',
//             type_client: client.type_client || 'particulier',
//             adresse: client.adresse || '',
//             ville: client.ville || '',
//             code_postal: client.code_postal || '',
//             notes: client.notes || '',
//         });
//         setFormError('');
//         setIsModalOpen(true);
//     }, []);

//     const closeModal = useCallback(() => {
//         setIsModalOpen(false);
//         setSelectedClient(null);
//         resetForm();
//     }, [resetForm]);

//     // ============================================
//     // SUBMIT FORM (avec Toast Promise)
//     // ============================================

//     const handleSubmit = useCallback(async (e) => {
//         e.preventDefault();
//         setFormError('');
//         setFormLoading(true);

//         try {
//             // Validation
//             if (!formData.nom.trim() || !formData.prenom.trim()) {
//                 const errorMsg = 'Le nom et le prénom sont obligatoires';
//                 setFormError(errorMsg);
//                 toast.error(errorMsg);
//                 setFormLoading(false);
//                 return;
//             }

//             const clientData = { ...formData };

//             // Nettoyer les champs vides
//             Object.keys(clientData).forEach(key => {
//                 if (clientData[key] === '') {
//                     clientData[key] = null;
//                 }
//             });

//             let promise;

//             if (selectedClient) {
//                 // Update
//                 promise = supabase
//                     .from('clients')
//                     .update(clientData)
//                     .eq('id', selectedClient.id);
//             } else {
//                 // Insert
//                 promise = supabase
//                     .from('clients')
//                     .insert([clientData]);
//             }

//             // ✅ Toast avec promesse
//             await toast.promise(promise, {
//                 loading: selectedClient ? 'Mise à jour...' : 'Création...',
//                 success: selectedClient ? 'Client mis à jour avec succès ! 🎉' : 'Client créé avec succès ! 🎉',
//                 error: (err) => `Erreur: ${err.message}`,
//             });

//             await fetchClients();
//             closeModal();
//         } catch (error) {
//             console.error('Erreur:', error);
//             setFormError(error.message);
//         } finally {
//             setFormLoading(false);
//         }
//     }, [formData, selectedClient, fetchClients, closeModal]);

//     // ============================================
//     // DELETE (avec Toast Promise)
//     // ============================================

//     const handleDelete = useCallback(async (clientId) => {
//         try {
//             const promise = supabase
//                 .from('clients')
//                 .delete()
//                 .eq('id', clientId);

//             // ✅ Toast avec promesse
//             await toast.promise(promise, {
//                 loading: 'Suppression...',
//                 success: 'Client supprimé avec succès ! 🗑️',
//                 error: 'Erreur lors de la suppression',
//             });

//             await fetchClients();
//             setDeleteConfirm(null);
//         } catch (error) {
//             console.error('Erreur:', error);
//         }
//     }, [fetchClients]);

//     // ============================================
//     // RENDER
//     // ============================================

//     return (
//         <div className="animate-fade-in">
//             {/* ============================================
//                 HEADER
//                 ============================================ */}
//             <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Clients</h1>
//                     <p className="text-gray-600">Gérez votre portefeuille de clients</p>
//                 </div>
//                 <button
//                     onClick={handleAdd}
//                     className="px-6 py-3 bg-primary-600 text-white rounded-lg hover-lift flex items-center gap-2 font-medium"
//                 >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                     Ajouter un client
//                     <span className="hidden sm:inline text-xs opacity-75">(Ctrl+N)</span>
//                 </button>
//             </div>

//             {/* ============================================
//                 STATISTIQUES
//                 ============================================ */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//                 <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover-lift">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-blue-100 text-sm font-medium">Total Clients</p>
//                             <p className="text-3xl font-bold mt-1">{stats.total}</p>
//                         </div>
//                         <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
//                             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                             </svg>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover-lift">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-green-100 text-sm font-medium">Particuliers</p>
//                             <p className="text-3xl font-bold mt-1">{stats.particuliers}</p>
//                         </div>
//                         <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
//                             👤
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover-lift">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-purple-100 text-sm font-medium">Entreprises</p>
//                             <p className="text-3xl font-bold mt-1">{stats.entreprises}</p>
//                         </div>
//                         <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
//                             🏢
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ============================================
//                 FILTRES & RECHERCHE
//                 ============================================ */}
//             <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* Recherche */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                             🔍 Rechercher
//                             <span className="text-xs text-gray-500 ml-2">(Appuyez sur /)</span>
//                         </label>
//                         <input
//                             ref={searchRef}
//                             type="text"
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             placeholder="Nom, prénom, email, téléphone..."
//                             className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                         />
//                     </div>

//                     {/* Filtre Type */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Type de client</label>
//                         <select
//                             value={filterType}
//                             onChange={(e) => setFilterType(e.target.value)}
//                             className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                         >
//                             <option value="all">Tous les clients</option>
//                             <option value="particulier">Particuliers uniquement</option>
//                             <option value="entreprise">Entreprises uniquement</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* Résultats */}
//                 {(searchTerm || filterType !== 'all') && (
//                     <div className="mt-4 pt-4 border-t">
//                         <p className="text-sm text-gray-600">
//                             <span className="font-semibold text-primary-600">{filteredClients.length}</span> résultat{filteredClients.length > 1 ? 's' : ''} trouvé{filteredClients.length > 1 ? 's' : ''}
//                         </p>
//                     </div>
//                 )}
//             </div>

//             {/* ============================================
//                 TABLEAU DES CLIENTS
//                 ============================================ */}
//             <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//                 {loading ? (
//                     <div className="p-6 space-y-4">
//                         <CardSkeleton />
//                         <CardSkeleton />
//                         <CardSkeleton />
//                     </div>
//                 ) : filteredClients.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-16 px-4">
//                         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                             <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                             </svg>
//                         </div>
//                         <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                             {searchTerm || filterType !== 'all' ? 'Aucun résultat' : 'Aucun client'}
//                         </h3>
//                         <p className="text-gray-600 text-center mb-6 max-w-md">
//                             {searchTerm || filterType !== 'all'
//                                 ? 'Essayez de modifier vos critères de recherche ou filtres.'
//                                 : 'Commencez par créer votre premier client pour voir vos données ici.'}
//                         </p>
//                         {!searchTerm && filterType === 'all' && (
//                             <button
//                                 onClick={handleAdd}
//                                 className="px-6 py-3 bg-primary-600 text-white rounded-lg hover-lift flex items-center gap-2"
//                             >
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                                 </svg>
//                                 Créer un client
//                             </button>
//                         )}
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead className="bg-gray-50 border-b border-gray-200">
//                                 <tr>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
//                                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Localisation</th>
//                                     <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-200">
//                                 {filteredClients.map((client, index) => (
//                                     <tr
//                                         key={client.id}
//                                         className={`hover:bg-gray-50 transition-colors animate-slide-in delay-${Math.min(index * 50, 200)}`}
//                                     >
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
//                                                     {client.nom?.charAt(0)}{client.prenom?.charAt(0)}
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-semibold text-gray-900">{client.nom} {client.prenom}</p>
//                                                     {client.notes && (
//                                                         <p className="text-xs text-gray-500 truncate max-w-xs">{client.notes}</p>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${client.type_client === 'particulier'
//                                                 ? 'bg-green-100 text-green-700'
//                                                 : 'bg-purple-100 text-purple-700'
//                                                 }`}>
//                                                 {client.type_client === 'particulier' ? '👤' : '🏢'}
//                                                 {client.type_client === 'particulier' ? 'Particulier' : 'Entreprise'}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="text-sm">
//                                                 {client.email && (
//                                                     <p className="text-gray-900 mb-1">📧 {client.email}</p>
//                                                 )}
//                                                 {client.telephone && (
//                                                     <p className="text-gray-600">📱 {client.telephone}</p>
//                                                 )}
//                                                 {!client.email && !client.telephone && (
//                                                     <p className="text-gray-400 text-xs">Non renseigné</p>
//                                                 )}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="text-sm text-gray-600">
//                                                 {client.ville ? (
//                                                     <p>📍 {client.ville}</p>
//                                                 ) : (
//                                                     <p className="text-gray-400 text-xs">Non renseigné</p>
//                                                 )}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center justify-end gap-2">
//                                                 <button
//                                                     onClick={() => handleEdit(client)}
//                                                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                                     title="Modifier"
//                                                 >
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                     </svg>
//                                                 </button>
//                                                 {isAdmin && (
//                                                     <button
//                                                         onClick={() => setDeleteConfirm(client.id)}
//                                                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                                                         title="Supprimer"
//                                                     >
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

//             {/* ============================================
//                 MODAL DE CONFIRMATION SUPPRESSION
//                 ============================================ */}
//             {deleteConfirm && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-md w-full p-6 animate-scale-in">
//                         <div className="flex items-center gap-4 mb-4">
//                             <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
//                                 <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                 </svg>
//                             </div>
//                             <div>
//                                 <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
//                                 <p className="text-sm text-gray-600">Cette action est irréversible</p>
//                             </div>
//                         </div>
//                         <p className="text-gray-600 mb-6">
//                             Êtes-vous sûr de vouloir supprimer ce client ? Toutes les données associées seront également supprimées.
//                         </p>
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => setDeleteConfirm(null)}
//                                 className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
//                             >
//                                 Annuler
//                             </button>
//                             <button
//                                 onClick={() => handleDelete(deleteConfirm)}
//                                 className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
//                             >
//                                 Supprimer
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ============================================
//                 MODAL FORMULAIRE
//                 ============================================ */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
//                             <h2 className="text-xl font-bold">
//                                 {selectedClient ? '✏️ Modifier' : '➕ Ajouter'} un client
//                             </h2>
//                             <button
//                                 onClick={closeModal}
//                                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                             >
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>

//                         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                             {formError && (
//                                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
//                                     <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                     <span>{formError}</span>
//                                 </div>
//                             )}

//                             {/* Type de client */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">
//                                     Type de client <span className="text-red-500">*</span>
//                                 </label>
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <button
//                                         type="button"
//                                         onClick={() => handleTypeChange('particulier')}
//                                         className={`p-4 rounded-lg border-2 transition-all hover-lift ${formData.type_client === 'particulier'
//                                             ? 'border-primary-500 bg-primary-50'
//                                             : 'border-gray-200 hover:border-primary-300'
//                                             }`}
//                                     >
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'particulier' ? 'bg-primary-100' : 'bg-gray-100'
//                                                 }`}>
//                                                 👤
//                                             </div>
//                                             <div className="text-left">
//                                                 <p className="font-semibold">Particulier</p>
//                                                 <p className="text-xs text-gray-500">Personne physique</p>
//                                             </div>
//                                         </div>
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => handleTypeChange('entreprise')}
//                                         className={`p-4 rounded-lg border-2 transition-all hover-lift ${formData.type_client === 'entreprise'
//                                             ? 'border-primary-500 bg-primary-50'
//                                             : 'border-gray-200 hover:border-primary-300'
//                                             }`}
//                                     >
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'entreprise' ? 'bg-primary-100' : 'bg-gray-100'
//                                                 }`}>
//                                                 🏢
//                                             </div>
//                                             <div className="text-left">
//                                                 <p className="font-semibold">Entreprise</p>
//                                                 <p className="text-xs text-gray-500">Personne morale</p>
//                                             </div>
//                                         </div>
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Nom & Prénom */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">
//                                         Nom <span className="text-red-500">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="nom"
//                                         value={formData.nom}
//                                         onChange={handleChange}
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                                         required
//                                         placeholder="Dupont"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">
//                                         Prénom <span className="text-red-500">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="prenom"
//                                         value={formData.prenom}
//                                         onChange={handleChange}
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                                         required
//                                         placeholder="Jean"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Email & Téléphone */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Email</label>
//                                     <input
//                                         type="email"
//                                         name="email"
//                                         value={formData.email}
//                                         onChange={handleChange}
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                                         placeholder="jean.dupont@email.com"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Téléphone</label>
//                                     <input
//                                         type="tel"
//                                         name="telephone"
//                                         value={formData.telephone}
//                                         onChange={handleChange}
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                                         placeholder="+221 77 123 45 67"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Adresse */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Adresse</label>
//                                 <input
//                                     type="text"
//                                     name="adresse"
//                                     value={formData.adresse}
//                                     onChange={handleChange}
//                                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                                     placeholder="123 Rue de la Paix"
//                                 />
//                             </div>

//                             {/* Ville & Code Postal */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Ville</label>
//                                     <input
//                                         type="text"
//                                         name="ville"
//                                         value={formData.ville}
//                                         onChange={handleChange}
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                                         placeholder="Dakar"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">Code postal</label>
//                                     <input
//                                         type="text"
//                                         name="code_postal"
//                                         value={formData.code_postal}
//                                         onChange={handleChange}
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                                         placeholder="10000"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Notes */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Notes</label>
//                                 <textarea
//                                     name="notes"
//                                     value={formData.notes}
//                                     onChange={handleChange}
//                                     rows={3}
//                                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
//                                     placeholder="Informations complémentaires..."
//                                 />
//                             </div>

//                             {/* Actions */}
//                             <div className="flex gap-3 pt-4 border-t">
//                                 <button
//                                     type="button"
//                                     onClick={closeModal}
//                                     className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
//                                     disabled={formLoading}
//                                 >
//                                     Annuler
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={formLoading}
//                                     className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
//                                 >
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
//                                             {selectedClient ? 'Mettre à jour' : 'Créer'}
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }




















// client optimise
import { useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboard } from '../hooks/useKeyboard';
import { useClientsData } from '../hooks/useClientsData';
import { CardSkeleton } from '../components/LoadingStates';

export default function Clients() {
    // ⚡ Utilise le hook personnalisé
    const { clients, loading, refetch } = useClientsData();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const { isAdmin } = useAuth();
    const searchRef = useRef(null);

    const debouncedSearch = useDebounce(searchTerm, 300);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        type_client: 'particulier',
        adresse: '',
        ville: '',
        code_postal: '',
        notes: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // ⚡ OPTIMISATION : Memoize filtrage
    const filteredClients = useMemo(() => {
        if (!debouncedSearch && filterType === 'all') return clients;

        return clients.filter(client => {
            const matchSearch = !debouncedSearch ||
                client.nom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                client.prenom?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                client.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                client.telephone?.includes(debouncedSearch);
            const matchType = filterType === 'all' || client.type_client === filterType;
            return matchSearch && matchType;
        });
    }, [clients, debouncedSearch, filterType]);

    // ⚡ OPTIMISATION : Memoize stats
    const stats = useMemo(() => ({
        total: clients.length,
        particuliers: clients.filter(c => c.type_client === 'particulier').length,
        entreprises: clients.filter(c => c.type_client === 'entreprise').length,
    }), [clients]);

    const resetForm = useCallback(() => {
        setFormData({
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            type_client: 'particulier',
            adresse: '',
            ville: '',
            code_postal: '',
            notes: '',
        });
        setFormError('');
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleTypeChange = useCallback((type) => {
        setFormData(prev => ({ ...prev, type_client: type }));
    }, []);

    const handleAdd = useCallback(() => {
        resetForm();
        setSelectedClient(null);
        setIsModalOpen(true);
    }, [resetForm]);

    const handleEdit = useCallback((client) => {
        setSelectedClient(client);
        setFormData({
            nom: client.nom || '',
            prenom: client.prenom || '',
            email: client.email || '',
            telephone: client.telephone || '',
            type_client: client.type_client || 'particulier',
            adresse: client.adresse || '',
            ville: client.ville || '',
            code_postal: client.code_postal || '',
            notes: client.notes || '',
        });
        setFormError('');
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedClient(null);
        resetForm();
    }, [resetForm]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            if (!formData.nom || !formData.prenom) {
                setFormError('Nom et prénom sont obligatoires');
                setFormLoading(false);
                return;
            }

            if (selectedClient) {
                const { error } = await supabase
                    .from('clients')
                    .update(formData)
                    .eq('id', selectedClient.id);

                if (error) throw error;
                toast.success('Client mis à jour ! 🎉');
            } else {
                const { error } = await supabase
                    .from('clients')
                    .insert([formData]);

                if (error) throw error;
                toast.success('Client créé ! 🎉');
            }

            await refetch();
            closeModal();
        } catch (err) {
            setFormError(err.message || 'Une erreur est survenue');
        } finally {
            setFormLoading(false);
        }
    }, [formData, selectedClient, refetch, closeModal]);

    const handleDelete = useCallback(async (clientId) => {
        try {
            const promise = supabase
                .from('clients')
                .delete()
                .eq('id', clientId);

            await toast.promise(promise, {
                loading: 'Suppression...',
                success: 'Client supprimé ! 🗑️',
                error: 'Erreur lors de la suppression',
            });

            await refetch();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Erreur:', error);
        }
    }, [refetch]);

    // Raccourcis clavier
    useKeyboard('n', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleAdd();
        }
    }, [handleAdd]);

    useKeyboard('Escape', () => {
        if (isModalOpen) closeModal();
        if (deleteConfirm) setDeleteConfirm(null);
    }, [isModalOpen, deleteConfirm, closeModal]);

    useKeyboard('/', (e) => {
        e.preventDefault();
        searchRef.current?.focus();
    }, []);

    return (
        <div className="animate-fade-in">
            {/* Header avec stats */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Clients</h1>
                        <p className="text-gray-600">Gérez votre portefeuille clients</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover-lift flex items-center gap-2 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nouveau client
                        <span className="hidden sm:inline text-xs opacity-75">(Ctrl+N)</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Clients</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                👥
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Particuliers</p>
                                <p className="text-3xl font-bold mt-1">{stats.particuliers}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                👤
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover-lift">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Entreprises</p>
                                <p className="text-3xl font-bold mt-1">{stats.entreprises}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                                🏢
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher un client... (Appuyez sur /)"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    >
                        <option value="all">Tous les types</option>
                        <option value="particulier">Particuliers</option>
                        <option value="entreprise">Entreprises</option>
                    </select>
                </div>
            </div>

            {/* Liste des clients */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-soft">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">Aucun client trouvé</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="bg-white rounded-xl shadow-soft p-6 hover-lift">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${client.type_client === 'entreprise' ? 'bg-purple-100' : 'bg-blue-100'
                                        }`}>
                                        {client.type_client === 'entreprise' ? '🏢' : '👤'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{client.nom} {client.prenom}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${client.type_client === 'entreprise'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {client.type_client === 'entreprise' ? 'Entreprise' : 'Particulier'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {client.email && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {client.email}
                                    </p>
                                )}
                                {client.telephone && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {client.telephone}
                                    </p>
                                )}
                                {client.ville && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {client.ville}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    onClick={() => handleEdit(client)}
                                    className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 font-medium transition-colors"
                                >
                                    Modifier
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => setDeleteConfirm(client.id)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Formulaire */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold">{selectedClient ? 'Modifier' : 'Nouveau'} client</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {formError}
                                </div>
                            )}

                            {/* Type de client */}
                            <div>
                                <label className="block text-sm font-medium mb-3">Type de client</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('particulier')}
                                        className={`p-4 border-2 rounded-lg transition-all ${formData.type_client === 'particulier'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'particulier' ? 'bg-primary-100' : 'bg-gray-100'
                                                }`}>
                                                👤
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Particulier</p>
                                                <p className="text-xs text-gray-500">Personne physique</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('entreprise')}
                                        className={`p-4 border-2 rounded-lg transition-all ${formData.type_client === 'entreprise'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'entreprise' ? 'bg-primary-100' : 'bg-gray-100'
                                                }`}>
                                                🏢
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Entreprise</p>
                                                <p className="text-xs text-gray-500">Personne morale</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Nom & Prénom */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        required
                                        placeholder="Dupont"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        required
                                        placeholder="Jean"
                                    />
                                </div>
                            </div>

                            {/* Email & Téléphone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="jean.dupont@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Téléphone</label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="+221 77 123 45 67"
                                    />
                                </div>
                            </div>

                            {/* Adresse */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Adresse</label>
                                <input
                                    type="text"
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="123 Rue de la Paix"
                                />
                            </div>

                            {/* Ville & Code Postal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ville</label>
                                    <input
                                        type="text"
                                        name="ville"
                                        value={formData.ville}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Dakar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Code postal</label>
                                    <input
                                        type="text"
                                        name="code_postal"
                                        value={formData.code_postal}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="10000"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
                                    placeholder="Informations complémentaires..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
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
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {selectedClient ? 'Mettre à jour' : 'Créer'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirmation Suppression */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-md w-full p-6 animate-scale-in">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
                                <p className="text-sm text-gray-600">Cette action est irréversible</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}