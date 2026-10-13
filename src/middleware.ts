import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware — Route Guard & Session Refresh
 *
 * Architecture rationale:
 * - We use @supabase/ssr createServerClient (NOT createSupabaseServerClient from
 *   supabase-server.ts) because middleware runs in the Edge Runtime, which does
 *   not have access to next/headers. Instead, cookies are read/written directly
 *   from the NextRequest/NextResponse objects.
 * - Supabase sessions are stored as cookies; middleware reads and refreshes them
 *   on every request so the session remains valid across tab reloads and SSR.
 *
 * Route rules:
 * - PUBLIC_ROUTES: accessible without authentication (/login, /signup, /v/*)
 * - Unauthenticated user hitting a protected route → redirect to /login
 * - Authenticated user hitting /login or /signup → redirect to / (dashboard)
 * - Authenticated user with no lab → redirect to /onboarding
 *   (onboarding itself is excluded from this check to prevent redirect loops)
 */

const PUBLIC_ROUTES = ['/login', '/signup', '/auth/callback', '/site.webmanifest'];
const PUBLIC_PREFIX = '/v/'; // Public patient portal

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith(PUBLIC_PREFIX) ||
    pathname.endsWith('.webmanifest')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a mutable response so middleware can set/refresh session cookies
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed cookies onto both the request and the response.
          // This is the correct pattern per @supabase/ssr docs to avoid
          // losing the session on route transitions.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Use getUser() not getSession() in middleware.
  // getUser() validates the JWT against the Supabase Auth server on every call,
  // preventing session replay attacks from tampered cookies.
  // getSession() only reads from the cookie without server-side validation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = isPublicRoute(pathname);
  const isAuthenticated = Boolean(user);
  const isSwitchingAccount = request.nextUrl.searchParams.get('switch') === 'true';

  // Rule 1: Authenticated user hitting /login or /signup → redirect to dashboard
  // Exception: Allow ?switch=true so authenticated users can view the login form to switch accounts.
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup') && !isSwitchingAccount) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/';
    return NextResponse.redirect(dashboardUrl);
  }

  // Rule 2: Unauthenticated user hitting any non-public route (including /onboarding) → redirect to /login
  if (!isAuthenticated && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (Next.js image optimization)
     * - favicon.ico   (favicon)
     * - *.{svg,png,jpg,jpeg,gif,webp,webmanifest} (static image & manifest assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)',
  ],
};
