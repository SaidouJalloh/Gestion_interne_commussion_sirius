// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useNavigate } from 'react-router-dom';

// export default function Dashboard() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [stats, setStats] = useState({
//         totalClients: 0,
//         contratsActifs: 0,
//         commissionsTotal: 0,
//         primesEncaissees: 0,
//         commissionsEnAttente: 0,
//         contratsExpirants: 0,
//         paiementsRetard: 0
//     });

//     const [activitesRecentes, setActivitesRecentes] = useState({
//         derniers_contrats: [],
//         derniers_paiements: [],
//         contrats_expirants: []
//     });

//     const [repartitionTypes, setRepartitionTypes] = useState([]);
//     const [evolutionCommissions, setEvolutionCommissions] = useState([]);
//     const [performanceCompagnies, setPerformanceCompagnies] = useState([]);

//     useEffect(() => {
//         fetchDashboardData();
//     }, []);

//     const fetchDashboardData = async () => {
//         try {
//             setLoading(true);

//             // Stats principales
//             const [clientsRes, contratsRes, paiementsRes] = await Promise.all([
//                 supabase.from('clients').select('id', { count: 'exact', head: true }),
//                 supabase.from('contrats').select('*').eq('statut', 'actif'),
//                 supabase.from('paiements').select('*')
//             ]);

//             const contratsActifs = contratsRes.data || [];
//             const paiements = paiementsRes.data || [];

//             // Calculs
//             const commissionsTotal = contratsActifs.reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);
//             const primesEncaissees = paiements.filter(p => p.type_paiement === 'client_prime' && p.date_paiement).reduce((sum, p) => sum + parseFloat(p.montant), 0);
//             const commissionsRecues = paiements.filter(p => p.type_paiement === 'commission_compagnie' && p.date_paiement).reduce((sum, p) => sum + parseFloat(p.montant), 0);
//             const commissionsEnAttente = commissionsTotal - commissionsRecues;

//             // Contrats expirants dans 30 jours
//             const dateLimite = new Date();
//             dateLimite.setDate(dateLimite.getDate() + 30);
//             const contratsExpirants = contratsActifs.filter(c => {
//                 const dateExp = new Date(c.date_expiration);
//                 return dateExp <= dateLimite && dateExp >= new Date();
//             }).length;

//             setStats({
//                 totalClients: clientsRes.count || 0,
//                 contratsActifs: contratsActifs.length,
//                 commissionsTotal,
//                 primesEncaissees,
//                 commissionsEnAttente,
//                 contratsExpirants,
//                 paiementsRetard: 0
//             });

//             // Activités récentes
//             const { data: derniersContrats } = await supabase
//                 .from('contrats')
//                 .select('*, clients(nom, prenom), compagnies(nom)')
//                 .order('created_at', { ascending: false })
//                 .limit(5);

//             const { data: derniersPaiements } = await supabase
//                 .from('paiements')
//                 .select('*, contrats(clients(nom, prenom), type_contrat)')
//                 .order('created_at', { ascending: false })
//                 .limit(5);

//             const { data: contratsExpirantsList } = await supabase
//                 .from('contrats')
//                 .select('*, clients(nom, prenom), compagnies(nom)')
//                 .eq('statut', 'actif')
//                 .gte('date_expiration', new Date().toISOString().split('T')[0])
//                 .lte('date_expiration', dateLimite.toISOString().split('T')[0])
//                 .order('date_expiration', { ascending: true })
//                 .limit(5);

//             setActivitesRecentes({
//                 derniers_contrats: derniersContrats || [],
//                 derniers_paiements: derniersPaiements || [],
//                 contrats_expirants: contratsExpirantsList || []
//             });

//             // Répartition par types
//             const typesMap = {};
//             contratsActifs.forEach(c => {
//                 const type = c.type_contrat.replace(/_/g, ' ');
//                 typesMap[type] = (typesMap[type] || 0) + parseFloat(c.commission || 0);
//             });
//             setRepartitionTypes(Object.entries(typesMap).map(([name, value]) => ({ name, value })));

