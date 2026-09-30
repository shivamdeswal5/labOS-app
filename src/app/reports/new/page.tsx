'use client';

import * as React from 'react';
import Link from 'next/link';
import { FilePlus2, CheckCircle2, AlertCircle, FileEdit, UserPlus, ClipboardList } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { PatientIntakeSection, type PatientFormState } from '@/features/reports/components/patient-intake-section';
import { PanelSelectorSection } from '@/features/reports/components/panel-selector-section';
import { OrderSummaryBar, type PaymentMode, type ActivePaymentMethod } from '@/features/reports/components/order-summary-bar';
import { SampleSuccessModal } from '@/features/reports/components/sample-success-modal';
import { useSearchParams } from 'next/navigation';
import { usePanels } from '@/features/reports/api/use-panels';
import { useCreateReport } from '@/features/reports/api/use-create-report';
import { usePatient } from '@/features/patients/api/use-patients';
import type { Patient } from '@/features/reports/types';
import type { Invoice } from '@/features/billing/types';

interface CreatedReportDetails {
  id: string;
  reportNumber: string;
  patientName: string;
  patientAge: string;
  patientSex: string;
  patientNumber?: string;
  selectedPanelNames: string[];
  totalPrice: number;
  discount: number;
  netTotal: number;
  invoice?: Invoice | null;
}

interface NewReportFormProps {
  preselectedPatient?: Patient | null;
}

