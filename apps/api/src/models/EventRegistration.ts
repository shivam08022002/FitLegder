import mongoose, { Schema, Document } from 'mongoose';

export interface IEventRegistrationDocument extends Document {
  event: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  utr?: string;
  paymentScreenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const eventRegistrationSchema = new Schema<IEventRegistrationDocument>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    utr: {
      type: String,
    },
    paymentScreenshot: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

eventRegistrationSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IEventRegistrationDocument>('EventRegistration', eventRegistrationSchema);
