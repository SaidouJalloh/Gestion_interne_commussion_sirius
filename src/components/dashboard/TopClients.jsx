// src/components/dashboard/TopClients.jsx
import { formatCurrency } from '../../utils/dashboardHelpers';

export const TopClients = ({ particuliers, entreprises }) => {
    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Top particuliers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Top clients particuliers
                </h2>
                <div className="space-y-3">
                    {particuliers.map((client, index) => (
                        <div
                            key={client.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {client.nom} {client.prenom}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {client.email || client.telephone}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-primary-600 dark:text-primary-400">
                                    {formatCurrency(client.totalCommission)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top entreprises */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Top clients entreprises
                </h2>
                <div className="space-y-3">
                    {entreprises.map((client, index) => (
                        <div
                            key={client.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {client.nom}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {client.email || client.telephone}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-primary-600 dark:text-primary-400">
                                    {formatCurrency(client.totalCommission)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};