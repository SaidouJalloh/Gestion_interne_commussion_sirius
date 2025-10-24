import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

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
                    compagnies(id, nom, sigle, logo_url),
                    vehicules(*)
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

        // 🔥 REALTIME : Écoute les changements sur contrats
        const contratsChannel = supabase
            .channel('contrats-changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'contrats' },
                (payload) => {
                    console.log('➕ Nouveau contrat:', payload.new);
                    toast.success('Nouveau contrat créé ! 🆕', { duration: 3000 });
                    fetchData(); // Recharge les données
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'contrats' },
                (payload) => {
                    console.log('✏️ Contrat modifié:', payload.new);
                    toast('Contrat mis à jour ! 🔄', { icon: '🔄', duration: 2000 });
                    fetchData();
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'contrats' },
                (payload) => {
                    console.log('🗑️ Contrat supprimé:', payload.old);
                    toast.error('Contrat supprimé ! 🗑️', { duration: 2000 });
                    fetchData();
                }
            )
            .subscribe();

        // 🔥 REALTIME : Écoute les changements sur véhicules
        const vehiculesChannel = supabase
            .channel('vehicules-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'vehicules' },
                (payload) => {
                    console.log('🚗 Véhicules modifiés:', payload);
                    fetchData(); // Recharge pour mettre à jour le compteur
                }
            )
            .subscribe();

        // 🔥 REALTIME : Écoute les changements sur clients (si quelqu'un ajoute un client)
        const clientsChannel = supabase
            .channel('clients-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'clients' },
                () => {
                    // Recharge silencieusement les clients
                    supabase
                        .from('clients')
                        .select('id, nom, prenom, type_client, telephone, email')
                        .order('nom')
                        .then(({ data }) => {
                            if (data) setClients(data);
                        });
                }
            )
            .subscribe();

        // Cleanup : se désabonner quand le composant unmount
        return () => {
            supabase.removeChannel(contratsChannel);
            supabase.removeChannel(vehiculesChannel);
            supabase.removeChannel(clientsChannel);
        };
    }, []);

    return { contrats, clients, compagnies, loading, refetch: fetchData };
};