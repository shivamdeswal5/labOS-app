'use client';

import * as React from 'react';
import { FlaskConical, ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useTemplatesCatalog, useSeedTemplates } from '../../api/use-onboarding';
import { cn } from '@/lib/utils';
import type { PanelSeedEntry, TestCatalogStepData } from '../../types';

const DEFAULT_PANELS: PanelSeedEntry[] = [
  { code: 'HEM-01', name: 'Complete Blood Count (CBC) with ESR', department: 'Hematology', defaultPrice: 350, tatMinutes: 45, selected: true, price: 350 },
  { code: 'HEM-02', name: 'Erythrocyte Sedimentation Rate (ESR)', department: 'Hematology', defaultPrice: 80, tatMinutes: 60, selected: false, price: 80 },
  { code: 'HEM-03', name: 'Blood Grouping & Rh Factor', department: 'Hematology', defaultPrice: 100, tatMinutes: 30, selected: false, price: 100 },
  { code: 'HEM-04', name: 'Prothrombin Time & INR (PT / INR)', department: 'Hematology', defaultPrice: 300, tatMinutes: 60, selected: false, price: 300 },
  { code: 'BIO-01', name: 'Liver Function Test (LFT)', department: 'Biochemistry', defaultPrice: 650, tatMinutes: 60, selected: true, price: 650 },
  { code: 'BIO-02', name: 'Kidney Function Test (KFT / RFT with Electrolytes)', department: 'Biochemistry', defaultPrice: 650, tatMinutes: 60, selected: true, price: 650 },
  { code: 'BIO-03', name: 'Comprehensive Lipid Profile', department: 'Biochemistry', defaultPrice: 550, tatMinutes: 60, selected: true, price: 550 },
  { code: 'BIO-04', name: 'Blood Glucose (Fasting & Post-Prandial)', department: 'Biochemistry', defaultPrice: 120, tatMinutes: 30, selected: true, price: 120 },
  { code: 'BIO-05', name: 'Glycated Hemoglobin (HbA1c)', department: 'Biochemistry', defaultPrice: 450, tatMinutes: 45, selected: true, price: 450 },
  { code: 'BIO-06', name: 'Serum Calcium & Phosphorus', department: 'Biochemistry', defaultPrice: 250, tatMinutes: 45, selected: false, price: 250 },
  { code: 'BIO-07', name: 'Serum Amylase & Lipase', department: 'Biochemistry', defaultPrice: 700, tatMinutes: 60, selected: false, price: 700 },
  { code: 'CPATH-01', name: 'Urine Routine & Microscopic Examination', department: 'Clinical Pathology', defaultPrice: 150, tatMinutes: 30, selected: true, price: 150 },
  { code: 'CPATH-02', name: 'Stool Routine & Occult Blood', department: 'Clinical Pathology', defaultPrice: 150, tatMinutes: 45, selected: false, price: 150 },
  { code: 'CPATH-03', name: 'Semen Analysis & Morphology', department: 'Clinical Pathology', defaultPrice: 400, tatMinutes: 120, selected: false, price: 400 },
  { code: 'SER-01', name: 'Widal Slide Agglutination (Enteric Fever)', department: 'Serology', defaultPrice: 180, tatMinutes: 45, selected: false, price: 180 },
  { code: 'SER-02', name: 'Dengue Duo Rapid (NS1 Antigen + IgM/IgG)', department: 'Serology', defaultPrice: 600, tatMinutes: 45, selected: false, price: 600 },
  { code: 'SER-03', name: 'Malaria Antigen Rapid Card (Pv / Pf)', department: 'Serology', defaultPrice: 250, tatMinutes: 30, selected: false, price: 250 },
  { code: 'SER-04', name: 'C-Reactive Protein (CRP Quantitative)', department: 'Serology', defaultPrice: 350, tatMinutes: 45, selected: false, price: 350 },
  { code: 'SER-05', name: 'Rheumatoid Factor (RA / RF Quantitative)', department: 'Serology', defaultPrice: 350, tatMinutes: 45, selected: false, price: 350 },
  { code: 'SER-06', name: 'Viral Markers Screening (HIV, HBsAg, HCV)', department: 'Serology', defaultPrice: 650, tatMinutes: 60, selected: false, price: 650 },
  { code: 'ENDO-01', name: 'Thyroid Profile Total (T3, T4, TSH)', department: 'Endocrinology', defaultPrice: 450, tatMinutes: 90, selected: true, price: 450 },
  { code: 'ENDO-02', name: '25-OH Vitamin D Total', department: 'Endocrinology', defaultPrice: 1200, tatMinutes: 1440, selected: false, price: 1200 },
  { code: 'ENDO-03', name: 'Vitamin B12 (Cyanocobalamin)', department: 'Endocrinology', defaultPrice: 900, tatMinutes: 1440, selected: false, price: 900 },
];

const DEPARTMENTS = ['All', 'Hematology', 'Biochemistry', 'Clinical Pathology', 'Serology', 'Endocrinology'];

interface StepTestCatalogProps {
  initialData: TestCatalogStepData;
  onNext: (data: TestCatalogStepData) => void;
  onBack: () => void;
}

