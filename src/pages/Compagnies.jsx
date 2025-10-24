// // code qui marche bien mais sans cas santé
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';

// // Composant LogoUpload intégré
// function LogoUpload({ currentLogo, onLogoChange }) {
//     const [isDragging, setIsDragging] = useState(false);
//     const [preview, setPreview] = useState(currentLogo || '');
//     const [uploading, setUploading] = useState(false);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         setPreview(currentLogo || '');
//     }, [currentLogo]);

//     const validateFile = (file) => {
//         if (!file.type.startsWith('image/')) {
//             setError('Veuillez sélectionner une image (PNG, JPG, SVG)');
//             return false;
//         }
//         if (file.size > 5 * 1024 * 1024) {
//             setError('Le fichier doit faire moins de 5MB');
//             return false;
//         }
//         return true;
//     };

//     const uploadFile = async (file) => {
//         if (!validateFile(file)) return;

//         try {
//             setUploading(true);
//             setError('');

//             const fileExt = file.name.split('.').pop();
//             const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

//             const { error: uploadError } = await supabase.storage
//                 .from('compagnies-logos')
//                 .upload(fileName, file, {
//                     cacheControl: '3600',
//                     upsert: false
//                 });

//             if (uploadError) throw uploadError;

//             const { data } = supabase.storage
//                 .from('compagnies-logos')
//                 .getPublicUrl(fileName);

//             setPreview(data.publicUrl);
//             onLogoChange(data.publicUrl);
//         } catch (err) {
//             setError(err.message || 'Erreur lors de l\'upload');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleFileSelect = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => setPreview(reader.result);
//             reader.readAsDataURL(file);
//             uploadFile(file);
//         }
//     };

//     const handleDragOver = (e) => {
//         e.preventDefault();
//         setIsDragging(true);
//     };

//     const handleDragLeave = (e) => {
//         e.preventDefault();
//         setIsDragging(false);
//     };

//     const handleDrop = (e) => {
//         e.preventDefault();
//         setIsDragging(false);
//         const file = e.dataTransfer.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => setPreview(reader.result);
//             reader.readAsDataURL(file);
//             uploadFile(file);
//         }
//     };

//     const handleRemove = () => {
//         setPreview('');
//         onLogoChange('');
//     };

//     return (
//         <div className="space-y-3">
//             <label className="block text-sm font-medium text-gray-700">Logo de la compagnie</label>
//             {preview ? (
//                 <div className="relative group">
//                     <img src={preview} alt="Logo" className="w-full h-40 object-contain bg-gray-50 rounded-lg border-2 border-gray-200" />
//                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
//                         <label className="cursor-pointer px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
//                             <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
//                             Changer
//                         </label>
//                         <button type="button" onClick={handleRemove} className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors">
//                             Supprimer
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}>
//                     <Assurance auto type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="logo-upload" disabled={uploading} />
//                     <label htmlFor="logo-upload" className="cursor-pointer">
//                         <div className="flex flex-col items-center gap-3">
//                             {uploading ? (
//                                 <>
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                                     <p className="text-sm text-gray-600">Upload en cours...</p>
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                                     </svg>
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-700">Glissez-déposez une image ici</p>
//                                         <p className="text-xs text-gray-500 mt-1">ou cliquez pour parcourir</p>
//                                     </div>
//                                     <p className="text-xs text-gray-400">PNG, JPG, SVG jusqu'à 5MB</p>
//                                 </>
//                             )}
//                         </div>
//                     </label>
//                 </div>
//             )}
//             {error && (
//                 <p className="text-sm text-danger-600 flex items-center gap-1">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     {error}
//                 </p>
//             )}
//         </div>
//     );
// }

// export default function Compagnies() {
//     const [compagnies, setCompagnies] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedCompagnie, setSelectedCompagnie] = useState(null);
//     const [editTauxModal, setEditTauxModal] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const { profile } = useAuth();

//     const [formData, setFormData] = useState({
//         nom: '',
//         sigle: '',
//         description: '',
//         logo_url: '',
//         actif: true,
//     });

//     const [tauxData, setTauxData] = useState({});
//     const [newTauxType, setNewTauxType] = useState('');
//     const [newTauxValue, setNewTauxValue] = useState('');
//     const [editingTaux, setEditingTaux] = useState(null);
//     const [editTypeName, setEditTypeName] = useState('');
//     const [editValue, setEditValue] = useState('');
//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');

//     useEffect(() => {
//         fetchCompagnies();
//     }, []);

//     const fetchCompagnies = async () => {
//         try {
//             setLoading(true);
//             const { data, error } = await supabase.from('compagnies').select('*').order('nom', { ascending: true });
//             if (error) throw error;
//             setCompagnies(data || []);
//         } catch (error) {
//             console.error('Erreur:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filteredCompagnies = compagnies.filter(compagnie =>
//         compagnie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         compagnie.sigle.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const resetForm = () => {
//         setFormData({ nom: '', sigle: '', description: '', logo_url: '', actif: true });
//         setFormError('');
//     };

//     const handleAdd = () => {
//         resetForm();
//         setSelectedCompagnie(null);
//         setIsModalOpen(true);
//     };

//     const handleEdit = (compagnie) => {
//         setSelectedCompagnie(compagnie);
//         setFormData({
//             nom: compagnie.nom || '',
//             sigle: compagnie.sigle || '',
//             description: compagnie.description || '',
//             logo_url: compagnie.logo_url || '',
//             actif: compagnie.actif,
//         });
//         setFormError('');
//         setIsModalOpen(true);
//     };

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
//                 const { error } = await supabase.from('compagnies').update(formData).eq('id', selectedCompagnie.id);
//                 if (error) throw error;
//             } else {
//                 const { error } = await supabase.from('compagnies').insert([{ ...formData, taux_commissions: {} }]);
//                 if (error) throw error;
//             }
//             await fetchCompagnies();
//             setIsModalOpen(false);
//             resetForm();
//         } catch (err) {
//             setFormError(err.message || 'Une erreur est survenue');
//         } finally {
//             setFormLoading(false);
//         }
//     };

//     const handleDelete = async (compagnieId) => {
//         try {
//             const { error } = await supabase.from('compagnies').delete().eq('id', compagnieId);
//             if (error) throw error;
//             await fetchCompagnies();
//             setDeleteConfirm(null);
//         } catch (error) {
//             alert('Erreur lors de la suppression');
//         }
//     };

//     const openEditTaux = (compagnie) => {
//         setEditTauxModal(compagnie);
//         setTauxData(compagnie.taux_commissions || {});
//         setNewTauxType('');
//         setNewTauxValue('');
//         setEditingTaux(null);
//         setEditTypeName('');
//         setEditValue('');
//     };

