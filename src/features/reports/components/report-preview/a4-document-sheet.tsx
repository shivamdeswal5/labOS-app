'use client';

import * as React from 'react';
import { ShieldCheck, AlertCircle, Truck } from 'lucide-react';
import { formatDateTime } from '@/lib/formatters';
import { useLabProfile, useStaffMembers } from '@/features/settings/api/use-settings';
import { useOutsourcedTests } from '@/features/referrals/api/use-outsourced';
import { ReportQrCode } from '@/components/ui/qr-code';
import { ReportBarcode } from '@/components/ui/barcode';
import { evaluateNormalRange } from '../../utils/range-checker';
import type { StationeryType } from '@/features/settings/types';
import type { DetailedReport } from '../../types';

interface A4DocumentSheetProps {
  report: DetailedReport;
  stationeryType?: StationeryType;
  headerMarginMm?: number;
  footerMarginMm?: number;
  simulateBlankStationery?: boolean;
}

export function A4DocumentSheet({
  report,
  stationeryType,
  headerMarginMm,
  footerMarginMm,
  simulateBlankStationery = false,
}: A4DocumentSheetProps) {
  const { data: labProfile } = useLabProfile();
  const { data: staffMembers = [] } = useStaffMembers();
  const { data: outsourcedTests = [] } = useOutsourcedTests(undefined, report.id);

  const activeStationery: StationeryType =
    stationeryType || labProfile?.printSettings?.stationeryType || 'PLAIN';
  const effectiveHeaderMargin =
    headerMarginMm ?? labProfile?.printSettings?.headerMarginMm ?? 48;
  const effectiveFooterMargin =
    footerMarginMm ?? labProfile?.printSettings?.footerMarginMm ?? 24;

  const isPreprintedHeader =
    activeStationery === 'PREPRINTED_HEADER' ||
    activeStationery === 'PREPRINTED_HEADER_AND_FOOTER';

  const isPreprintedFooter =
    activeStationery === 'PREPRINTED_HEADER_AND_FOOTER';

  const patient = report.patient;
  const patientSex = patient?.sex;

  const accentColor = labProfile?.accentColor || '#0f766e';
  const labName = labProfile?.name || 'Deswal Diagnostic Laboratory';
  const labAddress = labProfile?.address || 'Barara, Haryana';
  const labPhones = labProfile?.phoneNumbers?.join(' / ') || '';
  const nablId = labProfile?.nablId?.trim() || '';
  const officialEmail = labProfile?.officialEmail?.trim() || '';
  const initialLetter = labName.trim().charAt(0).toUpperCase() || 'D';

  // Primary doctor / Signatory
  const primarySignatory =
    staffMembers.find(
      (s) => s.role === 'OWNER' || s.role === 'PATHOLOGIST' || s.role === 'DIRECTOR',
    ) || staffMembers[0];
  const technician = staffMembers.find(
    (s) => s.role === 'TECHNICIAN' || s.role === 'SR_TECHNICIAN',
  );

  // Map values by parameterId
  const valuesMap = React.useMemo(() => {
    const map: Record<string, { value: string; isOutOfRange?: boolean; remarks?: string | null }> = {};
    report.values?.forEach((v) => {
      map[v.parameterId] = {
        value: v.value,
        isOutOfRange: v.isOutOfRange,
        remarks: v.remarks,
      };
    });
    return map;
  }, [report.values]);

  // Timestamps
  const collectedTime = report.sampleCollectedAt
    ? formatDateTime(report.sampleCollectedAt)
    : formatDateTime(report.createdAt || new Date().toISOString());

  const receivedTime = report.createdAt
    ? formatDateTime(report.createdAt)
    : formatDateTime(new Date().toISOString());

  const reportedTime = report.finalizedAt
    ? formatDateTime(report.finalizedAt)
    : formatDateTime(report.updatedAt || new Date().toISOString());

  const shareToken = report.shareToken || 'demo-share-token-1048';

  return (
    <div
      id="printSheet"
      className="w-full max-w-[820px] bg-white text-zinc-900 shadow-xl rounded-none p-6 sm:p-10 flex flex-col gap-5 border border-zinc-200 select-none print:shadow-none print:border-none print:p-0 print:m-0"
    >
      {/* 1. Header / Letterhead or Pre-Printed Stationery Spacer */}
      {isPreprintedHeader ? (
        <>
          {/* Physical Print Spacer: Keeps top margin blank for pre-printed letterhead pad */}
          <div
            className="hidden print:block w-full"
            style={{ height: `${effectiveHeaderMargin}mm` }}
            aria-hidden="true"
          />

          {/* Screen Presentation */}
          {simulateBlankStationery ? (
            <div
              className="w-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 rounded-lg flex flex-col items-center justify-center text-zinc-500 p-4 gap-1 select-none print:hidden"
              style={{ minHeight: `${effectiveHeaderMargin}mm` }}
            >
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                <span>[ Pre-Printed Letterhead Space — {effectiveHeaderMargin}mm ]</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Paper pad logo area kept blank. Clinical results start immediately below.
              </p>
            </div>
          ) : (
            <div className="relative group print:hidden">
              <div
                className="flex items-start justify-between pb-4 border-b-2 gap-4 opacity-80"
                style={{ borderColor: accentColor }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    {initialLetter}
                  </div>
                  <div className="flex flex-col">
                    <h1
                      className="font-bold text-lg sm:text-xl uppercase tracking-tight"
                      style={{ color: accentColor }}
                    >
                      {labName}
                    </h1>
                    <p className="text-xs text-zinc-600">
                      {labAddress} {labPhones ? `| Tel: ${labPhones}` : ''}
                    </p>
                    {officialEmail ? (
                      <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
                        Email: {officialEmail} | {labProfile?.tagline || 'Clinical Pathology, Biochemistry & Molecular Diagnostics'}
                      </p>
                    ) : (
                      <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
                        {labProfile?.tagline || 'Clinical Pathology, Biochemistry & Molecular Diagnostics'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end text-right shrink-0">
                  {nablId ? (
                    <>
                      <div className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: accentColor }} />
                        <span className="font-mono text-[11px] font-bold text-zinc-900">{nablId}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mt-1">
                        ISO 15189:2022 Certified
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 text-zinc-600 font-mono text-[10px]">
                      Clinical Diagnostic Record
                    </div>
                  )}
                  <span className="font-mono text-[10px] text-zinc-500 mt-0.5">Dept: Clinical Pathology</span>
                </div>
              </div>

              {/* Visual Indicator of Print Blanking */}
              <div className="mt-1 flex items-center justify-between px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-mono">
                <span>Letterhead Stationery Active: Header hidden on print</span>
                <span className="font-bold">{effectiveHeaderMargin}mm blank margin applied</span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Full Digital Letterhead (Plain Paper) */
        <div
          className="flex items-start justify-between pb-4 border-b-2 gap-4"
          style={{ borderColor: accentColor }}
        >
          <div className="flex items-start gap-3">
            {/* Logo Crest */}
            <div
              className="w-10 h-10 rounded text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              {initialLetter}
            </div>
            <div className="flex flex-col">
              <h1
                className="font-bold text-lg sm:text-xl uppercase tracking-tight"
                style={{ color: accentColor }}
              >
                {labName}
              </h1>
              <p className="text-xs text-zinc-600">
                {labAddress} {labPhones ? `| Tel: ${labPhones}` : ''}
              </p>
              {officialEmail ? (
                <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
                  Email: {officialEmail} | {labProfile?.tagline || 'Clinical Pathology, Biochemistry & Molecular Diagnostics'}
                </p>
              ) : (
                <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
                  {labProfile?.tagline || 'Clinical Pathology, Biochemistry & Molecular Diagnostics'}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end text-right shrink-0">
            {nablId ? (
              <>
                <div className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span className="font-mono text-[11px] font-bold text-zinc-900">{nablId}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mt-1">
                  ISO 15189:2022 Certified
                </span>
              </>
            ) : (
              <div className="flex items-center gap-1 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 text-zinc-600 font-mono text-[10px]">
                Clinical Diagnostic Record
              </div>
            )}
            <span className="font-mono text-[10px] text-zinc-500 mt-0.5">Dept: Clinical Pathology</span>
          </div>
        </div>
      )}

      {/* 2. Patient Demographics & Timeline Block */}
      <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 text-xs">
        <div className="grid grid-cols-12 gap-y-2 gap-x-4">
          <div className="col-span-4 flex flex-col">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              Patient Name
            </span>
            <span className="font-bold text-zinc-900 text-sm">{patient?.name || 'Walk-in Patient'}</span>
          </div>

          <div className="col-span-2 flex flex-col">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              Age / Sex
            </span>
            <span className="font-mono font-medium text-zinc-900">
              {patient?.age ? `${patient.age} Yrs` : 'N/A'} / {patient?.sex || 'N/A'}
            </span>
          </div>

          <div className="col-span-3 flex flex-col">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              MRN / UHID
            </span>
            <span className="font-mono font-semibold text-zinc-900">
              {patient?.patientNumber || '—'}
            </span>
          </div>

          {/* Accession Barcode */}
          <div className="col-span-3 flex flex-col items-end">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              Accession Barcode
            </span>
            <div className="flex flex-col items-end mt-1">
              <ReportBarcode value={report.reportNumber} width={1.2} height={24} />
              <span className="font-mono text-[10px] tracking-wider text-zinc-600 font-bold mt-0.5">
                {report.reportNumber}
              </span>
            </div>
          </div>

          <div className="col-span-12 h-px bg-zinc-200 my-0.5" />

          <div className="col-span-4 flex flex-col">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              Referred By
            </span>
            <span className="font-medium text-zinc-900">
              {report.refByDoctor?.name || 'Self / Direct Walk-in'}
            </span>
          </div>

          <div className="col-span-4 flex flex-col">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              Specimen & Source
            </span>
            <span className="font-medium text-zinc-900">
              Spot Urine / Midstream Clean Catch
            </span>
          </div>

          <div className="col-span-4 flex flex-col items-end">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              Timeline Timestamps
            </span>
            <div className="font-mono text-[10px] text-zinc-600 text-right">
              <div>Collected: <span className="text-zinc-900 font-medium">{collectedTime}</span></div>
              <div>Received: <span className="text-zinc-900 font-medium">{receivedTime}</span></div>
              <div>Reported: <span className="text-zinc-900 font-medium">{reportedTime}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Test Panels & Investigation Tables */}
      {report.reportPanels?.map((rp, pIdx) => (
        <div key={rp.panelId || rp.panel?.id || `panel-${pIdx}`} className="flex flex-col">
          {/* Panel Header */}
          <div
            className="text-white px-3.5 py-1.5 flex justify-between items-center rounded-t shadow-xs"
            style={{ backgroundColor: accentColor }}
          >
            <span className="font-bold text-xs uppercase tracking-wide">
              {rp.panel?.category || 'CLINICAL PATHOLOGY'} — {rp.panel?.name}
            </span>
            <span className="font-mono text-[10px] opacity-85 uppercase">
              Method: Automated Analyzer & Microscopy
            </span>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 px-3.5 py-1 bg-zinc-100 font-mono text-[10px] font-bold text-zinc-700 uppercase border-x border-zinc-200">
            <div className="col-span-5">Test Parameter</div>
            <div className="col-span-3 text-right">Observed Value</div>
            <div className="col-span-2 text-center">Unit</div>
            <div className="col-span-2 text-right">Reference Range</div>
          </div>

          {/* Sections & Rows */}
          <div className="divide-y divide-zinc-100 bg-white border border-zinc-200 rounded-b">
            {rp.panel?.sections?.map((section) => (
              <div key={section.id}>
                <div
                  className="px-3.5 py-1 border-y border-zinc-100"
                  style={{ backgroundColor: `${accentColor}12` }}
                >
                  <span
                    className="font-mono text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: accentColor }}
                  >
                    {section.name}
                  </span>
                </div>

                {section.parameters?.map((param) => {
                  const entry = valuesMap[param.id];
                  const val = entry?.value ?? '';
                  const evaluation = evaluateNormalRange(param.normalRange, val, patientSex);
                  const isAbnormal = evaluation.isOutOfRange;

                  return (
                    <div
                      key={param.id}
                      className={`grid grid-cols-12 px-3.5 py-1.5 items-center text-xs transition-colors ${
                        isAbnormal ? 'bg-red-50/70 border-l-2 border-l-red-600' : 'hover:bg-zinc-50/50'
                      }`}
                    >
                      <div className={`col-span-5 ${isAbnormal ? 'font-semibold text-red-800' : 'text-zinc-900'}`}>
                        {param.name}
                      </div>

                      <div className="col-span-3 text-right font-mono">
                        <span className={`text-sm ${isAbnormal ? 'font-extrabold text-red-700' : 'font-semibold text-zinc-900'}`}>
                          {val || '–'}
                        </span>
                        {isAbnormal && (
                          <span className="ml-1.5 inline-block px-1 py-0.2 rounded bg-red-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                            {evaluation.badgeLabel}
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 font-mono text-[11px] text-center text-zinc-600">
                        {param.unit || '-'}
                      </div>

                      <div className="col-span-2 font-mono text-[11px] text-right text-zinc-600">
                        {evaluation.formattedRange}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 3b. Accredited Reference Laboratory Outsourced Investigations (NABL Clause 5.8) */}
      {outsourcedTests && outsourcedTests.length > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
            <span
              className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              <Truck className="w-3.5 h-3.5" />
              Outsourced Referral Investigations (NABL ISO 15189 Clause 5.8)
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Performed by Accredited Reference Lab
            </span>
          </div>

          <div className="divide-y divide-zinc-200">
            {outsourcedTests.map((out) => (
              <div key={out.id} className="py-2 flex flex-col gap-1 text-xs first:pt-0 last:pb-0">
                <div className="flex items-center justify-between font-semibold text-zinc-900">
                  <span>{out.testName}</span>
                  <span className="font-mono text-[11px] text-zinc-600 font-normal">
                    Reference Lab: {out.referenceLabName}
                  </span>
                </div>
                {out.resultSummary ? (
                  <div className="p-2 bg-white rounded border border-zinc-200 font-mono text-[11px] text-zinc-800 leading-relaxed">
                    {out.resultSummary}
                  </div>
                ) : (
                  <div className="text-[11px] text-zinc-500 italic">
                    Sample dispatched to reference lab. Awaiting final analytical findings.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Pathological Remarks (Only shown if remarks actually exist) */}
      {report.remarks && report.remarks.trim() ? (
        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-zinc-800 uppercase tracking-wide text-[11px] mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-600" />
            <span>Pathological Clinical Correlation & Remarks</span>
          </div>
          <p className="text-zinc-800 leading-relaxed text-xs">
            {report.remarks.trim()}
          </p>
        </div>
      ) : null}

      {/* 5. Authentication QR Code & Signatures Footer */}
      <div className="pt-4 border-t border-zinc-200 flex justify-between items-end">
        {/* Digital Report Authenticator QR */}
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white border border-zinc-300 rounded shadow-2xs shrink-0">
            <ReportQrCode
              value={
                typeof window !== 'undefined'
                  ? `${window.location.origin}/v/${shareToken}`
                  : `https://labos.in/v/${shareToken}`
              }
              size={64}
            />
          </div>

          <div className="flex flex-col text-[11px]">
            <span className="font-mono font-bold text-zinc-900 text-xs">Scan to Verify Original Report</span>
            <span className="text-zinc-500 text-[10px]">Digital Report Authentication</span>
            <span className="font-mono font-medium text-primary text-[10px]">/v/{shareToken.slice(0, 10)}...</span>
            <span className="font-mono text-[9px] text-zinc-400 mt-0.5">Ref: {report.reportNumber}</span>
          </div>
        </div>

        {/* Dynamic Signatures */}
        <div className="flex items-end gap-6 sm:gap-10 text-center">
          {/* Technician Signature (Only if configured) */}
          {technician && (
            <div className="flex flex-col items-center">
              <div className="h-8 flex items-center justify-center font-serif italic text-zinc-600 text-sm">
                {technician.fullName}
              </div>
              <div className="h-px w-28 bg-zinc-300 mb-1" />
              <span className="font-bold text-zinc-900 text-xs">{technician.fullName}</span>
              <span className="font-mono text-[10px] text-zinc-500">
                {technician.qualification || 'Lab Technologist'}
              </span>
            </div>
          )}

          {/* Primary Doctor / Signatory */}
          <div className="flex flex-col items-center">
            <div className="h-8 flex items-center justify-center font-serif italic font-semibold text-zinc-900 text-base">
              {primarySignatory?.fullName || 'Dr. Deswal'}
            </div>
            <div className="h-px w-36 bg-zinc-300 mb-1" />
            <span className="font-bold text-zinc-900 text-xs">{primarySignatory?.fullName || 'Dr. Deswal'}</span>
            <span className="text-zinc-600 text-[11px]">
              {primarySignatory?.qualification || 'MBBS, MD (Pathology)'}
            </span>
            {primarySignatory?.councilRegistration && (
              <span className="font-mono text-[10px] text-zinc-500">
                Regn. No: {primarySignatory.councilRegistration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 6. Legal & Quality Footnote or Pre-printed Footer Spacer */}
      {isPreprintedFooter ? (
        <>
          {/* Print Spacer to prevent doctor signatures colliding with pre-printed bottom letterhead */}
          <div
            className="hidden print:block w-full"
            style={{ height: `${effectiveFooterMargin}mm` }}
            aria-hidden="true"
          />
          {simulateBlankStationery && (
            <div
              className="w-full border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 rounded flex items-center justify-center text-zinc-500 font-mono text-[10px] py-1.5 select-none print:hidden"
              style={{ minHeight: `${effectiveFooterMargin}mm` }}
            >
              <span>[ Pre-Printed Footer Space — {effectiveFooterMargin}mm ]</span>
            </div>
          )}
        </>
      ) : (
        <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center justify-between text-zinc-500 font-mono text-[10px]">
          <span>Page 1 of 1 | End of Analytical Report</span>
          <span className="uppercase font-semibold">Computer Generated Clinical Diagnostic Examination Report</span>
          <span>Valid without physical signature</span>
        </div>
      )}
    </div>
  );
}
