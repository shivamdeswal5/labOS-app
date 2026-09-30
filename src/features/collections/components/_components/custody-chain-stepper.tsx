'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock, UserCheck, Truck, CheckCircle2, FileText, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CollectionRequest, CollectionStatus } from '../../types';

interface CustodyChainStepperProps {
  collection: CollectionRequest;
  onOpenAssignModal: () => void;
  onOpenCheckinModal: () => void;
  onUpdateStatus: (status: CollectionStatus) => void;
  onCancelClick: () => void;
  isUpdating?: boolean;
}

const STEPS = [
  { key: 'REQUESTED', label: '1. Booked' },
  { key: 'ASSIGNED', label: '2. Assigned' },
  { key: 'IN_TRANSIT', label: '3. Transit' },
  { key: 'SAMPLE_COLLECTED', label: '4. Collected' },
  { key: 'DELIVERED_TO_LAB', label: '5. Lab Bench' },
] as const;

const STATUS_ORDER: Record<CollectionStatus, number> = {
  REQUESTED: 1,
  ASSIGNED: 2,
  IN_TRANSIT: 3,
  SAMPLE_COLLECTED: 4,
  DELIVERED_TO_LAB: 5,
  CANCELLED: 0,
};

export function CustodyChainStepper({
  collection,
  onOpenAssignModal,
  onOpenCheckinModal,
  onUpdateStatus,
  onCancelClick,
  isUpdating = false,
}: CustodyChainStepperProps) {
  const currentStep = STATUS_ORDER[collection.status];

  return (
    <div className="pt-2 border-t border-border">
      <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground mb-3 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <span>Specimen Custody Chain</span>
      </h3>

      <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-mono mb-4">
        {STEPS.map((step, idx) => {
          const isPast = currentStep >= idx + 1;
          const isCurrent = currentStep === idx + 1;

          return (
            <div
              key={step.key}
              className={`p-1.5 rounded border transition-colors ${
                isCurrent
                  ? 'bg-primary text-primary-foreground border-primary font-bold'
                  : isPast
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-muted/40 text-muted-foreground border-border'
              }`}
            >
              {step.label}
            </div>
          );
        })}
      </div>

      {/* Contextual Action Triggers */}
      <div className="flex flex-col gap-2">
        {collection.status === 'REQUESTED' && (
          <Button
            onClick={onOpenAssignModal}
            className="w-full text-xs font-semibold bg-primary text-primary-foreground h-9"
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            <span>Assign &amp; Dispatch Phlebotomist</span>
          </Button>
        )}

        {collection.status === 'ASSIGNED' && (
          <Button
            onClick={() => onUpdateStatus('IN_TRANSIT')}
            disabled={isUpdating}
            className="w-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white h-9"
          >
            <Truck className="w-4 h-4 mr-1.5" />
            <span>Mark Runner En Route (In Transit)</span>
          </Button>
        )}

        {collection.status === 'IN_TRANSIT' && (
          <Button
            onClick={() => onUpdateStatus('SAMPLE_COLLECTED')}
            disabled={isUpdating}
            className="w-full text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white h-9"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>Confirm Sample Drawn &amp; In Cold Box</span>
          </Button>
        )}

        {collection.status === 'SAMPLE_COLLECTED' && (
          <Button
            onClick={onOpenCheckinModal}
            className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-9"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>Check-in at Lab Bench (Verify Cold Box)</span>
          </Button>
        )}

        {collection.status === 'DELIVERED_TO_LAB' && (
          <Link
            href={`/reports/new?patientName=${encodeURIComponent(
              collection.patientName,
            )}&patientPhone=${encodeURIComponent(collection.patientPhone)}&address=${encodeURIComponent(
              collection.address,
            )}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs h-9"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Lab Accession (#R-XXXX)</span>
          </Link>
        )}

        {collection.status !== 'DELIVERED_TO_LAB' && collection.status !== 'CANCELLED' && (
          <button
            type="button"
            onClick={onCancelClick}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 hover:underline text-center py-1 mt-1 font-medium inline-flex items-center justify-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Booking</span>
          </button>
        )}
      </div>
    </div>
  );
}
