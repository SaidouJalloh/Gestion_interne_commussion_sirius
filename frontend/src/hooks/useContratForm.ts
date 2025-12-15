// src/hooks/useContratForm.ts
import { useEffect, useState } from 'react';
import {
  calculateCommission,
  calculateExpirationDate,
  isSanteContract,
} from '../utils/contratHelpers';

type ClientLike = {
  id: string;
  telephone?: string | null;
  email?: string | null;
};

type CompagnieLike = {
  id: string;
  taux_commissions?: Record<string, unknown> | null;
};

type TauxSante = {
  commission_base: number;
  evacuation_sanitaire: number;
  commission_regulation: number;
};

type SelectedContrat = Record<string, unknown> | null;

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

export const useContratForm = (
  selectedContrat: SelectedContrat,
  clients: ClientLike[],
  compagnies: CompagnieLike[],
) => {
    const [formData, setFormData] = useState(initialFormState);
    const [typesDisponibles, setTypesDisponibles] = useState<string[]>([]);
    const [tauxSante, setTauxSante] = useState<TauxSante | null>(null);

    // Charger les types disponibles
    useEffect(() => {
        if (formData.compagnie_id) {
            const compagnie = compagnies.find((c) => c.id === formData.compagnie_id);
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
            const compagnie = compagnies.find((c) => c.id === formData.compagnie_id);

            if (compagnie?.taux_commissions?.[formData.type_contrat]) {
                const tauxConfig = compagnie.taux_commissions[formData.type_contrat] as unknown;

                if (
                  isSanteContract(formData.type_contrat) &&
                  typeof tauxConfig === 'object' &&
                  tauxConfig !== null
                ) {
                    const santeCfg = tauxConfig as Partial<TauxSante> & Record<string, unknown>;
                    setTauxSante({
                        commission_base: (santeCfg.commission_base as number | undefined) ?? 0.16,
                        evacuation_sanitaire: (santeCfg.evacuation_sanitaire as number | undefined) ?? 0.08,
                        commission_regulation: (santeCfg.commission_regulation as number | undefined) ?? 0.16
                    });
                    setFormData(prev => ({
                        ...prev,
                        // formData.taux_commission est une string (les helpers font parseFloat)
                        taux_commission: String(
                          (santeCfg.commission_base as number | undefined) ?? 0.16,
                        )
                    }));
                } else {
                    setTauxSante(null);
                    setFormData(prev => ({
                        ...prev,
                        taux_commission: String(tauxConfig as unknown)
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
            const selectedClient = clients.find((c) => c.id === formData.client_id);
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