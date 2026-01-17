// src/components/dashboard/DashboardHeader.jsx
import { useNavigate } from 'react-router-dom';

export const DashboardHeader = () => {
    const navigate = useNavigate();

    const handleNewClient = () => {
        navigate('/org/clients', { state: { openModal: true } });
    };

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Vue d'ensemble de votre activité</p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handleNewClient}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    + Nouveau client
                </button>
                <button
                    onClick={() => navigate('/org/contrats')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    + Nouveau contrat
                </button>
            </div>
        </div>
    );
};