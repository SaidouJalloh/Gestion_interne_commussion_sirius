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

