'use client';

import * as React from 'react';
import { X, UserCheck, MapPin, Truck, ThermometerSnowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CollectionRequest, Phlebotomist } from '../types';

interface AssignPhlebotomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: CollectionRequest;
  phlebotomists: Phlebotomist[];
  onAssign: (phlebotomist: Phlebotomist) => void;
  isAssigning?: boolean;
}

export function AssignPhlebotomistModal({
  isOpen,
  onClose,
  collection,
  phlebotomists,
  onAssign,
  isAssigning = false,
}: AssignPhlebotomistModalProps) {
  const [selectedPhlebId, setSelectedPhlebId] = React.useState<string>(
    collection.assignedPhlebotomistId || phlebotomists[0]?.id || '',
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    const phleb = phlebotomists.find((p) => p.id === selectedPhlebId);
    if (phleb) {
      onAssign(phleb);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Assign Phlebotomist Runner</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Booking {collection.requestNumber} • {collection.timeSlot}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient / Address Quick Context */}
        <div className="px-5 py-3 bg-secondary/40 border-b border-border text-xs">
          <div className="font-semibold text-foreground">{collection.patientName}</div>
          <div className="flex items-start gap-1 text-muted-foreground mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-1">{collection.address}</span>
          </div>
        </div>

        {/* Phlebotomist Roster List */}
        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          <label className="block text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            Available Field Runners
          </label>

          {phlebotomists.map((phleb) => {
            const isSelected = phleb.id === selectedPhlebId;
            return (
              <div
                key={phleb.id}
                onClick={() => setSelectedPhlebId(phleb.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-2xs'
                    : 'border-border bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {phleb.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-xs sm:text-sm">
                        {phleb.name}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                          phleb.status === 'AVAILABLE'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {phleb.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>{phleb.vehicleNumber}</span>
                      </span>
                      <span>•</span>
                      <span>{phleb.currentZone}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                    <ThermometerSnowflake className="w-3 h-3 text-blue-500" />
                    <span>{phleb.coldBoxTemp}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    {phleb.activeAssignmentsCount} active tasks
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-border bg-card flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isAssigning || !selectedPhlebId}
            className="bg-primary text-primary-foreground font-semibold"
          >
            {isAssigning ? 'Dispatching...' : 'Confirm Dispatch & Send SMS'}
          </Button>
        </div>
      </div>
    </div>
  );
}
