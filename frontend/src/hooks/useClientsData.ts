import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { Tables } from '../types/supabase';

type ClientRow = Tables<'clients'>;

export const useClientsData = () => {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients((data as ClientRow[]) || []);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();

    // 🔥 REALTIME : Écoute les changements sur clients
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clients' },
        (payload) => {
          console.log('➕ Nouveau client:', payload.new);
          toast.success('Nouveau client ajouté ! 👤', { duration: 3000 });
          fetchClients();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clients' },
        (payload) => {
          console.log('✏️ Client modifié:', payload.new);
          toast('Client mis à jour ! 🔄', { icon: '🔄', duration: 2000 });
          fetchClients();
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'clients' },
        (payload) => {
          console.log('🗑️ Client supprimé:', payload.old);
          toast.error('Client supprimé ! 🗑️', { duration: 2000 });
          fetchClients();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { clients, loading, refetch: fetchClients };
};

