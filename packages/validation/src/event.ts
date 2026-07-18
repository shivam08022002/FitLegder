import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(2, 'Location is required'),
  maxAttendees: z.number().positive().optional(),
  entryFee: z.number().min(0).optional(),
  paymentDetailsQR: z.string().optional(),
  bankDetails: z.string().optional(),
  upiId: z.string().optional(),
  posterUrl: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventRegistrationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  utr: z.string().optional(),
  paymentScreenshot: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
