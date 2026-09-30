import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client-side Supabase client using @supabase/ssr createBrowserClient.
 *
 * Why createBrowserClient over createClient from @supabase/supabase-js?
 * - Persists sessions in cookies (not localStorage), enabling SSR-safe session
 *   reads from Server Components and middleware without typeof window checks.
 * - Automatically syncs cookie state across tabs.
 *
 * Usage: Import in all 'use client' components and the Axios interceptor.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton for client-side usage (Axios interceptor, hooks).
// A new instance is created per request on the server via supabase-server.ts.
export const supabaseBrowser = createSupabaseBrowserClient();
