import { Request, Response } from 'express';
import { usersService } from './users.service';

export class UsersController {
  async createUser(req: Request, res: Response) {
    try {
      const callerId = req.tenant?.userId;
      const organizationId = req.tenant?.organizationId;

      if (!callerId) {
        return res.status(401).json({ success: false, message: 'Non autorisé' });
      }

      const user = await usersService.createUser(req.body, callerId, organizationId);
      return res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      console.error('Create User Error:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erreur interne du serveur',
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const callerId = req.tenant?.userId;
      const { id } = req.params;

      if (!callerId) {
        return res.status(401).json({ success: false, message: 'Non autorisé' });
      }

      const result = await usersService.updateUser(id, req.body, callerId);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Update User Error:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erreur interne du serveur',
      });
    }
  }

  async deactivateUser(req: Request, res: Response) {
    try {
      const callerId = req.tenant?.userId;
      const { id } = req.params;

      if (!callerId) {
        return res.status(401).json({ success: false, message: 'Non autorisé' });
      }

      const result = await usersService.deactivateUser(id, callerId);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error('Deactivate User Error:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erreur interne du serveur',
      });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const callerId = req.tenant?.userId;
      const organizationId = req.tenant?.organizationId;
      // '?isSuperAdminMode=true' in query indicates superadmin list fetch
      const isSuperAdminMode = req.query.isSuperAdminMode === 'true';

      if (!callerId) {
        return res.status(401).json({ success: false, message: 'Non autorisé' });
      }

      const users = await usersService.getUsers(callerId, organizationId, isSuperAdminMode);
      return res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      console.error('Get Users Error:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erreur interne du serveur',
      });
    }
  }
}

export const usersController = new UsersController();
