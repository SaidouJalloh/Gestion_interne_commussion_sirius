import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export const useVehicules = (contratId) => {
    const [vehicules, setVehicules] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchVehicules = async () => {
        if (!contratId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vehicules')
                .select('*')
                .eq('contrat_id', contratId)
                .eq('actif', true)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setVehicules(data || []);
        } catch (error) {
            console.error('Erreur fetch véhicules:', error);
            toast.error('Erreur lors du chargement des véhicules');
        } finally {
            setLoading(false);
        }
    };

    const addVehicule = async (vehiculeData) => {
        try {
            const { data, error } = await supabase
                .from('vehicules')
                .insert([{ ...vehiculeData, contrat_id: contratId }])
                .select()
                .single();

            if (error) throw error;

            setVehicules(prev => [...prev, data]);
            toast.success('Véhicule ajouté ! 🚗');
            return { success: true, data };
        } catch (error) {
            console.error('Erreur ajout véhicule:', error);
            toast.error('Erreur lors de l\'ajout du véhicule');
            return { success: false, error };
        }
    };

    const updateVehicule = async (id, vehiculeData) => {
        try {
            const { data, error } = await supabase
                .from('vehicules')
                .update(vehiculeData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setVehicules(prev => prev.map(v => v.id === id ? data : v));
            toast.success('Véhicule modifié ! ✏️');
            return { success: true, data };
        } catch (error) {
            console.error('Erreur modification véhicule:', error);
            toast.error('Erreur lors de la modification');
            return { success: false, error };
        }
    };

    const deleteVehicule = async (id) => {
        try {
            const { error } = await supabase
                .from('vehicules')
                .update({ actif: false })
                .eq('id', id);

            if (error) throw error;

            setVehicules(prev => prev.filter(v => v.id !== id));
            toast.success('Véhicule supprimé ! 🗑️');
            return { success: true };
        } catch (error) {
            console.error('Erreur suppression véhicule:', error);
            toast.error('Erreur lors de la suppression');
            return { success: false, error };
        }
    };

    useEffect(() => {
        fetchVehicules();
    }, [contratId]);

    return {
        vehicules,
        loading,
        addVehicule,
        updateVehicule,
        deleteVehicule,
        refetch: fetchVehicules,
        count: vehicules.length
    };
};