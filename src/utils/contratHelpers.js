// // src/utils/contratHelpers.js

// // Vérifier si c'est un contrat santé
// export const isSanteContract = (typeContrat) => {
//     return typeContrat === 'SANTE_INDIVIDUELLE' || typeContrat === 'SANTE_FAMILIALE' || typeContrat === 'SANTE_GROUPE';
// };

// // Vérifier si c'est un contrat auto
// // export const isAutoContract = (typeContrat) => {
// //     return typeContrat?.includes('AUTO') || typeContrat?.includes('AUTOMOBILE') || typeContrat?.includes('FLOTTE');
// // };

// export const isAutoContract = (typeContrat) => {
//     if (!typeContrat) return false;
//     const type = typeContrat.toUpperCase();
//     return type.includes('AUTO') ||
//         type.includes('AUTOMOBILE') ||
//         type.includes('MOTO') ||
//         type.includes('FLOTTE');
// };

// // Calculer la date d'expiration
// export const calculateExpirationDate = (dateEffet, fractionnement) => {
//     if (!dateEffet) return '';

//     const date = new Date(dateEffet);

//     switch (fractionnement) {
//         case 'mensuel':
//             date.setMonth(date.getMonth() + 1);
//             break;
//         case 'trimestriel':
//             date.setMonth(date.getMonth() + 3);
//             break;
//         case 'semestriel':
//             date.setMonth(date.getMonth() + 6);
//             break;
//         case 'annuel':
//         default:
//             date.setFullYear(date.getFullYear() + 1);
//             break;
//     }

//     date.setDate(date.getDate() - 1);
//     return date.toISOString().split('T')[0];
// };

// // Calculer la commission
// export const calculateCommission = (formData, tauxSante) => {
//     const primeNette = parseFloat(formData.prime_nette) || 0;
//     const montantAccessoire = parseFloat(formData.montant_accessoire) || 0;

//     if (isSanteContract(formData.type_contrat) && tauxSante) {
//         const evacuationSanitaire = parseFloat(formData.evacuation_sanitaire) || 0;
//         const primeRegulation = parseFloat(formData.prime_regulation) || 0;

//         if (primeRegulation > 0) {
//             return ((primeNette + primeRegulation) * tauxSante.commission_regulation)
//                 + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
//         } else if (evacuationSanitaire > 0) {
//             return (primeNette * tauxSante.commission_base)
//                 + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
//         } else {
//             return primeNette * tauxSante.commission_base;
//         }
//     } else {
//         const tauxCommission = parseFloat(formData.taux_commission) || 0;
//         return (primeNette * tauxCommission) + montantAccessoire;
//     }
// };

// // Badge de statut
// export const getStatutBadge = (statut) => {
//     const styles = {
//         actif: 'bg-success-100 text-success-700',
//         expiré: 'bg-gray-100 text-gray-700',
//         annulé: 'bg-danger-100 text-danger-700',
//     };
//     return styles[statut] || 'bg-gray-100 text-gray-700';
// };






// code opt
// src/utils/contratHelpers.js

// ✅ Fonction pour arrondir proprement (évite les 41999.98)
const round = (value) => {
    return Math.round(value * 100) / 100;
};

// Vérifier si c'est un contrat santé
export const isSanteContract = (typeContrat) => {
    if (!typeContrat) return false;
    const type = typeContrat.toUpperCase();
    return type.includes('SANTE');
};

// Vérifier si c'est un contrat auto/moto/flotte
export const isAutoContract = (typeContrat) => {
    if (!typeContrat) return false;
    const type = typeContrat.toUpperCase();
    return type.includes('AUTO') ||
        type.includes('AUTOMOBILE') ||
        type.includes('MOTO') ||
        type.includes('FLOTTE');
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

// ✅ Calculer la prime nette selon le type de contrat
export const calculatePrimeNette = (formData) => {
    const primeTtc = parseFloat(formData.prime_ttc) || 0;
    const taxes = parseFloat(formData.taxes) || 0;
    const accessoires = parseFloat(formData.montant_accessoire) || 0;

    let primeNette = 0;

    if (isAutoContract(formData.type_contrat)) {
        // Auto/Moto/Flotte : TTC - FGA - Taxes - Accessoires
        const fga = parseFloat(formData.fga) || 0;
        primeNette = primeTtc - fga - taxes - accessoires;
    } else if (isSanteContract(formData.type_contrat)) {
        // Santé : TTC - Taxes - Évacuation (pas d'accessoires)
        const evacuationSanitaire = parseFloat(formData.evacuation_sanitaire) || 0;
        primeNette = primeTtc - taxes - evacuationSanitaire;
    } else {
        // Autres : TTC - Taxes - Accessoires
        primeNette = primeTtc - taxes - accessoires;
    }

    return round(primeNette);
};

// ✅ Calculer la commission selon le type de contrat
export const calculateCommission = (formData, tauxSante) => {
    const primeNette = parseFloat(formData.prime_nette) || 0;
    const montantAccessoire = parseFloat(formData.montant_accessoire) || 0;

    let commission = 0;

    if (isSanteContract(formData.type_contrat) && tauxSante) {
        // SANTÉ : Formules spéciales (3 cas) - PAS d'accessoires
        const evacuationSanitaire = parseFloat(formData.evacuation_sanitaire) || 0;
        const primeRegulation = parseFloat(formData.prime_regulation) || 0;

        if (primeRegulation > 0) {
            // Cas exceptionnel : avec prime de régulation
            commission = ((primeNette + primeRegulation) * tauxSante.commission_regulation)
                + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
        } else if (evacuationSanitaire > 0) {
            // Cas normal : avec évacuation
            commission = (primeNette * tauxSante.commission_base)
                + (evacuationSanitaire * tauxSante.evacuation_sanitaire);
        } else {
            // Cas simple : sans évacuation
            commission = primeNette * tauxSante.commission_base;
        }
    } else {
        // AUTO / AUTRES : (Prime Nette × Taux) + Accessoires (si > 0)
        const tauxCommission = parseFloat(formData.taux_commission) || 0;
        commission = primeNette * tauxCommission;

        // Si accessoires > 0, on l'ajoute à la commission
        if (montantAccessoire > 0) {
            commission = commission + montantAccessoire;
        }
    }

    return round(commission);
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