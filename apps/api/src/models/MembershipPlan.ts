import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipPlanDocument extends Document {
  gym: mongoose.Types.ObjectId;
  name: string;
  durationInDays: number;
  price: number;
  discount?: number;
  tax?: number;
  description?: string;
  isActive: boolean;
}

const membershipPlanSchema = new Schema<IMembershipPlanDocument>(
  {
    gym: {
      type: Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: 100,
    },
    durationInDays: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
    tax: {
      type: Number,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

membershipPlanSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IMembershipPlanDocument>('MembershipPlan', membershipPlanSchema);
