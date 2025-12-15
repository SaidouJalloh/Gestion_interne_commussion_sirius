import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Tables } from '../types/supabase';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../utils/apiClient';

type ClientRow = Tables<'clients'>;

export const useClientsData = () => {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<ClientRow[]>(API_ENDPOINTS.clients.list);
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      toast.error('Erreur lors du chargement des clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return { clients, loading, refetch: fetchClients };
};

