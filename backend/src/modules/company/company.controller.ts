import type { Request, Response, NextFunction } from 'express';
import { CompanyService } from './company.service';
import { apiResponse } from '../../utils/apiResponse';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyIdParams,
} from './company.validation';

const service = new CompanyService();

export class CompanyController {
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const compagnies = await service.getAll();
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
      const compagnie = await service.getById(id);

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
      const compagnie = await service.create(payload);
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
      const updated = await service.update(id, payload);

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
      const deleted = await service.delete(id);

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
