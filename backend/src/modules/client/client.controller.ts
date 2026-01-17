import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
import { ClientService } from './client.service';
import type {
    ClientIdParams,
    CreateClientInput,
    UpdateClientInput,
} from './client.validation';

const service = new ClientService();

export class ClientController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            const clients = await service.getAll(organizationId);
            res.json(apiResponse.success(clients));
        } catch (e) {
            next(e);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as ClientIdParams;
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            const client = await service.getById(id, organizationId);
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
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            // Ignorer explicitement organization_id du body si présent (sécurité)
            // L'organization_id vient toujours du middleware tenant
            const { organization_id, ...cleanPayload } = payload as CreateClientInput & {
                organization_id?: string;
            };
            const created = await service.create(cleanPayload, organizationId);
            res.status(201).json(apiResponse.success(created));
        } catch (e) {
            next(e);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as ClientIdParams;
            const payload = req.body as UpdateClientInput;
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            const updated = await service.update(id, payload, organizationId);
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
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            const deleted = await service.delete(id, organizationId);
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