//             // Performance par compagnies
//             const { data: compagnies } = await supabase.from('compagnies').select('id, nom');
//             const compagniesMap = {};
//             contratsActifs.forEach(c => {
//                 const compagnie = compagnies?.find(comp => comp.id === c.compagnie_id);
//                 if (compagnie) {
//                     compagniesMap[compagnie.nom] = (compagniesMap[compagnie.nom] || 0) + parseFloat(c.commission || 0);
//                 }
//             });
//             setPerformanceCompagnies(Object.entries(compagniesMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5));

//         } catch (error) {
//             console.error('Erreur dashboard:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(amount) + ' FCFA';
//     };

//     const kpis = [
//         {
//             titre: 'Clients totaux',
//             valeur: stats.totalClients,
//             icon: '👥',
//             color: 'from-blue-500 to-blue-600',
//             bgLight: 'bg-blue-50',
//             textColor: 'text-blue-600'
//         },
//         {
//             titre: 'Contrats actifs',
//             valeur: stats.contratsActifs,
//             icon: '📋',
//             color: 'from-green-500 to-green-600',
//             bgLight: 'bg-green-50',
//             textColor: 'text-green-600'
//         },
//         {
//             titre: 'Commissions totales',
//             valeur: formatCurrency(stats.commissionsTotal),
//             icon: '💰',
//             color: 'from-purple-500 to-purple-600',
//             bgLight: 'bg-purple-50',
//             textColor: 'text-purple-600',
//             isAmount: true
//         },
//         {
//             titre: 'Primes encaissées',
//             valeur: formatCurrency(stats.primesEncaissees),
//             icon: '💵',
//             color: 'from-orange-500 to-orange-600',
//             bgLight: 'bg-orange-50',
//             textColor: 'text-orange-600',
//             isAmount: true
//         }
//     ];

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-96">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* En-tête */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
//                     <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
//                 </div>
//                 <div className="flex gap-3">
//                     <button onClick={() => navigate('/clients')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
//                         + Nouveau client
//                     </button>
//                     <button onClick={() => navigate('/contrats')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
//                         + Nouveau contrat
//                     </button>
//                 </div>
//             </div>

