// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';

// export const useIncorporations = (contratId) => {
//     const [incorporations, setIncorporations] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchIncorporations = async () => {
//         if (!contratId) {
//             setIncorporations([]);
//             setLoading(false);
//             return;
//         }

//         try {
//             setLoading(true);
//             const { data, error } = await supabase
//                 .from('incorporations')
//                 .select(`
//                     *,
//                     created_by_profile:profiles!incorporations_created_by_fkey(nom, prenom)
//                 `)
//                 .eq('contrat_id', contratId)
//                 .order('created_at', { ascending: false });

//             if (error) throw error;
//             setIncorporations(data || []);
//         } catch (error) {
//             console.error('Erreur chargement incorporations:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchIncorporations();

//         const channel = supabase
//             .channel(`incorporations-${contratId}`)
//             .on('postgres_changes',
//                 { event: 'INSERT', schema: 'public', table: 'incorporations', filter: `contrat_id=eq.${contratId}` },
//                 () => setTimeout(() => fetchIncorporations(), 300)
//             )
//             .subscribe();

//         return () => {
//             supabase.removeChannel(channel);
//         };
//     }, [contratId]);

//     return { incorporations, loading, refetch: fetchIncorporations };
// };



import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../utils/apiClient';

type IncorporationRow = Record<string, unknown> & {
  created_by_profile?: unknown;
  profiles?: unknown;
};

export const useIncorporations = (contratId?: string | null) => {
    const [incorporations, setIncorporations] = useState<IncorporationRow[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchIncorporations = useCallback(async () => {
        if (!contratId) {
            setIncorporations([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('contratId', contratId);
            const url = `${API_ENDPOINTS.incorporations.list}?${params.toString()}`;

            const data = await apiRequest<unknown>(url);
            const rows = (Array.isArray(data) ? data : []) as IncorporationRow[];
            // Compat: l'ancien code attendait `created_by_profile`
            setIncorporations(
                rows.map((row) => ({
                    ...row,
                    created_by_profile: row.created_by_profile ?? row.profiles ?? null,
                })),
            );
        } catch (error) {
            console.error('Erreur chargement incorporations:', error);
        } finally {
            setLoading(false);
        }
    }, [contratId]);

    useEffect(() => {
        fetchIncorporations();
    }, [fetchIncorporations]);

    return { incorporations, loading, refetch: fetchIncorporations };
};