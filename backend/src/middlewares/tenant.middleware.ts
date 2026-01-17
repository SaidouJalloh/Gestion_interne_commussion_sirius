import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import { prisma } from '../core/prisma';
import { apiResponse } from '../admin/utils/apiResponse';

declare global {
  namespace Express {
    interface Request {
      tenant?: {
        organizationId: string;
        userId: string;
      };
    }
  }
}

// Initialisation lazy pour s'assurer que dotenv est chargé avant l'instanciation
let authServiceInstance: AuthService | null = null;

const getAuthService = (): AuthService => {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
};

/**
 * Middleware pour extraire et valider l'organization_id depuis les requêtes
 * 
 * Sources d'organization_id (par ordre de priorité):
 * 1. Header X-Organization-Id
 * 2. Token JWT (claim organization_id)
 * 3. Organisation par défaut de l'utilisateur (première organisation active)
 * 
 * Valide que l'utilisateur appartient à l'organisation avant de continuer
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Extraire le token JWT depuis le header Authorization
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
    } catch (error) {
      res.status(401).json(
        apiResponse.error('Token d\'authentification invalide', 'UNAUTHORIZED'),
      );
      return;
    }

    const userId = user.id;

    // 2. Extraire organization_id depuis différentes sources
    let organizationId: string | null = null;

    // Priorité 1: Header X-Organization-Id
    const headerOrgId = req.headers['x-organization-id'] as string | undefined;
    if (headerOrgId) {
      organizationId = headerOrgId;
    } else {
      // Priorité 2: Token JWT (claim organization_id)
      const tokenOrgId = (user.user_metadata as { organization_id?: string })
        ?.organization_id;
      if (tokenOrgId) {
        organizationId = tokenOrgId;
      } else {
        // Priorité 3: Organisation par défaut (première organisation active de l'utilisateur)
        const defaultOrg = await prisma.organization_members.findFirst({
          where: {
            user_id: userId,
            status: 'active',
          },
          orderBy: {
            created_at: 'asc',
          },
          select: {
            organization_id: true,
          },
        });

        if (defaultOrg) {
          organizationId = defaultOrg.organization_id;
        }
      }
    }

    // 3. Valider que l'utilisateur appartient à l'organisation
    if (!organizationId) {
      res.status(403).json(
        apiResponse.error(
          'Aucune organisation trouvée. Veuillez créer ou rejoindre une organisation.',
          'NO_ORGANIZATION',
        ),
      );
      return;
    }

    // Vérifier l'appartenance à l'organisation
    const membership = await prisma.organization_members.findFirst({
      where: {
        organization_id: organizationId,
        user_id: userId,
      },
    });

    if (!membership || membership.status !== 'active') {
      res.status(403).json(
        apiResponse.error(
          'Vous n\'avez pas accès à cette organisation',
          'FORBIDDEN',
        ),
      );
      return;
    }

    // 4. Ajouter l'organization_id et user_id au req pour usage dans les controllers/services
    req.tenant = {
      organizationId,
      userId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware optionnel pour les routes qui n'exigent pas d'organisation
 * (ex: création d'organisation, liste des organisations de l'utilisateur)
 */
export const optionalTenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Pas d'authentification requise pour cette route
      next();
      return;
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = await getAuthService().getUserFromToken(token);
    } catch (error) {
      // Token invalide mais route optionnelle, on continue sans tenant
      // Log pour debug
      console.error('❌ Erreur validation token dans optionalTenantMiddleware:', error);
      next();
      return;
    }

    const userId = user.id;
    console.log('✅ Token valide, userId:', userId);
    const headerOrgId = req.headers['x-organization-id'] as string | undefined;

    // Toujours définir req.tenant avec userId si le token est valide
    // Même sans organization_id (nécessaire pour créer une organisation)
    req.tenant = {
      userId,
      organizationId: '', // Vide si pas d'organisation fournie
    };

    if (headerOrgId) {
      // Vérifier l'appartenance si organization_id est fourni
      const membership = await prisma.organization_members.findFirst({
        where: {
          organization_id: headerOrgId,
          user_id: userId,
        },
      });

      if (membership && membership.status === 'active') {
        req.tenant.organizationId = headerOrgId;
      } else {
        // Si organization_id fourni mais pas membre, on garde userId mais pas organizationId
        req.tenant.organizationId = '';
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
