// src/components/dashboard/StatsSupplementaires.jsx
import { formatCurrency, calculatePercentage } from '../../utils/dashboardHelpers';

type DashboardStats = {
    totalClients: number;
    clientsParticuliers: number;
    clientsEntreprises: number;
    primesEncaissees: number;
};

export const StatsSupplementaires = ({ stats }: { stats: DashboardStats }) => {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-soft p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Clients Particuliers</h3>
                    <span className="text-3xl">👤</span>
                </div>
                <p className="text-4xl font-bold mb-2">{stats.clientsParticuliers}</p>
                <p className="text-blue-100 text-sm">
                    {calculatePercentage(stats.clientsParticuliers, stats.totalClients)}% du total
                </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-soft p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Clients Entreprises</h3>
                    <span className="text-3xl">🏢</span>
                </div>
                <p className="text-4xl font-bold mb-2">{stats.clientsEntreprises}</p>
                <p className="text-purple-100 text-sm">
                    {calculatePercentage(stats.clientsEntreprises, stats.totalClients)}% du total
                </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-soft p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Primes Encaissées</h3>
                    <span className="text-3xl">💵</span>
                </div>
                <p className="text-2xl font-bold mb-2">{formatCurrency(stats.primesEncaissees)}</p>
                <p className="text-green-100 text-sm">Paiements clients reçus</p>
            </div>
        </div>
    );
};