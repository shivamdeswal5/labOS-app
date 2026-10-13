import { z } from 'zod';

export const settleCommissionSchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'UPI', 'CASH']),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type SettleCommissionSchema = z.infer<typeof settleCommissionSchema>;
