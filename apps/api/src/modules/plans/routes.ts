import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createPlanSchema, updatePlanSchema } from '@gym-saas/validation';
import * as planController from './controller';

const router: Router = Router();
router.use(authenticate);

router.get('/', planController.getPlans);
router.get('/:id', planController.getPlan);
router.post('/', validate(createPlanSchema), planController.createPlan);
router.put('/:id', validate(updatePlanSchema), planController.updatePlan);
router.patch('/:id/toggle', planController.toggleActive);
router.delete('/:id', planController.deletePlan);

export default router;
