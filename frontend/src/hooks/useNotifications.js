// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    createContratExpirantNotification,
    createPaiementRetardNotification
} from '../utils/notificationHelpers';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);

            // 1. Récupérer les notifications de la base de données
            const { data: dbNotifications, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            // 2. Générer les notifications automatiques
            const autoNotifications = await generateAutoNotifications();

            // 3. Combiner et trier
            const allNotifications = [...(dbNotifications || []), ...autoNotifications]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setNotifications(allNotifications);
            setUnreadCount(allNotifications.filter(n => n.statut === 'non_lu').length);

        } catch (error) {
            console.error('Erreur notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAutoNotifications = async () => {
        const notifications = [];

        try {
            // Contrats expirants (30 jours)
            const dateLimite = new Date();
            dateLimite.setDate(dateLimite.getDate() + 30);

            const { data: contratsExpirants } = await supabase
                .from('contrats')
                .select('*, clients(nom, prenom)')
                .eq('statut', 'actif')
                .gte('date_expiration', new Date().toISOString().split('T')[0])
                .lte('date_expiration', dateLimite.toISOString().split('T')[0]);

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

            const { data: contratsEnRetard } = await supabase
                .from('contrats')
                .select('*, clients(nom, prenom)')
                .eq('statut', 'actif')
                .lt('date_effet', dateRetard.toISOString().split('T')[0]);

            if (contratsEnRetard) {
                for (const contrat of contratsEnRetard) {
                    const { data: paiements } = await supabase
                        .from('paiements')
                        .select('montant')
                        .eq('contrat_id', contrat.id)
                        .eq('type_paiement', 'commission_compagnie');

                    const totalPaye = (paiements || []).reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);
                    const montantDu = parseFloat(contrat.commission || 0) - totalPaye;

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
    };

    const markAsRead = async (notificationId) => {
        try {
            // Si c'est une notification de la DB
            if (!notificationId.startsWith('exp_') && !notificationId.startsWith('retard_')) {
                await supabase
                    .from('notifications')
                    .update({ statut: 'lu' })
                    .eq('id', notificationId);
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

    const deleteNotification = async (notificationId) => {
        try {
            if (!notificationId.startsWith('exp_') && !notificationId.startsWith('retard_')) {
                await supabase
                    .from('notifications')
                    .delete()
                    .eq('id', notificationId);
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
    }, []);

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