'use client';

import * as React from 'react';
import { Phone, MapPin, ExternalLink, Send } from 'lucide-react';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';
import type { CollectionRequest } from '../../types';

interface PatientBookingCardProps {
  collection: CollectionRequest;
}

export function PatientBookingCard({ collection }: PatientBookingCardProps) {
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'Diagnostic Laboratory';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${collection.address}, Bengaluru`,
  )}`;

  const whatsappText = encodeURIComponent(
    `Hello ${collection.patientName}, your home sample collection booking (#${collection.requestNumber}) with ${labName} is scheduled for ${collection.timeSlot}. ${
      collection.assignedPhlebotomistName
        ? `Our technician ${collection.assignedPhlebotomistName} will arrive at your address.`
        : ''
    }`,
  );

  return (
    <div className="p-4 sm:p-5 border-b border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold text-foreground">
              {collection.requestNumber}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-mono">
              {collection.preferredDate}
            </span>
            {collection.isFastingRequired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-mono text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                12-HR FASTING REQUIRED
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>{collection.patientName}</span>
            <span className="text-xs font-normal text-muted-foreground">
              ({collection.patientAge}Y / {collection.patientSex})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${collection.patientPhone.replace(/[^0-9]/g, '')}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-secondary text-xs font-medium text-foreground transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`tel:${collection.patientPhone}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-secondary text-xs font-medium text-foreground transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>Call</span>
          </a>
        </div>
      </div>

      {/* Address & Slot */}
      <div className="mt-3 p-3 rounded-md bg-secondary/50 border border-border/80 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground font-medium">{collection.address}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Slot: <span className="font-semibold text-foreground">{collection.timeSlot}</span>
              </p>
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0"
          >
            <span>Map Directions</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {collection.specialInstructions && (
          <div className="mt-2.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="font-semibold text-foreground">Instructions:</span>
            <span>{collection.specialInstructions}</span>
          </div>
        )}
      </div>
    </div>
  );
}
