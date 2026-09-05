import type { LabStatus } from '../types';

/**
 * Single source of truth for status derivation, shared by the regex parser,
 * the AI-result normaliser and the manual edit modal. The original computed
 * this in three separate places (med.js:665-667, 791-793 and inside the AI
 * prompt), which is how they drifted.
 */
export function deriveStatus(
  value: number,
  min: number | null,
  max: number | null,
): LabStatus {
  if (min !== null && value < min) return 'Low';
  if (max !== null && value > max) return 'High';
  return 'Normal';
}

/**
 * Horizontal position (%) of the marker dot on a reference-range bar.
 * Clamped to 5-95 so the dot stays visible at the extremes (med.js:701-703).
 *
 * Returns null when the range is unusable — missing bounds, or min === max
 * which divided by zero and produced NaN in the original.
 */
export function rangePercent(
  value: number,
  min: number | null,
  max: number | null,
): number | null {
  if (min === null || max === null) return null;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return null;
  const pct = ((value - min) / (max - min)) * 100;
  if (!Number.isFinite(pct)) return null;
  return Math.min(95, Math.max(5, pct));
}

/** Formats a reference range, tolerating absent bounds. */
export function formatRange(
  min: number | null,
  max: number | null,
  unit: string,
): string {
  if (min === null || max === null) return 'No reference range';
  return `${min} - ${max} ${unit}`.trim();
}
