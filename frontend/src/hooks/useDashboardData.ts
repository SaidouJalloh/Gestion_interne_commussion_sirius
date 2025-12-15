import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../utils/apiClient';

type DashboardPayload = {
    stats: {
        totalClients: number;
        clientsParticuliers: number;
        clientsEntreprises: number;
        contratsActifs: number;
        commissionsTotal: number;
        commissionsEncaissees: number;
        commissionsEnAttente: number;
        primesEncaissees: number;
        contratsExpirants: number;
        tauxConversion: number;
    };
    graphiques: {
        evolutionClients: Array<{ mois: string; clients: number }>;
        evolutionCommissions: Array<{
            mois: string;
            encaissees: number;
            dues: number;
            enAttente: number;
        }>;
        performanceCompagnies: Array<{
            name: string;
            commission: number;
            count: number;
            encaissee: number;
            enAttente: number;
        }>;
        topClientsParticuliers: Array<any>;
        topClientsEntreprises: Array<any>;
        commissionsParType: Array<{ name: string; commission: number; count: number }>;
    };
    activitesRecentes: {
        derniers_contrats: Array<any>;
        derniers_paiements: Array<any>;
        contrats_expirants: Array<any>;
    };
};

export const useDashboardData = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardPayload['stats']>({
        totalClients: 0,
        clientsParticuliers: 0,
        clientsEntreprises: 0,
        contratsActifs: 0,
        commissionsTotal: 0,
        commissionsEncaissees: 0,
        commissionsEnAttente: 0,
        primesEncaissees: 0,
        contratsExpirants: 0,
        tauxConversion: 0,
    });

    const [graphiques, setGraphiques] = useState<DashboardPayload['graphiques']>({
        evolutionClients: [],
        evolutionCommissions: [],
        performanceCompagnies: [],
        topClientsParticuliers: [],
        topClientsEntreprises: [],
        commissionsParType: [],
    });

    const [activitesRecentes, setActivitesRecentes] = useState<
        DashboardPayload['activitesRecentes']
    >({
        derniers_contrats: [],
        derniers_paiements: [],
        contrats_expirants: [],
    });

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiRequest<DashboardPayload>(API_ENDPOINTS.dashboard.get);

            setStats(data.stats);
            setGraphiques(data.graphiques);
            setActivitesRecentes(data.activitesRecentes);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Erreur dashboard (API backend):', e);
            toast.error('Erreur lors du chargement du dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        loading,
        stats,
        graphiques,
        activitesRecentes,
        refetch: fetchDashboardData,
    };
};



