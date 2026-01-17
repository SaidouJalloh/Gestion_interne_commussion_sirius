import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
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
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const payments = await service.getAll(query, organizationId);
      res.json(apiResponse.success(payments));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as PaymentIdParams;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const payment = await service.getById(id, organizationId);
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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as PaymentIdParams;
      const payload = req.body as UpdatePaymentInput;
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const updated = await service.update(id, payload, organizationId);
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
      const organizationId = req.tenant?.organizationId;
      if (!organizationId) {
        res.status(403).json(
          apiResponse.error('Organisation requise', 'FORBIDDEN'),
        );
        return;
      }
      const deleted = await service.delete(id, organizationId);
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








