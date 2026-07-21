import { z } from 'zod';

export const renewMembershipSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  planId: z.string().min(1, 'Plan is required'),
  amount: z
    .number({ required_error: 'Amount is required' })
    .min(0, 'Amount cannot be negative'),
  method: z.enum(['cash', 'upi', 'card', 'bank_transfer'], {
    required_error: 'Payment method is required',
  }),
  startDate: z.string().optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const extendMembershipSchema = z.object({
  membershipId: z.string().min(1, 'Membership is required'),
  additionalDays: z
    .number({ required_error: 'Additional days is required' })
    .int()
    .min(1, 'Must extend by at least 1 day')
    .max(365, 'Cannot extend by more than 365 days'),
});

export type RenewMembershipInput = z.infer<typeof renewMembershipSchema>;
export type ExtendMembershipInput = z.infer<typeof extendMembershipSchema>;
