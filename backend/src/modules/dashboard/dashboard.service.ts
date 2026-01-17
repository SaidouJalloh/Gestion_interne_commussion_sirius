import { prisma } from '../../core/prisma';

const toNumberSafe = (value: unknown): number => {
    if (value === null || typeof value === 'undefined') return 0;
    // Prisma Decimal se sérialise en string via toString()
    const n = Number((value as any).toString?.() ?? value);
    return Number.isFinite(n) ? n : 0;
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const formatMonthLabel = (d: Date) =>
    d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

const getLastMonths = (count: number) => {
    const months: Date[] = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d);
    }
    return months;
};

export class DashboardService {
    async getDashboard(organizationId: string) {
        const [clients, contratsActifs, paiements, compagnies] = await Promise.all([
            prisma.clients.findMany({
                where: { organization_id: organizationId },
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    telephone: true,
                    type_client: true,
                    created_at: true,
                },
            }),
            prisma.contrats.findMany({
                where: { 
                    statut: 'actif',
                    organization_id: organizationId,
                },
                select: {
                    id: true,
                    client_id: true,
                    compagnie_id: true,
                    type_contrat: true,
                    commission: true,
                    created_at: true,
                    date_expiration: true,
                },
            }),
            prisma.paiements.findMany({
                where: { organization_id: organizationId },
                select: {
                    id: true,
                    contrat_id: true,
                    type_paiement: true,
                    montant: true,
                    date_paiement: true,
                    created_at: true,
                },
            }),
            prisma.compagnies.findMany({
                where: { organization_id: organizationId },
                select: { id: true, nom: true },
            }),
        ]);

        const totalClients = clients.length;
        const clientsParticuliers = clients.filter((c) => c.type_client === 'particulier').length;
        const clientsEntreprises = clients.filter((c) => c.type_client === 'entreprise').length;

        const commissionsTotal = contratsActifs.reduce((sum, c) => sum + toNumberSafe(c.commission), 0);

        const primesEncaissees = paiements
            .filter((p) => p.type_paiement === 'client_prime')
            .reduce((sum, p) => sum + toNumberSafe(p.montant), 0);

        const commissionsEncaissees = paiements
            .filter((p) => p.type_paiement === 'commission_compagnie')
            .reduce((sum, p) => sum + toNumberSafe(p.montant), 0);

        const commissionsEnAttente = commissionsTotal - commissionsEncaissees;

        const dateLimite = new Date();
        dateLimite.setDate(dateLimite.getDate() + 30);
        const today = new Date();

        const contratsExpirantsCount = contratsActifs.filter((c) => {
            const dateExp = new Date(c.date_expiration);
            return dateExp <= dateLimite && dateExp >= today;
        }).length;

        const tauxConversion =
            totalClients > 0 ? Number(((contratsActifs.length / totalClients) * 100).toFixed(1)) : 0;

        // Évolution clients (6 mois)
        const months = getLastMonths(6);
        const evolutionClients = months.map((m) => {
            const key = monthKey(m);
            const count = clients.filter((c) => {
                if (!c.created_at) return false;
                const d = new Date(c.created_at);
                return monthKey(d) === key;
            }).length;
            return { mois: formatMonthLabel(m), clients: count };
        });

        // Évolution commissions (6 mois)
        const evolutionCommissions = months.map((m) => {
            const key = monthKey(m);

            const encaissees = paiements
                .filter((p) => p.type_paiement === 'commission_compagnie')
                .filter((p) => monthKey(new Date(p.date_paiement)) === key)
                .reduce((sum, p) => sum + toNumberSafe(p.montant), 0);

            const dues = contratsActifs
                .filter((c) => c.created_at && monthKey(new Date(c.created_at)) === key)
                .reduce((sum, c) => sum + toNumberSafe(c.commission), 0);

            return {
                mois: formatMonthLabel(m),
                encaissees,
                dues,
                enAttente: dues - encaissees,
            };
        });

