'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '../sidebar';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';
import { useRBAC } from '@/features/auth/hooks/use-rbac';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { canAccessRoute, roleMeta } = useRBAC();
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'LabOS Station';
  const nablText = labProfile?.nablId ? `NABL: ${labProfile.nablId}` : 'NABL Standard Compliant';

  const visibleNavItems = React.useMemo(() => {
    return NAV_ITEMS.filter((item) => canAccessRoute(item.href));
  }, [canAccessRoute]);

  // Auto-close ONLY when route actually changes
  const prevPathname = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-card border-r border-border elevation-modal flex flex-col justify-between animate-in slide-in-from-left duration-200">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm">
                L
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                Lab<span className="text-primary">OS</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Facility Station Chip */}
          <div className="px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Facility Station
            </div>
            <div className="text-xs font-semibold text-foreground truncate mt-0.5" title={labName}>
              {labName}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono text-muted-foreground truncate">
                {nablText}
              </span>
            </div>
          </div>

          {/* Nav Links (Minimum 44px touch target, scrollable, filtered by RBAC) */}
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isAccessionWorklist =
                item.href === '/accessions' &&
                (pathname === '/accessions' ||
                  (pathname.startsWith('/reports/') && pathname !== '/reports/new') ||
                  pathname === '/reports');

              const isNewRegistration =
                item.href === '/reports/new' && pathname === '/reports/new';

              const isActive =
                isAccessionWorklist ||
                isNewRegistration ||
                (item.href !== '/accessions' &&
                  item.href !== '/reports/new' &&
                  (item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/')));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Persona Card */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2.5 p-2 rounded-md bg-card border border-border">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-foreground truncate">
                  {roleMeta.simulatedName}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-mono ${roleMeta.badgeColorClass}`}>
                  {roleMeta.badgeLabel}
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground truncate">
                {roleMeta.simulatedTitle}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
