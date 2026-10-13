import { z } from 'zod';

export const createPanelSchema = z.object({
  name: z
    .string()
    .min(2, 'Panel name must be at least 2 characters')
    .max(100, 'Panel name is too long'),
  code: z
    .string()
    .min(2, 'Panel code is required (minimum 2 characters)')
    .max(20, 'Code is too long (maximum 20 characters)')
    .regex(/^[A-Z0-9\-]+$/, 'Code must be uppercase alphanumeric (e.g. HEM-01)'),
  category: z.string().min(2, 'Category is required'),
  price: z.coerce
    .number({ invalid_type_error: 'Please enter a valid price' })
    .min(0, 'Price cannot be negative'),
  specimenType: z.string().min(2, 'Specimen type is required'),
  tatMinutes: z.coerce
    .number({ invalid_type_error: 'Please enter a valid number' })
    .int('TAT must be a whole number')
    .min(1, 'TAT must be at least 1 minute'),
  initialSection: z.string().min(1, 'Section name is required'),
  initialParameter: z.string().min(1, 'Parameter name is required'),
});

export type CreatePanelSchema = z.infer<typeof createPanelSchema>;
