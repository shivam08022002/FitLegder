import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettingsDocument extends Document {
  upiId: string;
  qrCode?: string;
  accountDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
  plans: Array<{
    id: 'tier1' | 'tier2' | 'tier3';
    name: string;
    description: string;
    features: string[];
  }>;
}

const systemSettingsSchema = new Schema<ISystemSettingsDocument>(
  {
    upiId: { type: String, default: '' },
    qrCode: { type: String, default: '' },
    accountDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      accountHolder: { type: String, default: '' },
    },
    plans: {
      type: [
        {
          id: { type: String, enum: ['tier1', 'tier2', 'tier3'], required: true },
          name: { type: String, required: true },
          description: { type: String, default: '' },
          features: { type: [String], default: [] },
        },
      ],
      default: [
        { id: 'tier1', name: 'Starter Plan', description: 'Best for small gyms starting up', features: ['Up to 100 members', 'Attendance tracking', 'Basic reports'] },
        { id: 'tier2', name: 'Growth Plan', description: 'Perfect for growing fitness centers', features: ['Up to 500 members', 'Attendance tracking', 'Advanced reports', 'Event management'] },
        { id: 'tier3', name: 'Enterprise Plan', description: 'Ultimate power for large gyms', features: ['Unlimited members', 'Attendance tracking', 'Advanced reports', 'Event management', 'Custom branding'] },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISystemSettingsDocument>('SystemSettings', systemSettingsSchema);
