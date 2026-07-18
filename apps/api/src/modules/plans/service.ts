import MembershipPlan from '../../models/MembershipPlan';
import { AppError } from '../../middleware/errorHandler';

export async function getPlans(gymId: string) {
  return MembershipPlan.find({ gym: gymId }).sort({ createdAt: -1 });
}

export async function getPlanById(planId: string, gymId: string) {
  const plan = await MembershipPlan.findOne({ _id: planId, gym: gymId });
  if (!plan) throw new AppError('Plan not found', 404);
  return plan;
}

export async function createPlan(data: any, gymId: string) {
  const plan = new MembershipPlan({ ...data, gym: gymId });
  await plan.save();
  return plan;
}

export async function updatePlan(planId: string, gymId: string, data: any) {
  const plan = await MembershipPlan.findOneAndUpdate(
    { _id: planId, gym: gymId },
    data,
    { new: true, runValidators: true }
  );
  if (!plan) throw new AppError('Plan not found', 404);
  return plan;
}

export async function togglePlanActive(planId: string, gymId: string) {
  const plan = await MembershipPlan.findOne({ _id: planId, gym: gymId });
  if (!plan) throw new AppError('Plan not found', 404);
  plan.isActive = !plan.isActive;
  await plan.save();
  return plan;
}

export async function deletePlan(planId: string, gymId: string) {
  const plan = await MembershipPlan.findOneAndDelete({ _id: planId, gym: gymId });
  if (!plan) throw new AppError('Plan not found', 404);
  return plan;
}
