// src/hooks/useCompagniesData.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useCompagniesData = () => {
    const [compagnies, setCompagnies] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCompagnies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('compagnies')
                .select('*')
                .order('nom', { ascending: true });

            if (error) throw error;
            setCompagnies(data || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompagnies();
    }, []);

    return { compagnies, loading, refetch: fetchCompagnies };
};