//     const startEditTaux = (type, currentValue) => {
//         setEditingTaux(type);
//         setEditTypeName(type);
//         setEditValue((currentValue * 100).toFixed(2));
//     };

//     const cancelEditTaux = () => {
//         setEditingTaux(null);
//         setEditTypeName('');
//         setEditValue('');
//     };

//     const saveEditTaux = (oldType) => {
//         const newType = editTypeName.trim().toUpperCase().replace(/ /g, '_');
//         const numValue = parseFloat(editValue) / 100;
//         const newTaux = { ...tauxData };
//         if (oldType !== newType) delete newTaux[oldType];
//         newTaux[newType] = numValue;
//         setTauxData(newTaux);
//         setEditingTaux(null);
//         setEditTypeName('');
//         setEditValue('');
//     };

//     const addNewTaux = () => {
//         if (newTauxType.trim() && newTauxValue) {
//             const type = newTauxType.trim().toUpperCase().replace(/ /g, '_');
//             const value = parseFloat(newTauxValue) / 100;
//             setTauxData({ ...tauxData, [type]: value });
//             setNewTauxType('');
//             setNewTauxValue('');
//         }
//     };

//     const removeTaux = (type) => {
//         const newTaux = { ...tauxData };
//         delete newTaux[type];
//         setTauxData(newTaux);
//     };

//     const saveTaux = async () => {
//         try {
//             const { error } = await supabase.from('compagnies').update({ taux_commissions: tauxData }).eq('id', editTauxModal.id);
//             if (error) throw error;
//             await fetchCompagnies();
//             setEditTauxModal(null);
//         } catch (error) {
//             alert('Erreur lors de la sauvegarde des taux');
//         }
//     };

//     const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

//     return (
//         <>
//             <div className="mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900">Compagnies d'Assurance</h1>
//                         <p className="text-gray-600 mt-1">{filteredCompagnies.length} compagnie{filteredCompagnies.length > 1 ? 's' : ''}</p>
//                     </div>
//                     <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                         </svg>
//                         Ajouter une compagnie
//                     </button>
//                 </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
//                 <div className="relative">
//                     <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                     </svg>
//                     <input type="text" placeholder="Rechercher une compagnie..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                 </div>
//             </div>

//             {loading ? (
//                 <div className="flex items-center justify-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredCompagnies.map((compagnie) => (
//                         <div key={compagnie.id} className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden">
//                             <div className="p-6">
//                                 <div className="flex items-start justify-between mb-4">
//                                     <div className="flex items-center gap-3">
//                                         {compagnie.logo_url ? (
//                                             <img src={compagnie.logo_url} alt={compagnie.nom} className="w-12 h-12 rounded-lg object-cover" onError={(e) => {
//                                                 e.target.style.display = 'none';
//                                                 e.target.nextElementSibling.style.display = 'flex';
//                                             }} />
//                                         ) : null}
//                                         <div className={`w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg ${compagnie.logo_url ? 'hidden' : ''}`}>
//                                             {compagnie.sigle.substring(0, 2)}
//                                         </div>
//                                         <div>
//                                             <h3 className="font-bold text-gray-900">{compagnie.nom}</h3>
//                                             <p className="text-sm text-gray-500">{compagnie.sigle}</p>
//                                         </div>
//                                     </div>
//                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${compagnie.actif ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700'}`}>
//                                         {compagnie.actif ? 'Actif' : 'Inactif'}
//                                     </span>
//                                 </div>
//                                 {compagnie.description && (
//                                     <p className="text-sm text-gray-600 mb-4 line-clamp-2">{compagnie.description}</p>
//                                 )}
//                                 <div className="mb-4">
//                                     <p className="text-sm font-medium text-gray-700 mb-2">Types d'assurances</p>
//                                     <p className="text-2xl font-bold text-primary-600">{Object.keys(compagnie.taux_commissions || {}).length}</p>
//                                 </div>
//                                 <div className="flex gap-2">
//                                     <button onClick={() => openEditTaux(compagnie)} className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium">
//                                         ⚙️ Gérer les taux
//                                     </button>
//                                     <button onClick={() => handleEdit(compagnie)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Modifier">
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                         </svg>
//                                     </button>
//                                     {canDelete && (
//                                         <button onClick={() => setDeleteConfirm(compagnie.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors" title="Supprimer">
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                             </svg>
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Modal d'ajout/édition de compagnie */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                             <h2 className="text-xl font-bold">{selectedCompagnie ? 'Modifier' : 'Ajouter'} une compagnie</h2>
//                             <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//                             {formError && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">{formError}</div>}

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Nom de la compagnie <span className="text-danger-500">*</span></label>
//                                 <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required placeholder="Ex: ASKIA ASSURANCES" />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Sigle <span className="text-danger-500">*</span></label>
//                                 <input type="text" name="sigle" value={formData.sigle} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required placeholder="Ex: ASKIA" />
//                             </div>

//                             <LogoUpload currentLogo={formData.logo_url} onLogoChange={(url) => setFormData({ ...formData, logo_url: url })} />

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Description</label>
//                                 <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Description de la compagnie..." />
//                             </div>

//                             <div className="flex items-center gap-2">
//                                 <input type="checkbox" name="actif" checked={formData.actif} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
//                                 <label className="text-sm font-medium">Compagnie active</label>
//                             </div>

