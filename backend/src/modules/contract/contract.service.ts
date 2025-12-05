import { prisma } from '../../core/prisma';

export class ContractService {
  async getAll() {
    // On garde pour l’instant la logique proche du SQL original
    const contrats = await prisma.$queryRawUnsafe<
      Array<Record<string, unknown>>
    >(
      `
        SELECT
          c.*,
          cl.nom  AS client_nom,
          cl.prenom AS client_prenom,
          co.nom  AS compagnie_nom,
          co.sigle AS compagnie_sigle
        FROM public.contrats c
        LEFT JOIN public.clients cl ON cl.id = c.client_id
        LEFT JOIN public.compagnies co ON co.id = c.compagnie_id
        ORDER BY c.date_effet DESC
      `,
    );

    return contrats;
  }
}


