import type { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
import { IncorporationService } from './incorporation.service';
import type {
  CreateIncorporationInput,
  IncorporationIdParams,
  IncorporationsListQuery,
} from './incorporation.validation';

const service = new IncorporationService();

export class IncorporationController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as IncorporationsListQuery;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const incorporations = await service.getAll(query, organizationId);
      res.json(apiResponse.success(incorporations));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as IncorporationIdParams;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const incorp = await service.getById(id, organizationId);
      if (!incorp) {
        res.status(404).json(apiResponse.error('Incorporation non trouvée', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(incorp));
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateIncorporationInput;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const created = await service.create(payload, organizationId);
      res.status(201).json(apiResponse.success(created));
    } catch (e) {
      next(e);
    }
  }
}

export const incorporationController = new IncorporationController();

