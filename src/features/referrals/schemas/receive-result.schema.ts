import { z } from 'zod';

export const receiveResultSchema = z.object({
  refReportId: z.string().max(100).optional(),
  resultsText: z
    .string()
    .min(2, 'Please enter the result summary (minimum 2 characters)')
    .max(2000, 'Result text is too long'),
  confirmedCost: z.coerce
    .number({ invalid_type_error: 'Must be a valid number' })
    .min(0, 'Cost must be ≥ 0')
    .optional(),
});

export type ReceiveResultSchema = z.infer<typeof receiveResultSchema>;
