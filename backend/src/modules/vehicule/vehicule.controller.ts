import type { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../utils/apiResponse';
import { VehiculeService } from './vehicule.service';
import type {
  CreateVehiculeInput,
  UpdateVehiculeInput,
  VehiculeIdParams,
  VehiculesListQuery,
} from './vehicule.validation';

const service = new VehiculeService();

export class VehiculeController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as VehiculesListQuery;
      const vehicules = await service.getAll(query);
      res.json(apiResponse.success(vehicules));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as VehiculeIdParams;
      const vehicule = await service.getById(id);
      if (!vehicule) {
        res.status(404).json(apiResponse.error('Véhicule non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(vehicule));
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateVehiculeInput;
      const created = await service.create(payload);
      res.status(201).json(apiResponse.success(created));
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as VehiculeIdParams;
      const payload = req.body as UpdateVehiculeInput;
      const updated = await service.update(id, payload);
      if (!updated) {
        res.status(404).json(apiResponse.error('Véhicule non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(updated));
    } catch (e) {
      next(e);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as VehiculeIdParams;
      const deleted = await service.softDelete(id);
      if (!deleted) {
        res.status(404).json(apiResponse.error('Véhicule non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success({ id }));
    } catch (e) {
      next(e);
    }
  }
}

export const vehiculeController = new VehiculeController();

