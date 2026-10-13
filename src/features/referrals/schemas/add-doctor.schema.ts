import { z } from 'zod';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const INDIAN_PHONE_DIGITS_REGEX = /^[6-9]\d{9}$/;

export const addDoctorSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Doctor name must be at least 2 characters')
      .max(100, 'Name is too long'),
    specialty: z.string().max(100).optional(),
    clinic: z.string().max(150).optional(),
    regNumber: z.string().max(50).optional(),
    phone: z
      .string()
      .optional()
      .refine((v) => !v || INDIAN_PHONE_DIGITS_REGEX.test(v.replace(/\D/g, '')), {
        message: 'Enter a valid 10-digit Indian mobile number',
      }),
    email: z
      .string()
      .optional()
      .refine((v) => !v || z.string().email().safeParse(v).success, {
        message: 'Enter a valid email address',
      }),
    commissionType: z.enum(['PERCENTAGE', 'FLAT', 'NONE']),
    commissionValue: z.coerce
      .number({ invalid_type_error: 'Must be a valid number' })
      .min(0, 'Must be ≥ 0')
      .optional(),
    pan: z
      .string()
      .optional()
      .refine((v) => !v || PAN_REGEX.test(v.toUpperCase()), {
        message: 'Invalid PAN format (e.g. AAAPC2019K)',
      }),
    ifsc: z
      .string()
      .optional()
      .refine((v) => !v || IFSC_REGEX.test(v.toUpperCase()), {
        message: 'Invalid IFSC format (e.g. HDFC0001042)',
      }),
    bankAccount: z
      .string()
      .optional()
      .refine((v) => !v || /^\d{8,18}$/.test(v), {
        message: 'Bank account must be 8–18 digits',
      }),
  })
  .refine(
    (d) =>
      d.commissionType === 'NONE' ||
      (d.commissionValue !== undefined && d.commissionValue >= 0),
    {
      message: 'Commission value is required when a commission type is selected',
      path: ['commissionValue'],
    },
  );

export type AddDoctorSchema = z.infer<typeof addDoctorSchema>;
