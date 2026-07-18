import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as attendanceService from './service';

export async function markPresent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.params.memberId as string;
    const { date, note } = req.body;

    const record = await attendanceService.markPresent(
      memberId,
      req.gymId!,
      req.userId!,
      date,
      note
    );

    res.status(200).json({
      success: true,
      data: record,
      message: 'Attendance marked',
    });
  } catch (error) {
    next(error);
  }
}

export async function undoMark(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.params.memberId as string;
    const date = req.params.date as string;

    await attendanceService.undoMark(memberId, req.gymId!, date);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Attendance record removed',
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const memberId = req.params.memberId as string;

    const records = await attendanceService.getHistory(memberId, req.gymId!);

    res.status(200).json({
      success: true,
      data: records,
      message: 'Attendance history fetched',
    });
  } catch (error) {
    next(error);
  }
}

export async function getTodaySummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const markedMemberIds = await attendanceService.getTodaySummary(req.gymId!);

    res.status(200).json({
      success: true,
      data: markedMemberIds,
      message: "Today's attendance summary fetched",
    });
  } catch (error) {
    next(error);
  }
}
