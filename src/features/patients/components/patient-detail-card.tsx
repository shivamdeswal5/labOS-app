'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Phone,
  MapPin,
  FilePlus2,
  Droplet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Patient } from '@/features/reports/types';

interface PatientDetailCardProps {
  patient: Patient;
}

export function PatientDetailCard({ patient }: PatientDetailCardProps) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-3">
      {/* Top Identity Block */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {patient.name}
            </h2>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
              {patient.patientNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{patient.age ? `${patient.age}y` : ''} / {patient.sex || 'Unknown'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Droplet className="w-3 h-3 text-red-600" />
              <span>Blood Group: <strong className="text-foreground">{patient.bloodGroup || 'B+'}</strong></span>
            </span>
          </div>
        </div>

        {/* Quick New Accession for this patient */}
        <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs">
          <Link href={`/reports/new?patientId=${patient.id}`}>
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>+ Register Sample</span>
          </Link>
        </Button>
      </div>

      {/* Demographics & Contact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/80 text-xs">
        <div className="p-2.5 bg-muted/40 rounded-lg border border-border/60 flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-mono font-semibold text-muted-foreground">Phone Number</span>
            <span className="font-mono font-semibold text-foreground truncate">{patient.phone || '-'}</span>
          </div>
        </div>

        <div className="p-2.5 bg-muted/40 rounded-lg border border-border/60 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-mono font-semibold text-muted-foreground">Address / Area</span>
            <span className="font-medium text-foreground truncate">{patient.address || 'Model Town, Delhi'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
