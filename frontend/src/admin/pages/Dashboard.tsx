
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KPICards } from '../components/dashboard/KPICards';
import { EvolutionCharts } from '../components/dashboard/EvolutionCharts';
import { TopTypesAssurance } from '../components/dashboard/TopTypesAssurance';
import { PerformanceCompagnies } from '../components/dashboard/PerformanceCompagnies';
import { TopClients } from '../components/dashboard/TopClients';
import { ActivitesRecentes } from '../components/dashboard/ActivitesRecentes';
import { StatsSupplementaires } from '../components/dashboard/StatsSupplementaires';

export default function Dashboard() {
    const { loading, stats, graphiques, activitesRecentes } = useDashboardData();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardHeader />

            <KPICards stats={stats} />

            <EvolutionCharts graphiques={graphiques} />

            <TopTypesAssurance types={graphiques.commissionsParType} />

            <PerformanceCompagnies compagnies={graphiques.performanceCompagnies} />

            <TopClients
                particuliers={graphiques.topClientsParticuliers}
                entreprises={graphiques.topClientsEntreprises}
            />

            <ActivitesRecentes activites={activitesRecentes} />

            <StatsSupplementaires stats={stats} />
        </div>
    );
}