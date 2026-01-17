import { useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';

export type PaymentPayload = {
  contrat_id: string;
  type_paiement: string;
  montant: number | string;
  date_paiement: string; // YYYY-MM-DD
  mode_paiement: string;
  notes?: string | null;
};

export const usePaymentsMutations = () => {
  const createPayment = useCallback(async (payload: PaymentPayload) => {
    return apiRequest<any>(API_ENDPOINTS.payments.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }, []);

  const updatePayment = useCallback(async (id: string, payload: Partial<PaymentPayload>) => {
    return apiRequest<any>(API_ENDPOINTS.payments.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }, []);

  const deletePayment = useCallback(async (id: string) => {
    await apiRequest<unknown>(API_ENDPOINTS.payments.delete(id), { method: 'DELETE' });
  }, []);

  return { createPayment, updatePayment, deletePayment };
};



