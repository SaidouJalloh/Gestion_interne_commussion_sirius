import type { NextFunction, Request, Response } from 'express';
import { apiResponse } from '../../utils/apiResponse';
import { NotificationService } from './notification.service';
import type {
  NotificationIdParams,
  NotificationsListQuery,
  UpdateNotificationInput,
} from './notification.validation';

const service = new NotificationService();

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as NotificationsListQuery;
      const notifications = await service.getAll(query);
      res.json(apiResponse.success(notifications));
    } catch (e) {
      next(e);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as NotificationIdParams;
      const notif = await service.getById(id);
      if (!notif) {
        res.status(404).json(apiResponse.error('Notification non trouvée', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(notif));
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as NotificationIdParams;
      const payload = req.body as UpdateNotificationInput;
      const updated = await service.update(id, payload);
      if (!updated) {
        res.status(404).json(apiResponse.error('Notification non trouvée', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(updated));
    } catch (e) {
      next(e);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as unknown as NotificationIdParams;
      const deleted = await service.delete(id);
      if (!deleted) {
        res.status(404).json(apiResponse.error('Notification non trouvée', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success({ id }));
    } catch (e) {
      next(e);
    }
  }
}

export const notificationController = new NotificationController();

