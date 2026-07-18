import mongoose from 'mongoose';
import Member from '../../models/Member';
import Membership from '../../models/Membership';
import Payment from '../../models/Payment';
import MembershipPlan from '../../models/MembershipPlan';
import { AppError } from '../../middleware/errorHandler';

interface MemberQuery {
  gymId: string;
  search?: string;
  plan?: string;
  joiningFrom?: string;
  joiningTo?: string;
  expiryFrom?: string;
  expiryTo?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export async function getMembers(query: MemberQuery) {
  const {
    gymId,
    search,
    plan,
    joiningFrom,
    joiningTo,
    expiryFrom,
    expiryTo,
    paymentStatus,
    page = 1,
    limit = 20,
  } = query;

  const gymObjectId = new mongoose.Types.ObjectId(gymId);
  const skip = (page - 1) * limit;

  // Build match stage
  const matchStage: any = { gym: gymObjectId };

  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (joiningFrom || joiningTo) {
    matchStage.joiningDate = {};
    if (joiningFrom) matchStage.joiningDate.$gte = new Date(joiningFrom);
    if (joiningTo) matchStage.joiningDate.$lte = new Date(joiningTo);
  }

  const pipeline: any[] = [
    { $match: matchStage },
    // Lookup latest membership
    {
      $lookup: {
        from: 'memberships',
        localField: '_id',
        foreignField: 'member',
        pipeline: [
          { $sort: { startDate: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: 'membershipplans',
              localField: 'plan',
              foreignField: '_id',
              as: 'planDetails',
            },
          },
          { $unwind: { path: '$planDetails', preserveNullAndEmptyArrays: true } },
        ],
        as: 'latestMembership',
      },
    },
    { $unwind: { path: '$latestMembership', preserveNullAndEmptyArrays: true } },
    // Lookup total payments for latest membership
    {
      $lookup: {
        from: 'payments',
        let: { membershipId: '$latestMembership._id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$membership', '$$membershipId'] } } },
          { $group: { _id: null, totalPaid: { $sum: '$amount' } } },
        ],
        as: 'paymentSummary',
      },
    },
    {
      $addFields: {
        'latestMembership.totalPaid': {
          $ifNull: [{ $arrayElemAt: ['$paymentSummary.totalPaid', 0] }, 0],
        },
        'latestMembership.balanceDue': {
          $subtract: [
            { $ifNull: ['$latestMembership.planDetails.price', 0] },
            { $ifNull: [{ $arrayElemAt: ['$paymentSummary.totalPaid', 0] }, 0] },
          ],
        },
        membershipStatus: {
          $cond: {
            if: { $not: '$latestMembership' },
            then: 'none',
            else: {
              $let: {
                vars: {
                  daysLeft: {
                    $divide: [
                      { $subtract: ['$latestMembership.endDate', new Date()] },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                },
                in: {
                  $switch: {
                    branches: [
                      { case: { $lt: ['$$daysLeft', 0] }, then: 'expired' },
                      { case: { $lte: ['$$daysLeft', 3] }, then: 'critical' },
                      { case: { $lte: ['$$daysLeft', 7] }, then: 'expiring_soon' },
                    ],
                    default: 'active',
                  },
                },
              },
            },
          },
        },
      },
    },
    { $project: { paymentSummary: 0, __v: 0 } },
  ];

  // Filter by plan
  if (plan) {
    pipeline.push({
      $match: {
        'latestMembership.plan': new mongoose.Types.ObjectId(plan),
      },
    });
  }

  // Filter by expiry dates
  if (expiryFrom || expiryTo) {
    const expiryMatch: any = {};
    if (expiryFrom) expiryMatch.$gte = new Date(expiryFrom);
    if (expiryTo) expiryMatch.$lte = new Date(expiryTo);
    pipeline.push({
      $match: { 'latestMembership.endDate': expiryMatch },
    });
  }

  // Filter by payment status
  if (paymentStatus === 'paid') {
    pipeline.push({ $match: { 'latestMembership.balanceDue': { $lte: 0 } } });
  } else if (paymentStatus === 'due') {
    pipeline.push({ $match: { 'latestMembership.balanceDue': { $gt: 0 } } });
  }

  // Get total count
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await Member.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add pagination and sorting
  pipeline.push(
    { $sort: { createdAt: -1 as const } },
    { $skip: skip },
    { $limit: limit }
  );

  const members = await Member.aggregate(pipeline);

  return {
    members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMemberById(memberId: string, gymId: string): Promise<any> {
  const member = await Member.findOne({
    _id: memberId,
    gym: gymId,
  });

  if (!member) {
    throw new AppError('Member not found', 404);
  }

  // Get all memberships
  const memberships = await Membership.find({ member: memberId })
    .sort({ startDate: -1 })
    .populate('plan');

  // Get all payments
  const payments = await Payment.find({ member: memberId })
    .sort({ paymentDate: -1 })
    .populate('membership');

  // Compute balance for each membership in memory (N+1 query optimization + cast fix)
  const membershipsWithBalance = memberships.map((ms) => {
    const totalPaid = payments
      .filter((p) => p.membership && (p.membership._id || p.membership).toString() === ms._id.toString())
      .reduce((sum, p) => sum + p.amount, 0);
    const planPrice = (ms.plan as any)?.price || 0;
    return {
      ...ms.toJSON(),
      totalPaid,
      balanceDue: planPrice - totalPaid,
    };
  });

  return {
    member,
    memberships: membershipsWithBalance,
    payments,
  };
}

export async function createMember(data: any, gymId: string) {
  const { planId, amountPaid, paymentMethod, ...memberData } = data;

  if (memberData.dateOfBirth === '') {
    delete memberData.dateOfBirth;
  }

  const member = new Member({
    ...memberData,
    gym: gymId,
  });
  await member.save();

  try {
    if (planId) {
      const plan = await MembershipPlan.findOne({ _id: planId, gym: gymId });
      if (plan) {
        const startDate = new Date(member.joiningDate || new Date());
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.durationInDays);

        const membership = new Membership({
          member: member._id,
          plan: plan._id,
          startDate,
          endDate,
        });
        await membership.save();

        if (amountPaid && amountPaid > 0) {
          const payment = new Payment({
            gym: gymId,
            member: member._id,
            membership: membership._id,
            amount: amountPaid,
            method: paymentMethod || 'cash',
            paymentDate: startDate,
          });
          await payment.save();
        }
      }
    }
  } catch (error) {
    // If membership or payment creation fails, rollback the created member to keep database consistent
    await Member.deleteOne({ _id: member._id });
    throw error;
  }

  return member;
}

export async function updateMember(memberId: string, gymId: string, data: any) {
  const updateData = { ...data };
  if (updateData.dateOfBirth === '') {
    updateData.dateOfBirth = null;
  }

  const member = await Member.findOneAndUpdate(
    { _id: memberId, gym: gymId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!member) {
    throw new AppError('Member not found', 404);
  }
  return member;
}

export async function deleteMember(memberId: string, gymId: string) {
  const member = await Member.findOneAndDelete({ _id: memberId, gym: gymId });
  if (!member) {
    throw new AppError('Member not found', 404);
  }

  // Cascade delete memberships and payments
  const memberships = await Membership.find({ member: memberId });
  const membershipIds = memberships.map((m) => m._id);
  await Payment.deleteMany({ membership: { $in: membershipIds } });
  await Membership.deleteMany({ member: memberId });

  return member;
}