//             {/* KPIs */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {kpis.map((kpi, index) => (
//                     <div key={index} className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-shadow">
//                         <div className={`h-2 bg-gradient-to-r ${kpi.color}`}></div>
//                         <div className="p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className={`w-12 h-12 rounded-lg ${kpi.bgLight} flex items-center justify-center text-2xl`}>
//                                     {kpi.icon}
//                                 </div>
//                             </div>
//                             <p className="text-sm text-gray-600 mb-1">{kpi.titre}</p>
//                             <p className={`text-2xl font-bold ${kpi.textColor}`}>{kpi.valeur}</p>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Alertes */}
//             {(stats.contratsExpirants > 0 || stats.commissionsEnAttente > 0) && (
//                 <div className="grid md:grid-cols-2 gap-4">
//                     {stats.contratsExpirants > 0 && (
//                         <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
//                             <div className="flex items-start gap-3">
//                                 <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                                     <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                 </div>
//                                 <div className="flex-1">
//                                     <h3 className="font-semibold text-warning-900">Contrats à renouveler</h3>
//                                     <p className="text-sm text-warning-700 mt-1">{stats.contratsExpirants} contrat(s) expire(nt) dans les 30 prochains jours</p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {stats.commissionsEnAttente > 0 && (
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                             <div className="flex items-start gap-3">
//                                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                 </div>
//                                 <div className="flex-1">
//                                     <h3 className="font-semibold text-blue-900">Commissions en attente</h3>
//                                     <p className="text-sm text-blue-700 mt-1">{formatCurrency(stats.commissionsEnAttente)} à recevoir des compagnies</p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Graphiques et stats */}
//             <div className="grid lg:grid-cols-2 gap-6">
//                 {/* Répartition par types */}
//                 <div className="bg-white rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 mb-4">Répartition par type d'assurance</h2>
//                     <div className="space-y-3">
//                         {repartitionTypes.map((type, index) => {
//                             const total = repartitionTypes.reduce((sum, t) => sum + t.value, 0);
//                             const percentage = ((type.value / total) * 100).toFixed(1);
//                             const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
//                             return (
//                                 <div key={index}>
//                                     <div className="flex justify-between text-sm mb-1">
//                                         <span className="font-medium text-gray-700">{type.name}</span>
//                                         <span className="text-gray-600">{percentage}%</span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 rounded-full h-2">
//                                         <div className={`${colors[index % colors.length]} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* Performance compagnies */}
//                 <div className="bg-white rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 mb-4">Top compagnies (Commissions)</h2>
//                     <div className="space-y-4">
//                         {performanceCompagnies.map((comp, index) => (
//                             <div key={index} className="flex items-center gap-4">
//                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
//                                     }`}>
//                                     {index + 1}
//                                 </div>
//                                 <div className="flex-1">
//                                     <p className="font-medium text-gray-900">{comp.name}</p>
//                                     <p className="text-sm text-gray-600">{formatCurrency(comp.value)}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             {/* Activités récentes */}
//             <div className="grid lg:grid-cols-3 gap-6">
//                 {/* Derniers contrats */}
//                 <div className="bg-white rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 mb-4">Derniers contrats</h2>
//                     <div className="space-y-3">
//                         {activitesRecentes.derniers_contrats.map((contrat) => (
//                             <div key={contrat.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/contrats')}>
//                                 <p className="font-medium text-gray-900 text-sm">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                 <p className="text-xs text-gray-600">{contrat.compagnies?.nom}</p>
//                                 <p className="text-xs text-primary-600 font-semibold mt-1">{formatCurrency(contrat.commission)}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Derniers paiements */}
//                 <div className="bg-white rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 mb-4">Derniers paiements</h2>
//                     <div className="space-y-3">
//                         {activitesRecentes.derniers_paiements.map((paiement) => (
//                             <div key={paiement.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/paiements')}>
//                                 <p className="font-medium text-gray-900 text-sm">{paiement.contrats?.clients?.nom} {paiement.contrats?.clients?.prenom}</p>
//                                 <p className="text-xs text-gray-600">{paiement.type_paiement === 'client_prime' ? 'Prime client' : 'Commission'}</p>
//                                 <p className="text-xs text-success-600 font-semibold mt-1">{formatCurrency(paiement.montant)}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Contrats expirants */}
//                 <div className="bg-white rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 mb-4">Contrats à renouveler</h2>
//                     <div className="space-y-3">
//                         {activitesRecentes.contrats_expirants.length > 0 ? (
//                             activitesRecentes.contrats_expirants.map((contrat) => (
//                                 <div key={contrat.id} className="p-3 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors cursor-pointer" onClick={() => navigate('/contrats')}>
//                                     <p className="font-medium text-gray-900 text-sm">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                     <p className="text-xs text-gray-600">{contrat.compagnies?.nom}</p>
//                                     <p className="text-xs text-warning-600 font-semibold mt-1">Expire le {new Date(contrat.date_expiration).toLocaleDateString('fr-FR')}</p>
//                                 </div>
//                             ))
//                         ) : (
//                             <p className="text-sm text-gray-500 text-center py-4">Aucun contrat à renouveler</p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }















// code qui marche bien mais un peu basique

// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useNavigate } from 'react-router-dom';

// export default function Dashboard() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [stats, setStats] = useState({
//         totalClients: 0,
//         clientsParticuliers: 0,
//         clientsEntreprises: 0,
//         contratsActifs: 0,
//         commissionsTotal: 0,
//         commissionsEncaissees: 0,
//         commissionsEnAttente: 0,
//         primesEncaissees: 0,
//         contratsExpirants: 0,
//         tauxConversion: 0
//     });

//     const [graphiques, setGraphiques] = useState({
//         evolutionClients: [],
//         repartitionTypes: [],
//         performanceCompagnies: [],
//         topClientsParticuliers: [],
//         topClientsEntreprises: [],
//         commissionsParType: [],
//         evolutionCommissions: []
//     });

//     const [activitesRecentes, setActivitesRecentes] = useState({
//         derniers_contrats: [],
//         derniers_paiements: [],
//         contrats_expirants: []
//     });

//     useEffect(() => {
//         fetchDashboardData();
//     }, []);

//     const fetchDashboardData = async () => {
//         try {
//             setLoading(true);

