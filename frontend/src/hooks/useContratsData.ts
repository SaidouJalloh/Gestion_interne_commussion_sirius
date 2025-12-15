import { useState, useEffect } from 'react';
import type { Tables } from '../types/supabase';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../utils/apiClient';

// Typages de base pour sécuriser au moins les listes simples
type ClientRow = Tables<'clients'>;
type CompagnieRow = Tables<'compagnies'>;

// Le résultat des contrats avec relations (clients, compagnies, vehicules)
// est plus complexe ; on le laisse en any pour l'instant afin de ne pas
// casser le code existant. On pourra le raffiner plus tard.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContratWithRelations = any;

export const useContratsData = () => {
    const [contrats, setContrats] = useState<ContratWithRelations[]>([]);
    const [clients, setClients] = useState<ClientRow[]>([]);
    const [compagnies, setCompagnies] = useState<CompagnieRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            const compagniesUrl = `${API_ENDPOINTS.compagnies.list}?active=true`;

            const [contratsData, clientsData, compagniesData] = await Promise.all([
                apiRequest<ContratWithRelations[]>(API_ENDPOINTS.contracts.list),
                apiRequest<ClientRow[]>(API_ENDPOINTS.clients.list),
                apiRequest<CompagnieRow[]>(compagniesUrl),
            ]);

            setContrats(Array.isArray(contratsData) ? contratsData : []);
            setClients(Array.isArray(clientsData) ? clientsData : []);
            setCompagnies(Array.isArray(compagniesData) ? compagniesData : []);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur chargement contrats:', error);
            setContrats([]);
            setClients([]);
            setCompagnies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { contrats, clients, compagnies, loading, refetch: fetchData };
};


