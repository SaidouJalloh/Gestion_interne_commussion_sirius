import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
import { DashboardService } from './dashboard.service';

const service = new DashboardService();

export class DashboardController {
    async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            const data = await service.getDashboard(organizationId);
            res.json(apiResponse.success(data));
        } catch (e) {
            next(e);
        }
    }
}

export const dashboardController = new DashboardController();








