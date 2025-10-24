import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useContratsData = () => {
    const [contrats, setContrats] = useState([]);
    const [clients, setClients] = useState([]);
    const [compagnies, setCompagnies] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch contrats
            const { data: contratsData, error: contratsError } = await supabase
                .from('contrats')
                .select(`
                    *,
                    clients(id, nom, prenom, type_client, telephone, email),
                    compagnies(id, nom, sigle, logo_url),
                    vehicules(*)
                `)
                .order('created_at', { ascending: false });

            if (contratsError) throw contratsError;

            console.log('🚗 Contrats avec véhicules:', contratsData);

            // Fetch clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('id, nom, prenom, type_client, telephone, email')
                .order('nom');

            if (clientsError) throw clientsError;

            // Fetch compagnies
            const { data: compagniesData, error: compagniesError } = await supabase
                .from('compagnies')
                .select('*')
                .eq('actif', true)
                .order('nom');

            if (compagniesError) throw compagniesError;

            setContrats(contratsData || []);
            setClients(clientsData || []);
            setCompagnies(compagniesData || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { contrats, clients, compagnies, loading, refetch: fetchData };
};