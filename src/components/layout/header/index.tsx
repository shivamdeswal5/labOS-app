'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, Bell, Menu, ShieldCheck, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onOpenMobileNav: () => void;
  onOpenCommandPalette: () => void;
  onOpenLiveActivity: () => void;
  unreadCount: number;
  className?: string;
}

export function Header({
  sidebarCollapsed,
  onOpenMobileNav,
  onOpenCommandPalette,
  onOpenLiveActivity,
  unreadCount,
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const isNewReportPage = pathname === '/reports/new';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-14 z-30 bg-white dark:bg-zinc-950 bg-card border-b border-border shadow-xs transition-all duration-200 flex items-center justify-between px-4 md:px-6',
        sidebarCollapsed ? 'md:left-16' : 'md:left-60',
        'left-0',
        className,
      )}
    >
      {/* Left: Mobile Trigger & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between h-9 px-3 bg-muted/60 hover:bg-muted border border-border/80 rounded-md text-xs text-muted-foreground transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="hidden sm:inline">Search barcode or patient MRN...</span>
            <span className="sm:hidden">Search...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="font-mono text-[10px] px-1 py-0.5 bg-card border border-border rounded text-muted-foreground">
              Ctrl
            </kbd>
            <kbd className="font-mono text-[10px] px-1 py-0.5 bg-card border border-border rounded text-muted-foreground">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Telemetry & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Compliance Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-[11px] font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>ISO 15189:2022 COMPLIANT</span>
        </div>

        {/* Action Button: New Report (hidden when already on /reports/new) */}
        {!isNewReportPage && (
          <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold">
            <Link href="/reports/new">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Report</span>
            </Link>
          </Button>
        )}

        <div className="h-5 w-px bg-border hidden sm:block"></div>

        {/* Live Activity / Notifications Bell */}
        <button
          id="header-live-activity-btn"
          onClick={onOpenLiveActivity}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative"
          aria-label={`Live activity feed${unreadCount > 0 ? ` — ${unreadCount} unread events` : ''}`}
          title="Live Clinical Telemetry"
        >
          {unreadCount > 0 ? (
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white px-1 leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Quality / Accreditation Chip */}
        <div className="hidden sm:flex items-center text-muted-foreground" title="NABL Verified System">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
