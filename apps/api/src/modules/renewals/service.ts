import { addDays } from 'date-fns';
import Membership from '../../models/Membership';
import MembershipPlan from '../../models/MembershipPlan';
import Payment from '../../models/Payment';
import Member from '../../models/Member';
import { AppError } from '../../middleware/errorHandler';

export async function renewMembership(data: any, gymId: string) {
  const { memberId, planId, amount, method, startDate, notes } = data;

  const member = await Member.findOne({ _id: memberId, gym: gymId });
  if (!member) throw new AppError('Member not found', 404);

  const plan = await MembershipPlan.findOne({ _id: planId, gym: gymId });
  if (!plan) throw new AppError('Plan not found', 404);

  // Find current (latest) membership
  const currentMembership = await Membership.findOne({ member: memberId })
    .sort({ startDate: -1 })
    .populate('plan');

  const start = startDate ? new Date(startDate) : new Date();
  const end = addDays(start, plan.durationInDays);

  // Determine if this is a renewal or upgrade
  let outcome: 'renewed' | 'upgraded' | undefined;
  if (currentMembership) {
    const currentPlanId = (currentMembership.plan as any)?._id?.toString() ||
      currentMembership.plan?.toString();
    outcome = currentPlanId === planId ? 'renewed' : 'upgraded';

    // Mark old membership
    currentMembership.outcome = outcome;
    await currentMembership.save();
  }

  // Create new membership
  const newMembership = new Membership({
    member: memberId,
    plan: planId,
    startDate: start,
    endDate: end,
    previousMembership: currentMembership?._id,
  });
  await newMembership.save();

  // Record payment if amount > 0
  let payment = null;
  if (amount > 0) {
    payment = new Payment({
      gym: gymId,
      member: memberId,
      membership: newMembership._id,
      amount,
      method,
      paymentDate: new Date(),
      notes,
    });
    await payment.save();
  }

  return { membership: newMembership, payment, outcome };
}

export async function extendMembership(membershipId: string, additionalDays: number) {
  const membership = await Membership.findById(membershipId);
  if (!membership) throw new AppError('Membership not found', 404);

  membership.endDate = addDays(membership.endDate, additionalDays);
  await membership.save();

  return membership;
}

export async function getRenewalHistory(memberId: string) {
  const memberships = await Membership.find({ member: memberId })
    .sort({ startDate: -1 })
    .populate('plan', 'name price durationInDays');

  return memberships;
}
