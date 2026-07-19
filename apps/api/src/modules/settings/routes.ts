import { Router } from 'express';
import multer from 'multer';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { updateGymSchema } from '@gym-saas/validation';
import * as settingsController from './controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router: Router = Router();
router.use(authenticate);

router.get('/', settingsController.getSettings);
router.put('/', validate(updateGymSchema), settingsController.updateSettings);
router.post('/logo', upload.single('logo'), settingsController.uploadLogo);

// SaaS Subscription Details & Upgrades for Gym Owners
router.get('/saas-details', settingsController.getSaaSDetails);
router.post('/upgrade-request', settingsController.requestUpgrade);

export default router;
