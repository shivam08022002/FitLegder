import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(100),
  durationInDays: z
    .number({ required_error: 'Duration is required' })
    .int()
    .min(1, 'Duration must be at least 1 day')
    .max(3650, 'Duration cannot exceed 10 years'),
  price: z
    .number({ required_error: 'Price is required' })
    .min(0, 'Price cannot be negative'),
  discount: z.number().min(0).max(100).optional(),
  tax: z.number().min(0).max(100).optional(),
  description: z.string().max(500).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
