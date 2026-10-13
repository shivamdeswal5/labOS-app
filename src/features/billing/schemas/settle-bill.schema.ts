import { z } from 'zod';

export const settleBillSchema = z.object({
  paymentMethod: z.enum(['UPI', 'CASH', 'CARD', 'NET_BANKING', 'OTHER']),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type SettleBillSchema = z.infer<typeof settleBillSchema>;
