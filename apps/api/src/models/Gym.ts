import mongoose, { Schema, Document } from 'mongoose';

export interface IGymDocument extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  logo?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  currency: string;
  timezone: string;
}

const gymSchema = new Schema<IGymDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Gym name is required'],
      trim: true,
      maxlength: 200,
    },
    logo: String,
    address: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
  },
  {
    timestamps: true,
  }
);

gymSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IGymDocument>('Gym', gymSchema);