//                             <div className="flex gap-3 pt-4 border-t">
//                                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium" disabled={formLoading}>Annuler</button>
//                                 <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
//                                     {formLoading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Enregistrement...</> : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{selectedCompagnie ? 'Mettre à jour' : 'Créer'}</>}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Modal de gestion des taux */}
//             {editTauxModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-3xl w-full max-h-[85vh] overflow-hidden animate-scale-in flex flex-col">
//                         <div className="border-b px-6 py-4 flex justify-between items-center">
//                             <div>
//                                 <h2 className="text-xl font-bold">{editTauxModal.nom}</h2>
//                                 <p className="text-sm text-gray-600">Configuration des taux de commissions</p>
//                             </div>
//                             <button onClick={() => setEditTauxModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <div className="flex-1 overflow-y-auto p-6">
//                             <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
//                                 <h3 className="font-semibold text-primary-900 mb-3">➕ Ajouter un type d'assurance</h3>
//                                 <div className="flex gap-3">
//                                     <input type="text" value={newTauxType} onChange={(e) => setNewTauxType(e.target.value)} placeholder="Nom du type (ex: AUTO_PARTICULIER)" className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                     <input type="number" value={newTauxValue} onChange={(e) => setNewTauxValue(e.target.value)} placeholder="Taux %" step="0.01" min="0" max="100" className="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                                     <button onClick={addNewTaux} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">Ajouter</button>
//                                 </div>
//                             </div>
//                             <div className="space-y-2">
//                                 <h3 className="font-semibold text-gray-900 mb-3">📋 Types d'assurance configurés ({Object.keys(tauxData).length})</h3>
//                                 {Object.keys(tauxData).length === 0 ? (
//                                     <p className="text-gray-500 text-center py-8">Aucun type d'assurance configuré</p>
//                                 ) : (
//                                     Object.entries(tauxData).map(([type, taux]) => (
//                                         <div key={type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
//                                             {editingTaux === type ? (
//                                                 <>
//                                                     <input type="text" value={editTypeName} onChange={(e) => setEditTypeName(e.target.value)} className="flex-1 px-3 py-2 border-2 border-primary-500 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium" placeholder="Nom du type" />
//                                                     <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} step="0.01" min="0" max="100" className="w-24 px-3 py-2 border-2 border-primary-500 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
//                                                     <span className="text-sm font-semibold text-primary-600 w-8">%</span>
//                                                     <div className="flex gap-1">
//                                                         <button onClick={() => saveEditTaux(type)} className="p-2 text-white bg-success-600 hover:bg-success-700 rounded-lg transition-colors" title="Valider">
//                                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                                             </svg>
//                                                         </button>
//                                                         <button onClick={cancelEditTaux} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Annuler">
//                                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                                             </svg>
//                                                         </button>
//                                                     </div>
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <span className="flex-1 text-sm font-medium text-gray-700">{type.replace(/_/g, ' ')}</span>
//                                                     <span className="w-24 px-3 py-2 text-sm font-semibold text-gray-900">{(taux * 100).toFixed(2)}</span>
//                                                     <span className="text-sm font-semibold text-gray-600 w-8">%</span>
//                                                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                                         <button onClick={() => startEditTaux(type, taux)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors" title="Modifier">
//                                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                             </svg>
//                                                         </button>
//                                                         <button onClick={() => removeTaux(type)} className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors" title="Supprimer">
//                                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                             </svg>
//                                                         </button>
//                                                     </div>
//                                                 </>
//                                             )}
//                                         </div>
//                                     ))
//                                 )}
//                             </div>
//                         </div>
//                         <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
//                             <button onClick={() => setEditTauxModal(null)} className="px-4 py-2 border rounded-lg hover:bg-white font-medium transition-colors">
//                                 Annuler
//                             </button>
//                             <button onClick={saveTaux} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors flex items-center gap-2">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                 </svg>
//                                 Enregistrer les taux
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Modal de confirmation de suppression */}
//             {deleteConfirm && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-md w-full animate-scale-in">
//                         <div className="p-6">
//                             <div className="flex items-center gap-4 mb-4">
//                                 <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
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
//                                 Êtes-vous sûr de vouloir supprimer cette compagnie ? Toutes les données associées seront perdues.
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
















// code avec cas sante
// Compagnies.jsx - VERSION COMPLÈTE OPTIMISÉE
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';

// // ⭐ COMPOSANT LOGO UPLOAD
// function LogoUpload({ currentLogo, onLogoChange }) {
//     const [isDragging, setIsDragging] = useState(false);
//     const [preview, setPreview] = useState(currentLogo || '');
//     const [uploading, setUploading] = useState(false);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         setPreview(currentLogo || '');
//     }, [currentLogo]);

//     const validateFile = (file) => {
//         if (!file.type.startsWith('image/')) {
//             setError('Veuillez sélectionner une image (PNG, JPG, SVG)');
//             return false;
//         }
//         if (file.size > 5 * 1024 * 1024) {
//             setError('Le fichier doit faire moins de 5MB');
//             return false;
//         }
//         return true;
//     };

//     const uploadFile = async (file) => {
//         if (!validateFile(file)) return;

//         try {
//             setUploading(true);
//             setError('');

//             const fileExt = file.name.split('.').pop();
//             const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

//             const { error: uploadError } = await supabase.storage
//                 .from('compagnies-logos')
//                 .upload(fileName, file, {
//                     cacheControl: '3600',
//                     upsert: false
//                 });

//             if (uploadError) throw uploadError;

//             const { data } = supabase.storage
//                 .from('compagnies-logos')
//                 .getPublicUrl(fileName);

//             setPreview(data.publicUrl);
//             onLogoChange(data.publicUrl);
//         } catch (err) {
//             setError(err.message || 'Erreur lors de l\'upload');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleFileSelect = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => setPreview(reader.result);
//             reader.readAsDataURL(file);
//             uploadFile(file);
//         }
//     };

//     const handleDragOver = (e) => {
//         e.preventDefault();
//         setIsDragging(true);
//     };

//     const handleDragLeave = (e) => {
//         e.preventDefault();
//         setIsDragging(false);
//     };

//     const handleDrop = (e) => {
//         e.preventDefault();
//         setIsDragging(false);
//         const file = e.dataTransfer.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => setPreview(reader.result);
//             reader.readAsDataURL(file);
//             uploadFile(file);
//         }
//     };

//     const handleRemove = () => {
//         setPreview('');
//         onLogoChange('');
//     };

//     return (
//         <div className="space-y-3">
//             <label className="block text-sm font-medium text-gray-700">Logo de la compagnie</label>
//             {preview ? (
//                 <div className="relative group">
//                     <img src={preview} alt="Logo" className="w-full h-40 object-contain bg-gray-50 rounded-lg border-2 border-gray-200" />
//                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
//                         <label className="cursor-pointer px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
//                             <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
//                             Changer
//                         </label>
//                         <button type="button" onClick={handleRemove} className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors">
//                             Supprimer
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}>
//                     <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="logo-upload" disabled={uploading} />
//                     <label htmlFor="logo-upload" className="cursor-pointer">
//                         <div className="flex flex-col items-center gap-3">
//                             {uploading ? (
//                                 <>
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                                     <p className="text-sm text-gray-600">Upload en cours...</p>
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                                     </svg>
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-700">Glissez-déposez une image ici</p>
//                                         <p className="text-xs text-gray-500 mt-1">ou cliquez pour parcourir</p>
//                                     </div>
//                                     <p className="text-xs text-gray-400">PNG, JPG, SVG jusqu'à 5MB</p>
//                                 </>
//                             )}
//                         </div>
//                     </label>
//                 </div>
//             )}
//             {error && (
//                 <p className="text-sm text-danger-600 flex items-center gap-1">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     {error}
//                 </p>
//             )}
//         </div>
//     );
// }

// // ⭐ COMPOSANT PRINCIPAL
// export default function Compagnies() {
//     const [compagnies, setCompagnies] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedCompagnie, setSelectedCompagnie] = useState(null);
//     const [editTauxModal, setEditTauxModal] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);
//     const { profile } = useAuth();

//     const [formData, setFormData] = useState({
//         nom: '',
//         sigle: '',
//         description: '',
//         logo_url: '',
//         actif: true,
//     });

