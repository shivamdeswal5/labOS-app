'use client';

import * as React from 'react';
import {
  Search,
  QrCode,
  Banknote,
  CreditCard,
  Building2,
  Printer,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { EllipsisCell, TablePagination, EmptyState } from '@/components/shared';
import type { Invoice, InvoiceFilter, PaymentMethod } from '../types';

interface InvoicesLedgerTableProps {
  invoices: Invoice[];
  filter: InvoiceFilter;
  onFilterChange: (filter: InvoiceFilter) => void;
  onViewReceipt: (invoice: Invoice) => void;
  onSettleInvoice: (invoice: Invoice) => void;
  isLoading?: boolean;
}

export function InvoicesLedgerTable({
  invoices,
  filter,
  onFilterChange,
  onViewReceipt,
  onSettleInvoice,
  isLoading,
}: InvoicesLedgerTableProps) {
  const [searchTerm, setSearchTerm] = React.useState(filter.search || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onFilterChange({ ...filter, search: val });
  };

  const handleStatusChange = (status: 'ALL' | 'PAID' | 'PENDING') => {
    onFilterChange({ ...filter, status });
  };

  const handlePaymentMethodChange = (paymentMethod: 'ALL' | PaymentMethod) => {
    onFilterChange({ ...filter, paymentMethod });
  };

  const renderPaymentModeBadge = (mode: PaymentMethod | null, notes?: string | null) => {
    if (mode === 'UPI') {
      const isPhonePe = notes?.toLowerCase().includes('phonepe');
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground bg-muted/60 px-2 py-1 rounded border border-border">
          <QrCode className="w-3.5 h-3.5 text-primary" />
          <span>UPI {isPhonePe ? '(PhonePe)' : '(GPay)'}</span>
        </span>
      );
    }
    if (mode === 'CASH') {
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground bg-muted/60 px-2 py-1 rounded border border-border">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cash Handover</span>
        </span>
      );
    }
    if (mode === 'CARD') {
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground bg-muted/60 px-2 py-1 rounded border border-border">
          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
          <span>POS Card Swipe</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground bg-muted/60 px-2 py-1 rounded border border-border">
        <Building2 className="w-3.5 h-3.5 text-amber-600" />
        <span>Corporate Credit</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Filter Strip */}
      <div className="p-3 bg-card rounded-lg border border-border flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Universal Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search invoice #, patient, MRN..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-muted/30 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="inline-flex p-0.5 bg-muted rounded-md border border-border text-xs">
            <button
              type="button"
              onClick={() => handleStatusChange('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                (filter.status || 'ALL') === 'ALL'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Invoices
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('PAID')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filter.status === 'PAID'
                  ? 'bg-background text-emerald-600 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Paid
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('PENDING')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filter.status === 'PENDING'
                  ? 'bg-background text-amber-600 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pending
            </button>
          </div>

          {/* Payment Method Selector */}
          <select
            value={filter.paymentMethod || 'ALL'}
            onChange={(e) => handlePaymentMethodChange(e.target.value as 'ALL' | PaymentMethod)}
            aria-label="Filter by Payment Method"
            className="h-8 px-2 text-xs bg-muted/30 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI (GPay / PhonePe)</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Debit / Credit Card</option>
            <option value="OTHER">Corporate / Credit</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">Showing {invoices.length} invoices</span>
        </div>
      </div>

      {/* Desktop Data Grid */}
      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Patient Demographics</th>
                <th className="py-2.5 px-3">Investigations Billed</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Receipt Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Loading invoices ledger...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6">
                    <EmptyState
                      title="No invoices match criteria"
                      description="Try clearing filters or search terms to locate billing records."
                    />
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isPaid = inv.paymentStatus === 'PAID';
                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-foreground whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                        {formatDateTime(inv.createdAt)}
                      </td>
                      <td className="py-3 px-3">
                        <EllipsisCell value={inv.patientName} className="font-medium text-foreground" />
                        <div className="font-mono text-[11px] text-muted-foreground">
                          MRN: {inv.patientMrn}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground max-w-xs">
                        <EllipsisCell value={inv.testsBilled} className="text-xs" />
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderPaymentModeBadge(inv.paymentMethod, inv.notes)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono text-[11px] font-medium inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-mono text-[11px] font-medium inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPaid ? (
                            <button
                              type="button"
                              onClick={() => onViewReceipt(inv)}
                              className="h-7 px-2.5 bg-muted text-foreground hover:bg-muted/80 rounded font-medium text-xs inline-flex items-center gap-1 transition-colors border border-border"
                              title="Print diagnostic receipt voucher"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print / PDF</span>
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onSettleInvoice(inv)}
                                className="h-7 px-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-medium text-xs inline-flex items-center gap-1 transition-colors shadow-xs"
                                title="Record payment & settle invoice"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Settle Bill</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onViewReceipt(inv)}
                                className="h-7 px-2 bg-muted text-foreground hover:bg-muted/80 rounded font-medium text-xs inline-flex items-center transition-colors border border-border"
                                title="Print unfinalized draft invoice"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (<768px) */}
      <div className="md:hidden space-y-2.5">
        {invoices.map((inv) => {
          const isPaid = inv.paymentStatus === 'PAID';
          return (
            <div
              key={inv.id}
              className="p-3 bg-card rounded-lg border border-border space-y-2.5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {inv.invoiceNumber}
                  </span>
                  <div className="font-semibold text-sm text-foreground mt-0.5">
                    {inv.patientName}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    MRN: {inv.patientMrn} • {formatDateTime(inv.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-foreground">
                    {formatCurrency(inv.totalAmount)}
                  </div>
                  {isPaid ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono text-[10px] font-semibold inline-flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Paid
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-mono text-[10px] font-semibold inline-flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground line-clamp-1 border-t border-border pt-1.5">
                {inv.testsBilled}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div>{renderPaymentModeBadge(inv.paymentMethod, inv.notes)}</div>
                <div className="flex items-center gap-1.5">
                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => onSettleInvoice(inv)}
                      className="h-8 px-3 bg-primary text-primary-foreground rounded text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Settle
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onViewReceipt(inv)}
                    className="h-8 px-3 bg-muted text-foreground rounded text-xs font-semibold inline-flex items-center gap-1 border border-border"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Receipt
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* URL-Synchronized Table Pagination */}
      <TablePagination totalCount={invoices.length} />
    </div>
  );
}
