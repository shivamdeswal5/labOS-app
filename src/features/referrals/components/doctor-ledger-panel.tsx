'use client';

import * as React from 'react';
import {
  FileText,
  CheckCircle2,
  Printer,
  FileCheck2,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { DoctorStatementModal } from './doctor-statement-modal';
import type { ReferringDoctor, CommissionLedgerEntry } from '../types';

interface DoctorLedgerPanelProps {
  doctor: ReferringDoctor;
  entries: CommissionLedgerEntry[];
  onOpenSettleModal: (doctor: ReferringDoctor, pendingEntries: CommissionLedgerEntry[]) => void;
}

export function DoctorLedgerPanel({
  doctor,
  entries,
  onOpenSettleModal,
}: DoctorLedgerPanelProps) {
  const pendingEntries = React.useMemo(
    () => entries.filter((e) => e.status === 'PENDING'),
    [entries],
  );

  const pendingAmount = React.useMemo(
    () => pendingEntries.reduce((sum, e) => sum + e.amount, 0) || doctor.pendingAmount,
    [pendingEntries, doctor.pendingAmount],
  );

  const [isStatementModalOpen, setIsStatementModalOpen] = React.useState(false);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
      {/* Ledger Header & Clinician Identity */}
      <div className="p-4 bg-muted/40 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase text-muted-foreground tracking-wider">
            Referral Ledger Account
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-background text-foreground rounded border border-border">
            Active Payee
          </span>
        </div>

        <div className="mt-2.5 flex items-start justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {doctor.name}
            </h2>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              {doctor.specialty || 'General Physician'} • Reg: #{doctor.registrationNumber || 'MCI-REG'}
            </p>
          </div>
        </div>

        {/* Banking & TDS Micro-Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2 p-2.5 bg-background rounded-lg border border-border/80 text-xs font-mono">
          <div>
            <span className="text-muted-foreground block uppercase text-[10px]">Settlement Mode</span>
            <span className="font-semibold text-foreground">Bank NEFT / IMPS</span>
          </div>
          <div>
            <span className="text-muted-foreground block uppercase text-[10px]">IFSC Routing</span>
            <span className="font-semibold text-foreground">{doctor.ifsc || 'HDFC0001042'}</span>
          </div>
          <div className="mt-1">
            <span className="text-muted-foreground block uppercase text-[10px]">Beneficiary Acc</span>
            <span className="font-semibold text-foreground tracking-wider">
              {doctor.bankAccount || '•••• •••• •••• 4920'}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-muted-foreground block uppercase text-[10px]">PAN for TDS</span>
            <span className="font-semibold text-foreground">{doctor.pan || 'AAAPC2019K'}</span>
          </div>
        </div>

        {/* Active Commission Rule Spec */}
        <div className="mt-2.5 p-2 bg-muted/60 rounded-lg flex items-center justify-between border border-border/60 text-xs">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <Percent className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Commission Rule:</span>
          </div>
          <span className="font-mono text-[11px] text-foreground bg-background px-2 py-0.5 rounded border border-border font-semibold">
            {doctor.commissionType === 'PERCENTAGE' && `${doctor.commissionValue}% on Outpatient Diagnostic Panels`}
            {doctor.commissionType === 'FLAT' && `₹${doctor.commissionValue} flat per outpatient referral`}
            {doctor.commissionType === 'NONE' && 'None (Institutional / Hospital Tie-up)'}
          </span>
        </div>
      </div>

      {/* Pending Settlement Highlight Card */}
      <div className="p-4 border-b border-border bg-card flex flex-col gap-3">
        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-800 dark:text-amber-300">
              Current Unsettled Balance
            </span>
            {pendingAmount > 0 ? (
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {formatCurrency(pendingAmount)}
            </span>
            <span className="text-xs font-mono text-amber-800/80 dark:text-amber-300/80">
              {pendingEntries.length || (pendingAmount > 0 ? 'Active' : 0)} Unsettled Cases
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Cycle cut-off: 25th of month. Standard batch payout via Direct Bank NEFT.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 print:hidden">
          <button
            type="button"
            disabled={pendingAmount <= 0}
            onClick={() => onOpenSettleModal(doctor, pendingEntries)}
            className="w-full h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Mark as Settled &amp; Generate Voucher</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsStatementModalOpen(true)}
              className="flex-1 h-8 px-3 bg-muted hover:bg-muted/80 text-foreground rounded-md text-xs font-medium flex items-center justify-center gap-1.5 border border-border transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export Detailed Audit PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStatementModalOpen(true)}
              className="h-8 w-8 flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md border border-border transition-colors"
              title="Print statement"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chronological Referral Audit Sub-list */}
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            Patient Referrals ({entries.length})
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Chronological Stream
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="p-6 bg-muted/20 rounded-lg border border-border text-center text-xs text-muted-foreground">
            No referral entries recorded for this clinician.
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const isPending = entry.status === 'PENDING';

              return (
                <div
                  key={entry.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                    isPending
                      ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-900/40'
                      : 'bg-muted/30 border-border/70 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        isPending ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      title={isPending ? 'Pending Settlement' : 'Settled'}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {entry.patientName || 'Diagnostic Patient'}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {entry.panelName || 'Investigation Panel'}
                      </span>
                      {entry.billAmount && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Billed: {formatCurrency(entry.billAmount)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`text-xs font-bold block ${
                        isPending
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      +{formatCurrency(entry.amount)}
                    </span>
                    <span
                      className={`text-[10px] block ${
                        isPending
                          ? 'text-amber-600 dark:text-amber-400 font-medium'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Doctor Statement & Payout Advice Modal */}
      <DoctorStatementModal
        isOpen={isStatementModalOpen}
        doctor={doctor}
        entries={entries}
        onClose={() => setIsStatementModalOpen(false)}
      />
    </div>
  );
}
