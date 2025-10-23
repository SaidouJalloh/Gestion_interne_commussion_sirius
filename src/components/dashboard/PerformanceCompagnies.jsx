// src/components/dashboard/PerformanceCompagnies.jsx
import { formatCurrency } from '../../utils/dashboardHelpers';

export const PerformanceCompagnies = ({ compagnies }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Performance par compagnie
            </h2>
            <div className="space-y-4">
                {compagnies.map((comp, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${index === 0 ? 'bg-yellow-500' :
                                    index === 1 ? 'bg-gray-400' :
                                        index === 2 ? 'bg-orange-600' :
                                            'bg-gray-300'
                                }`}
                        >
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">{comp.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{comp.count} contrats</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                {formatCurrency(comp.commission)}
                            </p>
                            <div className="flex gap-2 text-xs mt-1">
                                <span className="text-green-600 dark:text-green-400">
                                    ✓ {formatCurrency(comp.encaissee)}
                                </span>
                                <span className="text-orange-600 dark:text-orange-400">
                                    ⏳ {formatCurrency(comp.enAttente)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};