/**
 * Backward-compatibility re-export.
 *
 * Previously this file exported a single `supabase` client via createClient
 * from @supabase/supabase-js. It is now replaced by two specialized clients:
 * - src/lib/supabase-browser.ts  → for 'use client' components and Axios interceptor
 * - src/lib/supabase-server.ts   → for Server Components and middleware (import DIRECTLY)
 *
 * IMPORTANT: supabase-server.ts is NOT re-exported here because it imports
 * next/headers which cannot be bundled in the client. Always import it directly
 * in Server Components: import { createSupabaseServerClient } from '@/lib/supabase-server'
 *
 * This file re-exports the browser client as `supabase` to avoid breaking any
 * existing imports while the codebase migrates to the new named imports.
 */
export { supabaseBrowser as supabase } from './supabase-browser';
export { createSupabaseBrowserClient } from './supabase-browser';
