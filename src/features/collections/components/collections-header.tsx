'use client';

import * as React from 'react';
import { Truck, Plus, RefreshCw, ThermometerSnowflake, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollectionsHeaderProps {
  onNewBookingClick: () => void;
  onRefreshClick: () => void;
  isRefreshing?: boolean;
}

export function CollectionsHeader({
  onNewBookingClick,
  onRefreshClick,
  isRefreshing = false,
}: CollectionsHeaderProps) {
  return (
    <div className="border-b border-border pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Breadcrumb & Title */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
            <span>Workstation</span>
            <span>/</span>
            <span className="font-semibold text-foreground">Phlebotomy Dispatch</span>
            <span>/</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              cold-chain live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Home Collection Bookings & Dispatch</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Two-wheeler phlebotomy routing, cold-box sample custody, and vacutainer barcode intake.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/80 border border-border text-xs font-mono text-muted-foreground">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Target: 2°C – 8°C</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/80 border border-border text-xs font-mono text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>ISO 15189 Custody</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshClick}
            disabled={isRefreshing}
            className="gap-1.5 text-xs font-medium h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Fleet</span>
          </Button>

          <Button
            size="sm"
            onClick={onNewBookingClick}
            className="gap-1.5 text-xs font-semibold h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection Booking</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
