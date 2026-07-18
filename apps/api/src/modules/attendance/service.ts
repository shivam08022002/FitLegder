import mongoose from 'mongoose';
import Attendance from '../../models/Attendance';
import Member from '../../models/Member';
import Gym from '../../models/Gym';
import { AppError } from '../../middleware/errorHandler';

/**
 * Converts a YYYY-MM-DD string (or today) to midnight UTC of that calendar
 * day in the given IANA timezone. This is the canonical "date" stored on
 * every attendance record so that the unique index works correctly regardless
 * of when the server UTC clock rolls over.
 */
function toCalendarMidnightUTC(dateStr: string | undefined, timezone: string): Date {
  const localDateStr =
    dateStr ??
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
  // localDateStr is "YYYY-MM-DD" in the gym's local time
  const parts = localDateStr.split('-').map(Number);
  const year = parts[0] as number;
  const month = parts[1] as number;
  const day = parts[2] as number;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Returns "YYYY-MM-DD" for today in the given timezone.
 */
function todayLocalStr(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
}

async function getGymTimezone(gymId: string): Promise<string> {
  const gym = await Gym.findById(gymId).select('timezone').lean();
  return (gym as any)?.timezone ?? 'Asia/Kolkata';
}

async function assertMemberBelongsToGym(memberId: string, gymId: string): Promise<void> {
  const member = await Member.findOne({
    _id: memberId,
    gym: new mongoose.Types.ObjectId(gymId),
  }).lean();
  if (!member) throw new AppError('Member not found', 404);
}

// ---------------------------------------------------------------------------
// markPresent
// ---------------------------------------------------------------------------
export async function markPresent(
  memberId: string,
  gymId: string,
  userId: string,
  dateStr?: string,
  note?: string
) {
  await assertMemberBelongsToGym(memberId, gymId);

  const timezone = await getGymTimezone(gymId);
  const todayStr = todayLocalStr(timezone);

  // Validate date range: must be between 14 days ago and today (inclusive)
  if (dateStr) {
    const todayDate = new Date(todayStr);
    const targetDate = new Date(dateStr);
    const minDate = new Date(todayStr);
    minDate.setDate(minDate.getDate() - 14);

    if (targetDate > todayDate) {
      throw new AppError('Cannot mark attendance for a future date', 400);
    }
    if (targetDate < minDate) {
      throw new AppError('Cannot backfill attendance older than 14 days', 400);
    }
  }

  const calendarDate = toCalendarMidnightUTC(dateStr, timezone);

  // Upsert — idempotent. If already marked, return the existing record.
  const record = await Attendance.findOneAndUpdate(
    {
      member: new mongoose.Types.ObjectId(memberId),
      date: calendarDate,
    },
    {
      $setOnInsert: {
        gym: new mongoose.Types.ObjectId(gymId),
        member: new mongoose.Types.ObjectId(memberId),
        date: calendarDate,
        markedAt: new Date(),
        markedByUser: new mongoose.Types.ObjectId(userId),
        note: note || undefined,
      },
    },
    { upsert: true, new: true }
  );

  return record;
}

// ---------------------------------------------------------------------------
// undoMark
// ---------------------------------------------------------------------------
export async function undoMark(memberId: string, gymId: string, dateStr: string) {
  await assertMemberBelongsToGym(memberId, gymId);

  const timezone = await getGymTimezone(gymId);
  const calendarDate = toCalendarMidnightUTC(dateStr, timezone);

  const record = await Attendance.findOneAndDelete({
    member: new mongoose.Types.ObjectId(memberId),
    gym: new mongoose.Types.ObjectId(gymId),
    date: calendarDate,
  });

  if (!record) throw new AppError('Attendance record not found', 404);
  return record;
}

// ---------------------------------------------------------------------------
// getHistory
// ---------------------------------------------------------------------------
export async function getHistory(memberId: string, gymId: string) {
  await assertMemberBelongsToGym(memberId, gymId);

  const records = await Attendance.find({
    member: new mongoose.Types.ObjectId(memberId),
    gym: new mongoose.Types.ObjectId(gymId),
  })
    .sort({ date: -1 })
    .lean();

  return records;
}

// ---------------------------------------------------------------------------
// getTodaySummary — returns Set of memberId strings marked today
// ---------------------------------------------------------------------------
export async function getTodaySummary(gymId: string) {
  const timezone = await getGymTimezone(gymId);
  const todayDate = toCalendarMidnightUTC(undefined, timezone);

  const records = await Attendance.find({
    gym: new mongoose.Types.ObjectId(gymId),
    date: todayDate,
  })
    .select('member')
    .lean();

  return records.map((r: any) => r.member.toString());
}
