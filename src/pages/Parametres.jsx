// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useAuth } from '../context/AuthContext';

// export default function Parametres() {
//     const { profile } = useAuth();
//     const [activeTab, setActiveTab] = useState('profil');
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState({ type: '', text: '' });

//     // Données du profil
//     const [profilData, setProfilData] = useState({
//         full_name: '',
//         email: '',
//         telephone: '',
//     });

//     // Données du mot de passe
//     const [passwordData, setPasswordData] = useState({
//         current: '',
//         new: '',
//         confirm: '',
//     });

//     // Statistiques de l'application
//     const [stats, setStats] = useState({
//         clients: 0,
//         compagnies: 0,
//         contrats: 0,
//         paiements: 0,
//         medias: 0,
//     });

//     useEffect(() => {
//         if (profile) {
//             setProfilData({
//                 full_name: profile.full_name || '',
//                 email: profile.email || '',
//                 telephone: profile.telephone || '',
//             });
//         }
//         fetchStats();
//     }, [profile]);

//     const fetchStats = async () => {
//         try {
//             const [clientsRes, compagniesRes, contratsRes, paiementsRes, mediasRes] = await Promise.all([
//                 supabase.from('clients').select('id', { count: 'exact', head: true }),
//                 supabase.from('compagnies').select('id', { count: 'exact', head: true }),
//                 supabase.from('contrats').select('id', { count: 'exact', head: true }),
//                 supabase.from('paiements').select('id', { count: 'exact', head: true }),
//                 supabase.from('medias').select('id', { count: 'exact', head: true }),
//             ]);

//             setStats({
//                 clients: clientsRes.count || 0,
//                 compagnies: compagniesRes.count || 0,
//                 contrats: contratsRes.count || 0,
//                 paiements: paiementsRes.count || 0,
//                 medias: mediasRes.count || 0,
//             });
//         } catch (error) {
//             console.error('Erreur stats:', error);
//         }
//     };

//     const handleProfilChange = (e) => {
//         setProfilData({ ...profilData, [e.target.name]: e.target.value });
//     };

//     const handlePasswordChange = (e) => {
//         setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
//     };

//     const handleUpdateProfil = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage({ type: '', text: '' });

//         try {
//             const { error } = await supabase
//                 .from('profiles')
//                 .update({
//                     full_name: profilData.full_name,
//                     telephone: profilData.telephone,
//                 })
//                 .eq('id', profile.id);

//             if (error) throw error;

//             setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
//         } catch (error) {
//             setMessage({ type: 'error', text: error.message });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUpdatePassword = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage({ type: '', text: '' });

//         if (passwordData.new !== passwordData.confirm) {
//             setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
//             setLoading(false);
//             return;
//         }

//         try {
//             const { error } = await supabase.auth.updateUser({
//                 password: passwordData.new
//             });

//             if (error) throw error;

//             setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès' });
//             setPasswordData({ current: '', new: '', confirm: '' });
//         } catch (error) {
//             setMessage({ type: 'error', text: error.message });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-6xl">
//             <div className="mb-6">
//                 <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
//                 <p className="text-gray-600 mt-1">Gérez vos préférences et informations personnelles</p>
//             </div>

//             {/* Onglets */}
//             <div className="bg-white rounded-xl shadow-soft mb-6">
//                 <div className="border-b px-4">
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => setActiveTab('profil')}
//                             className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'profil'
//                                 ? 'border-primary-600 text-primary-600'
//                                 : 'border-transparent text-gray-600 hover:text-gray-900'
//                                 }`}
//                         >
//                             Mon Profil
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('securite')}
//                             className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'securite'
//                                 ? 'border-primary-600 text-primary-600'
//                                 : 'border-transparent text-gray-600 hover:text-gray-900'
//                                 }`}
//                         >
//                             Sécurité
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('statistiques')}
//                             className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'statistiques'
//                                 ? 'border-primary-600 text-primary-600'
//                                 : 'border-transparent text-gray-600 hover:text-gray-900'
//                                 }`}
//                         >
//                             Statistiques
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Messages */}
//             {message.text && (
//                 <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
//                     ? 'bg-success-50 border border-success-200 text-success-700'
//                     : 'bg-danger-50 border border-danger-200 text-danger-700'
//                     }`}>
//                     {message.text}
//                 </div>
//             )}

