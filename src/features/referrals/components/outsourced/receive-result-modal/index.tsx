'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUpdateOutsourcedStatus } from '@/features/referrals/api/use-outsourced';
import { receiveResultSchema, type ReceiveResultSchema } from '@/features/referrals/schemas/receive-result.schema';
import type { OutsourcedTest } from '@/features/referrals/types';

interface ReceiveResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: OutsourcedTest | null;
}

export function ReceiveResultModal({
  isOpen,
  onClose,
  test,
}: ReceiveResultModalProps) {
  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Receive Reference Lab Results</h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                Merge External Findings into Single Unified Report
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

        {/* Decomposed Form Component (Pure Mount State, Zero useEffect) */}
        <ReceiveResultForm
          key={test.id}
          test={test}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

interface ReceiveResultFormProps {
  test: OutsourcedTest;
  onClose: () => void;
}

function ReceiveResultForm({ test, onClose }: ReceiveResultFormProps) {
  const updateStatusMutation = useUpdateOutsourcedStatus();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceiveResultSchema>({
    resolver: zodResolver(receiveResultSchema),
    defaultValues: {
      refReportId: '',
      resultsText: test.resultSummary || '',
      confirmedCost: test.cost || 400,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const mergedNotes = [
      test.notes,
      values.refReportId?.trim() ? `Ref Lab Report ID: ${values.refReportId.trim()}` : null,
      values.resultsText?.trim() ? `Findings: ${values.resultsText.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    try {
      await updateStatusMutation.mutateAsync({
        id: test.id,
        dto: {
          status: 'RECEIVED',
          cost: values.confirmedCost !== undefined ? Number(values.confirmedCost) : undefined,
          notes: mergedNotes,
        },
      });
      onClose();
    } catch (err) {
      console.error('Failed to receive outsourced test result:', err);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="p-4 flex flex-col gap-4 text-xs">
      {/* Context Banner */}
      <div className="p-3 bg-muted/50 rounded-lg border border-border flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-foreground">
            {test.reportNumber || 'Accession'} • {test.patientName}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {test.referenceLabName}
          </span>
        </div>
        <div className="text-xs font-semibold text-primary">
          Investigation: {test.testName}
        </div>
      </div>

      {/* Reference Lab Report ID */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground font-medium">
          Reference Lab Sample / Job ID (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. LAL-992104 or SRL-B8842"
          {...register('refReportId')}
          className={cn(
            'h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:border-primary',
            errors.refReportId && 'border-destructive'
          )}
        />
        {errors.refReportId && (
          <p className="text-[11px] text-destructive mt-0.5">{errors.refReportId.message}</p>
        )}
      </div>

      {/* Findings & Values */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground font-medium">
          Reference Lab Findings &amp; Values <span className="text-destructive">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="e.g. 25-OH Vitamin D: 14.2 ng/mL (Deficient, Reference: 30 - 100 ng/mL). Method: CLIA. Specimen processed at accredited hub."
          {...register('resultsText')}
          className={cn(
            'p-3 rounded-lg border border-border bg-background text-foreground font-mono text-xs leading-relaxed resize-none focus:outline-none focus:border-primary',
            errors.resultsText && 'border-destructive focus:border-destructive'
          )}
        />
        {errors.resultsText && (
          <p className="text-[11px] text-destructive mt-0.5">{errors.resultsText.message}</p>
        )}
        <p className="text-[11px] text-muted-foreground">
          These findings will be merged into the patient&apos;s unified diagnostic letterhead with NABL reference lab accreditation notes.
        </p>
      </div>

      {/* Confirmed B2B Cost */}
      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground font-medium">
          Confirmed Reference Lab Wholesale B2B Invoice (₹)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">
            ₹
          </span>
          <input
            type="number"
            min="0"
            step="10"
            {...register('confirmedCost')}
            className={cn(
              'h-9 pl-7 pr-3 w-full rounded-lg border border-border bg-background text-foreground font-mono font-semibold focus:outline-none focus:border-primary',
              errors.confirmedCost && 'border-destructive'
            )}
          />
        </div>
        {errors.confirmedCost && (
          <p className="text-[11px] text-destructive mt-0.5">{errors.confirmedCost.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={updateStatusMutation.isPending}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {updateStatusMutation.isPending
              ? 'Merging Findings...'
              : 'Confirm & Merge Result'}
          </span>
        </Button>
      </div>
    </form>
  );
}
