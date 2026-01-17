// src/utils/notificationHelpers.js

// Types de notifications
export const NOTIFICATION_TYPES = {
    CONTRAT_EXPIRANT: 'contrat_expirant',
    PAIEMENT_RETARD: 'paiement_retard',
    COMMISSION_RECUE: 'commission_recue',
    NOUVEAU_CONTRAT: 'nouveau_contrat'
};

// Priorités
export const PRIORITIES = {
    BASSE: 'basse',
    NORMALE: 'normale',
    HAUTE: 'haute',
    URGENTE: 'urgente'
};

// Icônes par type
export const getNotificationIcon = (type: string) => {
    const icons = {
        [NOTIFICATION_TYPES.CONTRAT_EXPIRANT]: '⏰',
        [NOTIFICATION_TYPES.PAIEMENT_RETARD]: '💰',
        [NOTIFICATION_TYPES.COMMISSION_RECUE]: '✅',
        [NOTIFICATION_TYPES.NOUVEAU_CONTRAT]: '📄'
    };
    return icons[type] || '🔔';
};

// Couleurs par priorité
export const getPriorityColor = (priorite: string) => {
    const colors = {
        [PRIORITIES.BASSE]: 'text-gray-600 bg-gray-100',
        [PRIORITIES.NORMALE]: 'text-blue-600 bg-blue-100',
        [PRIORITIES.HAUTE]: 'text-orange-600 bg-orange-100',
        [PRIORITIES.URGENTE]: 'text-red-600 bg-red-100'
    };
    return colors[priorite] || colors[PRIORITIES.NORMALE];
};

// Formater le temps relatif
export const getRelativeTime = (date: string | Date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;

    return notifDate.toLocaleDateString('fr-FR');
};

// Générer une notification pour contrat expirant
type ContratLike = Record<string, unknown> & {
    id: string;
    date_expiration?: string | null;
    clients?: { nom?: string | null; prenom?: string | null } | null;
};

export const createContratExpirantNotification = (contrat: ContratLike) => {
    const expDate = new Date(contrat.date_expiration ?? '');
    const daysUntilExpiration = Math.ceil(
        (expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
        type: NOTIFICATION_TYPES.CONTRAT_EXPIRANT,
        titre: 'Contrat à renouveler',
        message: `Le contrat de ${contrat.clients?.nom} ${contrat.clients?.prenom} expire dans ${daysUntilExpiration} jours`,
        contrat_id: contrat.id,
        priorite: daysUntilExpiration <= 7 ? PRIORITIES.URGENTE :
            daysUntilExpiration <= 15 ? PRIORITIES.HAUTE : PRIORITIES.NORMALE
    };
};

// Générer une notification pour paiement en retard
export const createPaiementRetardNotification = (contrat: ContratLike, montantDu: number) => {
    return {
        type: NOTIFICATION_TYPES.PAIEMENT_RETARD,
        titre: 'Paiement en retard',
        message: `Commission de ${montantDu.toLocaleString('fr-FR')} FCFA non encaissée pour ${contrat.clients?.nom}`,
        contrat_id: contrat.id,
        priorite: PRIORITIES.HAUTE
    };
};