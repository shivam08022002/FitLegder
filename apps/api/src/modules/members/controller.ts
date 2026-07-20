import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as memberService from './service';

export async function getMembers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await memberService.getMembers({
      gymId: req.gymId!,
      search: req.query.search as string,
      plan: req.query.plan as string,
      batch: req.query.batch as string,
      joiningFrom: req.query.joiningFrom as string,
      joiningTo: req.query.joiningTo as string,
      expiryFrom: req.query.expiryFrom as string,
      expiryTo: req.query.expiryTo as string,
      paymentStatus: req.query.paymentStatus as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });

    res.status(200).json({
      success: true,
      data: result.members,
      pagination: result.pagination,
      message: 'Members fetched',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await memberService.getMemberById(req.params.id as string, req.gymId!);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Member fetched',
    });
  } catch (error) {
    next(error);
  }
}

export async function createMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const member = await memberService.createMember(req.body, req.gymId!);
    res.status(201).json({
      success: true,
      data: member,
      message: 'Member created',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const member = await memberService.updateMember(req.params.id as string, req.gymId!, req.body);
    res.status(200).json({
      success: true,
      data: member,
      message: 'Member updated',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await memberService.deleteMember(req.params.id as string, req.gymId!);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Member deleted',
    });
  } catch (error) {
    next(error);
  }
}
