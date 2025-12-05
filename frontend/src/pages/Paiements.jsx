// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';

// export default function Rapports() {
//     const [loading, setLoading] = useState(true);
//     const [periode, setPeriode] = useState('mois');
//     const [dateDebut, setDateDebut] = useState('');
//     const [dateFin, setDateFin] = useState('');

//     const [stats, setStats] = useState({
//         commissionsTotal: 0,
//         commissionsRecues: 0,
//         commissionsEnAttente: 0,
//         primesEncaissees: 0,
//         nbContratsActifs: 0,
//         nbContratsExpirants: 0,
//         tauxRenouvellement: 0,
//         evolutionMensuelle: []
//     });

//     const [repartition, setRepartition] = useState({
//         parType: [],
//         parCompagnie: [],
//         parStatut: []
//     });

//     useEffect(() => {
//         fetchRapports();
//     }, [periode, dateDebut, dateFin]);

//     const fetchRapports = async () => {
//         try {
//             setLoading(true);

//             let debut, fin;
//             const maintenant = new Date();

//             if (periode === 'mois') {
//                 debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
//                 fin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);
//             } else if (periode === 'trimestre') {
//                 const trimestre = Math.floor(maintenant.getMonth() / 3);
//                 debut = new Date(maintenant.getFullYear(), trimestre * 3, 1);
//                 fin = new Date(maintenant.getFullYear(), trimestre * 3 + 3, 0);
//             } else if (periode === 'annee') {
//                 debut = new Date(maintenant.getFullYear(), 0, 1);
//                 fin = new Date(maintenant.getFullYear(), 11, 31);
//             } else if (dateDebut && dateFin) {
//                 debut = new Date(dateDebut);
//                 fin = new Date(dateFin);
//             }

//             const { data: contrats } = await supabase
//                 .from('contrats')
//                 .select('*, clients(nom, prenom), compagnies(nom)')
//                 .gte('date_effet', debut.toISOString())
//                 .lte('date_effet', fin.toISOString());

//             const { data: paiements } = await supabase
//                 .from('paiements')
//                 .select('*')
//                 .gte('date_paiement', debut.toISOString())
//                 .lte('date_paiement', fin.toISOString());

//             const contratsActifs = contrats?.filter(c => c.statut === 'actif') || [];
//             const commissionsTotal = contratsActifs.reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);

//             const commissionsRecues = paiements
//                 ?.filter(p => p.type_paiement === 'commission_compagnie')
//                 .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0) || 0;

//             const primesEncaissees = paiements
//                 ?.filter(p => p.type_paiement === 'client_prime')
//                 .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0) || 0;

//             const dateLimite = new Date();
//             dateLimite.setDate(dateLimite.getDate() + 30);
//             const contratsExpirants = contratsActifs.filter(c => {
//                 const dateExp = new Date(c.date_expiration);
//                 return dateExp <= dateLimite && dateExp >= new Date();
//             });

//             const parType = {};
//             contratsActifs.forEach(c => {
//                 const type = c.type_contrat;
//                 if (!parType[type]) parType[type] = 0;
//                 parType[type] += parseFloat(c.commission || 0);
//             });

//             const parCompagnie = {};
//             contratsActifs.forEach(c => {
//                 const compagnie = c.compagnies?.nom || 'Non défini';
//                 if (!parCompagnie[compagnie]) parCompagnie[compagnie] = 0;
//                 parCompagnie[compagnie] += parseFloat(c.commission || 0);
//             });

//             const parStatut = {};
//             contrats?.forEach(c => {
//                 const statut = c.statut;
//                 if (!parStatut[statut]) parStatut[statut] = 0;
//                 parStatut[statut] += 1;
//             });

//             setStats({
//                 commissionsTotal,
//                 commissionsRecues,
//                 commissionsEnAttente: commissionsTotal - commissionsRecues,
//                 primesEncaissees,
//                 nbContratsActifs: contratsActifs.length,
//                 nbContratsExpirants: contratsExpirants.length,
//                 tauxRenouvellement: contratsActifs.length > 0
//                     ? ((contratsActifs.length - contratsExpirants.length) / contratsActifs.length * 100).toFixed(1)
//                     : 0
//             });

//             setRepartition({
//                 parType: Object.entries(parType).map(([name, value]) => ({ name, value })),
//                 parCompagnie: Object.entries(parCompagnie).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
//                 parStatut: Object.entries(parStatut).map(([name, value]) => ({ name, count: value }))
//             });

//         } catch (error) {
//             console.error('Erreur lors du chargement des rapports:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(amount) + ' FCFA';
//     };

//     const exportPDF = () => {
//         alert('Fonction export PDF à venir');
//     };

