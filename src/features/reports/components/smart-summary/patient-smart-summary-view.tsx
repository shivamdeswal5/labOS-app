'use client';

import { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Languages,
  Loader2,
  Share2,
  AlertTriangle,
  HeartHandshake,
  Stethoscope,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePatientSmartSummary } from '../../api/use-ai-assistant';
import type { DetailedReport } from '../../types';

interface PatientSmartSummaryViewProps {
  token: string;
  report: DetailedReport;
}

export function PatientSmartSummaryView({ token, report }: PatientSmartSummaryViewProps) {
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const { data: summary, isLoading, isError, refetch } = usePatientSmartSummary(token);

  const isHindi = lang === 'HI';
  const doctorName = report.refByDoctor?.name || 'Your Doctor';

  const handleShareWhatsApp = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://labos.in';
    const reportUrl = `${origin}/v/${token}`;
    const message = encodeURIComponent(
      `Hello ${doctorName},\n\nHere is my diagnostic examination report (#${report.reportNumber}) from ${report.patient?.name || 'Patient'}:\n${reportUrl}\n\nPlease review at your convenience.`,
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 my-4">
        <div className="relative">
          <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin absolute inset-0 opacity-40" />
        </div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Generating smart bilingual report breakdown...
        </p>
        <p className="text-xs text-zinc-400 font-mono">
          Translating clinical terms into plain Hindi & English
        </p>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="w-full max-w-3xl p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center space-y-4 my-4">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <div>
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Smart Summary Temporarily Unavailable
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Please refer to the Official Diagnostic Report tab for verified clinical measurements.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-5 my-2">
      {/* Top Banner Card with Language Switcher */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-blue-950/20 p-5 rounded-2xl border border-purple-200/60 dark:border-purple-800/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {isHindi ? 'स्मार्ट स्वास्थ्य सारांश' : 'Smart Health Summary'}
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-200/70 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 font-semibold tracking-wider">
                Patient Guide
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              {isHindi ? summary.overviewTextHi : summary.overviewTextEn}
            </p>
          </div>
        </div>

        {/* Bilingual Switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-purple-200 dark:border-purple-800/60 shadow-2xs self-start sm:self-center shrink-0">
          <Languages className="w-3.5 h-3.5 text-zinc-400 ml-1.5 mr-0.5" />
          <button
            type="button"
            onClick={() => setLang('EN')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              !isHindi
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('HI')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              isHindi
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* KPI Tally Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            {isHindi ? 'कुल परीक्षण' : 'Total Evaluated'}
          </span>
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
            {summary.testedCount} <span className="text-xs font-normal text-zinc-400">{isHindi ? 'पैरामीटर' : 'biomarkers'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            {isHindi ? 'संतुलित सीमा में' : 'Within Normal Range'}
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{summary.testedCount - summary.abnormalCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            {isHindi ? 'डॉक्टर समीक्षा आवश्यक' : 'Doctor Review'}
          </span>
          <div className={`text-xl font-bold mt-0.5 flex items-center gap-1.5 ${
            summary.abnormalCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'
          }`}>
            {summary.abnormalCount > 0 ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
            <span>{summary.abnormalCount}</span>
          </div>
        </div>
      </div>

      {/* Parameter Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
          {isHindi ? 'जांच विवरण एवं सरल व्याख्या' : 'Detailed Parameter Explanations'}
        </h3>

        <div className="space-y-2.5">
          {summary.highlightedParameters.map((param, idx) => {
            const isAbnormal = param.status === 'ATTENTION_NEEDED';
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isAbnormal
                    ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/40'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {param.parameterName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        isAbnormal
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                      }`}
                    >
                      {isAbnormal
                        ? (isHindi ? 'डॉक्टर समीक्षा' : 'Review Needed')
                        : (isHindi ? 'संतुलित' : 'Optimal')}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {param.value} <span className="text-[11px] font-normal text-zinc-500">{param.unit || ''}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs space-y-1.5">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <strong className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {isHindi ? 'क्या है: ' : 'What it is: '}
                    </strong>
                    {isHindi ? param.explanationHi : param.explanationEn}
                  </p>

                  {(param.lifestyleTipEn || param.lifestyleTipHi) && (
                    <div className="flex items-start gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                      <HeartHandshake className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span>
                        <strong className="font-medium">
                          {isHindi ? 'जीवनशैली व पोषण जानकारी: ' : 'General Wellness Context: '}
                        </strong>
                        {isHindi ? param.lifestyleTipHi : param.lifestyleTipEn}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Treating Doctor Action Callout */}
      <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isHindi ? 'चिकित्सीय परामर्श अनुशंसा' : 'Clinical Consultation Recommended'}
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {isHindi ? summary.consultationRecommendationHi : summary.consultationRecommendationEn}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleShareWhatsApp}
          className="w-full sm:w-auto shrink-0 gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{isHindi ? 'डॉक्टर को रिपोर्ट भेजें' : 'Share with Doctor'}</span>
        </Button>
      </div>

      {/* Statutory Legal Disclaimer */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800 flex items-start gap-2.5 text-[11px] text-zinc-500">
        <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isHindi
            ? 'वैधानिक अस्वीकरण: यह स्मार्ट सारांश केवल शैक्षिक जागरूकता के लिए कंप्यूटर द्वारा तैयार किया गया है। यह कोई चिकित्सा निदान या नुस्खा नहीं है। कृपया किसी भी स्वास्थ्य निर्णय या उपचार से पहले अपने पंजीकृत चिकित्सक से परामर्श करें।'
            : 'Statutory Medical Disclaimer: This Smart Health Summary is generated for educational awareness and patient comprehension. It does not constitute medical diagnosis, clinical advice, or a treatment plan. Always consult your registered medical practitioner for interpretation and health decisions.'}
        </p>
      </div>
    </div>
  );
}