        // Types d'assurance (commission + count)
        const byType = new Map<string, { commission: number; count: number }>();
        for (const c of contratsActifs) {
            const name = (c.type_contrat || '').replace(/_/g, ' ');
            const prev = byType.get(name) ?? { commission: 0, count: 0 };
            prev.commission += toNumberSafe(c.commission);
            prev.count += 1;
            byType.set(name, prev);
        }
        const commissionsParType = Array.from(byType.entries())
            .map(([name, v]) => ({ name, commission: v.commission, count: v.count }))
            .sort((a, b) => b.commission - a.commission);

        // Performance compagnies
        const companyNameById = new Map(compagnies.map((c) => [c.id, c.nom]));
        const perfMap = new Map<
            string,
            { name: string; commission: number; count: number; encaissee: number; enAttente: number }
        >();

        for (const c of contratsActifs) {
            const name = companyNameById.get(c.compagnie_id) ?? 'Non défini';
            const row = perfMap.get(name) ?? {
                name,
                commission: 0,
                count: 0,
                encaissee: 0,
                enAttente: 0,
            };

            const commission = toNumberSafe(c.commission);
            row.commission += commission;
            row.count += 1;

            const enc = paiements
                .filter((p) => p.contrat_id === c.id && p.type_paiement === 'commission_compagnie')
                .reduce((sum, p) => sum + toNumberSafe(p.montant), 0);

            row.encaissee += enc;
            row.enAttente += commission - enc;

            perfMap.set(name, row);
        }

        const performanceCompagnies = Array.from(perfMap.values())
            .sort((a, b) => b.commission - a.commission)
            .slice(0, 5);

        // Top clients
        const commissionByClientId = new Map<string, number>();
        for (const c of contratsActifs) {
            commissionByClientId.set(
                c.client_id,
                (commissionByClientId.get(c.client_id) ?? 0) + toNumberSafe(c.commission),
            );
        }

        const clientsAvecCommissions = clients.map((c) => ({
            ...c,
            totalCommission: commissionByClientId.get(c.id) ?? 0,
        }));

        const topClientsParticuliers = clientsAvecCommissions
            .filter((c) => c.type_client === 'particulier')
            .sort((a, b) => b.totalCommission - a.totalCommission)
            .slice(0, 5);

        const topClientsEntreprises = clientsAvecCommissions
            .filter((c) => c.type_client === 'entreprise')
            .sort((a, b) => b.totalCommission - a.totalCommission)
            .slice(0, 5);

        // Activités récentes
        const [derniers_contrats, derniers_paiements, contrats_expirants] = await Promise.all([
            prisma.contrats.findMany({
                where: { organization_id: organizationId },
                orderBy: { created_at: 'desc' },
                take: 5,
                include: {
                    clients: { select: { nom: true, prenom: true, type_client: true } },
                    compagnies: { select: { nom: true } },
                },
            }),
            prisma.paiements.findMany({
                where: { organization_id: organizationId },
                orderBy: { created_at: 'desc' },
                take: 5,
                include: {
                    contrats: {
                        select: {
                            type_contrat: true,
                            clients: { select: { nom: true, prenom: true } },
                        },
                    },
                },
            }),
            prisma.contrats.findMany({
                where: {
                    statut: 'actif',
                    organization_id: organizationId,
                    date_expiration: {
                        gte: new Date(new Date().toISOString().split('T')[0]),
                        lte: dateLimite,
                    },
                },
                orderBy: { date_expiration: 'asc' },
                take: 5,
                include: {
                    clients: { select: { nom: true, prenom: true } },
                    compagnies: { select: { nom: true } },
                },
            }),
        ]);

        return {
            stats: {
                totalClients,
                clientsParticuliers,
                clientsEntreprises,
                contratsActifs: contratsActifs.length,
                commissionsTotal,
                commissionsEncaissees,
                commissionsEnAttente,
                primesEncaissees,
                contratsExpirants: contratsExpirantsCount,
                tauxConversion,
            },
            graphiques: {
                evolutionClients,
                evolutionCommissions,
                performanceCompagnies,
                topClientsParticuliers,
                topClientsEntreprises,
                commissionsParType,
            },
            activitesRecentes: {
                derniers_contrats,
                derniers_paiements,
                contrats_expirants,
            },
        };
    }
}