//             // 1. Stats principales
//             const [clientsRes, contratsRes, paiementsRes] = await Promise.all([
//                 supabase.from('clients').select('*'),
//                 supabase.from('contrats').select('*').eq('statut', 'actif'),
//                 supabase.from('paiements').select('*')
//             ]);

//             const clients = clientsRes.data || [];
//             const contratsActifs = contratsRes.data || [];
//             const paiements = paiementsRes.data || [];

//             // Calculs des KPIs
//             const clientsParticuliers = clients.filter(c => c.type_client === 'particulier').length;
//             const clientsEntreprises = clients.filter(c => c.type_client === 'entreprise').length;

//             const commissionsTotal = contratsActifs.reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);
//             const commissionsEncaissees = paiements
//                 .filter(p => p.type_paiement === 'commission_compagnie' && p.date_paiement)
//                 .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);
//             const commissionsEnAttente = commissionsTotal - commissionsEncaissees;

//             const primesEncaissees = paiements
//                 .filter(p => p.type_paiement === 'client_prime' && p.date_paiement)
//                 .reduce((sum, p) => sum + parseFloat(p.montant), 0);

//             const dateLimite = new Date();
//             dateLimite.setDate(dateLimite.getDate() + 30);
//             const contratsExpirants = contratsActifs.filter(c => {
//                 const dateExp = new Date(c.date_expiration);
//                 return dateExp <= dateLimite && dateExp >= new Date();
//             }).length;

//             const tauxConversion = clients.length > 0
//                 ? ((contratsActifs.length / clients.length) * 100).toFixed(1)
//                 : 0;

//             setStats({
//                 totalClients: clients.length,
//                 clientsParticuliers,
//                 clientsEntreprises,
//                 contratsActifs: contratsActifs.length,
//                 commissionsTotal,
//                 commissionsEncaissees,
//                 commissionsEnAttente,
//                 primesEncaissees,
//                 contratsExpirants,
//                 tauxConversion
//             });

//             // 2. Évolution des clients par mois (6 derniers mois)
//             const evolutionClients = [];
//             for (let i = 5; i >= 0; i--) {
//                 const date = new Date();
//                 date.setMonth(date.getMonth() - i);
//                 const mois = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

//                 const nbClients = clients.filter(c => {
//                     const clientDate = new Date(c.created_at);
//                     return clientDate.getMonth() === date.getMonth() &&
//                         clientDate.getFullYear() === date.getFullYear();
//                 }).length;

//                 evolutionClients.push({ mois, clients: nbClients });
//             }

//             // 3. Évolution des commissions par mois (6 derniers mois)
//             const evolutionCommissions = [];
//             for (let i = 5; i >= 0; i--) {
//                 const date = new Date();
//                 date.setMonth(date.getMonth() - i);
//                 const mois = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

//                 const commissionsEncaissees = paiements.filter(p => {
//                     const paiementDate = new Date(p.date_paiement);
//                     return p.type_paiement === 'commission_compagnie' &&
//                         paiementDate.getMonth() === date.getMonth() &&
//                         paiementDate.getFullYear() === date.getFullYear();
//                 }).reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);

//                 const commissionsDues = contratsActifs.filter(c => {
//                     const contratDate = new Date(c.created_at);
//                     return contratDate.getMonth() === date.getMonth() &&
//                         contratDate.getFullYear() === date.getFullYear();
//                 }).reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);

//                 evolutionCommissions.push({
//                     mois,
//                     encaissees: commissionsEncaissees,
//                     dues: commissionsDues,
//                     enAttente: commissionsDues - commissionsEncaissees
//                 });
//             }

//             // 4. Répartition par type d'assurance
//             const typesMap = {};
//             contratsActifs.forEach(c => {
//                 const type = c.type_contrat.replace(/_/g, ' ');
//                 if (!typesMap[type]) typesMap[type] = { commission: 0, count: 0 };
//                 typesMap[type].commission += parseFloat(c.commission || 0);
//                 typesMap[type].count += 1;
//             });
//             const repartitionTypes = Object.entries(typesMap)
//                 .map(([name, data]) => ({ name, ...data }))
//                 .sort((a, b) => b.commission - a.commission);