//     const [tauxData, setTauxData] = useState({});
//     const [newTauxType, setNewTauxType] = useState('');
//     const [newTauxSante, setNewTauxSante] = useState({
//         commission_base: '',
//         evacuation_sanitaire: '',
//         commission_regulation: ''
//     });
//     const [newTauxValue, setNewTauxValue] = useState('');

//     const [editingTaux, setEditingTaux] = useState(null);
//     const [editTypeName, setEditTypeName] = useState('');
//     const [editValue, setEditValue] = useState('');
//     const [editSanteValues, setEditSanteValues] = useState({
//         commission_base: '',
//         evacuation_sanitaire: '',
//         commission_regulation: ''
//     });

//     const [formLoading, setFormLoading] = useState(false);
//     const [formError, setFormError] = useState('');

//     // ⭐ HELPER : Vérifier si c'est un type santé
//     const isSanteType = (typeName) => {
//         const normalized = typeName.trim().toUpperCase().replace(/ /g, '_');
//         return normalized === 'SANTE_INDIVIDUELLE'
//             || normalized === 'SANTE_FAMILIALE'
//             || normalized === 'SANTE_GROUPE';  // ← NOUVEAU
//     };
//     useEffect(() => {
//         fetchCompagnies();
//     }, []);

//     const fetchCompagnies = async () => {
//         try {
//             setLoading(true);
//             const { data, error } = await supabase.from('compagnies').select('*').order('nom', { ascending: true });
//             if (error) throw error;
//             setCompagnies(data || []);
//         } catch (error) {
//             console.error('Erreur:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filteredCompagnies = compagnies.filter(compagnie =>
//         compagnie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         compagnie.sigle.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const resetForm = () => {
//         setFormData({ nom: '', sigle: '', description: '', logo_url: '', actif: true });
//         setFormError('');
//     };

//     const handleAdd = () => {
//         resetForm();
//         setSelectedCompagnie(null);
//         setIsModalOpen(true);
//     };

//     const handleEdit = (compagnie) => {
//         setSelectedCompagnie(compagnie);
//         setFormData({
//             nom: compagnie.nom || '',
//             sigle: compagnie.sigle || '',
//             description: compagnie.description || '',
//             logo_url: compagnie.logo_url || '',
//             actif: compagnie.actif,
//         });
//         setFormError('');
//         setIsModalOpen(true);
//     };

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
//                 const { error } = await supabase.from('compagnies').update(formData).eq('id', selectedCompagnie.id);
//                 if (error) throw error;
//             } else {
//                 const { error } = await supabase.from('compagnies').insert([{ ...formData, taux_commissions: {} }]);
//                 if (error) throw error;
//             }
//             await fetchCompagnies();
//             setIsModalOpen(false);
//             resetForm();
//         } catch (err) {
//             setFormError(err.message || 'Une erreur est survenue');
//         } finally {
//             setFormLoading(false);
//         }
//     };

//     const handleDelete = async (compagnieId) => {
//         try {
//             const { error } = await supabase.from('compagnies').delete().eq('id', compagnieId);
//             if (error) throw error;
//             await fetchCompagnies();
//             setDeleteConfirm(null);
//         } catch (error) {
//             alert('Erreur lors de la suppression');
//         }
//     };

//     const openEditTaux = (compagnie) => {
//         setEditTauxModal(compagnie);
//         setTauxData(compagnie.taux_commissions || {});
//         setNewTauxType('');
//         setNewTauxValue('');
//         setNewTauxSante({
//             commission_base: '',
//             evacuation_sanitaire: '',
//             commission_regulation: ''
//         });
//         setEditingTaux(null);
//         setEditTypeName('');
//         setEditValue('');
//         setEditSanteValues({
//             commission_base: '',
//             evacuation_sanitaire: '',
//             commission_regulation: ''
//         });
//     };

//     const startEditTaux = (type, currentValue) => {
//         setEditingTaux(type);
//         setEditTypeName(type);

//         if (typeof currentValue === 'object' && currentValue !== null) {
//             setEditSanteValues({
//                 commission_base: ((currentValue.commission_base || 0) * 100).toFixed(2),
//                 evacuation_sanitaire: ((currentValue.evacuation_sanitaire || 0) * 100).toFixed(2),
//                 commission_regulation: ((currentValue.commission_regulation || 0) * 100).toFixed(2)
//             });
//             setEditValue('');
//         } else {
//             setEditValue((currentValue * 100).toFixed(2));
//             setEditSanteValues({
//                 commission_base: '',
//                 evacuation_sanitaire: '',
//                 commission_regulation: ''
//             });
//         }
//     };

//     const cancelEditTaux = () => {
//         setEditingTaux(null);
//         setEditTypeName('');
//         setEditValue('');
//         setEditSanteValues({
//             commission_base: '',
//             evacuation_sanitaire: '',
//             commission_regulation: ''
//         });
//     };

//     const saveEditTaux = (oldType) => {
//         const newType = editTypeName.trim().toUpperCase().replace(/ /g, '_');
//         const newTaux = { ...tauxData };

//         if (oldType !== newType) delete newTaux[oldType];

//         if (isSanteType(newType)) {
//             newTaux[newType] = {
//                 commission_base: parseFloat(editSanteValues.commission_base) / 100,
//                 evacuation_sanitaire: parseFloat(editSanteValues.evacuation_sanitaire) / 100,
//                 commission_regulation: parseFloat(editSanteValues.commission_regulation) / 100
//             };
//         } else {
//             newTaux[newType] = parseFloat(editValue) / 100;
//         }

//         setTauxData(newTaux);
//         cancelEditTaux();
//     };

//     const addNewTaux = () => {
//         if (!newTauxType.trim()) {
//             alert('Le nom du type est obligatoire');
//             return;
//         }

//         const type = newTauxType.trim().toUpperCase().replace(/ /g, '_');

//         if (isSanteType(type)) {
//             if (!newTauxSante.commission_base || !newTauxSante.evacuation_sanitaire || !newTauxSante.commission_regulation) {
//                 alert('Tous les taux santé sont obligatoires');
//                 return;
//             }

//             setTauxData({
//                 ...tauxData,
//                 [type]: {
//                     commission_base: parseFloat(newTauxSante.commission_base) / 100,
//                     evacuation_sanitaire: parseFloat(newTauxSante.evacuation_sanitaire) / 100,
//                     commission_regulation: parseFloat(newTauxSante.commission_regulation) / 100
//                 }
//             });

//             setNewTauxSante({
//                 commission_base: '',
//                 evacuation_sanitaire: '',
//                 commission_regulation: ''
//             });
//         } else {
//             if (!newTauxValue) {
//                 alert('Le taux est obligatoire');
//                 return;
//             }

//             const value = parseFloat(newTauxValue) / 100;
//             setTauxData({ ...tauxData, [type]: value });
//             setNewTauxValue('');
//         }

