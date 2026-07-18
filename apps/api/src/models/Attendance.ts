import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceDocument extends Document {
  gym: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;
  date: Date; // Midnight UTC of the gym's local calendar day
  markedAt: Date;
  markedByUser: mongoose.Types.ObjectId;
  note?: string;
}

const attendanceSchema = new Schema<IAttendanceDocument>(
  {
    gym: {
      type: Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    member: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    markedByUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    timestamps: false,
  }
);

// Prevents duplicate records for the same member on the same calendar day
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

// Efficient gym-scoped daily queries (e.g. today-summary)
attendanceSchema.index({ gym: 1, date: 1 });

attendanceSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IAttendanceDocument>('Attendance', attendanceSchema);
