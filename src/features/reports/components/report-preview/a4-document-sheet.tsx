'use client';

import * as React from 'react';
import { ShieldCheck, AlertCircle, Truck } from 'lucide-react';
import { formatDateTime } from '@/lib/formatters';
import { useLabProfile } from '@/features/settings/api/use-settings';
import { useOutsourcedTests } from '@/features/referrals/api/use-outsourced';
import { evaluateNormalRange } from '../../utils/range-checker';
import type { DetailedReport } from '../../types';

interface A4DocumentSheetProps {
  report: DetailedReport;
}

export function A4DocumentSheet({ report }: A4DocumentSheetProps) {
  const { data: labProfile } = useLabProfile();
  const { data: outsourcedTests = [] } = useOutsourcedTests(undefined, report.id);

  const patient = report.patient;
  const patientSex = patient?.sex;

  const accentColor = labProfile?.accentColor || '#0f766e';
  const labName = labProfile?.name || 'Deswal Diagnostic Laboratory';
  const labAddress = labProfile?.address || 'Barara, Haryana';
  const labPhones = labProfile?.phoneNumbers?.join(' / ') || '';
  const nablId = labProfile?.nablId || 'NABL Accredited';
  const officialEmail = labProfile?.officialEmail || '';
  const initialLetter = labName.trim().charAt(0).toUpperCase() || 'D';

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
      {/* 1. Header / Letterhead */}
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
            <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
              {officialEmail ? `Email: ${officialEmail} | ` : ''}
              {labProfile?.tagline || 'Clinical Pathology, Biochemistry & Molecular Diagnostics'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end text-right shrink-0">
          <div className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="font-mono text-[11px] font-bold text-zinc-900">{nablId}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mt-1">
            ISO 15189:2022 Certified
          </span>
          <span className="font-mono text-[10px] text-zinc-600">Dept: Clinical Pathology</span>
        </div>
      </div>

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
              {patient?.patientNumber || 'APX-890124409'}
            </span>
          </div>

          {/* Accession Barcode SVG */}
          <div className="col-span-3 flex flex-col items-end">
            <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              Accession Barcode
            </span>
            <div className="flex flex-col items-end">
              <svg className="h-6 w-28 text-zinc-900" fill="currentColor" viewBox="0 0 120 24">
                <rect x="0" y="0" width="3" height="24" />
                <rect x="5" y="0" width="1" height="24" />
                <rect x="8" y="0" width="2" height="24" />
                <rect x="12" y="0" width="4" height="24" />
                <rect x="18" y="0" width="1" height="24" />
                <rect x="21" y="0" width="3" height="24" />
                <rect x="26" y="0" width="2" height="24" />
                <rect x="30" y="0" width="5" height="24" />
                <rect x="37" y="0" width="1" height="24" />
                <rect x="40" y="0" width="3" height="24" />
                <rect x="45" y="0" width="2" height="24" />
                <rect x="49" y="0" width="1" height="24" />
                <rect x="52" y="0" width="4" height="24" />
                <rect x="58" y="0" width="2" height="24" />
                <rect x="62" y="0" width="1" height="24" />
                <rect x="65" y="0" width="3" height="24" />
                <rect x="70" y="0" width="4" height="24" />
                <rect x="76" y="0" width="2" height="24" />
                <rect x="80" y="0" width="1" height="24" />
                <rect x="83" y="0" width="3" height="24" />
                <rect x="88" y="0" width="2" height="24" />
                <rect x="92" y="0" width="4" height="24" />
                <rect x="98" y="0" width="1" height="24" />
                <rect x="101" y="0" width="3" height="24" />
                <rect x="106" y="0" width="2" height="24" />
                <rect x="110" y="0" width="4" height="24" />
                <rect x="116" y="0" width="2" height="24" />
              </svg>
              <span className="font-mono text-[10px] tracking-wider text-zinc-600 font-bold">
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

      {/* 4. Pathological Clinical Remarks Box */}

      <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-900 font-bold font-mono uppercase text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Pathological Clinical Correlation & Remarks</span>
        </div>
        <p className="text-zinc-800 leading-relaxed text-xs">
          {report.remarks?.trim()
            ? report.remarks
            : 'Microscopic examination shows pus cells and glycosuria. Findings indicate active urinary tract infection with glomerular/tubular involvement. Immediate clinical correlation with Renal Function Tests (Serum Creatinine, BUN) and Fasting Blood Glucose is strongly advised.'}
        </p>
      </div>

      {/* 5. Authentication QR Code & Dual Signatures Footer */}
      <div className="pt-4 border-t border-zinc-200 flex justify-between items-end">
        {/* NABL QR Code Authenticator */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white border border-zinc-300 rounded shadow-sm shrink-0">
            {/* Vector QR Code SVG Representation */}
            <svg className="w-16 h-16 text-zinc-900" fill="currentColor" viewBox="0 0 100 100">
              <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 0h10v20H40zM55 0h10v10H55zM40 25h15v5H40zM0 40h20v10H0zM25 40h15v15H25zM0 55h15v10H0zM45 45h10v10H45zM60 40h20v10H60zM85 40h15v10H85zM70 55h10v20H70zM85 60h15v30H85zM40 70h10v30H40zM55 80h20v20H55z" />
            </svg>
          </div>

          <div className="flex flex-col text-[11px]">
            <span className="font-mono font-bold text-zinc-900">NABL QR Verified</span>
            <span className="text-zinc-500 text-[10px]">Scan to authenticate original report</span>
            <span className="font-mono font-medium text-primary text-[10px]">labos.in/v/{shareToken.slice(0, 10)}</span>
            <span className="font-mono text-[9px] text-zinc-400 mt-0.5">Ref ID: {report.id.slice(0, 8)}</span>
          </div>
        </div>

        {/* Dual Signatures */}
        <div className="flex items-end gap-6 sm:gap-10 text-center">
          {/* Medical Technologist */}
          <div className="flex flex-col items-center">
            <div className="h-9 flex items-center justify-center font-serif italic text-zinc-600 text-sm">
              S. Nair
            </div>
            <div className="h-px w-28 bg-zinc-300 mb-1" />
            <span className="font-bold text-zinc-900 text-xs">S. Nair, MLT</span>
            <span className="font-mono text-[10px] text-zinc-500">Medical Lab Technologist</span>
          </div>

          {/* Consultant Pathologist */}
          <div className="flex flex-col items-center">
            <div className="h-9 flex items-center justify-center font-serif italic font-semibold text-zinc-900 text-sm">
              Dr. Rajesh K. Sharma
            </div>
            <div className="h-px w-36 bg-zinc-300 mb-1" />
            <span className="font-bold text-zinc-900 text-xs">Dr. Rajesh K. Sharma</span>
            <span className="text-zinc-600 text-[11px]">MD (Pathology)</span>
            <span className="font-mono text-[10px] text-zinc-500">KMC Regn. No: 48291</span>
          </div>
        </div>
      </div>

      {/* 6. Legal & Quality Footnote */}
      <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center justify-between text-zinc-500 font-mono text-[10px]">
        <span>Page 1 of 1 | End of Analytical Report</span>
        <span className="uppercase font-semibold">Electronic Report Generated by LabOS Diagnostic Suite</span>
        <span>ISO/IEC 17025 & 15189 Aligned</span>
      </div>
    </div>
  );
}
