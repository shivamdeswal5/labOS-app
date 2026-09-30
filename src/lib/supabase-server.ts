import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client using @supabase/ssr createServerClient.
 *
 * Why a separate server client?
 * - Server Components cannot use browser APIs (localStorage, document.cookie directly).
 * - createServerClient reads/writes cookies via Next.js `cookies()` from next/headers,
 *   which is the only SSR-safe mechanism in the App Router.
 * - Must be called per-request (not a singleton) to ensure cookie isolation.
 *
 * Usage: Import ONLY in Server Components and src/middleware.ts.
 * Do NOT import this in 'use client' components — use supabase-browser.ts instead.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll may be called from a Server Component where cookies are read-only.
          // Middleware handles the actual cookie mutation.
        }
      },
    },
  });
}
