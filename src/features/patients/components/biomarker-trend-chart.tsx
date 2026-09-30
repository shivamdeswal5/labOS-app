'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import type { DetailedReport, PanelParameter } from '@/features/reports/types';

// ─── Priority list for auto-selecting the primary biomarker ──────────────────
const BIOMARKER_PRIORITY = [
  'Hemoglobin (Hb)',
  'HbA1c',
  'Packed Cell Volume (PCV)',
  'Mean Corpuscular Volume (MCV)',
  'Erythrocyte Sedimentation Rate (ESR)',
  'Fasting Blood Sugar (FBS)',
  'Serum Creatinine',
  'TSH',
  'Thyroid Stimulating Hormone',
  'Serum Bilirubin (Total)',
  'SGPT (ALT)',
  'SGOT (AST)',
];

interface BiomarkerDataPoint {
  date: string;
  isoDate: string;
  value: number;
  isOutOfRange: boolean;
  reportNumber: string;
}

interface BiomarkerSeries {
  paramName: string;
  unit: string;
  normalMin?: number;
  normalMax?: number;
  points: BiomarkerDataPoint[];
}

interface BiomarkerTrendChartProps {
  reports: DetailedReport[];
}

// ─── Extract all numeric biomarker series from reports ────────────────────────
function extractBiomarkerSeries(reports: DetailedReport[]): Map<string, BiomarkerSeries> {
  const seriesMap = new Map<string, BiomarkerSeries>();

  // Sort reports oldest → newest for correct temporal axis
  const sorted = [...reports].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  for (const report of sorted) {
    if (!report.values?.length) continue;

    // Build a parameterId → PanelParameter lookup from panel sections
    const paramLookup = new Map<string, PanelParameter>();
    for (const rp of report.reportPanels ?? []) {
      for (const section of rp.panel?.sections ?? []) {
        for (const p of section.parameters ?? []) {
          paramLookup.set(p.id, p);
        }
      }
    }

    for (const v of report.values) {
      const numericVal = parseFloat(v.value);
      if (isNaN(numericVal)) continue; // Skip text-only values

      // Resolve parameter metadata: from value.parameter (backend join) or lookup
      const param: PanelParameter | undefined = v.parameter ?? paramLookup.get(v.parameterId);
      const paramName = param?.name ?? v.parameterId;
      const unit = param?.unit ?? '';

      // Compute normal range bounds
      let normalMin: number | undefined;
      let normalMax: number | undefined;
      const nr = param?.normalRange;
      if (nr) {
        if (nr.type === 'numeric') {
          normalMin = nr.min;
          normalMax = nr.max;
        } else if (nr.type === 'gender_specific') {
          // Default to male range if no patient sex context
          normalMin = nr.male?.min ?? nr.female?.min;
          normalMax = nr.male?.max ?? nr.female?.max;
        }
      }

      if (!seriesMap.has(paramName)) {
        seriesMap.set(paramName, { paramName, unit, normalMin, normalMax, points: [] });
      }

      const series = seriesMap.get(paramName)!;
      // Propagate normal range even if first encounter didn't have it
      if (normalMin !== undefined) series.normalMin = normalMin;
      if (normalMax !== undefined) series.normalMax = normalMax;

      const date = new Date(report.createdAt);
      series.points.push({
        date: date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        isoDate: report.createdAt,
        value: numericVal,
        isOutOfRange: v.isOutOfRange ?? false,
        reportNumber: report.reportNumber,
      });
    }
  }

  return seriesMap;
}

// ─── Pick the primary biomarker to display ────────────────────────────────────
function selectPrimaryBiomarker(seriesMap: Map<string, BiomarkerSeries>): string | null {
  // 1. Try priority list
  for (const name of BIOMARKER_PRIORITY) {
    if (seriesMap.has(name)) return name;
  }
  // 2. Prefer the series with most cross-visit data points
  let best: string | null = null;
  let bestCount = 0;
  for (const [name, series] of seriesMap) {
    if (series.points.length > bestCount) {
      best = name;
      bestCount = series.points.length;
    }
  }
  return best;
}

// ─── Map a value to SVG Y coordinate ─────────────────────────────────────────
const SVG_Y_TOP = 12;
const SVG_Y_BOTTOM = 88;

function valueToY(val: number, min: number, max: number): number {
  if (max === min) return (SVG_Y_TOP + SVG_Y_BOTTOM) / 2;
  // Invert: higher value = lower Y (top of SVG)
  const ratio = (val - min) / (max - min);
  return SVG_Y_BOTTOM - ratio * (SVG_Y_BOTTOM - SVG_Y_TOP);
}

// ─── Compute X spread across SVG width (360px viewport, margin 30 each side) ─
const SVG_X_LEFT = 30;
const SVG_X_RIGHT = 330;

