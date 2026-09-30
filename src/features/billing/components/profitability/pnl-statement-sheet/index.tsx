'use client';

import * as React from 'react';
import {
  FileText,
  Printer,
  Download,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useLabProfile } from '@/features/settings/api/use-settings';
import type { DiagnosticPnLStatement } from '@/features/billing/types';
import { exportToCsv } from '@/lib/csv-exporter';

interface PnLStatementSheetProps {
  pnl: DiagnosticPnLStatement;
}

export function PnLStatementSheet({ pnl }: PnLStatementSheetProps) {
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'Deswal Diagnostic Laboratory';
  const labAddress = labProfile?.address || 'Barara, Haryana';

  const handleExportCsv = () => {
    const headers = ['Category', 'Line Item Description', 'Amount (INR)', '% of Net Revenue'];
    const netRev = pnl.revenue.netRealizedRevenue;

    const pct = (amt: number) => `${Math.round((amt / netRev) * 1000) / 10}%`;

    const rows = [
      ['A. REVENUE', 'Gross Diagnostic Patient Billings', pnl.revenue.grossPatientBilled, pct(pnl.revenue.grossPatientBilled)],
      ['A. REVENUE', 'Less: Patient Concessions & Discounts', -pnl.revenue.discountsConcessions, pct(pnl.revenue.discountsConcessions)],
      ['A. REVENUE', 'NET REALIZED OPERATING REVENUE', pnl.revenue.netRealizedRevenue, '100.0%'],
      ['B. DIRECT COGS', 'Laboratory Reagents & Test Kits', pnl.cogs.reagentsAndKits, pct(pnl.cogs.reagentsAndKits)],
      ['B. DIRECT COGS', 'Vacutainers, Tubes & Needles', pnl.cogs.collectionConsumables, pct(pnl.cogs.collectionConsumables)],
      ['B. DIRECT COGS', 'Reference Lab Send-Out Wholesale Fees', pnl.cogs.outsourcedReferenceLabFees, pct(pnl.cogs.outsourcedReferenceLabFees)],
      ['B. DIRECT COGS', 'Doctor Referral Commissions Disbursed', pnl.cogs.doctorReferralCommissions, pct(pnl.cogs.doctorReferralCommissions)],
      ['B. DIRECT COGS', 'TOTAL DIRECT TESTING COSTS (COGS)', pnl.cogs.totalDirectCOGS, pct(pnl.cogs.totalDirectCOGS)],
      ['C. GROSS MARGIN', 'GROSS DIAGNOSTIC MARGIN', pnl.cogs.grossDiagnosticMargin, `${pnl.cogs.grossMarginPercentage}%`],
      ['D. OVERHEADS (OPEX)', 'Bench Technicians & Staff Salaries', pnl.opex.technicianSalaries, pct(pnl.opex.technicianSalaries)],
      ['D. OVERHEADS (OPEX)', 'Laboratory Facility Rent', pnl.opex.facilityRent, pct(pnl.opex.facilityRent)],
      ['D. OVERHEADS (OPEX)', 'Electricity, Inverter & Cold Chain Power', pnl.opex.powerAndUtilities, pct(pnl.opex.powerAndUtilities)],
      ['D. OVERHEADS (OPEX)', 'Automated Analyzer AMC & Maintenance', pnl.opex.analyzerAMCAndMaintenance, pct(pnl.opex.analyzerAMCAndMaintenance)],
      ['D. OVERHEADS (OPEX)', 'Bio-Medical Waste Disposal Protocol', pnl.opex.bioMedicalWasteManagement, pct(pnl.opex.bioMedicalWasteManagement)],
      ['D. OVERHEADS (OPEX)', 'Software & Courier Logistics', pnl.opex.softwareAndLogistics, pct(pnl.opex.softwareAndLogistics)],
      ['D. OVERHEADS (OPEX)', 'TOTAL OPERATING OVERHEAD (OPEX)', pnl.opex.totalOperatingOverhead, pct(pnl.opex.totalOperatingOverhead)],
      ['E. NET PROFIT', 'NET OPERATING INCOME (OWNER CASHFLOW)', pnl.netOperatingIncome, `${pnl.netMarginPercentage}%`],
    ];

    const mtdMonth = new Date().toISOString().slice(0, 7);
    exportToCsv({
      filename: `LabOS_Diagnostic_PnL_Statement_${mtdMonth}`,
      headers,
      rows,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-semibold text-xs text-foreground">
            Monthly Profit &amp; Loss Statement ({pnl.reportingPeriod})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-8 px-3 rounded-lg border border-border bg-muted/60 hover:bg-muted text-foreground text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export Statement CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-8 px-3 rounded-lg bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print P&amp;L Statement</span>
          </button>
        </div>
      </div>

      {/* Structured P&L Statement Sheet */}
      <div
        data-printable-area="true"
        className="bg-card border border-border rounded-xl p-5 sm:p-8 flex flex-col gap-6 shadow-2xs text-xs font-sans print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-foreground uppercase tracking-tight">
              {labName}
            </h2>
            <p className="text-[11px] text-muted-foreground font-mono">
              Diagnostic Operating Statement • {pnl.reportingPeriod}
            </p>
            <p className="text-[11px] text-muted-foreground">{labAddress}</p>
          </div>

          <div className="text-right font-mono flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Accounting Standard
            </span>
            <span className="text-xs font-semibold text-foreground">
              Indian Healthcare Accrual (SAC 999316)
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              Reconciled with Banking Ledgers
            </span>
          </div>
        </div>

        {/* Section A: Revenue */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            A. Diagnostic Operating Inflow
          </span>
          <div className="divide-y divide-border/60 border border-border/80 rounded-lg overflow-hidden bg-background">
            <div className="flex items-center justify-between p-2.5">
              <span>Gross Outpatient &amp; Referral Test Billings</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(pnl.revenue.grossPatientBilled)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 text-muted-foreground">
              <span>Less: Patient Hardship Concessions &amp; Discounts</span>
              <span className="font-mono text-amber-700 dark:text-amber-400">
                -{formatCurrency(pnl.revenue.discountsConcessions)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-muted/30 font-semibold text-foreground">
              <span>Net Realized Diagnostic Revenue</span>
              <span className="font-mono font-bold text-sm text-foreground">
                {formatCurrency(pnl.revenue.netRealizedRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Section B: Direct COGS */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            B. Direct Testing Costs of Goods Sold (COGS)
          </span>
          <div className="divide-y divide-border/60 border border-border/80 rounded-lg overflow-hidden bg-background font-mono">
            <div className="flex items-center justify-between p-2.5 font-sans">
              <span>Automated Analyzer Reagents, Lyse &amp; Test Kits</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(pnl.cogs.reagentsAndKits)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 font-sans">
              <span>Phlebotomy Consumables (Vacutainers, Needles, Swabs)</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(pnl.cogs.collectionConsumables)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 font-sans">
              <span>Reference Lab Send-Out Wholesale Fees (Dr. Lal, SRL, Thyrocare)</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(pnl.cogs.outsourcedReferenceLabFees)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 font-sans">
              <span>Doctor Referral Commissions Accrued &amp; Disbursed</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(pnl.cogs.doctorReferralCommissions)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-muted/30 font-semibold text-foreground font-sans">
              <span>Total Direct Testing COGS</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                {formatCurrency(pnl.cogs.totalDirectCOGS)}
              </span>
            </div>
          </div>
        </div>

        {/* Section C: Gross Margin */}
        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              C. Gross Diagnostic Testing Margin
            </span>
            <span className="text-xs text-muted-foreground">
              Revenue minus reagents, consumables, and outsourced fees
            </span>
          </div>
          <div className="text-right font-mono">
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 block">
              {formatCurrency(pnl.cogs.grossDiagnosticMargin)}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {pnl.cogs.grossMarginPercentage}% Gross Margin
            </span>
          </div>
        </div>

        {/* Section D: Operating Overheads (Opex) */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            D. Laboratory Fixed Operating Overheads (Opex)
          </span>
          <div className="divide-y divide-border/60 border border-border/80 rounded-lg overflow-hidden bg-background">
            <div className="flex items-center justify-between p-2.5">
              <span>Laboratory Bench Technicians &amp; Phlebotomist Salaries</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(pnl.opex.technicianSalaries)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5">
              <span>Laboratory Facility Rent &amp; Property Maintenance</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(pnl.opex.facilityRent)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5">
              <span>Electricity, Inverter Backup &amp; Continuous Cold-Chain Power</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(pnl.opex.powerAndUtilities)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5">
              <span>Clinical Analyzer Annual Maintenance Contracts (AMC)</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(pnl.opex.analyzerAMCAndMaintenance)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5">
              <span>Bio-Medical Waste Management (State Pollution Control Board)</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(pnl.opex.bioMedicalWasteManagement)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-muted/30 font-semibold text-foreground">
              <span>Total Fixed Laboratory Operating Overhead</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(pnl.opex.totalOperatingOverhead)}
              </span>
            </div>
          </div>
        </div>

        {/* Section E: Net Operating Income */}
        <div className="p-4 bg-foreground text-background rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-80">
              E. Net Operating Profit (Owner Take-Home EBITDA)
            </span>
            <span className="text-xs opacity-90 font-medium">
              Net diagnostic cashflow retained after all laboratory costs and overheads
            </span>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xl font-black block">
              {formatCurrency(pnl.netOperatingIncome)}
            </span>
            <span className="text-xs font-bold opacity-85">
              {pnl.netMarginPercentage}% Net Take-Home Margin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