//         setNewTauxType('');
//     };

//     const removeTaux = (type) => {
//         if (!window.confirm(`Supprimer le type "${type}" ?`)) return;
//         const newTaux = { ...tauxData };
//         delete newTaux[type];
//         setTauxData(newTaux);
//     };

//     const saveTaux = async () => {
//         try {
//             const { error } = await supabase.from('compagnies').update({ taux_commissions: tauxData }).eq('id', editTauxModal.id);
//             if (error) throw error;
//             await fetchCompagnies();
//             setEditTauxModal(null);
//         } catch (error) {
//             alert('Erreur lors de la sauvegarde des taux: ' + error.message);
//         }
//     };

//     const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

//     return (
//         <>
//             {/* Header */}
//             <div className="mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900">Compagnies d'Assurance</h1>
//                         <p className="text-gray-600 mt-1">{filteredCompagnies.length} compagnie{filteredCompagnies.length > 1 ? 's' : ''}</p>
//                     </div>
//                     <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                         </svg>
//                         Ajouter une compagnie
//                     </button>
//                 </div>
//             </div>

//             {/* Recherche */}
//             <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
//                 <div className="relative">
//                     <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                     </svg>
//                     <input type="text" placeholder="Rechercher une compagnie..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
//                 </div>
//             </div>

//             {/* Liste compagnies */}
//             {loading ? (
//                 <div className="flex items-center justify-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredCompagnies.map((compagnie) => (
//                         <div key={compagnie.id} className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden">
//                             <div className="p-6">
//                                 <div className="flex items-start justify-between mb-4">
//                                     <div className="flex items-center gap-3">
//                                         {compagnie.logo_url ? (
//                                             <img src={compagnie.logo_url} alt={compagnie.nom} className="w-12 h-12 rounded-lg object-cover" onError={(e) => {
//                                                 e.target.style.display = 'none';
//                                                 e.target.nextElementSibling.style.display = 'flex';
//                                             }} />
//                                         ) : null}
//                                         <div className={`w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg ${compagnie.logo_url ? 'hidden' : ''}`}>
//                                             {compagnie.sigle.substring(0, 2)}
//                                         </div>
//                                         <div>
//                                             <h3 className="font-bold text-gray-900">{compagnie.nom}</h3>
//                                             <p className="text-sm text-gray-500">{compagnie.sigle}</p>
//                                         </div>
//                                     </div>
//                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${compagnie.actif ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700'}`}>
//                                         {compagnie.actif ? 'Actif' : 'Inactif'}
//                                     </span>
//                                 </div>
//                                 {compagnie.description && (
//                                     <p className="text-sm text-gray-600 mb-4 line-clamp-2">{compagnie.description}</p>
//                                 )}
//                                 <div className="mb-4">
//                                     <p className="text-sm font-medium text-gray-700 mb-2">Types d'assurances</p>
//                                     <p className="text-2xl font-bold text-primary-600">{Object.keys(compagnie.taux_commissions || {}).length}</p>
//                                 </div>
//                                 <div className="flex gap-2">
//                                     <button onClick={() => openEditTaux(compagnie)} className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium">
//                                         ⚙️ Gérer les taux
//                                     </button>
//                                     <button onClick={() => handleEdit(compagnie)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Modifier">
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                         </svg>
//                                     </button>
//                                     {canDelete && (
//                                         <button onClick={() => setDeleteConfirm(compagnie.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors" title="Supprimer">
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                             </svg>
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Modal compagnie */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
//                             <h2 className="text-xl font-bold">{selectedCompagnie ? 'Modifier' : 'Ajouter'} une compagnie</h2>
//                             <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//                             {formError && <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">{formError}</div>}

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Nom de la compagnie <span className="text-danger-500">*</span></label>
//                                 <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required placeholder="Ex: ASKIA ASSURANCES" />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Sigle <span className="text-danger-500">*</span></label>
//                                 <input type="text" name="sigle" value={formData.sigle} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required placeholder="Ex: ASKIA" />
//                             </div>

//                             <LogoUpload currentLogo={formData.logo_url} onLogoChange={(url) => setFormData({ ...formData, logo_url: url })} />

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Description</label>
//                                 <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Description de la compagnie..." />
//                             </div>

//                             <div className="flex items-center gap-2">
//                                 <input type="checkbox" name="actif" checked={formData.actif} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
//                                 <label className="text-sm font-medium">Compagnie active</label>
//                             </div>

//                             <div className="flex gap-3 pt-4 border-t">
//                                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium" disabled={formLoading}>Annuler</button>
//                                 <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
//                                     {formLoading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Enregistrement...</> : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{selectedCompagnie ? 'Mettre à jour' : 'Créer'}</>}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* ⭐ MODAL GESTION TAUX - OPTIMISÉ */}
//             {editTauxModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[85vh] overflow-hidden animate-scale-in flex flex-col">
//                         <div className="border-b px-6 py-4 flex justify-between items-center bg-gradient-to-r from-primary-50 to-primary-100">
//                             <div>
//                                 <h2 className="text-xl font-bold text-gray-900">{editTauxModal.nom}</h2>
//                                 <p className="text-sm text-gray-600">Configuration des taux de commissions</p>
//                             </div>
//                             <button onClick={() => setEditTauxModal(null)} className="p-2 hover:bg-white rounded-lg transition-colors">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <div className="flex-1 overflow-y-auto p-6">
//                             {/* Formulaire d'ajout */}
//                             <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-5 mb-6">
//                                 <h3 className="font-semibold text-primary-900 mb-4 flex items-center gap-2">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                                     </svg>
//                                     Ajouter un type d'assurance
//                                 </h3>

//                                 <div className="mb-4">
//                                     <input
//                                         type="text"
//                                         value={newTauxType}
//                                         onChange={(e) => setNewTauxType(e.target.value)}
//                                         placeholder="Nom du type (ex: AUTO_PARTICULIER, SANTE_INDIVIDUELLE)"
//                                         className="w-full px-4 py-2.5 border-2 border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-medium"
//                                     />
//                                     <p className="text-xs text-primary-700 mt-2 flex items-center gap-1">
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         Pour la santé, utilisez : <strong>SANTE_INDIVIDUELLE</strong> ou <strong>SANTE_FAMILIALE</strong>
//                                     </p>
//                                 </div>

