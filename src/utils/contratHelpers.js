// src/utils/contratHelpers.js

// Vérifier si c'est un contrat santé
export const isSanteContract = (typeContrat) => {
    return typeContrat === 'SANTE_INDIVIDUELLE' || typeContrat === 'SANTE_FAMILIALE' || typeContrat === 'SANTE_GROUPE';
};

// Vérifier si c'est un contrat auto
export const isAutoContract = (typeContrat) => {
    return typeContrat?.includes('AUTO') || typeContrat?.includes('AUTOMOBILE') || typeContrat?.includes('FLOTTE');
};

// Calculer la date d'expiration
export const calculateExpirationDate = (dateEffet, fractionnement) => {
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
export const calculateCommission = (formData, tauxSante) => {
    const primeNette = parseFloat(formData.prime_nette) || 0;
    const montantAccessoire = parseFloat(formData.montant_accessoire) || 0;

    if (isSanteContract(formData.type_contrat) && tauxSante) {
        const evacuationSanitaire = parseFloat(formData.evacuation_sanitaire) || 0;
        const primeRegulation = parseFloat(formData.prime_regulation) || 0;

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
        const tauxCommission = parseFloat(formData.taux_commission) || 0;
        return (primeNette * tauxCommission) + montantAccessoire;
    }
};

// Badge de statut
export const getStatutBadge = (statut) => {
    const styles = {
        actif: 'bg-success-100 text-success-700',
        expiré: 'bg-gray-100 text-gray-700',
        annulé: 'bg-danger-100 text-danger-700',
    };
    return styles[statut] || 'bg-gray-100 text-gray-700';
};