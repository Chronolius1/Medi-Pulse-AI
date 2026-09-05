import { describe, expect, it } from 'vitest';
import { historicalDemo } from '../../data/historicalDemo';
import { buildComparisonRows, buildTrendSeries, buildTrendStats } from '../trends';

describe('buildTrendSeries', () => {
  it('follows a marker chronologically across visits', () => {
    const series = buildTrendSeries(historicalDemo, 'Fasting Glucose');
    expect(series.points.map((p) => p.value)).toEqual([168, 135, 94]);
    expect(series.unit).toBe('mg/dL');
    expect(series.min).toBe(70);
    expect(series.max).toBe(99);
  });

  it('matches marker names case-insensitively', () => {
    expect(buildTrendSeries(historicalDemo, 'fasting glucose').points[0]?.value).toBe(168);
  });

  it('leaves a null gap for visits missing the marker', () => {
    const records = [
      historicalDemo[0]!,
      { ...historicalDemo[1]!, labs: [] },
      historicalDemo[2]!,
    ];
    expect(buildTrendSeries(records, 'HbA1c').points.map((p) => p.value)).toEqual([
      8.4,
      null,
      5.5,
    ]);
  });
});

describe('buildTrendStats', () => {
  it('computes baseline, latest and delta', () => {
    const stats = buildTrendStats(buildTrendSeries(historicalDemo, 'Fasting Glucose'));
    expect(stats.baseline).toBe(168);
    expect(stats.latest).toBe(94);
    expect(stats.delta).toBe(-74);
  });

  it('returns nulls rather than NaN when a marker is absent', () => {
    const stats = buildTrendStats(buildTrendSeries(historicalDemo, 'Nonexistent'));
    expect(stats.baseline).toBeNull();
    expect(stats.latest).toBeNull();
    expect(stats.delta).toBeNull();
  });
});

describe('buildComparisonRows', () => {
  it('joins two records by marker name and computes the delta', () => {
    const rows = buildComparisonRows(historicalDemo[0]!, historicalDemo[2]!);
    const glucose = rows.find((r) => r.testName === 'Fasting Glucose');
    expect(glucose).toMatchObject({ valueA: 168, valueB: 94, delta: -74 });
  });

  it('includes markers present in only one record', () => {
    const a = { ...historicalDemo[0]!, labs: historicalDemo[0]!.labs.slice(0, 1) };
    const rows = buildComparisonRows(a, historicalDemo[2]!);
    expect(rows).toHaveLength(4);
    expect(rows.find((r) => r.testName === 'HbA1c')).toMatchObject({
      valueA: null,
      delta: null,
    });
  });

  it('returns nothing when either record is missing', () => {
    expect(buildComparisonRows(null, historicalDemo[0]!)).toEqual([]);
    expect(buildComparisonRows(historicalDemo[0]!, null)).toEqual([]);
  });
});

describe('historicalDemo data integrity', () => {
  it('stores real newlines, not escaped ones', () => {
    for (const record of historicalDemo) {
      expect(record.rawText).not.toContain('\\n');
      expect(record.rawText.split('\n').length).toBeGreaterThan(3);
    }
  });

  it('gives every lab a unique id', () => {
    const ids = historicalDemo.flatMap((r) => r.labs.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
