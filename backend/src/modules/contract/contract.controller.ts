import type { Request, Response, NextFunction } from 'express';
import { ContractService } from './contract.service';
import { apiResponse } from '../../utils/apiResponse';

const service = new ContractService();

export class ContractController {
  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const contrats = await service.getAll();
      res.json(apiResponse.success(contrats));
    } catch (error) {
      next(error);
    }
  }
}

export const contractController = new ContractController();


