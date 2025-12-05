// src/utils/compagnieHelpers.js

// Vérifier si c'est un type santé
export const isSanteType = (typeName) => {
    const normalized = typeName.trim().toUpperCase().replace(/ /g, '_');
    return normalized === 'SANTE_INDIVIDUELLE'
        || normalized === 'SANTE_FAMILIALE'
        || normalized === 'SANTE_GROUPE';
};

// Normaliser le nom d'un type
export const normalizeTypeName = (typeName) => {
    return typeName.trim().toUpperCase().replace(/ /g, '_');
};

// Valider un fichier image
export const validateImageFile = (file) => {
    const errors = [];

    if (!file.type.startsWith('image/')) {
        errors.push('Veuillez sélectionner une image (PNG, JPG, SVG)');
    }

    if (file.size > 5 * 1024 * 1024) {
        errors.push('Le fichier doit faire moins de 5MB');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// ⭐ Générer les initiales pour l'avatar par défaut
export const getInitials = (sigle) => {
    if (!sigle || sigle.length === 0) return '??';
    return sigle.substring(0, 2).toUpperCase();
};