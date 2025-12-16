/**
 * Configuration centralisée des endpoints API
 */

/**
 * URL de base de l'API backend
 * Utilise la variable d'environnement REACT_APP_API_URL si disponible,
 * sinon utilise l'URL par défaut en développement
 */
export const API_BASE_URL =
    process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.length > 0
        ? process.env.REACT_APP_API_URL
        : 'http://localhost:4000';

/**
 * Endpoints API disponibles
 */
export const API_ENDPOINTS = {
    // Compagnies
    compagnies: {
        list: `${API_BASE_URL}/api/compagnies`,
        byId: (id: string) => `${API_BASE_URL}/api/compagnies/${id}`,
        create: `${API_BASE_URL}/api/compagnies`,
        update: (id: string) => `${API_BASE_URL}/api/compagnies/${id}`,
        delete: (id: string) => `${API_BASE_URL}/api/compagnies/${id}`,
    },

    // Contrats
    contracts: {
        list: `${API_BASE_URL}/api/contracts`,
        byId: (id: string) => `${API_BASE_URL}/api/contracts/${id}`,
        create: `${API_BASE_URL}/api/contracts`,
        update: (id: string) => `${API_BASE_URL}/api/contracts/${id}`,
        delete: (id: string) => `${API_BASE_URL}/api/contracts/${id}`,
    },

    // Clients
    clients: {
        list: `${API_BASE_URL}/api/clients`,
        byId: (id: string) => `${API_BASE_URL}/api/clients/${id}`,
        create: `${API_BASE_URL}/api/clients`,
        update: (id: string) => `${API_BASE_URL}/api/clients/${id}`,
        delete: (id: string) => `${API_BASE_URL}/api/clients/${id}`,
    },

    // Dashboard
    dashboard: {
        get: `${API_BASE_URL}/api/dashboard`,
    },

    // Payments
    payments: {
        list: `${API_BASE_URL}/api/payments`,
        byId: (id: string) => `${API_BASE_URL}/api/payments/${id}`,
        create: `${API_BASE_URL}/api/payments`,
        update: (id: string) => `${API_BASE_URL}/api/payments/${id}`,
        delete: (id: string) => `${API_BASE_URL}/api/payments/${id}`,
    },

    // Folders (Medias)
    folders: {
        list: `${API_BASE_URL}/api/folders`,
        byId: (id: string) => `${API_BASE_URL}/api/folders/${id}`,
        create: `${API_BASE_URL}/api/folders`,
        update: (id: string) => `${API_BASE_URL}/api/folders/${id}`,
        delete: (id: string) => `${API_BASE_URL}/api/folders/${id}`,
    },

    // Media (Medias)
    media: {
        list: `${API_BASE_URL}/api/media`,
        byId: (id: string) => `${API_BASE_URL}/api/media/${id}`,
        create: `${API_BASE_URL}/api/media`,
        update: (id: string) => `${API_BASE_URL}/api/media/${id}`,
        delete: (id: string) => `${API_BASE_URL}/api/media/${id}`,
        trash: (id: string) => `${API_BASE_URL}/api/media/${id}/trash`,
        restore: (id: string) => `${API_BASE_URL}/api/media/${id}/restore`,
    },

    // Vehicules (Flottes)
    vehicules: {
        list: `${API_BASE_URL}/api/vehicules`,
        byId: (id: string) => `${API_BASE_URL}/api/vehicules/${id}`,
        create: `${API_BASE_URL}/api/vehicules`,
        update: (id: string) => `${API_BASE_URL}/api/vehicules/${id}`,
        delete: (id: string) => `${API_BASE_URL}/api/vehicules/${id}`,
    },

    // Incorporations
    incorporations: {
        list: `${API_BASE_URL}/api/incorporations`,
        byId: (id: string) => `${API_BASE_URL}/api/incorporations/${id}`,
        create: `${API_BASE_URL}/api/incorporations`,
    },

    // Notifications
    notifications: {
        list: `${API_BASE_URL}/api/notifications`,
        byId: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
        update: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
        delete: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
    },

    // Recherche globale
    search: {
        get: `${API_BASE_URL}/api/search`,
    },

    // Autres endpoints à ajouter selon les besoins
    // paiements: { ... },
    // vehicules: { ... },
    // incorporations: { ... },
} as const;

/**
 * Configuration des en-têtes par défaut pour les requêtes API
 */
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
} as const;

/**
 * Timeout par défaut pour les requêtes API (en millisecondes)
 */
export const API_TIMEOUT = 10000;

