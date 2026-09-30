'use client';

import * as React from 'react';
import QRCode from 'qrcode';

interface ReportQrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function ReportQrCode({ value, size = 64, className = '' }: ReportQrCodeProps) {
  const [svgContent, setSvgContent] = React.useState<string>('');

  React.useEffect(() => {
    if (!value) return;

    QRCode.toString(
      value,
      {
        type: 'svg',
        margin: 1,
        width: size,
        color: {
          dark: '#18181b', // zinc-900
          light: '#ffffff',
        },
      },
      (err, svg) => {
        if (!err && svg) {
          setSvgContent(svg);
        }
      },
    );
  }, [value, size]);

  if (!svgContent) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-zinc-100 rounded animate-pulse ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
