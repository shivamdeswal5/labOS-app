'use client';
'use no memo';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { REFERENCE_LAB_OPTIONS } from '@/lib/demo-data/outsourced';
import { useCreateOutsourcedTest } from '@/features/referrals/api/use-outsourced';
import { useReports } from '@/features/reports/api/use-reports';
import { newOutsourcedSchema, type NewOutsourcedSchema } from '@/features/referrals/schemas/new-outsourced.schema';

interface NewOutsourcedModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultReportId?: string;
  defaultReportNumber?: string;
  defaultPatientName?: string;
}

export function NewOutsourcedModal({
  isOpen,
  onClose,
  defaultReportId = '',
  defaultReportNumber = '',
  defaultPatientName = '',
}: NewOutsourcedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">New Send-Out Manifest</h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                Outsource Investigation to Accredited Reference Lab
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inner Form with Clean Mount State */}
        <NewOutsourcedForm
          key={`${defaultReportId}-${defaultReportNumber}`}
          defaultReportId={defaultReportId}
          defaultReportNumber={defaultReportNumber}
          defaultPatientName={defaultPatientName}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

interface NewOutsourcedFormProps {
  defaultReportId: string;
  defaultReportNumber: string;
  defaultPatientName: string;
  onClose: () => void;
}

function NewOutsourcedForm({
  defaultReportId,
  defaultReportNumber,
  defaultPatientName,
  onClose,
}: NewOutsourcedFormProps) {
  const { data: reports = [] } = useReports();
  const firstReport = reports[0];
  const createMutation = useCreateOutsourcedTest();

  const initialReportId = defaultReportId || firstReport?.id || 'f14faf1a-0151-4183-b3ab-012366668d29';
  const initialReportNumber = defaultReportNumber || firstReport?.reportNumber || 'R-20260924-0001';
  const initialPatientName = defaultPatientName || firstReport?.patient?.name || 'Rajesh Kumar';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewOutsourcedSchema>({
    resolver: zodResolver(newOutsourcedSchema),
    defaultValues: {
      reportId: initialReportId,
      reportNumber: initialReportNumber,
      patientName: initialPatientName,
      testName: '',
      referenceLabName: REFERENCE_LAB_OPTIONS[0],
      customLabName: '',
      courierPartner: 'Blue Dart Express',
      trackingNumber: '',
      cost: 400,
      notes: '',
    },
  });

  const selectedReportId = watch('reportId');
  const referenceLabName = watch('referenceLabName');

  const handleSelectAccession = (repId: string) => {
    setValue('reportId', repId, { shouldValidate: true });
    const matched = reports.find((r) => r.id === repId);
    if (matched) {
      setValue('reportNumber', matched.reportNumber);
      if (matched.patient?.name) {
        setValue('patientName', matched.patient.name, { shouldValidate: true });
      }
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const chosenLab = values.referenceLabName.startsWith('Other')
      ? values.customLabName || 'Reference Pathology Lab'
      : values.referenceLabName;

    const fullNotes = [
      values.notes,
      values.courierPartner ? `Courier: ${values.courierPartner}` : null,
      values.trackingNumber ? `Waybill: ${values.trackingNumber}` : null,
      values.reportNumber ? `Accession: ${values.reportNumber}` : null,
      values.patientName ? `Patient: ${values.patientName}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    try {
      await createMutation.mutateAsync({
        reportId: values.reportId || 'f14faf1a-0151-4183-b3ab-012366668d29',
        testName: values.testName.trim(),
        referenceLabName: chosenLab,
        cost: values.cost !== undefined ? Number(values.cost) : undefined,
        notes: fullNotes || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create outsourced send-out:', err);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="p-4 overflow-y-auto flex flex-col gap-4 text-xs">
      {/* Accession & Patient Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Accession Barcode #</label>
          {reports.length > 0 ? (
            <select
              value={selectedReportId}
              onChange={(e) => handleSelectAccession(e.target.value)}
              className={cn(
                'h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:border-primary',
                errors.reportId && 'border-destructive'
              )}
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reportNumber} • {r.patient?.name || 'Patient'}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="e.g. R-20260924-0001"
              {...register('reportNumber')}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:border-primary"
            />
          )}
          {errors.reportId && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.reportId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Patient Name</label>
          <input
            type="text"
            placeholder="e.g. Rajesh Kumar"
            {...register('patientName')}
            className={cn(
              'h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary',
              errors.patientName && 'border-destructive'
            )}
          />
          {errors.patientName && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.patientName.message}</p>
          )}
        </div>
      </div>

      {/* Test Name */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground font-medium">
          Investigation / Test to Outsource <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          list="common-sendouts"
          placeholder="e.g. 25-OH Vitamin D3 Total, Histopathology Biopsy..."
          {...register('testName')}
          className={cn(
            'h-9 px-3 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:border-primary',
            errors.testName && 'border-destructive focus:border-destructive'
          )}
        />
        {errors.testName && (
          <p className="text-[11px] text-destructive mt-0.5">{errors.testName.message}</p>
        )}
        <datalist id="common-sendouts">
          <option value="25-OH Vitamin D Total (CLIA)" />
          <option value="Thyroid Antibodies (Anti-TPO & Anti-TG)" />
          <option value="Histopathology — Skin Punch Biopsy (H&E)" />
          <option value="Urine Culture & Sensitivity (Aerobic)" />
          <option value="Hemoglobin Variant Analysis (HPLC / Thalassemia)" />
          <option value="Serum Ferritin & Iron Saturation Profile" />
          <option value="Double Marker Maternal Screening" />
        </datalist>
      </div>

      {/* Target Reference Laboratory */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground font-medium">Target Reference Laboratory</label>
        <select
          {...register('referenceLabName')}
          className="h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary"
        >
          {REFERENCE_LAB_OPTIONS.map((lab) => (
            <option key={lab} value={lab}>
              {lab}
            </option>
          ))}
        </select>
        {errors.referenceLabName && (
          <p className="text-[11px] text-destructive mt-0.5">{errors.referenceLabName.message}</p>
        )}
      </div>

      {referenceLabName.startsWith('Other') && (
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Specify Custom Lab Name</label>
          <input
            type="text"
            placeholder="e.g. Anand Diagnostic Laboratory"
            {...register('customLabName')}
            className={cn(
              'h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary',
              errors.customLabName && 'border-destructive'
            )}
          />
          {errors.customLabName && (
            <p className="text-[11px] text-destructive mt-0.5">{errors.customLabName.message}</p>
          )}
        </div>
      )}

      {/* Logistics & Tracking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Logistics / Courier Partner</label>
          <input
            type="text"
            placeholder="e.g. Blue Dart, DTDC, Hub Runner"
            {...register('courierPartner')}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Tracking / Waybill #</label>
          <input
            type="text"
            placeholder="e.g. BD-884920"
            {...register('trackingNumber')}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Wholesale B2B Cost */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground font-medium">
          Wholesale B2B Cost (₹) Owed to Reference Lab
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">
            ₹
          </span>
          <input
            type="number"
            min="0"
            step="10"
            placeholder="400"
            {...register('cost')}
            className={cn(
              'h-9 pl-7 pr-3 w-full rounded-lg border border-border bg-background text-foreground font-mono font-semibold focus:outline-none focus:border-primary',
              errors.cost && 'border-destructive'
            )}
          />
        </div>
        {errors.cost && (
          <p className="text-[11px] text-destructive mt-0.5">{errors.cost.message}</p>
        )}
      </div>

      {/* Sample Handling Remarks */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground font-medium">Sample Preparation &amp; Packaging Notes</label>
        <textarea
          rows={2}
          placeholder="e.g. Centrifuged serum packed with gel cool pack. Awaiting 4 PM evening batch."
          {...register('notes')}
          className={cn(
            'p-2.5 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:border-primary',
            errors.notes && 'border-destructive'
          )}
        />
        {errors.notes && (
          <p className="text-[11px] text-destructive mt-0.5">{errors.notes.message}</p>
        )}
      </div>

      {/* Submit Action */}
      <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={createMutation.isPending}
          className="gap-1.5"
        >
          <Package className="w-3.5 h-3.5" />
          <span>{createMutation.isPending ? 'Logging Send-Out...' : 'Create Send-Out Manifest'}</span>
        </Button>
      </div>
    </form>
  );
}
