'use client';

import * as React from 'react';
import { useRBAC } from '../../hooks/use-rbac';
import type { AppRole, Permission } from '../../types/rbac.types';
import { AccessDeniedView } from '../access-denied';

interface RoleGateProps {
  allowedRoles?: AppRole[];
  permission?: Permission;
  fallback?: React.ReactNode;
  showDeniedView?: boolean;
  children: React.ReactNode;
}

/**
 * Declarative Role & Permission Gating Component
 * Controls visibility of sensitive UI blocks and entire workstations.
 */
export function RoleGate({
  allowedRoles,
  permission,
  fallback,
  showDeniedView = false,
  children,
}: RoleGateProps) {
  const { hasRole, can } = useRBAC();

  let isAuthorized = true;

  if (allowedRoles && allowedRoles.length > 0) {
    isAuthorized = hasRole(...allowedRoles);
  }

  if (isAuthorized && permission) {
    isAuthorized = can(permission);
  }

  if (!isAuthorized) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    if (showDeniedView) {
      return <AccessDeniedView requiredRoles={allowedRoles} />;
    }
    return null;
  }

  return <>{children}</>;
}
