'use client';

import * as React from 'react';
import { useAuthContext } from '@/providers/auth-provider';
import type { AppRole, Permission } from '../types/rbac.types';
import {
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS,
  ROLE_METADATA,
} from '../types/rbac.types';

const STORAGE_KEY = 'labos_simulated_role';
const ROLE_CHANGE_EVENT = 'labos-role-change';

export function useRBAC() {
  const { user } = useAuthContext();

  // Resolve base role from user metadata or default to OWNER for superuser/demo
  const baseRole: AppRole = React.useMemo(() => {
    const rawRole = (user?.user_metadata?.role as string | undefined)?.toUpperCase();
    if (rawRole === 'PATHOLOGIST') return 'PATHOLOGIST';
    if (rawRole === 'TECHNICIAN') return 'TECHNICIAN';
    if (rawRole === 'PHLEBOTOMIST') return 'PHLEBOTOMIST';
    return 'OWNER';
  }, [user]);

  // Industry Standard Privilege Invariant:
  // ONLY authenticated Lab Directors/Owners (baseRole === 'OWNER') are authorized to simulate roles.
  // Real technicians, pathologists, and phlebotomists are strictly prohibited from role switching.
  const canSimulate = baseRole === 'OWNER';

  // Reactive simulated role state (strictly ignored if canSimulate is false)
  const [simulatedRole, setSimulatedRoleState] = React.useState<AppRole | null>(() => {
    if (typeof window === 'undefined') return null;
    if (!canSimulate) return null;
    const saved = localStorage.getItem(STORAGE_KEY) as AppRole | null;
    return saved && ROLE_METADATA[saved] ? saved : null;
  });

  // Listen to cross-component role changes (active only for authorized simulators)
  React.useEffect(() => {
    if (!canSimulate) return;

    const handleStorageChange = () => {
      const saved = localStorage.getItem(STORAGE_KEY) as AppRole | null;
      setSimulatedRoleState(saved && ROLE_METADATA[saved] ? saved : null);
    };

    window.addEventListener(ROLE_CHANGE_EVENT, handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener(ROLE_CHANGE_EVENT, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [canSimulate]);

  const currentRole: AppRole = canSimulate && simulatedRole ? simulatedRole : baseRole;
  const isSimulating = Boolean(canSimulate && simulatedRole && simulatedRole !== baseRole);

  const setSimulatedRole = React.useCallback(
    (role: AppRole) => {
      if (!canSimulate) {
        console.warn(
          '[RBAC Security Guardrail] Unauthorized role simulation attempt rejected. Only OWNER accounts are permitted to simulate roles.',
        );
        return;
      }
      localStorage.setItem(STORAGE_KEY, role);
      setSimulatedRoleState(role);
      window.dispatchEvent(new Event(ROLE_CHANGE_EVENT));
    },
    [canSimulate],
  );

  const resetRole = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSimulatedRoleState(null);
    window.dispatchEvent(new Event(ROLE_CHANGE_EVENT));
  }, []);

  const can = React.useCallback(
    (permission: Permission): boolean => {
      const allowed = ROLE_PERMISSIONS[currentRole] || [];
      return allowed.includes(permission);
    },
    [currentRole]
  );

  const hasRole = React.useCallback(
    (...roles: AppRole[]): boolean => {
      return roles.includes(currentRole);
    },
    [currentRole]
  );

  const canAccessRoute = React.useCallback(
    (pathname: string): boolean => {
      // Find matching route config by exact match or prefix
      const matchKey = Object.keys(ROUTE_PERMISSIONS).find(
        (key) => key === pathname || (key !== '/' && pathname.startsWith(key))
      );

      if (!matchKey) return true; // Unspecified routes are open
      const allowedRoles = ROUTE_PERMISSIONS[matchKey];
      return allowedRoles.includes(currentRole);
    },
    [currentRole]
  );

  return {
    currentRole,
    baseRole,
    canSimulate,
    isSimulating,
    roleMeta: ROLE_METADATA[currentRole],
    can,
    hasRole,
    canAccessRoute,
    setSimulatedRole,
    resetRole,
  };
}
