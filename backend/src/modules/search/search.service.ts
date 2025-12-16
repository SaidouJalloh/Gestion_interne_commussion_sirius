import { prisma } from '../../core/prisma';

export type SearchResult = {
  clients: any[];
  contrats: any[];
  compagnies: any[];
  paiements: any[];
};

export class SearchService {
  async search(q: string, limit = 5): Promise<SearchResult> {
    const term = q.trim();

    const [clients, compagnies, contrats, paiements] = await Promise.all([
      prisma.clients.findMany({
        where: {
          OR: [
            { nom: { contains: term, mode: 'insensitive' } },
            { prenom: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { telephone: { contains: term, mode: 'insensitive' } },
          ],
        },
        orderBy: { created_at: 'desc' },
        take: limit,
      }),
      prisma.compagnies.findMany({
        where: {
          OR: [
            { nom: { contains: term, mode: 'insensitive' } },
            { sigle: { contains: term, mode: 'insensitive' } },
          ],
        },
        orderBy: { nom: 'asc' },
        take: limit,
      }),
      prisma.contrats.findMany({
        where: {
          OR: [
            { type_contrat: { contains: term, mode: 'insensitive' } },
            { immatriculation: { contains: term, mode: 'insensitive' } },
            { clients: { nom: { contains: term, mode: 'insensitive' } } },
            { clients: { prenom: { contains: term, mode: 'insensitive' } } },
            { compagnies: { nom: { contains: term, mode: 'insensitive' } } },
            { compagnies: { sigle: { contains: term, mode: 'insensitive' } } },
          ],
        },
        include: {
          clients: { select: { id: true, nom: true, prenom: true, type_client: true, email: true, telephone: true } },
          compagnies: { select: { id: true, nom: true, sigle: true } },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
      }),
      prisma.paiements.findMany({
        where: {
          OR: [
            { type_paiement: { contains: term, mode: 'insensitive' } },
            { mode_paiement: { contains: term, mode: 'insensitive' } },
            { notes: { contains: term, mode: 'insensitive' } },
            { contrats: { type_contrat: { contains: term, mode: 'insensitive' } } },
            { contrats: { clients: { nom: { contains: term, mode: 'insensitive' } } } },
            { contrats: { clients: { prenom: { contains: term, mode: 'insensitive' } } } },
            { contrats: { compagnies: { nom: { contains: term, mode: 'insensitive' } } } },
            { contrats: { compagnies: { sigle: { contains: term, mode: 'insensitive' } } } },
          ],
        },
        include: {
          contrats: {
            include: {
              clients: { select: { id: true, nom: true, prenom: true } },
              compagnies: { select: { id: true, nom: true, sigle: true } },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
      }),
    ]);

    return { clients, contrats, compagnies, paiements };
  }
}

