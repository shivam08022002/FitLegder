import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as attendanceController from './controller';

const router: Router = Router();

router.use(authenticate);

// IMPORTANT: static route must come BEFORE /:memberId to avoid Express treating
// the literal string "attendance" as a memberId param.
router.get('/attendance/today-summary', attendanceController.getTodaySummary);

router.post('/:memberId/attendance', attendanceController.markPresent);
router.delete('/:memberId/attendance/:date', attendanceController.undoMark);
router.get('/:memberId/attendance', attendanceController.getHistory);

export default router;
