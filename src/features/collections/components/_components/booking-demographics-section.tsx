'use client';

import * as React from 'react';

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
}: BookingDemographicsSectionProps) {
  return (
    <>
      <div className="space-y-3">
        <h3 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          01. Patient Demographics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-foreground font-medium mb-1">Patient Full Name *</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => onPatientNameChange(e.target.value)}
              placeholder="e.g. Suman K. Sharma"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-foreground font-medium mb-1">Phone Number (+91) *</label>
            <input
              type="tel"
              required
              value={patientPhone}
              onChange={(e) => onPatientPhoneChange(e.target.value)}
              placeholder="e.g. +91 98450 12345"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
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
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
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
          <label className="block text-foreground font-medium mb-1">Complete Address *</label>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="House/Flat #, Street, Locality, Landmark (e.g. Indiranagar 100ft Road)..."
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </>
  );
}
