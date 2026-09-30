'use client';

import * as React from 'react';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';

interface SidebarStationInfoProps {
  collapsed: boolean;
}

export function SidebarStationInfo({ collapsed }: SidebarStationInfoProps) {
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'LabOS Station';
  const nablText = labProfile?.nablId ? `NABL: ${labProfile.nablId}` : 'NABL Standard Compliant';

  if (collapsed) return null;

  return (
    <div className="px-3.5 py-2.5 border-b border-border bg-card shrink-0">
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
  );
}
