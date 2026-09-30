'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, ChevronRight, Loader2 } from 'lucide-react';
import {
  labProfileStepSchema,
  type LabProfileStepSchema,
} from '../../schemas/onboarding.schema';
import { useUpdateLab } from '../../api/use-onboarding';
import { cn } from '@/lib/utils';
import type { LabProfileStepData } from '../../types';

const ACCENT_PRESETS = [
  { label: 'Slate Deep', value: '#0f172a' },
  { label: 'Royal Blue', value: '#1e40af' },
  { label: 'Forest Green', value: '#166534' },
  { label: 'Crimson', value: '#991b1b' },
  { label: 'Indigo', value: '#3730a3' },
  { label: 'Teal', value: '#0f766e' },
];

interface StepLabProfileProps {
  initialData: Partial<LabProfileStepData>;
  onNext: (data: LabProfileStepData) => void;
}

export function StepLabProfile({ initialData, onNext }: StepLabProfileProps) {
  const updateLab = useUpdateLab();
  const [selectedColor, setSelectedColor] = React.useState(
    initialData.accentColor ?? '#0f172a',
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LabProfileStepSchema>({
    resolver: zodResolver(labProfileStepSchema),
    defaultValues: {
      name: initialData.name ?? '',
      address: initialData.address ?? '',
      phoneNumber: initialData.phoneNumber ?? '',
      nablRegistrationId: initialData.nablRegistrationId ?? '',
      accentColor: initialData.accentColor ?? '#0f172a',
      tagline: initialData.tagline ?? '',
      footerNote:
        initialData.footerNote ??
        'This report is issued by a NABL accredited laboratory. Not valid for medico-legal purposes.',
      reportLanguage: initialData.reportLanguage ?? 'en',
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateLab.mutate(values, {
      onSuccess: () => {
        onNext(values);
      },
      onError: (err) => {
        console.warn('Update lab profile notice:', err);
        onNext(values);
      },
    });
  });

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('accentColor', color);
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Step header */}
      <div className="px-8 py-6 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Lab Profile & Branding
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              This information appears on every diagnostic report you print.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-5 space-y-4">
        {updateLab.error && (
          <div
            role="alert"
            className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
          >
            {(updateLab.error as Error).message}
          </div>
        )}

        {/* Lab name + NABL */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1 space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Lab / Diagnostic Center Name <span className="text-red-500">*</span>
            </label>
            <input
              id="ob-lab-name"
              type="text"
              placeholder="Apex Diagnostic Center"
              {...register('name')}
              className={cn(
                'w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow',
                errors.name ? 'border-red-500' : 'border-border',
              )}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              NABL / NABH Registration ID
            </label>
            <input
              id="ob-nabl-id"
              type="text"
              placeholder="MC-4192 / 2024"
              {...register('nablRegistrationId')}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Lab Address <span className="text-red-500">*</span>
          </label>
          <input
            id="ob-address"
            type="text"
            placeholder="123 MG Road, Indiranagar, Bengaluru – 560038"
            {...register('address')}
            className={cn(
              'w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow',
              errors.address ? 'border-red-500' : 'border-border',
            )}
          />
          {errors.address && (
            <p className="text-xs text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* Phone + Language */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1 space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="ob-phone"
              type="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              {...register('phoneNumber')}
              className={cn(
                'w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow',
                errors.phoneNumber ? 'border-red-500' : 'border-border',
              )}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Report Language
            </label>
            <select
              id="ob-language"
              {...register('reportLanguage')}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow"
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>
        </div>

        {/* Report accent color */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Report Accent Color
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleColorSelect(preset.value)}
                title={preset.label}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition-all',
                  selectedColor === preset.value
                    ? 'border-foreground scale-110 shadow-md'
                    : 'border-transparent hover:scale-105',
                )}
                style={{ backgroundColor: preset.value }}
              />
            ))}
            <div className="relative">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-8 h-8 rounded-full border-2 border-border cursor-pointer"
                title="Custom color"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Used for the letterhead accent line and report header on printed reports.
          </p>
        </div>

        {/* Tagline */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Lab Tagline{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="ob-tagline"
            type="text"
            placeholder="Precision Diagnostics for Better Health"
            {...register('tagline')}
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow"
          />
        </div>

        {/* Footer note */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Report Footer Note
          </label>
          <textarea
            id="ob-footer-note"
            rows={2}
            {...register('footerNote')}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow resize-none"
          />
          <p className="text-[11px] text-muted-foreground">
            Printed at the bottom of every report. Ensure it complies with NABL clause 5.8.3.
          </p>
        </div>
      </div>

      {/* Action footer */}
      <div className="px-8 py-4 border-t border-border bg-muted/20 flex justify-end">
        <button
          id="ob-step1-next"
          type="submit"
          disabled={updateLab.isPending}
          className="flex items-center gap-2 px-6 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {updateLab.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Save & Continue <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