//             {/* Contenu des onglets */}
//             {activeTab === 'profil' && (
//                 <div className="bg-white rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 mb-6">Informations personnelles</h2>
//                     <form onSubmit={handleUpdateProfil} className="space-y-6">
//                         <div className="grid md:grid-cols-2 gap-6">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
//                                 <input
//                                     type="text"
//                                     name="full_name"
//                                     value={profilData.full_name}
//                                     onChange={handleProfilChange}
//                                     className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                     placeholder="Votre nom complet"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//                                 <input
//                                     type="email"
//                                     value={profilData.email}
//                                     className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 outline-none"
//                                     disabled
//                                 />
//                                 <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
//                             <input
//                                 type="tel"
//                                 name="telephone"
//                                 value={profilData.telephone}
//                                 onChange={handleProfilChange}
//                                 className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 placeholder="+221 XX XXX XX XX"
//                             />
//                         </div>

//                         <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg">
//                             <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
//                                 {profilData.full_name?.[0] || profilData.email?.[0]?.toUpperCase()}
//                             </div>
//                             <div>
//                                 <p className="font-medium text-gray-900">{profilData.full_name || 'Non défini'}</p>
//                                 <p className="text-sm text-gray-600">Rôle: {profile?.role}</p>
//                             </div>
//                         </div>

//                         <div className="flex justify-end pt-4 border-t">
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
//                             >
//                                 {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}

//             {activeTab === 'securite' && (
//                 <div className="bg-white rounded-xl shadow-soft p-6">
//                     <h2 className="text-lg font-bold text-gray-900 mb-6">Changer le mot de passe</h2>
//                     <form onSubmit={handleUpdatePassword} className="space-y-6">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
//                             <input
//                                 type="password"
//                                 name="new"
//                                 value={passwordData.new}
//                                 onChange={handlePasswordChange}
//                                 className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 required
//                                 minLength={6}
//                                 placeholder="Au moins 6 caractères"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
//                             <input
//                                 type="password"
//                                 name="confirm"
//                                 value={passwordData.confirm}
//                                 onChange={handlePasswordChange}
//                                 className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 required
//                                 minLength={6}
//                                 placeholder="Confirmez votre mot de passe"
//                             />
//                         </div>

//                         <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
//                             <div className="flex gap-3">
//                                 <svg className="w-5 h-5 text-warning-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                 </svg>
//                                 <div>
//                                     <p className="text-sm font-medium text-warning-800">Important</p>
//                                     <p className="text-sm text-warning-700 mt-1">Vous serez déconnecté après le changement de mot de passe</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex justify-end pt-4 border-t">
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
//                             >
//                                 {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}

