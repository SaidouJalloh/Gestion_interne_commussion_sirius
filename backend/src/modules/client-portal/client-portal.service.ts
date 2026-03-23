import { prisma } from '../../core/prisma';
import type { CreateSinistreInput, CreateDevisInput } from './client-portal.validation';

export class ClientPortalService {
  /**
   * Profil du client + infos organisation
   */
  async getProfile(clientId: string, organizationId: string) {
    const client = await prisma.clients.findFirst({
      where: { id: clientId, organization_id: organizationId },
      include: {
        organizations: {
          select: { id: true, name: true, slug: true, logo_url: true },
        },
      },
    });
    return client;
  }

  /**
   * Dashboard : stats agrégées pour le client
   */
  async getDashboard(clientId: string, organizationId: string) {
    const [
      contratsActifs,
      totalContrats,
      sinistresEnCours,
      totalSinistres,
      prochainRenouvellement,
      devisEnAttente,
    ] = await Promise.all([
      prisma.contrats.count({
        where: { client_id: clientId, organization_id: organizationId, statut: 'actif' },
      }),
      prisma.contrats.count({
        where: { client_id: clientId, organization_id: organizationId },
      }),
      prisma.sinistres.count({
        where: {
          client_id: clientId,
          organization_id: organizationId,
          statut: { in: ['recu', 'en_cours', 'expertise'] },
        },
      }),
      prisma.sinistres.count({
        where: { client_id: clientId, organization_id: organizationId },
      }),
      prisma.contrats.findFirst({
        where: {
          client_id: clientId,
          organization_id: organizationId,
          statut: 'actif',
          date_expiration: { gte: new Date() },
        },
        orderBy: { date_expiration: 'asc' },
        select: { date_expiration: true, type_contrat: true },
      }),
      prisma.devis_requests.count({
        where: {
          client_id: clientId,
          organization_id: organizationId,
          statut: 'nouveau',
        },
      }),
    ]);

    // Derniers contrats pour affichage rapide
    const derniersContrats = await prisma.contrats.findMany({
      where: { client_id: clientId, organization_id: organizationId },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        compagnies: { select: { nom: true, sigle: true, logo_url: true } },
      },
    });

