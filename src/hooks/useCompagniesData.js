// // src/hooks/useCompagniesData.js
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';

// export const useCompagniesData = () => {
//     const [compagnies, setCompagnies] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchCompagnies = async () => {
//         try {
//             setLoading(true);
//             const { data, error } = await supabase
//                 .from('compagnies')
//                 .select('*')
//                 .order('nom', { ascending: true });

//             if (error) throw error;
//             setCompagnies(data || []);
//         } catch (error) {
//             console.error('Erreur:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchCompagnies();
//     }, []);

//     return { compagnies, loading, refetch: fetchCompagnies };
// };












// optimise code 
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

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
            console.error('Erreur chargement compagnies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompagnies();

        // 🔥 REALTIME : Écoute les changements sur compagnies
        const channel = supabase
            .channel('compagnies-changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'compagnies' },
                (payload) => {
                    console.log('➕ Nouvelle compagnie:', payload.new);
                    toast.success('Nouvelle compagnie ajoutée ! 🏢', { duration: 3000 });
                    fetchCompagnies();
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'compagnies' },
                (payload) => {
                    console.log('✏️ Compagnie modifiée:', payload.new);
                    toast('Compagnie mise à jour ! 🔄', { icon: '🔄', duration: 2000 });
                    fetchCompagnies();
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'compagnies' },
                (payload) => {
                    console.log('🗑️ Compagnie supprimée:', payload.old);
                    toast.error('Compagnie supprimée ! 🗑️', { duration: 2000 });
                    fetchCompagnies();
                }
            )
            .subscribe();

        // Cleanup : se désabonner au démontage
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { compagnies, loading, refetch: fetchCompagnies };
};