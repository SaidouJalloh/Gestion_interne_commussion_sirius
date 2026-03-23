// // src/components/contrats/ContratsTable.jsx
// import { getStatutBadge } from '../../utils/contratHelpers';

// export const ContratsTable = ({ contrats, loading, onEdit, onDelete, onOpenPaiements, canDelete }) => {
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//             </div>
//         );
//     }

//     if (contrats.length === 0) {
//         return (
//             <div className="text-center py-12">
//                 <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 <p className="text-gray-500 text-lg font-medium">Aucun contrat trouvé</p>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//             <div className="overflow-x-auto">
//                 <table className="w-full">
//                     <thead className="bg-gray-50 border-b">
//                         <tr>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Compagnie</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Taux</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
//                             <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y">
//                         {contrats.map((contrat) => (
//                             <tr key={contrat.id} className="hover:bg-gray-50">
//                                 <td className="px-6 py-4">
//                                     <p className="font-medium text-gray-900">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                     <span className={`text-xs px-2 py-0.5 rounded-full ${contrat.clients?.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                         {contrat.clients?.type_client === 'particulier' ? 'Particulier' : 'Entreprise'}
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <div className="flex items-center gap-2">
//                                         {contrat.compagnies?.logo_url && (
//                                             <img
//                                                 src={contrat.compagnies.logo_url}
//                                                 alt={contrat.compagnies.nom}
//                                                 className="w-8 h-8 rounded object-cover"
//                                                 onError={(e) => { e.target.style.display = 'none'; }}
//                                             />
//                                         )}
//                                         <div>
//                                             <p className="font-medium text-gray-900">{contrat.compagnies?.nom}</p>
//                                             <p className="text-xs text-gray-500">{contrat.compagnies?.sigle}</p>
//                                         </div>
//                                     </div>
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <p className="text-sm font-medium text-gray-900">{contrat.type_contrat.replace(/_/g, ' ')}</p>
//                                     <p className="text-xs text-gray-500">{new Date(contrat.date_effet).toLocaleDateString('fr-FR')}</p>
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <span className="px-2.5 py-1 bg-accent-100 text-accent-700 rounded-lg text-sm font-semibold">
//                                         {(parseFloat(contrat.taux_commission) * 100).toFixed(2)}%
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4 text-sm font-semibold text-gray-900">
//                                     {parseFloat(contrat.prime_nette).toLocaleString('fr-FR')} FCFA
//                                 </td>
//                                 <td className="px-6 py-4 text-sm font-semibold text-primary-600">
//                                     {parseFloat(contrat.commission).toLocaleString('fr-FR')} FCFA
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatutBadge(contrat.statut)}`}>
//                                         {contrat.statut}
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <div className="flex justify-end gap-2">
//                                         <button
//                                             onClick={() => onOpenPaiements(contrat)}
//                                             className="p-2 text-success-600 hover:bg-success-50 rounded-lg"
//                                             title="Gérer paiements"
//                                         >
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                                             </svg>
//                                         </button>
//                                         <button
//                                             onClick={() => onEdit(contrat)}
//                                             className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
//                                             title="Modifier"
//                                         >
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                             </svg>
//                                         </button>
//                                         {canDelete && (
//                                             <button
//                                                 onClick={() => onDelete(contrat.id)}
//                                                 className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
//                                                 title="Supprimer"
//                                             >
//                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                 </svg>
//                                             </button>
//                                         )}
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };



















// avec ttc
// src/components/contrats/ContratsTable.jsx
// import { getStatutBadge } from '../../utils/contratHelpers';

// export const ContratsTable = ({ contrats, loading, onEdit, onDelete, onOpenPaiements, canDelete }) => {
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//             </div>
//         );
//     }

//     if (contrats.length === 0) {
//         return (
//             <div className="text-center py-12">
//                 <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 <p className="text-gray-500 text-lg font-medium">Aucun contrat trouvé</p>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//             <div className="overflow-x-auto">
//                 <table className="w-full">
//                     <thead className="bg-gray-50 border-b">
//                         <tr>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Compagnie</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Taux</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime TTC</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime Nette</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
//                             <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y">
//                         {contrats.map((contrat) => (
//                             <tr key={contrat.id} className="hover:bg-gray-50">
//                                 <td className="px-6 py-4">
//                                     <p className="font-medium text-gray-900">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                     <span className={`text-xs px-2 py-0.5 rounded-full ${contrat.clients?.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                         {contrat.clients?.type_client === 'particulier' ? 'Particulier' : 'Entreprise'}
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <div className="flex items-center gap-2">
//                                         {contrat.compagnies?.logo_url && (
//                                             <img
//                                                 src={contrat.compagnies.logo_url}
//                                                 alt={contrat.compagnies.nom}
//                                                 className="w-8 h-8 rounded object-cover"
//                                                 onError={(e) => { e.target.style.display = 'none'; }}
//                                             />
//                                         )}
//                                         <div>
//                                             <p className="font-medium text-gray-900">{contrat.compagnies?.nom}</p>
//                                             <p className="text-xs text-gray-500">{contrat.compagnies?.sigle}</p>
//                                         </div>
//                                     </div>
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <p className="text-sm font-medium text-gray-900">{contrat.type_contrat.replace(/_/g, ' ')}</p>
//                                     <p className="text-xs text-gray-500">{new Date(contrat.date_effet).toLocaleDateString('fr-FR')}</p>
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <span className="px-2.5 py-1 bg-accent-100 text-accent-700 rounded-lg text-sm font-semibold">
//                                         {(parseFloat(contrat.taux_commission) * 100).toFixed(2)}%
//                                     </span>
//                                 </td>
//                                 {/* ✅ NOUVELLE COLONNE SÉPARÉE: Prime TTC */}
//                                 <td className="px-6 py-4">
//                                     <p className="text-sm font-semibold text-blue-600">
//                                         {parseFloat(contrat.prime_ttc || 0).toLocaleString('fr-FR')} FCFA
//                                     </p>
//                                 </td>
//                                 {/* ✅ NOUVELLE COLONNE SÉPARÉE: Prime Nette */}
//                                 <td className="px-6 py-4">
//                                     <p className="text-sm font-semibold text-gray-900">
//                                         {parseFloat(contrat.prime_nette).toLocaleString('fr-FR')} FCFA
//                                     </p>
//                                 </td>
//                                 <td className="px-6 py-4 text-sm font-semibold text-primary-600">
//                                     {parseFloat(contrat.commission).toLocaleString('fr-FR')} FCFA
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatutBadge(contrat.statut)}`}>
//                                         {contrat.statut}
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4">
//                                     <div className="flex justify-end gap-2">
//                                         <button
//                                             onClick={() => onOpenPaiements(contrat)}
//                                             className="p-2 text-success-600 hover:bg-success-50 rounded-lg"
//                                             title="Gérer paiements"
//                                         >
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                                             </svg>
//                                         </button>
//                                         <button
//                                             onClick={() => onEdit(contrat)}
//                                             className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
//                                             title="Modifier"
//                                         >
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                             </svg>
//                                         </button>
//                                         {canDelete && (
//                                             <button
//                                                 onClick={() => onDelete(contrat.id)}
//                                                 className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
//                                                 title="Supprimer"
//                                             >
//                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                 </svg>
//                                             </button>
//                                         )}
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };
















// code avec gestion flotte
// import { getStatutBadge } from '../../utils/contratHelpers';

// export const ContratsTable = ({ contrats, loading, onEdit, onDelete, onOpenPaiements, canDelete }) => {
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//             </div>
//         );
//     }

//     if (contrats.length === 0) {
//         return (
//             <div className="text-center py-12">
//                 <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 <p className="text-gray-500 text-lg font-medium">Aucun contrat trouvé</p>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//             <div className="overflow-x-auto">
//                 <table className="w-full">
//                     <thead className="bg-gray-50 border-b">
//                         <tr>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Compagnie</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Véhicules</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Taux</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime TTC</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime Nette</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
//                             <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y">
//                         {contrats.map((contrat) => {
//                             const vehiculesActifs = contrat.vehicules?.filter(v => v.actif !== false) || [];
//                             const nbVehicules = vehiculesActifs.length;

//                             return (
//                                 <tr key={contrat.id} className="hover:bg-gray-50">
//                                     <td className="px-6 py-4">
//                                         <p className="font-medium text-gray-900">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                         <span className={`text-xs px-2 py-0.5 rounded-full ${contrat.clients?.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                             {contrat.clients?.type_client === 'particulier' ? 'Particulier' : 'Entreprise'}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center gap-2">
//                                             {contrat.compagnies?.logo_url && (
//                                                 <img
//                                                     src={contrat.compagnies.logo_url}
//                                                     alt={contrat.compagnies.nom}
//                                                     className="w-8 h-8 rounded object-cover"
//                                                     onError={(e) => { e.target.style.display = 'none'; }}
//                                                 />
//                                             )}
//                                             <div>
//                                                 <p className="font-medium text-gray-900">{contrat.compagnies?.nom}</p>
//                                                 <p className="text-xs text-gray-500">{contrat.compagnies?.sigle}</p>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <p className="text-sm font-medium text-gray-900">{contrat.type_contrat.replace(/_/g, ' ')}</p>
//                                         <p className="text-xs text-gray-500">{new Date(contrat.date_effet).toLocaleDateString('fr-FR')}</p>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         {contrat.is_flotte ? (
//                                             <div className="flex items-center gap-2">
//                                                 <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
//                                                     🚙 FLOTTE
//                                                 </span>
//                                                 <span className="text-sm text-gray-600">
//                                                     {nbVehicules} véh.
//                                                 </span>
//                                             </div>
//                                         ) : (
//                                             <div className="flex items-center gap-1">
//                                                 <span className="text-lg">🚗</span>
//                                                 <span className="text-xs text-gray-500">
//                                                     {contrat.immatriculation || 'N/A'}
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="px-2.5 py-1 bg-accent-100 text-accent-700 rounded-lg text-sm font-semibold">
//                                             {(parseFloat(contrat.taux_commission) * 100).toFixed(2)}%
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <p className="text-sm font-semibold text-blue-600">
//                                             {parseFloat(contrat.prime_ttc || 0).toLocaleString('fr-FR')} FCFA
//                                         </p>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <p className="text-sm font-semibold text-gray-900">
//                                             {parseFloat(contrat.prime_nette).toLocaleString('fr-FR')} FCFA
//                                         </p>
//                                     </td>
//                                     <td className="px-6 py-4 text-sm font-semibold text-primary-600">
//                                         {parseFloat(contrat.commission).toLocaleString('fr-FR')} FCFA
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatutBadge(contrat.statut)}`}>
//                                             {contrat.statut}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex justify-end gap-2">
//                                             <button
//                                                 onClick={() => onOpenPaiements(contrat)}
//                                                 className="p-2 text-success-600 hover:bg-success-50 rounded-lg"
//                                                 title="Gérer paiements"
//                                             >
//                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                                                 </svg>
//                                             </button>
//                                             <button
//                                                 onClick={() => onEdit(contrat)}
//                                                 className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
//                                                 title="Modifier"
//                                             >
//                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                 </svg>
//                                             </button>
//                                             {canDelete && (
//                                                 <button
//                                                     onClick={() => onDelete(contrat.id)}
//                                                     className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
//                                                     title="Supprimer"
//                                                 >
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                     </svg>
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };






// import { peutIncorporer } from '../../utils/incorporationHelpers';
// import { getStatutBadge, isAutoContract } from '../../utils/contratHelpers'; // 👈 AJOUT de isAutoContract

// export const ContratsTable = ({
//     contrats,
//     loading,
//     onEdit,
//     onDelete,
//     onOpenPaiements,
//     onManageFlotte,
//     onIncorporer,
//     canDelete
// }) => {
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//             </div>
//         );
//     }

//     if (contrats.length === 0) {
//         return (
//             <div className="text-center py-12">
//                 <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//                 <p className="text-gray-500 text-lg font-medium">Aucun contrat trouvé</p>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white rounded-xl shadow-soft overflow-hidden">
//             <div className="overflow-x-auto">
//                 <table className="w-full">
//                     <thead className="bg-gray-50 border-b">
//                         <tr>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Compagnie</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Véhicules</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Taux</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime TTC</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Prime Nette</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
//                             <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
//                             <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y">
//                         {contrats.map((contrat) => {
//                             const vehiculesActifs = contrat.vehicules?.filter(v => v.actif !== false) || [];
//                             const nbVehicules = vehiculesActifs.length;

//                             return (
//                                 <tr key={contrat.id} className="hover:bg-gray-50">
//                                     <td className="px-6 py-4">
//                                         <p className="font-medium text-gray-900">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                         <span className={`text-xs px-2 py-0.5 rounded-full ${contrat.clients?.type_client === 'particulier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
//                                             {contrat.clients?.type_client === 'particulier' ? 'Particulier' : 'Entreprise'}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center gap-2">
//                                             {contrat.compagnies?.logo_url && (
//                                                 <img
//                                                     src={contrat.compagnies.logo_url}
//                                                     alt={contrat.compagnies.nom}
//                                                     className="w-8 h-8 rounded object-cover"
//                                                     onError={(e) => { e.target.style.display = 'none'; }}
//                                                 />
//                                             )}
//                                             <div>
//                                                 <p className="font-medium text-gray-900">{contrat.compagnies?.nom}</p>
//                                                 <p className="text-xs text-gray-500">{contrat.compagnies?.sigle}</p>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <p className="text-sm font-medium text-gray-900">{contrat.type_contrat.replace(/_/g, ' ')}</p>
//                                         <p className="text-xs text-gray-500">{new Date(contrat.date_effet).toLocaleDateString('fr-FR')}</p>
//                                     </td>

//                                     {/* 👇 COLONNE VÉHICULES CORRIGÉE */}
//                                     <td className="px-6 py-4">
//                                         {isAutoContract(contrat.type_contrat) ? (
//                                             // Pour les contrats Auto/Moto/Flotte
//                                             contrat.is_flotte ? (
//                                                 <div className="flex items-center gap-2">
//                                                     <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
//                                                         🚙 FLOTTE
//                                                     </span>
//                                                     <span className="text-sm text-gray-600">
//                                                         {nbVehicules} véh.
//                                                     </span>
//                                                 </div>
//                                             ) : (
//                                                 <div className="flex items-center gap-1">
//                                                     <span className="text-lg">🚗</span>
//                                                     <span className="text-xs text-gray-500">
//                                                         {contrat.immatriculation || 'N/A'}
//                                                     </span>
//                                                 </div>
//                                             )
//                                         ) : (
//                                             // Pour les autres contrats (Santé, Vie, Habitation, etc.)
//                                             <span className="text-sm text-gray-400 font-medium">-</span>
//                                         )}
//                                     </td>

//                                     <td className="px-6 py-4">
//                                         <span className="px-2.5 py-1 bg-accent-100 text-accent-700 rounded-lg text-sm font-semibold">
//                                             {(parseFloat(contrat.taux_commission) * 100).toFixed(2)}%
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <p className="text-sm font-semibold text-blue-600">
//                                             {parseFloat(contrat.prime_ttc || 0).toLocaleString('fr-FR')} FCFA
//                                         </p>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <p className="text-sm font-semibold text-gray-900">
//                                             {parseFloat(contrat.prime_nette).toLocaleString('fr-FR')} FCFA
//                                         </p>
//                                     </td>
//                                     <td className="px-6 py-4 text-sm font-semibold text-primary-600">
//                                         {parseFloat(contrat.commission).toLocaleString('fr-FR')} FCFA
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatutBadge(contrat.statut)}`}>
//                                             {contrat.statut}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex justify-end gap-2">
//                                             {/* Bouton Gérer Flotte (visible uniquement pour les flottes) */}
//                                             {contrat.is_flotte && (
//                                                 <button
//                                                     onClick={() => onManageFlotte(contrat)}
//                                                     className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
//                                                     title="Gérer la flotte"
//                                                 >
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
//                                                     </svg>
//                                                 </button>
//                                             )}

//                                             {/* Bouton Gérer paiements */}
//                                             <button
//                                                 onClick={() => onOpenPaiements(contrat)}
//                                                 className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
//                                                 title="Gérer paiements"
//                                             >
//                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                                                 </svg>
//                                             </button>

//                                             {/* Bouton Modifier */}
//                                             <button
//                                                 onClick={() => onEdit(contrat)}
//                                                 className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
//                                                 title="Modifier"
//                                             >
//                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                 </svg>
//                                             </button>

//                                             {/* Bouton Supprimer */}
//                                             {canDelete && (
//                                                 <button
//                                                     onClick={() => onDelete(contrat.id)}
//                                                     className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
//                                                     title="Supprimer"
//                                                 >
//                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                     </svg>
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };










import type { SyntheticEvent } from 'react';
import { 
    FileText, 
    Edit2, 
    Trash2, 
    CreditCard, 
    Car, 
    FolderPlus 
} from 'lucide-react';
import { peutIncorporer } from '../../utils/incorporationHelpers';
import { getStatutBadge, isAutoContract } from '../../utils/contratHelpers';

type VehiculeLike = { actif?: boolean | null; immatriculation?: string | null };
type ClientLike = { nom?: string | null; prenom?: string | null; type_client?: string | null };
type CompagnieLike = { nom?: string | null; sigle?: string | null; logo_url?: string | null };

export type ContratRow = {
    id: string;
    type_contrat: string;
    immatriculation?: string | null;
    date_effet: string;
    date_expiration?: string;
    taux_commission?: number | string | null;
    prime_ttc?: number | string | null;
    prime_nette?: number | string | null;
    commission?: number | string | null;
    statut?: string | null;
    is_flotte?: boolean | null;
    clients?: ClientLike | null;
    compagnies?: CompagnieLike | null;
    vehicules?: VehiculeLike[] | null;
    [key: string]: unknown;
};

type ContratsTableProps = {
    contrats: ContratRow[];
    loading: boolean;
    onEdit: (contrat: ContratRow) => void;
    onDelete: (id: string) => void;
    onOpenPaiements: (contrat: ContratRow) => void;
    onManageFlotte: (contrat: ContratRow) => void;
    onIncorporer: (contrat: ContratRow) => void;
    canDelete: boolean;
};

export const ContratsTable = ({
    contrats,
    loading,
    onEdit,
    onDelete,
    onOpenPaiements,
    onManageFlotte,
    onIncorporer,  // Ajouté
    canDelete
}: ContratsTableProps) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (contrats.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 text-lg font-medium">Aucun contrat trouvé</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Compagnie</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Véhicules</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Taux</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prime TTC</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prime Nette</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Commission</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {contrats.map((contrat) => {
                            const vehiculesActifs = contrat.vehicules?.filter((v) => v.actif !== false) || [];
                            const nbVehicules = vehiculesActifs.length;

                            return (
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
                                                <img
                                                    src={contrat.compagnies.logo_url}
                                                    alt={contrat.compagnies.nom ?? ''}
                                                    className="w-8 h-8 rounded object-cover"
                                                    onError={(e: SyntheticEvent<HTMLImageElement>) => {
                                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
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

                                    {/* 👇 COLONNE VÉHICULES CORRIGÉE */}
                                    <td className="px-6 py-4">
                                        {isAutoContract(contrat.type_contrat) ? (
                                            // Pour les contrats Auto/Moto/Flotte
                                            contrat.is_flotte ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-orange-100/50 text-orange-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-orange-200/50">
                                                        Flotte
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {nbVehicules} véh.
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <Car className="w-4 h-4 text-slate-400" />
                                                    <span className="text-xs font-medium text-slate-600">
                                                        {contrat.immatriculation || 'N/A'}
                                                    </span>
                                                </div>
                                            )
                                        ) : (
                                            // Pour les autres contrats (Santé, Vie, Habitation, etc.)
                                            <span className="text-sm text-gray-400 font-medium">-</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-accent-100 text-accent-700 rounded-lg text-sm font-semibold">
                                            {(parseFloat(String(contrat.taux_commission ?? 0)) * 100).toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-blue-600">
                                            {parseFloat(String(contrat.prime_ttc ?? 0)).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {parseFloat(String(contrat.prime_nette ?? 0)).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                                        {parseFloat(String(contrat.commission ?? 0)).toLocaleString('fr-FR')} FCFA
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatutBadge(contrat.statut)}`}>
                                            {contrat.statut}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {/* 👇 AJOUTER LE BOUTON INCORPORER */}
                                            {peutIncorporer(contrat) && (
                                                <button
                                                    onClick={() => onIncorporer(contrat)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Incorporer"
                                                >
                                                    <FolderPlus className="w-4 h-4" />
                                                </button>
                                            )}


                                            {/* Bouton Gérer Flotte (existant) */}
                                            {contrat.is_flotte && (
                                                <button
                                                    onClick={() => onManageFlotte(contrat)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Gérer la flotte"
                                                >
                                                    <Car className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Bouton Gérer paiements */}
                                            <button
                                                onClick={() => onOpenPaiements(contrat)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="Gérer paiements"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                            </button>

                                            {/* Bouton Modifier */}
                                            <button
                                                onClick={() => onEdit(contrat)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>

                                            {/* Bouton Supprimer */}
                                            {canDelete && (
                                                <button
                                                    onClick={() => onDelete(contrat.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
