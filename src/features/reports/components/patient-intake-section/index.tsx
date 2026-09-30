'use client';

import * as React from 'react';
import {
  BadgeCheck,
  Barcode,
  CheckCircle2,
  Copy,
  Search,
  User,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { usePatientSearch } from '@/features/patients/api/use-patient-search';
import { useDoctors } from '@/features/referrals/api/use-doctors';
import type { Patient, SexEnum } from '../../types';

export interface PatientFormState {
  existingPatientId?: string;
  patientNumber?: string;
  name: string;
  age: string;
  ageUnit: 'YRS' | 'MOS' | 'DAYS';
  sex: SexEnum;
  phone: string;
  refByDoctorId: string;
  reportNumber?: string;
  remarks: string;
}

interface PatientIntakeSectionProps {
  formState: PatientFormState;
  onChange: (updates: Partial<PatientFormState>) => void;
  errors?: {
    name?: string;
    age?: string;
    phone?: string;
    panels?: string;
  };
}

export function PatientIntakeSection({
  formState,
  onChange,
  errors,
}: PatientIntakeSectionProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const { data: searchResults, isLoading: isSearching } = usePatientSearch(searchTerm);
  const { data: doctors } = useDoctors();

  // Automatic phone-first deduplication: detect returning patients/households when 10 digits are typed
  const phoneDigits = React.useMemo(() => {
    const raw = (formState.phone || '').replace(/\D/g, '');
    return raw.length >= 10 ? raw.slice(-10) : '';
  }, [formState.phone]);
  const { data: phoneMatches } = usePatientSearch(phoneDigits);

  const handleSelectExistingPatient = (patient: Patient) => {
    onChange({
      existingPatientId: patient.id,
      patientNumber: patient.patientNumber,
      name: patient.name,
      age: patient.age ? patient.age.replace(/[^0-9]/g, '') : '',
      sex: patient.sex || 'OTHER',
      phone: patient.phone || '',
    });
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleResetToNewPatient = () => {
    onChange({
      existingPatientId: undefined,
      patientNumber: undefined,
      name: '',
      age: '',
      sex: 'MALE',
      phone: '',
    });
    setSearchTerm('');
  };

  return (
    <section className="bg-card rounded-xl p-4 sm:p-6 border border-border elevation-flat space-y-5">
      {/* Section Header with Barcode Accession UID */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
            01
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Patient Details
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter patient information — accession barcode is auto-assigned upon registration
            </p>
          </div>
        </div>

        {/* Barcode Accession Chip */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-muted/60 border border-border rounded-lg">
            <Barcode className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Accession UID
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {formState.reportNumber ? (
                  formState.reportNumber
                ) : (
                  <span className="text-primary font-mono text-[11px] tracking-wide">
                    AUTO-ASSIGNED
                  </span>
                )}
              </span>
            </div>
            {formState.reportNumber && (
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(formState.reportNumber!)}
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Copy UID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Patient Search / Returning Patient Lookup */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search returning patient by phone number or name..."
              className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
            />
          </div>
          {formState.existingPatientId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetToNewPatient}
              className="h-9 text-xs gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register as New</span>
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchTerm.length >= 2 && (
          <div className="absolute top-10 left-0 right-0 z-20 bg-card border border-border rounded-md elevation-overlay max-h-48 overflow-y-auto p-1 text-xs">
            {isSearching ? (
              <div className="py-3 text-center text-muted-foreground">Searching patient index...</div>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handleSelectExistingPatient(patient)}
                  className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{patient.name}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      ({patient.patientNumber})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                    <span>{patient.phone || 'No phone'}</span>
                    <span>• {patient.sex}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-3 text-center text-muted-foreground">
                No patient found with &quot;{searchTerm}&quot;. Fill the form below to register.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Patient Name */}
        <div className="lg:col-span-4 space-y-1.5">
          <label htmlFor="patient-name" className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Patient Full Name <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              id="patient-name"
              type="text"
              required
              value={formState.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. Priya Deshmukh"
              className={cn('h-9 text-xs', errors?.name && 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive')}
              aria-invalid={Boolean(errors?.name)}
            />
          </div>
          {errors?.name && (
            <p className="text-[11px] text-destructive font-medium mt-1 animate-in fade-in-0 duration-150">
              {errors.name}
            </p>
          )}
          {formState.existingPatientId && !errors?.name && (
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" />
              <span>Existing MRN: {formState.patientNumber}</span>
            </span>
          )}
        </div>

        {/* Age & Unit */}
        <div className="lg:col-span-2 space-y-1.5">
          <label htmlFor="patient-age" className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Age <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              id="patient-age"
              type="number"
              min="0"
              max="130"
              required
              value={formState.age}
              onChange={(e) => onChange({ age: e.target.value })}
              placeholder="38"
              className={cn('h-9 text-xs', errors?.age && 'border-destructive ring-1 ring-destructive focus-visible:ring-destructive')}
              aria-invalid={Boolean(errors?.age)}
            />
            <select
              value={formState.ageUnit}
              onChange={(e) => onChange({ ageUnit: e.target.value as 'YRS' | 'MOS' | 'DAYS' })}
              className="h-9 px-2 bg-muted/60 border border-border rounded-md text-xs font-mono text-foreground focus:outline-hidden"
            >
              <option value="YRS">YRS</option>
              <option value="MOS">MOS</option>
              <option value="DAYS">DAYS</option>
            </select>
          </div>
          {errors?.age && (
            <p className="text-[11px] text-destructive font-medium mt-1 animate-in fade-in-0 duration-150">
              {errors.age}
            </p>
          )}
        </div>

        {/* Biological Sex */}
        <div className="lg:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Biological Sex <span className="text-destructive">*</span>
          </label>
          <select
            value={formState.sex}
            onChange={(e) => onChange({ sex: e.target.value as SexEnum })}
            className="w-full h-9 px-2.5 bg-card border border-border rounded-md text-xs text-foreground focus:outline-hidden"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Contact Mobile */}
        <div className="lg:col-span-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Mobile
            </label>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> WhatsApp Ready
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
              +91
            </span>
            <input
              type="tel"
              value={formState.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="98765 43210"
              className="w-full h-9 pl-11 pr-3 bg-card border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
            />
          </div>

          {/* Smart Phone-First Deduplication Assistant */}
          {phoneMatches && phoneMatches.length > 0 && !formState.existingPatientId && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {phoneMatches.length === 1
                    ? 'Returning Patient Found'
                    : `${phoneMatches.length} Family Members Found on this Number`}
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-medium">
                  Auto-Fill
                </span>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                {phoneMatches.map((matched) => (
                  <button
                    key={matched.id}
                    type="button"
                    onClick={() => handleSelectExistingPatient(matched)}
                    className="flex-1 min-w-[200px] flex items-center justify-between p-2 rounded-md bg-card border border-emerald-500/30 hover:border-emerald-500 text-left cursor-pointer transition-all shadow-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-foreground text-xs leading-none group-hover:text-primary transition-colors">
                          {matched.name}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          {matched.age} • {matched.sex} • {matched.patientNumber}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 shrink-0 ml-2">
                      Use Profile →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Existing Patient Confirmation */}
          {formState.existingPatientId && (
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5 text-[11px]">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                Linked to Master Record: <strong>{formState.name}</strong> ({formState.patientNumber})
              </span>
              <button
                type="button"
                onClick={handleResetToNewPatient}
                className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                Register as New
              </button>
            </div>
          )}
        </div>

        {/* Referring Clinician Dropdown */}
        <div className="lg:col-span-7 space-y-1.5">
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Referring Clinician
          </label>
          <select
            value={formState.refByDoctorId}
            onChange={(e) => onChange({ refByDoctorId: e.target.value })}
            className="w-full h-9 px-3 bg-card border border-border rounded-md text-xs text-foreground focus:outline-hidden"
          >
            <option value="">Self / Walk-in Sample Submission</option>
            {doctors?.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} {doc.clinic ? `(${doc.clinic})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Clinical Remarks / Notes */}
        <div className="lg:col-span-5 space-y-1.5">
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Notes (e.g. Fasting, Sample time)
          </label>
          <Input
            type="text"
            value={formState.remarks}
            onChange={(e) => onChange({ remarks: e.target.value })}
            placeholder="e.g. Fasting 10h, Sample collected 08:30 AM"
            className="h-9 text-xs"
          />
        </div>
      </div>
    </section>
  );
}
