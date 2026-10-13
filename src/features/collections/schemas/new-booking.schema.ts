import { z } from 'zod';

export const newBookingSchema = z.object({
  patientName: z
    .string()
    .min(2, 'Patient name must be at least 2 characters')
    .max(100, 'Name is too long'),
  patientPhone: z
    .string()
    .min(1, 'Phone number is required for home collection')
    .refine((v) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')), {
      message: 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)',
    }),
  patientAge: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+$/.test(v.trim()), {
      message: 'Age must be a number',
    }),
  patientSex: z.enum(['MALE', 'FEMALE', 'OTHER']),
  address: z
    .string()
    .min(5, 'Please enter the full home address (minimum 5 characters)')
    .max(300, 'Address is too long'),
  preferredDate: z.string().min(1, 'Please select a preferred collection date'),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  isFastingRequired: z.boolean(),
  specialInstructions: z
    .string()
    .max(300, 'Special instructions cannot exceed 300 characters')
    .optional(),
});

export type NewBookingSchema = z.infer<typeof newBookingSchema>;
