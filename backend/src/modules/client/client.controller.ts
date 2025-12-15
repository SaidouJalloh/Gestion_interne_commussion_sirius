import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../utils/apiResponse';
import { ClientService } from './client.service';
import type {
    ClientIdParams,
    CreateClientInput,
    UpdateClientInput,
} from './client.validation';

const service = new ClientService();

export class ClientController {
    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const clients = await service.getAll();
            res.json(apiResponse.success(clients));
        } catch (e) {
            next(e);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as ClientIdParams;
            const client = await service.getById(id);
            if (!client) {
                res.status(404).json(apiResponse.error('Client non trouvé', 'NOT_FOUND'));
                return;
            }
            res.json(apiResponse.success(client));
        } catch (e) {
            next(e);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload = req.body as CreateClientInput;
            const created = await service.create(payload);
            res.status(201).json(apiResponse.success(created));
        } catch (e) {
            next(e);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as ClientIdParams;
            const payload = req.body as UpdateClientInput;
            const updated = await service.update(id, payload);
            if (!updated) {
                res.status(404).json(apiResponse.error('Client non trouvé', 'NOT_FOUND'));
                return;
            }
            res.json(apiResponse.success(updated));
        } catch (e) {
            next(e);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as ClientIdParams;
            const deleted = await service.delete(id);
            if (!deleted) {
                res.status(404).json(apiResponse.error('Client non trouvé', 'NOT_FOUND'));
                return;
            }
            res.json(apiResponse.success({ id }));
        } catch (e) {
            next(e);
        }
    }
}

export const clientController = new ClientController();



