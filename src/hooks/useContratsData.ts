import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Tables } from '../types/supabase';

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

            const [contratsRes, clientsRes, compagniesRes] = await Promise.all([
                supabase
                    .from('contrats')
                    .select(
                        `
            *,
            clients(id, nom, prenom, type_client, telephone, email),
            compagnies(id, nom, sigle, logo_url),
            vehicules(*)
          `,
                    )
                    .order('created_at', { ascending: false }),
                supabase
                    .from('clients')
                    .select('id, nom, prenom, type_client, telephone, email')
                    .order('nom'),
                supabase
                    .from('compagnies')
                    .select('*')
                    .eq('actif', true)
                    .order('nom'),
            ]);

            if (contratsRes.error) throw contratsRes.error;
            if (clientsRes.error) throw clientsRes.error;
            if (compagniesRes.error) throw compagniesRes.error;

            setContrats((contratsRes.data as ContratWithRelations[]) || []);
            setClients((clientsRes.data as ClientRow[]) || []);
            setCompagnies((compagniesRes.data as CompagnieRow[]) || []);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur chargement contrats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // 🔥 REALTIME : Écoute les changements sur contrats
        const contratsChannel = supabase
            .channel('contrats-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'contrats' },
                () => {
                    // Petit délai pour laisser Supabase finir d'écrire
                    setTimeout(() => fetchData(), 300);
                },
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'contrats' },
                () => {
                    setTimeout(() => fetchData(), 300);
                },
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'contrats' },
                () => {
                    fetchData();
                },
            )
            .subscribe();

        // 🔥 REALTIME : Écoute les changements sur véhicules
        const vehiculesChannel = supabase
            .channel('vehicules-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'vehicules' },
                () => {
                    setTimeout(() => fetchData(), 200);
                },
            )
            .subscribe();

        // 🔥 REALTIME : Écoute les changements sur clients
        const clientsChannel = supabase
            .channel('clients-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'clients' },
                () => {
                    supabase
                        .from('clients')
                        .select('id, nom, prenom, type_client, telephone, email')
                        .order('nom')
                        .then(({ data }) => {
                            if (data) {
                                setClients(data as ClientRow[]);
                            }
                        });
                },
            )
            .subscribe();

        // Cleanup : se désabonner quand le composant unmount
        return () => {
            supabase.removeChannel(contratsChannel);
            supabase.removeChannel(vehiculesChannel);
            supabase.removeChannel(clientsChannel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { contrats, clients, compagnies, loading, refetch: fetchData };
};


