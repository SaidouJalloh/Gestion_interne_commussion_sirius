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
//     const { profile } = useAuth();

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
//             if (!formData.nom.trim() || !formData.prenom.trim()) {
//                 setFormError('Le nom et le prénom sont obligatoires');
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
//         try {
//             const { error } = await supabase.from('clients').delete().eq('id', clientId);
//             if (error) throw error;
//             await fetchClients();
//             setDeleteConfirm(null);
//         } catch (error) {
//             alert('Erreur lors de la suppression');
//         }
//     };

//     const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

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











// code avec num obligatoire
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
//     const { profile } = useAuth();

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
//         try {
//             const { error } = await supabase.from('clients').delete().eq('id', clientId);
//             if (error) throw error;
//             await fetchClients();
//             setDeleteConfirm(null);
//         } catch (error) {
//             alert('Erreur lors de la suppression');
//         }
//     };

//     const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

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














import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const { profile, isAdmin } = useAuth();

    // 🔍 DEBUG - À retirer après vérification
    console.log('🔍 Profile:', profile);
    console.log('🔍 Role:', profile?.role);
    console.log('🔍 Type of role:', typeof profile?.role);

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

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const matchSearch =
            client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.telephone?.includes(searchTerm);
        const matchType = filterType === 'all' || client.type_client === filterType;
        return matchSearch && matchType;
    });

    const resetForm = () => {
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
    };

    const handleAdd = () => {
        resetForm();
        setSelectedClient(null);
        setIsModalOpen(true);
    };

    const handleEdit = (client) => {
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
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);
        try {
            if (!formData.nom.trim() || !formData.prenom.trim() || !formData.telephone.trim()) {
                setFormError('Le nom, le prénom et le téléphone sont obligatoires');
                setFormLoading(false);
                return;
            }
            if (selectedClient) {
                const { error } = await supabase.from('clients').update(formData).eq('id', selectedClient.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('clients').insert([formData]);
                if (error) throw error;
            }
            await fetchClients();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            setFormError(err.message || 'Une erreur est survenue');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (clientId) => {
        console.log('🗑️ Tentative de suppression du client:', clientId);
        try {
            const { data, error } = await supabase.from('clients').delete().eq('id', clientId);
            console.log('🗑️ Résultat suppression - data:', data);
            console.log('🗑️ Résultat suppression - error:', error);
            if (error) throw error;
            console.log('✅ Suppression réussie');
            await fetchClients();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression: ' + error.message);
        }
    };

    const canDelete = isAdmin();
    console.log('🔍 Can Delete:', canDelete);

    return (
        <>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
                        <p className="text-gray-600 mt-1">{filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter un client
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                        <option value="all">Tous les types</option>
                        <option value="particulier">Particuliers</option>
                        <option value="entreprise">Entreprises</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Aucun client trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ville</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                                                    {client.nom[0]}{client.prenom[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{client.nom} {client.prenom}</p>
                                                    {client.notes && <p className="text-xs text-gray-500 truncate max-w-xs">{client.notes}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {client.email && <p className="text-gray-900">{client.email}</p>}
                                            {client.telephone && <p className="text-gray-600">{client.telephone}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${client.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {client.type_client === 'particulier' ? '👤 Particulier' : '🏢 Entreprise'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{client.ville || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(client)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Modifier">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {canDelete && (
                                                    <button onClick={() => setDeleteConfirm(client.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{selectedClient ? 'Modifier' : 'Ajouter'} un client</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {formError && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">{formError}</div>}

                            <div>
                                <label className="block text-sm font-medium mb-2">Type <span className="text-danger-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setFormData({ ...formData, type_client: 'particulier' })} className={`p-4 rounded-lg border-2 ${formData.type_client === 'particulier' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'particulier' ? 'bg-primary-100' : 'bg-gray-100'}`}>👤</div>
                                            <div className="text-left">
                                                <p className="font-semibold">Particulier</p>
                                                <p className="text-xs text-gray-500">Personne physique</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, type_client: 'entreprise' })} className={`p-4 rounded-lg border-2 ${formData.type_client === 'entreprise' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type_client === 'entreprise' ? 'bg-primary-100' : 'bg-gray-100'}`}>🏢</div>
                                            <div className="text-left">
                                                <p className="font-semibold">Entreprise</p>
                                                <p className="text-xs text-gray-500">Personne morale</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nom <span className="text-danger-500">*</span></label>
                                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Prénom <span className="text-danger-500">*</span></label>
                                    <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Téléphone <span className="text-danger-500">*</span></label>
                                    <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Adresse</label>
                                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ville</label>
                                    <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Code postal</label>
                                    <input type="text" name="code_postal" value={formData.code_postal} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium" disabled={formLoading}>Annuler</button>
                                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                                    {formLoading ? (
                                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Enregistrement...</>
                                    ) : (
                                        <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{selectedClient ? 'Mettre à jour' : 'Créer'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-md w-full p-6 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
                                <p className="text-sm text-gray-600">Cette action est irréversible</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer ce client ?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">Annuler</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 font-medium">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}