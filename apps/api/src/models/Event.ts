import mongoose, { Schema, Document } from 'mongoose';

export interface IEventDocument extends Document {
  gym: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  posterUrl?: string;
  maxAttendees?: number;
  entryFee?: number;
  paymentDetailsQR?: string;
  bankDetails?: string;
  upiId?: string;
}

const eventSchema = new Schema<IEventDocument>(
  {
    gym: {
      type: Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    upiId: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
    },
    posterUrl: {
      type: String,
    },
    maxAttendees: {
      type: Number,
    },
    entryFee: {
      type: Number,
      default: 0,
    },
    paymentDetailsQR: {
      type: String,
    },
    bankDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IEventDocument>('Event', eventSchema);
