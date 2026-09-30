'use client';

import * as React from 'react';
import { X, FlaskConical } from 'lucide-react';
import type { CreatePanelDto } from '../types';

interface CreatePanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (dto: CreatePanelDto) => void;
  isCreating?: boolean;
}

const CATEGORIES = [
  'Clinical Pathology',
  'Hematology',
  'Biochemistry',
  'Microbiology',
  'Serology / Immunology',
];

export function CreatePanelModal({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
}: CreatePanelModalProps) {
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [category, setCategory] = React.useState('Clinical Pathology');
  const [price, setPrice] = React.useState('450');
  const [specimenType, setSpecimenType] = React.useState('Venous Blood / EDTA 3 mL');
  const [tatMinutes, setTatMinutes] = React.useState('120');
  const [initialSection, setInitialSection] = React.useState('I. Primary Diagnostic Parameters');
  const [initialParameter, setInitialParameter] = React.useState('Key Biomarker Level');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    onCreate({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category,
      price: Number(price) || 0,
      specimenType: specimenType.trim(),
      tatMinutes: Number(tatMinutes) || 120,
      sections: [
        {
          name: initialSection.trim() || 'I. Primary Investigation Group',
          sortOrder: 1,
          parameters: [
            {
              name: initialParameter.trim() || 'Primary Parameter',
              code: `${code.trim().toUpperCase()}-01`,
              unit: 'mg/dL',
              inputType: 'NUMBER',
              referenceText: '0 - 100',
              sortOrder: 1,
            },
          ],
        },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-card rounded-xl border border-border shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Create New Diagnostic Panel
              </h2>
              <p className="text-xs font-mono text-muted-foreground">
                Define master test specification &amp; biological intervals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Panel Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Glycated Hemoglobin (HbA1c)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shortcode *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BIO-09"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Department / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Standard Fee (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Turnaround Time (Minutes) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={tatMinutes}
                onChange={(e) => setTatMinutes(e.target.value)}
                className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Specimen Tube &amp; Quantity
            </label>
            <input
              type="text"
              placeholder="e.g. Venous Whole Blood / EDTA 2 mL"
              value={specimenType}
              onChange={(e) => setSpecimenType(e.target.value)}
              className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold block">
              Default Section &amp; Parameter Seed
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Initial Section Group"
                value={initialSection}
                onChange={(e) => setInitialSection(e.target.value)}
                className="h-9 px-3 bg-muted/30 border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                type="text"
                placeholder="Initial Parameter Name"
                value={initialParameter}
                onChange={(e) => setInitialParameter(e.target.value)}
                className="h-9 px-3 bg-muted/30 border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md text-xs font-medium text-foreground hover:bg-muted border border-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="h-9 px-5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isCreating ? 'Creating Panel...' : 'Create Panel in Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
