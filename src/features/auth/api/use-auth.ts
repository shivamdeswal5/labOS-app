'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  loginWithEmail,
  signupWithEmailAndCreateLab,
  logout,
  sendPasswordResetEmail,
} from './auth.service';
import type { LoginFormValues, SignupFormValues } from '../types';
import { api } from '@/lib/api-client';
import { setLabIdCookie, clearLabIdCookie } from '@/providers/auth-provider';

/**
 * useLogin — TanStack mutation hook for email+password sign-in.
 * On success: checks if user has an active lab in database:
 * - If lab exists -> routes to / (workstation dashboard)
 * - If lab missing -> clears cookie and routes to /onboarding
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginWithEmail(values),
    onSuccess: async () => {
      // Clear any stale query cache from a previous session
      queryClient.clear();

      try {
        const profile = await api.get<{ labId?: string | null }>('/labs/me');
        if (profile?.labId) {
          setLabIdCookie(true);
          router.push('/');
        } else {
          clearLabIdCookie();
          router.push('/onboarding');
        }
      } catch {
        clearLabIdCookie();
        router.push('/onboarding');
      }

      router.refresh(); // Force RSC re-render to pick up new auth state
    },
  });
}

/**
 * useSignup — TanStack mutation hook for new lab owner registration.
 * Executes two-step flow: Supabase signUp → NestJS POST /labs.
 * On success: redirects to /onboarding (wizard to configure lab details).
 */
export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: SignupFormValues) =>
      signupWithEmailAndCreateLab(values),
    onSuccess: (result) => {
      if (result.requiresEmailConfirmation) {
        // Email confirmation required — caller handles UI state
        return;
      }
      router.push('/onboarding');
      router.refresh();
    },
  });
}

/**
 * useLogout — TanStack mutation hook for sign-out.
 * Clears all query cache and navigates to /login.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
      router.refresh();
    },
  });
}

/**
 * useForgotPassword — TanStack mutation hook for password reset email.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => sendPasswordResetEmail(email),
  });
}
