import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as paymentService from './service';

export async function recordPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.recordPayment(req.body, req.gymId!);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Payment recorded',
    });
  } catch (error) {
    next(error);
  }
}

export async function getPayments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.getPayments(req.gymId!, {
      memberId: req.query.memberId,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search,
      sortBy: req.query.sortBy,
    });
    res.status(200).json({
      success: true,
      data: result.payments,
      pagination: result.pagination,
      message: 'Payments fetched',
    });
  } catch (error) {
    next(error);
  }
}

export async function getBalanceDue(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.getBalanceDue(req.params.membershipId as string);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Balance due calculated',
    });
  } catch (error) {
    next(error);
  }
}
