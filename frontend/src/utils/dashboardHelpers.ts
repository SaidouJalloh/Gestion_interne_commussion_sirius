// src/utils/dashboardHelpers.js

// Formater les montants en FCFA
export const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(amount)) + ' FCFA';
};

// Calculer le pourcentage
export const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
};

// Obtenir la date limite (X jours dans le futur)
export const getDateLimit = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

// Générer les 6 derniers mois
export const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push({
            date,
            label: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        });
    }
    return months;
};

// Vérifier si une date est dans un mois donné
export const isInMonth = (date: string | Date | null | undefined, monthDate: Date) => {
    if (!date) return false;
    const d = new Date(date);
    return d.getMonth() === monthDate.getMonth() &&
        d.getFullYear() === monthDate.getFullYear();
};

// Calculer les statistiques de base
type ClientLike = Record<string, unknown> & { type_client?: string; created_at?: string };
type ContratLike = Record<string, unknown> & {
    id?: string;
    client_id?: string;
    compagnie_id?: string;
    commission?: number | string | null;
    created_at?: string;
    type_contrat?: string;
};
type PaiementLike = Record<string, unknown> & {
    contrat_id?: string;
    type_paiement?: string;
    date_paiement?: string | null;
    montant?: number | string | null;
};

export const calculateBaseStats = (clients: ClientLike[], contrats: ContratLike[], paiements: PaiementLike[]) => {
    const clientsParticuliers = clients.filter(c => c.type_client === 'particulier').length;
    const clientsEntreprises = clients.filter(c => c.type_client === 'entreprise').length;

    const commissionsTotal = contrats.reduce((sum, c) => sum + parseFloat(String(c.commission ?? 0)), 0);

    const commissionsEncaissees = paiements
        .filter(p => p.type_paiement === 'commission_compagnie' && p.date_paiement)
        .reduce((sum, p) => sum + parseFloat(String(p.montant ?? 0)), 0);

    const commissionsEnAttente = commissionsTotal - commissionsEncaissees;

    const primesEncaissees = paiements
        .filter(p => p.type_paiement === 'client_prime' && p.date_paiement)
        .reduce((sum, p) => sum + parseFloat(String(p.montant ?? 0)), 0);

    const tauxConversion = clients.length > 0
        ? ((contrats.length / clients.length) * 100).toFixed(1)
        : 0;

    return {
        totalClients: clients.length,
        clientsParticuliers,
        clientsEntreprises,
        contratsActifs: contrats.length,
        commissionsTotal,
        commissionsEncaissees,
        commissionsEnAttente,
        primesEncaissees,
        tauxConversion
    };
};

// Calculer l'évolution des clients sur 6 mois
export const calculateClientsEvolution = (clients: ClientLike[]) => {
    const months = getLast6Months();

    return months.map(({ date, label }) => {
        const count = clients.filter(c => isInMonth(c.created_at, date)).length;
        return { mois: label, clients: count };
    });
};

// Calculer l'évolution des commissions sur 6 mois
export const calculateCommissionsEvolution = (contrats: ContratLike[], paiements: PaiementLike[]) => {
    const months = getLast6Months();

    return months.map(({ date, label }) => {
        const commissionsEncaissees = paiements.filter(p => {
            return p.type_paiement === 'commission_compagnie' &&
                isInMonth(p.date_paiement, date);
        }).reduce((sum, p) => sum + parseFloat(String(p.montant ?? 0)), 0);

        const commissionsDues = contrats.filter(c => {
            return isInMonth(c.created_at, date);
        }).reduce((sum, c) => sum + parseFloat(String(c.commission ?? 0)), 0);

        return {
            mois: label,
            encaissees: commissionsEncaissees,
            dues: commissionsDues,
            enAttente: commissionsDues - commissionsEncaissees
        };
    });
};

// Calculer la répartition par type d'assurance
export const calculateTypeDistribution = (contrats: ContratLike[]) => {
    const typesMap: Record<string, { commission: number; count: number }> = {};

    contrats.forEach(c => {
        const type = String(c.type_contrat ?? '').replace(/_/g, ' ');
        if (!typesMap[type]) typesMap[type] = { commission: 0, count: 0 };
        typesMap[type].commission += parseFloat(String(c.commission ?? 0));
        typesMap[type].count += 1;
    });

    return Object.entries(typesMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.commission - a.commission);
};

// Calculer la performance par compagnie
type CompagnieLike = Record<string, unknown> & { id: string; nom: string };

export const calculateCompanyPerformance = (contrats: ContratLike[], compagnies: CompagnieLike[], paiements: PaiementLike[]) => {
    const compagniesMap: Record<
        string,
        { commission: number; count: number; encaissee: number; enAttente: number }
    > = {};

    contrats.forEach(c => {
        const compagnie = compagnies?.find(comp => comp.id === c.compagnie_id);
        if (compagnie) {
            if (!compagniesMap[compagnie.nom]) {
                compagniesMap[compagnie.nom] = {
                    commission: 0,
                    count: 0,
                    encaissee: 0,
                    enAttente: 0
                };
            }

            const commission = parseFloat(String(c.commission ?? 0));
            compagniesMap[compagnie.nom].commission += commission;
            compagniesMap[compagnie.nom].count += 1;

            const encaissee = paiements
                .filter(p => p.contrat_id === c.id && p.type_paiement === 'commission_compagnie')
                .reduce((sum, p) => sum + parseFloat(String(p.montant ?? 0)), 0);

            compagniesMap[compagnie.nom].encaissee += encaissee;
            compagniesMap[compagnie.nom].enAttente += commission - encaissee;
        }
    });

    return Object.entries(compagniesMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.commission - a.commission)
        .slice(0, 5);
};

// Calculer les top clients
export const calculateTopClients = (clients: ClientLike[], contrats: ContratLike[], type: string, limit = 5) => {
    const clientsAvecCommissions = clients.map(client => {
        const totalCommission = contrats
            .filter(c => c.client_id === client.id)
            .reduce((sum, c) => sum + parseFloat(String(c.commission ?? 0)), 0);
        return { ...client, totalCommission };
    });

    return clientsAvecCommissions
        .filter(c => c.type_client === type)
        .sort((a, b) => b.totalCommission - a.totalCommission)
        .slice(0, limit);
};