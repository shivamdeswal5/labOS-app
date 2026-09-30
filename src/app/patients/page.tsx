'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ArrowLeft,
  Activity,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { usePatients } from '@/features/patients/api/use-patients';
import { useReports } from '@/features/reports/api/use-reports';
import { PatientListTable } from '@/features/patients/components/patient-list-table';
import { PatientDetailCard } from '@/features/patients/components/patient-detail-card';
import { BiomarkerTrendChart } from '@/features/patients/components/biomarker-trend-chart';
import { PatientHistoryTimeline } from '@/features/patients/components/patient-history-timeline';
import type { Patient } from '@/features/reports/types';

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterMode, setFilterMode] = React.useState<'ALL' | 'RECENT' | 'ABNORMAL'>('ALL');
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);
  const [mobileTab, setMobileTab] = React.useState<'LIST' | 'DETAIL'>('LIST');

  // Load patients
  const {
    data: patients = [],
    isLoading: isPatientsLoading,
    isError: isPatientsError,
    refetch: refetchPatients,
  } = usePatients(searchQuery);

  // Active patient derived directly (defaults to first patient without setState-in-effect)
  const effectivePatientId = selectedPatientId ?? patients[0]?.id ?? null;
  const selectedPatient = React.useMemo(() => {
    return patients.find((p) => p.id === effectivePatientId) || patients[0] || null;
  }, [patients, effectivePatientId]);

  // Load diagnostic encounters for this selected patient
  const {
    data: patientReports = [],
    refetch: refetchReports,
  } = useReports(undefined, selectedPatient?.id);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setMobileTab('DETAIL'); // Switch to detail view on smaller screens
  };

  const handleRefreshAll = () => {
    refetchPatients();
    refetchReports();
  };

  return (
    <AppShell variant="full-bleed">
      <div className="flex flex-col gap-5 w-full">
        {/* Standardized Page Header */}
        <PageHeader
          title="Patients & History"
          subtitle="Patient records, past test results, and multi-visit report history."
          icon={<Users className="w-4 h-4" />}
          breadcrumbs={[{ label: 'Patients & History' }]}
          badge={
            <span className="hidden sm:inline-flex text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              {patients.length} Registered
            </span>
          }
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                className="h-9 gap-1.5 text-xs"
                title="Refresh database records"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Refresh</span>
              </Button>

              <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-semibold">
                <Link href="/reports/new">
                  <UserPlus className="w-4 h-4" />
                  <span>Register Patient</span>
                </Link>
              </Button>
            </>
          }
        />

      {/* Mobile / Tablet Segmented View Switcher (<1280px) */}
      <div className="flex xl:hidden items-center justify-between p-1 bg-muted rounded-lg border border-border">
        <button
          type="button"
          onClick={() => setMobileTab('LIST')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'LIST'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Patient Roster ({patients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('DETAIL')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'DETAIL'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>
            {selectedPatient ? selectedPatient.name.split(' ')[0] : 'Patient'}&apos;s EMR
          </span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isPatientsLoading && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-pulse">
          <div className="xl:col-span-7 h-96 bg-muted/40 rounded-xl border border-border" />
          <div className="xl:col-span-5 h-96 bg-muted/40 rounded-xl border border-border" />
        </div>
      )}

      {/* Error Boundary */}
      {isPatientsError && (
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-center flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <h3 className="font-bold text-sm text-red-900 dark:text-red-300">
            Failed to load patient records
          </h3>
          <p className="text-xs text-red-700 dark:text-red-400">
            There was a connection issue with the laboratory database. Please refresh or retry.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetchPatients()}
            className="mt-2 text-xs"
          >
            Retry Fetch
          </Button>
        </div>
      )}

      {/* Main 2-Column Workstation Layout */}
      {!isPatientsLoading && !isPatientsError && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Master Directory Table */}
          <div
            className={`xl:col-span-7 xl:block ${
              mobileTab === 'LIST' ? 'block' : 'hidden'
            }`}
          >
            <PatientListTable
              patients={patients}
              selectedPatientId={selectedPatient?.id || null}
              onSelectPatient={handleSelectPatient}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterMode={filterMode}
              onFilterChange={setFilterMode}
              onRefresh={refetchPatients}
            />
          </div>

          {/* Right Column: Longitudinal EMR & Clinical Records */}
          <div
            className={`xl:col-span-5 xl:block flex flex-col gap-4 ${
              mobileTab === 'DETAIL' ? 'block' : 'hidden'
            }`}
          >
            {/* Mobile Back Button */}
            <div className="xl:hidden pb-1">
              <button
                type="button"
                onClick={() => setMobileTab('LIST')}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Patient Roster</span>
              </button>
            </div>

            {selectedPatient ? (
              <div className="flex flex-col gap-4">
                {/* Patient Summary Header Card */}
                <PatientDetailCard patient={selectedPatient} />

                {/* Longitudinal Biomarker Trend Chart */}
                <BiomarkerTrendChart reports={patientReports} />

                {/* Encounter Timeline */}
                <PatientHistoryTimeline
                  patient={selectedPatient}
                  reports={patientReports}
                />
              </div>
            ) : (
              <div className="p-12 bg-card rounded-xl border border-border text-center flex flex-col items-center justify-center gap-3">
                <Users className="w-10 h-10 text-muted-foreground/50" />
                <h3 className="font-semibold text-sm text-foreground">
                  No Patient Selected
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Select any patient from the roster table on the left to inspect their longitudinal biomarker graph and diagnostic history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </AppShell>
  );
}
