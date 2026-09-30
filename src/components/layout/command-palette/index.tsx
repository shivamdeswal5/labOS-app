'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  Barcode,
  FilePlus2,
  Users,
  UserCheck,
  Receipt,
  Truck,
  FlaskConical,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const navigateTo = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  if (!open) return null;

  return (
    <div
      id="command-palette"
      className="fixed inset-0 z-[80] flex items-start justify-center pt-24 bg-black/60 backdrop-blur-xs p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl bg-card text-card-foreground rounded-lg border border-border shadow-2xl elevation-modal overflow-hidden animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center gap-2 px-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Command.Input
              placeholder="Type a command, patient MRN, or barcode..."
              className="w-full h-11 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
              autoFocus
            />
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-sm">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No matching clinical records or actions found.
            </Command.Empty>

            <Command.Group
              heading="Quick Clinical Actions"
              className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1.5"
            >
              <Command.Item
                onSelect={() => navigateTo('/reports/new')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent transition-colors data-[selected=true]:bg-accent"
              >
                <FilePlus2 className="w-4 h-4 text-primary shrink-0" />
                <span>Create New Patient Diagnostic Report</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('/accessions')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent transition-colors data-[selected=true]:bg-accent"
              >
                <Barcode className="w-4 h-4 text-primary shrink-0" />
                <span>Scan Sample Tube Barcode</span>
              </Command.Item>
            </Command.Group>

            <Command.Group
              heading="Navigation"
              className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1.5 mt-2"
            >
              <Command.Item
                onSelect={() => navigateTo('/')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent transition-colors data-[selected=true]:bg-accent"
              >
                <LayoutDashboard className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Dashboard & Lab Telemetry</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('/patients')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent transition-colors data-[selected=true]:bg-accent"
              >
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Patients & Diagnostic History</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('/referrals')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent transition-colors data-[selected=true]:bg-accent"
              >
                <UserCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Doctor Referrals & Settlement</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('/billing')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent transition-colors data-[selected=true]:bg-accent"
              >
                <Receipt className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Invoices, Billing & Expenses</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('/collections')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent transition-colors data-[selected=true]:bg-accent"
              >
                <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Home Phlebotomy Collections</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('/panels')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent transition-colors data-[selected=true]:bg-accent"
              >
                <FlaskConical className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Test Panels & Parameter Catalog</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('/settings')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent transition-colors data-[selected=true]:bg-accent"
              >
                <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Settings & NABL / ISO 15189 QC</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-[11px] text-muted-foreground bg-muted/40">
            <span>Navigation shortcuts</span>
            <div className="flex items-center gap-2">
              <span>Navigate <kbd className="font-mono">↑↓</kbd></span>
              <span>Select <kbd className="font-mono">↵</kbd></span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
