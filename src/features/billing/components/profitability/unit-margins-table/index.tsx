'use client';

import * as React from 'react';
import {
  Search,
  FlaskConical,
  Truck,
  Download,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { TestProfitabilityMetric } from '@/features/billing/types';
import { UnitMarginMobileCard } from '../_components/unit-margin-mobile-card';
import { exportToCsv } from '@/lib/csv-exporter';

interface UnitMarginsTableProps {
  metrics: TestProfitabilityMetric[];
}

export function UnitMarginsTable({ metrics }: UnitMarginsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [executionFilter, setExecutionFilter] = React.useState<
    'ALL' | 'IN_HOUSE' | 'OUTSOURCED' | 'HIGH_MARGIN'
  >('ALL');

  const filteredMetrics = React.useMemo(() => {
    return metrics.filter((m) => {
      if (executionFilter === 'IN_HOUSE' && m.executionType !== 'IN_HOUSE') return false;
      if (executionFilter === 'OUTSOURCED' && m.executionType !== 'OUTSOURCED') return false;
      if (executionFilter === 'HIGH_MARGIN' && m.marginPercentage < 65) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.panelName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.panelCode && m.panelCode.toLowerCase().includes(q))
      );
    });
  }, [metrics, executionFilter, searchQuery]);

  const handleExportUnitMargins = () => {
    const headers = [
      'Panel Code',
      'Investigation Panel Name',
      'Department',
      'Execution Mode',
      'Retail Fee (INR)',
      'Direct Cost / Reagents (INR)',
      'Doctor Referral Cut (INR)',
      'Net Margin (INR)',
      'Margin (%)',
      'Monthly Volume (Tests)',
      'Total Profit MTD (INR)',
      'Strategic Recommendation',
    ];

    const rows = filteredMetrics.map((m) => [
      m.panelCode || '—',
      m.panelName,
      m.category,
      m.executionType,
      m.retailPrice,
      m.directCost,
      m.referralCommissionAvg,
      m.netMargin,
      `${m.marginPercentage}%`,
      m.volumeMTD,
      m.totalProfitMTD,
      m.recommendationReason || m.strategicRecommendation,
    ]);

    const mtdMonth = new Date().toISOString().slice(0, 7);
    exportToCsv({
      filename: `LabOS_Diagnostic_Unit_Margins_${mtdMonth}`,
      headers,
      rows,
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search test panel, department, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {(
              [
                { key: 'ALL', label: 'All Tests' },
                { key: 'IN_HOUSE', label: 'In-House Bench' },
                { key: 'OUTSOURCED', label: 'Outsourced Ref' },
                { key: 'HIGH_MARGIN', label: 'High Margin (>65%)' },
              ] as const
            ).map((tab) => {
              const isActive = executionFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setExecutionFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                    isActive
                      ? 'bg-foreground text-background shadow-2xs font-semibold'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Export Action */}
          <button
            type="button"
            onClick={handleExportUnitMargins}
            className="h-9 px-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
            title="Export Unit Economics CSV"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden md:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono uppercase text-[10px] text-muted-foreground tracking-wider">
                <th className="py-2.5 px-3">Test Investigation</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Execution</th>
                <th className="py-2.5 px-3 text-right">Retail Fee</th>
                <th className="py-2.5 px-3 text-right">Direct Cost</th>
                <th className="py-2.5 px-3 text-right">Doctor Cut</th>
                <th className="py-2.5 px-3 text-center">Net Margin</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3 text-right">Total Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-muted-foreground">
                    No investigations match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((item) => {
                  const isInHouse = item.executionType === 'IN_HOUSE';
                  const isHighMargin = item.marginPercentage >= 65;
                  const isLowMargin = item.marginPercentage < 50;

                  return (
                    <tr key={item.panelId} className="hover:bg-muted/40 transition-colors">
                      {/* Name & Code */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground">
                            {item.panelName}
                          </span>
                          {item.panelCode && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {item.panelCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-muted-foreground">
                        {item.category}
                      </td>

                      {/* Execution Mode */}
                      <td className="py-3 px-3 text-center">
                        {isInHouse ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60 font-mono">
                            <FlaskConical className="w-3 h-3 text-blue-600" />
                            In-House
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-900/60 font-mono">
                            <Truck className="w-3 h-3 text-violet-600" />
                            Outsourced
                          </span>
                        )}
                      </td>

                      {/* Retail Price */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                        {formatCurrency(item.retailPrice)}
                      </td>

                      {/* Direct Cost */}
                      <td className="py-3 px-3 text-right font-mono text-amber-700 dark:text-amber-400">
                        {formatCurrency(item.directCost)}
                      </td>

                      {/* Doctor Commission */}
                      <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                        {item.referralCommissionAvg > 0
                          ? `-${formatCurrency(item.referralCommissionAvg)}`
                          : '—'}
                      </td>

                      {/* Net Margin & Progress Bar */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isHighMargin
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : isLowMargin
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-foreground'
                            }`}
                          >
                            {formatCurrency(item.netMargin)} ({item.marginPercentage}%)
                          </span>
                          <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isHighMargin
                                  ? 'bg-emerald-500'
                                  : isLowMargin
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(10, item.marginPercentage))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                        {item.volumeMTD} /mo
                      </td>

                      {/* Total Profit */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        +{formatCurrency(item.totalProfitMTD)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {filteredMetrics.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-xl border border-border text-muted-foreground text-xs">
            No tests match your filter.
          </div>
        ) : (
          filteredMetrics.map((item) => (
            <UnitMarginMobileCard key={item.panelId} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
