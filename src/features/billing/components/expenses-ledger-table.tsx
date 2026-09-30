'use client';

import * as React from 'react';
import { Plus, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { Expense, ExpenseCategory, ExpenseFilter, PaymentMethod, CreateExpenseDto } from '../types';

interface ExpensesLedgerTableProps {
  expenses: Expense[];
  filter: ExpenseFilter;
  onFilterChange: (filter: ExpenseFilter) => void;
  onCreateExpense: (dto: CreateExpenseDto) => Promise<void>;
  isLoading?: boolean;
}

export function ExpensesLedgerTable({
  expenses,
  filter,
  onFilterChange,
  onCreateExpense,
  isLoading,
}: ExpensesLedgerTableProps) {
  // Quick Log State
  const [category, setCategory] = React.useState<ExpenseCategory>('REAGENTS');
  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [expenseDate, setExpenseDate] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('NET_BANKING');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await onCreateExpense({
        category,
        title: title.trim(),
        amount: Number(amount),
        expenseDate,
        paymentMethod,
        vendor: vendor.trim() || undefined,
      });
      // Reset form
      setTitle('');
      setAmount('');
      setVendor('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (cat: ExpenseCategory, label?: string) => {
    const text = label || cat;
    switch (cat) {
      case 'REAGENTS':
        return (
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-mono text-[11px] font-medium">
            {text}
          </span>
        );
      case 'CONSUMABLES':
        return (
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-mono text-[11px] font-medium">
            {text}
          </span>
        );
      case 'MAINTENANCE':
      case 'EQUIPMENT':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-mono text-[11px] font-medium">
            {text}
          </span>
        );
      case 'UTILITIES':
        return (
          <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-mono text-[11px] font-medium">
            {text}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-muted text-foreground font-mono text-[11px] font-medium">
            {text}
          </span>
        );
    }
  };

  const getPaymentModeLabel = (mode: PaymentMethod) => {
    switch (mode) {
      case 'NET_BANKING':
        return 'Bank NEFT / RTGS';
      case 'UPI':
        return 'UPI Transfer';
      case 'CASH':
        return 'Cash Outflow';
      case 'CARD':
        return 'Corporate Card';
      default:
        return 'Account Transfer';
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Quick Inline Expense Form matching Stitch */}
      <div className="p-3.5 bg-card rounded-lg border border-border shadow-xs">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>Quick Log Operational Expense</span>
        </div>

        <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full h-8 px-2 text-xs bg-muted/30 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="REAGENTS">Reagents & Kits</option>
              <option value="CONSUMABLES">Consumables & Vacutainers</option>
              <option value="MAINTENANCE">Machine Maintenance / AMC</option>
              <option value="UTILITIES">Utilities & Bio-Waste</option>
              <option value="RENT">Laboratory Rent</option>
              <option value="SALARIES">Staff Salaries</option>
              <option value="OTHER">Reference Lab / Travel</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cobas c501 Creatinine Reagent"
              className="w-full h-8 px-2.5 text-xs bg-muted/30 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Vendor / Payee
            </label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Transasia Bio"
              className="w-full h-8 px-2.5 text-xs bg-muted/30 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-8 px-2.5 text-xs font-mono bg-muted/30 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Mode
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full h-8 px-1 text-xs bg-muted/30 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="NET_BANKING">NEFT</option>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Cheque</option>
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Date
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full h-8 px-1 text-xs bg-muted/30 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div className="lg:col-span-1 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-8 px-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs rounded-md inline-flex items-center justify-center gap-1 transition-colors disabled:opacity-50 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '...' : 'Add'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Strip */}
      <div className="p-3 bg-card rounded-lg border border-border flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filter.search || ''}
              onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
              placeholder="Search expenses, vendors..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-muted/30 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background"
            />
          </div>

          <select
            value={filter.category || 'ALL'}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                category: e.target.value as 'ALL' | ExpenseCategory,
              })
            }
            aria-label="Filter by Category"
            className="h-8 px-2 text-xs bg-muted/30 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Categories</option>
            <option value="REAGENTS">Reagents & Kits</option>
            <option value="CONSUMABLES">Consumables</option>
            <option value="MAINTENANCE">Machine Maintenance</option>
            <option value="UTILITIES">Utilities</option>
            <option value="RENT">Rent</option>
            <option value="SALARIES">Salaries</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Showing {expenses.length} outflows
        </div>
      </div>

      {/* Desktop Data Grid */}
      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Expense ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description & Purpose</th>
                <th className="py-2.5 px-3">Vendor / Payee</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3">Disbursal Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading expenses ledger...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    <p className="font-medium text-foreground">No expenses found</p>
                    <p className="text-[11px] mt-1">Log a new laboratory expense above.</p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                      {exp.expenseDate}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-foreground whitespace-nowrap">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getCategoryBadge(exp.category, exp.categoryLabel)}
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground">
                      {exp.title}
                      {exp.notes && (
                        <div className="text-[11px] text-muted-foreground font-normal">
                          {exp.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                      {exp.vendor || '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {getPaymentModeLabel(exp.paymentMethod)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (<768px) */}
      <div className="md:hidden space-y-2.5">
        {expenses.map((exp) => (
          <div
            key={exp.id}
            className="p-3 bg-card rounded-lg border border-border space-y-2 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-foreground">
                  {exp.expenseNumber}
                </span>
                <span className="text-muted-foreground font-mono text-[11px] ml-2">
                  {exp.expenseDate}
                </span>
                <div className="font-medium text-sm text-foreground mt-0.5">
                  {exp.title}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm text-foreground">
                  {formatCurrency(exp.amount)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border text-xs">
              <div>{getCategoryBadge(exp.category, exp.categoryLabel)}</div>
              <div className="text-muted-foreground font-mono text-[11px]">
                {exp.vendor || getPaymentModeLabel(exp.paymentMethod)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
