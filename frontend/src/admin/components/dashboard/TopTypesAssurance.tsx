// src/components/dashboard/TopTypesAssurance.jsx
import { formatCurrency } from '../../utils/dashboardHelpers';

type TypeAssurancePerf = {
    name: string;
    commission: number;
    count: number;
};

export const TopTypesAssurance = ({ types }: { types: TypeAssurancePerf[] }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold font-title text-slate-800 dark:text-white mb-4">
                Types d'assurance les plus rentables
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.slice(0, 6).map((type, index) => (
                    <div
                        key={index}
                        className="bg-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-slate-100 dark:border-gray-700/50 hover:border-slate-200 dark:hover:border-gray-600 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-slate-800 dark:text-white capitalize">
                                {type.name}
                            </h3>
                            <span
                                className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${index === 0 ? 'bg-amber-500 text-white' :
                                    index === 1 ? 'bg-slate-400 text-white' :
                                        index === 2 ? 'bg-orange-600 text-white' :
                                            'bg-slate-200 text-slate-700'
                                    }`}
                            >
                                #{index + 1}
                            </span>
                        </div>
                        <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">
                            {formatCurrency(type.commission)}
                        </p>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{type.count} contrats</p>
                    </div>
                ))}
            </div>
        </div>
    );
};