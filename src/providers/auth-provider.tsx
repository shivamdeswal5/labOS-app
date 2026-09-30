'use client';

import * as React from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';

/**
 * AuthContext — reactive Supabase session state for all client components.
 *
 * Design rationale:
 * - We use supabase.auth.onAuthStateChange() rather than polling getSession().
 *   This gives us a reactive, push-based subscription that fires immediately on
 *   sign-in, sign-out, token refresh, and password reset — zero latency.
 * - We also call getSession() once on mount so the initial render is not blank.
 * - The `labId` cookie is set here after confirming a session exists, which
 *   the middleware reads to determine whether to redirect to /onboarding.
 *
 * What this does NOT do:
 * - It does not call the NestJS API to fetch lab membership details.
 *   That would be a separate useQuery hook in the settings/profile feature.
 * - It does not decode the JWT to extract custom claims. Supabase user metadata
 *   is sufficient for the sidebar display (email, full_name).
 */

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    // Helper to verify if the authenticated user has an active lab
    const syncUserLabStatus = async (userObj: User | null) => {
      if (!userObj) {
        clearLabIdCookie();
        return;
      }

      try {
        // Dynamic import to avoid circular dependencies with api client
        const { api, ApiError } = await import('@/lib/api-client');
        const profile = await api.get<{ labId?: string | null }>('/labs/me');
        if (profile?.labId) {
          setLabIdCookie(true);
        } else {
          clearLabIdCookie();
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/onboarding') &&
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/signup')
          ) {
            window.location.href = '/onboarding';
          }
        }
      } catch (err) {
        // If profile not found (404) or forbidden (no lab registered), guide to onboarding
        const { ApiError } = await import('@/lib/api-client');
        if (err instanceof ApiError && (err.statusCode === 404 || err.statusCode === 403)) {
          clearLabIdCookie();
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/onboarding') &&
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/signup')
          ) {
            window.location.href = '/onboarding';
          }
        }
      }
    };

    // Initial session read with safety timeout
    const initSession = async () => {
      try {
        const { data } = await supabaseBrowser.auth.getSession();
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          await syncUserLabStatus(data.session.user);
        }
      } catch (err) {
        console.warn('Session resolution notice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void initSession();

    // Subscribe to auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession ?? null);
        setUser(newSession?.user ?? null);
        setIsLoading(false);

        if (newSession?.user) {
          await syncUserLabStatus(newSession.user);
        } else {
          clearLabIdCookie();
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Cookie helpers (exported for onboarding completion and logout flows)
// ---------------------------------------------------------------------------

export function setLabIdCookie(hasLab: boolean) {
  if (!hasLab) return;
  // SameSite=Lax; no HttpOnly so middleware can read from request.cookies.
  // The value 'confirmed' is just a presence flag — actual labId is in the JWT.
  document.cookie = 'x-lab-id=confirmed; path=/; SameSite=Lax; max-age=86400';
}

export function clearLabIdCookie() {
  document.cookie = 'x-lab-id=; path=/; max-age=0';
}