//             {activeTab === 'statistiques' && (
//                 <div className="space-y-6">
//                     <div className="bg-white rounded-xl shadow-soft p-6">
//                         <h2 className="text-lg font-bold text-gray-900 mb-6">Statistiques de l'application</h2>
//                         <div className="grid md:grid-cols-3 gap-6">
//                             <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-blue-700 font-medium">Clients</p>
//                                         <p className="text-3xl font-bold text-blue-900 mt-2">{stats.clients}</p>
//                                     </div>
//                                     <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
//                                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-purple-700 font-medium">Compagnies</p>
//                                         <p className="text-3xl font-bold text-purple-900 mt-2">{stats.compagnies}</p>
//                                     </div>
//                                     <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
//                                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-green-700 font-medium">Contrats</p>
//                                         <p className="text-3xl font-bold text-green-900 mt-2">{stats.contrats}</p>
//                                     </div>
//                                     <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
//                                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-orange-700 font-medium">Paiements</p>
//                                         <p className="text-3xl font-bold text-orange-900 mt-2">{stats.paiements}</p>
//                                     </div>
//                                     <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
//                                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm text-indigo-700 font-medium">Documents</p>
//                                         <p className="text-3xl font-bold text-indigo-900 mt-2">{stats.medias}</p>
//                                     </div>
//                                     <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
//                                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-xl shadow-soft p-6">
//                         <h2 className="text-lg font-bold text-gray-900 mb-4">Informations système</h2>
//                         <div className="space-y-3">
//                             <div className="flex justify-between py-2 border-b">
//                                 <span className="text-gray-600">Version de l'application</span>
//                                 <span className="font-medium text-gray-900">1.0.0</span>
//                             </div>
//                             <div className="flex justify-between py-2 border-b">
//                                 <span className="text-gray-600">Dernière connexion</span>
//                                 <span className="font-medium text-gray-900">{new Date().toLocaleDateString('fr-FR')}</span>
//                             </div>
//                             <div className="flex justify-between py-2">
//                                 <span className="text-gray-600">Statut du compte</span>
//                                 <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs font-medium">Actif</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }










// code precedent qui marche
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { exportDashboardPDF, exportDashboardExcel, exportClientsExcel, exportContratsExcel } from '../utils/exportUtils';

