import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
import { ClientPortalService } from './client-portal.service';
import {
  createSinistreSchema,
  createDevisSchema,
  sendMessageSchema,
} from './client-portal.validation';

const service = new ClientPortalService();

export class ClientPortalController {
  /**
   * GET /api/client-portal/me
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId } = req.clientPortal!;
      const profile = await service.getProfile(clientId, organizationId);
      if (!profile) {
        res.status(404).json(apiResponse.error('Profil client non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(profile));
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/client-portal/dashboard
   */
  async dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId } = req.clientPortal!;
      const data = await service.getDashboard(clientId, organizationId);
      res.json(apiResponse.success(data));
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/client-portal/contrats
   */
  async getContrats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId } = req.clientPortal!;
      const contrats = await service.getContrats(clientId, organizationId);
      res.json(apiResponse.success(contrats));
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/client-portal/contrats/:id
   */
  async getContratById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId } = req.clientPortal!;
      const contrat = await service.getContratById(req.params.id, clientId, organizationId);
      if (!contrat) {
        res.status(404).json(apiResponse.error('Contrat non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(contrat));
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/client-portal/sinistres
   */
  async getSinistres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId } = req.clientPortal!;
      const sinistres = await service.getSinistres(clientId, organizationId);
      res.json(apiResponse.success(sinistres));
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/client-portal/sinistres/:id
   */
  async getSinistreById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId } = req.clientPortal!;
      const sinistre = await service.getSinistreById(req.params.id, clientId, organizationId);
      if (!sinistre) {
        res.status(404).json(apiResponse.error('Sinistre non trouvé', 'NOT_FOUND'));
        return;
      }
      res.json(apiResponse.success(sinistre));
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/client-portal/sinistres
   */
  async createSinistre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId, userId } = req.clientPortal!;
      const input = createSinistreSchema.parse(req.body);
      const sinistre = await service.createSinistre(input, clientId, organizationId, userId);
      res.status(201).json(apiResponse.success(sinistre));
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/client-portal/sinistres/:id/messages
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId, userId } = req.clientPortal!;
      const { message } = sendMessageSchema.parse(req.body);

      // Récupérer le nom du client pour le message
      const profile = await service.getProfile(clientId, organizationId);
      const clientNom = profile ? `${profile.prenom} ${profile.nom}` : 'Client';

      const msg = await service.sendMessage(
        req.params.id,
        message,
        clientId,
        organizationId,
        userId,
        clientNom,
      );
      res.status(201).json(apiResponse.success(msg));
    } catch (e) {
      next(e);
    }
  }

  /**
   * GET /api/client-portal/devis
   */
  async getDevis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId } = req.clientPortal!;
      const devis = await service.getDevis(clientId, organizationId);
      res.json(apiResponse.success(devis));
    } catch (e) {
      next(e);
    }
  }

  /**
   * POST /api/client-portal/devis
   */
  async createDevis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, organizationId } = req.clientPortal!;
      const input = createDevisSchema.parse(req.body);
      const devis = await service.createDevis(input, clientId, organizationId);
      res.status(201).json(apiResponse.success(devis));
    } catch (e) {
      next(e);
    }
  }
}

export const clientPortalController = new ClientPortalController();
