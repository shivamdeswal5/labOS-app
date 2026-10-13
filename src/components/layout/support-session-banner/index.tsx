'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const emptySubscribe = () => () => {};

/**
 * SupportSessionBanner
 *
 * Appears when a Super Admin has assumed control of a laboratory workstation
 * via the Ghost / Impersonation support lever.
 *
 * Architecture Rationale:
 * - Rendered client-side via next/dynamic({ ssr: false }) to eliminate hydration mismatches.
 * - Reads document.cookie reactively without triggering React 19 setState-in-effect lint errors.
 */
export function SupportSessionBanner() {
  const cookieString = useSyncExternalStore(
    emptySubscribe,
    () => (typeof document !== 'undefined' ? document.cookie : ''),
    () => '',
  );

  const { isSupportActive, labName } = useMemo(() => {
    if (!cookieString) {
      return { isSupportActive: false, labName: '' };
    }

    const cookies = cookieString.split(';').map((c) => c.trim());
    const isSupport = cookies.some((c) => c.startsWith('x-support-session=true'));
    let name = '';

    const nameCookie = cookies.find((c) => c.startsWith('x-support-lab-name='));
    if (nameCookie) {
      try {
        const raw = nameCookie.slice('x-support-lab-name='.length);
        name = decodeURIComponent(raw).replace(/%20/g, ' ');
      } catch {
        name = '';
      }
    }

    return { isSupportActive: isSupport, labName: name };
  }, [cookieString]);

  const handleExitSupport = async () => {
    try {
      // 1. Clear support tracking cookies
      document.cookie = 'x-support-session=; path=/; max-age=0;';
      document.cookie = 'x-support-lab-name=; path=/; max-age=0;';
      document.cookie = 'x-lab-id=; path=/; max-age=0;';

      // 2. Clear Supabase auth session
      await supabaseBrowser.auth.signOut();
    } catch (err) {
      console.warn('Sign out during support exit:', err);
    } finally {
      // 3. Return to Super Admin portal
      const adminUrl =
        process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001/?tab=tenants';
      window.location.href = adminUrl;
    }
  };

  if (!isSupportActive) return null;

  return (
    <aside
      aria-label="Super Admin Support Mode Alert"
      className="bg-linear-to-r from-amber-600 via-amber-500 to-amber-600 text-amber-950 px-4 py-2 border-b border-amber-400/40 shadow-xs flex items-center justify-between z-50 text-xs sm:text-sm font-medium"
    >
      <div className="flex items-center gap-2">
        <span className="p-1 rounded-md bg-amber-950/15 text-amber-950 flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-amber-950" />
        </span>
        <p>
          <strong className="font-bold tracking-tight">Super Admin Ghost Session:</strong>{' '}
          Viewing as{' '}
          <span className="underline decoration-amber-900/40 font-semibold">
            {labName || 'Laboratory'}
          </span>
          . All operational modifications are logged in the platform audit trail.
        </p>
      </div>

      <button
        type="button"
        onClick={handleExitSupport}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-950 text-white font-semibold text-xs hover:bg-amber-900 active:scale-95 transition-all shadow-xs cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        Exit Support Mode
      </button>
    </aside>
  );
}
