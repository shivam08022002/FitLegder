import mongoose from 'mongoose';
import { addDays } from 'date-fns';
import Payment from '../../models/Payment';
import Membership from '../../models/Membership';
import MembershipPlan from '../../models/MembershipPlan';
import Member from '../../models/Member';
import { AppError } from '../../middleware/errorHandler';

export async function recordPayment(data: any, gymId: string) {
  const {
    memberId,
    planId,
    amount,
    method,
    paymentDate,
    notes,
    membershipId,
    startDate,
  } = data;

  // Verify member belongs to this gym
  const member = await Member.findOne({ _id: memberId, gym: gymId });
  if (!member) throw new AppError('Member not found', 404);

  let membership;

  if (membershipId) {
    // Payment against existing membership
    membership = await Membership.findById(membershipId);
    if (!membership) throw new AppError('Membership not found', 404);
  } else {
    // New signup: create Membership + first Payment together
    const plan = await MembershipPlan.findOne({ _id: planId, gym: gymId });
    if (!plan) throw new AppError('Plan not found', 404);

    const start = startDate ? new Date(startDate) : new Date();
    const end = addDays(start, plan.durationInDays);

    membership = new Membership({
      member: memberId,
      plan: planId,
      startDate: start,
      endDate: end,
    });
    await membership.save();
  }

  const payment = new Payment({
    gym: gymId,
    member: memberId,
    membership: membership._id,
    amount,
    method,
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    notes,
  });
  await payment.save();

  return { payment, membership };
}

export async function getPayments(gymId: string, query: any) {
  const { memberId, page = 1, limit = 20, from, to } = query;
  const skip = (page - 1) * limit;
  const filter: any = { gym: new mongoose.Types.ObjectId(gymId) };

  if (memberId) filter.member = new mongoose.Types.ObjectId(memberId);
  if (from || to) {
    filter.paymentDate = {};
    if (from) filter.paymentDate.$gte = new Date(from);
    if (to) filter.paymentDate.$lte = new Date(to);
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('member', 'fullName phone')
      .populate({
        path: 'membership',
        populate: { path: 'plan', select: 'name price durationInDays' },
      }),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getBalanceDue(membershipId: string) {
  const membership = await Membership.findById(membershipId).populate('plan');
  if (!membership) throw new AppError('Membership not found', 404);

  const totalPaid = await Payment.aggregate([
    { $match: { membership: new mongoose.Types.ObjectId(membership._id.toString()) } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const planPrice = (membership.plan as any)?.price || 0;
  const paid = totalPaid[0]?.total || 0;

  return {
    planPrice,
    totalPaid: paid,
    balanceDue: planPrice - paid,
  };
}
