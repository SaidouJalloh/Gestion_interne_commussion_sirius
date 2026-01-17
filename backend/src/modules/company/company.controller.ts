import type { Request, Response, NextFunction } from 'express';
import { CompanyService } from './company.service';
import { apiResponse } from '../../admin/utils/apiResponse';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyIdParams,
} from './company.validation';

const service = new CompanyService();

export class CompanyController {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const activeRaw = req.query.active;
      const hasSubscriptionLinkRaw = req.query.hasSubscriptionLink;

      const active =
        typeof activeRaw === 'string'
          ? activeRaw.trim().toLowerCase() === 'true'
          : undefined;

      const hasSubscriptionLink =
        typeof hasSubscriptionLinkRaw === 'string'
          ? hasSubscriptionLinkRaw.trim().toLowerCase() === 'true'
          : undefined;

      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }

      const compagnies = await service.getAll(organizationId, {
        active: typeof active === 'boolean' ? active : undefined,
        hasSubscriptionLink: !!hasSubscriptionLink,
      });
      res.json(apiResponse.success(compagnies));
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as unknown as CompanyIdParams;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const compagnie = await service.getById(id, organizationId);

      if (!compagnie) {
        res
          .status(404)
          .json(apiResponse.error('Compagnie non trouvée', 'NOT_FOUND'));
        return;
      }

      res.json(apiResponse.success(compagnie));
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const payload = req.body as CreateCompanyInput;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const compagnie = await service.create(payload, organizationId);
      res.status(201).json(apiResponse.success(compagnie));
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as unknown as CompanyIdParams;
      const payload = req.body as UpdateCompanyInput;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const updated = await service.update(id, payload, organizationId);

      if (!updated) {
        res
          .status(404)
          .json(apiResponse.error('Compagnie non trouvée', 'NOT_FOUND'));
        return;
      }

      res.json(apiResponse.success(updated));
    } catch (error) {
      next(error);
    }
  }

  async remove(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params as unknown as CompanyIdParams;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const deleted = await service.delete(id, organizationId);

      if (!deleted) {
        res
          .status(404)
          .json(apiResponse.error('Compagnie non trouvée', 'NOT_FOUND'));
        return;
      }

      res.json(apiResponse.success({ id }));
    } catch (error) {
      next(error);
    }
  }
}

export const companyController = new CompanyController();
