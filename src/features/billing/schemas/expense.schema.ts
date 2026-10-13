import { z } from 'zod';

export const expenseSchema = z.object({
  category: z.enum([
    'REAGENTS',
    'CONSUMABLES',
    'EQUIPMENT',
    'RENT',
    'UTILITIES',
    'SALARIES',
    'MAINTENANCE',
    'OTHER',
  ]),
  title: z
    .string()
    .min(2, 'Description is required (minimum 2 characters)')
    .max(100, 'Description is too long'),
  vendor: z.string().max(100, 'Vendor name is too long').optional(),
  amount: z.coerce
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .min(0.01, 'Amount must be greater than ₹0'),
  paymentMethod: z.enum(['NET_BANKING', 'UPI', 'CASH', 'CARD', 'OTHER']),
  expenseDate: z.string().min(1, 'Date is required'),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
