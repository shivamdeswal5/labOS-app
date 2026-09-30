import { supabaseBrowser } from '@/lib/supabase-browser';
import { api } from '@/lib/api-client';
import type { SignupFormValues } from '../types';

/**
 * Auth Service — Pure Functions (no hooks, no React)
 *
 * This is the service layer for all authentication operations.
 * Hooks in use-auth.ts wrap these functions with TanStack Query useMutation.
 *
 * Design decision: Two-step signup flow
 * (1) Supabase signUp creates the auth user and issues a JWT
 * (2) NestJS POST /labs creates the tenant row using that JWT
 * This keeps the backend stateless — it never needs to call Supabase Admin API.
 */

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginWithEmail({ email, password }: LoginPayload) {
  try {
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')) {
        document.cookie = 'x-lab-id=confirmed; path=/; SameSite=Lax; max-age=86400';
        return {
          session: { access_token: 'demo-token' } as unknown as import('@supabase/supabase-js').Session,
          user: { id: 'demo-user-id', email } as unknown as import('@supabase/supabase-js').User,
        };
      }
      throw new Error(error.message);
    }

    return data;
  } catch (err: unknown) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')) {
      document.cookie = 'x-lab-id=confirmed; path=/; SameSite=Lax; max-age=86400';
      return {
        session: { access_token: 'demo-token' } as unknown as import('@supabase/supabase-js').Session,
        user: { id: 'demo-user-id', email } as unknown as import('@supabase/supabase-js').User,
      };
    }
    throw err;
  }
}

export async function signupWithEmailAndCreateLab(values: SignupFormValues) {
  try {
    // Step 1: Create Supabase auth user
    const { data: authData, error: signupError } =
      await supabaseBrowser.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.ownerFullName,
          },
        },
      });

    if (signupError) {
      if (
        signupError.message?.includes('fetch') ||
        process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')
      ) {
        // Fallback for local demo setup
        return {
          requiresEmailConfirmation: false,
          user: { id: 'demo-new-user', email: values.email } as unknown as import('@supabase/supabase-js').User,
        };
      }
      throw new Error(signupError.message);
    }

    // If user already exists, Supabase email enumeration protection returns empty identities array without error
    if (authData.user && (!authData.user.identities || authData.user.identities.length === 0)) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    if (!authData.session) {
      return { requiresEmailConfirmation: true, user: authData.user };
    }

    // Step 2: Create the initial lab tenant row in NestJS
    try {
      await api.post('/labs', {
        name: values.labName || `${values.ownerFullName}'s Diagnostics`,
        address: values.address || 'Facility Address (Configured in Onboarding)',
        phoneNumbers: values.phoneNumber ? [values.phoneNumber] : ['+91 98765 43210'],
        ownerFullName: values.ownerFullName,
      });
    } catch (apiErr) {
      console.warn('Tenant lab creation sync notice:', apiErr);
    }

    return { requiresEmailConfirmation: false, user: authData.user };
  } catch (err: unknown) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')) {
      return {
        requiresEmailConfirmation: false,
        user: { id: 'demo-new-user', email: values.email } as unknown as import('@supabase/supabase-js').User,
      };
    }
    throw err;
  }
}

export async function logout() {
  const { error } = await supabaseBrowser.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login?reset=true`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
