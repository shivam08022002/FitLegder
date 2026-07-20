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

export async function getPayments(gymId: string, query: any): Promise<{
  payments: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const { memberId, page = 1, limit = 20, search, sortBy = 'newest' } = query;
  const skip = (page - 1) * limit;
  const filter: any = { gym: new mongoose.Types.ObjectId(gymId) };

  if (memberId) filter.member = new mongoose.Types.ObjectId(memberId);

  // If search is provided, first find matching member IDs
  if (search) {
    const matchingMembers = await Member.find(
      {
        gym: new mongoose.Types.ObjectId(gymId),
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      },
      '_id'
    );
    filter.member = { $in: matchingMembers.map((m) => m._id) };
  }

  // Base aggregation pipeline
  const pipeline: any[] = [
    { $match: filter },
    // Lookup member
    {
      $lookup: {
        from: 'members',
        localField: 'member',
        foreignField: '_id',
        as: 'member',
      },
    },
    { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
    // Lookup membership
    {
      $lookup: {
        from: 'memberships',
        localField: 'membership',
        foreignField: '_id',
        as: 'membership',
      },
    },
    { $unwind: { path: '$membership', preserveNullAndEmptyArrays: true } },
    // Lookup plan details
    {
      $lookup: {
        from: 'membershipplans',
        localField: 'membership.plan',
        foreignField: '_id',
        as: 'membership.plan',
      },
    },
    { $unwind: { path: '$membership.plan', preserveNullAndEmptyArrays: true } },
    // Lookup total payments for this membership to calculate balance due
    {
      $lookup: {
        from: 'payments',
        let: { mId: '$membership._id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$membership', '$$mId'] } } },
          { $group: { _id: null, totalPaid: { $sum: '$amount' } } },
        ],
        as: 'paymentsSum',
      },
    },
    {
      $addFields: {
        balanceDue: {
          $max: [
            0,
            {
              $subtract: [
                { $ifNull: ['$membership.plan.price', 0] },
                { $ifNull: [{ $arrayElemAt: ['$paymentsSum.totalPaid', 0] }, 0] },
              ],
            },
          ],
        },
      },
    },
    { $project: { paymentsSum: 0 } },
  ];

  // Sorting
  let sortStage: any = { paymentDate: -1 };
  if (sortBy === 'oldest') {
    sortStage = { paymentDate: 1 };
  } else if (sortBy === 'a-z') {
    sortStage = { 'member.fullName': 1 };
  } else if (sortBy === 'dues') {
    sortStage = { balanceDue: -1, paymentDate: -1 };
  }
  pipeline.push({ $sort: sortStage });

  // Get total count before pagination
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await Payment.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add pagination stages
  pipeline.push({ $skip: skip }, { $limit: limit });

  const enrichedPayments = await Payment.aggregate(pipeline);

  return {
    payments: enrichedPayments,
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
