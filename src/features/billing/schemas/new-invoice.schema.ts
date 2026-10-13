import { z } from 'zod';

export const newInvoiceSchema = z.object({
  patientName: z
    .string()
    .min(2, 'Patient name is required (minimum 2 characters)')
    .max(100, 'Name is too long'),
  patientMrn: z.string().max(50).optional(),
  patientPhone: z
    .string()
    .optional()
    .refine((v) => !v || /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')), {
      message: 'Enter a valid 10-digit Indian mobile number',
    }),
  discount: z.coerce
    .number({ invalid_type_error: 'Must be a valid number' })
    .min(0, 'Discount cannot be negative')
    .optional(),
  paymentMethod: z.enum(['UPI', 'CASH', 'CARD', 'NET_BANKING', 'OTHER']),
  markAsPaid: z.boolean(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type NewInvoiceSchema = z.infer<typeof newInvoiceSchema>;
