'use client';

import * as React from 'react';
import { X, UserPlus, Shield } from 'lucide-react';
import { useLabProfile } from '../hooks/use-lab-profile';
import type { StaffRole, InviteStaffDto } from '../types';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (dto: InviteStaffDto) => void;
  isSubmitting?: boolean;
}

const ROLE_OPTIONS: { value: StaffRole; label: string; desc: string }[] = [
  { value: 'PATHOLOGIST', label: 'Pathologist', desc: 'Authorized signatory for clinical report verification' },
  { value: 'SR_TECHNICIAN', label: 'Senior Technician', desc: 'Analyzer feed & specimen accessioning' },
  { value: 'TECHNICIAN', label: 'Technician', desc: 'Phlebotomy, data entry & barcode labeling' },
  { value: 'PHLEBOTOMIST', label: 'Phlebotomist', desc: 'Home sample collection & tube logging' },
  { value: 'BILLING', label: 'Billing Desk', desc: 'Invoicing, receipts, and cash settlement only' },
  { value: 'DIRECTOR', label: 'Director / Co-Owner', desc: 'Administrative & laboratory operations manager' },
];

export function InviteStaffModal({
  isOpen,
  onClose,
  onInvite,
  isSubmitting = false,
}: InviteStaffModalProps) {
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'LabOS';
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<StaffRole>('PATHOLOGIST');
  const [qualification, setQualification] = React.useState('');
  const [councilRegistration, setCouncilRegistration] = React.useState('');
  const [signOffScope, setSignOffScope] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    onInvite({
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      qualification: qualification.trim() || undefined,
      councilRegistration: councilRegistration.trim() || undefined,
      signOffScope: signOffScope.trim() || undefined,
    });

    // Reset and close
    setFullName('');
    setEmail('');
    setQualification('');
    setCouncilRegistration('');
    setSignOffScope('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-card rounded-xl border border-border shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Invite Laboratory Staff Member
              </h2>
              <p className="text-xs font-mono text-muted-foreground">
                Grant workstation terminal credentials &amp; NABL scope
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
              Full Name &amp; Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Ananya Sen / M. Venkatesh"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Official Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="name@apexdiagnostic.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workstation Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Clinical Qualification
              </label>
              <input
                type="text"
                placeholder="e.g. MBBS, DCP / B.Sc MLT"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
          </div>

          {(role === 'PATHOLOGIST' || role === 'DIRECTOR' || role === 'OWNER') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Council Reg # (KMC / MCI)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KMC Reg #58921"
                  value={councilRegistration}
                  onChange={(e) => setCouncilRegistration(e.target.value)}
                  className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  NABL Sign-off Scope
                </label>
                <input
                  type="text"
                  placeholder="e.g. All Panels / Hem & Biochem"
                  value={signOffScope}
                  onChange={(e) => setSignOffScope(e.target.value)}
                  className="w-full h-10 px-3.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>
            </div>
          )}

          <div className="p-3 rounded-md bg-muted/40 border border-border flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <span className="font-mono text-[11px]">
              Invitation sends an onboarding activation link to join {labName} workspace.
            </span>
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
              disabled={isSubmitting}
              className="h-9 px-5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Invite...' : 'Send Workstation Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
