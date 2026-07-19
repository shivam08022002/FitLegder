import { Router } from 'express';
import * as controller from './controller';

const router: Router = Router();

router.get('/owners', controller.getOwners);
router.post('/owners', controller.createOwner);
router.put('/owners/:id', controller.updateOwner);
router.post('/owners/:id/change-password', controller.changeOwnerPassword);
router.delete('/owners/:id', controller.deleteOwner);

// Global SaaS Settings and Subscription Upgrades
router.get('/saas-settings', controller.getSaaSSettings);
router.put('/saas-settings', controller.updateSaaSSettings);
router.get('/upgrades/pending', controller.getPendingUpgrades);
router.post('/upgrades/:gymId/approve', controller.approveUpgrade);
router.post('/upgrades/:gymId/reject', controller.rejectUpgrade);

export default router;