//             // 5. Performance par compagnie
//             const { data: compagnies } = await supabase.from('compagnies').select('id, nom');
//             const compagniesMap = {};
//             contratsActifs.forEach(c => {
//                 const compagnie = compagnies?.find(comp => comp.id === c.compagnie_id);
//                 if (compagnie) {
//                     if (!compagniesMap[compagnie.nom]) {
//                         compagniesMap[compagnie.nom] = {
//                             commission: 0,
//                             count: 0,
//                             encaissee: 0,
//                             enAttente: 0
//                         };
//                     }
//                     const commission = parseFloat(c.commission || 0);
//                     compagniesMap[compagnie.nom].commission += commission;
//                     compagniesMap[compagnie.nom].count += 1;

//                     // Calculer commission encaissée pour ce contrat
//                     const encaissee = paiements
//                         .filter(p => p.contrat_id === c.id && p.type_paiement === 'commission_compagnie')
//                         .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);
//                     compagniesMap[compagnie.nom].encaissee += encaissee;
//                     compagniesMap[compagnie.nom].enAttente += commission - encaissee;
//                 }
//             });
//             const performanceCompagnies = Object.entries(compagniesMap)
//                 .map(([name, data]) => ({ name, ...data }))
//                 .sort((a, b) => b.commission - a.commission)
//                 .slice(0, 5);

//             // 6. Top clients particuliers (par commission générée)
//             const clientsAvecCommissions = clients.map(client => {
//                 const commissionsClient = contratsActifs
//                     .filter(c => c.client_id === client.id)
//                     .reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);
//                 return { ...client, totalCommission: commissionsClient };
//             });

//             const topClientsParticuliers = clientsAvecCommissions
//                 .filter(c => c.type_client === 'particulier')
//                 .sort((a, b) => b.totalCommission - a.totalCommission)
//                 .slice(0, 5);

//             const topClientsEntreprises = clientsAvecCommissions
//                 .filter(c => c.type_client === 'entreprise')
//                 .sort((a, b) => b.totalCommission - a.totalCommission)
//                 .slice(0, 5);

//             // 7. Activités récentes
//             const { data: derniersContrats } = await supabase
//                 .from('contrats')
//                 .select('*, clients(nom, prenom, type_client), compagnies(nom)')
//                 .order('created_at', { ascending: false })
//                 .limit(5);

//             const { data: derniersPaiements } = await supabase
//                 .from('paiements')
//                 .select('*, contrats(clients(nom, prenom), type_contrat)')
//                 .order('created_at', { ascending: false })
//                 .limit(5);

//             const { data: contratsExpirantsList } = await supabase
//                 .from('contrats')
//                 .select('*, clients(nom, prenom), compagnies(nom)')
//                 .eq('statut', 'actif')
//                 .gte('date_expiration', new Date().toISOString().split('T')[0])
//                 .lte('date_expiration', dateLimite.toISOString().split('T')[0])
//                 .order('date_expiration', { ascending: true })
//                 .limit(5);

//             setGraphiques({
//                 evolutionClients,
//                 repartitionTypes,
//                 performanceCompagnies,
//                 topClientsParticuliers,
//                 topClientsEntreprises,
//                 commissionsParType: repartitionTypes,
//                 evolutionCommissions
//             });

//             setActivitesRecentes({
//                 derniers_contrats: derniersContrats || [],
//                 derniers_paiements: derniersPaiements || [],
//                 contrats_expirants: contratsExpirantsList || []
//             });

//         } catch (error) {
//             console.error('Erreur dashboard:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(amount) + ' FCFA';
//     };

