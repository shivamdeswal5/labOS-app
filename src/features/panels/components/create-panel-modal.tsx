'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPanelSchema, type CreatePanelSchema } from '../schemas/create-panel.schema';
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePanelSchema>({
    resolver: zodResolver(createPanelSchema),
    defaultValues: {
      name: '',
      code: '',
      category: 'Clinical Pathology',
      price: 450,
      specimenType: 'Venous Blood / EDTA 3 mL',
      tatMinutes: 120,
      initialSection: 'I. Primary Diagnostic Parameters',
      initialParameter: 'Key Biomarker Level',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        code: '',
        category: 'Clinical Pathology',
        price: 450,
        specimenType: 'Venous Blood / EDTA 3 mL',
        tatMinutes: 120,
        initialSection: 'I. Primary Diagnostic Parameters',
        initialParameter: 'Key Biomarker Level',
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmitHandler = handleSubmit((values) => {
    const uppercaseCode = values.code.trim().toUpperCase();
    onCreate({
      name: values.name.trim(),
      code: uppercaseCode,
      category: values.category,
      price: Number(values.price) || 0,
      specimenType: values.specimenType.trim(),
      tatMinutes: Number(values.tatMinutes) || 120,
      sections: [
        {
          name: values.initialSection.trim() || 'I. Primary Investigation Group',
          sortOrder: 1,
          parameters: [
            {
              name: values.initialParameter.trim() || 'Primary Parameter',
              code: `${uppercaseCode}-01`,
              unit: 'mg/dL',
              inputType: 'NUMBER',
              referenceText: '0 - 100',
              sortOrder: 1,
            },
          ],
        },
      ],
    });

    reset();
    onClose();
  });

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
        <form onSubmit={onSubmitHandler} noValidate className="p-6 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Panel Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Glycated Hemoglobin (HbA1c)"
              {...register('name')}
              className={cn(
                'w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors',
                errors.name && 'border-destructive focus:ring-destructive'
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shortcode <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BIO-09"
                {...register('code')}
                className={cn(
                  'w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors uppercase',
                  errors.code && 'border-destructive focus:ring-destructive'
                )}
              />
              {errors.code && (
                <p className="text-[11px] text-destructive mt-1">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Department / Category <span className="text-destructive">*</span>
              </label>
              <select
                {...register('category')}
                className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Standard Fee (₹) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                {...register('price')}
                className={cn(
                  'w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors',
                  errors.price && 'border-destructive focus:ring-destructive'
                )}
              />
              {errors.price && (
                <p className="text-[11px] text-destructive mt-1">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Turnaround Time (Minutes) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="1"
                {...register('tatMinutes')}
                className={cn(
                  'w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors',
                  errors.tatMinutes && 'border-destructive focus:ring-destructive'
                )}
              />
              {errors.tatMinutes && (
                <p className="text-[11px] text-destructive mt-1">{errors.tatMinutes.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Specimen Tube &amp; Quantity <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Venous Whole Blood / EDTA 2 mL"
              {...register('specimenType')}
              className={cn(
                'w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors',
                errors.specimenType && 'border-destructive focus:ring-destructive'
              )}
            />
            {errors.specimenType && (
              <p className="text-[11px] text-destructive mt-1">{errors.specimenType.message}</p>
            )}
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold block">
              Default Section &amp; Parameter Seed
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Initial Section Group"
                  {...register('initialSection')}
                  className={cn(
                    'w-full h-9 px-3 bg-muted/30 border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring',
                    errors.initialSection && 'border-destructive'
                  )}
                />
                {errors.initialSection && (
                  <p className="text-[11px] text-destructive mt-1">{errors.initialSection.message}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Initial Parameter Name"
                  {...register('initialParameter')}
                  className={cn(
                    'w-full h-9 px-3 bg-muted/30 border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring',
                    errors.initialParameter && 'border-destructive'
                  )}
                />
                {errors.initialParameter && (
                  <p className="text-[11px] text-destructive mt-1">{errors.initialParameter.message}</p>
                )}
              </div>
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