function NewReportForm({ preselectedPatient }: NewReportFormProps) {
  const { data: panels } = usePanels();
  const createReportMutation = useCreateReport();

  // Pure clinical intake state — pre-populate if existing patient was passed via URL
  const [formState, setFormState] = React.useState<PatientFormState>(() => ({
    existingPatientId: preselectedPatient?.id,
    patientNumber: preselectedPatient?.patientNumber,
    name: preselectedPatient?.name || '',
    age: preselectedPatient?.age ? preselectedPatient.age.replace(/[^0-9]/g, '') : '',
    ageUnit: 'YRS',
    sex: (preselectedPatient?.sex as PatientFormState['sex']) || 'MALE',
    phone: preselectedPatient?.phone ? preselectedPatient.phone.replace(/[^0-9]/g, '').slice(-10) : '',
    refByDoctorId: '',
    reportNumber: undefined,
    remarks: '',
  }));

  const [selectedPanelIds, setSelectedPanelIds] = React.useState<string[]>([]);
  const [discount, setDiscount] = React.useState<number>(0);
  const [paymentMode, setPaymentMode] = React.useState<PaymentMode>('PAID');
  const [paymentMethod, setPaymentMethod] = React.useState<ActivePaymentMethod>('UPI');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [createdReport, setCreatedReport] = React.useState<CreatedReportDetails | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState<boolean>(false);

  // Form updates
  const handleUpdateForm = (updates: Partial<PatientFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
    setErrorMessage(null);
  };

  // Toggle panels
  const handleTogglePanel = (panelId: string) => {
    setSelectedPanelIds((prev) =>
      prev.includes(panelId) ? prev.filter((id) => id !== panelId) : [...prev, panelId],
    );
  };

  // Calculate total price
  const totalPrice = React.useMemo(() => {
    if (!panels) return 0;
    return panels
      .filter((p) => selectedPanelIds.includes(p.id))
      .reduce((sum, p) => sum + Number(p.price || 0), 0);
  }, [panels, selectedPanelIds]);

  // Validation
  const isValid =
    formState.name.trim().length >= 2 &&
    formState.age.trim().length > 0 &&
    selectedPanelIds.length > 0;

  // Submit handler — IDs and Invoices are assigned atomically by backend in PostgreSQL
  const handleSubmit = async () => {
    if (!isValid || createReportMutation.isPending || createdReport) return;
    setErrorMessage(null);

    try {
      const formattedAge = `${formState.age} ${formState.ageUnit}`;
      const netTotal = Math.max(0, totalPrice - discount);

      const created = await createReportMutation.mutateAsync({
        existingPatientId: formState.existingPatientId,
        newPatient: formState.existingPatientId
          ? undefined
          : {
              patientNumber: formState.patientNumber,
              name: formState.name.trim(),
              age: formattedAge,
              sex: formState.sex,
              phone: formState.phone ? `+91${formState.phone.replace(/[^0-9]/g, '')}` : null,
              address: null,
            },
        reportNumber: formState.reportNumber,
        refByDoctorId: formState.refByDoctorId || null,
        panelIds: selectedPanelIds,
        remarks: formState.remarks ? formState.remarks.trim() : null,
        billing: {
          discount,
          paymentMethod: paymentMode === 'PAID' ? paymentMethod : undefined,
          paymentStatus: paymentMode === 'PAID' ? 'PAID' : 'UNPAID',
          paidAmount: paymentMode === 'PAID' ? netTotal : 0,
        },
      });

      const panelNames = (panels || [])
        .filter((p) => selectedPanelIds.includes(p.id))
        .map((p) => p.name);

      const details: CreatedReportDetails = {
        id: created.id,
        reportNumber: created.reportNumber,
        patientName: formState.name.trim(),
        patientAge: formattedAge,
        patientSex: formState.sex,
        patientNumber: created.patient?.patientNumber || formState.patientNumber,
        selectedPanelNames: panelNames,
        totalPrice,
        discount,
        netTotal,
        invoice: created.invoice || null,
      };

      setCreatedReport(details);
      setIsSuccessModalOpen(true);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to register sample. Please try again.';
      setErrorMessage(msg);
    }
  };

  /** Reset form for the next patient after a successful registration. */
  const handleRegisterNext = () => {
    setCreatedReport(null);
    setIsSuccessModalOpen(false);
    setSelectedPanelIds([]);
    setDiscount(0);
    setPaymentMode('PAID');
    setPaymentMethod('UPI');
    setErrorMessage(null);
    setFormState({
      existingPatientId: undefined,
      patientNumber: undefined,
      name: '',
      age: '',
      ageUnit: 'YRS',
      sex: 'MALE',
      phone: '',
      refByDoctorId: '',
      reportNumber: undefined,
      remarks: '',
    });
  };

  return (
    <AppShell variant="contained">
      <div className="space-y-6 pb-12">
        {/* Unified Page Header */}
        <PageHeader
          title="New Sample Registration"
          subtitle="Register patient details, select tests, and generate barcode for sample tracking"
          icon={<FilePlus2 className="w-5 h-5" />}
          backHref="/accessions"
          breadcrumbs={[
            { label: 'Sample Worklist', href: '/accessions' },
            { label: 'New Registration' },
          ]}
        />

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-xs text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner (visible on page even after closing modal) */}
        {createdReport && (
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Sample Registered: Accession {createdReport.reportNumber}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Registered for <span className="font-semibold text-foreground">{createdReport.patientName}</span>{' '}
                ({createdReport.selectedPanelNames.length} investigations). Form locked to prevent duplicate submissions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" className="h-9 text-xs font-semibold gap-1.5 bg-primary">
                <Link href={`/reports/${createdReport.id}/entry`}>
                  <FileEdit className="w-4 h-4" />
                  <span>Enter Results Now</span>
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegisterNext}
                className="h-9 text-xs font-semibold gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Next</span>
              </Button>
              <Button asChild size="sm" variant="ghost" className="h-9 text-xs border border-border">
                <Link href="/accessions">
                  <ClipboardList className="w-4 h-4 text-muted-foreground mr-1" />
                  <span>Worklist</span>
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Form Sections */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Section 01: Demographics & UID */}
          <PatientIntakeSection
            formState={formState}
            onChange={handleUpdateForm}
          />

          {/* Section 02: Investigation Panels */}
          <PanelSelectorSection
            selectedPanelIds={selectedPanelIds}
            onTogglePanel={handleTogglePanel}
          />

          {/* Sticky Summary & Submit Bar */}
          <OrderSummaryBar
            selectedCount={selectedPanelIds.length}
            totalPrice={totalPrice}
            discount={discount}
            onDiscountChange={setDiscount}
            paymentMode={paymentMode}
            onPaymentModeChange={setPaymentMode}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            isSubmitting={createReportMutation.isPending}
            isValid={isValid && !createdReport}
            isRegistered={Boolean(createdReport)}
            onRegisterNext={handleRegisterNext}
            onSubmit={handleSubmit}
          />
        </form>

        {/* Clinical Success Modal with Quick Navigation & Receipt Printing */}
        {createdReport && (
          <SampleSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
            reportId={createdReport.id}
            reportNumber={createdReport.reportNumber}
            patientName={createdReport.patientName}
            patientAge={createdReport.patientAge}
            patientSex={createdReport.patientSex}
            patientNumber={createdReport.patientNumber}
            selectedPanelNames={createdReport.selectedPanelNames}
            totalPrice={createdReport.totalPrice}
            discount={createdReport.discount}
            netTotal={createdReport.netTotal}
            invoice={createdReport.invoice}
            onRegisterNext={handleRegisterNext}
          />
        )}
      </div>
    </AppShell>
  );
}

function NewReportContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { data: preselectedPatient } = usePatient(patientId);

  return (
    <NewReportForm
      key={preselectedPatient?.id || 'new-patient'}
      preselectedPatient={preselectedPatient}
    />
  );
}

export default function NewReportPage() {
  return (
    <React.Suspense
      fallback={
        <AppShell variant="full-bleed">
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading patient intake workstation…
          </div>
        </AppShell>
      }
    >
      <NewReportContent />
    </React.Suspense>
  );
}
