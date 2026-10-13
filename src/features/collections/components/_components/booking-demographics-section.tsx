'use client';

import { cn } from '@/lib/utils';

interface BookingDemographicsSectionProps {
  patientName: string;
  onPatientNameChange: (val: string) => void;
  patientPhone: string;
  onPatientPhoneChange: (val: string) => void;
  patientAge: string;
  onPatientAgeChange: (val: string) => void;
  patientSex: 'MALE' | 'FEMALE' | 'OTHER';
  onPatientSexChange: (val: 'MALE' | 'FEMALE' | 'OTHER') => void;
  address: string;
  onAddressChange: (val: string) => void;
  errors?: {
    patientName?: string;
    patientPhone?: string;
    patientAge?: string;
    address?: string;
  };
}

export function BookingDemographicsSection({
  patientName,
  onPatientNameChange,
  patientPhone,
  onPatientPhoneChange,
  patientAge,
  onPatientAgeChange,
  patientSex,
  onPatientSexChange,
  address,
  onAddressChange,
  errors,
}: BookingDemographicsSectionProps) {
  return (
    <>
      <div className="space-y-3">
        <h3 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          01. Patient Demographics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-foreground font-medium mb-1">
              Patient Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => onPatientNameChange(e.target.value)}
              placeholder="e.g. Suman K. Sharma"
              className={cn(
                'w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary',
                errors?.patientName && 'border-destructive focus:ring-destructive'
              )}
            />
            {errors?.patientName && (
              <p className="text-[11px] text-destructive mt-1">{errors.patientName}</p>
            )}
          </div>

          <div>
            <label className="block text-foreground font-medium mb-1">
              Phone Number (+91) <span className="text-destructive">*</span>
            </label>
            <input
              type="tel"
              value={patientPhone}
              onChange={(e) => onPatientPhoneChange(e.target.value)}
              placeholder="e.g. 9845012345"
              className={cn(
                'w-full px-3 py-2 bg-background border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary',
                errors?.patientPhone && 'border-destructive focus:ring-destructive'
              )}
            />
            {errors?.patientPhone && (
              <p className="text-[11px] text-destructive mt-1">{errors.patientPhone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-foreground font-medium mb-1">Age (Years)</label>
            <input
              type="number"
              value={patientAge}
              onChange={(e) => onPatientAgeChange(e.target.value)}
              placeholder="e.g. 48"
              className={cn(
                'w-full px-3 py-2 bg-background border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary',
                errors?.patientAge && 'border-destructive focus:ring-destructive'
              )}
            />
            {errors?.patientAge && (
              <p className="text-[11px] text-destructive mt-1">{errors.patientAge}</p>
            )}
          </div>

          <div>
            <label className="block text-foreground font-medium mb-1">Biological Sex</label>
            <select
              value={patientSex}
              onChange={(e) => onPatientSexChange(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-border">
        <h3 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          02. Collection Address &amp; Landmark
        </h3>

        <div>
          <label className="block text-foreground font-medium mb-1">
            Complete Address <span className="text-destructive">*</span>
          </label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="House/Flat #, Street, Locality, Landmark (e.g. Indiranagar 100ft Road)..."
            className={cn(
              'w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary',
              errors?.address && 'border-destructive focus:ring-destructive'
            )}
          />
          {errors?.address && (
            <p className="text-[11px] text-destructive mt-1">{errors.address}</p>
          )}
        </div>
      </div>
    </>
  );
}
