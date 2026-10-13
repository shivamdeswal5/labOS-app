'use client';

import { useMemo, useState } from 'react';
import { Printer, Tag, X } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ReportBarcode } from '@/components/ui/barcode';

export interface ThermalStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportNumber: string;
  patientName: string;
  patientAge?: string;
  patientSex?: string;
  panelNames?: string[];
  tubeType?: 'EDTA' | 'SERUM' | 'FLUORIDE' | 'CITRATE' | 'HEPARIN';
}

export function ThermalStickerModal({
  isOpen,
  onClose,
  reportNumber,
  patientName,
  patientAge,
  patientSex,
  panelNames = [],
  tubeType = 'EDTA',
}: ThermalStickerModalProps) {
  const [selectedTube, setSelectedTube] = useState(tubeType);

  const tubeConfig = useMemo(() => {
    switch (selectedTube) {
      case 'EDTA':
        return { label: 'EDTA LAVENDER', colorClass: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'SERUM':
        return { label: 'PLAIN / GEL RED', colorClass: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'FLUORIDE':
        return { label: 'FLUORIDE GREY', colorClass: 'bg-zinc-200 text-zinc-900 border-zinc-400' };
      case 'CITRATE':
        return { label: 'CITRATE BLUE', colorClass: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'HEPARIN':
        return { label: 'HEPARIN GREEN', colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: 'VACUTAINER', colorClass: 'bg-slate-100 text-slate-900 border-slate-300' };
    }
  }, [selectedTube]);

  const testAcronyms = useMemo(() => {
    if (panelNames.length === 0) return 'CBC / ROUTINE';
    return panelNames
      .map((p) => {
        if (p.toLowerCase().includes('complete blood count')) return 'CBC';
        if (p.toLowerCase().includes('liver function')) return 'LFT';
        if (p.toLowerCase().includes('kidney function')) return 'KFT';
        if (p.toLowerCase().includes('lipid')) return 'LIPID';
        if (p.toLowerCase().includes('thyroid')) return 'TFT';
        if (p.toLowerCase().includes('glucose') || p.toLowerCase().includes('sugar')) return 'GLU';
        return p.slice(0, 5).toUpperCase();
      })
      .slice(0, 4)
      .join(' • ');
  }, [panelNames]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md" className="p-0 border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-muted/60 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">50×25mm Thermal Vacutainer Sticker</h3>
              <p className="text-[10px] text-muted-foreground font-mono">
                Calibrated for 2-Up rolls (TVS LP 46 Neo / TSC / Zebra)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Vacutainer Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Vacutainer Tube Selection
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['EDTA', 'SERUM', 'FLUORIDE', 'CITRATE', 'HEPARIN'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTube(t)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded border transition-all cursor-pointer ${
                    selectedTube === t
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-background hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Physical 50x25mm Label Representation */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/30 border border-border">
            <div
              id="thermal-sticker-preview"
              className="w-[260px] h-[130px] bg-white text-zinc-950 rounded border-2 border-zinc-400 p-2 shadow-md flex flex-col justify-between font-mono select-none"
            >
              {/* Row 1: Header & Tube */}
              <div className="flex items-center justify-between text-[9px] border-b border-dashed border-zinc-300 pb-0.5">
                <span className="font-extrabold tracking-tight">PATHIQ DIAGNOSTICS</span>
                <span className={`px-1 rounded text-[8px] font-black border ${tubeConfig.colorClass}`}>
                  {tubeConfig.label}
                </span>
              </div>

              {/* Row 2: Patient Demographics */}
              <div className="leading-tight">
                <div className="text-[11px] font-black truncate">
                  {patientName.toUpperCase()}
                  {patientAge || patientSex ? ` (${patientAge || ''} ${patientSex || ''})` : ''}
                </div>
                <div className="text-[9px] font-bold text-zinc-600 truncate">{testAcronyms}</div>
              </div>

              {/* Row 3: Native Code-128 Barcode */}
              <div className="flex flex-col items-center justify-center py-0.5">
                <ReportBarcode value={reportNumber} width={1.1} height={20} className="w-full" />
                <span className="text-[8px] font-bold tracking-widest text-zinc-800 -mt-0.5">
                  *{reportNumber}*
                </span>
              </div>

              {/* Row 4: Timestamp */}
              <div className="flex items-center justify-between text-[7.5px] text-zinc-500 border-t border-dashed border-zinc-200 pt-0.5">
                <span>{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="font-semibold text-zinc-700">50×25mm 2-UP</span>
              </div>
            </div>

            <span className="text-[10px] text-muted-foreground font-mono mt-2">
              Dimensions: 50mm width × 25mm height
            </span>
          </div>

          {/* Print Action */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 shadow-xs bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Barcode Sticker</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Media Print Isolated Thermal Sticker Area */}
      <div id="thermal-sticker-print-area" className="hidden">
        <div
          style={{
            width: '50mm',
            height: '25mm',
            padding: '1.2mm 2mm',
            boxSizing: 'border-box',
            fontFamily: 'monospace',
            backgroundColor: '#ffffff',
            color: '#000000',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7pt', lineHeight: 1 }}>
            <span style={{ fontWeight: 'bold' }}>PATHIQ LAB</span>
            <span style={{ fontWeight: 'bold', fontSize: '6pt' }}>{tubeConfig.label}</span>
          </div>

          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: '8pt', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {patientName.toUpperCase()} {patientAge || patientSex ? `(${patientAge || ''}${patientSex || ''})` : ''}
            </div>
            <div style={{ fontSize: '6.5pt', color: '#333333', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {testAcronyms}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5mm 0' }}>
            <ReportBarcode value={reportNumber} width={1.0} height={18} />
            <div style={{ fontSize: '6pt', fontWeight: 'bold', letterSpacing: '1px' }}>
              *{reportNumber}*
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '5.5pt', color: '#666666' }}>
            <span>{new Date().toLocaleDateString('en-GB')}</span>
            <span>50×25mm</span>
          </div>
        </div>
      </div>

      {/* Scoped CSS for Isolated Thermal Printing */}
      <style jsx global>{`
        @media print {
          @page {
            size: 50mm 25mm !important;
            margin: 0 !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-sticker-print-area,
          #thermal-sticker-print-area * {
            visibility: visible !important;
          }
          #thermal-sticker-print-area {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 50mm !important;
            height: 25mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            z-index: 99999 !important;
          }
        }
      `}</style>
    </>
  );
}