export default function Parametres() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState('profil');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [exportLoading, setExportLoading] = useState(false);

    // Données du profil
    const [profilData, setProfilData] = useState({
        full_name: '',
        email: '',
        telephone: '',
    });

    // Données du mot de passe
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    // Statistiques de l'application
    const [stats, setStats] = useState({
        clients: 0,
        compagnies: 0,
        contrats: 0,
        paiements: 0,
        medias: 0,
    });

    // Données pour exports
    const [exportData, setExportData] = useState({
        dashboardStats: null,
        dashboardGraphiques: null,
        clients: [],
        contrats: []
    });

    useEffect(() => {
        if (profile) {
            setProfilData({
                full_name: profile.full_name || '',
                email: profile.email || '',
                telephone: profile.telephone || '',
            });
        }
        fetchStats();
        fetchExportData();
    }, [profile]);

    const fetchStats = async () => {
        try {
            const [clientsRes, compagniesRes, contratsRes, paiementsRes, mediasRes] = await Promise.all([
                supabase.from('clients').select('id', { count: 'exact', head: true }),
                supabase.from('compagnies').select('id', { count: 'exact', head: true }),
                supabase.from('contrats').select('id', { count: 'exact', head: true }),
                supabase.from('paiements').select('id', { count: 'exact', head: true }),
                supabase.from('medias').select('id', { count: 'exact', head: true }),
            ]);

            setStats({
                clients: clientsRes.count || 0,
                compagnies: compagniesRes.count || 0,
                contrats: contratsRes.count || 0,
                paiements: paiementsRes.count || 0,
                medias: mediasRes.count || 0,
            });
        } catch (error) {
            console.error('Erreur stats:', error);
        }
    };

    const fetchExportData = async () => {
        try {
            const [clientsRes, contratsRes, paiementsRes] = await Promise.all([
                supabase.from('clients').select('*'),
                supabase.from('contrats').select('*, clients(nom, prenom, type_client), compagnies(nom)').eq('statut', 'actif'),
                supabase.from('paiements').select('*')
            ]);

            const clients = clientsRes.data || [];
            const contratsActifs = contratsRes.data || [];
            const paiements = paiementsRes.data || [];

            const commissionsTotal = contratsActifs.reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);
            const commissionsEncaissees = paiements
                .filter(p => p.type_paiement === 'commission_compagnie' && p.date_paiement)
                .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);

            const dashboardStats = {
                totalClients: clients.length,
                clientsParticuliers: clients.filter(c => c.type_client === 'particulier').length,
                clientsEntreprises: clients.filter(c => c.type_client === 'entreprise').length,
                contratsActifs: contratsActifs.length,
                commissionsTotal,
                commissionsEncaissees,
                commissionsEnAttente: commissionsTotal - commissionsEncaissees,
                primesEncaissees: paiements
                    .filter(p => p.type_paiement === 'client_prime' && p.date_paiement)
                    .reduce((sum, p) => sum + parseFloat(p.montant), 0),
                contratsExpirants: 0,
                tauxConversion: clients.length > 0 ? ((contratsActifs.length / clients.length) * 100).toFixed(1) : 0
            };

            const typesMap = {};
            contratsActifs.forEach(c => {
                const type = c.type_contrat.replace(/_/g, ' ');
                if (!typesMap[type]) typesMap[type] = { commission: 0, count: 0 };
                typesMap[type].commission += parseFloat(c.commission || 0);
                typesMap[type].count += 1;
            });

            const { data: compagnies } = await supabase.from('compagnies').select('id, nom');
            const compagniesMap = {};
            contratsActifs.forEach(c => {
                const compagnie = compagnies?.find(comp => comp.id === c.compagnie_id);
                if (compagnie) {
                    if (!compagniesMap[compagnie.nom]) {
                        compagniesMap[compagnie.nom] = { commission: 0, count: 0, encaissee: 0, enAttente: 0 };
                    }
                    const commission = parseFloat(c.commission || 0);
                    compagniesMap[compagnie.nom].commission += commission;
                    compagniesMap[compagnie.nom].count += 1;
                }
            });

            const dashboardGraphiques = {
                evolutionClients: [],
                commissionsParType: Object.entries(typesMap).map(([name, data]) => ({ name, ...data })),
                performanceCompagnies: Object.entries(compagniesMap).map(([name, data]) => ({ name, ...data })),
                topClientsParticuliers: [],
                topClientsEntreprises: [],
                evolutionCommissions: []
            };

            setExportData({
                dashboardStats,
                dashboardGraphiques,
                clients,
                contrats: contratsRes.data || []
            });

        } catch (error) {
            console.error('Erreur export data:', error);
        }
    };

    const handleExportDashboardPDF = async () => {
        setExportLoading(true);
        try {
            await exportDashboardPDF(exportData.dashboardStats, exportData.dashboardGraphiques);
            setMessage({ type: 'success', text: 'Rapport PDF téléchargé avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'export PDF' });
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportDashboardExcel = async () => {
        setExportLoading(true);
        try {
            await exportDashboardExcel(exportData.dashboardStats, exportData.dashboardGraphiques);
            setMessage({ type: 'success', text: 'Rapport Excel téléchargé avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'export Excel' });
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportClientsExcel = async () => {
        setExportLoading(true);
        try {
            await exportClientsExcel(exportData.clients);
            setMessage({ type: 'success', text: 'Liste des clients exportée avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'export clients' });
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportContratsExcel = async () => {
        setExportLoading(true);
        try {
            await exportContratsExcel(exportData.contrats);
            setMessage({ type: 'success', text: 'Liste des contrats exportée avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'export contrats' });
        } finally {
            setExportLoading(false);
        }
    };

    const handleProfilChange = (e) => {
        setProfilData({ ...profilData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfil = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profilData.full_name,
                    telephone: profilData.telephone,
                })
                .eq('id', profile.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (passwordData.new !== passwordData.confirm) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.new
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès' });
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez vos préférences et informations personnelles</p>
            </div>

            {/* Onglets */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700 px-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('profil')}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'profil'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Mon Profil
                        </button>
                        <button
                            onClick={() => setActiveTab('securite')}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'securite'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Sécurité
                        </button>
                        <button
                            onClick={() => setActiveTab('exports')}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'exports'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Exports
                        </button>
                        <button
                            onClick={() => setActiveTab('statistiques')}
                            className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'statistiques'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Statistiques
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-success-50 border border-success-200 text-success-700 dark:bg-success-900 dark:border-success-700 dark:text-success-200'
                    : 'bg-danger-50 border border-danger-200 text-danger-700 dark:bg-danger-900 dark:border-danger-700 dark:text-danger-200'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Contenu des onglets */}
            {activeTab === 'profil' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Informations personnelles</h2>
                    <form onSubmit={handleUpdateProfil} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom complet</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={profilData.full_name}
                                    onChange={handleProfilChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Votre nom complet"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={profilData.email}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 outline-none text-gray-900 dark:text-white"
                                    disabled
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">L'email ne peut pas être modifié</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                            <input
                                type="tel"
                                name="telephone"
                                value={profilData.telephone}
                                onChange={handleProfilChange}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="+221 XX XXX XX XX"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900 rounded-lg">
                            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {profilData.full_name?.[0] || profilData.email?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{profilData.full_name || 'Non défini'}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Rôle: {profile?.role || 'Utilisateur'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'securite' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Changer le mot de passe</h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nouveau mot de passe</label>
                            <input
                                type="password"
                                name="new"
                                value={passwordData.new}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                                minLength={6}
                                placeholder="Au moins 6 caractères"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                name="confirm"
                                value={passwordData.confirm}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                                minLength={6}
                                placeholder="Confirmez votre mot de passe"
                            />
                        </div>

                        <div className="bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700 rounded-lg p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-warning-800 dark:text-warning-200">Important</p>
                                    <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">Vous serez déconnecté après le changement de mot de passe</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                            >
                                {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'exports' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Exports de rapports</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Téléchargez vos données au format PDF ou Excel</p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Export Dashboard PDF */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Rapport Dashboard PDF</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Statistiques complètes, KPIs et graphiques en PDF</p>
                                        <button
                                            onClick={handleExportDashboardPDF}
                                            disabled={exportLoading}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                        >
                                            {exportLoading ? 'Export...' : 'Télécharger PDF'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Export Dashboard Excel */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Rapport Dashboard Excel</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Données détaillées avec plusieurs feuilles Excel</p>
                                        <button
                                            onClick={handleExportDashboardExcel}
                                            disabled={exportLoading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                        >
                                            {exportLoading ? 'Export...' : 'Télécharger Excel'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Export Clients */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Liste des Clients Excel</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Tous les clients avec leurs coordonnées ({exportData.clients.length} clients)</p>
                                        <button
                                            onClick={handleExportClientsExcel}
                                            disabled={exportLoading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                        >
                                            {exportLoading ? 'Export...' : 'Télécharger Excel'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Export Contrats */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Liste des Contrats Excel</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Tous les contrats actifs avec détails ({exportData.contrats.length} contrats)</p>
                                        <button
                                            onClick={handleExportContratsExcel}
                                            disabled={exportLoading}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                        >
                                            {exportLoading ? 'Export...' : 'Télécharger Excel'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info exports */}
                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                        <div className="flex gap-3">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">À propos des exports</h3>
                                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                                    <li>• Les rapports PDF sont optimisés pour l'impression et la présentation</li>
                                    <li>• Les fichiers Excel contiennent plusieurs feuilles avec données détaillées</li>
                                    <li>• Les exports incluent les données à jour au moment du téléchargement</li>
                                    <li>• Les fichiers sont téléchargés directement sur votre appareil</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'statistiques' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Statistiques de l'application</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Clients</p>
                                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{stats.clients}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Compagnies</p>
                                        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">{stats.compagnies}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">Contrats</p>
                                        <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{stats.contrats}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Paiements</p>
                                        <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">{stats.paiements}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Documents</p>
                                        <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mt-2">{stats.medias}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informations système</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Version de l'application</span>
                                <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Dernière connexion</span>
                                <span className="font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400">Statut du compte</span>
                                <span className="px-2 py-1 bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 rounded-full text-xs font-medium">Actif</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}