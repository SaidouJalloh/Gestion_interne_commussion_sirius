// src/components/dashboard/EvolutionCharts.jsx
import { formatCurrency } from '../../utils/dashboardHelpers';

export const EvolutionCharts = ({ graphiques }) => {
    const maxClients = Math.max(...graphiques.evolutionClients.map(e => e.clients), 1);

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Évolution clients */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Évolution des clients (6 mois)
                </h2>
                <div className="space-y-3">
                    {graphiques.evolutionClients.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{item.mois}</span>
                                <span className="text-gray-600 dark:text-gray-400">{item.clients} nouveaux clients</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${(item.clients / maxClients) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Évolution commissions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Évolution commissions (6 mois)
                </h2>
                <div className="space-y-3">
                    {graphiques.evolutionCommissions.map((item, index) => (
                        <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{item.mois}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="bg-green-50 dark:bg-green-900 p-2 rounded">
                                    <p className="text-gray-600 dark:text-gray-400">Encaissées</p>
                                    <p className="font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(item.encaissees)}
                                    </p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded">
                                    <p className="text-gray-600 dark:text-gray-400">Dues</p>
                                    <p className="font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(item.dues)}
                                    </p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900 p-2 rounded">
                                    <p className="text-gray-600 dark:text-gray-400">En attente</p>
                                    <p className="font-bold text-orange-600 dark:text-orange-400">
                                        {formatCurrency(item.enAttente)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};