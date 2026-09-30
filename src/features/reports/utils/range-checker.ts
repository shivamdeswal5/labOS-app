/**
 * Normal Range Evaluator & Telemetry Delta Engine
 * 1:1 parity with backend NormalRange Value Object
 */

import type { StructuredNormalRange, SexEnum } from '../types';

export type RangeEvaluationStatus = 'NORMAL' | 'LOW' | 'HIGH' | 'ABNORMAL' | 'PANIC' | 'EMPTY';

export interface RangeEvaluationResult {
  isOutOfRange: boolean;
  status: RangeEvaluationStatus;
  formattedRange: string;
  badgeLabel: string;
}

/**
 * Format a human-readable display string for a normal range.
 */
export function formatNormalRange(
  normalRange: StructuredNormalRange | null | undefined,
  patientSex?: SexEnum,
): string {
  if (!normalRange) return 'Not Specified';

  if (normalRange.type === 'numeric') {
    const min = normalRange.min;
    const max = normalRange.max;
    if (min !== undefined && max !== undefined) return `${min} – ${max}`;
    if (min !== undefined) return `≥ ${min}`;
    if (max !== undefined) return `≤ ${max}`;
    return 'Numeric';
  }

  if (normalRange.type === 'gender_specific') {
    const range =
      patientSex === 'FEMALE'
        ? normalRange.female
        : patientSex === 'MALE'
          ? normalRange.male
          : normalRange.male || normalRange.female;

    if (range) {
      return `${range.min} – ${range.max}`;
    }

    if (normalRange.male && normalRange.female) {
      return `M: ${normalRange.male.min}–${normalRange.male.max} | F: ${normalRange.female.min}–${normalRange.female.max}`;
    }

    return 'Gender Specific';
  }

  if (normalRange.type === 'text') {
    return normalRange.text || 'Normal';
  }

  return 'Not Specified';
}

/**
 * Pure function to evaluate whether a result value is within normal limits,
 * high, low, abnormal qualitative, or a critical panic threshold.
 */
export function evaluateNormalRange(
  normalRange: StructuredNormalRange | null | undefined,
  value: string,
  patientSex?: SexEnum,
): RangeEvaluationResult {
  const formattedRange = formatNormalRange(normalRange, patientSex);

  if (!value || value.trim() === '') {
    return {
      isOutOfRange: false,
      status: 'EMPTY',
      formattedRange,
      badgeLabel: 'Empty',
    };
  }

  if (!normalRange) {
    return {
      isOutOfRange: false,
      status: 'NORMAL',
      formattedRange,
      badgeLabel: 'Normal',
    };
  }

  const trimmed = value.trim();

  // 1. Numeric Range Evaluation
  if (normalRange.type === 'numeric') {
    const num = parseFloat(trimmed);
    if (isNaN(num)) {
      return {
        isOutOfRange: false,
        status: 'NORMAL',
        formattedRange,
        badgeLabel: 'Normal',
      };
    }

    // Check Panic Thresholds
    if (normalRange.panicLow !== undefined && num <= normalRange.panicLow) {
      return {
        isOutOfRange: true,
        status: 'PANIC',
        formattedRange,
        badgeLabel: 'PANIC LOW',
      };
    }
    if (normalRange.panicHigh !== undefined && num >= normalRange.panicHigh) {
      return {
        isOutOfRange: true,
        status: 'PANIC',
        formattedRange,
        badgeLabel: 'PANIC HIGH',
      };
    }

    // Check Low / High
    if (normalRange.min !== undefined && num < normalRange.min) {
      return {
        isOutOfRange: true,
        status: 'LOW',
        formattedRange,
        badgeLabel: 'LOW',
      };
    }
    if (normalRange.max !== undefined && num > normalRange.max) {
      return {
        isOutOfRange: true,
        status: 'HIGH',
        formattedRange,
        badgeLabel: 'HIGH',
      };
    }

    return {
      isOutOfRange: false,
      status: 'NORMAL',
      formattedRange,
      badgeLabel: 'NORMAL',
    };
  }

  // 2. Gender-Specific Evaluation
  if (normalRange.type === 'gender_specific') {
    const num = parseFloat(trimmed);
    if (isNaN(num)) {
      return {
        isOutOfRange: false,
        status: 'NORMAL',
        formattedRange,
        badgeLabel: 'Normal',
      };
    }

    const range =
      patientSex === 'FEMALE'
        ? normalRange.female
        : patientSex === 'MALE'
          ? normalRange.male
          : normalRange.male || normalRange.female;

    if (!range) {
      return {
        isOutOfRange: false,
        status: 'NORMAL',
        formattedRange,
        badgeLabel: 'Normal',
      };
    }

    if (range.min !== undefined && num < range.min) {
      return {
        isOutOfRange: true,
        status: 'LOW',
        formattedRange,
        badgeLabel: 'LOW',
      };
    }

    if (range.max !== undefined && num > range.max) {
      return {
        isOutOfRange: true,
        status: 'HIGH',
        formattedRange,
        badgeLabel: 'HIGH',
      };
    }

    return {
      isOutOfRange: false,
      status: 'NORMAL',
      formattedRange,
      badgeLabel: 'NORMAL',
    };
  }

  // 3. Text / Qualitative Evaluation
  if (normalRange.type === 'text') {
    if (normalRange.text) {
      const expected = normalRange.text.toLowerCase().trim();
      const actual = trimmed.toLowerCase();

      // Negative/Nil matching
      const isExpected =
        actual === expected ||
        (expected === 'nil' && (actual === 'nil' || actual === 'negative' || actual === 'absent')) ||
        (expected === 'negative' && (actual === 'negative' || actual === 'nil' || actual === '-')) ||
        (expected === 'clear' && actual === 'clear');

      if (!isExpected) {
        return {
          isOutOfRange: true,
          status: 'ABNORMAL',
          formattedRange,
          badgeLabel: 'ABNORMAL',
        };
      }
    }

    return {
      isOutOfRange: false,
      status: 'NORMAL',
      formattedRange,
      badgeLabel: 'NORMAL',
    };
  }

  return {
    isOutOfRange: false,
    status: 'NORMAL',
    formattedRange,
    badgeLabel: 'NORMAL',
  };
}
