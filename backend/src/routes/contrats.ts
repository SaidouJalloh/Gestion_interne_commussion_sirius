import express, { Request, Response } from 'express';
import { prisma } from '../prismaClient';

const router = express.Router();

// GET /api/contrats
// Récupère la liste des contrats avec quelques colonnes clés
router.get('/', async (_req: Request, res: Response) => {
    try {
        const contrats = await prisma.$queryRawUnsafe(
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

        res.json(contrats);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erreur lors du chargement des contrats:', error);
        res.status(500).json({
            error: "Erreur serveur lors du chargement des contrats",
        });
    }
});

export default router;


