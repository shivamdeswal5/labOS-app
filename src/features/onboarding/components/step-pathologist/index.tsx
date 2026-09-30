'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stethoscope, ChevronRight, ChevronLeft, Upload, Loader2, X } from 'lucide-react';
import {
  pathologistStepSchema,
  type PathologistStepSchema,
} from '../../schemas/onboarding.schema';
import { useUpdateProfile, useUploadSignature } from '../../api/use-onboarding';
import { cn } from '@/lib/utils';
import type { PathologistStepData } from '../../types';

const QUALIFICATION_OPTIONS = [
  'MD Pathology',
  'MBBS',
  'DNB Pathology',
  'MD Biochemistry',
  'DCP (Diploma in Clinical Pathology)',
  'MSc Medical Biochemistry',
  'DMLT',
];

interface StepPathologistProps {
  initialData: Partial<PathologistStepData>;
  onNext: (data: PathologistStepData) => void;
  onBack: () => void;
}

export function StepPathologist({ initialData, onNext, onBack }: StepPathologistProps) {
  const updateProfile = useUpdateProfile();
  const uploadSignature = useUploadSignature();
  const [signatureFile, setSignatureFile] = React.useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = React.useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = React.useState<string | undefined>(
    initialData.signatureUrl,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PathologistStepSchema>({
    resolver: zodResolver(pathologistStepSchema),
    defaultValues: {
      fullName: initialData.fullName ?? '',
      qualification: initialData.qualification ?? '',
      councilRegistrationNumber: initialData.councilRegistrationNumber ?? '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleRemoveSignature = () => {
    setSignatureFile(null);
    setSignaturePreview(null);
    setUploadedUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = handleSubmit(async (values) => {
    let signatureUrl = uploadedUrl;

    // Upload signature if a new file was selected
    if (signatureFile) {
      signatureUrl = await uploadSignature.mutateAsync(signatureFile);
    }

    updateProfile.mutate(
      { ...values, signatureUrl },
      {
        onSuccess: () => {
          onNext({ ...values, signatureUrl });
        },
        onError: (err) => {
          console.warn('Update pathologist profile notice:', err);
          onNext({ ...values, signatureUrl });
        },
      },
    );
  });

  const isLoading = uploadSignature.isPending || updateProfile.isPending;

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Step header */}
      <div className="px-8 py-6 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Stethoscope className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Pathologist Credentials & Signature
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              These details appear as the authorized signatory on finalized diagnostic reports.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {(updateProfile.error || uploadSignature.error) && (
          <div
            role="alert"
            className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
          >
            {((updateProfile.error || uploadSignature.error) as Error).message}
          </div>
        )}

        {/* Full name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="ob-pathologist-name"
            type="text"
            placeholder="Dr. Rajesh Kumar Sharma"
            autoComplete="name"
            {...register('fullName')}
            className={cn(
              'w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow',
              errors.fullName ? 'border-red-500' : 'border-border',
            )}
          />
          {errors.fullName && (
            <p className="text-xs text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        {/* Qualification */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Qualification / Degree <span className="text-red-500">*</span>
          </label>
          <select
            id="ob-qualification"
            {...register('qualification')}
            className={cn(
              'w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow',
              errors.qualification ? 'border-red-500' : 'border-border',
            )}
          >
            <option value="">Select qualification…</option>
            {QUALIFICATION_OPTIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          {errors.qualification && (
            <p className="text-xs text-red-600">{errors.qualification.message}</p>
          )}
        </div>

        {/* Medical Council Registration */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Medical Council Registration No.{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="ob-council-reg"
            type="text"
            placeholder="MCI/KMC – 12345 / 2015"
            {...register('councilRegistrationNumber')}
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-shadow"
          />
          <p className="text-[11px] text-muted-foreground">
            Printed below the digital signature seal on NABL-compliant reports.
          </p>
        </div>

        {/* Signature upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Digital Signature Image{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>

          {signaturePreview ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signaturePreview}
                alt="Signature preview"
                className="h-20 border border-border rounded-lg bg-white object-contain px-3 py-2"
              />
              <button
                type="button"
                onClick={handleRemoveSignature}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Remove signature"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2.5 px-4 h-10 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload signature image (PNG / JPG)
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Signature image file"
          />
          <p className="text-[11px] text-muted-foreground">
            Recommended: PNG with transparent background, 400×150px or wider.
            Stored securely in Supabase Storage.
          </p>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="px-8 py-5 border-t border-border bg-muted/20 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          id="ob-step2-next"
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
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
