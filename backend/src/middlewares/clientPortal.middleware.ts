import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import { prisma } from '../core/prisma';
import { apiResponse } from '../admin/utils/apiResponse';

declare global {
  namespace Express {
    interface Request {
      clientPortal?: {
        clientId: string;
        organizationId: string;
        userId: string;
      };
    }
  }
}

let authServiceInstance: AuthService | null = null;

const getAuthService = (): AuthService => {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
};

/**
 * Middleware pour le portail client (assurés).
 *
 * Authentifie l'utilisateur via JWT Supabase puis vérifie qu'il est lié
 * à un enregistrement `clients` via le champ `user_id`.
 *
 * Set req.clientPortal = { clientId, organizationId, userId }
 */
export const clientPortalMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Extraire le token JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(
        apiResponse.error('Token d\'authentification manquant', 'UNAUTHORIZED'),
      );
      return;
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = await getAuthService().getUserFromToken(token);
    } catch {
      res.status(401).json(
        apiResponse.error('Token d\'authentification invalide', 'UNAUTHORIZED'),
      );
      return;
    }

    // 2. Chercher le client lié à cet utilisateur
    const client = await prisma.clients.findFirst({
      where: { user_id: user.id },
      select: {
        id: true,
        organization_id: true,
      },
    });

    if (!client) {
      res.status(403).json(
        apiResponse.error(
          'Aucun compte client associé à cet utilisateur',
          'NOT_A_CLIENT',
        ),
      );
      return;
    }

    // 3. Enrichir la requête
    req.clientPortal = {
      clientId: client.id,
      organizationId: client.organization_id,
      userId: user.id,
    };

    next();
  } catch (error) {
    next(error);
  }
};
