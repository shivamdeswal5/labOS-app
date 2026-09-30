'use client';

import * as React from 'react';
import Link from 'next/link';
import { ExternalLink, ShieldCheck, Eye } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { useLabProfile, useStaffMembers } from '@/features/settings/api/use-settings';
import { evaluateNormalRange } from '../../utils/range-checker';
import type { DetailedReport } from '../../types';

interface ReportLetterheadPreviewProps {
  report: DetailedReport;
  values: Record<string, string>;
  remarks: string;
}

export function ReportLetterheadPreview({
  report,
  values,
  remarks,
}: ReportLetterheadPreviewProps) {
  const { data: labProfile } = useLabProfile();
  const { data: staffMembers = [] } = useStaffMembers();
  const patient = report.patient;
  const patientSex = patient?.sex;
  const isFinalized = report.status === 'FINALIZED';

  const accentColor = labProfile?.accentColor || '#0f766e';
  const labName = labProfile?.name || 'Deswal Diagnostic Laboratory';
  const labAddress = labProfile?.address || 'Barara, Haryana';
  const labPhones = labProfile?.phoneNumbers?.join(' / ') || '';
  const nablId = labProfile?.nablId?.trim() || '';

  // Primary doctor / Signatory
  const primarySignatory =
    staffMembers.find(
      (s) => s.role === 'OWNER' || s.role === 'PATHOLOGIST' || s.role === 'DIRECTOR',
    ) || staffMembers[0];
  const technician = staffMembers.find(
    (s) => s.role === 'TECHNICIAN' || s.role === 'SR_TECHNICIAN',
  );

  // Normalized patient age (strips accidental duplicate 'YRS' or letters)
  const rawAge = patient?.age;
  const normalizedAge = rawAge
    ? String(rawAge).replace(/[^0-9]/g, '').trim() || String(rawAge).replace(/\s*(yrs|yr|y)\b/gi, '').trim()
    : null;

  // Format creation or report date
  const reportDate = React.useMemo(() => {
    return formatDate(report.createdAt || new Date().toISOString());
  }, [report.createdAt]);

  return (
    <div className="flex flex-col gap-2">
      {/* Control Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-foreground" />
          <span className="font-semibold text-sm text-foreground">Live Print Simulator</span>
          <span className="font-mono text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
            A4 Letterhead
          </span>
        </div>

        {isFinalized ? (
          <Link
            href={`/reports/${report.id}/preview`}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Official Print Sheet →</span>
          </Link>
        ) : (
          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Draft Preview Mirror</span>
          </span>
        )}
      </div>

      {/* A4 Sheet Paper Simulator */}
      <div
        id="printable-report"
        className={`w-full bg-white text-zinc-900 rounded-xl shadow-md border border-zinc-200 p-6 sm:p-7 min-h-[720px] flex flex-col justify-between text-xs select-none ${
          !isFinalized ? 'draft-watermark' : ''
        }`}
      >
        <div>
          {/* Dynamic Clinic Header / Letterhead */}
          <div className="border-b-2 pb-3 text-center" style={{ borderColor: accentColor }}>
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight uppercase"
              style={{ color: accentColor }}
            >
              {labName}
            </h1>
            <p className="text-xs text-zinc-600 mt-0.5 font-medium">
              {labProfile?.tagline || 'Clinical Pathology, Biochemistry, Hematology & Molecular Diagnostics'}
            </p>
            <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
              {labAddress} {labPhones ? `| Tel: ${labPhones}` : ''} {nablId ? `| NABL: ${nablId}` : ''}
            </p>
          </div>

          {/* Patient Details Grid */}
          <div className="bg-zinc-50 p-3 rounded-lg mt-3 grid grid-cols-12 gap-y-1.5 border border-zinc-200 font-sans">
            <div className="col-span-7 flex items-baseline gap-1.5">
              <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                Patient Name:
              </span>
              <span className="font-bold text-zinc-900 text-sm">{patient?.name || 'Walk-in Patient'}</span>
            </div>

            <div className="col-span-5 flex items-baseline justify-end gap-1.5">
              <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                Report No:
              </span>
              <span className="font-mono font-bold text-zinc-900">{report.reportNumber}</span>
            </div>

            <div className="col-span-7 flex items-baseline gap-1.5">
              <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                Age / Gender:
              </span>
              <span className="font-medium text-zinc-800">
                {normalizedAge ? `${normalizedAge} Y` : 'N/A'} / {patient?.sex || 'N/A'}
              </span>
            </div>

            <div className="col-span-5 flex items-baseline justify-end gap-1.5">
              <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                Date:
              </span>
              <span className="font-mono text-zinc-800">{reportDate}</span>
            </div>

            <div className="col-span-12 flex items-baseline gap-1.5 pt-1 border-t border-zinc-200 mt-0.5">
              <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                Referred By:
              </span>
              <span className="font-medium text-zinc-800">
                {report.refByDoctor?.name || 'Self / Direct Walk-in'}
              </span>
            </div>
          </div>

          {/* Panels & Investigation Results */}
          {report.reportPanels?.map((rp, pIdx) => (
            <div key={rp.panelId || rp.panel?.id || `panel-${pIdx}`} className="mt-4">
              {/* Test Title Banner */}
              <div
                className="text-center py-1.5 my-2 border-y bg-zinc-50/50"
                style={{ borderColor: `${accentColor}40` }}
              >
                <span
                  className="font-bold text-xs uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  {rp.panel?.name}
                </span>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 bg-zinc-100 py-1 px-2 text-zinc-800 font-mono text-[10px] font-bold uppercase rounded">
                <div className="col-span-5">Investigation</div>
                <div className="col-span-3">Result</div>
                <div className="col-span-4 text-right">Reference Range</div>
              </div>

              {/* Sections & Parameters */}
              {rp.panel?.sections?.map((section) => (
                <div key={section.id} className="mt-2">
                  <div
                    className="px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider rounded-xs"
                    style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                  >
                    {section.name}
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {section.parameters?.map((param) => {
                      const currentValue = values[param.id] ?? '';
                      const evaluation = evaluateNormalRange(param.normalRange, currentValue, patientSex);
                      const isAbnormal = evaluation.isOutOfRange;

                      return (
                        <div
                          key={param.id}
                          className={`grid grid-cols-12 py-1 px-2 items-center transition-colors ${
                            isAbnormal ? 'bg-red-50/80 text-red-700' : 'text-zinc-800'
                          }`}
                        >
                          <div className={`col-span-5 ${isAbnormal ? 'font-semibold text-red-700' : 'text-zinc-800'}`}>
                            {param.name}
                          </div>

                          <div className="col-span-3 font-mono font-medium">
                            <span className={isAbnormal ? 'font-bold text-red-700' : 'font-medium text-zinc-900'}>
                              {currentValue || '–'}
                            </span>
                            {param.unit && <span className="text-[10px] text-zinc-500 ml-1">{param.unit}</span>}
                          </div>

                          <div className="col-span-4 text-right font-mono text-[10px] text-zinc-600">
                            {evaluation.formattedRange} {param.unit || ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Clinical Remarks Block */}
          {remarks && remarks.trim() ? (
            <div className="mt-4 p-2.5 bg-zinc-50 rounded border border-zinc-200">
              <div className="font-mono text-[10px] font-bold text-zinc-800 uppercase">Doctor Remarks:</div>
              <div className="text-[11px] text-zinc-700 mt-0.5 italic">
                {remarks.trim()}
              </div>
            </div>
          ) : null}
        </div>

        {/* Clean Signature Footer */}
        <div className="pt-4 mt-6 border-t border-zinc-200">
          <div className="flex items-end justify-between">
            {technician ? (
              <div>
                <div className="text-[11px] font-medium text-zinc-700">Checked by:</div>
                <div className="font-bold text-zinc-900 text-xs">{technician.fullName}</div>
                <div className="font-mono text-[10px] text-zinc-500">{technician.qualification || 'Lab Technician (DMLT)'}</div>
              </div>
            ) : (
              <div />
            )}

            <div className="text-right">
              {isFinalized ? (
                <div className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Digitally Verified & Signed</span>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-zinc-400 mb-1">Draft — Pending Sign-off</div>
              )}
              {primarySignatory?.signatureUrl ? (
                <div className="h-8 flex items-center justify-end">
                  <img
                    src={primarySignatory.signatureUrl}
                    alt="Doctor Signature"
                    className="max-h-7 max-w-[120px] object-contain"
                  />
                </div>
              ) : (
                <div className="h-6" />
              )}
              <div className="font-bold text-zinc-900 text-xs">
                {primarySignatory?.fullName || 'Authorized Signatory'}
              </div>
              {primarySignatory?.qualification ? (
                <div className="font-mono text-[10px] text-zinc-600">{primarySignatory.qualification}</div>
              ) : null}
              <div className="font-mono text-[10px] text-zinc-500">
                {primarySignatory?.councilRegistration
                  ? `Regn: ${primarySignatory.councilRegistration}`
                  : (primarySignatory?.signOffScope || (primarySignatory?.fullName ? 'Authorized Signatory' : ''))}
              </div>
            </div>
          </div>

          <div className="text-center mt-4 font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
            *** End of Diagnostic Examination Report ***
          </div>
        </div>
      </div>
    </div>
  );
}
