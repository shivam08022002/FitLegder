import { z } from 'zod';

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Emergency contact name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
});

export const createMemberSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required',
  }),
  dateOfBirth: z.string().optional().or(z.literal('')),
  joiningDate: z.string().min(1, 'Joining date is required'),
  emergencyContact: emergencyContactSchema.optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  planId: z.string().optional(),
  amountPaid: z.number().min(0).optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank_transfer']).optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
