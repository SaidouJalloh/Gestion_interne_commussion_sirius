// src/hooks/useContratCalculations.js
import { useEffect, useCallback } from 'react';
import { calculatePrimeNette, calculateCommission, isAutoContract } from '../utils/contratHelpers';

// ✅ Fonction pour arrondir proprement
const round = (value) => {
    return Math.round(value * 100) / 100;
};

export const useContratCalculations = (formData, setFormData, tauxSante) => {
    
    // ✅ Reset FGA si pas un contrat Auto
    useEffect(() => {
        if (formData.type_contrat && !isAutoContract(formData.type_contrat)) {
            if (parseFloat(formData.fga) !== 0) {
                setFormData(prev => ({ ...prev, fga: '0' }));
            }
        }
    }, [formData.type_contrat, formData.fga, setFormData]);

    // ✅ Calcul instantané de la Prime Nette
    useEffect(() => {
        if (!formData.prime_ttc) return;

        const newPrimeNette = calculatePrimeNette(formData);
        const currentPrimeNette = parseFloat(formData.prime_nette) || 0;

        // Éviter les boucles infinies
        if (round(newPrimeNette) !== round(currentPrimeNette)) {
            setFormData(prev => ({
                ...prev,
                prime_nette: newPrimeNette >= 0 ? String(newPrimeNette) : '0'
            }));
        }
    }, [
        formData.prime_ttc,
        formData.fga,
        formData.taxes,
        formData.montant_accessoire,
        formData.evacuation_sanitaire,
        formData.type_contrat,
        setFormData
    ]);

    // ✅ Calcul instantané de la Commission
    useEffect(() => {
        if (!formData.prime_nette || !formData.taux_commission) return;

        const newCommission = calculateCommission(formData, tauxSante);
        const currentCommission = parseFloat(formData.commission) || 0;

        // Éviter les boucles infinies
        if (round(newCommission) !== round(currentCommission)) {
            setFormData(prev => ({
                ...prev,
                commission: String(newCommission)
            }));
        }
    }, [
        formData.prime_nette,
        formData.taux_commission,
        formData.montant_accessoire,
        formData.type_contrat,
        formData.evacuation_sanitaire,
        formData.prime_regulation,
        tauxSante,
        setFormData
    ]);

    // ✅ Fonction de recalcul manuel si nécessaire
    const recalculateAll = useCallback(() => {
        const primeNette = calculatePrimeNette(formData);
        const updatedFormData = { ...formData, prime_nette: String(primeNette) };
        const commission = calculateCommission(updatedFormData, tauxSante);

        setFormData(prev => ({
            ...prev,
            prime_nette: primeNette >= 0 ? String(primeNette) : '0',
            commission: String(commission)
        }));
    }, [formData, tauxSante, setFormData]);

    return { recalculateAll };
};
