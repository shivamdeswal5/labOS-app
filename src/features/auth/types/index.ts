/**
 * Auth Feature — Domain Types
 * Mirrors the Supabase Auth user model and the NestJS labs bounded context DTOs.
 */

export interface AuthUser {
  id: string; // Supabase UUID
  email: string;
  fullName?: string;
  role?: 'OWNER' | 'TECHNICIAN' | 'PATHOLOGIST';
  labId?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  ownerFullName: string;
  labName?: string;
  address?: string;
  phoneNumber?: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}
