'use client';

import * as React from 'react';
import { Truck, UserCheck, ThermometerSnowflake, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CollectionRequest } from '../../types';

interface PhlebotomistDispatchStatusProps {
  collection: CollectionRequest;
  onOpenAssignModal: () => void;
}

export function PhlebotomistDispatchStatus({
  collection,
  onOpenAssignModal,
}: PhlebotomistDispatchStatusProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-primary" />
          <span>Phlebotomist Dispatch Status</span>
        </h3>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAssignModal}
          className="h-7 text-xs font-medium"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1" />
          <span>{collection.assignedPhlebotomistName ? 'Reassign Runner' : 'Assign Runner'}</span>
        </Button>
      </div>

      {collection.assignedPhlebotomistName ? (
        <div className="p-3 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
              {collection.assignedPhlebotomistName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">
                {collection.assignedPhlebotomistName}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                <span>Field Runner</span>
                <span>•</span>
                <span>Active Telemetry</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-muted/60 px-2.5 py-1 rounded border border-border">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-500" />
            <span>Cold Box: 4.2°C</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-center">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-foreground">No field runner dispatched yet.</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Assign an available phlebotomist to ensure sample collection within the preferred slot.
          </p>
          <Button
            size="sm"
            onClick={onOpenAssignModal}
            className="mt-2.5 h-8 text-xs font-semibold bg-primary text-primary-foreground"
          >
            Dispatch Runner Now
          </Button>
        </div>
      )}
    </div>
  );
}
