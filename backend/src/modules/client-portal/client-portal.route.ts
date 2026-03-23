import { Router } from 'express';
import { clientPortalMiddleware } from '../../middlewares/clientPortal.middleware';
import { clientPortalController } from './client-portal.controller';

const router = Router();

// Toutes les routes nécessitent l'authentification client
router.use(clientPortalMiddleware);

// Profil
router.get('/me', (req, res, next) => clientPortalController.me(req, res, next));

// Dashboard
router.get('/dashboard', (req, res, next) => clientPortalController.dashboard(req, res, next));

// Contrats
router.get('/contrats', (req, res, next) => clientPortalController.getContrats(req, res, next));
router.get('/contrats/:id', (req, res, next) => clientPortalController.getContratById(req, res, next));

// Sinistres
router.get('/sinistres', (req, res, next) => clientPortalController.getSinistres(req, res, next));
router.get('/sinistres/:id', (req, res, next) => clientPortalController.getSinistreById(req, res, next));
router.post('/sinistres', (req, res, next) => clientPortalController.createSinistre(req, res, next));
router.post('/sinistres/:id/messages', (req, res, next) => clientPortalController.sendMessage(req, res, next));

// Devis
router.get('/devis', (req, res, next) => clientPortalController.getDevis(req, res, next));
router.post('/devis', (req, res, next) => clientPortalController.createDevis(req, res, next));

export default router;
