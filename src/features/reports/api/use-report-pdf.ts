'use client';

import { apiClient } from '@/lib/api-client';

/**
 * Trigger native browser download of the 256-bit encrypted PDF report.
 * Supports both internal authenticated route (/reports/:id/pdf)
 * and public patient share token route (/reports/share/:token/pdf).
 */
export async function downloadReportPdf(
  identifier: string,
  reportNumber: string,
  isShareToken = false,
): Promise<void> {
  const endpoint = isShareToken
    ? `/reports/share/${identifier}/pdf`
    : `/reports/${identifier}/pdf`;

  try {
    const response = await apiClient.get(endpoint, {
      responseType: 'blob',
    });

    // Create a temporary Blob URL and trigger download
    const blob = new Blob([response as unknown as BlobPart], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report-${reportNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download report PDF:', err);
    throw err;
  }
}
