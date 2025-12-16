/**
 * Calculer la prime nette (comme contrat normal)
 */
export const calculerPrimeNette = (
    primeTTC: string | number | null | undefined,
    fga: string | number | null | undefined,
    taxes: string | number | null | undefined,
    accessoire: string | number | null | undefined,
) => {
    const ttc = parseFloat(String(primeTTC ?? 0)) || 0;
    const fgaVal = parseFloat(String(fga ?? 0)) || 0;
    const taxesVal = parseFloat(String(taxes ?? 0)) || 0;
    const accessoireVal = parseFloat(String(accessoire ?? 0)) || 0;

    return ttc - fgaVal - taxesVal - accessoireVal;
};

/**
 * Calculer la commission
 */
export const calculerCommission = (
    primeNette: number,
    tauxCommission: number | { commission_base?: number; evacuation_sanitaire?: number; commission_regulation?: number } | null,
) => {
    if (typeof tauxCommission === 'object' && tauxCommission !== null) {
        // Pour la santé
        const commissionBase = primeNette * (tauxCommission.commission_base ?? 0);
        const commissionEvac = primeNette * (tauxCommission.evacuation_sanitaire ?? 0);
        const commissionRegul = primeNette * (tauxCommission.commission_regulation ?? 0);
        return commissionBase + commissionEvac + commissionRegul;
    }
    // Pour les autres types
    return primeNette * (tauxCommission ?? 0);
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

export const peutIncorporer = (contrat: { is_flotte?: boolean | null; type_contrat?: string | null } | null | undefined) => {
    if (contrat?.is_flotte) return true;

    const type = contrat?.type_contrat?.toUpperCase() || '';
    return TYPES_INCORPORATION.some(t => type.includes(t));
};

/**
 * Vérifier si c'est un contrat auto/flotte
 */
export const isAutoFlotte = (typeContrat?: string | null) => {
    const type = typeContrat?.toUpperCase() || '';
    return type.includes('AUTO') || type.includes('MOTO') || type.includes('FLOTTE');
};