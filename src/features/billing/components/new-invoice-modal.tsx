'use client';

import * as React from 'react';
import { X, Plus, Trash2, Receipt, QrCode, Banknote, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { CreateInvoiceDto, CreateInvoiceItemDto, PaymentMethod } from '../types';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateInvoiceDto) => Promise<void>;
}

const COMMON_TESTS = [
  { name: 'Complete Hemogram / CBC', price: 380 },
  { name: 'Glycated Hemoglobin (HbA1c)', price: 650 },
  { name: 'Urine Routine & Microscopic', price: 350 },
  { name: 'Lipid Profile Comprehensive', price: 950 },
  { name: 'Kidney Function Test (KFT)', price: 950 },
  { name: 'Liver Function Test (LFT)', price: 850 },
  { name: 'Thyroid Stimulating Hormone (TSH)', price: 450 },
];

export function NewInvoiceModal({ isOpen, onClose, onSubmit }: NewInvoiceModalProps) {
  const [patientName, setPatientName] = React.useState('');
  const [patientMrn, setPatientMrn] = React.useState('');
  const [patientPhone, setPatientPhone] = React.useState('');
  const [items, setItems] = React.useState<CreateInvoiceItemDto[]>([
    { description: 'Complete Hemogram / CBC', unitPrice: 380, quantity: 1 },
  ]);
  const [discount, setDiscount] = React.useState('0');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('UPI');
  const [markAsPaid, setMarkAsPaid] = React.useState(true);
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleAddItem = (name: string, price: number) => {
    setItems((prev) => [...prev, { description: name, unitPrice: price, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * (item.quantity || 1), 0);
  const discountVal = Number(discount) || 0;
  const totalAmount = Math.max(0, subtotal - discountVal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || items.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        patientId: `pt-${Date.now()}`,
        patientName: patientName.trim(),
        patientMrn: patientMrn.trim() || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
        items,
        discount: discountVal,
        paymentMethod,
        markAsPaid,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Generate Patient Invoice</h2>
              <p className="text-[11px] text-muted-foreground">
                SAC 999316 Diagnostic Pathology • GST-Exempt Healthcare Billing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh V. Gupta"
                className="w-full h-8 px-2.5 text-xs bg-muted/30 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                MRN / Patient ID
              </label>
              <input
                type="text"
                value={patientMrn}
                onChange={(e) => setPatientMrn(e.target.value)}
                placeholder="e.g. PT-10492"
                className="w-full h-8 px-2.5 text-xs font-mono bg-muted/30 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Mobile (+91)
              </label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="98201 23456"
                className="w-full h-8 px-2.5 text-xs font-mono bg-muted/30 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Quick Add Investigation Chips */}
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
              Quick Add Diagnostic Panel
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TESTS.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => handleAddItem(t.name, t.price)}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded text-[11px] font-medium text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3 text-primary" />
                  <span>{t.name}</span>
                  <span className="font-mono text-muted-foreground">({formatCurrency(t.price)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground">
                  <th className="py-2 px-3">Investigation Description</th>
                  <th className="py-2 px-3 text-right">Price (₹)</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, description: val } : it)),
                          );
                        }}
                        className="w-full bg-transparent text-xs font-medium text-foreground focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, unitPrice: val, total: val } : it)),
                          );
                        }}
                        className="w-20 text-right bg-transparent font-mono text-xs text-foreground focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-1.5 px-2 rounded border text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors ${
                      paymentMethod === 'UPI'
                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                        : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-1.5 px-2 rounded border text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors ${
                      paymentMethod === 'CASH'
                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                        : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-1.5 px-2 rounded border text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors ${
                      paymentMethod === 'CARD'
                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                        : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Card
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mark-paid"
                  checked={markAsPaid}
                  onChange={(e) => setMarkAsPaid(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="mark-paid" className="text-xs font-medium text-foreground cursor-pointer">
                  Mark as fully collected right now
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Billing Notes / Remarks
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Corporate tie-up or concession rationale"
                  className="w-full h-8 px-2 text-xs bg-muted/30 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Discount / Concession:</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-16 h-6 px-1.5 text-right font-mono text-xs bg-background border border-input rounded"
                  />
                </div>
              </div>
              <div className="flex justify-between text-muted-foreground pt-1 border-t border-border">
                <span className="font-semibold text-foreground">Net Payable:</span>
                <span className="font-mono font-bold text-base text-foreground">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="h-8 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording...' : 'Generate Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
