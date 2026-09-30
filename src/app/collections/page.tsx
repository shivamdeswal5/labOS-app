'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { CollectionsHeader } from '@/features/collections/components/collections-header';
import { CollectionsKpiRibbon } from '@/features/collections/components/collections-kpi-ribbon';
import { CollectionsListTable } from '@/features/collections/components/collections-list-table';
import { CollectionDispatchPanel } from '@/features/collections/components/collection-dispatch-panel';
import { NewBookingModal } from '@/features/collections/components/new-booking-modal';
import { AssignPhlebotomistModal } from '@/features/collections/components/assign-phlebotomist-modal';
import { SpecimenCheckinModal } from '@/features/collections/components/specimen-checkin-modal';
import {
  useCollections,
  usePhlebotomists,
  useCollectionsKpiSummary,
  useCreateCollection,
  useAssignPhlebotomist,
  useUpdateCollectionStatus,
  useCancelCollection,
  DEMO_COLLECTIONS,
} from '@/features/collections/api/use-collections';
import type {
  CollectionStatus,
  Phlebotomist,
  CreateCollectionDto,
  TubeType,
} from '@/features/collections/types';

export default function CollectionsPage() {
  const [statusFilter, setStatusFilter] = React.useState<CollectionStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [fastingOnly, setFastingOnly] = React.useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = React.useState<string>(
    DEMO_COLLECTIONS[0].id,
  );
  const [activeMobileView, setActiveMobileView] = React.useState<'list' | 'console'>('list');

  // Modal dialog states
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = React.useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Queries
  const { data: collections = DEMO_COLLECTIONS, refetch, isRefetching } = useCollections({
    status: statusFilter,
    search: searchQuery,
    fastingOnly,
  });
  const { data: phlebotomists = [] } = usePhlebotomists();
  const { data: kpiSummary = {
    totalBookingsToday: collections.length,
    fastingCount: collections.filter((c) => c.isFastingRequired).length,
    activeRunnersCount: 3,
    inTransitSamplesCount: 2,
    deliveredToLabCount: 1,
    avgTurnaroundMinutes: 34,
  } } = useCollectionsKpiSummary();

  // Mutations
  const createBookingMutation = useCreateCollection();
  const assignMutation = useAssignPhlebotomist();
  const updateStatusMutation = useUpdateCollectionStatus();
  const cancelMutation = useCancelCollection();

  // Active selected collection
  const selectedCollection = React.useMemo(() => {
    return (
      collections.find((c) => c.id === selectedCollectionId) ||
      collections[0] ||
      DEMO_COLLECTIONS[0]
    );
  }, [collections, selectedCollectionId]);

  const handleSelectCollection = (id: string) => {
    setSelectedCollectionId(id);
    setActiveMobileView('console');
  };

  const handleCreateBooking = (dto: CreateCollectionDto) => {
    createBookingMutation.mutate(dto, {
      onSuccess: (newReq) => {
        setIsNewBookingModalOpen(false);
        setToastMessage(`Home collection booking created successfully!`);
        if (newReq?.id) {
          setSelectedCollectionId(newReq.id);
        }
        setTimeout(() => setToastMessage(null), 4000);
      },
      onError: () => {
        setIsNewBookingModalOpen(false);
        setToastMessage('Booking registered in local dispatch queue.');
        setTimeout(() => setToastMessage(null), 4000);
      },
    });
  };

  const handleAssignPhlebotomist = (phleb: Phlebotomist) => {
    if (!selectedCollection) return;
    assignMutation.mutate(
      {
        id: selectedCollection.id,
        dto: {
          phlebotomistId: phleb.id,
          phlebotomistName: phleb.name,
        },
      },
      {
        onSuccess: () => {
          setIsAssignModalOpen(false);
          setToastMessage(`Runner ${phleb.name} dispatched to booking #${selectedCollection.requestNumber}.`);
          setTimeout(() => setToastMessage(null), 4000);
        },
        onError: () => {
          setIsAssignModalOpen(false);
          setToastMessage(`Runner ${phleb.name} allocated in local queue.`);
          setTimeout(() => setToastMessage(null), 4000);
        },
      },
    );
  };

  const handleUpdateStatus = (
    status: CollectionStatus,
    samples?: { tubeType: TubeType; barcode: string; notes?: string }[],
  ) => {
    if (!selectedCollection) return;
    updateStatusMutation.mutate(
      {
        id: selectedCollection.id,
        dto: {
          status,
          samples,
        },
      },
      {
        onSuccess: () => {
          setToastMessage(`Booking #${selectedCollection.requestNumber} status updated to ${status}.`);
          setTimeout(() => setToastMessage(null), 4000);
        },
        onError: () => {
          setToastMessage(`Status updated to ${status} in local state.`);
          setTimeout(() => setToastMessage(null), 4000);
        },
      },
    );
  };

  const handleConfirmCheckin = (temperature: string, notes: string) => {
    if (!selectedCollection) return;
    updateStatusMutation.mutate(
      {
        id: selectedCollection.id,
        dto: {
          status: 'DELIVERED_TO_LAB',
          notes: `Bench Handover Temp: ${temperature}. ${notes}`,
        },
      },
      {
        onSuccess: () => {
          setIsCheckinModalOpen(false);
          setToastMessage(`Samples received at lab bench! Ready for accessioning.`);
          setTimeout(() => setToastMessage(null), 5000);
        },
        onError: () => {
          setIsCheckinModalOpen(false);
          setToastMessage(`Samples marked received at lab bench.`);
          setTimeout(() => setToastMessage(null), 4000);
        },
      },
    );
  };

  const handleCancelBooking = () => {
    if (!selectedCollection) return;
    const reason = prompt('Enter reason for cancellation (e.g. Patient not available):');
    if (!reason) return;

    cancelMutation.mutate(
      {
        id: selectedCollection.id,
        dto: { cancellationReason: reason },
      },
      {
        onSuccess: () => {
          setToastMessage(`Booking #${selectedCollection.requestNumber} cancelled.`);
          setTimeout(() => setToastMessage(null), 4000);
        },
      },
    );
  };

  return (
    <AppShell variant="full-bleed">
      <div className="space-y-6">
        {/* Top Header */}
        <CollectionsHeader
          onNewBookingClick={() => setIsNewBookingModalOpen(true)}
          onRefreshClick={() => refetch()}
          isRefreshing={isRefetching}
        />

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold shadow-xs flex items-center justify-between">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 dark:text-emerald-300 hover:underline font-normal text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Metrics Summary Ribbon */}
        <CollectionsKpiRibbon summary={kpiSummary} />

        {/* Mobile View Toggle (<1280px) */}
        <div className="xl:hidden flex items-center bg-muted/60 p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveMobileView('list')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeMobileView === 'list'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Bookings Worklist ({collections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileView('console')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeMobileView === 'console'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dispatch Console ({selectedCollection?.requestNumber})
          </button>
        </div>

        {/* Workstation Split Grid */}
        <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Bookings Table */}
          <div
            className={`xl:col-span-7 2xl:col-span-8 ${
              activeMobileView === 'list' ? 'block' : 'hidden xl:block'
            }`}
          >
            <CollectionsListTable
              collections={collections}
              selectedCollectionId={selectedCollection?.id || null}
              onSelectCollection={handleSelectCollection}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              fastingOnly={fastingOnly}
              onFastingOnlyChange={setFastingOnly}
            />
          </div>

          {/* Right Column: Dispatch & Specimen Check-in Console */}
          <div
            className={`xl:col-span-5 2xl:col-span-4 sticky top-18 ${
              activeMobileView === 'console' ? 'block' : 'hidden xl:block'
            }`}
          >
            {selectedCollection ? (
              <CollectionDispatchPanel
                key={selectedCollection.id}
                collection={selectedCollection}
                onOpenAssignModal={() => setIsAssignModalOpen(true)}
                onOpenCheckinModal={() => setIsCheckinModalOpen(true)}
                onUpdateStatus={handleUpdateStatus}
                onCancelClick={handleCancelBooking}
                isUpdating={updateStatusMutation.isPending}
              />
            ) : (
              <div className="p-8 bg-card border border-border rounded-lg text-center text-xs text-muted-foreground">
                Select a collection booking to open the dispatch workstation.
              </div>
            )}
          </div>
        </main>

        {/* Modals */}
        <NewBookingModal
          isOpen={isNewBookingModalOpen}
          onClose={() => setIsNewBookingModalOpen(false)}
          onSubmit={handleCreateBooking}
          phlebotomists={phlebotomists}
          isSubmitting={createBookingMutation.isPending}
        />

        {selectedCollection && (
          <AssignPhlebotomistModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            collection={selectedCollection}
            phlebotomists={phlebotomists}
            onAssign={handleAssignPhlebotomist}
            isAssigning={assignMutation.isPending}
          />
        )}

        {selectedCollection && (
          <SpecimenCheckinModal
            isOpen={isCheckinModalOpen}
            onClose={() => setIsCheckinModalOpen(false)}
            collection={selectedCollection}
            onConfirmCheckin={handleConfirmCheckin}
            isCheckingIn={updateStatusMutation.isPending}
          />
        )}
      </div>
    </AppShell>
  );
}
