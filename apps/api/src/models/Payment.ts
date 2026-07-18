import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentDocument extends Document {
  gym: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;
  membership: mongoose.Types.ObjectId;
  amount: number;
  method: 'cash' | 'upi' | 'card' | 'bank_transfer';
  paymentDate: Date;
  notes?: string;
}

const paymentSchema = new Schema<IPaymentDocument>(
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
    membership: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    method: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer'],
      required: [true, 'Payment method is required'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying payment history
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ gym: 1, paymentDate: -1 });
paymentSchema.index({ membership: 1 });

paymentSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IPaymentDocument>('Payment', paymentSchema);
