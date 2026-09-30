'use client';

import * as React from 'react';
import { X, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REFERENCE_LAB_OPTIONS } from '@/lib/demo-data/outsourced';
import { useCreateOutsourcedTest } from '@/features/referrals/api/use-outsourced';
import { useReports } from '@/features/reports/api/use-reports';

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

  const [selectedReportId, setSelectedReportId] = React.useState(
    defaultReportId || firstReport?.id || 'f14faf1a-0151-4183-b3ab-012366668d29',
  );
  const [reportNumber, setReportNumber] = React.useState(
    defaultReportNumber || firstReport?.reportNumber || 'R-20260924-0001',
  );
  const [patientName, setPatientName] = React.useState(
    defaultPatientName || firstReport?.patient?.name || 'Rajesh Kumar',
  );
  const [testName, setTestName] = React.useState('');
  const [referenceLabName, setReferenceLabName] = React.useState(REFERENCE_LAB_OPTIONS[0]);
  const [customLabName, setCustomLabName] = React.useState('');
  const [courierPartner, setCourierPartner] = React.useState('Blue Dart Express');
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [cost, setCost] = React.useState<number | ''>(400);
  const [notes, setNotes] = React.useState('');

  const createMutation = useCreateOutsourcedTest();

  const handleSelectAccession = (repId: string) => {
    setSelectedReportId(repId);
    const matched = reports.find((r) => r.id === repId);
    if (matched) {
      setReportNumber(matched.reportNumber);
      if (matched.patient?.name) {
        setPatientName(matched.patient.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const chosenLab = referenceLabName.startsWith('Other')
      ? customLabName || 'Reference Pathology Lab'
      : referenceLabName;

    const fullNotes = [
      notes,
      courierPartner ? `Courier: ${courierPartner}` : null,
      trackingNumber ? `Waybill: ${trackingNumber}` : null,
      reportNumber ? `Accession: ${reportNumber}` : null,
      patientName ? `Patient: ${patientName}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    try {
      await createMutation.mutateAsync({
        reportId: selectedReportId || 'f14faf1a-0151-4183-b3ab-012366668d29',
        testName,
        referenceLabName: chosenLab,
        cost: typeof cost === 'number' ? cost : undefined,
        notes: fullNotes || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create outsourced send-out:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex flex-col gap-4 text-xs">
      {/* Accession & Patient Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Accession Barcode #</label>
          {reports.length > 0 ? (
            <select
              value={selectedReportId}
              onChange={(e) => handleSelectAccession(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono"
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
              value={reportNumber}
              onChange={(e) => setReportNumber(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono"
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Patient Name</label>
          <input
            type="text"
            placeholder="e.g. Rajesh Kumar"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground"
          />
        </div>
      </div>

      {/* Test Name */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground font-medium">
          Investigation / Test to Outsource <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          list="common-sendouts"
          placeholder="e.g. 25-OH Vitamin D3 Total, Histopathology Biopsy..."
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-foreground font-medium"
        />
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
          value={referenceLabName}
          onChange={(e) => setReferenceLabName(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-foreground"
        >
          {REFERENCE_LAB_OPTIONS.map((lab) => (
            <option key={lab} value={lab}>
              {lab}
            </option>
          ))}
        </select>
      </div>

      {referenceLabName.startsWith('Other') && (
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Specify Custom Lab Name</label>
          <input
            type="text"
            placeholder="e.g. Anand Diagnostic Laboratory"
            value={customLabName}
            onChange={(e) => setCustomLabName(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground"
          />
        </div>
      )}

      {/* Logistics & Tracking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Logistics / Courier Partner</label>
          <input
            type="text"
            placeholder="e.g. Blue Dart, DTDC, Hub Runner"
            value={courierPartner}
            onChange={(e) => setCourierPartner(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground font-medium">Tracking / Waybill #</label>
          <input
            type="text"
            placeholder="e.g. BD-884920"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono"
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
            value={cost}
            onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
            className="h-9 pl-7 pr-3 w-full rounded-lg border border-border bg-background text-foreground font-mono font-semibold"
          />
        </div>
      </div>

      {/* Sample Handling Remarks */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground font-medium">Sample Preparation &amp; Packaging Notes</label>
        <textarea
          rows={2}
          placeholder="e.g. Centrifuged serum packed with gel cool pack. Awaiting 4 PM evening batch."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="p-2.5 rounded-lg border border-border bg-background text-foreground resize-none"
        />
      </div>

      {/* Submit Action */}
      <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={createMutation.isPending || !testName.trim()}
          className="gap-1.5"
        >
          <Package className="w-3.5 h-3.5" />
          <span>{createMutation.isPending ? 'Logging Send-Out...' : 'Create Send-Out Manifest'}</span>
        </Button>
      </div>
    </form>
  );
}
