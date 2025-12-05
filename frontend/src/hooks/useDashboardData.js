// // src/hooks/useDashboardData.js
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import {
//     calculateBaseStats,
//     calculateClientsEvolution,
//     calculateCommissionsEvolution,
//     calculateTypeDistribution,
//     calculateCompanyPerformance,
//     calculateTopClients,
//     getDateLimit
// } from '../utils/dashboardHelpers';

// export const useDashboardData = () => {
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

//     const fetchDashboardData = async () => {
//         try {
//             setLoading(true);

//             // 1. Récupérer les données de base
//             const [clientsRes, contratsRes, paiementsRes, compagniesRes] = await Promise.all([
//                 supabase.from('clients').select('*'),
//                 supabase.from('contrats').select('*').eq('statut', 'actif'),
//                 supabase.from('paiements').select('*'),
//                 supabase.from('compagnies').select('id, nom')
//             ]);

//             const clients = clientsRes.data || [];
//             const contratsActifs = contratsRes.data || [];
//             const paiements = paiementsRes.data || [];
//             const compagnies = compagniesRes.data || [];

//             // 2. Calculer les statistiques de base
//             const baseStats = calculateBaseStats(clients, contratsActifs, paiements);

//             // 3. Calculer les contrats expirants (30 jours)
//             const dateLimite = getDateLimit(30);
//             const contratsExpirants = contratsActifs.filter(c => {
//                 const dateExp = new Date(c.date_expiration);
//                 return dateExp <= dateLimite && dateExp >= new Date();
//             }).length;

//             setStats({
//                 ...baseStats,
//                 contratsExpirants
//             });

//             // 4. Calculer les graphiques
//             const evolutionClients = calculateClientsEvolution(clients);
//             const evolutionCommissions = calculateCommissionsEvolution(contratsActifs, paiements);
//             const repartitionTypes = calculateTypeDistribution(contratsActifs);
//             const performanceCompagnies = calculateCompanyPerformance(contratsActifs, compagnies, paiements);
//             const topClientsParticuliers = calculateTopClients(clients, contratsActifs, 'particulier');
//             const topClientsEntreprises = calculateTopClients(clients, contratsActifs, 'entreprise');

//             setGraphiques({
//                 evolutionClients,
//                 evolutionCommissions,
//                 repartitionTypes,
//                 performanceCompagnies,
//                 topClientsParticuliers,
//                 topClientsEntreprises,
//                 commissionsParType: repartitionTypes
//             });

//             // 5. Récupérer les activités récentes
//             const [derniersContratsRes, derniersPaiementsRes, contratsExpirantsRes] = await Promise.all([
//                 supabase
//                     .from('contrats')
//                     .select('*, clients(nom, prenom, type_client), compagnies(nom)')
//                     .order('created_at', { ascending: false })
//                     .limit(5),
//                 supabase
//                     .from('paiements')
//                     .select('*, contrats(clients(nom, prenom), type_contrat)')
//                     .order('created_at', { ascending: false })
//                     .limit(5),
//                 supabase
//                     .from('contrats')
//                     .select('*, clients(nom, prenom), compagnies(nom)')
//                     .eq('statut', 'actif')
//                     .gte('date_expiration', new Date().toISOString().split('T')[0])
//                     .lte('date_expiration', dateLimite.toISOString().split('T')[0])
//                     .order('date_expiration', { ascending: true })
//                     .limit(5)
//             ]);

//             setActivitesRecentes({
//                 derniers_contrats: derniersContratsRes.data || [],
//                 derniers_paiements: derniersPaiementsRes.data || [],
//                 contrats_expirants: contratsExpirantsRes.data || []
//             });

//         } catch (error) {
//             console.error('Erreur dashboard:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchDashboardData();
//     }, []);

//     return {
//         loading,
//         stats,
//         graphiques,
//         activitesRecentes,
//         refetch: fetchDashboardData
//     };
// };














// optimise rapide
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import {
    calculateBaseStats,
    calculateClientsEvolution,
    calculateCommissionsEvolution,
    calculateTypeDistribution,
    calculateCompanyPerformance,
    calculateTopClients,
    getDateLimit
} from '../utils/dashboardHelpers';

export const useDashboardData = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClients: 0,
        clientsParticuliers: 0,
        clientsEntreprises: 0,
        contratsActifs: 0,
        commissionsTotal: 0,
        commissionsEncaissees: 0,
        commissionsEnAttente: 0,
        primesEncaissees: 0,
        contratsExpirants: 0,
        tauxConversion: 0
    });

    const [graphiques, setGraphiques] = useState({
        evolutionClients: [],
        repartitionTypes: [],
        performanceCompagnies: [],
        topClientsParticuliers: [],
        topClientsEntreprises: [],
        commissionsParType: [],
        evolutionCommissions: []
    });

    const [activitesRecentes, setActivitesRecentes] = useState({
        derniers_contrats: [],
        derniers_paiements: [],
        contrats_expirants: []
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // ⚡ Requêtes parallèles optimisées
            const [clientsRes, contratsRes, paiementsRes, compagniesRes] = await Promise.all([
                supabase.from('clients').select('*'),
                supabase.from('contrats').select('*').eq('statut', 'actif'),
                supabase.from('paiements').select('*'),
                supabase.from('compagnies').select('id, nom')
            ]);

            if (clientsRes.error) throw clientsRes.error;
            if (contratsRes.error) throw contratsRes.error;
            if (paiementsRes.error) throw paiementsRes.error;
            if (compagniesRes.error) throw compagniesRes.error;

            const clients = clientsRes.data || [];
            const contratsActifs = contratsRes.data || [];
            const paiements = paiementsRes.data || [];
            const compagnies = compagniesRes.data || [];

            // Calculer les statistiques de base
            const baseStats = calculateBaseStats(clients, contratsActifs, paiements);

            // Calculer les contrats expirants (30 jours)
            const dateLimite = getDateLimit(30);
            const contratsExpirants = contratsActifs.filter(c => {
                const dateExp = new Date(c.date_expiration);
                return dateExp <= dateLimite && dateExp >= new Date();
            }).length;

            setStats({
                ...baseStats,
                contratsExpirants
            });

            // Calculer les graphiques
            const evolutionClients = calculateClientsEvolution(clients);
            const evolutionCommissions = calculateCommissionsEvolution(contratsActifs, paiements);
            const repartitionTypes = calculateTypeDistribution(contratsActifs);
            const performanceCompagnies = calculateCompanyPerformance(contratsActifs, compagnies, paiements);
            const topClientsParticuliers = calculateTopClients(clients, contratsActifs, 'particulier');
            const topClientsEntreprises = calculateTopClients(clients, contratsActifs, 'entreprise');

            setGraphiques({
                evolutionClients,
                evolutionCommissions,
                repartitionTypes,
                performanceCompagnies,
                topClientsParticuliers,
                topClientsEntreprises,
                commissionsParType: repartitionTypes
            });

            // Récupérer les activités récentes
            const [derniersContratsRes, derniersPaiementsRes, contratsExpirantsRes] = await Promise.all([
                supabase
                    .from('contrats')
                    .select('*, clients(nom, prenom, type_client), compagnies(nom)')
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('paiements')
                    .select('*, contrats(clients(nom, prenom), type_contrat)')
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('contrats')
                    .select('*, clients(nom, prenom), compagnies(nom)')
                    .eq('statut', 'actif')
                    .gte('date_expiration', new Date().toISOString().split('T')[0])
                    .lte('date_expiration', dateLimite.toISOString().split('T')[0])
                    .order('date_expiration', { ascending: true })
                    .limit(5)
            ]);

            setActivitesRecentes({
                derniers_contrats: derniersContratsRes.data || [],
                derniers_paiements: derniersPaiementsRes.data || [],
                contrats_expirants: contratsExpirantsRes.data || []
            });

        } catch (error) {
            console.error('Erreur dashboard:', error);
            toast.error('Erreur lors du chargement du dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // 🔥 REALTIME : Écoute les changements sur contrats
        const contratsChannel = supabase
            .channel('dashboard-contrats')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'contrats' },
                (payload) => {
                    console.log('📊 Dashboard - Contrat modifié:', payload);

                    // Toast silencieux pour ne pas spammer
                    if (payload.eventType === 'INSERT') {
                        toast('Dashboard actualisé ! 🔄', { icon: '📊', duration: 2000 });
                    }

                    fetchDashboardData();
                }
            )
            .subscribe();

        // 🔥 REALTIME : Écoute les changements sur paiements
        const paiementsChannel = supabase
            .channel('dashboard-paiements')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'paiements' },
                (payload) => {
                    console.log('💰 Dashboard - Paiement modifié:', payload);

                    if (payload.eventType === 'INSERT') {
                        toast.success('Nouveau paiement enregistré ! 💵', { duration: 2000 });
                    }

                    fetchDashboardData();
                }
            )
            .subscribe();

        // 🔥 REALTIME : Écoute les changements sur clients
        const clientsChannel = supabase
            .channel('dashboard-clients')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'clients' },
                (payload) => {
                    console.log('👤 Dashboard - Client modifié:', payload);
                    fetchDashboardData();
                }
            )
            .subscribe();

        // 🔥 REALTIME : Écoute les changements sur compagnies
        const compagniesChannel = supabase
            .channel('dashboard-compagnies')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'compagnies' },
                (payload) => {
                    console.log('🏢 Dashboard - Compagnie modifiée:', payload);
                    fetchDashboardData();
                }
            )
            .subscribe();

        // Cleanup : se désabonner au démontage
        return () => {
            supabase.removeChannel(contratsChannel);
            supabase.removeChannel(paiementsChannel);
            supabase.removeChannel(clientsChannel);
            supabase.removeChannel(compagniesChannel);
        };
    }, []);

    return {
        loading,
        stats,
        graphiques,
        activitesRecentes,
        refetch: fetchDashboardData
    };
};