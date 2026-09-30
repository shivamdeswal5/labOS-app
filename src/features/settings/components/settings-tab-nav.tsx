'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { SettingsTabId } from '../types';

interface SettingsTabNavProps {
  activeTab: SettingsTabId;
  onSelectTab: (tab: SettingsTabId) => void;
}

const TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'profile', label: 'Lab Profile & Legal Identity' },
  { id: 'branding', label: 'Report Header & Letterhead' },
  { id: 'signatures', label: 'Pathologist Signatures & Credentials' },
  { id: 'team', label: 'Team & Access Roles' },
  { id: 'analyzers', label: 'API & Analyzer Interfacing' },
];

export function SettingsTabNav({ activeTab, onSelectTab }: SettingsTabNavProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (index + 1) % TABS.length;
      onSelectTab(TABS[nextIdx].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (index - 1 + TABS.length) % TABS.length;
      onSelectTab(TABS[prevIdx].id);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Settings navigation tabs"
      className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-border"
    >
      {TABS.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              'pb-3.5 pt-1 text-sm font-medium transition-all whitespace-nowrap relative focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-xs',
              isActive
                ? 'text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
