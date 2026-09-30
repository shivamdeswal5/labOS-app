'use client';

import * as React from 'react';
import { ShieldCheck, CheckCircle2, Phone, Mail, MessageSquare } from 'lucide-react';
import type { LabProfile } from '../types';

interface LabProfileSectionProps {
  profile: LabProfile;
  onChange: (updated: Partial<LabProfile>) => void;
}

export function LabProfileSection({ profile, onChange }: LabProfileSectionProps) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Section 01
          </span>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Legal Entity &amp; Facility Metadata
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary text-foreground text-xs font-mono font-medium border border-border">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          <span>Accredited ISO 15189:2022 Verified</span>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Legal Trade Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Lab Legal / Registered Trade Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors shadow-sm"
          />
          <p className="text-xs font-mono text-muted-foreground">
            Prints verbatim on statutory compliance disclaimers, letterheads, and test certificates.
          </p>
        </div>

        {/* NABL Registration */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            NABL Certificate Reg. ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={profile.nablId}
              onChange={(e) => onChange({ nablId: e.target.value })}
              className="w-full h-10 px-3.5 pr-9 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors shadow-sm"
            />
            <ShieldCheck className="w-4 h-4 text-primary absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xs font-mono text-muted-foreground">
            Accredited scope: Clinical Biochemistry &amp; Hematology.
          </p>
        </div>

        {/* Physical Street Address */}
        <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Physical Diagnostic Facility Address
          </label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors shadow-sm"
          />
        </div>

        {/* Primary Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Primary Dispatch Telephone
          </label>
          <div className="relative">
            <input
              type="text"
              value={profile.phoneNumbers[0] || ''}
              onChange={(e) => onChange({ phoneNumbers: [e.target.value] })}
              className="w-full h-10 pl-9 pr-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors shadow-sm"
            />
            <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Official Report Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Official Report Delivery Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={profile.officialEmail}
              onChange={(e) => onChange({ officialEmail: e.target.value })}
              className="w-full h-10 pl-9 pr-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors shadow-sm"
            />
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Dedicated WhatsApp Support */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dedicated WhatsApp Automated Dispatch
          </label>
          <div className="relative">
            <input
              type="text"
              value={profile.whatsappNumber}
              onChange={(e) => onChange({ whatsappNumber: e.target.value })}
              className="w-full h-10 pl-9 pr-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors shadow-sm"
            />
            <MessageSquare className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
