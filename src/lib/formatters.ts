/**
 * LabOS — Global Diagnostic & Financial Formatting Engine
 *
 * Provides internationalization-ready formatters for currencies,
 * diagnostic timestamps, and clinical patient age calculations.
 */

export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface CurrencyFormatOptions {
  currency?: SupportedCurrency;
  locale?: string;
  hideDecimals?: boolean;
  compact?: boolean;
}

const DEFAULT_CURRENCY: SupportedCurrency = 'INR';
const DEFAULT_LOCALE = 'en-IN';
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

const CURRENCY_LOCALE_MAP: Record<SupportedCurrency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'en-IE',
  GBP: 'en-GB',
  AED: 'en-AE',
};

/**
 * Formats a monetary amount into a localized currency string.
 * Supports INR (₹), USD ($), EUR (€), GBP (£), and AED (AED).
 *
 * @example
 * formatCurrency(482450) // "₹4,82,450"
 * formatCurrency(482450, { currency: 'USD' }) // "$482,450"
 * formatCurrency(482450, { compact: true }) // "₹4.82L" (INR) or "$482.5K" (USD)
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options: CurrencyFormatOptions = {},
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === null || num === undefined || isNaN(num)) {
    return '₹0';
  }

  const currency = options.currency || DEFAULT_CURRENCY;
  const locale = options.locale || CURRENCY_LOCALE_MAP[currency] || DEFAULT_LOCALE;

  if (options.compact) {
    return formatCompactCurrency(num, currency, locale);
  }

  const hasDecimals = num % 1 !== 0;
  const minFractionDigits = options.hideDecimals ? 0 : hasDecimals ? 2 : 0;
  const maxFractionDigits = options.hideDecimals ? 0 : 2;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  }).format(num);
}

/**
 * Compact currency formatting for dashboard cards and micro-bar metrics.
 * Uses Indian numbering (Lakhs/Crores) for INR, and standard (K/M) for others.
 */
function formatCompactCurrency(
  amount: number,
  currency: SupportedCurrency,
  locale: string,
): string {
  if (currency === 'INR') {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 10000000) {
      return `${sign}₹${(abs / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹${(abs / 100000).toFixed(2).replace(/\.00$/, '')}L`;
    }
    if (abs >= 1000) {
      return `${sign}₹${(abs / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `${sign}₹${abs}`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Formats an ISO-8601 UTC date string into localized IST date and time.
 *
 * @example
 * formatDateTime("2026-09-10T08:30:00Z") // "10 Sep 2026, 02:00 PM"
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Formats an ISO date into date-only string.
 *
 * @example
 * formatDate("2026-09-10T08:30:00Z") // "10 Sep 2026"
 */
export function formatDate(
  date: string | Date | null | undefined,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Human-readable relative time string for live telemetry and activity feeds.
 *
 * @example
 * formatRelativeTime(Date.now() - 120000) // "2 mins ago"
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const now = Date.now();
  const diffSeconds = Math.floor((now - d.getTime()) / 1000);

  if (diffSeconds < 30) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(d);
}

/**
 * Formats a patient's date of birth or age into clinical diagnostic notation.
 * In pathology, pediatric ages under 2 years are presented in months or days.
 *
 * @example
 * formatPatientAge("1984-06-15") // "42 Y"
 * formatPatientAge("2025-11-01") // "10 M"
 * formatPatientAge("2026-08-25") // "16 D"
 */
export function formatPatientAge(dob: string | Date | null | undefined): string {
  if (!dob) return '—';
  const birth = typeof dob === 'string' ? new Date(dob) : dob;
  if (isNaN(birth.getTime())) return '—';

  const today = new Date();
  const diffTime = today.getTime() - birth.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 31) {
    return `${Math.max(1, diffDays)} D`;
  }

  const diffMonths =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  if (diffMonths < 24) {
    return `${diffMonths} M`;
  }

  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    years--;
  }

  return `${years} Y`;
}