//     const exportExcel = () => {
//         alert('Fonction export Excel à venir');
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-96">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rapports & Statistiques</h1>
//                     <p className="text-gray-600 dark:text-gray-400 mt-1">Analyse détaillée de votre activité</p>
//                 </div>
//                 <div className="flex gap-3">
//                     <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
//                         📄 Export PDF
//                     </button>
//                     <button onClick={exportExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
//                         📊 Export Excel
//                     </button>
//                 </div>
//             </div>

//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Période d'analyse</h2>
//                 <div className="flex gap-4 flex-wrap">
//                     <button
//                         onClick={() => setPeriode('mois')}
//                         className={`px-4 py-2 rounded-lg transition-colors ${periode === 'mois'
//                             ? 'bg-primary-600 text-white'
//                             : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                             }`}
//                     >
//                         Ce mois
//                     </button>
//                     <button
//                         onClick={() => setPeriode('trimestre')}
//                         className={`px-4 py-2 rounded-lg transition-colors ${periode === 'trimestre'
//                             ? 'bg-primary-600 text-white'
//                             : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                             }`}
//                     >
//                         Ce trimestre
//                     </button>
//                     <button
//                         onClick={() => setPeriode('annee')}
//                         className={`px-4 py-2 rounded-lg transition-colors ${periode === 'annee'
//                             ? 'bg-primary-600 text-white'
//                             : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                             }`}
//                     >
//                         Cette année
//                     </button>
//                     <button
//                         onClick={() => setPeriode('personnalise')}
//                         className={`px-4 py-2 rounded-lg transition-colors ${periode === 'personnalise'
//                             ? 'bg-primary-600 text-white'
//                             : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                             }`}
//                     >
//                         Personnalisé
//                     </button>
//                 </div>

//                 {periode === 'personnalise' && (
//                     <div className="flex gap-4 mt-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date début</label>
//                             <input
//                                 type="date"
//                                 value={dateDebut}
//                                 onChange={(e) => setDateDebut(e.target.value)}
//                                 className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date fin</label>
//                             <input
//                                 type="date"
//                                 value={dateFin}
//                                 onChange={(e) => setDateFin(e.target.value)}
//                                 className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <div className="flex items-center justify-between mb-4">
//                         <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
//                             💰
//                         </div>
//                     </div>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Commissions totales</p>
//                     <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(stats.commissionsTotal)}</p>
//                 </div>

//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <div className="flex items-center justify-between mb-4">
//                         <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center text-2xl">
//                             ✅
//                         </div>
//                     </div>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Commissions reçues</p>
//                     <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.commissionsRecues)}</p>
//                 </div>

//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <div className="flex items-center justify-between mb-4">
//                         <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-2xl">
//                             ⏳
//                         </div>
//                     </div>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En attente</p>
//                     <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(stats.commissionsEnAttente)}</p>
//                 </div>

//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <div className="flex items-center justify-between mb-4">
//                         <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl">
//                             💵
//                         </div>
//                     </div>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Primes encaissées</p>
//                     <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(stats.primesEncaissees)}</p>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contrats actifs</h3>
//                     <p className="text-3xl font-bold text-primary-600">{stats.nbContratsActifs}</p>
//                 </div>

//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">À renouveler (30j)</h3>
//                     <p className="text-3xl font-bold text-warning-600">{stats.nbContratsExpirants}</p>
//                 </div>

//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Taux de rétention</h3>
//                     <p className="text-3xl font-bold text-success-600">{stats.tauxRenouvellement}%</p>
//                 </div>
//             </div>

//             <div className="grid lg:grid-cols-2 gap-6">
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Répartition par type d'assurance</h2>
//                     <div className="space-y-3">
//                         {repartition.parType.map((type, index) => {
//                             const total = repartition.parType.reduce((sum, t) => sum + t.value, 0);
//                             const percentage = total > 0 ? ((type.value / total) * 100).toFixed(1) : 0;
//                             const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
//                             return (
//                                 <div key={index}>
//                                     <div className="flex justify-between text-sm mb-1">
//                                         <span className="font-medium text-gray-700 dark:text-gray-300">{type.name}</span>
//                                         <span className="text-gray-600 dark:text-gray-400">{formatCurrency(type.value)} ({percentage}%)</span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                                         <div className={`${colors[index % colors.length]} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top compagnies (Commissions)</h2>
//                     <div className="space-y-4">
//                         {repartition.parCompagnie.slice(0, 5).map((comp, index) => (
//                             <div key={index} className="flex items-center gap-4">
//                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
//                                     }`}>
//                                     {index + 1}
//                                 </div>
//                                 <div className="flex-1">
//                                     <p className="font-medium text-gray-900 dark:text-white">{comp.name}</p>
//                                     <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(comp.value)}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Répartition par statut</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     {repartition.parStatut.map((item, index) => (
//                         <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
//                             <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">{item.name}</p>
//                             <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.count}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// }