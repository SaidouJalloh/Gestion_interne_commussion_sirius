import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { prisma } from '../../core/prisma';
import { apiResponse } from '../../admin/utils/apiResponse';

let authServiceInstance: AuthService | null = null;

const getAuthService = (): AuthService => {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
};

export class AuthController {
  /**
   * GET /api/auth/me
   * Retourne le profil de l'utilisateur connecte, enrichi avec son role
   * dans l'organisation courante (si X-Organization-Id est fourni).
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Extraire et valider le token
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

      // 2. Recuperer le profil
      const profile = await prisma.profiles.findUnique({
        where: { id: user.id },
      });

      if (!profile) {
        res.status(404).json(
          apiResponse.error('Profil non trouvé', 'PROFILE_NOT_FOUND'),
        );
        return;
      }

      // 3. Enrichir avec le role dans l'organisation courante
      const orgId = req.headers['x-organization-id'] as string | undefined;
      let organizationRole: string | null = null;
      let organizationMembership = null;

      if (orgId) {
        organizationMembership = await prisma.organization_members.findFirst({
          where: {
            organization_id: orgId,
            user_id: user.id,
            status: 'active',
          },
          select: {
            role: true,
            organization_id: true,
          },
        });
        organizationRole = organizationMembership?.role || null;
      }

      // 4. Retourner le profil complet
      res.json(apiResponse.success({
        ...profile,
        organization_role: organizationRole,
        organization_id: orgId || null,
      }));
    } catch (error) {
      next(error);
    }
  }
}
