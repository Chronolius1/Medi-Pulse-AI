import type { ComparisonRow, PatientRecord, TrendPoint, TrendStats } from '../types';

export interface TrendSeries {
  points: TrendPoint[];
  unit: string;
  min: number | null;
  max: number | null;
}

/** Chronological series for one marker, with null gaps for visits missing it. */
export function buildTrendSeries(records: PatientRecord[], marker: string): TrendSeries {
  const points: TrendPoint[] = [];
  let unit = '';
  let min: number | null = null;
  let max: number | null = null;

  for (const record of records) {
    const lab = record.labs.find(
      (l) => l.testName.toLowerCase() === marker.toLowerCase(),
    );
    points.push({
      date: record.date || record.id,
      value: lab ? lab.value : null,
      status: lab ? lab.status : null,
    });
    if (lab) {
      unit = lab.unit || unit;
      if (min === null && lab.min !== null) min = lab.min;
      if (max === null && lab.max !== null) max = lab.max;
    }
  }

  return { points, unit, min, max };
}

/**
 * Baseline / latest / delta for the stat tiles.
 * Ported from `updateTrendStats` (med.js:1042-1077), which rendered the literal
 * string "null - null" when a marker had no reference range.
 */
export function buildTrendStats(series: TrendSeries): TrendStats {
  const values = series.points
    .map((p) => p.value)
    .filter((v): v is number => v !== null);

  const baseline = values.length > 0 ? values[0]! : null;
  const latest = values.length > 0 ? values[values.length - 1]! : null;
  const delta = baseline !== null && latest !== null ? latest - baseline : null;

  return { baseline, latest, delta, unit: series.unit, min: series.min, max: series.max };
}

/**
 * Joins two records' labs by name for the A-vs-B table.
 * Ported from `renderComparison` (med.js:1226-1269).
 */
export function buildComparisonRows(
  recordA: PatientRecord | null,
  recordB: PatientRecord | null,
): ComparisonRow[] {
  if (!recordA || !recordB) return [];

  const byName = new Map<string, ComparisonRow>();

  for (const lab of recordA.labs) {
    byName.set(lab.testName.toLowerCase(), {
      testName: lab.testName,
      unit: lab.unit,
      valueA: lab.value,
      valueB: null,
      delta: null,
    });
  }

  for (const lab of recordB.labs) {
    const key = lab.testName.toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      existing.valueB = lab.value;
      existing.delta =
        existing.valueA !== null
          ? Number.parseFloat((lab.value - existing.valueA).toFixed(2))
          : null;
    } else {
      byName.set(key, {
        testName: lab.testName,
        unit: lab.unit,
        valueA: null,
        valueB: lab.value,
        delta: null,
      });
    }
  }

  return Array.from(byName.values());
}
