import { Router } from 'express';
import companyRouter from '../modules/company/company.route';
import contractRouter from '../modules/contract/contract.route';

const router = Router();

router.use('/compagnies', companyRouter);
router.use('/contrats', contractRouter);

export default router;



