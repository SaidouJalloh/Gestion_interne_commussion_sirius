// src/hooks/useContratForm.js
import { useState, useEffect } from 'react';
import { calculateExpirationDate, calculateCommission, isSanteContract } from '../utils/contratHelpers';

const initialFormState = {
    client_id: '',
    compagnie_id: '',
    type_contrat: '',
    immatriculation: '',
    prime_nette: '',
    montant_accessoire: '0',
    taux_commission: '',
    commission: '0',
    date_effet: '',
    date_expiration: '',
    fractionnement: 'annuel',
    statut: 'actif',
    notes: '',
    client_telephone: '',
    client_email: '',
    evacuation_sanitaire: '',
    prime_regulation: '',
};

export const useContratForm = (selectedContrat, clients, compagnies) => {
    const [formData, setFormData] = useState(initialFormState);
    const [typesDisponibles, setTypesDisponibles] = useState([]);
    const [tauxSante, setTauxSante] = useState(null);

    // Charger les types disponibles
    useEffect(() => {
        if (formData.compagnie_id) {
            const compagnie = compagnies.find(c => c.id === formData.compagnie_id);
            if (compagnie?.taux_commissions) {
                setTypesDisponibles(Object.keys(compagnie.taux_commissions));
            } else {
                setTypesDisponibles([]);
            }
        } else {
            setTypesDisponibles([]);
            setTauxSante(null);
        }
    }, [formData.compagnie_id, compagnies]);

    // Charger les taux
    useEffect(() => {
        if (formData.compagnie_id && formData.type_contrat) {
            const compagnie = compagnies.find(c => c.id === formData.compagnie_id);

            if (compagnie?.taux_commissions?.[formData.type_contrat]) {
                const tauxConfig = compagnie.taux_commissions[formData.type_contrat];

                if (isSanteContract(formData.type_contrat) && typeof tauxConfig === 'object') {
                    setTauxSante({
                        commission_base: tauxConfig.commission_base || 0.16,
                        evacuation_sanitaire: tauxConfig.evacuation_sanitaire || 0.08,
                        commission_regulation: tauxConfig.commission_regulation || 0.16
                    });
                    setFormData(prev => ({
                        ...prev,
                        taux_commission: tauxConfig.commission_base || 0.16
                    }));
                } else {
                    setTauxSante(null);
                    setFormData(prev => ({
                        ...prev,
                        taux_commission: tauxConfig
                    }));
                }
            }
        }
    }, [formData.type_contrat, formData.compagnie_id, compagnies]);

    // Calculer la commission
    useEffect(() => {
        if (!formData.prime_nette || !formData.taux_commission) return;

        const commission = calculateCommission(formData, tauxSante);
        setFormData(prev => ({ ...prev, commission: commission.toFixed(2) }));
    }, [
        formData.prime_nette,
        formData.taux_commission,
        formData.montant_accessoire,
        formData.type_contrat,
        formData.evacuation_sanitaire,
        formData.prime_regulation,
        tauxSante
    ]);

    // Calculer la date d'expiration
    useEffect(() => {
        if (!selectedContrat && formData.date_effet && formData.fractionnement) {
            const newExpirationDate = calculateExpirationDate(formData.date_effet, formData.fractionnement);
            setFormData(prev => ({ ...prev, date_expiration: newExpirationDate }));
        }
    }, [formData.date_effet, formData.fractionnement, selectedContrat]);

    // Mettre à jour les champs client
    useEffect(() => {
        if (formData.client_id) {
            const selectedClient = clients.find(c => c.id === formData.client_id);
            if (selectedClient) {
                setFormData(prev => ({
                    ...prev,
                    client_telephone: selectedClient.telephone || '',
                    client_email: selectedClient.email || '',
                }));
            }
        }
    }, [formData.client_id, clients]);

    const resetForm = () => {
        setFormData(initialFormState);
        setTypesDisponibles([]);
        setTauxSante(null);
    };

    return { formData, setFormData, typesDisponibles, tauxSante, resetForm };
};