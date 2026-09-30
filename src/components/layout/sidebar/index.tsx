'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Barcode,
  FilePlus2,
  Users,
  UserCheck,
  Receipt,
  Truck,
  FlaskConical,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRBAC } from '@/features/auth/hooks/use-rbac';
import { SidebarStationInfo } from './_components/sidebar-station-info';
import { SidebarFooter } from './_components/sidebar-footer';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'New Registration', href: '/reports/new', icon: FilePlus2 },
  { label: 'Sample Worklist', href: '/accessions', icon: Barcode },
  { label: 'Patients & History', href: '/patients', icon: Users },
  { label: 'Home Collections', href: '/collections', icon: Truck },
  { label: 'Doctor Referrals', href: '/referrals', icon: UserCheck },
  { label: 'Billing & Expenses', href: '/billing', icon: Receipt },
  { label: 'Panels & Tests', href: '/panels', icon: FlaskConical },
  { label: 'Settings & NABL QC', href: '/settings', icon: ShieldCheck },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({ collapsed, onToggleCollapse, className }: SidebarProps) {
  const pathname = usePathname();
  const { canAccessRoute } = useRBAC();

  // Filter navigation items by role permissions
  const visibleNavItems = React.useMemo(() => {
    return NAV_ITEMS.filter((item) => canAccessRoute(item.href));
  }, [canAccessRoute]);

  // Keyboard shortcut listener: Ctrl+B or '[' to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        onToggleCollapse();
      } else if (e.key === '[') {
        e.preventDefault();
        onToggleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col justify-between fixed left-0 top-0 h-full z-40 bg-white dark:bg-zinc-950 bg-card border-r border-border transition-all duration-200 elevation-flat',
        collapsed ? 'w-16' : 'w-60',
        className,
      )}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand & Collapse/Expand Toggle Header */}
        <div
          className={cn(
            'h-14 flex items-center border-b border-border bg-muted/40 transition-all',
            collapsed ? 'px-0 justify-center' : 'px-3.5 justify-between',
          )}
        >
          {collapsed ? (
            <Link
              href="/"
              className="flex items-center justify-center w-full group"
              title="LabOS Home"
            >
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider shadow-xs group-hover:opacity-90 transition-opacity">
                LO
              </div>
            </Link>
          ) : (
            <>
              <Link
                href="/"
                className="flex items-center gap-2 overflow-hidden group"
                title="LabOS Home"
              >
                <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 tracking-wider group-hover:opacity-90 transition-opacity">
                  LO
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm tracking-tight text-foreground">
                    LabOS
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {process.env.NEXT_PUBLIC_APP_VERSION || 'v1.0'}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                title="Collapse sidebar (Ctrl+B or [)"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Facility Station Metadata Box */}
        <SidebarStationInfo collapsed={collapsed} />

        {/* Navigation Items (Filtered by RBAC permissions) */}
        <div className="px-2 py-3 flex-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-2 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Workstation Navigation
            </div>
          )}
          <nav className="space-y-0.5">
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
                  title={collapsed ? `${item.label}` : undefined}
                  aria-label={item.label}
                  className={cn(
                    'flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer: Auth User + Clinical Persona Switcher + Sign Out */}
      <SidebarFooter collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
    </aside>
  );
}
