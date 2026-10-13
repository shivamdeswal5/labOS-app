import { createServerClient } from '@supabase/ssr';
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Server Route Handler for OAuth & Magic Link Callbacks
 *
 * Design Rationale:
 * - Solves the hash fragment token exposure bug (#access_token=...) by exchanging
 *   the token_hash or PKCE code server-side.
 * - Writes fresh session cookies directly onto the HTTP response via @supabase/ssr.
 * - Enables smooth, seamless Admin Support Impersonation with zero session bleed
 *   and completely clean browser URLs.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token_hash = searchParams.get('token_hash');
  const type = (searchParams.get('type') as EmailOtpType) || 'magiclink';
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  const isSupport = searchParams.get('support') === 'true';
  const labName = searchParams.get('lab_name') || '';

  const redirectUrl = new URL(next, origin);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Flow 1: PKCE Code Exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('PKCE exchange failed:', error.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
      );
    }
  }

  // Flow 2: Token Hash OTP Verification (Magic links & Admin Support)
  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (error) {
      console.error('OTP token verification failed:', error.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
      );
    }
  }

  // Confirm lab presence cookie so middleware allows immediate entry
  response.cookies.set('x-lab-id', 'confirmed', {
    path: '/',
    maxAge: 2592000,
    sameSite: 'lax',
  });

  // Track support impersonation state in cookies for the banner
  if (isSupport) {
    response.cookies.set('x-support-session', 'true', {
      path: '/',
      maxAge: 3600, // 1 hour session
      sameSite: 'lax',
    });
    if (labName) {
      response.cookies.set('x-support-lab-name', labName, {
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
      });
    }
  }

  return response;
}
