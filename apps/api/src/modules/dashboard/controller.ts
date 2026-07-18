import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as dashboardService from './service';

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await dashboardService.getDashboardStats(req.gymId!);
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Dashboard stats fetched',
    });
  } catch (error) {
    next(error);
  }
}
