import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as renewalService from './service';

export async function renew(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await renewalService.renewMembership(req.body, req.gymId!);
    res.status(201).json({
      success: true,
      data: result,
      message: `Membership ${result.outcome || 'created'}`,
    });
  } catch (error) {
    next(error);
  }
}

export async function extend(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const membership = await renewalService.extendMembership(
      req.body.membershipId,
      req.body.additionalDays
    );
    res.status(200).json({
      success: true,
      data: membership,
      message: 'Membership extended',
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const history = await renewalService.getRenewalHistory(req.params.memberId as string);
    res.status(200).json({
      success: true,
      data: history,
      message: 'Renewal history fetched',
    });
  } catch (error) {
    next(error);
  }
}
