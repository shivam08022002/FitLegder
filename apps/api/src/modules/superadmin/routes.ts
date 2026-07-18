import { Router } from 'express';
import * as controller from './controller';

const router: Router = Router();

router.get('/owners', controller.getOwners);
router.post('/owners', controller.createOwner);
router.put('/owners/:id', controller.updateOwner);
router.post('/owners/:id/change-password', controller.changeOwnerPassword);
router.delete('/owners/:id', controller.deleteOwner);

export default router;
