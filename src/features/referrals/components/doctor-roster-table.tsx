'use client';

import * as React from 'react';
import { Search, X, ChevronRight, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { EllipsisCell, TablePagination } from '@/components/shared';
import type { ReferringDoctor } from '../types';

interface DoctorRosterTableProps {
  doctors: ReferringDoctor[];
  selectedDoctorId: string | null;
  onSelectDoctor: (doctor: ReferringDoctor) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMode: 'ALL' | 'PENDING' | 'SETTLED';
  onFilterChange: (mode: 'ALL' | 'PENDING' | 'SETTLED') => void;
  onRefresh?: () => void;
}

export function DoctorRosterTable({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterChange,
  onRefresh,
}: DoctorRosterTableProps) {
  // Filter doctors
  const filteredDoctors = React.useMemo(() => {
    return doctors.filter((doc) => {
      if (filterMode === 'PENDING' && doc.pendingAmount <= 0) return false;
      if (filterMode === 'SETTLED' && doc.pendingAmount > 0) return false;
      return true;
    });
  }, [doctors, filterMode]);

  const pendingCount = React.useMemo(
    () => doctors.filter((d) => d.pendingAmount > 0).length,
    [doctors],
  );
  const settledCount = React.useMemo(
    () => doctors.filter((d) => d.pendingAmount <= 0).length,
    [doctors],
  );

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
      {/* Search & Filter Controls */}
      <div className="p-3.5 border-b border-border flex flex-col gap-2.5 bg-card">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by doctor name, medical registration, or clinic..."
              className="w-full h-8 pl-8 pr-8 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Refresh clinicians list"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 p-0.5 bg-muted rounded-md text-xs">
          <button
            type="button"
            onClick={() => onFilterChange('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              filterMode === 'ALL'
                ? 'bg-card text-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Clinicians ({doctors.length})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('PENDING')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              filterMode === 'PENDING'
                ? 'bg-card text-amber-700 dark:text-amber-400 font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Pending Payouts ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('SETTLED')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              filterMode === 'SETTLED'
                ? 'bg-card text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Fully Settled ({settledCount})</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground font-mono text-[10px] uppercase tracking-wider border-b border-border">
              <th className="py-2.5 px-3">Doctor Name &amp; Spec</th>
              <th className="py-2.5 px-3">Affiliation</th>
              <th className="py-2.5 px-2.5">Model</th>
              <th className="py-2.5 px-3 text-right">Referrals</th>
              <th className="py-2.5 px-3 text-right">Owed</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredDoctors.map((doctor) => {
              const isSelected = doctor.id === selectedDoctorId;
              const hasPending = doctor.pendingAmount > 0;

              return (
                <tr
                  key={doctor.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectDoctor(doctor)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDoctor(doctor);
                    }
                  }}
                  className={`cursor-pointer transition-colors focus:outline-hidden focus-visible:bg-muted/40 ${
                    isSelected
                      ? 'bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary font-medium'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  {/* Doctor Name & Spec */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-start gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          isSelected
                            ? 'bg-primary'
                            : hasPending
                              ? 'bg-amber-500'
                              : 'bg-transparent'
                        }`}
                      />
                      <div className="flex flex-col min-w-0">
                        <EllipsisCell
                          value={doctor.name}
                          className="font-semibold text-foreground"
                        />
                        <span className="text-[11px] text-muted-foreground truncate">
                          {doctor.specialty || 'General Practice'} • Reg: {doctor.registrationNumber || 'MCI-REG'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/80 font-mono">
                          {doctor.phone || '-'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Affiliation / Clinic */}
                  <td className="py-2.5 px-3 min-w-[120px]">
                    <div className="flex flex-col">
                      <EllipsisCell
                        value={doctor.clinic ? doctor.clinic.split(',')[0] : 'Direct Outpatient'}
                        className="font-medium text-foreground"
                      />
                      <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                        {doctor.clinic && doctor.clinic.includes(',')
                          ? doctor.clinic.split(',').slice(1).join(',').trim()
                          : 'Delhi NCR'}
                      </span>
                    </div>
                  </td>

                  {/* Commission Model Chip */}
                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                    {doctor.commissionType === 'PERCENTAGE' && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold border border-border">
                        Percentage ({doctor.commissionValue}%)
                      </span>
                    )}
                    {doctor.commissionType === 'FLAT' && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold border border-border">
                        Flat (₹{doctor.commissionValue}/pt)
                      </span>
                    )}
                    {doctor.commissionType === 'NONE' && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        None (Hospital Tie-up)
                      </span>
                    )}
                  </td>

                  {/* Referrals Count */}
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {doctor.activeCasesCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">cases</span>
                  </td>

                  {/* Owed Amount */}
                  <td className="py-2.5 px-3 text-right">
                    {hasPending ? (
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                          {formatCurrency(doctor.pendingAmount)}
                        </span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                          Pending
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          ₹0
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                          Settled
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {isSelected ? (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-[11px] font-semibold inline-flex items-center gap-0.5 shadow-sm">
                        <span>Selected</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDoctor(doctor);
                        }}
                        className="px-2 py-0.5 bg-muted hover:bg-muted/80 text-foreground rounded text-[11px] font-medium border border-border transition-colors"
                      >
                        View Ledger
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* URL-Synchronized Table Pagination */}
      <TablePagination totalCount={filteredDoctors.length} />
    </div>
  );
}
