import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../utils/apiResponse';
import { DashboardService } from './dashboard.service';

const service = new DashboardService();

export class DashboardController {
    async get(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await service.getDashboard();
            res.json(apiResponse.success(data));
        } catch (e) {
            next(e);
        }
    }
}

export const dashboardController = new DashboardController();



