import mongoose, { Schema, Document } from 'mongoose';

export interface IMemberDocument extends Document {
  gym: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  gender: 'male' | 'female' | 'other';
  batch: 'morning' | 'evening';
  dateOfBirth?: Date;
  joiningDate: Date;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  notes?: string;
}

const memberSchema = new Schema<IMemberDocument>(
  {
    gym: {
      type: Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    batch: {
      type: String,
      enum: ['morning', 'evening'],
      required: [true, 'Batch is required'],
      default: 'morning',
    },
    dateOfBirth: Date,
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      default: Date.now,
    },
    emergencyContact: {
      name: String,
      phone: String,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: phone + gym
memberSchema.index({ phone: 1, gym: 1 }, { unique: true });

memberSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IMemberDocument>('Member', memberSchema);
