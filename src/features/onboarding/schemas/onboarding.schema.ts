import { z } from 'zod';

export const labProfileStepSchema = z.object({
  name: z
    .string()
    .min(2, 'Lab name must be at least 2 characters')
    .max(120, 'Lab name too long'),
  address: z.string().min(5, 'Please enter a full address').max(300),
  phoneNumber: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[0-9+\s\-()]+$/, 'Invalid phone number'),
  nablRegistrationId: z.string().max(50).optional(),
  accentColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color'),
  tagline: z.string().max(200).optional(),
  footerNote: z.string().max(500).optional(),
  reportLanguage: z.enum(['en', 'hi']),
});

export type LabProfileStepSchema = z.infer<typeof labProfileStepSchema>;

export const pathologistStepSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  qualification: z
    .string()
    .min(2, 'Qualification is required')
    .max(100, 'Qualification too long'),
  councilRegistrationNumber: z.string().max(50).optional(),
});

export type PathologistStepSchema = z.infer<typeof pathologistStepSchema>;
