'use client';

import * as React from 'react';
import JsBarcode from 'jsbarcode';

interface ReportBarcodeProps {
  value: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ReportBarcode({
  value,
  width = 1.3,
  height = 26,
  className = '',
}: ReportBarcodeProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        width,
        height,
        displayValue: false,
        margin: 0,
        lineColor: '#18181b', // zinc-900
      });
    } catch {
      // If code128 generation fails for unusual characters, fail silently
    }
  }, [value, width, height]);

  return <svg ref={svgRef} className={`text-zinc-900 shrink-0 ${className}`} />;
}
