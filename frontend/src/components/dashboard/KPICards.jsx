// src/components/dashboard/KPICards.jsx
import { formatCurrency } from '../../utils/dashboardHelpers';

export const KPICards = ({ stats }) => {
    const kpis = [
        {
            titre: 'Clients totaux',
            valeur: stats.totalClients,
            subtext: `${stats.clientsParticuliers} particuliers • ${stats.clientsEntreprises} entreprises`,
            icon: '👥',
            color: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50 dark:bg-blue-900',
            textColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            titre: 'Taux de conversion',
            valeur: `${stats.tauxConversion}%`,
            subtext: `${stats.contratsActifs} contrats actifs`,
            icon: '📊',
            color: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50 dark:bg-green-900',
            textColor: 'text-green-600 dark:text-green-400'
        },
        {
            titre: 'Commissions encaissées',
            valeur: formatCurrency(stats.commissionsEncaissees),
            subtext: `Sur ${formatCurrency(stats.commissionsTotal)} total`,
            icon: '✅',
            color: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50 dark:bg-purple-900',
            textColor: 'text-purple-600 dark:text-purple-400'
        },
        {
            titre: 'Commissions en attente',
            valeur: formatCurrency(stats.commissionsEnAttente),
            subtext: `${stats.contratsExpirants} contrats à renouveler`,
            icon: '⏳',
            color: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-50 dark:bg-orange-900',
            textColor: 'text-orange-600 dark:text-orange-400'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-shadow"
                >
                    <div className={`h-2 bg-gradient-to-r ${kpi.color}`}></div>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg ${kpi.bgLight} flex items-center justify-center text-2xl`}>
                                {kpi.icon}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{kpi.titre}</p>
                        <p className={`text-2xl font-bold ${kpi.textColor} mb-1`}>{kpi.valeur}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{kpi.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};