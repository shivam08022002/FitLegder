import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as dashboardController from './controller';

const router: Router = Router();

router.get('/', authenticate, dashboardController.getStats);

export default router;