//     const kpis = [
//         {
//             titre: 'Clients totaux',
//             valeur: stats.totalClients,
//             subtext: `${stats.clientsParticuliers} particuliers • ${stats.clientsEntreprises} entreprises`,
//             icon: '👥',
//             color: 'from-blue-500 to-blue-600',
//             bgLight: 'bg-blue-50 dark:bg-blue-900',
//             textColor: 'text-blue-600 dark:text-blue-400'
//         },
//         {
//             titre: 'Taux de conversion',
//             valeur: `${stats.tauxConversion}%`,
//             subtext: `${stats.contratsActifs} contrats actifs`,
//             icon: '📊',
//             color: 'from-green-500 to-green-600',
//             bgLight: 'bg-green-50 dark:bg-green-900',
//             textColor: 'text-green-600 dark:text-green-400'
//         },
//         {
//             titre: 'Commissions encaissées',
//             valeur: formatCurrency(stats.commissionsEncaissees),
//             subtext: `Sur ${formatCurrency(stats.commissionsTotal)} total`,
//             icon: '✅',
//             color: 'from-purple-500 to-purple-600',
//             bgLight: 'bg-purple-50 dark:bg-purple-900',
//             textColor: 'text-purple-600 dark:text-purple-400'
//         },
//         {
//             titre: 'Commissions en attente',
//             valeur: formatCurrency(stats.commissionsEnAttente),
//             subtext: `${stats.contratsExpirants} contrats à renouveler`,
//             icon: '⏳',
//             color: 'from-orange-500 to-orange-600',
//             bgLight: 'bg-orange-50 dark:bg-orange-900',
//             textColor: 'text-orange-600 dark:text-orange-400'
//         }
//     ];

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-96">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* En-tête */}
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
//                     <p className="text-gray-600 dark:text-gray-400 mt-1">Vue d'ensemble de votre activité</p>
//                 </div>
//                 <div className="flex gap-3">
//                     <button onClick={() => navigate('/clients')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
//                         + Nouveau client
//                     </button>
//                     <button onClick={() => navigate('/contrats')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
//                         + Nouveau contrat
//                     </button>
//                 </div>
//             </div>

