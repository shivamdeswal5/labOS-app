'use client';

import * as React from 'react';
import { LogOut, ChevronLeft, ChevronRight, UserCog, ShieldCheck, RotateCcw } from 'lucide-react';
import { useAuthContext } from '@/providers/auth-provider';
import { useLogout } from '@/features/auth/api/use-auth';
import { useRBAC } from '@/features/auth/hooks/use-rbac';
import { RoleSimulatorDialog } from '@/features/auth/components/role-simulator-dialog';

interface SidebarFooterProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarFooter({ collapsed, onToggleCollapse }: SidebarFooterProps) {
  const { user } = useAuthContext();
  const logout = useLogout();
  const { canSimulate, isSimulating, roleMeta, resetRole } = useRBAC();
  const [isSimulatorOpen, setIsSimulatorOpen] = React.useState(false);

  // If simulating, show simulated persona name; otherwise derive from real auth user
  const effectiveName = isSimulating
    ? roleMeta.simulatedName
    : ((user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split('@')[0] ?? 'Lab User');

  const initials = effectiveName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout.mutate();
  };

  if (!collapsed) {
    return (
      <>
        <div className="p-2 border-t border-border bg-card shrink-0 space-y-1.5">
          {/* Persona / Role Badge & Quick Switcher */}
          <div className="flex items-center justify-between px-1">
            {canSimulate ? (
              <button
                type="button"
                onClick={() => setIsSimulatorOpen(true)}
                className="group flex items-center gap-1.5 text-left cursor-pointer"
                title="Click to switch clinical persona or test RBAC boundaries"
              >
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono transition-opacity group-hover:opacity-80 flex items-center gap-1 ${roleMeta.badgeColorClass}`}>
                  <UserCog className="w-2.5 h-2.5" />
                  {roleMeta.badgeLabel}
                </span>
                {isSimulating && (
                  <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                    SIM
                  </span>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono flex items-center gap-1 ${roleMeta.badgeColorClass}`}>
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {roleMeta.badgeLabel}
                </span>
              </div>
            )}

            {/* If user is simulating, allow quick Exit; if user can simulate but not simulating, show Switch Role */}
            {canSimulate ? (
              isSimulating ? (
                <button
                  type="button"
                  onClick={resetRole}
                  className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                  title="Exit simulation and return to Lab Director"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Exit Sim</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSimulatorOpen(true)}
                  className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Switch Role
                </button>
              )
            ) : (
              <span className="text-[9px] font-mono text-muted-foreground">
                NABL Locked
              </span>
            )}
          </div>

          {/* User profile row */}
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-[11px] font-bold"
                title={effectiveName}
              >
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {effectiveName}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  {isSimulating ? roleMeta.simulatedTitle : (user?.email ?? '')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={handleLogout}
                disabled={logout.isPending}
                className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Collapse sidebar (Ctrl+B)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <RoleSimulatorDialog
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="p-2 border-t border-border bg-card shrink-0">
        <div className="flex flex-col items-center gap-2 py-1">
          {canSimulate ? (
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(true)}
              className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-[11px] font-bold hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer relative"
              title={`${effectiveName} (${roleMeta.badgeLabel}) — Click to simulate role`}
            >
              {initials}
              {isSimulating && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-card" />
              )}
            </button>
          ) : (
            <div
              className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-[11px] font-bold"
              title={`${effectiveName} (${roleMeta.badgeLabel})`}
            >
              {initials}
            </div>
          )}

          {canSimulate && (
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(true)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Switch clinical persona / RBAC simulator"
            >
              <UserCog className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Expand sidebar (Ctrl+B)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <RoleSimulatorDialog
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </>
  );
}
