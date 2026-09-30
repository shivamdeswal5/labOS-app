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

const PUBLIC_ROUTES = ['/login', '/signup'];
const PUBLIC_PREFIX = '/v/'; // Public patient portal

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith(PUBLIC_PREFIX)
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
  const isOnboarding = pathname === '/onboarding';
  const hasConfirmedLab = request.cookies.get('x-lab-id')?.value === 'confirmed';
  const isAuthenticated = Boolean(user || hasConfirmedLab);

  // Rule 1: Authenticated user hitting /login or /signup → dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/';
    return NextResponse.redirect(dashboardUrl);
  }

  // Rule 2: Unauthenticated user hitting any non-public route (including /onboarding) → /login
  if (!isAuthenticated && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Rule 3: Authenticated user with no lab set hitting app route → /onboarding
  if (user && !hasConfirmedLab && !isOnboarding && !isPublic) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = '/onboarding';
    return NextResponse.redirect(onboardingUrl);
  }

  // Rule 4: Authenticated user who already has a lab hitting /onboarding → /
  if (isAuthenticated && hasConfirmedLab && isOnboarding) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/';
    return NextResponse.redirect(dashboardUrl);
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
     * - *.{svg,png,jpg,jpeg,gif,webp} (static image assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
