import { z } from 'zod';

export const updateGymSchema = z.object({
  name: z.string().min(2, 'Gym name must be at least 2 characters').max(200).optional(),
  address: z.string().max(500).optional().or(z.literal('')),
  contactNumber: z.string().min(10).max(15).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  currency: z.string().min(2).max(5).default('INR'),
  timezone: z.string().min(1).default('Asia/Kolkata'),
});

export type UpdateGymInput = z.infer<typeof updateGymSchema>;
