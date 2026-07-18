import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createMemberSchema, updateMemberSchema } from '@gym-saas/validation';
import * as memberController from './controller';

const router: Router = Router();

router.use(authenticate);

router.get('/', memberController.getMembers);
router.get('/:id', memberController.getMember);
router.post('/', validate(createMemberSchema), memberController.createMember);
router.put('/:id', validate(updateMemberSchema), memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

export default router;
