'use client';

import * as React from 'react';
import {
  Search,
  X,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { EllipsisCell, TablePagination } from '@/components/shared';
import type { Patient } from '@/features/reports/types';

interface PatientListTableProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (patient: Patient) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMode: 'ALL' | 'RECENT' | 'ABNORMAL';
  onFilterChange: (mode: 'ALL' | 'RECENT' | 'ABNORMAL') => void;
  onRefresh?: () => void;
}

export function PatientListTable({
  patients,
  selectedPatientId,
  onSelectPatient,
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterChange,
  onRefresh,
}: PatientListTableProps) {
  // Apply filter mode
  const filteredPatients = React.useMemo(() => {
    return patients.filter((p) => {
      if (filterMode === 'ABNORMAL' && !p.hasAbnormal) return false;
      return true;
    });
  }, [patients, filterMode]);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
      {/* Search & Filter Strip */}
      <div className="p-3.5 border-b border-border flex flex-col gap-2.5 bg-card">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, phone (+91), or MRN..."
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
              title="Refresh list"
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
            All Patients ({patients.length})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('RECENT')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              filterMode === 'RECENT'
                ? 'bg-card text-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Recent (30D)
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('ABNORMAL')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              filterMode === 'ABNORMAL'
                ? 'bg-card text-red-600 dark:text-red-400 font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>Has Abnormal</span>
          </button>
        </div>
      </div>

      {/* Table Roster View */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground font-mono text-[10px] uppercase tracking-wider border-b border-border">
              <th className="py-2.5 px-3">Patient & ID</th>
              <th className="py-2.5 px-3">Contact</th>
              <th className="py-2.5 px-3">Last Visit / Test</th>
              <th className="py-2.5 px-2 text-center">Reports</th>
              <th className="py-2.5 px-3">Referring Doctor</th>
              <th className="py-2.5 px-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredPatients.map((patient) => {
              const isSelected = patient.id === selectedPatientId;

              return (
                <tr
                  key={patient.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectPatient(patient)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectPatient(patient);
                    }
                  }}
                  className={`cursor-pointer transition-colors focus:outline-hidden focus-visible:bg-muted/40 ${
                    isSelected
                      ? 'bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary font-medium'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  {/* Patient & ID */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1 h-7 rounded-full shrink-0 ${
                          patient.hasAbnormal ? 'bg-red-600' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex flex-col min-w-0">
                        <EllipsisCell value={patient.name} className="font-semibold text-foreground" />
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                          <span>{patient.age ? `${patient.age}y` : ''} / {patient.sex?.[0] || 'U'}</span>
                          <span>•</span>
                          <span>{patient.patientNumber}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="text-foreground">{patient.phone || '-'}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                        {patient.address || 'Delhi'}
                      </span>
                    </div>
                  </td>

                  {/* Last Visit / Test */}
                  <td className="py-2.5 px-3 min-w-[130px]">
                    <div className="flex flex-col">
                      <span
                        className={`font-medium truncate ${
                          patient.hasAbnormal ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-foreground'
                        }`}
                      >
                        {patient.lastVisitTest || 'Routine Checkup'}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {patient.lastVisitDate || '24-Oct-2024'}
                      </span>
                    </div>
                  </td>

                  {/* Reports Count Badge */}
                  <td className="py-2.5 px-2 text-center">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold border border-border">
                      {patient.reportsCount ?? 1}
                    </span>
                  </td>

                  {/* Referring Doctor */}
                  <td className="py-2.5 px-3">
                    <EllipsisCell
                      value={patient.primaryClinician || 'Direct Walk-in'}
                      className="text-muted-foreground text-[11px]"
                    />
                  </td>

                  {/* Chevron Navigation */}
                  <td className="py-2.5 px-2 text-right">
                    <ChevronRight
                      className={`w-4 h-4 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground/40'
                      }`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <TablePagination totalCount={filteredPatients.length} />
    </div>
  );
}
