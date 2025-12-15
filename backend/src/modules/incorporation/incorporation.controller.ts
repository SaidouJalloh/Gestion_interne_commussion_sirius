import type { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../utils/apiResponse';
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
      const incorporations = await service.getAll(query);
      res.json(apiResponse.success(incorporations));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as IncorporationIdParams;
      const incorp = await service.getById(id);
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
      const created = await service.create(payload);
      res.status(201).json(apiResponse.success(created));
    } catch (e) {
      next(e);
    }
  }
}

export const incorporationController = new IncorporationController();