export function StepTestCatalog({ initialData, onNext, onBack }: StepTestCatalogProps) {
  const { data: dbTemplates } = useTemplatesCatalog();
  const seedTemplates = useSeedTemplates();

  // Track user customizations (selection toggle and custom price inputs)
  const [userSelections, setUserSelections] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const base = initialData.panels.length > 0 ? initialData.panels : DEFAULT_PANELS;
    base.forEach((p) => {
      initial[p.code] = p.selected;
    });
    return initial;
  });

  const [customPrices, setCustomPrices] = React.useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const base = initialData.panels.length > 0 ? initialData.panels : DEFAULT_PANELS;
    base.forEach((p) => {
      initial[p.code] = p.price;
    });
    return initial;
  });

  // Derived panels combining DB templates + defaults + user customizations
  const panels = React.useMemo(() => {
    const base = initialData.panels.length > 0 ? initialData.panels : DEFAULT_PANELS;
    return base.map((p) => {
      const matched = dbTemplates?.find(
        (t) =>
          t.name.toLowerCase() === p.name.toLowerCase() ||
          t.name.includes(p.name) ||
          p.name.includes(t.name)
      );
      return {
        ...p,
        id: matched?.id,
        department: matched?.category || p.department,
        selected: userSelections[p.code] ?? p.selected,
        price: customPrices[p.code] ?? p.price,
      };
    });
  }, [dbTemplates, initialData.panels, userSelections, customPrices]);

  const [activeFilter, setActiveFilter] = React.useState('All');
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [seedError, setSeedError] = React.useState<string | null>(null);

  const filteredPanels = activeFilter === 'All'
    ? panels
    : panels.filter((p) => p.department === activeFilter);

  const selectedCount = panels.filter((p) => p.selected).length;
  const totalRevenue = panels
    .filter((p) => p.selected)
    .reduce((sum, p) => sum + p.price, 0);

  const togglePanel = (code: string) => {
    setUserSelections((prev) => ({
      ...prev,
      [code]: prev[code] !== undefined ? !prev[code] : false,
    }));
  };

  const updatePrice = (code: string, price: string) => {
    const num = parseFloat(price);
    if (isNaN(num) || num < 0) return;
    setCustomPrices((prev) => ({
      ...prev,
      [code]: num,
    }));
  };

  const handleSubmit = async () => {
    const selected = panels.filter((p) => p.selected);
    if (selected.length === 0) {
      setSeedError('Please select at least one panel to seed your catalog.');
      return;
    }

    setIsSeeding(true);
    setSeedError(null);

    try {
      // Extract valid template UUIDs for atomic DB seeding
      const templateIds = selected
        .map((p) => p.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);

      if (templateIds.length > 0) {
        await seedTemplates.mutateAsync(templateIds);
      }
      onNext({ panels });
    } catch (err) {
      // If offline or dev mode, still allow graceful completion
      console.warn('Catalog seeding notice:', err);
      onNext({ panels });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div>
      {/* Step header */}
      <div className="px-8 py-6 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FlaskConical className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Test Panel Catalog
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select and price the panels your lab offers. You can add more later from the Panels section.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-5 space-y-4">
        {seedError && (
          <div
            role="alert"
            className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
          >
            {seedError}
          </div>
        )}

        {/* Summary stats */}
        <div className="flex items-center gap-6 p-3.5 rounded-lg bg-muted/50 border border-border text-sm">
          <div>
            <span className="text-muted-foreground">Selected: </span>
            <span className="font-semibold text-foreground tabular-nums">{selectedCount}</span>
            <span className="text-muted-foreground"> panels</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div>
            <span className="text-muted-foreground">Combined fee: </span>
            <span className="font-semibold text-emerald-600 tabular-nums">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalRevenue)}
            </span>
          </div>
        </div>

        {/* Department filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setActiveFilter(dept)}
              className={cn(
                'px-3 h-7 rounded-full text-xs font-medium border transition-colors',
                activeFilter === dept
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-primary',
              )}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Panel list */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredPanels.map((panel) => (
            <div
              key={panel.code}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors',
                panel.selected
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-background border-border hover:border-muted-foreground/30',
              )}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => togglePanel(panel.code)}
                className={cn(
                  'w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-colors',
                  panel.selected
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border hover:border-primary',
                )}
                aria-label={`${panel.selected ? 'Deselect' : 'Select'} ${panel.name}`}
              >
                {panel.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              {/* Panel info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {panel.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {panel.code}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {panel.department}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    · TAT {panel.tatMinutes}m
                  </span>
                </div>
              </div>

              {/* Price input */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm text-muted-foreground">₹</span>
                <input
                  type="number"
                  min={0}
                  value={panel.price}
                  onChange={(e) => updatePrice(panel.code, e.target.value)}
                  inputMode="numeric"
                  className="w-20 h-8 px-2 text-right text-sm font-medium tabular-nums rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  aria-label={`Price for ${panel.name}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="px-8 py-5 border-t border-border bg-muted/20 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSeeding}
          className="flex items-center gap-2 px-5 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-60"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          id="ob-step3-next"
          type="button"
          onClick={handleSubmit}
          disabled={isSeeding || selectedCount === 0}
          className="flex items-center gap-2 px-6 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSeeding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Seeding {selectedCount} panels…
            </>
          ) : (
            <>
              Seed Catalog ({selectedCount}) <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
