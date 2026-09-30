'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ShieldCheck, Save, RotateCcw, Check } from 'lucide-react';
import { SettingsTabNav } from '@/features/settings/components/settings-tab-nav';
import { LabProfileSection } from '@/features/settings/components/lab-profile-section';
import { BrandingLetterheadSection } from '@/features/settings/components/branding-letterhead-section';
import { StationerySettingsSection } from '@/features/settings/components/stationery-settings-section';
import { PathologistSignaturesSection } from '@/features/settings/components/pathologist-signatures-section';
import { TeamRolesSection } from '@/features/settings/components/team-roles-section';
import { AnalyzerInterfacingSection } from '@/features/settings/components/analyzer-interfacing-section';
import {
  useLabProfile,
  useUpdateLabProfile,
  useStaffMembers,
  useInviteStaffMember,
} from '@/features/settings/api/use-settings';
import { RoleGate } from '@/features/auth/components/role-gate';
import { AccessDeniedView } from '@/features/auth/components/access-denied';
import type { SettingsTabId, LabProfile } from '@/features/settings/types';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTabId>('profile');
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const { data: serverProfile, isLoading: isProfileLoading } = useLabProfile();
  const { data: staffMembers = [] } = useStaffMembers();
  const updateLabMutation = useUpdateLabProfile();
  const inviteStaffMutation = useInviteStaffMember();

  // Local draft overrides for editing
  const [draftOverrides, setDraftOverrides] = React.useState<Partial<LabProfile> | null>(null);

  const profile: LabProfile | undefined = serverProfile
    ? { ...serverProfile, ...draftOverrides }
    : undefined;

  const handleProfileChange = (updated: Partial<LabProfile>) => {
    setDraftOverrides((prev) => ({ ...(prev || {}), ...updated }));
  };

  const handleDiscard = () => {
    setDraftOverrides(null);
  };

  const handleSave = () => {
    if (!profile) return;
    updateLabMutation.mutate(
      {
        name: profile.name,
        nablId: profile.nablId,
        address: profile.address,
        phoneNumbers: profile.phoneNumbers,
        officialEmail: profile.officialEmail,
        whatsappNumber: profile.whatsappNumber,
        accentColor: profile.accentColor,
        footerNote: profile.footerNote,
        printSettings: profile.printSettings,
      },
      {
        onSuccess: () => {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        },
      },
    );
  };

  return (
    <AppShell>
      <RoleGate
        allowedRoles={['OWNER']}
        fallback={
          <AccessDeniedView
            requiredRoles={['OWNER']}
            customMessage="Laboratory licensing, profile branding, and staff role governance are restricted to the Lab Director / Owner."
          />
        }
      >
        <div className="flex flex-col w-full min-h-screen">
          {/* Sub-Header & Settings Navigation */}
          <div className="bg-card border-b border-border px-6 pt-5 pb-0 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  Configuration Node
                </span>
                <span className="font-mono text-xs text-muted-foreground">/</span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  SYS-SET-8820
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                Workspace Settings
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">
                Registry Sync:{' '}
                <span className="text-foreground font-semibold">MC-4192 / LIVE</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-secondary text-foreground font-mono text-xs font-medium border border-border">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>NABL ISO 15189</span>
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <SettingsTabNav activeTab={activeTab} onSelectTab={setActiveTab} />
        </div>

        {/* Content Container */}
        <div className="p-6 space-y-6 max-w-7xl">
          {isProfileLoading || !profile ? (
            <div className="bg-card rounded-xl p-8 border border-border flex items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>Loading laboratory profile &amp; compliance settings...</span>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <LabProfileSection
                  profile={profile}
                  onChange={handleProfileChange}
                />
              )}

              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <BrandingLetterheadSection
                    profile={profile}
                    onChange={handleProfileChange}
                  />
                  <StationerySettingsSection
                    profile={profile}
                    onChange={handleProfileChange}
                  />
                </div>
              )}

              {activeTab === 'signatures' && (
                <PathologistSignaturesSection staffMembers={staffMembers} />
              )}

              {activeTab === 'team' && (
                <TeamRolesSection
                  staffMembers={staffMembers}
                  onInviteMember={(dto) => inviteStaffMutation.mutate(dto)}
                  isInviting={inviteStaffMutation.isPending}
                />
              )}

              {activeTab === 'analyzers' && <AnalyzerInterfacingSection />}

              {/* Section 4: Operational Action Footer */}
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-mono text-xs">
                    Modifications write to immutable NABL audit ledger under session ID: SEC-99182
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in duration-200">
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved to registry</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="h-9 px-4 rounded-md text-xs font-medium text-foreground hover:bg-muted border border-border transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Discard Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={updateLabMutation.isPending}
                    className="h-9 px-5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{updateLabMutation.isPending ? 'Saving...' : 'Save Workspace Changes'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </RoleGate>
  </AppShell>
);
}
