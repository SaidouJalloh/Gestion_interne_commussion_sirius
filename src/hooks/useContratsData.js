// src/hooks/useContratsData.js
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
            const [contratsRes, clientsRes, compagniesRes] = await Promise.all([
                supabase.from('contrats').select(`
          *,
          clients(id, nom, prenom, type_client, telephone, email),
          compagnies(id, nom, sigle, logo_url)
        `).order('created_at', { ascending: false }),
                supabase.from('clients').select('id, nom, prenom, type_client, telephone, email').order('nom'),
                supabase.from('compagnies').select('*').eq('actif', true).order('nom')
            ]);

            if (contratsRes.error) throw contratsRes.error;
            if (clientsRes.error) throw clientsRes.error;
            if (compagniesRes.error) throw compagniesRes.error;

            setContrats(contratsRes.data || []);
            setClients(clientsRes.data || []);
            setCompagnies(compagniesRes.data || []);
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