import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipDocument extends Document {
  member: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  previousMembership?: mongoose.Types.ObjectId;
  outcome?: 'renewed' | 'upgraded';
}

const membershipSchema = new Schema<IMembershipDocument>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    previousMembership: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
    },
    outcome: {
      type: String,
      enum: ['renewed', 'upgraded'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying expiry
membershipSchema.index({ endDate: 1 });
membershipSchema.index({ member: 1, startDate: -1 });

membershipSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IMembershipDocument>('Membership', membershipSchema);
