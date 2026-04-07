import type { Request, Response, NextFunction } from 'express';
import { InsuranceProviderService } from './insurance-provider.service';
import { apiResponse } from '../../admin/utils/apiResponse';
import type { SimulateInput, ReferentielQuery, CompagnieIdParam } from './insurance-provider.validation';
import type { SimulationParams, ReferentielParams } from './provider.interface';

const service = new InsuranceProviderService();

export class InsuranceProviderController {
  async simulate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(apiResponse.error('Organisation requise', 'FORBIDDEN'));
        return;
      }

      const input = req.body as SimulateInput;

      const simulationParams = {
        type: input.type,
        params: input.params,
      } as unknown as SimulationParams;

      const result = await service.simulate(
        input.compagnie_id,
        organizationId,
        simulationParams,
      );

      res.json(apiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async getReferentiel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(apiResponse.error('Organisation requise', 'FORBIDDEN'));
        return;
      }

      const { compagnieId } = req.params as unknown as CompagnieIdParam;
      const query = req.query as unknown as ReferentielQuery;

      const params: ReferentielParams = {
        type: query.type,
        filters: Object.fromEntries(
          Object.entries(query).filter(([k]) => k !== 'type'),
        ) as Record<string, string>,
      };

      const result = await service.getReferentiel(compagnieId, organizationId, params);
      res.json(apiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async getProviderInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(apiResponse.error('Organisation requise', 'FORBIDDEN'));
        return;
      }

      const { compagnieId } = req.params as unknown as CompagnieIdParam;
      const info = await service.getProviderInfo(compagnieId, organizationId);

      if (!info) {
        res.json(apiResponse.success({ configured: false }));
        return;
      }

      res.json(apiResponse.success(info));
    } catch (error) {
      next(error);
    }
  }
}

export const insuranceProviderController = new InsuranceProviderController();
