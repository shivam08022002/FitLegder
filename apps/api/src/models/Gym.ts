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
  // SaaS Subscription fields
  subscriptionPlan: 'free_trial' | 'tier1' | 'tier2' | 'tier3';
  subscriptionStatus: 'active' | 'expired' | 'pending_approval';
  subscriptionExpiresAt: Date;
  subscriptionPendingPlan?: 'tier1' | 'tier2' | 'tier3' | '';
  subscriptionPaymentDetails?: {
    transactionId?: string;
    submittedAt?: Date;
  };
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
    // SaaS Subscription fields
    subscriptionPlan: {
      type: String,
      enum: ['free_trial', 'tier1', 'tier2', 'tier3'],
      default: 'free_trial',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'pending_approval'],
      default: 'active',
    },
    subscriptionExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    subscriptionPendingPlan: {
      type: String,
      enum: ['tier1', 'tier2', 'tier3', ''],
      default: '',
    },
    subscriptionPaymentDetails: {
      transactionId: String,
      submittedAt: Date,
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