function computeXPositions(count: number): number[] {
  if (count === 1) return [(SVG_X_LEFT + SVG_X_RIGHT) / 2];
  return Array.from({ length: count }, (_, i) =>
    SVG_X_LEFT + (i / (count - 1)) * (SVG_X_RIGHT - SVG_X_LEFT),
  );
}

// ─── Compute trajectory ───────────────────────────────────────────────────────
function computeTrajectory(points: BiomarkerDataPoint[]): {
  label: string;
  pct: string;
  isImproving: boolean;
  isNeutral: boolean;
} {
  if (points.length < 2) {
    return { label: 'Baseline Visit', pct: '—', isImproving: true, isNeutral: true };
  }
  const first = points[0].value;
  const latest = points[points.length - 1].value;
  const deltaPct = ((latest - first) / Math.abs(first)) * 100;
  const absStr = `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`;

  const isIncreasing = latest > first;

  if (Math.abs(deltaPct) < 1) {
    return { label: 'Stable', pct: absStr, isImproving: true, isNeutral: true };
  }

  // Determine if the change is clinically positive
  const isImproving = isIncreasing; // For most hematology params, up is better
  const label = isImproving ? `Recovery (${absStr})` : `Worsening (${absStr})`;
  return { label, pct: absStr, isImproving, isNeutral: false };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BiomarkerTrendChart({ reports }: BiomarkerTrendChartProps) {
  const seriesMap = React.useMemo(() => extractBiomarkerSeries(reports), [reports]);
  const seriesNames = React.useMemo(() => Array.from(seriesMap.keys()), [seriesMap]);

  const defaultName = React.useMemo(
    () => selectPrimaryBiomarker(seriesMap) ?? seriesNames[0] ?? null,
    [seriesMap, seriesNames],
  );

  const [selectedName, setSelectedName] = React.useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeName = (selectedName && seriesNames.includes(selectedName)) ? selectedName : defaultName;
  const series = activeName ? seriesMap.get(activeName) ?? null : null;

  // ── Empty / insufficient data states ────────────────────────────────────────
  if (!reports.length || seriesNames.length === 0) {
    return (
      <div className="p-4 bg-muted/30 rounded-xl border border-border flex flex-col items-center justify-center gap-2 min-h-[120px]">
        <TrendingUp className="w-6 h-6 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground text-center">
          No diagnostic results on record yet. Results will appear here after the first finalized report.
        </p>
      </div>
    );
  }

  if (!series || series.points.length === 0) {
    return (
      <div className="p-4 bg-muted/30 rounded-xl border border-border flex flex-col items-center justify-center gap-2 min-h-[120px]">
        <TrendingUp className="w-6 h-6 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">No numeric parameters found in reports.</p>
      </div>
    );
  }

  // ── Compute chart geometry ─────────────────────────────────────────────────
  const values = series.points.map((p) => p.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  // Pad by 20% of range to give breathing room
  const rangePad = Math.max((dataMax - dataMin) * 0.3, dataMax * 0.08);
  const yMin = Math.max(0, dataMin - rangePad);
  const yMax = dataMax + rangePad;

  const xPositions = computeXPositions(series.points.length);
  const yPositions = series.points.map((p) => valueToY(p.value, yMin, yMax));

  // Reference line Y from normal range midpoint
  let refY: number | null = null;
  let refLabel = '';
  if (series.normalMin !== undefined && series.normalMax !== undefined) {
    const refMid = (series.normalMin + series.normalMax) / 2;
    refY = valueToY(refMid, yMin, yMax);
    refLabel = `Normal: ${series.normalMin}–${series.normalMax}${series.unit ? ` ${series.unit}` : ''}`;
  } else if (series.normalMax !== undefined) {
    refY = valueToY(series.normalMax, yMin, yMax);
    refLabel = `Upper Limit: ${series.normalMax}${series.unit ? ` ${series.unit}` : ''}`;
  }

  // Polyline & polygon strings
  const polylinePoints = series.points
    .map((_, i) => `${xPositions[i].toFixed(1)},${yPositions[i].toFixed(1)}`)
    .join(' ');

  const polygonPoints = series.points.length > 1
    ? `${polylinePoints} ${xPositions[xPositions.length - 1].toFixed(1)},${SVG_Y_BOTTOM} ${xPositions[0].toFixed(1)},${SVG_Y_BOTTOM}`
    : '';

  const trajectory = computeTrajectory(series.points);
  const latest = series.points[series.points.length - 1];
  const hasMultipleAnalytes = seriesNames.length > 1;

  return (
    <div className="p-4 bg-muted/30 rounded-xl border border-border flex flex-col gap-2.5">
      {/* Chart Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-xs text-foreground truncate">
            {activeName}{series.unit ? ` (${series.unit})` : ''} — Trend across {series.points.length} visit{series.points.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Trajectory Badge */}
          {trajectory.isNeutral ? (
            <span className="flex items-center gap-1 text-[11px] font-mono font-medium bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-2 py-0.5 rounded">
              <Minus className="w-3 h-3" />
              {trajectory.label}
            </span>
          ) : trajectory.isImproving ? (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded">
              <TrendingUp className="w-3 h-3" />
              {trajectory.label}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded">
              <TrendingDown className="w-3 h-3" />
              {trajectory.label}
            </span>
          )}
        </div>
      </div>

      {/* Analyte Selector Dropdown (only when multiple numeric parameters exist) */}
      {hasMultipleAnalytes && (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 bg-card hover:bg-muted/60 transition-colors w-full justify-between"
          >
            <span className="truncate">Analyte: {activeName}</span>
            <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-44 overflow-y-auto">
              {seriesNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setSelectedName(name);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-mono hover:bg-muted/60 transition-colors ${
                    name === activeName ? 'text-primary font-bold bg-primary/5' : 'text-foreground'
                  }`}
                >
                  {name}
                  {seriesMap.get(name)?.unit ? ` (${seriesMap.get(name)!.unit})` : ''}
                  {' — '}
                  {seriesMap.get(name)?.points.length} pt{(seriesMap.get(name)?.points.length ?? 0) !== 1 ? 's' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SVG Chart */}
      <div className="bg-card p-3 rounded-lg border border-border flex flex-col shadow-inner">
        {/* Reference line label */}
        {refLabel && (
          <div className="flex justify-between items-center text-[11px] text-muted-foreground pb-1">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="w-3 h-0.5 border-t border-dashed border-muted-foreground" />
              <span>{refLabel}</span>
            </div>
            <span
              className={`font-mono font-bold ${
                latest.isOutOfRange ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              Current: {latest.value}{series.unit ? ` ${series.unit}` : ''}
            </span>
          </div>
        )}

        <div className="h-28 w-full pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 360 100">
            {/* Reference line */}
            {refY !== null && (
              <line
                x1={SVG_X_LEFT}
                x2={SVG_X_RIGHT}
                y1={refY}
                y2={refY}
                stroke="currentColor"
                className="text-muted-foreground/40"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
            )}

            {/* Shaded area under curve (only for multi-point) */}
            {polygonPoints && (
              <polygon
                points={polygonPoints}
                className="text-primary/10 fill-current"
              />
            )}

            {/* Trend line */}
            {series.points.length > 1 && (
              <polyline
                fill="none"
                points={polylinePoints}
                stroke="currentColor"
                className="text-foreground"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data nodes */}
            {series.points.map((pt, i) => {
              const cx = xPositions[i];
              const cy = yPositions[i];
              const isLatest = i === series.points.length - 1;
              const isHigh = pt.isOutOfRange;
              return (
                <g key={`${pt.isoDate}-${i}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isLatest ? 5.5 : 4}
                    className={
                      isLatest && isHigh
                        ? 'fill-red-500 stroke-background dark:fill-red-400'
                        : isLatest
                          ? 'fill-primary stroke-background'
                          : 'fill-background stroke-foreground'
                    }
                    strokeWidth="2"
                  />
                  <text
                    x={cx}
                    y={cy - 9}
                    textAnchor="middle"
                    className={`font-mono text-[10px] font-bold ${
                      isLatest && isHigh
                        ? 'fill-red-600 dark:fill-red-400'
                        : isLatest
                          ? 'fill-primary'
                          : 'fill-foreground'
                    }`}
                  >
                    {pt.value}{series.unit ? ` ${series.unit}` : ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dates axis */}
        <div className="flex justify-between items-center pt-2 border-t border-border font-mono text-[10px] text-muted-foreground">
          {series.points.map((pt, i) => {
            const isLatest = i === series.points.length - 1;
            return (
              <span
                key={`label-${pt.isoDate}-${i}`}
                className={`${isLatest ? 'text-foreground font-semibold' : ''} ${
                  series.points.length > 3 ? 'text-[9px]' : ''
                }`}
              >
                {pt.date}
              </span>
            );
          })}
        </div>
      </div>

      {/* Report accession badges */}
      <div className="flex flex-wrap gap-1.5">
        {series.points.map((pt, i) => {
          const isLatest = i === series.points.length - 1;
          return (
            <span
              key={`badge-${pt.reportNumber}-${i}`}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isLatest
                  ? 'bg-primary/10 text-primary border-primary/30 font-bold'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {pt.reportNumber} — {pt.value}{series.unit ? ` ${series.unit}` : ''}
              {isLatest ? ' ← Latest' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
}
