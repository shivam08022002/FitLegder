import { Router } from 'express';
import multer from 'multer';
import * as eventController from './controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createEventSchema, updateEventSchema, eventRegistrationSchema } from '@gym-saas/validation';

const router: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Public routes
router.get('/public/:id', eventController.getEvent);
router.post('/public/:id/register', validate(eventRegistrationSchema), eventController.register);

// Protected routes (Owner only)
router.use(authenticate);

router.get('/registrations/pending', eventController.getPendingRegistrations);
router.put('/registrations/:id/status', eventController.updateRegistrationStatus);

router.route('/')
  .get(eventController.getEvents)
  .post(validate(createEventSchema), eventController.createEvent);

router.route('/:id')
  .get(eventController.getEvent)
  .put(validate(updateEventSchema), eventController.updateEvent)
  .delete(eventController.deleteEvent);

router.get('/:id/registrations', eventController.getEventRegistrations);
router.post('/:id/poster', upload.single('poster'), eventController.uploadPoster);

export default router;
