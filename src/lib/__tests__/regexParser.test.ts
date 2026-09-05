import { describe, expect, it } from 'vitest';
import { clinicalPresets } from '../../data/presets';
import { localRegexParser } from '../regexParser';

describe('localRegexParser', () => {
  it('extracts every marker from the anemia preset', () => {
    const labs = localRegexParser(clinicalPresets.anemia!.report);
    expect(labs).toHaveLength(4);
    expect(labs[0]).toMatchObject({
      testName: 'Hemoglobin',
      value: 8.5,
      unit: 'g/dL',
      min: 12.0,
      max: 15.5,
      status: 'Low',
    });
  });

  it('extracts the thyroid preset including a parenthesised test name', () => {
    const labs = localRegexParser(clinicalPresets.thyroid!.report);
    expect(labs).toHaveLength(3);
    expect(labs.map((l) => l.status)).toEqual(['High', 'Low', 'Normal']);
  });

  it('extracts the diabetes preset', () => {
    const labs = localRegexParser(clinicalPresets.diabetes!.report);
    expect(labs).toHaveLength(3);
    expect(labs.every((l) => l.status === 'High')).toBe(true);
  });

  it('skips lines without a reference range', () => {
    expect(localRegexParser('- Hemoglobin: 8.5 g/dL')).toHaveLength(0);
  });

  it('skips lines that are not list items', () => {
    expect(
      localRegexParser('Hemoglobin: 8.5 g/dL (Reference Range: 12.0 - 15.5 g/dL)'),
    ).toHaveLength(0);
  });

  it('ignores malformed and empty input', () => {
    expect(localRegexParser('')).toHaveLength(0);
    expect(localRegexParser('- : (Reference Range: a - b)')).toHaveLength(0);
  });

  it('assigns a unique id to every marker', () => {
    const labs = localRegexParser(clinicalPresets.anemia!.report);
    expect(new Set(labs.map((l) => l.id)).size).toBe(labs.length);
  });
});
