// src/utils/dashboardHelpers.js

// Formater les montants en FCFA
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(amount) + ' FCFA';
};

// Calculer le pourcentage
export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
};

// Obtenir la date limite (X jours dans le futur)
export const getDateLimit = (days) => {
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
export const isInMonth = (date, monthDate) => {
    const d = new Date(date);
    return d.getMonth() === monthDate.getMonth() &&
        d.getFullYear() === monthDate.getFullYear();
};

// Calculer les statistiques de base
export const calculateBaseStats = (clients, contrats, paiements) => {
    const clientsParticuliers = clients.filter(c => c.type_client === 'particulier').length;
    const clientsEntreprises = clients.filter(c => c.type_client === 'entreprise').length;

    const commissionsTotal = contrats.reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);

    const commissionsEncaissees = paiements
        .filter(p => p.type_paiement === 'commission_compagnie' && p.date_paiement)
        .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);

    const commissionsEnAttente = commissionsTotal - commissionsEncaissees;

    const primesEncaissees = paiements
        .filter(p => p.type_paiement === 'client_prime' && p.date_paiement)
        .reduce((sum, p) => sum + parseFloat(p.montant), 0);

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
export const calculateClientsEvolution = (clients) => {
    const months = getLast6Months();

    return months.map(({ date, label }) => {
        const count = clients.filter(c => isInMonth(c.created_at, date)).length;
        return { mois: label, clients: count };
    });
};

// Calculer l'évolution des commissions sur 6 mois
export const calculateCommissionsEvolution = (contrats, paiements) => {
    const months = getLast6Months();

    return months.map(({ date, label }) => {
        const commissionsEncaissees = paiements.filter(p => {
            return p.type_paiement === 'commission_compagnie' &&
                isInMonth(p.date_paiement, date);
        }).reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);

        const commissionsDues = contrats.filter(c => {
            return isInMonth(c.created_at, date);
        }).reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);

        return {
            mois: label,
            encaissees: commissionsEncaissees,
            dues: commissionsDues,
            enAttente: commissionsDues - commissionsEncaissees
        };
    });
};

// Calculer la répartition par type d'assurance
export const calculateTypeDistribution = (contrats) => {
    const typesMap = {};

    contrats.forEach(c => {
        const type = c.type_contrat.replace(/_/g, ' ');
        if (!typesMap[type]) typesMap[type] = { commission: 0, count: 0 };
        typesMap[type].commission += parseFloat(c.commission || 0);
        typesMap[type].count += 1;
    });

    return Object.entries(typesMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.commission - a.commission);
};

// Calculer la performance par compagnie
export const calculateCompanyPerformance = (contrats, compagnies, paiements) => {
    const compagniesMap = {};

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

            const commission = parseFloat(c.commission || 0);
            compagniesMap[compagnie.nom].commission += commission;
            compagniesMap[compagnie.nom].count += 1;

            const encaissee = paiements
                .filter(p => p.contrat_id === c.id && p.type_paiement === 'commission_compagnie')
                .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);

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
export const calculateTopClients = (clients, contrats, type, limit = 5) => {
    const clientsAvecCommissions = clients.map(client => {
        const totalCommission = contrats
            .filter(c => c.client_id === client.id)
            .reduce((sum, c) => sum + parseFloat(c.commission || 0), 0);
        return { ...client, totalCommission };
    });

    return clientsAvecCommissions
        .filter(c => c.type_client === type)
        .sort((a, b) => b.totalCommission - a.totalCommission)
        .slice(0, limit);
};