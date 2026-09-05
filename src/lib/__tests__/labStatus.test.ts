import { describe, expect, it } from 'vitest';
import { deriveStatus, formatRange, rangePercent } from '../labStatus';

describe('deriveStatus', () => {
  it('classifies within, below and above the range', () => {
    expect(deriveStatus(12, 10, 15)).toBe('Normal');
    expect(deriveStatus(8, 10, 15)).toBe('Low');
    expect(deriveStatus(20, 10, 15)).toBe('High');
  });

  it('treats the bounds themselves as normal', () => {
    expect(deriveStatus(10, 10, 15)).toBe('Normal');
    expect(deriveStatus(15, 10, 15)).toBe('Normal');
  });

  it('falls back to Normal when a bound is missing', () => {
    expect(deriveStatus(999, null, null)).toBe('Normal');
    expect(deriveStatus(5, 10, null)).toBe('Low');
    expect(deriveStatus(20, null, 15)).toBe('High');
  });
});

describe('rangePercent', () => {
  it('positions a mid-range value proportionally', () => {
    expect(rangePercent(12.5, 10, 15)).toBe(50);
  });

  it('clamps to 5-95 so the marker stays visible', () => {
    expect(rangePercent(-100, 10, 15)).toBe(5);
    expect(rangePercent(1000, 10, 15)).toBe(95);
  });

  it('returns null for an unusable range instead of NaN', () => {
    expect(rangePercent(12, null, 15)).toBeNull();
    expect(rangePercent(12, 10, null)).toBeNull();
    // min === max divided by zero in the original.
    expect(rangePercent(12, 10, 10)).toBeNull();
  });
});

describe('formatRange', () => {
  it('renders a dash-separated range with units', () => {
    expect(formatRange(10, 15, 'g/dL')).toBe('10 - 15 g/dL');
  });

  it('never prints "null - null"', () => {
    expect(formatRange(null, null, 'g/dL')).toBe('No reference range');
    expect(formatRange(10, null, 'g/dL')).toBe('No reference range');
  });
});
