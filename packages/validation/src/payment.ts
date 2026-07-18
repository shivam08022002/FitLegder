import { z } from 'zod';

export const recordPaymentSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  planId: z.string().min(1, 'Plan is required'),
  amount: z
    .number({ required_error: 'Amount is required' })
    .min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['cash', 'upi', 'card', 'bank_transfer'], {
    required_error: 'Payment method is required',
  }),
  paymentDate: z.string().min(1, 'Payment date is required'),
  notes: z.string().max(500).optional().or(z.literal('')),
  // If membershipId is provided, payment is against existing membership
  // If not, a new Membership is created (new signup)
  membershipId: z.string().optional(),
  startDate: z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
