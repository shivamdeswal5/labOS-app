'use client';

import * as React from 'react';
import { FlaskConical, Barcode, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CollectionRequest, TubeType, CollectionSample } from '../../types';

interface SpecimenVacutainerRackProps {
  collection: CollectionRequest;
  localSamples: CollectionSample[];
  onAddSampleTube: (tubeType: TubeType, barcode: string) => void;
}

const TUBE_STYLES: Record<TubeType, { bg: string; text: string; border: string; label: string }> = {
  EDTA: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700', label: 'Lavender / EDTA' },
  SERUM: { bg: 'bg-amber-400', text: 'text-amber-950', border: 'border-amber-500', label: 'Gold / SST Gel' },
  FLUORIDE: { bg: 'bg-zinc-400', text: 'text-zinc-950', border: 'border-zinc-500', label: 'Grey / Fluoride' },
  HEPARIN: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700', label: 'Green / Heparin' },
  CITRATE: { bg: 'bg-sky-400', text: 'text-sky-950', border: 'border-sky-500', label: 'Light Blue / Citrate' },
  URINE: { bg: 'bg-yellow-500', text: 'text-yellow-950', border: 'border-yellow-600', label: 'Sterile Cup' },
  OTHER: { bg: 'bg-zinc-700', text: 'text-white', border: 'border-zinc-800', label: 'Other Tube' },
};

export function SpecimenVacutainerRack({
  collection,
  localSamples,
  onAddSampleTube,
}: SpecimenVacutainerRackProps) {
  const [newTubeType, setNewTubeType] = React.useState<TubeType>('EDTA');
  const [newBarcode, setNewBarcode] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarcode.trim()) return;
    onAddSampleTube(newTubeType, newBarcode.trim().toUpperCase());
    setNewBarcode('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-primary" />
          <span>Specimen Vacutainers &amp; Barcodes ({localSamples.length})</span>
        </h3>
      </div>

      {/* Test Panels Ordered */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {collection.testNames.map((test, idx) => (
          <span
            key={idx}
            className="px-2 py-1 rounded bg-secondary text-foreground text-xs font-medium border border-border"
          >
            {test}
          </span>
        ))}
      </div>

      {/* Scanned Sample Tubes List */}
      <div className="space-y-2">
        {localSamples.length === 0 ? (
          <div className="text-xs text-muted-foreground p-3 rounded-md bg-muted/40 border border-border text-center">
            No vacutainer barcodes registered yet. Phlebotomist will scan tubes upon draw.
          </div>
        ) : (
          localSamples.map((sample) => {
            const style = TUBE_STYLES[sample.tubeType] || {
              bg: 'bg-zinc-700',
              text: 'text-white',
              border: 'border-zinc-800',
              label: 'Other Tube',
            };
            return (
              <div
                key={sample.id}
                className="flex items-center justify-between p-2.5 rounded-md border border-border bg-card text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3.5 h-7 rounded-sm ${style.bg} border ${style.border} shrink-0`}
                    title={style.label}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{sample.barcode}</span>
                      <span className="text-[10px] text-muted-foreground">({sample.tubeType})</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{sample.notes}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                  <Barcode className="w-3.5 h-3.5" />
                  <span>Scanned</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Sample Tube Manually */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <select
          value={newTubeType}
          onChange={(e) => setNewTubeType(e.target.value as TubeType)}
          className="px-2.5 py-1.5 bg-background border border-border rounded-md text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
        >
          <option value="EDTA">EDTA (Purple)</option>
          <option value="SERUM">SST Gel (Yellow)</option>
          <option value="FLUORIDE">Fluoride (Grey)</option>
          <option value="HEPARIN">Heparin (Green)</option>
          <option value="CITRATE">Citrate (Blue)</option>
          <option value="URINE">Urine Container</option>
        </select>

        <input
          type="text"
          value={newBarcode}
          onChange={(e) => setNewBarcode(e.target.value)}
          placeholder="Scan or type tube barcode (e.g. BD-8829)..."
          className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-primary uppercase"
        />

        <Button type="submit" size="sm" variant="outline" className="h-8 text-xs font-medium">
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add Tube</span>
        </Button>
      </form>
    </div>
  );
}
