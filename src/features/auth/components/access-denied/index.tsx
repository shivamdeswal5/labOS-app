'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, Barcode, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRBAC } from '../../hooks/use-rbac';
import type { AppRole } from '../../types/rbac.types';
import { ROLE_METADATA } from '../../types/rbac.types';

interface AccessDeniedViewProps {
  requiredRoles?: AppRole[];
  customMessage?: string;
}

export function AccessDeniedView({ requiredRoles = ['OWNER'], customMessage }: AccessDeniedViewProps) {
  const { currentRole, roleMeta } = useRBAC();

  const getAuthorizedHome = () => {
    switch (currentRole) {
      case 'PHLEBOTOMIST':
        return { href: '/collections', label: 'Home Collections Workstation', icon: Truck };
      case 'PATHOLOGIST':
        return { href: '/accessions', label: 'Sample Worklist & Reviews', icon: Barcode };
      case 'TECHNICIAN':
        return { href: '/accessions', label: 'Accession & Worklist', icon: Barcode };
      case 'OWNER':
      default:
        return { href: '/', label: 'Mission Control Dashboard', icon: Home };
    }
  };

  const home = getAuthorizedHome();
  const HomeIcon = home.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border/80 rounded-2xl p-6 sm:p-8 text-center shadow-lg space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Restricted Clinical Workstation
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {customMessage ||
              'Access to this module is restricted under NABL ISO 15189 and internal laboratory operational governance.'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-muted/60 border border-border/60 text-xs space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your Active Role:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${roleMeta.badgeColorClass}`}>
              {roleMeta.displayName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Authorized Roles:</span>
            <span className="font-mono text-[11px] text-foreground font-medium">
              {requiredRoles.map((r) => ROLE_METADATA[r]?.badgeLabel || r).join(', ')}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs gap-1.5">
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="w-full sm:w-auto text-xs gap-1.5 font-semibold">
            <Link href={home.href}>
              <HomeIcon className="w-3.5 h-3.5" />
              <span>{home.label}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
