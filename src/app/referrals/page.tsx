'use client';

import * as React from 'react';
import {
  Stethoscope,
  UserPlus,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Download,
  Truck,
  Package,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { useDoctors } from '@/features/referrals/api/use-doctors';
import {
  useCommissionSummary,
  useDoctorLedger,
} from '@/features/referrals/api/use-commission';
import {
  useOutsourcedTests,
  useUpdateOutsourcedStatus,
  computeOutsourcedStats,
} from '@/features/referrals/api/use-outsourced';
import {
  KpiSummaryRibbon,
  DoctorRosterTable,
  DoctorLedgerPanel,
  AddDoctorModal,
  SettleModal,
  OutsourcedSummaryRibbon,
  OutsourcedTable,
  NewOutsourcedModal,
  ReceiveResultModal,
} from '@/features/referrals/components';
import { exportToCsv } from '@/lib/csv-exporter';
import { useRBAC } from '@/features/auth/hooks/use-rbac';
import { AccessDeniedView } from '@/features/auth/components/access-denied';
import type {
  ReferringDoctor,
  CommissionLedgerEntry,
  OutsourcedTest,
  OutsourcedTestStatus,
} from '@/features/referrals/types';

export default function ReferralsPage() {
  const { can, hasRole } = useRBAC();
  const canViewCommissions = can('REFERRALS:COMMISSIONS_VIEW');
  const isAuthorized = hasRole('OWNER', 'PATHOLOGIST', 'TECHNICIAN');

  const [selectedTab, setSelectedTab] = React.useState<'doctors' | 'outsourced'>('doctors');

  // Derive effective active tab based on permissions with zero cascading renders
  const activeTab: 'doctors' | 'outsourced' = canViewCommissions ? selectedTab : 'outsourced';

  const setActiveTab = (tab: 'doctors' | 'outsourced') => {
    setSelectedTab(tab);
  };

  // --- Doctor Referrals State ---
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterMode, setFilterMode] = React.useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL');
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string | null>(null);
  const [mobileTab, setMobileTab] = React.useState<'ROSTER' | 'LEDGER'>('ROSTER');

  // Doctor Modals
  const [isAddDoctorOpen, setIsAddDoctorOpen] = React.useState(false);
  const [settleModalState, setSettleModalState] = React.useState<{
    isOpen: boolean;
    doctor: ReferringDoctor | null;
    entries: CommissionLedgerEntry[];
  }>({
    isOpen: false,
    doctor: null,
    entries: [],
  });

  // Doctor Queries
  const {
    data: doctors = [],
    isLoading: isDoctorsLoading,
    isError: isDoctorsError,
    refetch: refetchDoctors,
  } = useDoctors(searchQuery);

  const {
    data: summary = {
      totalPending: 0,
      totalSettled: 0,
      doctorCount: 0,
      totalReferralsMTD: 0,
      disbursedMTD: 0,
    },
    refetch: refetchSummary,
  } = useCommissionSummary();

  const effectiveDoctorId = selectedDoctorId ?? doctors[0]?.id ?? null;
  const selectedDoctor = React.useMemo(() => {
    return doctors.find((d) => d.id === effectiveDoctorId) || doctors[0] || null;
  }, [doctors, effectiveDoctorId]);

  const {
    data: ledgerEntries = [],
    refetch: refetchLedger,
  } = useDoctorLedger(selectedDoctor?.id);

  // --- Outsourced Send-Outs State ---
  const [outsourcedSearch, setOutsourcedSearch] = React.useState('');
  const [outsourcedStatusFilter, setOutsourcedStatusFilter] = React.useState<'ALL' | OutsourcedTestStatus>('ALL');
  const [isNewOutsourcedOpen, setIsNewOutsourcedOpen] = React.useState(false);
  const [receiveModalState, setReceiveModalState] = React.useState<{
    isOpen: boolean;
    test: OutsourcedTest | null;
  }>({
    isOpen: false,
    test: null,
  });

  // Inline toast for dispatch / status mutations
  const [dispatchToast, setDispatchToast] = React.useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showDispatchToast = React.useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      setDispatchToast({ visible: true, type, message });
      setTimeout(() => setDispatchToast(null), 4000);
    },
    [],
  );

  // Outsourced Queries & Mutations
  const {
    data: outsourcedTests = [],
    refetch: refetchOutsourced,
  } = useOutsourcedTests();

  const outsourcedStats = React.useMemo(
    () => computeOutsourcedStats(outsourcedTests),
    [outsourcedTests],
  );

  const updateOutsourcedMutation = useUpdateOutsourcedStatus();

  // Handlers
  const handleSelectDoctor = (doctor: ReferringDoctor) => {
    setSelectedDoctorId(doctor.id);
    setMobileTab('LEDGER');
  };

  const handleRefreshAll = () => {
    if (activeTab === 'doctors') {
      refetchDoctors();
      refetchSummary();
      refetchLedger();
    } else {
      refetchOutsourced();
    }
  };

  const handleOpenSettleModal = (
    doctor: ReferringDoctor,
    pendingEntries: CommissionLedgerEntry[],
  ) => {
    setSettleModalState({
      isOpen: true,
      doctor,
      entries: pendingEntries,
    });
  };

  const handleOpenReceiveModal = (test: OutsourcedTest) => {
    setReceiveModalState({
      isOpen: true,
      test,
    });
  };

  const DEMO_ID_PATTERN = /^out-\d+$/;

  const handleMarkDispatched = async (test: OutsourcedTest) => {
    // Guard: demo-mode rows have fake non-UUID IDs (e.g. 'out-01')
    // and don't exist in the database — block and inform the user.
    if (DEMO_ID_PATTERN.test(test.id)) {
      showDispatchToast(
        'info',
        `Demo mode: "${test.testName}" cannot be dispatched — this is a demo record, not a live DB entry. Seed the database or create a real send-out first.`,
      );
      return;
    }

    try {
      await updateOutsourcedMutation.mutateAsync({
        id: test.id,
        dto: { status: 'SENT' },
      });
      showDispatchToast(
        'success',
        `✓ "${test.testName}" marked as Dispatched to ${test.referenceLabName}. sentAt timestamp recorded.`,
      );
    } catch (err) {
      console.error('Failed to mark test as dispatched:', err);
      showDispatchToast(
        'error',
        `Failed to dispatch "${test.testName}". Please check the network and retry.`,
      );
    }
  };

  const handleExportDoctorAudit = () => {
    const headers = [
      'Doctor Name',
      'Specialty',
      'Council Reg No',
      'Clinic / Facility',
      'PAN (TDS Sec 194H)',
      'Bank IFSC',
      'Account Number',
      'Commission Rule Type',
      'Commission Rate',
      'Total Patients Referred',
      'Pending Commission (INR)',
      'Total Disbursed (INR)',
    ];

    const rows = doctors.map((doc) => [
      doc.name,
      doc.specialty || 'General Practitioner',
      doc.registrationNumber || '—',
      doc.clinic || '—',
      doc.pan || '—',
      doc.ifsc || '—',
      doc.bankAccount || '—',
      doc.commissionType,
      doc.commissionType === 'PERCENTAGE'
        ? `${doc.commissionValue}%`
        : doc.commissionType === 'FLAT'
          ? `₹${doc.commissionValue} flat`
          : 'None',
      doc.activeCasesCount || 0,
      doc.pendingAmount || 0,
      doc.settledAmount || 0,
    ]);

    const mtdMonth = new Date().toISOString().slice(0, 7);
    exportToCsv({
      filename: `LabOS_Doctor_Commission_Audit_MTD_${mtdMonth}`,
      headers,
      rows,
    });
  };

  const handleExportOutsourcedManifest = () => {
    const headers = [
      'Accession Barcode',
      'Patient Name',
      'Age',
      'Sex',
      'Investigation / Test',
      'Reference Laboratory',
      'Courier Partner',
      'Tracking / Waybill #',
      'Status',
      'Wholesale Cost (INR)',
      'Retail Fee (INR)',
      'Lab Margin (INR)',
      'Dispatched Timestamp',
      'Notes',
    ];

    const rows = outsourcedTests.map((t) => [
      t.reportNumber || '—',
      t.patientName || 'Diagnostic Patient',
      t.patientAge || '—',
      t.patientSex || '—',
      t.testName,
      t.referenceLabName,
      t.courierPartner || '—',
      t.courierTrackingNumber || '—',
      t.status,
      t.cost || 0,
      t.patientFee || 0,
      t.patientFee && t.cost ? t.patientFee - t.cost : 0,
      t.sentAt || '—',
      t.notes || '—',
    ]);

    const mtdMonth = new Date().toISOString().slice(0, 7);
    exportToCsv({
      filename: `LabOS_Outsourced_Sendout_Manifest_${mtdMonth}`,
      headers,
      rows,
    });
  };

  if (!isAuthorized) {
    return (
      <AppShell variant="full-bleed">
        <AccessDeniedView
          requiredRoles={['OWNER', 'PATHOLOGIST', 'TECHNICIAN']}
          customMessage="Referrals and reference lab routing consoles are restricted to authorized clinical and administrative personnel."
        />
      </AppShell>
    );
  }

  return (
    <AppShell variant="full-bleed">
      <div className="flex flex-col gap-5 w-full">
        {/* Standardized Clinical Page Header */}
        <PageHeader
          title={activeTab === 'doctors' ? 'Doctor Referrals' : 'Reference Lab Send-Outs'}
          subtitle={
            activeTab === 'doctors'
              ? 'Referring doctor directory, commission tracking, and TDS 194H payout ledger.'
              : 'External test dispatch manifest, courier tracking, wholesale costs, and merged findings.'
          }
          icon={
            activeTab === 'doctors' ? (
              <Stethoscope className="w-4 h-4" />
            ) : (
              <Truck className="w-4 h-4" />
            )
          }
          breadcrumbs={[
            { label: 'Referrals & Partners' },
            { label: activeTab === 'doctors' ? 'Doctor Ledger' : 'Send-Out Manifest' },
          ]}
          badge={
            activeTab === 'doctors' ? (
              <span className="hidden sm:inline-flex text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {doctors.length} Doctors Registered
              </span>
            ) : (
              <span className="hidden sm:inline-flex text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                {outsourcedStats.activeCount} Active in External Custody
              </span>
            )
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

              {activeTab === 'doctors' ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportDoctorAudit}
                    className="h-9 gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline">Consolidated MTD Audit</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsAddDoctorOpen(true)}
                    className="h-9 gap-1.5 text-xs font-semibold"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Doctor</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportOutsourcedManifest}
                    className="h-9 gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline">Export Manifest</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsNewOutsourcedOpen(true)}
                    className="h-9 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Package className="w-4 h-4" />
                    <span>+ New Send-Out</span>
                  </Button>
                </>
              )}
            </>
          }
        />

        {/* Master Partner Station Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border pb-1">
          {canViewCommissions && (
            <button
              type="button"
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'doctors'
                  ? 'bg-foreground text-background shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Referring Clinicians &amp; TDS 194H</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === 'doctors'
                    ? 'bg-background/20 text-background'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {doctors.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('outsourced')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'outsourced'
                ? 'bg-foreground text-background shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Reference Lab Send-Outs</span>
            {outsourcedStats.activeCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-bold">
                {outsourcedStats.activeCount}
              </span>
            )}
          </button>
        </div>

        {/* ================================================================= */}
        {/* VIEW 1: Referring Clinicians & Commissions                        */}
        {/* ================================================================= */}
        {activeTab === 'doctors' && (
          <div className="flex flex-col gap-5 w-full">
            {/* KPI Summary Ribbon */}
            <KpiSummaryRibbon summary={summary} totalClinicians={doctors.length} />

            {/* Mobile / Tablet Segmented Switcher (<1280px) */}
            <div className="flex xl:hidden items-center justify-between p-1 bg-muted rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setMobileTab('ROSTER')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  mobileTab === 'ROSTER'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Clinician Roster ({doctors.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('LEDGER')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  mobileTab === 'LEDGER'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>
                  {selectedDoctor ? selectedDoctor.name.split(' ')[1] || selectedDoctor.name : 'Doctor'}&apos;s Ledger
                </span>
              </button>
            </div>

            {/* Loading Skeleton */}
            {isDoctorsLoading && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-pulse">
                <div className="xl:col-span-7 h-96 bg-muted/40 rounded-xl border border-border" />
                <div className="xl:col-span-5 h-96 bg-muted/40 rounded-xl border border-border" />
              </div>
            )}

            {/* Error State */}
            {isDoctorsError && (
              <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-center flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <h3 className="font-bold text-sm text-red-900 dark:text-red-300">
                  Failed to load referring doctors
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400">
                  There was a connection issue with the laboratory ledger service.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refetchDoctors()}
                  className="mt-2 text-xs"
                >
                  Retry Fetch
                </Button>
              </div>
            )}

            {/* Main Split Workstation Layout */}
            {!isDoctorsLoading && !isDoctorsError && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Clinicians Roster Table */}
                <div
                  className={`xl:col-span-7 xl:block ${
                    mobileTab === 'ROSTER' ? 'block' : 'hidden'
                  }`}
                >
                  <DoctorRosterTable
                    doctors={doctors}
                    selectedDoctorId={selectedDoctor?.id || null}
                    onSelectDoctor={handleSelectDoctor}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterMode={filterMode}
                    onFilterChange={setFilterMode}
                    onRefresh={refetchDoctors}
                  />
                </div>

                {/* Right Column: Slideout Referral Ledger */}
                <div
                  className={`xl:col-span-5 xl:block flex flex-col gap-4 ${
                    mobileTab === 'LEDGER' ? 'block' : 'hidden'
                  }`}
                >
                  {/* Mobile Back Button */}
                  <div className="xl:hidden pb-1">
                    <button
                      type="button"
                      onClick={() => setMobileTab('ROSTER')}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Clinicians Roster</span>
                    </button>
                  </div>

                  {selectedDoctor ? (
                    <DoctorLedgerPanel
                      doctor={selectedDoctor}
                      entries={ledgerEntries}
                      onOpenSettleModal={handleOpenSettleModal}
                    />
                  ) : (
                    <div className="p-12 bg-card rounded-xl border border-border text-center flex flex-col items-center justify-center gap-3">
                      <Stethoscope className="w-10 h-10 text-muted-foreground/50" />
                      <h3 className="font-semibold text-sm text-foreground">
                        No Clinician Selected
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Select any doctor from the roster table on the left to inspect their commission ledger and payout history.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: Reference Lab Send-Outs (Outsourced Tests)                */}
        {/* ================================================================= */}
        {activeTab === 'outsourced' && (
          <div className="flex flex-col gap-5 w-full">
            {/* KPI Telemetry Ribbon */}
            <OutsourcedSummaryRibbon stats={outsourcedStats} />

            {/* Outsourced Data Grid */}
            <OutsourcedTable
              tests={outsourcedTests}
              searchQuery={outsourcedSearch}
              onSearchChange={setOutsourcedSearch}
              statusFilter={outsourcedStatusFilter}
              onStatusFilterChange={setOutsourcedStatusFilter}
              onOpenReceiveModal={handleOpenReceiveModal}
              onMarkDispatched={handleMarkDispatched}
              onOpenNewSendOutModal={() => setIsNewOutsourcedOpen(true)}
            />
          </div>
        )}

        {/* Modals */}
        <AddDoctorModal
          isOpen={isAddDoctorOpen}
          onClose={() => setIsAddDoctorOpen(false)}
        />

        <SettleModal
          isOpen={settleModalState.isOpen}
          onClose={() =>
            setSettleModalState({ isOpen: false, doctor: null, entries: [] })
          }
          doctor={settleModalState.doctor}
          pendingEntries={settleModalState.entries}
        />

        <NewOutsourcedModal
          isOpen={isNewOutsourcedOpen}
          onClose={() => setIsNewOutsourcedOpen(false)}
        />

        <ReceiveResultModal
          isOpen={receiveModalState.isOpen}
          onClose={() => setReceiveModalState({ isOpen: false, test: null })}
          test={receiveModalState.test}
        />

        {/* Dispatch Action Toast */}
        {dispatchToast?.visible && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 max-w-sm px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300 ${
              dispatchToast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : dispatchToast.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                  : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
            }`}
          >
            {dispatchToast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            {dispatchToast.type === 'error' && (
              <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            {dispatchToast.type === 'info' && (
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
            )}
            <span className="leading-snug">{dispatchToast.message}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
