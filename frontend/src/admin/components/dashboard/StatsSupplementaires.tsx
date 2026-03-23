// src/components/dashboard/StatsSupplementaires.jsx
import { Users, Building2, Banknote } from 'lucide-react';
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
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-blue-100">Clients Particuliers</h3>
                    <Users className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-4xl font-mono font-bold mb-2">{stats.clientsParticuliers}</p>
                <p className="text-blue-100 text-sm font-medium">
                    {calculatePercentage(stats.clientsParticuliers, stats.totalClients)}% du total
                </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-purple-100">Clients Entreprises</h3>
                    <Building2 className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-4xl font-mono font-bold mb-2">{stats.clientsEntreprises}</p>
                <p className="text-purple-100 text-sm font-medium">
                    {calculatePercentage(stats.clientsEntreprises, stats.totalClients)}% du total
                </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-emerald-100">Primes Encaissées</h3>
                    <Banknote className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-2xl font-mono font-bold mb-2">{formatCurrency(stats.primesEncaissees)}</p>
                <p className="text-emerald-100 text-sm font-medium">Paiements clients reçus</p>
            </div>
        </div>
    );
};