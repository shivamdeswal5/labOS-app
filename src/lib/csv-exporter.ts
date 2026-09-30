/**
 * Standardized RFC-4180 CSV Exporter Engine
 *
 * Designed for Indian healthcare, statutory accounting, and diagnostic audits:
 * - Prepends UTF-8 Byte Order Mark (\uFEFF) so Microsoft Excel and Tally Prime
 *   render Indian Rupee symbols (₹), patient names, and special characters cleanly.
 * - Handles quotes, commas, and multiline strings according to RFC-4180.
 * - Uses Blob and URL.createObjectURL to avoid browser data URI length limits.
 */

export interface CsvExportOptions {
  filename: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

/**
 * Escapes a single CSV field following RFC-4180 rules.
 */
function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }

  const str = String(value);

  // If cell contains commas, double-quotes, or newlines, wrap in quotes and escape existing quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return `"${str}"`;
}

/**
 * Exports data to a downloadable CSV file.
 */
export function exportToCsv({ filename, headers, rows }: CsvExportOptions): void {
  if (typeof window === 'undefined') return;

  const headerLine = headers.map(escapeCsvCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCsvCell).join(','));

  const csvContent = [headerLine, ...rowLines].join('\r\n');

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays UTF-8 properly
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup DOM and object URL
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