//             {/* KPIs principaux */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {kpis.map((kpi, index) => (
//                     <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-shadow">
//                         <div className={`h-2 bg-gradient-to-r ${kpi.color}`}></div>
//                         <div className="p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className={`w-12 h-12 rounded-lg ${kpi.bgLight} flex items-center justify-center text-2xl`}>
//                                     {kpi.icon}
//                                 </div>
//                             </div>
//                             <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{kpi.titre}</p>
//                             <p className={`text-2xl font-bold ${kpi.textColor} mb-1`}>{kpi.valeur}</p>
//                             <p className="text-xs text-gray-500 dark:text-gray-500">{kpi.subtext}</p>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Évolutions temporelles */}
//             <div className="grid lg:grid-cols-2 gap-6">
//                 {/* Évolution clients */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Évolution des clients (6 mois)</h2>
//                     <div className="space-y-3">
//                         {graphiques.evolutionClients.map((item, index) => (
//                             <div key={index}>
//                                 <div className="flex justify-between text-sm mb-1">
//                                     <span className="font-medium text-gray-700 dark:text-gray-300">{item.mois}</span>
//                                     <span className="text-gray-600 dark:text-gray-400">{item.clients} nouveaux clients</span>
//                                 </div>
//                                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                                     <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(item.clients / Math.max(...graphiques.evolutionClients.map(e => e.clients))) * 100}%` }}></div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Évolution commissions */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Évolution commissions (6 mois)</h2>
//                     <div className="space-y-3">
//                         {graphiques.evolutionCommissions.map((item, index) => (
//                             <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
//                                 <div className="flex justify-between text-sm mb-2">
//                                     <span className="font-medium text-gray-700 dark:text-gray-300">{item.mois}</span>
//                                 </div>
//                                 <div className="grid grid-cols-3 gap-2 text-xs">
//                                     <div className="bg-green-50 dark:bg-green-900 p-2 rounded">
//                                         <p className="text-gray-600 dark:text-gray-400">Encaissées</p>
//                                         <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(item.encaissees)}</p>
//                                     </div>
//                                     <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded">
//                                         <p className="text-gray-600 dark:text-gray-400">Dues</p>
//                                         <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(item.dues)}</p>
//                                     </div>
//                                     <div className="bg-orange-50 dark:bg-orange-900 p-2 rounded">
//                                         <p className="text-gray-600 dark:text-gray-400">En attente</p>
//                                         <p className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(item.enAttente)}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             {/* Types d'assurance les plus rentables */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Types d'assurance les plus rentables</h2>
//                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {graphiques.commissionsParType.slice(0, 6).map((type, index) => (
//                         <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
//                             <div className="flex items-start justify-between mb-2">
//                                 <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{type.name}</h3>
//                                 <span className={`px-2 py-1 rounded text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
//                                     index === 1 ? 'bg-gray-400 text-white' :
//                                         index === 2 ? 'bg-orange-600 text-white' :
//                                             'bg-gray-300 text-gray-700'
//                                     }`}>
//                                     #{index + 1}
//                                 </span>
//                             </div>
//                             <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
//                                 {formatCurrency(type.commission)}
//                             </p>
//                             <p className="text-sm text-gray-600 dark:text-gray-400">{type.count} contrats</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Performance par compagnie */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance par compagnie</h2>
//                 <div className="space-y-4">
//                     {graphiques.performanceCompagnies.map((comp, index) => (
//                         <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${index === 0 ? 'bg-yellow-500' :
//                                 index === 1 ? 'bg-gray-400' :
//                                     index === 2 ? 'bg-orange-600' :
//                                         'bg-gray-300'
//                                 }`}>
//                                 {index + 1}
//                             </div>
//                             <div className="flex-1">
//                                 <p className="font-semibold text-gray-900 dark:text-white">{comp.name}</p>
//                                 <p className="text-sm text-gray-600 dark:text-gray-400">{comp.count} contrats</p>
//                             </div>
//                             <div className="text-right">
//                                 <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatCurrency(comp.commission)}</p>
//                                 <div className="flex gap-2 text-xs mt-1">
//                                     <span className="text-green-600 dark:text-green-400">✓ {formatCurrency(comp.encaissee)}</span>
//                                     <span className="text-orange-600 dark:text-orange-400">⏳ {formatCurrency(comp.enAttente)}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Top clients */}
//             <div className="grid lg:grid-cols-2 gap-6">
//                 {/* Top particuliers */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top clients particuliers</h2>
//                     <div className="space-y-3">
//                         {graphiques.topClientsParticuliers.map((client, index) => (
//                             <div key={client.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                                 <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
//                                     {index + 1}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                     <p className="font-semibold text-gray-900 dark:text-white truncate">{client.nom} {client.prenom}</p>
//                                     <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{client.email || client.telephone}</p>
//                                 </div>
//                                 <div className="text-right flex-shrink-0">
//                                     <p className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(client.totalCommission)}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Top entreprises */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top clients entreprises</h2>
//                     <div className="space-y-3">
//                         {graphiques.topClientsEntreprises.map((client, index) => (
//                             <div key={client.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                                 <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
//                                     {index + 1}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                     <p className="font-semibold text-gray-900 dark:text-white truncate">{client.nom}</p>
//                                     <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{client.email || client.telephone}</p>
//                                 </div>
//                                 <div className="text-right flex-shrink-0">
//                                     <p className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(client.totalCommission)}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             {/* Activités récentes */}
//             <div className="grid lg:grid-cols-3 gap-6">
//                 {/* Derniers contrats */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Derniers contrats</h2>
//                     <div className="space-y-3">
//                         {activitesRecentes.derniers_contrats.map((contrat) => (
//                             <div key={contrat.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer" onClick={() => navigate('/contrats')}>
//                                 <div className="flex items-center gap-2 mb-1">
//                                     <p className="font-medium text-gray-900 dark:text-white text-sm">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                     <span className={`px-2 py-0.5 rounded text-xs ${contrat.clients?.type_client === 'entreprise'
//                                         ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
//                                         : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
//                                         }`}>
//                                         {contrat.clients?.type_client}
//                                     </span>
//                                 </div>
//                                 <p className="text-xs text-gray-600 dark:text-gray-400">{contrat.compagnies?.nom}</p>
//                                 <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-1">{formatCurrency(contrat.commission)}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Derniers paiements */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Derniers paiements</h2>
//                     <div className="space-y-3">
//                         {activitesRecentes.derniers_paiements.map((paiement) => (
//                             <div key={paiement.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer" onClick={() => navigate('/paiements')}>
//                                 <p className="font-medium text-gray-900 dark:text-white text-sm">{paiement.contrats?.clients?.nom} {paiement.contrats?.clients?.prenom}</p>
//                                 <p className="text-xs text-gray-600 dark:text-gray-400">{paiement.type_paiement === 'client_prime' ? 'Prime client' : 'Commission'}</p>
//                                 <p className="text-xs text-success-600 dark:text-success-400 font-semibold mt-1">{formatCurrency(paiement.montant)}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Contrats expirants */}
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contrats à renouveler</h2>
//                     <div className="space-y-3">
//                         {activitesRecentes.contrats_expirants.length > 0 ? (
//                             activitesRecentes.contrats_expirants.map((contrat) => (
//                                 <div key={contrat.id} className="p-3 bg-warning-50 dark:bg-warning-900 rounded-lg hover:bg-warning-100 dark:hover:bg-warning-800 transition-colors cursor-pointer" onClick={() => navigate('/contrats')}>
//                                     <p className="font-medium text-gray-900 dark:text-white text-sm">{contrat.clients?.nom} {contrat.clients?.prenom}</p>
//                                     <p className="text-xs text-gray-600 dark:text-gray-400">{contrat.compagnies?.nom}</p>
//                                     <p className="text-xs text-warning-600 dark:text-warning-300 font-semibold mt-1">Expire le {new Date(contrat.date_expiration).toLocaleDateString('fr-FR')}</p>
//                                 </div>
//                             ))
//                         ) : (
//                             <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aucun contrat à renouveler</p>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Statistiques supplémentaires */}
//             <div className="grid md:grid-cols-3 gap-6">
//                 <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-soft p-6 text-white">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-semibold">Clients Particuliers</h3>
//                         <span className="text-3xl">👤</span>
//                     </div>
//                     <p className="text-4xl font-bold mb-2">{stats.clientsParticuliers}</p>
//                     <p className="text-blue-100 text-sm">
//                         {stats.totalClients > 0 ? ((stats.clientsParticuliers / stats.totalClients) * 100).toFixed(1) : 0}% du total
//                     </p>
//                 </div>

