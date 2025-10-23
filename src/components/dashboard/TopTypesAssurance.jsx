// src/components/dashboard/TopTypesAssurance.jsx
import { formatCurrency } from '../../utils/dashboardHelpers';

export const TopTypesAssurance = ({ types }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Types d'assurance les plus rentables
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.slice(0, 6).map((type, index) => (
                    <div
                        key={index}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                                {type.name}
                            </h3>
                            <span
                                className={`px-2 py-1 rounded text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                        index === 1 ? 'bg-gray-400 text-white' :
                                            index === 2 ? 'bg-orange-600 text-white' :
                                                'bg-gray-300 text-gray-700'
                                    }`}
                            >
                                #{index + 1}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                            {formatCurrency(type.commission)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{type.count} contrats</p>
                    </div>
                ))}
            </div>
        </div>
    );
};