import mongoose from 'mongoose';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, addDays } from 'date-fns';
import Member from '../../models/Member';
import Membership from '../../models/Membership';
import Payment from '../../models/Payment';

export async function getDashboardStats(gymId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const gymObjectId = new mongoose.Types.ObjectId(gymId);

  // Total members
  const totalMembers = await Member.countDocuments({ gym: gymObjectId });

  // Get all members with their latest membership
  const membersWithStatus = await Member.aggregate([
    { $match: { gym: gymObjectId } },
    {
      $lookup: {
        from: 'memberships',
        localField: '_id',
        foreignField: 'member',
        pipeline: [{ $sort: { startDate: -1 } }, { $limit: 1 }],
        as: 'latestMembership',
      },
    },
    { $unwind: { path: '$latestMembership', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        endDate: '$latestMembership.endDate',
        daysLeft: {
          $cond: {
            if: '$latestMembership.endDate',
            then: {
              $divide: [
                { $subtract: ['$latestMembership.endDate', now] },
                1000 * 60 * 60 * 24,
              ],
            },
            else: null,
          },
        },
      },
    },
  ]);

  let activeMembers = 0;
  let expiringSoon = 0;
  let expired = 0;

  for (const m of membersWithStatus) {
    if (m.daysLeft === null) continue;
    if (m.daysLeft < 0) {
      expired++;
    } else if (m.daysLeft > 7) {
      activeMembers++;
    } else {
      expiringSoon++;
      if (m.daysLeft > 7) activeMembers++; // won't reach here but for clarity
    }
  }

  // Today's revenue
  const todayRevenueAgg = await Payment.aggregate([
    {
      $match: {
        gym: gymObjectId,
        paymentDate: { $gte: todayStart, $lte: todayEnd },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const todayRevenue = todayRevenueAgg[0]?.total || 0;

  // Monthly revenue
  const monthlyRevenueAgg = await Payment.aggregate([
    {
      $match: {
        gym: gymObjectId,
        paymentDate: { $gte: monthStart, $lte: monthEnd },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;

  // Recent payments (last 10)
  const recentPayments = await Payment.find({ gym: gymObjectId })
    .sort({ paymentDate: -1 })
    .limit(10)
    .populate('member', 'fullName phone')
    .populate('membership');

  // Recent registrations (last 10)
  const recentRegistrations = await Member.find({ gym: gymObjectId })
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    totalMembers,
    activeMembers,
    expiringSoon,
    expired,
    todayRevenue,
    monthlyRevenue,
    recentPayments,
    recentRegistrations,
  };
}
