import { Router } from 'express';
import companyRouter from '../modules/company/company.route';
import contractRouter from '../modules/contract/contract.route';
import clientRouter from '../modules/client/client.route';
import dashboardRouter from '../modules/dashboard/dashboard.route';
import paymentRouter from '../modules/payment/payment.route';
import folderRouter from '../modules/folder/folder.route';
import mediaRouter from '../modules/media/media.route';
import vehiculeRouter from '../modules/vehicule/vehicule.route';
import incorporationRouter from '../modules/incorporation/incorporation.route';
import notificationRouter from '../modules/notification/notification.route';
import searchRouter from '../modules/search/search.route';
import organizationRouter from '../modules/organization/organization.route';
import authRouter from '../modules/auth/auth.route';
import usersRouter from '../modules/users/users.route';
import clientPortalRouter from '../modules/client-portal/client-portal.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/organizations', organizationRouter);
router.use('/compagnies', companyRouter);
router.use('/clients', clientRouter);
router.use('/contracts', contractRouter);
router.use('/dashboard', dashboardRouter);
router.use('/payments', paymentRouter);
router.use('/folders', folderRouter);
router.use('/media', mediaRouter);
router.use('/vehicules', vehiculeRouter);
router.use('/incorporations', incorporationRouter);
router.use('/notifications', notificationRouter);
router.use('/search', searchRouter);
router.use('/client-portal', clientPortalRouter);

export default router;



