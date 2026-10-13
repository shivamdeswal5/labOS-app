import { z } from 'zod';

export const newReportSchema = z.object({
  name: z
    .string()
    .min(2, 'Patient name is required (minimum 2 characters)')
    .max(100, 'Name is too long'),
  age: z.string().min(1, 'Patient age is required'),
  ageUnit: z.enum(['YRS', 'MOS', 'DAYS']),
  sex: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')), {
      message: 'Enter a valid 10-digit Indian mobile number',
    }),
  refByDoctorId: z.string().optional(),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional(),
});

export type NewReportSchema = z.infer<typeof newReportSchema>;
