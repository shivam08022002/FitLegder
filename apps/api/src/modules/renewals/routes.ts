import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { renewMembershipSchema, extendMembershipSchema } from '@gym-saas/validation';
import * as renewalController from './controller';

const router: Router = Router();
router.use(authenticate);

router.post('/renew', validate(renewMembershipSchema), renewalController.renew);
router.post('/extend', validate(extendMembershipSchema), renewalController.extend);
router.get('/history/:memberId', renewalController.getHistory);

export default router;
