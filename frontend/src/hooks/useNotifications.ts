// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import {
    createContratExpirantNotification,
    createPaiementRetardNotification
} from '../utils/notificationHelpers';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../utils/apiClient';

type ContratLike = Record<string, unknown> & {
  id: string;
  statut?: string | null;
  date_expiration?: string | null;
  date_effet?: string | null;
  commission?: number | string | null;
};

type PaiementLike = Record<string, unknown> & {
  contrat_id?: string | null;
  type_paiement?: string | null;
  montant?: number | string | null;
  created_at?: string | null;
  statut?: string | null;
  id?: string | null;
};

type NotificationLike = Record<string, unknown> & {
  id: string;
  statut?: string | null;
  created_at: string;
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationLike[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const generateAutoNotifications = useCallback(async () => {
        const notifications = [];

        try {
            const [contratsAll, paiementsAll] = await Promise.all([
                apiRequest<unknown>(API_ENDPOINTS.contracts.list),
                apiRequest<unknown>(API_ENDPOINTS.payments.list),
            ]);

            const contrats = (Array.isArray(contratsAll) ? contratsAll : []) as ContratLike[];
            const paiements = (Array.isArray(paiementsAll) ? paiementsAll : []) as PaiementLike[];

            // Contrats expirants (30 jours)
            const dateLimite = new Date();
            dateLimite.setDate(dateLimite.getDate() + 30);

            const today = new Date();
            const contratsExpirants = contrats.filter((c) => {
                if (c?.statut !== 'actif') return false;
                const exp = c?.date_expiration ? new Date(c.date_expiration) : null;
                if (!exp || Number.isNaN(exp.getTime())) return false;
                return exp >= new Date(today.toISOString().slice(0, 10)) && exp <= dateLimite;
            });

            (contratsExpirants || []).forEach(contrat => {
                notifications.push({
                    ...createContratExpirantNotification(contrat),
                    id: `exp_${contrat.id}`,
                    statut: 'non_lu',
                    created_at: new Date().toISOString()
                });
            });

            // Paiements en retard (commissions non encaissées > 30 jours)
            const dateRetard = new Date();
            dateRetard.setDate(dateRetard.getDate() - 30);

            const contratsEnRetard = contrats.filter((c) => {
                if (c?.statut !== 'actif') return false;
                const eff = c?.date_effet ? new Date(c.date_effet) : null;
                if (!eff || Number.isNaN(eff.getTime())) return false;
                return eff < dateRetard;
            });

            if (contratsEnRetard) {
                const paiementsByContrat = new Map<string, PaiementLike[]>();
                for (const p of paiements) {
                    const contratId = p?.contrat_id;
                    if (!contratId) continue;
                    if (!paiementsByContrat.has(contratId)) paiementsByContrat.set(contratId, []);
                    paiementsByContrat.get(contratId)?.push(p);
                }

                for (const contrat of contratsEnRetard) {
                    const paiementsContrat = (paiementsByContrat.get(contrat.id) || [])
                        .filter((p: PaiementLike) => p.type_paiement === 'commission_compagnie');

                    const totalPaye = (paiementsContrat || [])
                        .reduce((sum: number, p: PaiementLike) => sum + parseFloat(String(p.montant ?? 0)), 0);
                    const montantDu = parseFloat(String(contrat.commission ?? 0)) - totalPaye;

                    if (montantDu > 0) {
                        notifications.push({
                            ...createPaiementRetardNotification(contrat, montantDu),
                            id: `retard_${contrat.id}`,
                            statut: 'non_lu',
                            created_at: new Date().toISOString()
                        });
                    }
                }
            }

        } catch (error) {
            console.error('Erreur génération notifications:', error);
        }

        return notifications;
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Récupérer les notifications de la base de données
            const params = new URLSearchParams();
            params.set('limit', '50');
            const dbNotifications = await apiRequest(`${API_ENDPOINTS.notifications.list}?${params.toString()}`);

            // 2. Générer les notifications automatiques
            const autoNotifications = await generateAutoNotifications();

            // 3. Combiner et trier
            const allNotifications = [...(Array.isArray(dbNotifications) ? dbNotifications : []), ...autoNotifications]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setNotifications(allNotifications);
            setUnreadCount(allNotifications.filter(n => n.statut === 'non_lu').length);

        } catch (error) {
            console.error('Erreur notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [generateAutoNotifications]);

    const markAsRead = async (notificationId: string) => {
        try {
            // Si c'est une notification de la DB
            if (!notificationId.startsWith('exp_') && !notificationId.startsWith('retard_')) {
                await apiRequest(API_ENDPOINTS.notifications.update(notificationId), {
                    method: 'PUT',
                    body: JSON.stringify({ statut: 'lu' }),
                });
            }

            // Mettre à jour localement
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, statut: 'lu' } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

        } catch (error) {
            console.error('Erreur marquage lu:', error);
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, statut: 'lu' })));
        setUnreadCount(0);
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            if (!notificationId.startsWith('exp_') && !notificationId.startsWith('retard_')) {
                await apiRequest(API_ENDPOINTS.notifications.delete(notificationId), {
                    method: 'DELETE',
                });
            }

            setNotifications(prev => prev.filter(n => n.id !== notificationId));

        } catch (error) {
            console.error('Erreur suppression notification:', error);
        }
    };

    // Auto-refresh toutes les 5 minutes
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch: fetchNotifications
    };
};