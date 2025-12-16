// src/utils/contratHelpers.js

// Vérifier si c'est un contrat santé
export const isSanteContract = (typeContrat: string) => {
    return typeContrat === 'SANTE_INDIVIDUELLE' || typeContrat === 'SANTE_FAMILIALE' || typeContrat === 'SANTE_GROUPE';
};

// Vérifier si c'est un contrat auto
// export const isAutoContract = (typeContrat) => {
//     return typeContrat?.includes('AUTO') || typeContrat?.includes('AUTOMOBILE') || typeContrat?.includes('FLOTTE');
// };

export const isAutoContract = (typeContrat?: string | null) => {
    if (!typeContrat) return false;
    const type = typeContrat.toUpperCase();
    return type.includes('AUTO') ||
        type.includes('AUTOMOBILE') ||
        type.includes('MOTO') ||
        type.includes('FLOTTE');
};

// Calculer la date d'expiration
export const calculateExpirationDate = (dateEffet: string, fractionnement: string) => {
    if (!dateEffet) return '';

    const date = new Date(dateEffet);

    switch (fractionnement) {
        case 'mensuel':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'trimestriel':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'semestriel':
            date.setMonth(date.getMonth() + 6);
            break;
        case 'annuel':
        default:
            date.setFullYear(date.getFullYear() + 1);
            break;
    }

    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
};

// Calculer la commission
type FormDataLike = Record<string, unknown> & {
    prime_nette?: string | number | null;
    montant_accessoire?: string | number | null;
    type_contrat?: string | null;
    evacuation_sanitaire?: string | number | null;
    prime_regulation?: string | number | null;
    taux_commission?: string | number | null;
};

type TauxSanteLike = {
    commission_base: number;
    evacuation_sanitaire: number;
    commission_regulation: number;
};

export const calculateCommission = (formData: FormDataLike, tauxSante?: TauxSanteLike | null) => {
    const primeNette = parseFloat(String(formData.prime_nette ?? 0)) || 0;
    const montantAccessoire = parseFloat(String(formData.montant_accessoire ?? 0)) || 0;

    if (formData.type_contrat && isSanteContract(formData.type_contrat) && tauxSante) {
        const evacuationSanitaire = parseFloat(String(formData.evacuation_sanitaire ?? 0)) || 0;
        const primeRegulation = parseFloat(String(formData.prime_regulation ?? 0)) || 0;

        if (primeRegulation > 0) {
            return ((primeNette + primeRegulation) * tauxSante.commission_regulation)
                + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
        } else if (evacuationSanitaire > 0) {
            return (primeNette * tauxSante.commission_base)
                + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
        } else {
            return primeNette * tauxSante.commission_base;
        }
    } else {
        const tauxCommission = parseFloat(String(formData.taux_commission ?? 0)) || 0;
        return (primeNette * tauxCommission) + montantAccessoire;
    }
};

// Badge de statut
export const getStatutBadge = (statut?: string | null) => {
    const styles = {
        actif: 'bg-success-100 text-success-700',
        expiré: 'bg-gray-100 text-gray-700',
        annulé: 'bg-danger-100 text-danger-700',
    };
    if (!statut) return 'bg-gray-100 text-gray-700';
    return (styles as Record<string, string>)[statut] || 'bg-gray-100 text-gray-700';
};