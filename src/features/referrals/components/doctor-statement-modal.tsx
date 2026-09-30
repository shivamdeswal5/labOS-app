'use client';

import * as React from 'react';
import {
  Printer,
  Download,
  X,
  Stethoscope,
} from 'lucide-react';
import { useLabProfile } from '@/features/settings/api/use-settings';
import { exportToCsv } from '@/lib/csv-exporter';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { ReferringDoctor, CommissionLedgerEntry } from '../types';

interface DoctorStatementModalProps {
  isOpen: boolean;
  doctor: ReferringDoctor | null;
  entries: CommissionLedgerEntry[];
  onClose: () => void;
}

export function DoctorStatementModal({
  isOpen,
  doctor,
  entries,
  onClose,
}: DoctorStatementModalProps) {
  const { data: labProfile } = useLabProfile();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !doctor) return null;

  const accentColor = labProfile?.accentColor || '#0f766e';
  const labName = labProfile?.name || 'Deswal Diagnostic Laboratory';
  const labAddress = labProfile?.address || 'Barara, Haryana';
  const labPhones = labProfile?.phoneNumbers?.join(' • ') || '';
  const nablId = labProfile?.nablId || 'NABL Accredited';

  const grossCommission = entries.reduce((sum, e) => sum + e.amount, 0) || doctor.pendingAmount || 0;
  // Standard Indian TDS under Section 194H is 5% for PAN verified payees
  const tdsRate = doctor.pan ? 5 : 20;
  const tdsAmount = Math.round((grossCommission * tdsRate) / 100);
  const netPayable = Math.max(0, grossCommission - tdsAmount);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'Referral ID',
      'Date',
      'Patient Name',
      'Accession / Report No',
      'Investigation Panel',
      'Billed Amount (INR)',
      'Commission Amount (INR)',
      'Status',
    ];

    const rows = entries.map((e) => [
      e.id,
      formatDate(e.createdAt),
      e.patientName || 'Outpatient',
      e.reportId ? `#${e.reportId.slice(0, 8)}` : '—',
      e.panelName || 'Diagnostic Panel',
      e.billAmount || 0,
      e.amount || 0,
      e.status,
    ]);

    // Append Summary Rows
    rows.push(['', '', '', '', 'Gross Commission', '', grossCommission, '']);
    rows.push(['', '', '', '', `TDS Deducted (Sec 194H @ ${tdsRate}%)`, '', tdsAmount, '']);
    rows.push(['', '', '', '', 'Net Payable', '', netPayable, '']);

    exportToCsv({
      filename: `Dr_${doctor.name.replace(/[^a-zA-Z0-9]/g, '_')}_Commission_Statement_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs printable-modal-backdrop"
      data-printable-area="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-card text-card-foreground border border-border rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 printable-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Action Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            <span className="font-semibold text-xs text-foreground">
              Doctor Referral Statement &amp; Payout Advice
            </span>
            <span className="font-mono text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              {doctor.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-8 px-3 rounded-md bg-muted hover:bg-muted/80 text-foreground text-xs font-medium inline-flex items-center gap-1.5 border border-border transition-colors"
              title="Download Statement as CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-card text-card-foreground text-xs print:p-0 print:m-0 print:overflow-visible font-sans">
          {/* Diagnostic Center Letterhead */}
          <div
            className="border-b-2 pb-4 text-center space-y-1"
            style={{ borderColor: accentColor }}
          >
            <div className="flex items-center justify-center gap-2">
              <h1
                className="font-bold text-lg sm:text-xl tracking-tight uppercase"
                style={{ color: accentColor }}
              >
                {labName}
              </h1>
              <span
                className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold"
                style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
              >
                {nablId}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {labProfile?.tagline || 'Clinical Pathology, Biochemistry, Hematology & Molecular Diagnostics'}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {labAddress} {labPhones ? `• Phone: ${labPhones}` : ''}
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-0.5 rounded bg-muted font-bold tracking-wider text-[11px] uppercase border border-border">
                Referral Commission Statement &amp; TDS Advice (Sec 194H)
              </span>
            </div>
          </div>

          {/* Clinician & Payee Profile Grid */}
          <div className="bg-muted/40 p-4 rounded-xl border border-border grid grid-cols-12 gap-y-3 gap-x-4">
            <div className="col-span-12 sm:col-span-6 space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                Referring Clinician
              </span>
              <div className="font-bold text-sm text-foreground">{doctor.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {doctor.specialty || 'General Practitioner'} • Reg: #{doctor.registrationNumber || 'MCI-REG'}
              </div>
              {doctor.clinic && (
                <div className="text-xs text-muted-foreground">{doctor.clinic}</div>
              )}
            </div>

            <div className="col-span-12 sm:col-span-6 space-y-1 sm:text-right">
              <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                Statement Details
              </span>
              <div className="font-mono text-xs text-foreground">
                Date: <span className="font-semibold">{formatDate(new Date().toISOString())}</span>
              </div>
              <div className="font-mono text-xs text-foreground">
                PAN for TDS: <span className="font-semibold">{doctor.pan || 'NOT PROVIDED'}</span>
              </div>
              <div className="font-mono text-xs text-foreground">
                Settlement Mode: <span className="font-semibold">Direct Bank NEFT / IMPS</span>
              </div>
            </div>

            <div className="col-span-12 pt-2 border-t border-border/80 grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px]">Bank Beneficiary</span>
                <span className="font-semibold text-foreground">{doctor.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Account Number</span>
                <span className="font-semibold text-foreground tracking-wider">
                  {doctor.bankAccount || '•••• •••• •••• 4920'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">IFSC Code</span>
                <span className="font-semibold text-foreground">{doctor.ifsc || 'HDFC0001042'}</span>
              </div>
            </div>
          </div>

          {/* Itemized Referral Cases Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Itemized Referral Encounters ({entries.length} Cases)
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                Cut-off: 25th of Month
              </span>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/60 border-b border-border font-mono text-[10px] uppercase text-muted-foreground">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Patient &amp; Report #</th>
                    <th className="py-2 px-3">Investigation Panel</th>
                    <th className="py-2 px-3 text-right">Billed Amount</th>
                    <th className="py-2 px-3 text-right">Commission</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground italic">
                        No unsettled referral records on file for this billing cycle.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted/20">
                        <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-foreground">{entry.patientName || 'Walk-in Patient'}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{entry.reportId ? `#${entry.reportId.slice(0, 8)}` : '—'}</div>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {entry.panelName || 'Diagnostic Investigation'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-foreground">
                          {formatCurrency(entry.billAmount || 0)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                          {formatCurrency(entry.amount)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              entry.status === 'SETTLED'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Financial Settlement Summary */}
          <div className="p-4 bg-muted/40 rounded-xl border border-border grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-7 space-y-1.5 text-xs text-muted-foreground">
              <span className="font-mono text-[10px] font-bold uppercase text-foreground block">
                Statutory TDS Note (Sec 194H)
              </span>
              <p className="leading-relaxed text-[11px]">
                Under Section 194H of the Income Tax Act, tax at source is deducted on commission or brokerage disbursements exceeding the annual statutory limit. Form 16A TDS certificate will be furnished at the close of the financial quarter.
              </p>
            </div>

            <div className="col-span-12 sm:col-span-5 space-y-1 text-right font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Gross Commission:</span>
                <span className="font-semibold text-foreground">{formatCurrency(grossCommission)}</span>
              </div>
              <div className="flex justify-between text-xs text-red-600 dark:text-red-400">
                <span>Less: TDS (194H @ {tdsRate}%):</span>
                <span>-{formatCurrency(tdsAmount)}</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between text-sm font-bold text-foreground pt-1">
                <span>Net Disbursed / Payable:</span>
                <span className="text-base font-extrabold" style={{ color: accentColor }}>
                  {formatCurrency(netPayable)}
                </span>
              </div>
            </div>
          </div>

          {/* Authorization & Signatory Seal */}
          <div className="pt-6 border-t border-border flex items-end justify-between text-xs">
            <div className="space-y-1">
              <div className="font-mono text-[10px] text-muted-foreground">Disbursing Facility:</div>
              <div className="font-bold text-foreground">{labName}</div>
              <div className="font-mono text-[10px] text-muted-foreground">Clinical &amp; Financial Accounts Dept.</div>
            </div>

            <div className="text-right space-y-1">
              <div className="h-10 border-b border-dashed border-border w-44 ml-auto" />
              <div className="font-bold text-foreground">Authorized Signatory</div>
              <div className="font-mono text-[10px] text-muted-foreground">Finance &amp; Statutory Payouts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
