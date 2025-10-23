// src/hooks/useDashboardData.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
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

            // 1. Récupérer les données de base
            const [clientsRes, contratsRes, paiementsRes, compagniesRes] = await Promise.all([
                supabase.from('clients').select('*'),
                supabase.from('contrats').select('*').eq('statut', 'actif'),
                supabase.from('paiements').select('*'),
                supabase.from('compagnies').select('id, nom')
            ]);

            const clients = clientsRes.data || [];
            const contratsActifs = contratsRes.data || [];
            const paiements = paiementsRes.data || [];
            const compagnies = compagniesRes.data || [];

            // 2. Calculer les statistiques de base
            const baseStats = calculateBaseStats(clients, contratsActifs, paiements);

            // 3. Calculer les contrats expirants (30 jours)
            const dateLimite = getDateLimit(30);
            const contratsExpirants = contratsActifs.filter(c => {
                const dateExp = new Date(c.date_expiration);
                return dateExp <= dateLimite && dateExp >= new Date();
            }).length;

            setStats({
                ...baseStats,
                contratsExpirants
            });

            // 4. Calculer les graphiques
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

            // 5. Récupérer les activités récentes
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return {
        loading,
        stats,
        graphiques,
        activitesRecentes,
        refetch: fetchDashboardData
    };
};