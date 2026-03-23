// src/components/dashboard/KPICards.jsx
import { Users, BarChart3, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/dashboardHelpers';

type DashboardStats = {
    totalClients: number;
    clientsParticuliers: number;
    clientsEntreprises: number;
    tauxConversion: string | number;
    contratsActifs: number;
    contratsExpirants: number;
    commissionsEncaissees: number;
    commissionsTotal: number;
    commissionsEnAttente: number;
};

export const KPICards = ({ stats }: { stats: DashboardStats }) => {
    const kpis = [
        {
            titre: 'Clients totaux',
            valeur: stats.totalClients,
            subtext: `${stats.clientsParticuliers} particuliers • ${stats.clientsEntreprises} entreprises`,
            icon: <Users className="w-6 h-6" />,
            borderColor: 'border-blue-500',
            bgIcon: 'bg-blue-50 dark:bg-blue-900',
            iconColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            titre: 'Taux de conversion',
            valeur: `${stats.tauxConversion}%`,
            subtext: `${stats.contratsActifs} contrats actifs`,
            icon: <BarChart3 className="w-6 h-6" />,
            borderColor: 'border-emerald-500',
            bgIcon: 'bg-emerald-50 dark:bg-emerald-900',
            iconColor: 'text-emerald-600 dark:text-emerald-400'
        },
        {
            titre: 'Commissions encaissées',
            valeur: formatCurrency(stats.commissionsEncaissees),
            subtext: `Sur ${formatCurrency(stats.commissionsTotal)} total`,
            icon: <CheckCircle2 className="w-6 h-6" />,
            borderColor: 'border-purple-500',
            bgIcon: 'bg-purple-50 dark:bg-purple-900',
            iconColor: 'text-purple-600 dark:text-purple-400'
        },
        {
            titre: 'Commissions en attente',
            valeur: formatCurrency(stats.commissionsEnAttente),
            subtext: `${stats.contratsExpirants} contrats à renouveler`,
            icon: <Clock className="w-6 h-6" />,
            borderColor: 'border-amber-500',
            bgIcon: 'bg-amber-50 dark:bg-amber-900',
            iconColor: 'text-amber-600 dark:text-amber-400'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => (
                <div
                    key={index}
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow relative border-t-4 ${kpi.borderColor}`}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    {kpi.titre}
                                </h3>
                                <p className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
                                    {kpi.valeur}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-full ${kpi.bgIcon} flex items-center justify-center ${kpi.iconColor}`}>
                                {kpi.icon}
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {kpi.subtext}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};