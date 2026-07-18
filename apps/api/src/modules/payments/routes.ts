import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { recordPaymentSchema } from '@gym-saas/validation';
import * as paymentController from './controller';

const router: Router = Router();
router.use(authenticate);

router.post('/', validate(recordPaymentSchema), paymentController.recordPayment);
router.get('/', paymentController.getPayments);
router.get('/balance/:membershipId', paymentController.getBalanceDue);

export default router;
