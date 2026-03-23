// src/components/dashboard/DashboardHeader.jsx
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const DashboardHeader = () => {
    const navigate = useNavigate();

    const handleNewClient = () => {
        navigate('/org/clients', { state: { openModal: true } });
    };

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white font-title">Tableau de bord</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Vue d'ensemble de votre activité</p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={() => navigate('/org/contrats')}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau contrat
                </button>
                <button
                    onClick={handleNewClient}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau client
                </button>
            </div>
        </div>
    );
};