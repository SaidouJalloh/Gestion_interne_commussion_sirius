import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type DashboardStats = {
    totalClients: number;
    clientsParticuliers: number;
    clientsEntreprises: number;
    contratsActifs: number;
    commissionsTotal: number;
    commissionsEncaissees: number;
    commissionsEnAttente: number;
    primesEncaissees: number;
    contratsExpirants: number;
    tauxConversion: string | number;
};

type DashboardGraphiques = {
    commissionsParType: Array<{ name: string; commission: number; count: number }>;
    performanceCompagnies: Array<{ name: string; commission: number; encaissee: number; enAttente: number; count?: number }>;
    evolutionClients: Array<{ mois: string; clients: number }>;
    evolutionCommissions: Array<{ mois: string; encaissees: number; dues: number; enAttente: number }>;
};

// Export Dashboard en PDF
export const exportDashboardPDF = (stats: DashboardStats, graphiques: DashboardGraphiques) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Primary color
    doc.text('Rapport Dashboard - Sirius Assurance', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: 'center' });

    // Stats principales
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Statistiques Principales', 14, 40);

    const statsData = [
        ['Clients totaux', stats.totalClients],
        ['Clients particuliers', stats.clientsParticuliers],
        ['Clients entreprises', stats.clientsEntreprises],
        ['Contrats actifs', stats.contratsActifs],
        ['Taux de conversion', `${stats.tauxConversion}%`],
        ['Commissions totales', `${stats.commissionsTotal.toLocaleString('fr-FR')} FCFA`],
        ['Commissions encaissées', `${stats.commissionsEncaissees.toLocaleString('fr-FR')} FCFA`],
        ['Commissions en attente', `${stats.commissionsEnAttente.toLocaleString('fr-FR')} FCFA`],
        ['Primes encaissées', `${stats.primesEncaissees.toLocaleString('fr-FR')} FCFA`],
        ['Contrats à renouveler (30j)', stats.contratsExpirants]
    ];

    autoTable(doc, {
        startY: 45,
        head: [['Indicateur', 'Valeur']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
    });

    // Top types d'assurance
    let yPos = ((doc as any).lastAutoTable?.finalY ?? 45) + 15;
    doc.setFontSize(14);
    doc.text('Top Types d\'Assurance', 14, yPos);

    const typesData = graphiques.commissionsParType.slice(0, 5).map((type, index) => [
        `${index + 1}. ${type.name}`,
        `${type.commission.toLocaleString('fr-FR')} FCFA`,
        `${type.count} contrats`
    ]);

    autoTable(doc, {
        startY: yPos + 5,
        head: [['Type', 'Commission', 'Nombre']],
        body: typesData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
    });

    // Top compagnies
    yPos = ((doc as any).lastAutoTable?.finalY ?? yPos) + 15;

    // Nouvelle page si nécessaire
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Top Compagnies', 14, yPos);

    const compagniesData = graphiques.performanceCompagnies.map((comp, index) => [
        `${index + 1}. ${comp.name}`,
        `${comp.commission.toLocaleString('fr-FR')} FCFA`,
        `${comp.encaissee.toLocaleString('fr-FR')} FCFA`,
        `${comp.enAttente.toLocaleString('fr-FR')} FCFA`
    ]);

    autoTable(doc, {
        startY: yPos + 5,
        head: [['Compagnie', 'Total', 'Encaissé', 'En attente']],
        body: compagniesData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
    });

    // Sauvegarder
    doc.save(`rapport-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Dashboard en Excel
export const exportDashboardExcel = (stats: DashboardStats, graphiques: DashboardGraphiques) => {
    const wb = XLSX.utils.book_new();

    // Feuille 1: Stats principales
    const statsSheet = [
        ['RAPPORT DASHBOARD - SIRIUS ASSURANCE'],
        [`Généré le ${new Date().toLocaleDateString('fr-FR')}`],
        [],
        ['Indicateur', 'Valeur'],
        ['Clients totaux', stats.totalClients],
        ['Clients particuliers', stats.clientsParticuliers],
        ['Clients entreprises', stats.clientsEntreprises],
        ['Contrats actifs', stats.contratsActifs],
        ['Taux de conversion', `${stats.tauxConversion}%`],
        ['Commissions totales', stats.commissionsTotal],
        ['Commissions encaissées', stats.commissionsEncaissees],
        ['Commissions en attente', stats.commissionsEnAttente],
        ['Primes encaissées', stats.primesEncaissees],
        ['Contrats à renouveler', stats.contratsExpirants]
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(statsSheet);
    XLSX.utils.book_append_sheet(wb, ws1, 'Statistiques');

    // Feuille 2: Types d'assurance
    const typesData = [
        ['Rang', 'Type', 'Commission (FCFA)', 'Nombre de contrats'],
        ...graphiques.commissionsParType.map((type, index) => [
            index + 1,
            type.name,
            type.commission,
            type.count
        ])
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(typesData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Types Assurance');

    // Feuille 3: Compagnies
    const compagniesData = [
        ['Rang', 'Compagnie', 'Total (FCFA)', 'Encaissé (FCFA)', 'En attente (FCFA)', 'Contrats'],
        ...graphiques.performanceCompagnies.map((comp, index) => [
            index + 1,
            comp.name,
            comp.commission,
            comp.encaissee,
            comp.enAttente,
            comp.count
        ])
    ];

    const ws3 = XLSX.utils.aoa_to_sheet(compagniesData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Compagnies');

    // Feuille 4: Évolution clients
    const evolutionData = [
        ['Mois', 'Nouveaux clients'],
        ...graphiques.evolutionClients.map((item) => [item.mois, item.clients])
    ];

    const ws4 = XLSX.utils.aoa_to_sheet(evolutionData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Evolution Clients');

    // Feuille 5: Évolution commissions
    const commissionsData = [
        ['Mois', 'Encaissées (FCFA)', 'Dues (FCFA)', 'En attente (FCFA)'],
        ...graphiques.evolutionCommissions.map((item) => [
            item.mois,
            item.encaissees,
            item.dues,
            item.enAttente
        ])
    ];

    const ws5 = XLSX.utils.aoa_to_sheet(commissionsData);
    XLSX.utils.book_append_sheet(wb, ws5, 'Evolution Commissions');

    // Télécharger
    XLSX.writeFile(wb, `rapport-dashboard-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export liste clients en Excel
export const exportClientsExcel = (clients: unknown[]) => {
    const list = Array.isArray(clients) ? (clients as Array<Record<string, unknown>>) : [];
    const data = [
        ['ID', 'Nom', 'Prénom', 'Type', 'Email', 'Téléphone', 'Ville', 'Date création'],
        ...list.map((client) => [
            (client as any).id,
            (client as any).nom,
            (client as any).prenom,
            (client as any).type_client,
            (client as any).email || '',
            (client as any).telephone || '',
            (client as any).ville || '',
            (client as any).created_at ? new Date((client as any).created_at).toLocaleDateString('fr-FR') : ''
        ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, `clients-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export liste contrats en Excel
export const exportContratsExcel = (contrats: unknown[]) => {
    const list = Array.isArray(contrats) ? (contrats as Array<Record<string, unknown>>) : [];
    const data = [
        ['Client', 'Compagnie', 'Type', 'Prime nette', 'Commission', 'Statut', 'Date effet', 'Date expiration'],
        ...list.map((contrat) => [
            `${(contrat as any).clients?.nom ?? ''} ${(contrat as any).clients?.prenom ?? ''}`.trim(),
            (contrat as any).compagnies?.nom || '',
            (contrat as any).type_contrat,
            (contrat as any).prime_nette,
            (contrat as any).commission,
            (contrat as any).statut,
            (contrat as any).date_effet ? new Date((contrat as any).date_effet).toLocaleDateString('fr-FR') : '',
            (contrat as any).date_expiration ? new Date((contrat as any).date_expiration).toLocaleDateString('fr-FR') : ''
        ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contrats');
    XLSX.writeFile(wb, `contrats-${new Date().toISOString().split('T')[0]}.xlsx`);
};