    // Derniers sinistres pour affichage rapide
    const derniersSinistres = await prisma.sinistres.findMany({
      where: { client_id: clientId, organization_id: organizationId },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        numero_sinistre: true,
        type_sinistre: true,
        date_sinistre: true,
        statut: true,
        description: true,
      },
    });

    return {
      stats: {
        contrats_actifs: contratsActifs,
        total_contrats: totalContrats,
        sinistres_en_cours: sinistresEnCours,
        total_sinistres: totalSinistres,
        devis_en_attente: devisEnAttente,
        prochain_renouvellement: prochainRenouvellement,
      },
      derniers_contrats: derniersContrats,
      derniers_sinistres: derniersSinistres,
    };
  }

  /**
   * Liste des contrats du client
   */
  async getContrats(clientId: string, organizationId: string) {
    return prisma.contrats.findMany({
      where: { client_id: clientId, organization_id: organizationId },
      orderBy: { created_at: 'desc' },
      include: {
        compagnies: { select: { nom: true, sigle: true, logo_url: true } },
        vehicules: true,
      },
    });
  }

  /**
   * Détail d'un contrat (vérifie qu'il appartient au client)
   */
  async getContratById(contratId: string, clientId: string, organizationId: string) {
    return prisma.contrats.findFirst({
      where: {
        id: contratId,
        client_id: clientId,
        organization_id: organizationId,
      },
      include: {
        compagnies: { select: { nom: true, sigle: true, logo_url: true } },
        vehicules: true,
        paiements: { orderBy: { date_paiement: 'desc' } },
      },
    });
  }

  /**
   * Liste des sinistres du client
   */
  async getSinistres(clientId: string, organizationId: string) {
    return prisma.sinistres.findMany({
      where: { client_id: clientId, organization_id: organizationId },
      orderBy: { created_at: 'desc' },
      include: {
        contrats: { select: { type_contrat: true } },
        sinistres_historique: {
          where: { visible_client: true },
          orderBy: { created_at: 'desc' },
          take: 3,
        },
      },
    });
  }

  /**
   * Détail d'un sinistre avec historique, messages et documents
   */
  async getSinistreById(sinistreId: string, clientId: string, organizationId: string) {
    return prisma.sinistres.findFirst({
      where: {
        id: sinistreId,
        client_id: clientId,
        organization_id: organizationId,
      },
      include: {
        contrats: {
          select: { type_contrat: true, compagnies: { select: { nom: true, sigle: true } } },
        },
        sinistres_historique: {
          where: { visible_client: true },
          orderBy: { created_at: 'asc' },
        },
        sinistres_messages: {
          orderBy: { created_at: 'asc' },
        },
        sinistres_documents: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  /**
   * Déclarer un nouveau sinistre
   */
  async createSinistre(
    input: CreateSinistreInput,
    clientId: string,
    organizationId: string,
    userId: string,
  ) {
    // Vérifier que le contrat appartient au client
    const contrat = await prisma.contrats.findFirst({
      where: {
        id: input.contrat_id,
        client_id: clientId,
        organization_id: organizationId,
      },
    });

    if (!contrat) {
      const err = new Error('Contrat non trouvé ou ne vous appartient pas') as Error & { status?: number };
      err.status = 404;
      throw err;
    }

    // Générer un numéro de sinistre unique
    const count = await prisma.sinistres.count({
      where: { organization_id: organizationId },
    });
    const numero_sinistre = `SIN-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const sinistre = await prisma.sinistres.create({
      data: {
        organization_id: organizationId,
        client_id: clientId,
        contrat_id: input.contrat_id,
        compagnie_id: contrat.compagnie_id,
        numero_sinistre,
        type_sinistre: input.type_sinistre,
        date_sinistre: new Date(input.date_sinistre),
        heure_sinistre: input.heure_sinistre ? new Date(`1970-01-01T${input.heure_sinistre}`) : null,
        lieu_sinistre: input.lieu_sinistre,
        description: input.description,
        circonstances: input.circonstances ?? null,
        dommages_corporels: input.dommages_corporels ?? false,
        nombre_blesses: input.nombre_blesses ?? 0,
        dommages_materiels: input.dommages_materiels ?? false,
        montant_estime: input.montant_estime ?? null,
        vehicule_id: input.vehicule_id ?? null,
        vehicule_roulant: input.vehicule_roulant ?? null,
        tiers_impliques: (input.tiers_impliques ?? []) as any,
        statut: 'recu',
        priorite: 'normale',
        created_by: userId,
      },
    });

    // Créer l'entrée dans l'historique
    await prisma.sinistres_historique.create({
      data: {
        sinistre_id: sinistre.id,
        nouveau_statut: 'recu',
        commentaire: 'Déclaration de sinistre soumise via le portail client',
        visible_client: true,
      },
    });

    return sinistre;
  }

  /**
   * Envoyer un message sur un sinistre
   */
  async sendMessage(
    sinistreId: string,
    message: string,
    clientId: string,
    organizationId: string,
    userId: string,
    clientNom: string,
  ) {
    // Vérifier que le sinistre appartient au client
    const sinistre = await prisma.sinistres.findFirst({
      where: {
        id: sinistreId,
        client_id: clientId,
        organization_id: organizationId,
      },
    });

    if (!sinistre) {
      const err = new Error('Sinistre non trouvé') as Error & { status?: number };
      err.status = 404;
      throw err;
    }

    return prisma.sinistres_messages.create({
      data: {
        sinistre_id: sinistreId,
        expediteur: 'client',
        expediteur_id: userId,
        expediteur_nom: clientNom,
        message,
      },
    });
  }

  /**
   * Liste des demandes de devis
   */
  async getDevis(clientId: string, organizationId: string) {
    return prisma.devis_requests.findMany({
      where: { client_id: clientId, organization_id: organizationId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Soumettre une demande de devis
   */
  async createDevis(input: CreateDevisInput, clientId: string, organizationId: string) {
    return prisma.devis_requests.create({
      data: {
        organization_id: organizationId,
        client_id: clientId,
        type_assurance: input.type_assurance,
        details: input.details as any,
        statut: 'nouveau',
      },
    });
  }
}
