import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as reportService from './service';

export async function getRevenueReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const period = (req.query.period as string) || 'month';
    const result = await reportService.getRevenueReport(req.gymId!, period as any);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Revenue report fetched',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMemberCountReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const period = (req.query.period as string) || 'month';
    const result = await reportService.getMemberCountReport(req.gymId!, period as any);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Member count report fetched',
    });
  } catch (error) {
    next(error);
  }
}
