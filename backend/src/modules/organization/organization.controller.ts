import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
import { OrganizationService } from './organization.service';
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  OrganizationIdParams,
  MemberIdParams,
} from './organization.validation';

const service = new OrganizationService();

export class OrganizationController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateOrganizationInput;
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      const created = await service.create({
        ...payload,
        logo_url: payload.logo_url ?? undefined,
        created_by: userId,
      });
      res.status(201).json(apiResponse.success(created));
    } catch (e) {
      next(e);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      const organizations = await service.getAllByUserId(userId);
      res.json(apiResponse.success(organizations));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as OrganizationIdParams;
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      const organization = await service.getById(id, userId);
      if (!organization) {
        res.status(404).json(
          apiResponse.error('Organisation non trouvée', 'NOT_FOUND'),
        );
        return;
      }
      res.json(apiResponse.success(organization));
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as OrganizationIdParams;
      const payload = req.body as UpdateOrganizationInput;
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      const updated = await service.update(id, userId, {
        ...payload,
        logo_url: payload.logo_url ?? undefined,
      });
      res.json(apiResponse.success(updated));
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as OrganizationIdParams;
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      await service.delete(id, userId);
      res.json(apiResponse.success({ id }));
    } catch (e) {
      next(e);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as OrganizationIdParams;
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      const members = await service.getMembers(id, userId);
      res.json(apiResponse.success(members));
    } catch (e) {
      next(e);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as OrganizationIdParams;
      const payload = req.body as InviteMemberInput;
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      const invitation = await service.inviteMemberByUserId(
        id,
        userId,
        payload.user_id,
        payload.role,
      );
      res.status(201).json(apiResponse.success(invitation));
    } catch (e) {
      next(e);
    }
  }

  async updateMemberRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id, memberId } = req.params as unknown as MemberIdParams & {
        id: string;
      };
      const payload = req.body as UpdateMemberRoleInput;
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      const updated = await service.updateMemberRole(id, userId, memberId, payload);
      res.json(apiResponse.success(updated));
    } catch (e) {
      next(e);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, memberId } = req.params as unknown as MemberIdParams & {
        id: string;
      };
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      await service.removeMember(id, userId, memberId);
      res.json(apiResponse.success({ memberId }));
    } catch (e) {
      next(e);
    }
  }

  async acceptInvitation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as unknown as OrganizationIdParams;
      const userId = req.tenant?.userId;

      if (!userId) {
        res.status(401).json(
          apiResponse.error('Utilisateur non authentifié', 'UNAUTHORIZED'),
        );
        return;
      }

      const membership = await service.acceptInvitation(id, userId);
      res.json(apiResponse.success(membership));
    } catch (e) {
      next(e);
    }
  }
}

export const organizationController = new OrganizationController();
