'use client';

import * as React from 'react';
import {
  GripVertical,
  Undo2,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  History,
  Printer,
  FilePlus2,
  ArrowLeft,
} from 'lucide-react';
import type { MasterPanel, MasterSection, MasterParameter, ParameterInputType } from '../types';

interface PanelConfigEditorProps {
  panel: MasterPanel;
  onSave: (updated: Partial<MasterPanel>) => void;
  onBack?: () => void;
  isSaving?: boolean;
}

export function PanelConfigEditor({ panel, onSave, onBack, isSaving = false }: PanelConfigEditorProps) {
  // Local draft state for reactive editing (reset cleanly on panel change via React key)
  const [draft, setDraft] = React.useState<MasterPanel>(panel);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});

  const handleRevert = () => {
    setDraft(panel);
  };

  const handleSave = () => {
    onSave(draft);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const handleParameterChange = (
    secId: string,
    paramId: string,
    field: keyof MasterParameter,
    val: unknown,
  ) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          parameters: sec.parameters.map((p) => {
            if (p.id !== paramId) return p;
            return { ...p, [field]: val };
          }),
        };
      }),
    }));
  };

  const handleDeleteParameter = (secId: string, paramId: string) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          parameters: sec.parameters.filter((p) => p.id !== paramId),
        };
      }),
    }));
  };

  const handleAddParameter = (secId: string) => {
    const newParam: MasterParameter = {
      id: `param-${Date.now()}`,
      sectionId: secId,
      code: `PAR-${Date.now().toString(36).toUpperCase().slice(-4)}`,
      name: 'New Investigation Parameter',
      unit: null,
      inputType: 'NUMBER',
      referenceText: '0 - 100',
      sortOrder: 99,
    };

    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          parameters: [...sec.parameters, newParam],
        };
      }),
    }));
  };

  const handleAddSection = () => {
    const newSection: MasterSection = {
      id: `sec-${Date.now()}`,
      panelId: draft.id,
      name: `Section ${draft.sections.length + 1}. Special Diagnostic Markers`,
      sortOrder: draft.sections.length + 1,
      parameters: [],
    };

    setDraft((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner Card - Sticky at top of editor scroll pane */}
      <div className="bg-card rounded-lg p-5 border border-border shadow-xs flex flex-col gap-4 sticky top-0 z-10 backdrop-blur-md bg-card/95">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="xl:hidden inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline mb-1 w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Panel Directory</span>
              </button>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded">
                {draft.code}
              </span>
              {draft.loincCode && (
                <span className="font-mono text-xs text-muted-foreground">
                  LOINC: {draft.loincCode}
                </span>
              )}
              {draft.snomedCode && (
                <span className="font-mono text-xs text-muted-foreground">
                  SNOMED: {draft.snomedCode}
                </span>
              )}
            </div>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="text-xl font-bold text-foreground bg-transparent hover:bg-muted/40 focus:bg-background px-2 py-1 -ml-2 rounded-md focus:outline-none focus:ring-1 focus:ring-ring transition-colors w-full tracking-tight"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in duration-150">
                <Check className="w-3.5 h-3.5" />
                <span>Panel Saved</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleRevert}
              className="h-9 px-3.5 bg-muted text-foreground hover:bg-muted/80 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 border border-border"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Revert</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Panel Config'}</span>
            </button>
          </div>
        </div>

        {/* 4-Card Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="bg-muted/30 border border-border rounded-md p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Department
            </span>
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="Hematology">Hematology</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Clinical Pathology">Clinical Pathology</option>
              <option value="Serology">Serology</option>
              <option value="Endocrinology">Endocrinology</option>
            </select>
          </div>

          <div className="bg-muted/30 border border-border rounded-md p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Specimen Type
            </span>
            <input
              type="text"
              value={draft.specimenType || ''}
              onChange={(e) => setDraft({ ...draft, specimenType: e.target.value })}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none border-b border-transparent focus:border-ring"
            />
          </div>

          <div className="bg-muted/30 border border-border rounded-md p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Standard Fee (₹)
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground font-mono">₹</span>
              <input
                type="number"
                value={draft.price || 0}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
                className="font-mono text-xs font-bold text-foreground bg-transparent focus:outline-none w-24"
              />
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-md p-3 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Report Generation TAT
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={draft.tatMinutes || 60}
                onChange={(e) => {
                  const mins = Number(e.target.value) || 0;
                  setDraft({
                    ...draft,
                    tatMinutes: mins,
                    tatText: `${(mins / 60).toFixed(1)} hrs`,
                  });
                }}
                className="font-mono text-xs font-bold text-foreground bg-transparent focus:outline-none w-14"
              />
              <span className="text-xs text-muted-foreground font-mono">Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Groups & Parameters Tables */}
      <div className="flex flex-col gap-4">
        {draft.sections.map((section) => {
          const isCollapsed = collapsedSections[section.id];

          return (
            <div
              key={section.id}
              className="bg-card rounded-lg border border-border shadow-sm overflow-hidden flex flex-col"
            >
              {/* Section Header */}
              <div
                onClick={() => toggleSectionCollapse(section.id)}
                className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between cursor-pointer hover:bg-muted/60 transition-colors select-none"
              >
                <div className="flex items-center gap-2.5">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm text-foreground">
                    {section.name}
                  </span>
                  <span className="font-mono text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded border border-border font-medium">
                    {section.parameters.length} parameters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Parameter Rows */}
              {!isCollapsed && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-muted/20 text-muted-foreground font-mono text-[10px] uppercase border-b border-border h-8">
                          <th className="w-10 px-3 text-center">#</th>
                          <th className="px-4 py-1.5">Parameter Name</th>
                          <th className="w-24 px-3 py-1.5">Unit</th>
                          <th className="w-36 px-3 py-1.5">Input Type</th>
                          <th className="px-4 py-1.5">Biological Reference Interval</th>
                          <th className="w-14 px-3 py-1.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-xs">
                        {section.parameters.map((param) => (
                          <tr key={param.id} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-3 py-2 text-center text-muted-foreground cursor-grab">
                              <GripVertical className="w-3.5 h-3.5 inline opacity-40 group-hover:opacity-100" />
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col">
                                <input
                                  type="text"
                                  value={param.name}
                                  onChange={(e) =>
                                    handleParameterChange(section.id, param.id, 'name', e.target.value)
                                  }
                                  className="font-medium text-foreground bg-transparent hover:bg-muted/40 focus:bg-background px-1.5 py-0.5 -ml-1.5 rounded focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                                />
                                <span className="font-mono text-[10px] text-muted-foreground px-0.5">
                                  {param.code}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={param.unit || ''}
                                onChange={(e) =>
                                  handleParameterChange(section.id, param.id, 'unit', e.target.value || null)
                                }
                                placeholder="-"
                                className="font-mono text-xs text-foreground bg-transparent hover:bg-muted/40 focus:bg-background px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-ring w-20"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={param.inputType}
                                onChange={(e) =>
                                  handleParameterChange(
                                    section.id,
                                    param.id,
                                    'inputType',
                                    e.target.value as ParameterInputType,
                                  )
                                }
                                className="bg-muted/60 text-foreground text-[11px] font-mono px-2 py-1 rounded border border-border focus:outline-none"
                              >
                                <option value="NUMBER">Numeric</option>
                                <option value="DROPDOWN">Text Options</option>
                                <option value="SCALE">Select / Scale</option>
                                <option value="QUALITATIVE">Qualitative</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={param.referenceText || ''}
                                onChange={(e) =>
                                  handleParameterChange(
                                    section.id,
                                    param.id,
                                    'referenceText',
                                    e.target.value,
                                  )
                                }
                                className="font-mono text-xs text-foreground bg-transparent hover:bg-muted/40 focus:bg-background px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-ring w-full"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteParameter(section.id, param.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                                title="Delete parameter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Parameter Button */}
                  <div className="p-3 bg-muted/10 border-t border-border">
                    <button
                      type="button"
                      onClick={() => handleAddParameter(section.id)}
                      className="w-full py-1.5 px-3 rounded-md bg-muted/40 hover:bg-muted text-foreground text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-dashed border-border"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Parameter to {section.name.split('.')[1] || section.name}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Action Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-card rounded-lg border border-border shadow-sm">
        <button
          type="button"
          onClick={handleAddSection}
          className="w-full sm:w-auto h-9 px-4 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Add New Section Group</span>
        </button>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1 font-mono text-xs">
            <History className="w-3.5 h-3.5" />
            <span>
              Last revised: {draft.lastRevisedAt || 'Today'} by {draft.revisedBy || 'Dr. Sharma'}
            </span>
          </div>
          <button
            type="button"
            className="text-foreground hover:text-primary text-xs font-semibold underline underline-offset-4 flex items-center gap-1"
          >
            <Printer className="w-3 h-3" />
            <span>Preview Print Format</span>
          </button>
        </div>
      </div>
    </div>
  );
}
