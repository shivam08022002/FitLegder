import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as reportController from './controller';

const router: Router = Router();
router.use(authenticate);

router.get('/revenue', reportController.getRevenueReport);
router.get('/members', reportController.getMemberCountReport);

export default router;
