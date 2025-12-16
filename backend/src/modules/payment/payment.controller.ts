import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../utils/apiResponse';
import { PaymentService } from './payment.service';
import type {
  CreatePaymentInput,
  PaymentIdParams,
  PaymentsListQuery,
  UpdatePaymentInput,
} from './payment.validation';

const service = new PaymentService();

export class PaymentController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as PaymentsListQuery;
      const payments = await service.getAll(query);
      res.json(apiResponse.success(payments));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as PaymentIdParams;
      const payment = await service.getById(id);
      if (!payment) {
        res.status(404).json(apiResponse.error('Paiement non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(payment));
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreatePaymentInput;
      const created = await service.create(payload);
      res.status(201).json(apiResponse.success(created));
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as PaymentIdParams;
      const payload = req.body as UpdatePaymentInput;
      const updated = await service.update(id, payload);
      if (!updated) {
        res.status(404).json(apiResponse.error('Paiement non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(updated));
    } catch (e) {
      next(e);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as PaymentIdParams;
      const deleted = await service.delete(id);
      if (!deleted) {
        res.status(404).json(apiResponse.error('Paiement non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success({ id }));
    } catch (e) {
      next(e);
    }
  }
}

export const paymentController = new PaymentController();






