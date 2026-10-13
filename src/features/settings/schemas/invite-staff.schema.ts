import { z } from 'zod';

export const inviteStaffSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Name is too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    role: z.enum([
      'OWNER',
      'DIRECTOR',
      'PATHOLOGIST',
      'SR_TECHNICIAN',
      'TECHNICIAN',
      'PHLEBOTOMIST',
      'BILLING',
    ]),
    qualification: z.string().max(100, 'Qualification is too long').optional(),
    councilRegistration: z.string().max(50, 'Registration number is too long').optional(),
    signOffScope: z.string().max(200, 'Sign-off scope is too long').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'PATHOLOGIST' && !data.qualification?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Qualification is required for Pathologists (e.g. MD, DCP, DNB)',
        path: ['qualification'],
      });
    }
  });

export type InviteStaffSchema = z.infer<typeof inviteStaffSchema>;
