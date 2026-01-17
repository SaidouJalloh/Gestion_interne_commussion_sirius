// code qui marche mais sans l'historique des incorporation

// import { useVehicules } from '../../hooks/useVehicules';
// import { VehiculesManager } from './VehiculesManager';

// export const FlotteModal = ({ contrat, onClose }) => {
//     const { vehicules, loading, addVehicule, updateVehicule, deleteVehicule } = useVehicules(contrat?.id);

//     if (!contrat) return null;

//     const handleAdd = async (vehiculeData) => {
//         await addVehicule(vehiculeData);
//     };

//     const handleUpdate = async (id, vehiculeData) => {
//         await updateVehicule(id, vehiculeData);
//     };

//     const handleDelete = async (id) => {
//         await deleteVehicule(id);
//     };

//     return (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
//                 {/* Header */}
//                 <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
//                             🚙
//                         </div>
//                         <div>
//                             <h2 className="text-xl font-bold">Gestion de Flotte</h2>
//                             <p className="text-sm text-orange-100">
//                                 {contrat.clients?.nom} {contrat.clients?.prenom} - {contrat.type_contrat}
//                             </p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
//                     >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                     </button>
//                 </div>

//                 {/* Body */}
//                 <div className="p-6">
//                     {/* Infos contrat */}
//                     <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 mb-6">
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                             <div>
//                                 <p className="text-blue-600 font-medium mb-1">Compagnie</p>
//                                 <p className="font-semibold text-blue-900">{contrat.compagnies?.nom}</p>
//                             </div>
//                             <div>
//                                 <p className="text-blue-600 font-medium mb-1">Date effet</p>
//                                 <p className="font-semibold text-blue-900">
//                                     {new Date(contrat.date_effet).toLocaleDateString('fr-FR')}
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className="text-blue-600 font-medium mb-1">Date expiration</p>
//                                 <p className="font-semibold text-blue-900">
//                                     {new Date(contrat.date_expiration).toLocaleDateString('fr-FR')}
//                                 </p>
//                             </div>
//                             <div>
//                                 <p className="text-blue-600 font-medium mb-1">Statut</p>
//                                 <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${contrat.statut === 'actif'
//                                         ? 'bg-green-100 text-green-700'
//                                         : contrat.statut === 'expiré'
//                                             ? 'bg-orange-100 text-orange-700'
//                                             : 'bg-gray-100 text-gray-700'
//                                     }`}>
//                                     {contrat.statut}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Statistiques rapides */}
//                     <div className="grid grid-cols-2 gap-4 mb-6">
//                         <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs text-purple-600 font-medium mb-1">Prime TTC</p>
//                                     <p className="text-lg font-bold text-purple-900">
//                                         {parseFloat(contrat.prime_ttc || 0).toLocaleString('fr-FR')} FCFA
//                                     </p>
//                                 </div>
//                                 <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
//                                     💰
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs text-green-600 font-medium mb-1">Commission</p>
//                                     <p className="text-lg font-bold text-green-900">
//                                         {parseFloat(contrat.commission || 0).toLocaleString('fr-FR')} FCFA
//                                     </p>
//                                 </div>
//                                 <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
//                                     💵
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Divider */}
//                     <div className="border-t border-gray-200 my-6"></div>

//                     {/* Gestion véhicules */}
//                     {loading ? (
//                         <div className="flex flex-col items-center justify-center py-12">
//                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
//                             <p className="text-gray-600 text-sm">Chargement des véhicules...</p>
//                         </div>
//                     ) : (
//                         <VehiculesManager
//                             vehicules={vehicules}
//                             onAdd={handleAdd}
//                             onUpdate={handleUpdate}
//                             onDelete={handleDelete}
//                             disabled={loading}
//                         />
//                     )}
//                 </div>

//                 {/* Footer */}
//                 <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 rounded-b-2xl flex items-center justify-between">
//                     <p className="text-sm text-gray-600">
//                         💡 <span className="font-medium">Astuce :</span> Les véhicules supprimés sont désactivés, pas effacés définitivement
//                     </p>
//                     <button
//                         onClick={onClose}
//                         className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center gap-2"
//                     >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                         Fermer
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };
















// code avec incorporation
import { useState } from 'react';
import { useVehicules } from '../../hooks/useVehicules';
import { VehiculesManager } from './VehiculesManager';
import { IncorporationsList } from './IncorporationsList';

type FlotteContrat = {
    id: string;
    type_contrat?: string | null;
    nombre_incorporations?: number | null;
    compagnies?: { nom?: string | null } | null;
    clients?: { nom?: string | null; prenom?: string | null } | null;
    date_effet?: string | null;
    date_expiration?: string | null;
    statut?: string | null;
    prime_ttc?: number | string | null;
    prime_ttc_initial?: number | string | null;
    commission?: number | string | null;
    montant_incorporations?: number | string | null;
    [key: string]: unknown;
};