//                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-soft p-6 text-white">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-semibold">Clients Entreprises</h3>
//                         <span className="text-3xl">🏢</span>
//                     </div>
//                     <p className="text-4xl font-bold mb-2">{stats.clientsEntreprises}</p>
//                     <p className="text-purple-100 text-sm">
//                         {stats.totalClients > 0 ? ((stats.clientsEntreprises / stats.totalClients) * 100).toFixed(1) : 0}% du total
//                     </p>
//                 </div>

//                 <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-soft p-6 text-white">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-semibold">Primes Encaissées</h3>
//                         <span className="text-3xl">💵</span>
//                     </div>
//                     <p className="text-2xl font-bold mb-2">{formatCurrency(stats.primesEncaissees)}</p>
//                     <p className="text-green-100 text-sm">Paiements clients reçus</p>
//                 </div>
//             </div>
//         </div>
//     );
// }























// Dashboard avec modulaire
// src/pages/Dashboard.jsx
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KPICards } from '../components/dashboard/KPICards';
import { EvolutionCharts } from '../components/dashboard/EvolutionCharts';
import { TopTypesAssurance } from '../components/dashboard/TopTypesAssurance';
import { PerformanceCompagnies } from '../components/dashboard/PerformanceCompagnies';
import { TopClients } from '../components/dashboard/TopClients';
import { ActivitesRecentes } from '../components/dashboard/ActivitesRecentes';
import { StatsSupplementaires } from '../components/dashboard/StatsSupplementaires';

export default function Dashboard() {
    const { loading, stats, graphiques, activitesRecentes } = useDashboardData();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardHeader />

            <KPICards stats={stats} />

            <EvolutionCharts graphiques={graphiques} />

            <TopTypesAssurance types={graphiques.commissionsParType} />

            <PerformanceCompagnies compagnies={graphiques.performanceCompagnies} />

            <TopClients
                particuliers={graphiques.topClientsParticuliers}
                entreprises={graphiques.topClientsEntreprises}
            />

            <ActivitesRecentes activites={activitesRecentes} />

            <StatsSupplementaires stats={stats} />
        </div>
    );
}