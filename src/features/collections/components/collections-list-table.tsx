'use client';

import * as React from 'react';
import {
  Search,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  User,
  ChevronRight,
  Truck,
  Filter,
} from 'lucide-react';
import type { CollectionRequest, CollectionStatus } from '../types';

interface CollectionsListTableProps {
  collections: CollectionRequest[];
  selectedCollectionId: string | null;
  onSelectCollection: (id: string) => void;
  statusFilter: CollectionStatus | 'ALL';
  onStatusFilterChange: (status: CollectionStatus | 'ALL') => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  fastingOnly: boolean;
  onFastingOnlyChange: (fasting: boolean) => void;
}

export function CollectionsListTable({
  collections,
  selectedCollectionId,
  onSelectCollection,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  fastingOnly,
  onFastingOnlyChange,
}: CollectionsListTableProps) {
  // Counts by status
  const counts = React.useMemo(() => {
    return {
      ALL: collections.length,
      REQUESTED: collections.filter((c) => c.status === 'REQUESTED').length,
      ASSIGNED: collections.filter((c) => c.status === 'ASSIGNED').length,
      IN_TRANSIT: collections.filter((c) => c.status === 'IN_TRANSIT').length,
      SAMPLE_COLLECTED: collections.filter((c) => c.status === 'SAMPLE_COLLECTED').length,
      DELIVERED_TO_LAB: collections.filter((c) => c.status === 'DELIVERED_TO_LAB').length,
    };
  }, [collections]);

  // Filtered collections
  const filtered = React.useMemo(() => {
    return collections.filter((item) => {
      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      // Fasting filter
      if (fastingOnly && !item.isFastingRequired) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.patientName.toLowerCase().includes(q);
        const matchesPhone = item.patientPhone.includes(q);
        const matchesAddress = item.address.toLowerCase().includes(q);
        const matchesReq = item.requestNumber.toLowerCase().includes(q);
        const matchesRunner = item.assignedPhlebotomistName?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesAddress && !matchesReq && !matchesRunner) {
          return false;
        }
      }

      return true;
    });
  }, [collections, statusFilter, fastingOnly, searchQuery]);

  const renderStatusBadge = (status: CollectionStatus) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Dispatch
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Runner Assigned
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <Truck className="w-3 h-3 text-purple-600 dark:text-purple-400 animate-bounce" />
            In Transit
          </span>
        );
      case 'SAMPLE_COLLECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Collected (Cold Box)
          </span>
        );
      case 'DELIVERED_TO_LAB':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Bench Checked-in
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-muted text-muted-foreground border border-border">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-3 sm:p-4 border-b border-border bg-card/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search patient, phone, locality, booking #..."
            className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-md text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/70 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-secondary/60 transition-colors">
            <input
              type="checkbox"
              checked={fastingOnly}
              onChange={(e) => onFastingOnlyChange(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span className="font-medium text-foreground">Fasting Only</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          </label>
        </div>
      </div>

      {/* Segmented Status Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-2 border-b border-border bg-muted/40 scrollbar-none">
        {(
          [
            { key: 'ALL', label: 'All Bookings', count: counts.ALL },
            { key: 'REQUESTED', label: 'Pending Dispatch', count: counts.REQUESTED },
            { key: 'ASSIGNED', label: 'Assigned', count: counts.ASSIGNED },
            { key: 'IN_TRANSIT', label: 'In Transit', count: counts.IN_TRANSIT },
            { key: 'SAMPLE_COLLECTED', label: 'Collected', count: counts.SAMPLE_COLLECTED },
            { key: 'DELIVERED_TO_LAB', label: 'Lab Check-in', count: counts.DELIVERED_TO_LAB },
          ] as const
        ).map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusFilterChange(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground font-mono uppercase tracking-wider text-[11px] border-b border-border">
              <th className="py-2.5 px-4 font-semibold">Booking / Slot</th>
              <th className="py-2.5 px-4 font-semibold">Patient Demographics</th>
              <th className="py-2.5 px-4 font-semibold">Address / Locality</th>
              <th className="py-2.5 px-4 font-semibold">Tests & Tubes</th>
              <th className="py-2.5 px-4 font-semibold">Field Runner</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted-foreground">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No home collection bookings found matching criteria.</p>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isSelected = item.id === selectedCollectionId;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectCollection(item.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/5 dark:bg-primary/10 font-medium'
                        : 'hover:bg-muted/40 bg-card'
                    }`}
                  >
                    {/* Booking / Slot */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">
                          {item.requestNumber}
                        </span>
                        {item.isFastingRequired && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold"
                            title="12-hour Fasting Required"
                          >
                            FASTING
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-[11px] mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground/70" />
                        <span>{item.timeSlot}</span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground text-xs sm:text-sm">
                        {item.patientName}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-[11px] mt-0.5">
                        <span>
                          {item.patientAge}Y / {item.patientSex[0]}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{item.patientPhone}</span>
                      </div>
                    </td>

                    {/* Locality */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="flex items-start gap-1 text-foreground truncate">
                        <MapPin className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="font-medium">{item.locality || 'Bengaluru'}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate mt-0.5">
                        {item.address}
                      </p>
                    </td>

                    {/* Tests & Tubes */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {item.testNames.map((test, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px] font-medium border border-border/80 truncate max-w-[150px]"
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-1">
                        {item.samples.length > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {item.samples.length} tubes scanned
                          </span>
                        ) : (
                          <span>Requires vacutainers</span>
                        )}
                      </div>
                    </td>

                    {/* Runner */}
                    <td className="py-3 px-4">
                      {item.assignedPhlebotomistName ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {item.assignedPhlebotomistName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px] italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">{renderStatusBadge(item.status)}</td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCollection(item.id);
                        }}
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-foreground border-border hover:bg-secondary'
                        }`}
                      >
                        <span>Dispatch</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (<768px) */}
      <div className="md:hidden divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No collection bookings matching filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = item.id === selectedCollectionId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectCollection(item.id)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-primary/5' : 'bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono font-bold text-foreground text-xs">
                    {item.requestNumber}
                  </span>
                  {renderStatusBadge(item.status)}
                </div>

                <div className="font-semibold text-foreground text-sm">{item.patientName}</div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>
                    {item.patientAge}Y / {item.patientSex[0]}
                  </span>
                  <span>•</span>
                  <a
                    href={`tel:${item.patientPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-mono"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{item.patientPhone}</span>
                  </a>
                </div>

                <div className="flex items-start gap-1 text-xs text-muted-foreground mt-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <span className="line-clamp-1">{item.address}</span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{item.timeSlot}</span>
                  </div>

                  <span className="font-medium text-foreground">
                    {item.assignedPhlebotomistName || 'Unassigned'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span>Showing {filtered.length} of {collections.length} bookings</span>
        <span>Standard Specimen Cold-Chain Active</span>
      </div>
    </div>
  );
}
