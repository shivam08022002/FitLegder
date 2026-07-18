import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as planService from './service';

export async function getPlans(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const plans = await planService.getPlans(req.gymId!);
    res.status(200).json({ success: true, data: plans, message: 'Plans fetched' });
  } catch (error) {
    next(error);
  }
}

export async function getPlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const plan = await planService.getPlanById(req.params.id as string, req.gymId!);
    res.status(200).json({ success: true, data: plan, message: 'Plan fetched' });
  } catch (error) {
    next(error);
  }
}

export async function createPlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const plan = await planService.createPlan(req.body, req.gymId!);
    res.status(201).json({ success: true, data: plan, message: 'Plan created' });
  } catch (error) {
    next(error);
  }
}

export async function updatePlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const plan = await planService.updatePlan(req.params.id as string, req.gymId!, req.body);
    res.status(200).json({ success: true, data: plan, message: 'Plan updated' });
  } catch (error) {
    next(error);
  }
}

export async function toggleActive(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const plan = await planService.togglePlanActive(req.params.id as string, req.gymId!);
    res.status(200).json({ success: true, data: plan, message: 'Plan status toggled' });
  } catch (error) {
    next(error);
  }
}

export async function deletePlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await planService.deletePlan(req.params.id as string, req.gymId!);
    res.status(200).json({ success: true, data: null, message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
}
