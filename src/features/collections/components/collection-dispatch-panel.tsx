'use client';

import * as React from 'react';
import type {
  CollectionRequest,
  CollectionStatus,
  TubeType,
  CollectionSample,
} from '../types';
import {
  PatientBookingCard,
  PhlebotomistDispatchStatus,
  SpecimenVacutainerRack,
  CustodyChainStepper,
} from './_components';

interface CollectionDispatchPanelProps {
  collection: CollectionRequest;
  onOpenAssignModal: () => void;
  onOpenCheckinModal: () => void;
  onUpdateStatus: (
    status: CollectionStatus,
    samples?: { tubeType: TubeType; barcode: string; notes?: string }[],
  ) => void;
  onCancelClick: () => void;
  isUpdating?: boolean;
}

export function CollectionDispatchPanel({
  collection,
  onOpenAssignModal,
  onOpenCheckinModal,
  onUpdateStatus,
  onCancelClick,
  isUpdating = false,
}: CollectionDispatchPanelProps) {
  const [addedSamples, setAddedSamples] = React.useState<CollectionSample[]>([]);
  const [prevCollectionId, setPrevCollectionId] = React.useState(collection.id);

  if (collection.id !== prevCollectionId) {
    setPrevCollectionId(collection.id);
    setAddedSamples([]);
  }

  const allSamples = React.useMemo(() => {
    return [...collection.samples, ...addedSamples];
  }, [collection.samples, addedSamples]);

  const handleAddSampleTube = (tubeType: TubeType, barcode: string) => {
    const added: CollectionSample = {
      id: `samp-${Date.now()}`,
      collectionRequestId: collection.id,
      tubeType,
      barcode,
      notes: `${tubeType} Vacutainer`,
      createdAt: new Date().toISOString(),
    };

    const updated = [...allSamples, added];
    setAddedSamples((prev) => [...prev, added]);

    onUpdateStatus(
      collection.status,
      updated.map((s) => ({
        tubeType: s.tubeType,
        barcode: s.barcode,
        notes: s.notes || undefined,
      })),
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden flex flex-col h-full">
      {/* Patient & Location Card */}
      <PatientBookingCard collection={collection} />

      {/* Main Console Content */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
        {/* Section 1: Phlebotomist Assignment */}
        <PhlebotomistDispatchStatus
          collection={collection}
          onOpenAssignModal={onOpenAssignModal}
        />

        {/* Section 2: Tests & Specimen Vacutainers */}
        <SpecimenVacutainerRack
          collection={collection}
          localSamples={allSamples}
          onAddSampleTube={handleAddSampleTube}
        />

        {/* Section 3: Custody Lifecycle & Status Workflow */}
        <CustodyChainStepper
          collection={collection}
          onOpenAssignModal={onOpenAssignModal}
          onOpenCheckinModal={onOpenCheckinModal}
          onUpdateStatus={(status) => onUpdateStatus(status)}
          onCancelClick={onCancelClick}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
}
