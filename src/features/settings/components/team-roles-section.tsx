'use client';

import * as React from 'react';
import { UserPlus, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StaffMember, InviteStaffDto } from '../types';
import { InviteStaffModal } from './invite-staff-modal';

interface TeamRolesSectionProps {
  staffMembers: StaffMember[];
  onInviteMember: (dto: InviteStaffDto) => void;
  isInviting?: boolean;
}

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  OWNER: { label: 'Owner / Director', className: 'bg-primary text-primary-foreground' },
  DIRECTOR: { label: 'Director', className: 'bg-primary text-primary-foreground' },
  PATHOLOGIST: { label: 'Pathologist', className: 'bg-secondary text-foreground border border-border' },
  SR_TECHNICIAN: { label: 'Sr. Technician', className: 'bg-secondary text-foreground border border-border' },
  TECHNICIAN: { label: 'Technician', className: 'bg-secondary text-foreground border border-border' },
  PHLEBOTOMIST: { label: 'Phlebotomist', className: 'bg-secondary text-foreground border border-border' },
  BILLING: { label: 'Billing Desk', className: 'bg-secondary text-foreground border border-border' },
};

export function TeamRolesSection({
  staffMembers,
  onInviteMember,
  isInviting = false,
}: TeamRolesSectionProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);

  const handleExportCsv = () => {
    const csvHeader = 'Full Name,Email,Role,Qualification,Council Registration,Sign-off Scope,Last Active\n';
    const csvRows = staffMembers
      .map(
        (s) =>
          `"${s.fullName}","${s.email}","${s.role}","${s.qualification || ''}","${s.councilRegistration || ''}","${s.signOffScope || ''}","${s.lastActive}"`,
      )
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `labos_staff_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden space-y-0">
      {/* Section Header */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border bg-card">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Section 03
          </span>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Authorized Personnel &amp; Workstation Roles
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configured roles govern statutory report verification, analyzer query approval, and patient record modifications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Personnel Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase border-b border-border">
              <th className="py-2.5 px-4 tracking-wider font-semibold">Staff Identity &amp; Handle</th>
              <th className="py-2.5 px-4 tracking-wider font-semibold">Workstation Role</th>
              <th className="py-2.5 px-4 tracking-wider font-semibold">NABL Sign-off Scope</th>
              <th className="py-2.5 px-4 tracking-wider font-semibold">Terminal Telemetry</th>
              <th className="py-2.5 px-4 text-right tracking-wider font-semibold">Configuration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {staffMembers.map((staff) => {
              const roleMeta = ROLE_LABELS[staff.role] || {
                label: staff.role,
                className: 'bg-secondary text-foreground',
              };
              const initials = staff.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('');

              return (
                <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-secondary text-foreground font-semibold font-mono text-xs flex items-center justify-center border border-border shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {staff.fullName}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground truncate">
                          {staff.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium',
                        roleMeta.className,
                      )}
                    >
                      {roleMeta.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs font-medium text-foreground">
                      {staff.signOffScope || staff.role}
                    </div>
                    {staff.councilRegistration && (
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {staff.councilRegistration}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          staff.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50',
                        )}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {staff.lastActive}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      className="font-mono text-xs text-primary hover:underline px-2 py-1"
                    >
                      {staff.role === 'PATHOLOGIST' || staff.role === 'OWNER'
                        ? 'Manage Credentials'
                        : 'Edit Role'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-muted/30 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border text-muted-foreground">
        <span className="font-mono text-xs">
          {staffMembers.length} active laboratory workstation accounts · Max allowed: 15 seats
        </span>
        <button
          type="button"
          onClick={handleExportCsv}
          className="font-mono text-xs text-primary hover:underline font-medium flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Invite Modal */}
      <InviteStaffModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={onInviteMember}
        isSubmitting={isInviting}
      />
    </div>
  );
}
