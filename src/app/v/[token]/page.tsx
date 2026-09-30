'use client';

import * as React from 'react';
import {
  ShieldCheck,
  Download,
  Printer,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { A4DocumentSheet } from '@/features/reports/components/report-preview/a4-document-sheet';
import { useSharedReport } from '@/features/reports/api/use-shared-report';
import { downloadReportPdf } from '@/features/reports/api/use-report-pdf';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';

interface PublicPortalProps {
  params: Promise<{ token: string }>;
}

export default function PublicPatientPortalPage({ params }: PublicPortalProps) {
  const resolvedParams = React.use(params);
  const token = resolvedParams.token;

  const { data: report, isLoading, isError, error, refetch } = useSharedReport(token);
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'Diagnostic Laboratory';
  const initial = labName.charAt(0).toUpperCase() || 'L';
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsDownloading(true);
    try {
      await downloadReportPdf(token, report.reportNumber, true);
    } catch {
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* Public Patient Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-base shrink-0">
              {initial}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
                {labName}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>NABL Accredited • Official Patient Portal</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloading || !report}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              disabled={!report}
              className="h-8 gap-1.5 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-2 sm:px-6 py-6 sm:py-10 flex flex-col items-center">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-16 gap-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md w-full my-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-zinc-500 font-mono">
              Authenticating QR token and decrypting report...
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl space-y-3 max-w-md w-full my-12 text-center">
            <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-400 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Report Link Expired or Not Found</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-300">
              {error instanceof Error ? error.message : 'Please check your QR code or WhatsApp link and try again.'}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Authenticated Report Display */}
        {report && (
          <div className="w-full flex flex-col items-center gap-4">
            {/* Authenticated Verification Pill */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs text-zinc-600 dark:text-zinc-400 font-mono print:hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Authenticated Digital Report #{report.reportNumber}</span>
              <span>•</span>
              <span>{report.patient?.name}</span>
            </div>

            {/* Simulated Paper A4 Document */}
            <div className="w-full flex justify-center overflow-x-auto py-2">
              <A4DocumentSheet report={report} />
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 print:hidden font-mono">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{labName} • NABL Accredited Laboratory</span>
          <span>Powered by LabOS Diagnostic Operating System</span>
        </div>
      </footer>
    </div>
  );
}