type FlotteModalProps = {
    contrat?: FlotteContrat | null;
    onClose: () => void;
};

export const FlotteModal = ({ contrat, onClose }: FlotteModalProps) => {
    const { vehicules, loading, addVehicule, updateVehicule, deleteVehicule } = useVehicules(contrat?.id);
    const [activeTab, setActiveTab] = useState<'vehicules' | 'incorporations'>('vehicules'); // 👈 NOUVEAU STATE

    if (!contrat) return null;

    const handleAdd = async (vehiculeData: Record<string, unknown>) => {
        await addVehicule(vehiculeData);
    };

    const handleUpdate = async (id: string, vehiculeData: Record<string, unknown>) => {
        await updateVehicule(id, vehiculeData);
    };

    const handleDelete = async (id: string) => {
        await deleteVehicule(id);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                            🚙
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Gestion de Flotte</h2>
                            <p className="text-sm text-orange-100">
                                {contrat.clients?.nom} {contrat.clients?.prenom} - {contrat.type_contrat}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 👇 NOUVEAU : Onglets */}
                <div className="bg-white border-b flex">
                    <button
                        onClick={() => setActiveTab('vehicules')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'vehicules'
                            ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Véhicules
                        <span className="ml-1 px-2 py-0.5 bg-orange-200 text-orange-700 rounded-full text-xs font-bold">
                            {vehicules?.filter(v => v.actif !== false).length || 0}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('incorporations')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'incorporations'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Incorporations
                        {(contrat.nombre_incorporations ?? 0) > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-blue-200 text-blue-700 rounded-full text-xs font-bold">
                                {contrat.nombre_incorporations}
                            </span>
                        )}
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* 👇 CONTENU SELON L'ONGLET ACTIF */}
                    {activeTab === 'vehicules' ? (
                        <>
                            {/* Infos contrat */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 mb-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-blue-600 font-medium mb-1">Compagnie</p>
                                        <p className="font-semibold text-blue-900">{contrat.compagnies?.nom}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600 font-medium mb-1">Date effet</p>
                                        <p className="font-semibold text-blue-900">
                                            {new Date(contrat.date_effet ?? '').toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600 font-medium mb-1">Date expiration</p>
                                        <p className="font-semibold text-blue-900">
                                            {new Date(contrat.date_expiration ?? '').toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600 font-medium mb-1">Statut</p>
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${contrat.statut === 'actif'
                                            ? 'bg-green-100 text-green-700'
                                            : contrat.statut === 'expiré'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {contrat.statut}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Statistiques rapides */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-purple-600 font-medium mb-1">Prime TTC</p>
                                            <p className="text-lg font-bold text-purple-900">
                                                {parseFloat(String(contrat.prime_ttc ?? 0)).toLocaleString('fr-FR')} FCFA
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                                            💰
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-green-600 font-medium mb-1">Commission</p>
                                            <p className="text-lg font-bold text-green-900">
                                                {parseFloat(String(contrat.commission ?? 0)).toLocaleString('fr-FR')} FCFA
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                                            💵
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-6"></div>

                            {/* Gestion véhicules */}
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                                    <p className="text-gray-600 text-sm">Chargement des véhicules...</p>
                                </div>
                            ) : (
                                <VehiculesManager
                                    vehicules={vehicules}
                                    onAdd={handleAdd}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    disabled={loading}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {/* 👇 ONGLET INCORPORATIONS */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Résumé financier
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                                        <p className="text-xs text-gray-600 mb-1">Contrat initial</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {parseFloat(String(contrat.prime_ttc_initial ?? contrat.prime_ttc ?? 0)).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-green-200">
                                        <p className="text-xs text-gray-600 mb-1">Incorporations</p>
                                        <p className="text-lg font-bold text-green-600">
                                            +{parseFloat(String(contrat.montant_incorporations ?? 0)).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3">
                                        <p className="text-xs text-blue-100 mb-1">Total actuel</p>
                                        <p className="text-lg font-bold text-white">
                                            {parseFloat(String(contrat.prime_ttc ?? 0)).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    📋 Historique des incorporations
                                </h3>
                                <span className="text-sm text-gray-600">
                                    {contrat.nombre_incorporations || 0} incorporation{(contrat.nombre_incorporations ?? 0) > 1 ? 's' : ''}
                                </span>
                            </div>

                            <IncorporationsList contratId={contrat.id} />
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        💡 <span className="font-medium">Astuce :</span> {
                            activeTab === 'vehicules'
                                ? 'Les véhicules supprimés sont désactivés, pas effacés définitivement'
                                : 'L\'historique garde toutes les incorporations effectuées'
                        }
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};