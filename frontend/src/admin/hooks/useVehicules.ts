import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';
import { useOrganization } from '../../context/OrganizationContext';

type VehiculeLike = Record<string, unknown> & {
    id: string;
    immatriculation: string;
    actif?: boolean | null;
    tempId?: number;
};

export const useVehicules = (contratId?: string | null) => {
    const { currentOrganization } = useOrganization();
    const [vehicules, setVehicules] = useState<VehiculeLike[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchVehicules = useCallback(async () => {
        if (!contratId || !currentOrganization) {
            setVehicules([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('contratId', contratId);
            params.set('active', 'true');
            const url = `${API_ENDPOINTS.vehicules.list}?${params.toString()}`;

            const data = await apiRequest<unknown>(url);
            setVehicules((Array.isArray(data) ? data : []) as VehiculeLike[]);
        } catch (error) {
            console.error('Erreur fetch véhicules:', error);
            toast.error('Erreur lors du chargement des véhicules');
        } finally {
            setLoading(false);
        }
    }, [contratId, currentOrganization]);

    const addVehicule = async (vehiculeData: Record<string, unknown>) => {
        try {
            const data = await apiRequest<VehiculeLike>(API_ENDPOINTS.vehicules.create, {
                method: 'POST',
                body: JSON.stringify({ ...vehiculeData, contrat_id: contratId }),
            });
            setVehicules(prev => [...prev, data]);
            toast.success('Véhicule ajouté ! 🚗');
            return { success: true, data };
        } catch (error) {
            console.error('Erreur ajout véhicule:', error);
            toast.error('Erreur lors de l\'ajout du véhicule');
            return { success: false, error };
        }
    };

    const updateVehicule = async (id: string, vehiculeData: Record<string, unknown>) => {
        try {
            const data = await apiRequest<VehiculeLike>(API_ENDPOINTS.vehicules.update(id), {
                method: 'PUT',
                body: JSON.stringify(vehiculeData),
            });
            setVehicules(prev => prev.map(v => v.id === id ? data : v));
            toast.success('Véhicule modifié ! ✏️');
            return { success: true, data };
        } catch (error) {
            console.error('Erreur modification véhicule:', error);
            toast.error('Erreur lors de la modification');
            return { success: false, error };
        }
    };

    const deleteVehicule = async (id: string) => {
        try {
            await apiRequest(API_ENDPOINTS.vehicules.delete(id), { method: 'DELETE' });
            setVehicules(prev => prev.filter(v => v.id !== id));
            toast.success('Véhicule supprimé ! 🗑️');
            return { success: true };
        } catch (error) {
            console.error('Erreur suppression véhicule:', error);
            toast.error('Erreur lors de la suppression');
            return { success: false, error };
        }
    };

    useEffect(() => {
        fetchVehicules();
    }, [fetchVehicules]);

    return {
        vehicules,
        loading,
        addVehicule,
        updateVehicule,
        deleteVehicule,
        refetch: fetchVehicules,
        count: vehicules.length
    };
};