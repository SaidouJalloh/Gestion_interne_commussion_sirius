import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Tables } from '../../types/supabase';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';
import { useOrganization } from '../../context/OrganizationContext';

type CompagnieRow = Tables<'compagnies'>;

export const useCompagniesData = () => {
  const { currentOrganization } = useOrganization();
  const [compagnies, setCompagnies] = useState<CompagnieRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCompagnies = async () => {
    if (!currentOrganization) {
      setCompagnies([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const headers = await getApiHeaders();
      const response = await fetch(API_ENDPOINTS.compagnies.list, { headers });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();

      // L'API backend renvoie un wrapper { success, data }
      if (data && Array.isArray((data as { data?: unknown }).data)) {
        setCompagnies((data as { data: CompagnieRow[] }).data ?? []);
        return;
      }

      // Fallback : si jamais l'API renvoie directement un tableau
      if (Array.isArray(data)) {
        setCompagnies(data as CompagnieRow[]);
      } else {
        setCompagnies([]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur chargement compagnies (API backend):', error);
      setCompagnies([]); // S'assurer que compagnies reste un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompagnies();

    // 🔥 REALTIME : Écoute les changements sur compagnies via Supabase
    const channel = supabase
      .channel('compagnies-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'compagnies' },
        () => {
          // léger délai pour laisser la base se mettre à jour
          setTimeout(() => fetchCompagnies(), 300);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'compagnies' },
        () => {
          setTimeout(() => fetchCompagnies(), 300);
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'compagnies' },
        () => {
          fetchCompagnies();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization?.id]);

  return { compagnies, loading, refetch: fetchCompagnies };
};


