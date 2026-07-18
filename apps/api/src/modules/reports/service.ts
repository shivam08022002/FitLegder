import mongoose from 'mongoose';
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  subDays, subWeeks, subMonths, subYears, format, eachDayOfInterval,
  eachWeekOfInterval, eachMonthOfInterval,
} from 'date-fns';
import Payment from '../../models/Payment';
import Member from '../../models/Member';
import Membership from '../../models/Membership';
import Gym from '../../models/Gym';

type Period = 'day' | 'week' | 'month' | 'year';

function getDateRange(period: Period) {
  const now = new Date();
  switch (period) {
    case 'day':
      return { start: subDays(now, 30), end: now }; // Last 30 days
    case 'week':
      return { start: subWeeks(now, 12), end: now }; // Last 12 weeks
    case 'month':
      return { start: subMonths(now, 12), end: now }; // Last 12 months
    case 'year':
      return { start: subYears(now, 5), end: now }; // Last 5 years
  }
}

function getGroupFormat(period: Period): string {
  switch (period) {
    case 'day': return '%Y-%m-%d';
    case 'week': return '%Y-W%V';
    case 'month': return '%Y-%m';
    case 'year': return '%Y';
  }
}

export async function getRevenueReport(gymId: string, period: Period) {
  const { start, end } = getDateRange(period);
  const gymObjectId = new mongoose.Types.ObjectId(gymId);
  
  // Retrieve gym timezone to align report calculations with local gym time
  const gym = await Gym.findById(gymId);
  const timezone = gym?.timezone || 'Asia/Kolkata';

  const revenue = await Payment.aggregate([
    {
      $match: {
        gym: gymObjectId,
        paymentDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: getGroupFormat(period), date: '$paymentDate', timezone },
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        label: '$_id',
        revenue: 1,
        count: 1,
      },
    },
  ]);

  // Calculate total
  const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0);

  return { data: revenue, totalRevenue, period };
}

export async function getMemberCountReport(gymId: string, period: Period) {
  const { start, end } = getDateRange(period);
  const gymObjectId = new mongoose.Types.ObjectId(gymId);

  // Retrieve gym timezone to align report calculations with local gym time
  const gym = await Gym.findById(gymId);
  const timezone = gym?.timezone || 'Asia/Kolkata';

  // New members by period
  const newMembers = await Member.aggregate([
    {
      $match: {
        gym: gymObjectId,
        joiningDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: getGroupFormat(period), date: '$joiningDate', timezone },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Renewals by period: Filter specifically for previousMembership being present and not null
  const renewals = await Membership.aggregate([
    {
      $match: {
        previousMembership: { $exists: true, $ne: null },
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: 'members',
        localField: 'member',
        foreignField: '_id',
        as: 'memberData',
      },
    },
    { $unwind: '$memberData' },
    { $match: { 'memberData.gym': gymObjectId } },
    {
      $group: {
        _id: {
          $dateToString: { format: getGroupFormat(period), date: '$createdAt', timezone },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Current totals
  const todayStart = startOfDay(new Date());
  const totalMembers = await Member.countDocuments({ gym: gymObjectId });

  // Active members (with non-expired latest membership)
  const activeCount = await Membership.aggregate([
    {
      $lookup: {
        from: 'members',
        localField: 'member',
        foreignField: '_id',
        as: 'memberData',
      },
    },
    { $unwind: '$memberData' },
    { $match: { 'memberData.gym': gymObjectId } },
    { $sort: { startDate: -1 } },
    {
      $group: {
        _id: '$member',
        latestEndDate: { $first: '$endDate' },
      },
    },
    { $match: { latestEndDate: { $gte: todayStart } } },
    { $count: 'active' },
  ]);

  return {
    newMembers: newMembers.map((m) => ({ label: m._id, count: m.count })),
    renewals: renewals.map((r) => ({ label: r._id, count: r.count })),
    totalMembers,
    activeMembers: activeCount[0]?.active || 0,
    period,
  };
}
