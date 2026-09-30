'use client';

import * as React from 'react';
import { Sidebar } from '../sidebar';
import { Header } from '../header';
import { MobileNav } from '../mobile-nav';
import { CommandPalette } from '../command-palette';
import { LiveActivityDrawer } from '@/components/shared/live-activity-drawer';
import { useRealtime } from '@/providers/realtime-provider';
import { cn } from '@/lib/utils';

export type AppShellVariant = 'contained' | 'full-bleed' | 'workspace';

interface AppShellProps {
  children: React.ReactNode;
  variant?: AppShellVariant;
  className?: string;
}

export function AppShell({ children, variant = 'contained', className }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const { setIsDrawerOpen, unreadCount } = useRealtime();

  const handleToggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleOpenMobileNav = React.useCallback(() => {
    setMobileNavOpen(true);
  }, []);

  const handleCloseMobileNav = React.useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const handleOpenCommandPalette = React.useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const handleOpenLiveActivity = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, [setIsDrawerOpen]);

  return (
    <div
      className={cn(
        variant === 'workspace' ? 'h-screen overflow-hidden' : 'min-h-screen',
        'bg-background text-foreground flex flex-col',
        className,
      )}
    >
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Top Navigation Bar */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onOpenMobileNav={handleOpenMobileNav}
        onOpenCommandPalette={handleOpenCommandPalette}
        onOpenLiveActivity={handleOpenLiveActivity}
        unreadCount={unreadCount}
      />

      {/* Mobile Slide-over Drawer */}
      <MobileNav
        open={mobileNavOpen}
        onClose={handleCloseMobileNav}
      />

      {/* Global Command Menu (Ctrl+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Real-Time Live Activity Drawer */}
      <LiveActivityDrawer />

      {/* Main Content Workspace with Adaptive Variants */}
      <main
        className={cn(
          'flex-1 pt-14 transition-all duration-200 flex flex-col',
          variant === 'workspace' ? 'h-screen max-h-screen overflow-hidden min-h-0' : 'min-h-screen',
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-60',
          'pl-0',
        )}
      >
        {variant === 'contained' && (
          <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        )}

        {variant === 'full-bleed' && (
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        )}

        {variant === 'workspace' && (
          <div className="flex-1 w-full h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col min-h-0">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