//                                 {/* Interface conditionnelle */}
//                                 {isSanteType(newTauxType) ? (
//                                     <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5 space-y-4">
//                                         <div className="flex items-center gap-2 mb-3">
//                                             <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
//                                                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                                                 </svg>
//                                             </div>
//                                             <div>
//                                                 <p className="text-sm font-bold text-green-900">Configuration Assurance Santé</p>
//                                                 <p className="text-xs text-green-700">3 taux requis pour les calculs</p>
//                                             </div>
//                                         </div>
//                                         <div className="grid grid-cols-3 gap-4">
//                                             <div>
//                                                 <label className="block text-xs font-semibold text-green-900 mb-2">
//                                                     Commission de base (%) <span className="text-danger-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="number"
//                                                     value={newTauxSante.commission_base}
//                                                     onChange={(e) => setNewTauxSante({ ...newTauxSante, commission_base: e.target.value })}
//                                                     placeholder="16"
//                                                     step="0.01"
//                                                     min="0"
//                                                     max="100"
//                                                     className="w-full px-3 py-2.5 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs font-semibold text-green-900 mb-2">
//                                                     Évacuation sanitaire (%) <span className="text-danger-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="number"
//                                                     value={newTauxSante.evacuation_sanitaire}
//                                                     onChange={(e) => setNewTauxSante({ ...newTauxSante, evacuation_sanitaire: e.target.value })}
//                                                     placeholder="8"
//                                                     step="0.01"
//                                                     min="0"
//                                                     max="100"
//                                                     className="w-full px-3 py-2.5 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="block text-xs font-semibold text-green-900 mb-2">
//                                                     Commission régulation (%) <span className="text-danger-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="number"
//                                                     value={newTauxSante.commission_regulation}
//                                                     onChange={(e) => setNewTauxSante({ ...newTauxSante, commission_regulation: e.target.value })}
//                                                     placeholder="16"
//                                                     step="0.01"
//                                                     min="0"
//                                                     max="100"
//                                                     className="w-full px-3 py-2.5 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-semibold"
//                                                 />
//                                             </div>
//                                         </div>
//                                         <button
//                                             onClick={addNewTaux}
//                                             className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
//                                         >
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                                             </svg>
//                                             Ajouter type Santé
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <div className="flex gap-3">
//                                         <input
//                                             type="number"
//                                             value={newTauxValue}
//                                             onChange={(e) => setNewTauxValue(e.target.value)}
//                                             placeholder="Taux en %"
//                                             step="0.01"
//                                             min="0"
//                                             max="100"
//                                             className="flex-1 px-4 py-2.5 border-2 border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-semibold"
//                                         />
//                                         <button
//                                             onClick={addNewTaux}
//                                             className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center gap-2"
//                                         >
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                                             </svg>
//                                             Ajouter
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Liste des taux */}
//                             <div className="space-y-3">
//                                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                                     <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                                     </svg>
//                                     Types configurés ({Object.keys(tauxData).length})
//                                 </h3>
//                                 {Object.keys(tauxData).length === 0 ? (
//                                     <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//                                         <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                                         </svg>
//                                         <p className="text-gray-500 font-medium">Aucun type d'assurance configuré</p>
//                                         <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier type ci-dessus</p>
//                                     </div>
//                                 ) : (
//                                     Object.entries(tauxData).map(([type, taux]) => (
//                                         <div key={type} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group border border-gray-200">
//                                             {editingTaux === type ? (
//                                                 <>
//                                                     <input
//                                                         type="text"
//                                                         value={editTypeName}
//                                                         onChange={(e) => setEditTypeName(e.target.value)}
//                                                         className="flex-1 px-3 py-2 border-2 border-primary-500 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-semibold"
//                                                         placeholder="Nom du type"
//                                                     />

//                                                     {typeof taux === 'object' && taux !== null ? (
//                                                         <div className="flex gap-2">
//                                                             <div className="flex flex-col">
//                                                                 <label className="text-xs text-gray-600 mb-1">Base %</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     value={editSanteValues.commission_base}
//                                                                     onChange={(e) => setEditSanteValues({ ...editSanteValues, commission_base: e.target.value })}
//                                                                     step="0.01"
//                                                                     className="w-20 px-2 py-1.5 border-2 border-primary-500 rounded text-sm font-semibold"
//                                                                 />
//                                                             </div>
//                                                             <div className="flex flex-col">
//                                                                 <label className="text-xs text-gray-600 mb-1">Évac %</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     value={editSanteValues.evacuation_sanitaire}
//                                                                     onChange={(e) => setEditSanteValues({ ...editSanteValues, evacuation_sanitaire: e.target.value })}
//                                                                     step="0.01"
//                                                                     className="w-20 px-2 py-1.5 border-2 border-primary-500 rounded text-sm font-semibold"
//                                                                 />
//                                                             </div>
//                                                             <div className="flex flex-col">
//                                                                 <label className="text-xs text-gray-600 mb-1">Régul %</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     value={editSanteValues.commission_regulation}
//                                                                     onChange={(e) => setEditSanteValues({ ...editSanteValues, commission_regulation: e.target.value })}
//                                                                     step="0.01"
//                                                                     className="w-20 px-2 py-1.5 border-2 border-primary-500 rounded text-sm font-semibold"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     ) : (
//                                                         <>
//                                                             <input
//                                                                 type="number"
//                                                                 value={editValue}
//                                                                 onChange={(e) => setEditValue(e.target.value)}
//                                                                 step="0.01"
//                                                                 min="0"
//                                                                 max="100"
//                                                                 className="w-28 px-3 py-2 border-2 border-primary-500 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-semibold"
//                                                             />
//                                                             <span className="text-sm font-semibold text-primary-600">%</span>
//                                                         </>
//                                                     )}

