/**
 * Calculer la prime nette (comme contrat normal)
 */
export const calculerPrimeNette = (primeTTC, fga, taxes, accessoire) => {
    const ttc = parseFloat(primeTTC) || 0;
    const fgaVal = parseFloat(fga) || 0;
    const taxesVal = parseFloat(taxes) || 0;
    const accessoireVal = parseFloat(accessoire) || 0;

    return ttc - fgaVal - taxesVal - accessoireVal;
};

/**
 * Calculer la commission
 */
export const calculerCommission = (primeNette, tauxCommission) => {
    if (typeof tauxCommission === 'object' && tauxCommission !== null) {
        // Pour la santé
        const commissionBase = primeNette * tauxCommission.commission_base;
        const commissionEvac = primeNette * tauxCommission.evacuation_sanitaire;
        const commissionRegul = primeNette * tauxCommission.commission_regulation;
        return commissionBase + commissionEvac + commissionRegul;
    }
    // Pour les autres types
    return primeNette * tauxCommission;
};

/**
 * Types de contrats qui supportent l'incorporation
 */
export const TYPES_INCORPORATION = [
    'FLOTTE',
    'SANTE_GROUPE',
    'SANTE_INDIVIDUELLE',
    'SANTE_FAMILIALE'
];

export const peutIncorporer = (contrat) => {
    if (contrat?.is_flotte) return true;

    const type = contrat?.type_contrat?.toUpperCase() || '';
    return TYPES_INCORPORATION.some(t => type.includes(t));
};

/**
 * Vérifier si c'est un contrat auto/flotte
 */
export const isAutoFlotte = (typeContrat) => {
    const type = typeContrat?.toUpperCase() || '';
    return type.includes('AUTO') || type.includes('MOTO') || type.includes('FLOTTE');
};