import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';
import { useOrganization } from '../../context/OrganizationContext';

type PaymentRow = any;

export type PaymentsQuery = {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  type?: string;
  contractId?: string;
};

export const usePaymentsData = (query: PaymentsQuery) => {
  const { currentOrganization } = useOrganization();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.type) params.set('type', query.type);
    if (query.contractId) params.set('contractId', query.contractId);

    const qs = params.toString();
    return qs ? `${API_ENDPOINTS.payments.list}?${qs}` : API_ENDPOINTS.payments.list;
  }, [query]);

  const fetchPayments = useCallback(async () => {
    if (!currentOrganization) {
      setPayments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<PaymentRow[]>(url);
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Erreur chargement paiements (API backend):', e);
      toast.error('Erreur lors du chargement des paiements');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [url, currentOrganization]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, refetch: fetchPayments };
};