//                                                     <div className="flex gap-1">
//                                                         <button
//                                                             onClick={() => saveEditTaux(type)}
//                                                             className="p-2 text-white bg-success-600 hover:bg-success-700 rounded-lg transition-colors"
//                                                             title="Valider"
//                                                         >
//                                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                                             </svg>
//                                                         </button>
//                                                         <button
//                                                             onClick={cancelEditTaux}
//                                                             className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
//                                                             title="Annuler"
//                                                         >
//                                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                                             </svg>
//                                                         </button>
//                                                     </div>
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <div className="flex-1 flex items-center gap-3">
//                                                         <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                                                             <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                                             </svg>
//                                                         </div>
//                                                         <div className="flex-1">
//                                                             <span className="text-sm font-semibold text-gray-800 block mb-1">
//                                                                 {type.replace(/_/g, ' ')}
//                                                             </span>
//                                                             {typeof taux === 'object' && taux !== null ? (
//                                                                 <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-2 inline-flex gap-4">
//                                                                     <span className="text-xs text-green-900">
//                                                                         Base: <span className="font-bold">{(taux.commission_base * 100).toFixed(2)}%</span>
//                                                                     </span>
//                                                                     <span className="text-xs text-green-900">
//                                                                         Évac: <span className="font-bold">{(taux.evacuation_sanitaire * 100).toFixed(2)}%</span>
//                                                                     </span>
//                                                                     <span className="text-xs text-green-900">
//                                                                         Régul: <span className="font-bold">{(taux.commission_regulation * 100).toFixed(2)}%</span>
//                                                                     </span>
//                                                                 </div>
//                                                             ) : (
//                                                                 <span className="text-lg font-bold text-gray-900">{(taux * 100).toFixed(2)}%</span>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                                         <button
//                                                             onClick={() => startEditTaux(type, taux)}
//                                                             className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
//                                                             title="Modifier"
//                                                         >
//                                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                             </svg>
//                                                         </button>
//                                                         <button
//                                                             onClick={() => removeTaux(type)}
//                                                             className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
//                                                             title="Supprimer"
//                                                         >
//                                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                             </svg>
//                                                         </button>
//                                                     </div>
//                                                 </>
//                                             )}
//                                         </div>
//                                     ))
//                                 )}
//                             </div>
//                         </div>
//                         <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
//                             <button
//                                 onClick={() => setEditTauxModal(null)}
//                                 className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-white font-semibold transition-colors"
//                             >
//                                 Annuler
//                             </button>
//                             <button
//                                 onClick={saveTaux}
//                                 className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors flex items-center gap-2"
//                             >
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                 </svg>
//                                 Enregistrer les taux
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Modal suppression */}
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
//                                 Êtes-vous sûr de vouloir supprimer cette compagnie ? Toutes les données associées seront perdues.
//                             </p>
//                             <div className="flex gap-3">
//                                 <button
//                                     onClick={() => setDeleteConfirm(null)}
//                                     className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors"
//                                 >
//                                     Annuler
//                                 </button>
//                                 <button
//                                     onClick={() => handleDelete(deleteConfirm)}
//                                     className="flex-1 px-4 py-2.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 font-medium transition-colors"
//                                 >
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























// new version modulaire
// src/pages/Compagnies.jsx
// import { useState } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';
// import { useCompagniesData } from '../hooks/useCompagniesData';
// import { CompagniesHeader } from '../components/compagnies/CompagniesHeader';
// import { CompagniesSearch } from '../components/compagnies/CompagniesSearch';
// import { CompagnieCard } from '../components/compagnies/CompagnieCard';
// import { CompagnieModal } from '../components/compagnies/CompagnieModal';
// import { TauxModal } from '../components/compagnies/TauxModal';
// import { DeleteConfirmModal } from '../components/compagnies/DeleteConfirmModal';

// export default function Compagnies() {
//     const { profile } = useAuth();
//     const { compagnies, loading, refetch } = useCompagniesData();

//     const [searchTerm, setSearchTerm] = useState('');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedCompagnie, setSelectedCompagnie] = useState(null);
//     const [editTauxModal, setEditTauxModal] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);

//     const [formData, setFormData] = useState({
//         nom: '',
//         sigle: '',
//         description: '',
//         logo_url: '',
//         actif: true,
//     });

//     // Filtrer les compagnies
//     const filteredCompagnies = compagnies.filter(compagnie =>
//         compagnie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         compagnie.sigle.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     // Reset form
//     const resetForm = () => {
//         setFormData({
//             nom: '',
//             sigle: '',
//             description: '',
//             logo_url: '',
//             actif: true
//         });
//     };

//     // Ouvrir modal d'ajout
//     const handleAdd = () => {
//         resetForm();
//         setSelectedCompagnie(null);
//         setIsModalOpen(true);
//     };

//     // Ouvrir modal d'édition
//     const handleEdit = (compagnie) => {
//         setSelectedCompagnie(compagnie);
//         setFormData({
//             nom: compagnie.nom || '',
//             sigle: compagnie.sigle || '',
//             description: compagnie.description || '',
//             logo_url: compagnie.logo_url || '',
//             actif: compagnie.actif,
//         });
//         setIsModalOpen(true);
//     };

//     // Supprimer une compagnie
//     const handleDelete = async (compagnieId) => {
//         try {
//             const { error } = await supabase
//                 .from('compagnies')
//                 .delete()
//                 .eq('id', compagnieId);

//             if (error) throw error;

//             await refetch();
//             setDeleteConfirm(null);
//         } catch (error) {
//             alert('Erreur lors de la suppression');
//         }
//     };

//     // Ouvrir modal gestion des taux
//     const openEditTaux = (compagnie) => {
//         setEditTauxModal(compagnie);
//     };

//     const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

//     return (
//         <>
//             <CompagniesHeader count={filteredCompagnies.length} onAdd={handleAdd} />

//             <CompagniesSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

//             {loading ? (
//                 <div className="flex items-center justify-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredCompagnies.map((compagnie) => (
//                         <CompagnieCard
//                             key={compagnie.id}
//                             compagnie={compagnie}
//                             onEdit={handleEdit}
//                             onDelete={setDeleteConfirm}
//                             onEditTaux={openEditTaux}
//                             canDelete={canDelete}
//                         />
//                     ))}
//                 </div>
//             )}

//             <CompagnieModal
//                 isOpen={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 selectedCompagnie={selectedCompagnie}
//                 formData={formData}
//                 setFormData={setFormData}
//                 onSuccess={refetch}
//             />

//             <TauxModal
//                 compagnie={editTauxModal}
//                 onClose={() => setEditTauxModal(null)}
//                 onSuccess={refetch}
//             />

//             <DeleteConfirmModal
//                 compagnieId={deleteConfirm}
//                 onConfirm={handleDelete}
//                 onCancel={() => setDeleteConfirm(null)}
//             />
//         </>
//     );
// }















// avec souscritpion
// // src/pages/Compagnies.jsx
// import { useState } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';
// import { useCompagniesData } from '../hooks/useCompagniesData';
// import { CompagniesHeader } from '../components/compagnies/CompagniesHeader';
// import { CompagniesSearch } from '../components/compagnies/CompagniesSearch';
// import { CompagnieCard } from '../components/compagnies/CompagnieCard';
// import { CompagnieModal } from '../components/compagnies/CompagnieModal';
// import { TauxModal } from '../components/compagnies/TauxModal';
// import { DeleteConfirmModal } from '../components/compagnies/DeleteConfirmModal';

// export default function Compagnies() {
//     const { profile } = useAuth();
//     const { compagnies, loading, refetch } = useCompagniesData();

//     const [searchTerm, setSearchTerm] = useState('');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedCompagnie, setSelectedCompagnie] = useState(null);
//     const [editTauxModal, setEditTauxModal] = useState(null);
//     const [deleteConfirm, setDeleteConfirm] = useState(null);

//     const [formData, setFormData] = useState({
//         nom: '',
//         sigle: '',
//         description: '',
//         logo_url: '',
//         lien_souscription: '',  // ✅ AJOUTÉ
//         actif: true,
//     });

//     // Filtrer les compagnies
//     const filteredCompagnies = compagnies.filter(compagnie =>
//         compagnie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         compagnie.sigle.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     // Reset form
//     const resetForm = () => {
//         setFormData({
//             nom: '',
//             sigle: '',
//             description: '',
//             logo_url: '',
//             lien_souscription: '',  // ✅ AJOUTÉ
//             actif: true
//         });
//     };

