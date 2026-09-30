import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { FlaskConical, ShieldCheck } from 'lucide-react';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Sign In — LabOS',
  description: 'Sign in to your LabOS diagnostic laboratory management system.',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      {/* Top minimal brand bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider">
            LO
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            LabOS
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border hidden sm:inline-block">
            Diagnostic OS
          </span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">NABL & ISO 15189 Compliant</span>
          <span className="sm:hidden">NABL Ready</span>
        </div>
      </header>

      {/* Main content canvas with subtle clinical grid */}
      <main
        className="flex-1 flex items-center justify-center p-4 sm:p-6"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="w-full max-w-[420px]">
          <div className="bg-card border border-border rounded-xl shadow-xs p-6 sm:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-border bg-card text-center text-xs text-muted-foreground flex items-center justify-center gap-2 shrink-0">
        <FlaskConical className="w-3.5 h-3.5" />
        <span>LabOS · Precision-engineered for independent diagnostic labs · India</span>
      </footer>
    </div>
  );
}

