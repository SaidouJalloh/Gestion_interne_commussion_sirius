// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';

// export default function Medias() {
//     const [medias, setMedias] = useState([]);
//     const [dossiers, setDossiers] = useState([]);
//     const [dossierActuel, setDossierActuel] = useState(null);
//     const [breadcrumb, setBreadcrumb] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [viewMode, setViewMode] = useState('grid');
//     const [showCorbeille, setShowCorbeille] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [isUploading, setIsUploading] = useState(false);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [createDossierModal, setCreateDossierModal] = useState(false);
//     const [nouveauDossier, setNouveauDossier] = useState({ nom: '', couleur: 'blue' });
//     const { profile } = useAuth();

//     const couleurs = [
//         { nom: 'Bleu', value: 'blue', bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
//         { nom: 'Vert', value: 'green', bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
//         { nom: 'Rouge', value: 'red', bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
//         { nom: 'Jaune', value: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' },
//         { nom: 'Violet', value: 'purple', bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' },
//         { nom: 'Rose', value: 'pink', bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-300' },
//         { nom: 'Gris', value: 'gray', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
//     ];

//     useEffect(() => {
//         fetchData();
//     }, [dossierActuel, showCorbeille]);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             const [dossiersRes, mediasRes] = await Promise.all([
//                 supabase.from('dossiers').select('*').is('parent_id', dossierActuel).order('nom'),
//                 supabase.from('medias').select('*, clients(nom, prenom), contrats(type_contrat)')
//                     .is('dossier_id', dossierActuel)
//                     .eq('supprime', showCorbeille)
//                     .order('created_at', { ascending: false })
//             ]);

//             if (dossiersRes.error) throw dossiersRes.error;
//             if (mediasRes.error) throw mediasRes.error;

//             setDossiers(dossiersRes.data || []);
//             setMedias(mediasRes.data || []);

//             if (dossierActuel) {
//                 await buildBreadcrumb(dossierActuel);
//             } else {
//                 setBreadcrumb([]);
//             }
//         } catch (error) {
//             console.error('Erreur:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const buildBreadcrumb = async (dossierId) => {
//         try {
//             const path = [];
//             let currentId = dossierId;

//             while (currentId) {
//                 const { data } = await supabase.from('dossiers').select('*').eq('id', currentId).single();
//                 if (data) {
//                     path.unshift(data);
//                     currentId = data.parent_id;
//                 } else {
//                     break;
//                 }
//             }
//             setBreadcrumb(path);
//         } catch (error) {
//             console.error('Erreur breadcrumb:', error);
//         }
//     };

