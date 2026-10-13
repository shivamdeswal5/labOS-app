import { z } from 'zod';

export const newOutsourcedSchema = z.object({
  reportId: z.string().min(1, 'Please select an accession or enter a report number'),
  reportNumber: z.string().optional(),
  patientName: z.string().min(1, 'Patient name is required'),
  testName: z
    .string()
    .min(2, 'Test name must be at least 2 characters')
    .max(100, 'Test name is too long'),
  referenceLabName: z.string().min(1, 'Reference lab is required'),
  customLabName: z.string().max(100).optional(),
  courierPartner: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  cost: z.coerce
    .number({ invalid_type_error: 'Must be a valid number' })
    .min(0, 'Cost must be ≥ 0')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type NewOutsourcedSchema = z.infer<typeof newOutsourcedSchema>;