//     // Ouvrir modal d'ajout
//     const handleAdd = () => {
//         resetForm();
//         setSelectedCompagnie(null);
//         setIsModalOpen(true);
//     };

//     // Ouvrir modal d'édition
//     const handleEdit = (compagnie) => {
//         setSelectedCompagnie(compagnie);
//         setFormData({
//             nom: compagnie.nom || '',
//             sigle: compagnie.sigle || '',
//             description: compagnie.description || '',
//             logo_url: compagnie.logo_url || '',
//             lien_souscription: compagnie.lien_souscription || '',  // ✅ AJOUTÉ
//             actif: compagnie.actif,
//         });
//         setIsModalOpen(true);
//     };

//     // Supprimer une compagnie
//     const handleDelete = async (compagnieId) => {
//         try {
//             const { error } = await supabase
//                 .from('compagnies')
//                 .delete()
//                 .eq('id', compagnieId);

//             if (error) throw error;

//             await refetch();
//             setDeleteConfirm(null);
//         } catch (error) {
//             alert('Erreur lors de la suppression');
//         }
//     };

//     // Ouvrir modal gestion des taux
//     const openEditTaux = (compagnie) => {
//         setEditTauxModal(compagnie);
//     };

//     const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

//     return (
//         <>
//             <CompagniesHeader count={filteredCompagnies.length} onAdd={handleAdd} />

//             <CompagniesSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

//             {loading ? (
//                 <div className="flex items-center justify-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredCompagnies.map((compagnie) => (
//                         <CompagnieCard
//                             key={compagnie.id}
//                             compagnie={compagnie}
//                             onEdit={handleEdit}
//                             onDelete={setDeleteConfirm}
//                             onEditTaux={openEditTaux}
//                             canDelete={canDelete}
//                         />
//                     ))}
//                 </div>
//             )}

//             <CompagnieModal
//                 isOpen={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 selectedCompagnie={selectedCompagnie}
//                 formData={formData}
//                 setFormData={setFormData}
//                 onSuccess={refetch}
//             />

//             <TauxModal
//                 compagnie={editTauxModal}
//                 onClose={() => setEditTauxModal(null)}
//                 onSuccess={refetch}
//             />

//             <DeleteConfirmModal
//                 compagnieId={deleteConfirm}
//                 onConfirm={handleDelete}
//                 onCancel={() => setDeleteConfirm(null)}
//             />
//         </>
//     );
// }












// code optimise rapdie
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useCompagniesData } from '../hooks/useCompagniesData';
import { CompagniesHeader } from '../components/compagnies/CompagniesHeader';
import { CompagniesSearch } from '../components/compagnies/CompagniesSearch';
import { CompagnieCard } from '../components/compagnies/CompagnieCard';
import { CompagnieModal } from '../components/compagnies/CompagnieModal';
import { TauxModal } from '../components/compagnies/TauxModal';
import { DeleteConfirmModal } from '../components/compagnies/DeleteConfirmModal';
import toast from 'react-hot-toast';

export default function Compagnies() {
    const { profile } = useAuth();
    const { compagnies, loading, refetch } = useCompagniesData();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompagnie, setSelectedCompagnie] = useState(null);
    const [editTauxModal, setEditTauxModal] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [formData, setFormData] = useState({
        nom: '',
        sigle: '',
        description: '',
        logo_url: '',
        lien_souscription: '',
        actif: true,
    });

    // ⚡ OPTIMISATION : Memoize le filtrage
    const filteredCompagnies = useMemo(() => {
        if (!searchTerm) return compagnies;

        const search = searchTerm.toLowerCase();
        return compagnies.filter(compagnie =>
            compagnie.nom.toLowerCase().includes(search) ||
            compagnie.sigle.toLowerCase().includes(search)
        );
    }, [compagnies, searchTerm]);

    // ⚡ OPTIMISATION : useCallback pour reset
    const resetForm = useCallback(() => {
        setFormData({
            nom: '',
            sigle: '',
            description: '',
            logo_url: '',
            lien_souscription: '',
            actif: true
        });
    }, []);

    // ⚡ OPTIMISATION : useCallback pour handleAdd
    const handleAdd = useCallback(() => {
        resetForm();
        setSelectedCompagnie(null);
        setIsModalOpen(true);
    }, [resetForm]);

    // ⚡ OPTIMISATION : useCallback pour handleEdit
    const handleEdit = useCallback((compagnie) => {
        setSelectedCompagnie(compagnie);
        setFormData({
            nom: compagnie.nom || '',
            sigle: compagnie.sigle || '',
            description: compagnie.description || '',
            logo_url: compagnie.logo_url || '',
            lien_souscription: compagnie.lien_souscription || '',
            actif: compagnie.actif,
        });
        setIsModalOpen(true);
    }, []);

    // ⚡ OPTIMISATION : useCallback pour handleDelete
    const handleDelete = useCallback(async (compagnieId) => {
        try {
            const promise = supabase
                .from('compagnies')
                .delete()
                .eq('id', compagnieId);

            await toast.promise(promise, {
                loading: 'Suppression...',
                success: 'Compagnie supprimée ! 🗑️',
                error: 'Erreur lors de la suppression',
            });

            await refetch();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Erreur:', error);
        }
    }, [refetch]);

    // ⚡ OPTIMISATION : useCallback pour openEditTaux
    const openEditTaux = useCallback((compagnie) => {
        setEditTauxModal(compagnie);
    }, []);

    // ⚡ OPTIMISATION : useCallback pour closeModal
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedCompagnie(null);
        resetForm();
    }, [resetForm]);

    const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

    return (
        <div className="animate-fade-in">
            <CompagniesHeader count={filteredCompagnies.length} onAdd={handleAdd} />

            <CompagniesSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : filteredCompagnies.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">Aucune compagnie trouvée</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompagnies.map((compagnie) => (
                        <CompagnieCard
                            key={compagnie.id}
                            compagnie={compagnie}
                            onEdit={handleEdit}
                            onDelete={setDeleteConfirm}
                            onEditTaux={openEditTaux}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            )}

            <CompagnieModal
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedCompagnie={selectedCompagnie}
                formData={formData}
                setFormData={setFormData}
                onSuccess={async () => {
                    await refetch();
                    closeModal();
                    toast.success(selectedCompagnie ? 'Compagnie mise à jour ! 🎉' : 'Compagnie créée ! 🎉');
                }}
            />

            <TauxModal
                compagnie={editTauxModal}
                onClose={() => setEditTauxModal(null)}
                onSuccess={refetch}
            />

            <DeleteConfirmModal
                compagnieId={deleteConfirm}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
            />
        </div>
    );
}