//     const handleCreateDossier = async (e) => {
//         e.preventDefault();
//         try {
//             const { error } = await supabase.from('dossiers').insert([{
//                 nom: nouveauDossier.nom,
//                 couleur: nouveauDossier.couleur,
//                 parent_id: dossierActuel || null
//             }]);
//             if (error) throw error;
//             await fetchData();
//             setCreateDossierModal(false);
//             setNouveauDossier({ nom: '', couleur: 'blue' });
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleFileUpload = async (e) => {
//         const files = e.target.files;
//         if (!files.length) return;

//         setIsUploading(true);
//         setUploadProgress(0);

//         for (let i = 0; i < files.length; i++) {
//             const file = files[i];
//             try {
//                 const fileExt = file.name.split('.').pop();
//                 const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
//                 const filePath = `${fileName}`;

//                 const { error: uploadError } = await supabase.storage
//                     .from('documents')
//                     .upload(filePath, file);

//                 if (uploadError) throw uploadError;

//                 const { data } = supabase.storage.from('documents').getPublicUrl(filePath);

//                 await supabase.from('medias').insert([{
//                     nom: file.name,
//                     type_fichier: file.type,
//                     taille: file.size,
//                     url: data.publicUrl,
//                     dossier_id: dossierActuel || null,
//                     created_by: profile?.id || null
//                 }]);

//                 setUploadProgress(((i + 1) / files.length) * 100);
//             } catch (error) {
//                 console.error('Erreur upload:', error);
//                 alert('Erreur upload: ' + error.message);
//             }
//         }

//         setIsUploading(false);
//         setUploadProgress(0);
//         await fetchData();
//     };

//     const handleRenameDossier = async (dossierId, nouveauNom) => {
//         try {
//             const { error } = await supabase
//                 .from('dossiers')
//                 .update({ nom: nouveauNom })
//                 .eq('id', dossierId);
//             if (error) throw error;
//             await fetchData();
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleRenameMedia = async (mediaId, nouveauNom) => {
//         try {
//             const { error } = await supabase
//                 .from('medias')
//                 .update({ nom: nouveauNom })
//                 .eq('id', mediaId);
//             if (error) throw error;
//             await fetchData();
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleDeleteMedia = async (mediaId) => {
//         if (!window.confirm('Déplacer ce fichier vers la corbeille ?')) return;
//         try {
//             const { error } = await supabase.from('medias').update({
//                 supprime: true,
//                 date_suppression: new Date().toISOString()
//             }).eq('id', mediaId);
//             if (error) throw error;
//             await fetchData();
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleRestoreMedia = async (mediaId) => {
//         try {
//             const { error } = await supabase.from('medias').update({
//                 supprime: false,
//                 date_suppression: null
//             }).eq('id', mediaId);
//             if (error) throw error;
//             await fetchData();
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleDeletePermanent = async (mediaId) => {
//         if (!window.confirm('Supprimer définitivement ce fichier ? Cette action est irréversible.')) return;
//         try {
//             const { error } = await supabase.from('medias').delete().eq('id', mediaId);
//             if (error) throw error;
//             await fetchData();
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const handleDeleteDossier = async (dossierId) => {
//         if (!window.confirm('Supprimer ce dossier et tout son contenu ?')) return;
//         try {
//             const { error } = await supabase.from('dossiers').delete().eq('id', dossierId);
//             if (error) throw error;
//             await fetchData();
//         } catch (error) {
//             alert('Erreur: ' + error.message);
//         }
//     };

//     const formatFileSize = (bytes) => {
//         if (bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
//     };

//     const getFileIcon = (type) => {
//         if (type?.includes('pdf')) return '📄';
//         if (type?.includes('image')) return '🖼️';
//         if (type?.includes('video')) return '🎥';
//         if (type?.includes('word') || type?.includes('document')) return '📝';
//         if (type?.includes('excel') || type?.includes('sheet')) return '📊';
//         if (type?.includes('zip') || type?.includes('rar')) return '📦';
//         return '📎';
//     };

//     const getCouleur = (couleurValue) => {
//         return couleurs.find(c => c.value === couleurValue) || couleurs[6];
//     };

//     const filteredMedias = medias.filter(media =>
//         media.nom.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const filteredDossiers = dossiers.filter(dossier =>
//         dossier.nom.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'gestionnaire';

//     return (
//         <>
//             <div className="mb-6">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-900">Gestionnaire de Documents</h1>
//                         <p className="text-gray-600 mt-1">
//                             {showCorbeille ? 'Corbeille' : `${filteredDossiers.length} dossier(s) • ${filteredMedias.length} fichier(s)`}
//                         </p>
//                     </div>
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => setShowCorbeille(!showCorbeille)}
//                             className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${showCorbeille
//                                 ? 'bg-danger-600 text-white hover:bg-danger-700'
//                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                                 }`}
//                         >
//                             {showCorbeille ? 'Retour aux documents' : '🗑️ Corbeille'}
//                         </button>
//                         {!showCorbeille && (
//                             <>
//                                 <button onClick={() => setCreateDossierModal(true)} className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
//                                     📁 Nouveau dossier
//                                 </button>
//                                 <label className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer inline-flex items-center gap-2">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                                     </svg>
//                                     Télécharger fichier
//                                     <input type="file" multiple onChange={handleFileUpload} className="hidden" disabled={isUploading} />
//                                 </label>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {isUploading && (
//                 <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm font-medium text-primary-900">Upload en cours...</span>
//                         <span className="text-sm font-semibold text-primary-600">{Math.round(uploadProgress)}%</span>
//                     </div>
//                     <div className="w-full bg-primary-200 rounded-full h-2">
//                         <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
//                     </div>
//                 </div>
//             )}

//             {!showCorbeille && (
//                 <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
//                     <div className="flex items-center gap-4">
//                         <button
//                             onClick={() => {
//                                 setDossierActuel(null);
//                                 setBreadcrumb([]);
//                             }}
//                             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                             title="Racine"
//                         >
//                             <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//                             </svg>
//                         </button>
//                         <div className="flex items-center gap-2 flex-1 overflow-x-auto">
//                             {breadcrumb.map((dossier, index) => (
//                                 <div key={dossier.id} className="flex items-center gap-2">
//                                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                                     </svg>
//                                     <button
//                                         onClick={() => setDossierActuel(dossier.id)}
//                                         className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
//                                     >
//                                         {dossier.nom}
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <div className="relative flex-1 min-w-[200px]">
//                                 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                 </svg>
//                                 <input
//                                     type="text"
//                                     placeholder="Rechercher..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 />
//                             </div>
//                             <div className="flex bg-gray-100 rounded-lg p-1">
//                                 <button
//                                     onClick={() => setViewMode('grid')}
//                                     className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
//                                 >
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                                     </svg>
//                                 </button>
//                                 <button
//                                     onClick={() => setViewMode('list')}
//                                     className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
//                                 >
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                                     </svg>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex items-center justify-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//                 </div>
//             ) : (
//                 <>
//                     {viewMode === 'grid' ? (
//                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
//                             {!showCorbeille && filteredDossiers.map((dossier) => {
//                                 const couleur = getCouleur(dossier.couleur);
//                                 return (
//                                     <div
//                                         key={dossier.id}
//                                         className="group relative bg-white rounded-lg p-4 hover:shadow-medium transition-all border-2 border-transparent hover:border-primary-300"
//                                     >
//                                         <button
//                                             onClick={() => setDossierActuel(dossier.id)}
//                                             className="w-full"
//                                         >
//                                             <div className={`w-16 h-16 mx-auto ${couleur.bg} rounded-lg flex items-center justify-center mb-2`}>
//                                                 <svg className={`w-10 h-10 ${couleur.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//                                                 </svg>
//                                             </div>
//                                             <p className="text-sm font-medium text-gray-900 text-center truncate">{dossier.nom}</p>
//                                         </button>
//                                         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     const nouveauNom = prompt('Nouveau nom du dossier:', dossier.nom);
//                                                     if (nouveauNom && nouveauNom.trim()) {
//                                                         handleRenameDossier(dossier.id, nouveauNom.trim());
//                                                     }
//                                                 }}
//                                                 className="p-1 bg-white rounded-full shadow-md hover:bg-primary-50"
//                                                 title="Renommer"
//                                             >
//                                                 <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                 </svg>
//                                             </button>
//                                             {canDelete && (
//                                                 <button
//                                                     onClick={(e) => {
//                                                         e.stopPropagation();
//                                                         handleDeleteDossier(dossier.id);
//                                                     }}
//                                                     className="p-1 bg-white rounded-full shadow-md hover:bg-danger-50"
//                                                     title="Supprimer"
//                                                 >
//                                                     <svg className="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                     </svg>
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </div>
//                                 );
//                             })}

//                             {filteredMedias.map((media) => (
//                                 <div
//                                     key={media.id}
//                                     className="group relative bg-white rounded-lg p-4 hover:shadow-medium transition-all border-2 border-transparent hover:border-primary-300"
//                                 >
//                                     <button
//                                         onClick={() => setSelectedFile(media)}
//                                         className="w-full"
//                                     >
//                                         {media.type_fichier?.includes('image') ? (
//                                             <img src={media.url} alt={media.nom} className="w-full h-24 object-cover rounded-lg mb-2" />
//                                         ) : (
//                                             <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2 text-3xl">
//                                                 {getFileIcon(media.type_fichier)}
//                                             </div>
//                                         )}
//                                         <p className="text-sm font-medium text-gray-900 text-center truncate">{media.nom}</p>
//                                         <p className="text-xs text-gray-500 text-center">{formatFileSize(media.taille)}</p>
//                                     </button>
//                                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
//                                         <button
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 const nouveauNom = prompt('Nouveau nom du fichier:', media.nom);
//                                                 if (nouveauNom && nouveauNom.trim()) {
//                                                     handleRenameMedia(media.id, nouveauNom.trim());
//                                                 }
//                                             }}
//                                             className="p-1 bg-white rounded-full shadow-md hover:bg-primary-50"
//                                             title="Renommer"
//                                         >
//                                             <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                             </svg>
//                                         </button>
//                                         {showCorbeille ? (
//                                             <>
//                                                 <button
//                                                     onClick={() => handleRestoreMedia(media.id)}
//                                                     className="p-1 bg-white rounded-full shadow-md hover:bg-success-50"
//                                                     title="Restaurer"
//                                                 >
//                                                     <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                                                     </svg>
//                                                 </button>
//                                                 {canDelete && (
//                                                     <button
//                                                         onClick={() => handleDeletePermanent(media.id)}
//                                                         className="p-1 bg-white rounded-full shadow-md hover:bg-danger-50"
//                                                         title="Supprimer définitivement"
//                                                     >
//                                                         <svg className="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                                         </svg>
//                                                     </button>
//                                                 )}
//                                             </>
//                                         ) : (
//                                             <button
//                                                 onClick={() => handleDeleteMedia(media.id)}
//                                                 className="p-1 bg-white rounded-full shadow-md hover:bg-danger-50"
//                                                 title="Supprimer"
//                                             >
//                                                 <svg className="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                 </svg>
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//                             <table className="w-full">
//                                 <thead className="bg-gray-50 border-b">
//                                     <tr>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nom</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Taille</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
//                                         <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y">
//                                     {!showCorbeille && filteredDossiers.map((dossier) => {
//                                         const couleur = getCouleur(dossier.couleur);
//                                         return (
//                                             <tr key={dossier.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDossierActuel(dossier.id)}>
//                                                 <td className="px-6 py-4">
//                                                     <div className="flex items-center gap-3">
//                                                         <div className={`w-10 h-10 ${couleur.bg} rounded-lg flex items-center justify-center`}>
//                                                             <svg className={`w-6 h-6 ${couleur.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//                                                             </svg>
//                                                         </div>
//                                                         <span className="font-medium text-gray-900">{dossier.nom}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 text-sm text-gray-600">Dossier</td>
//                                                 <td className="px-6 py-4 text-sm text-gray-600">-</td>
//                                                 <td className="px-6 py-4 text-sm text-gray-600">{new Date(dossier.created_at).toLocaleDateString('fr-FR')}</td>
//                                                 <td className="px-6 py-4 text-right">
//                                                     <div className="flex justify-end gap-2">
//                                                         <button onClick={(e) => { e.stopPropagation(); const nouveauNom = prompt('Nouveau nom:', dossier.nom); if (nouveauNom?.trim()) handleRenameDossier(dossier.id, nouveauNom.trim()); }} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
//                                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                             </svg>
//                                                         </button>
//                                                         {canDelete && (
//                                                             <button onClick={(e) => { e.stopPropagation(); handleDeleteDossier(dossier.id); }} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg">
//                                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                                 </svg>
//                                                             </button>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })}

//                                     {filteredMedias.map((media) => (
//                                         <tr key={media.id} className="hover:bg-gray-50">
//                                             <td className="px-6 py-4">
//                                                 <button onClick={() => setSelectedFile(media)} className="flex items-center gap-3 text-left">
//                                                     <span className="text-2xl">{getFileIcon(media.type_fichier)}</span>
//                                                     <span className="font-medium text-gray-900">{media.nom}</span>
//                                                 </button>
//                                             </td>
//                                             <td className="px-6 py-4 text-sm text-gray-600">{media.type_fichier?.split('/')[1] || 'Inconnu'}</td>
//                                             <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(media.taille)}</td>
//                                             <td className="px-6 py-4 text-sm text-gray-600">{new Date(media.created_at).toLocaleDateString('fr-FR')}</td>
//                                             <td className="px-6 py-4 text-right">
//                                                 <div className="flex justify-end gap-2">
//                                                     <button onClick={() => { const nouveauNom = prompt('Nouveau nom:', media.nom); if (nouveauNom?.trim()) handleRenameMedia(media.id, nouveauNom.trim()); }} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
//                                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                         </svg>
//                                                     </button>
//                                                     {showCorbeille ? (
//                                                         <>
//                                                             <button onClick={() => handleRestoreMedia(media.id)} className="p-2 text-success-600 hover:bg-success-50 rounded-lg" title="Restaurer">
//                                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                                                                 </svg>
//                                                             </button>
//                                                             {canDelete && (
//                                                                 <button onClick={() => handleDeletePermanent(media.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer définitivement">
//                                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                                                     </svg>
//                                                                 </button>
//                                                             )}
//                                                         </>
//                                                     ) : (
//                                                         <button onClick={() => handleDeleteMedia(media.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
//                                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                             </svg>
//                                                         </button>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}

//                     {filteredDossiers.length === 0 && filteredMedias.length === 0 && (
//                         <div className="text-center py-12 bg-white rounded-xl">
//                             <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//                             </svg>
//                             <p className="text-gray-500 text-lg font-medium">
//                                 {showCorbeille ? 'La corbeille est vide' : 'Aucun document'}
//                             </p>
//                         </div>
//                     )}
//                 </>
//             )}

//             {/* Modal création dossier */}
//             {createDossierModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
//                     <div className="bg-white rounded-xl shadow-strong max-w-md w-full animate-scale-in">
//                         <div className="border-b px-6 py-4">
//                             <h2 className="text-xl font-bold">Créer un nouveau dossier</h2>
//                         </div>
//                         <form onSubmit={handleCreateDossier} className="p-6 space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Nom du dossier</label>
//                                 <input
//                                     type="text"
//                                     value={nouveauDossier.nom}
//                                     onChange={(e) => setNouveauDossier({ ...nouveauDossier, nom: e.target.value })}
//                                     className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                     required
//                                     placeholder="Ex: Documents juridiques"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Couleur</label>
//                                 <div className="grid grid-cols-7 gap-3">
//                                     {couleurs.map((couleur) => (
//                                         <button
//                                             key={couleur.value}
//                                             type="button"
//                                             onClick={() => setNouveauDossier({ ...nouveauDossier, couleur: couleur.value })}
//                                             className={`w-12 h-12 rounded-lg ${couleur.bg} flex items-center justify-center transition-all ${nouveauDossier.couleur === couleur.value
//                                                 ? `ring-4 ring-${couleur.value}-400 scale-110`
//                                                 : 'hover:scale-105'
//                                                 }`}
//                                             title={couleur.nom}
//                                         >
//                                             {nouveauDossier.couleur === couleur.value && (
//                                                 <svg className={`w-6 h-6 ${couleur.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                                 </svg>
//                                             )}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                             <div className="flex gap-3 pt-4 border-t">
//                                 <button type="button" onClick={() => setCreateDossierModal(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">
//                                     Annuler
//                                 </button>
//                                 <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
//                                     Créer
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Modal prévisualisation fichier */}
//             {selectedFile && (
//                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedFile(null)}>
//                     <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
//                         <div className="border-b px-6 py-4 flex justify-between items-center">
//                             <div>
//                                 <h2 className="text-xl font-bold">{selectedFile.nom}</h2>
//                                 <p className="text-sm text-gray-600">{formatFileSize(selectedFile.taille)} • {new Date(selectedFile.created_at).toLocaleDateString('fr-FR')}</p>
//                             </div>
//                             <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-gray-100 rounded-lg">
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//                         <div className="p-6 max-h-[70vh] overflow-y-auto">
//                             {selectedFile.type_fichier?.includes('image') ? (
//                                 <img src={selectedFile.url} alt={selectedFile.nom} className="w-full h-auto rounded-lg" />
//                             ) : selectedFile.type_fichier?.includes('pdf') ? (
//                                 <iframe src={selectedFile.url} className="w-full h-[60vh] rounded-lg" />
//                             ) : (
//                                 <div className="text-center py-12">
//                                     <div className="text-6xl mb-4">{getFileIcon(selectedFile.type_fichier)}</div>
//                                     <p className="text-gray-600 mb-4">Aperçu non disponible pour ce type de fichier</p>
//                                     <a href={selectedFile.url} download className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                                         </svg>
//                                         Télécharger
//                                     </a>
//                                 </div>
//                             )}
//                         </div>
//                         <div className="border-t px-6 py-4 bg-gray-50">
//                             <div className="flex justify-between items-center">
//                                 <div>
//                                     {selectedFile.clients && (
//                                         <p className="text-sm text-gray-600">Client: <span className="font-medium">{selectedFile.clients.nom} {selectedFile.clients.prenom}</span></p>
//                                     )}
//                                     {selectedFile.contrats && (
//                                         <p className="text-sm text-gray-600">Contrat: <span className="font-medium">{selectedFile.contrats.type_contrat}</span></p>
//                                     )}
//                                 </div>
//                                 <a href={selectedFile.url} download className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center gap-2">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                                     </svg>
//                                     Télécharger
//                                 </a>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }












// new code 
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Medias() {
    const [medias, setMedias] = useState([]);
    const [dossiers, setDossiers] = useState([]);
    const [dossierActuel, setDossierActuel] = useState(null);
    const [breadcrumb, setBreadcrumb] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [showCorbeille, setShowCorbeille] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [createDossierModal, setCreateDossierModal] = useState(false);
    const [nouveauDossier, setNouveauDossier] = useState({ nom: '', couleur: 'blue' });
    const [currentUploadFile, setCurrentUploadFile] = useState('');
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [fileToMove, setFileToMove] = useState(null);
    const [notification, setNotification] = useState(null);
    const { profile } = useAuth();

    const couleurs = [
        { nom: 'Bleu', value: 'blue', bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
        { nom: 'Vert', value: 'green', bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
        { nom: 'Rouge', value: 'red', bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
        { nom: 'Jaune', value: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' },
        { nom: 'Violet', value: 'purple', bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' },
        { nom: 'Rose', value: 'pink', bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-300' },
        { nom: 'Gris', value: 'gray', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
    ];

    // Fonction pour afficher les notifications
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        fetchData();
    }, [dossierActuel, showCorbeille]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dossiersRes, mediasRes] = await Promise.all([
                dossierActuel
                    ? supabase.from('dossiers').select('*').eq('parent_id', dossierActuel).order('nom')
                    : supabase.from('dossiers').select('*').is('parent_id', null).order('nom'),
                dossierActuel
                    ? supabase.from('medias').select('*, clients(nom, prenom), contrats(type_contrat)')
                        .eq('dossier_id', dossierActuel)
                        .eq('supprime', showCorbeille)
                        .order('created_at', { ascending: false })
                    : supabase.from('medias').select('*, clients(nom, prenom), contrats(type_contrat)')
                        .is('dossier_id', null)
                        .eq('supprime', showCorbeille)
                        .order('created_at', { ascending: false })
            ]);

            if (dossiersRes.error) throw dossiersRes.error;
            if (mediasRes.error) throw mediasRes.error;

            setDossiers(dossiersRes.data || []);
            setMedias(mediasRes.data || []);

            if (dossierActuel) {
                await buildBreadcrumb(dossierActuel);
            } else {
                setBreadcrumb([]);
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors du chargement des données: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const buildBreadcrumb = async (dossierId) => {
        try {
            const path = [];
            let currentId = dossierId;

            while (currentId) {
                const { data } = await supabase.from('dossiers').select('*').eq('id', currentId).single();
                if (data) {
                    path.unshift(data);
                    currentId = data.parent_id;
                } else {
                    break;
                }
            }
            setBreadcrumb(path);
        } catch (error) {
            console.error('Erreur breadcrumb:', error);
        }
    };

    const handleCreateDossier = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('dossiers').insert([{
                nom: nouveauDossier.nom,
                couleur: nouveauDossier.couleur,
                parent_id: dossierActuel || null
            }]);

            if (error) throw error;

            await fetchData();
            setCreateDossierModal(false);
            setNouveauDossier({ nom: '', couleur: 'blue' });
            showNotification('Dossier créé avec succès !');
        } catch (error) {
            console.error('Erreur création dossier:', error);
            showNotification('Erreur lors de la création du dossier: ' + error.message, 'error');
        }
    };

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        setIsUploading(true);
        setUploadProgress(0);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setCurrentUploadFile(file.name);

            try {
                // Créer un nom de fichier unique avec organisation par date
                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const fileExt = file.name.split('.').pop();
                const randomString = Math.random().toString(36).substring(2, 15);
                const timestamp = Date.now();
                const fileName = `${year}/${month}/${randomString}-${timestamp}.${fileExt}`;

                // Upload vers Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Erreur upload storage:', uploadError);
                    throw uploadError;
                }

                // Obtenir l'URL publique
                const { data: urlData } = supabase.storage
                    .from('documents')
                    .getPublicUrl(fileName);

                if (!urlData?.publicUrl) {
                    throw new Error('Impossible de générer l\'URL du fichier');
                }

                // Insérer dans la table medias (AVEC AWAIT - c'était le bug principal)
                const { data: mediaData, error: insertError } = await supabase
                    .from('medias')
                    .insert([{
                        nom: file.name,
                        type_fichier: file.type || 'application/octet-stream',
                        taille: file.size,
                        url: urlData.publicUrl,
                        dossier_id: dossierActuel || null,
                        created_by: profile?.id || null
                    }])
                    .select();

                if (insertError) {
                    console.error('Erreur insertion base de données:', insertError);
                    // Si l'insertion échoue, supprimer le fichier du storage
                    await supabase.storage.from('documents').remove([fileName]);
                    throw insertError;
                }

                successCount++;
                setUploadProgress(((i + 1) / files.length) * 100);

            } catch (error) {
                console.error('Erreur upload fichier:', file.name, error);
                errorCount++;
                showNotification(`Erreur upload ${file.name}: ${error.message}`, 'error');
            }
        }

        setIsUploading(false);
        setUploadProgress(0);
        setCurrentUploadFile('');

        // Message de synthèse
        if (successCount > 0) {
            showNotification(`${successCount} fichier(s) uploadé(s) avec succès !`);
            await fetchData();
        }
        if (errorCount > 0) {
            showNotification(`${errorCount} fichier(s) en erreur`, 'error');
        }
    };

    const handleRenameDossier = async (dossierId, nouveauNom) => {
        try {
            const { error } = await supabase
                .from('dossiers')
                .update({ nom: nouveauNom, updated_at: new Date().toISOString() })
                .eq('id', dossierId);

            if (error) throw error;

            await fetchData();
            showNotification('Dossier renommé avec succès !');
        } catch (error) {
            console.error('Erreur renommage dossier:', error);
            showNotification('Erreur lors du renommage: ' + error.message, 'error');
        }
    };

    const handleRenameMedia = async (mediaId, nouveauNom) => {
        try {
            const { error } = await supabase
                .from('medias')
                .update({ nom: nouveauNom, updated_at: new Date().toISOString() })
                .eq('id', mediaId);

            if (error) throw error;

            await fetchData();
            showNotification('Fichier renommé avec succès !');
        } catch (error) {
            console.error('Erreur renommage fichier:', error);
            showNotification('Erreur lors du renommage: ' + error.message, 'error');
        }
    };

    const handleDeleteMedia = async (mediaId) => {
        if (!window.confirm('Déplacer ce fichier vers la corbeille ?')) return;
        try {
            const { error } = await supabase.from('medias').update({
                supprime: true,
                date_suppression: new Date().toISOString()
            }).eq('id', mediaId);

            if (error) throw error;

            await fetchData();
            showNotification('Fichier déplacé vers la corbeille');
        } catch (error) {
            console.error('Erreur suppression:', error);
            showNotification('Erreur: ' + error.message, 'error');
        }
    };

    const handleRestoreMedia = async (mediaId) => {
        try {
            const { error } = await supabase.from('medias').update({
                supprime: false,
                date_suppression: null
            }).eq('id', mediaId);

            if (error) throw error;

            await fetchData();
            showNotification('Fichier restauré avec succès !');
        } catch (error) {
            console.error('Erreur restauration:', error);
            showNotification('Erreur: ' + error.message, 'error');
        }
    };

    const handleDeletePermanent = async (mediaId, mediaUrl) => {
        if (!window.confirm('Supprimer définitivement ce fichier ? Cette action est irréversible.')) return;
        try {
            // Extraire le chemin du fichier depuis l'URL
            const url = new URL(mediaUrl);
            const pathParts = url.pathname.split('/storage/v1/object/public/documents/');
            const filePath = pathParts[1];

            // Supprimer de la base de données
            const { error: dbError } = await supabase.from('medias').delete().eq('id', mediaId);
            if (dbError) throw dbError;

            // Supprimer du storage
            if (filePath) {
                const { error: storageError } = await supabase.storage
                    .from('documents')
                    .remove([filePath]);

                if (storageError) {
                    console.error('Erreur suppression storage:', storageError);
                }
            }

            await fetchData();
            showNotification('Fichier supprimé définitivement');
        } catch (error) {
            console.error('Erreur suppression permanente:', error);
            showNotification('Erreur: ' + error.message, 'error');
        }
    };

    const handleDeleteDossier = async (dossierId) => {
        if (!window.confirm('Supprimer ce dossier et tout son contenu ?')) return;
        try {
            // Vérifier s'il y a des sous-dossiers ou fichiers
            const [subDossiers, subMedias] = await Promise.all([
                supabase.from('dossiers').select('id').eq('parent_id', dossierId),
                supabase.from('medias').select('id').eq('dossier_id', dossierId)
            ]);

            if (subDossiers.data?.length > 0 || subMedias.data?.length > 0) {
                if (!window.confirm('Ce dossier contient des éléments. Confirmer la suppression complète ?')) {
                    return;
                }
            }

            const { error } = await supabase.from('dossiers').delete().eq('id', dossierId);
            if (error) throw error;

            await fetchData();
            showNotification('Dossier supprimé avec succès');
        } catch (error) {
            console.error('Erreur suppression dossier:', error);
            showNotification('Erreur: ' + error.message, 'error');
        }
    };

    const handleMoveFile = async (mediaId, newDossierId) => {
        try {
            const { error } = await supabase
                .from('medias')
                .update({
                    dossier_id: newDossierId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', mediaId);

            if (error) throw error;

            await fetchData();
            setShowMoveModal(false);
            setFileToMove(null);
            showNotification('Fichier déplacé avec succès !');
        } catch (error) {
            console.error('Erreur déplacement:', error);
            showNotification('Erreur: ' + error.message, 'error');
        }
    };

    const handleDownloadFile = async (media) => {
        try {
            // Extraire le chemin du fichier
            const url = new URL(media.url);
            const pathParts = url.pathname.split('/storage/v1/object/public/documents/');
            const filePath = pathParts[1];

            if (!filePath) {
                throw new Error('Chemin du fichier invalide');
            }

            // Créer une URL signée pour le téléchargement (valide 60 secondes)
            const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(filePath, 60, {
                    download: media.nom
                });

            if (error) throw error;

            if (data?.signedUrl) {
                // Ouvrir dans un nouvel onglet pour forcer le téléchargement
                const link = document.createElement('a');
                link.href = data.signedUrl;
                link.download = media.nom;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                showNotification('Téléchargement démarré');
            }
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            showNotification('Erreur lors du téléchargement: ' + error.message, 'error');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type?.includes('pdf')) return '📄';
        if (type?.includes('image')) return '🖼️';
        if (type?.includes('video')) return '🎥';
        if (type?.includes('word') || type?.includes('document')) return '📝';
        if (type?.includes('excel') || type?.includes('sheet')) return '📊';
        if (type?.includes('zip') || type?.includes('rar')) return '📦';
        return '📎';
    };

    const getCouleur = (couleurValue) => {
        return couleurs.find(c => c.value === couleurValue) || couleurs[6];
    };

    const filteredMedias = medias.filter(media =>
        media.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDossiers = dossiers.filter(dossier =>
        dossier.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'gestionnaire';

    return (
        <>
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg animate-slide-in ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                    <div className="flex items-center gap-3">
                        {notification.type === 'success' ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestionnaire de Documents</h1>
                        <p className="text-gray-600 mt-1">
                            {showCorbeille ? 'Corbeille' : `${filteredDossiers.length} dossier(s) • ${filteredMedias.length} fichier(s)`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCorbeille(!showCorbeille)}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${showCorbeille
                                ? 'bg-danger-600 text-white hover:bg-danger-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {showCorbeille ? 'Retour aux documents' : '🗑️ Corbeille'}
                        </button>
                        {!showCorbeille && (
                            <>
                                <button onClick={() => setCreateDossierModal(true)} className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                    📁 Nouveau dossier
                                </button>
                                <label className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer inline-flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Télécharger fichier
                                    <input type="file" multiple onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                                </label>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isUploading && (
                <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                            <span className="text-sm font-medium text-primary-900">Upload en cours...</span>
                            {currentUploadFile && (
                                <p className="text-xs text-primary-700 mt-1">{currentUploadFile}</p>
                            )}
                        </div>
                        <span className="text-sm font-semibold text-primary-600">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-primary-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                </div>
            )}

            {!showCorbeille && (
                <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setDossierActuel(null);
                                setBreadcrumb([]);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Racine"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                            {breadcrumb.map((dossier, index) => (
                                <div key={dossier.id} className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <button
                                        onClick={() => setDossierActuel(dossier.id)}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                                    >
                                        {dossier.nom}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 min-w-[200px]">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {!showCorbeille && filteredDossiers.map((dossier) => {
                                const couleur = getCouleur(dossier.couleur);
                                return (
                                    <div
                                        key={dossier.id}
                                        className="group relative bg-white rounded-lg p-4 hover:shadow-medium transition-all border-2 border-transparent hover:border-primary-300"
                                    >
                                        <button
                                            onClick={() => setDossierActuel(dossier.id)}
                                            className="w-full"
                                        >
                                            <div className={`w-16 h-16 mx-auto ${couleur.bg} rounded-lg flex items-center justify-center mb-2`}>
                                                <svg className={`w-10 h-10 ${couleur.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 text-center truncate">{dossier.nom}</p>
                                        </button>

                                        {/* Bouton + pour ajouter dans ce dossier */}
                                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDossierActuel(dossier.id);
                                                }}
                                                className="p-1.5 bg-primary-600 text-white rounded-full shadow-md hover:bg-primary-700"
                                                title="Ouvrir et ajouter du contenu"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const nouveauNom = prompt('Nouveau nom du dossier:', dossier.nom);
                                                    if (nouveauNom && nouveauNom.trim()) {
                                                        handleRenameDossier(dossier.id, nouveauNom.trim());
                                                    }
                                                }}
                                                className="p-1 bg-white rounded-full shadow-md hover:bg-primary-50"
                                                title="Renommer"
                                            >
                                                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteDossier(dossier.id);
                                                }}
                                                className="p-1 bg-white rounded-full shadow-md hover:bg-danger-50"
                                                title="Supprimer"
                                            >
                                                <svg className="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredMedias.map((media) => (
                                <div
                                    key={media.id}
                                    className="group relative bg-white rounded-lg p-4 hover:shadow-medium transition-all border-2 border-transparent hover:border-primary-300"
                                >
                                    <button
                                        onClick={() => setSelectedFile(media)}
                                        className="w-full"
                                    >
                                        {media.type_fichier?.includes('image') ? (
                                            <img src={media.url} alt={media.nom} className="w-full h-24 object-cover rounded-lg mb-2" />
                                        ) : (
                                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2 text-3xl">
                                                {getFileIcon(media.type_fichier)}
                                            </div>
                                        )}
                                        <p className="text-sm font-medium text-gray-900 text-center truncate">{media.nom}</p>
                                        <p className="text-xs text-gray-500 text-center">{formatFileSize(media.taille)}</p>
                                    </button>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        {!showCorbeille && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFileToMove(media);
                                                    setShowMoveModal(true);
                                                }}
                                                className="p-1 bg-white rounded-full shadow-md hover:bg-blue-50"
                                                title="Déplacer"
                                            >
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const nouveauNom = prompt('Nouveau nom du fichier:', media.nom);
                                                if (nouveauNom && nouveauNom.trim()) {
                                                    handleRenameMedia(media.id, nouveauNom.trim());
                                                }
                                            }}
                                            className="p-1 bg-white rounded-full shadow-md hover:bg-primary-50"
                                            title="Renommer"
                                        >
                                            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        {showCorbeille ? (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRestoreMedia(media.id);
                                                    }}
                                                    className="p-1 bg-white rounded-full shadow-md hover:bg-success-50"
                                                    title="Restaurer"
                                                >
                                                    <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </button>
                                                {canDelete && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePermanent(media.id, media.url);
                                                        }}
                                                        className="p-1 bg-white rounded-full shadow-md hover:bg-danger-50"
                                                        title="Supprimer définitivement"
                                                    >
                                                        <svg className="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteMedia(media.id);
                                                }}
                                                className="p-1 bg-white rounded-full shadow-md hover:bg-danger-50"
                                                title="Supprimer"
                                            >
                                                <svg className="w-4 h-4 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nom</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Taille</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {!showCorbeille && filteredDossiers.map((dossier) => {
                                        const couleur = getCouleur(dossier.couleur);
                                        return (
                                            <tr key={dossier.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setDossierActuel(dossier.id)}
                                                        className="flex items-center gap-3 text-left w-full"
                                                    >
                                                        <div className={`w-10 h-10 ${couleur.bg} rounded-lg flex items-center justify-center`}>
                                                            <svg className={`w-6 h-6 ${couleur.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="font-medium text-gray-900">{dossier.nom}</span>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">Dossier</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">-</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(dossier.created_at).toLocaleDateString('fr-FR')}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDossierActuel(dossier.id);
                                                            }}
                                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                                                            title="Ouvrir"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const nouveauNom = prompt('Nouveau nom:', dossier.nom);
                                                                if (nouveauNom?.trim()) handleRenameDossier(dossier.id, nouveauNom.trim());
                                                            }}
                                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteDossier(dossier.id);
                                                            }}
                                                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredMedias.map((media) => (
                                        <tr key={media.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <button onClick={() => setSelectedFile(media)} className="flex items-center gap-3 text-left">
                                                    <span className="text-2xl">{getFileIcon(media.type_fichier)}</span>
                                                    <span className="font-medium text-gray-900">{media.nom}</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{media.type_fichier?.split('/')[1] || 'Inconnu'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(media.taille)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(media.created_at).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {!showCorbeille && (
                                                        <button
                                                            onClick={() => {
                                                                setFileToMove(media);
                                                                setShowMoveModal(true);
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                            title="Déplacer"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button onClick={() => { const nouveauNom = prompt('Nouveau nom:', media.nom); if (nouveauNom?.trim()) handleRenameMedia(media.id, nouveauNom.trim()); }} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {showCorbeille ? (
                                                        <>
                                                            <button onClick={() => handleRestoreMedia(media.id)} className="p-2 text-success-600 hover:bg-success-50 rounded-lg" title="Restaurer">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                            </button>
                                                            {canDelete && (
                                                                <button onClick={() => handleDeletePermanent(media.id, media.url)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer définitivement">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleDeleteMedia(media.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg" title="Supprimer">
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

                    {filteredDossiers.length === 0 && filteredMedias.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">
                                {showCorbeille ? 'La corbeille est vide' : 'Aucun document'}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Modal création dossier */}
            {createDossierModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-strong max-w-md w-full animate-scale-in">
                        <div className="border-b px-6 py-4">
                            <h2 className="text-xl font-bold">Créer un nouveau dossier</h2>
                        </div>
                        <form onSubmit={handleCreateDossier} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nom du dossier</label>
                                <input
                                    type="text"
                                    value={nouveauDossier.nom}
                                    onChange={(e) => setNouveauDossier({ ...nouveauDossier, nom: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    required
                                    placeholder="Ex: Documents juridiques"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Couleur</label>
                                <div className="grid grid-cols-7 gap-3">
                                    {couleurs.map((couleur) => (
                                        <button
                                            key={couleur.value}
                                            type="button"
                                            onClick={() => setNouveauDossier({ ...nouveauDossier, couleur: couleur.value })}
                                            className={`w-12 h-12 rounded-lg ${couleur.bg} flex items-center justify-center transition-all ${nouveauDossier.couleur === couleur.value
                                                ? `ring-4 ring-${couleur.value}-400 scale-110`
                                                : 'hover:scale-105'
                                                }`}
                                            title={couleur.nom}
                                        >
                                            {nouveauDossier.couleur === couleur.value && (
                                                <svg className={`w-6 h-6 ${couleur.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setCreateDossierModal(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">
                                    Annuler
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal déplacement de fichier */}
            {showMoveModal && fileToMove && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMoveModal(false)}>
                    <div className="bg-white rounded-xl shadow-strong max-w-md w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Déplacer le fichier</h2>
                            <button onClick={() => setShowMoveModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Déplacer <strong>{fileToMove.nom}</strong> vers :
                            </p>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                <button
                                    onClick={() => handleMoveFile(fileToMove.id, null)}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-50 border-2 border-transparent hover:border-primary-300 transition-all flex items-center gap-3"
                                >
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="font-medium">Racine (Aucun dossier)</span>
                                </button>
                                {dossiers.map((dossier) => {
                                    const couleur = getCouleur(dossier.couleur);
                                    return (
                                        <button
                                            key={dossier.id}
                                            onClick={() => handleMoveFile(fileToMove.id, dossier.id)}
                                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-50 border-2 border-transparent hover:border-primary-300 transition-all flex items-center gap-3"
                                        >
                                            <div className={`w-10 h-10 ${couleur.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                <svg className={`w-6 h-6 ${couleur.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="font-medium">{dossier.nom}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal prévisualisation fichier */}
            {selectedFile && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedFile(null)}>
                    <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">{selectedFile.nom}</h2>
                                <p className="text-sm text-gray-600">{formatFileSize(selectedFile.taille)} • {new Date(selectedFile.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {selectedFile.type_fichier?.includes('image') ? (
                                <img src={selectedFile.url} alt={selectedFile.nom} className="w-full h-auto rounded-lg" />
                            ) : selectedFile.type_fichier?.includes('pdf') ? (
                                <iframe src={selectedFile.url} className="w-full h-[60vh] rounded-lg" title={selectedFile.nom} />
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">{getFileIcon(selectedFile.type_fichier)}</div>
                                    <p className="text-gray-600 mb-4">Aperçu non disponible pour ce type de fichier</p>
                                    <button
                                        onClick={() => handleDownloadFile(selectedFile)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Télécharger
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="border-t px-6 py-4 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div>
                                    {selectedFile.clients && (
                                        <p className="text-sm text-gray-600">Client: <span className="font-medium">{selectedFile.clients.nom} {selectedFile.clients.prenom}</span></p>
                                    )}
                                    {selectedFile.contrats && (
                                        <p className="text-sm text-gray-600">Contrat: <span className="font-medium">{selectedFile.contrats.type_contrat}</span></p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDownloadFile(selectedFile)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Télécharger
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}