import { describe, expect, it } from 'vitest';
import type { LabResult } from '../../types';
import { buildCareRecommendation } from '../careRecommendation';

const lab = (testName: string, status: LabResult['status']): LabResult => ({
  id: `id-${testName}`,
  testName,
  value: 1,
  min: 0,
  max: 2,
  unit: '',
  status,
});

describe('buildCareRecommendation', () => {
  it('prompts for synthesis when there are no labs', () => {
    const rec = buildCareRecommendation([]);
    expect(rec.tone).toBe('neutral');
    expect(rec.specialties).toEqual([]);
  });

  it('reports the all-normal case', () => {
    const rec = buildCareRecommendation([lab('Hemoglobin', 'Normal')]);
    expect(rec.tone).toBe('normal');
    expect(rec.badge).toBe('All Normal');
  });

  it.each([
    ['Hemoglobin', 'Hematologist'],
    ['Ferritin', 'Hematologist'],
    ['TSH', 'Endocrinologist'],
    ['Free T4', 'Endocrinologist'],
    ['Fasting Glucose', 'Endocrinologist'],
    ['HbA1c', 'Endocrinologist'],
    ['Total Cholesterol', 'Cardiologist'],
    ['LDL', 'Cardiologist'],
    ['Serum Creatinine', 'Primary Care'],
  ])('routes an abnormal %s to %s', (testName, specialty) => {
    const rec = buildCareRecommendation([lab(testName, 'High')]);
    expect(rec.specialties).toContain(specialty);
  });

  it('deduplicates specialties matched by several markers', () => {
    const rec = buildCareRecommendation([
      lab('Fasting Glucose', 'High'),
      lab('HbA1c', 'High'),
    ]);
    expect(rec.specialties).toEqual(['Endocrinologist']);
    expect(rec.badge).toBe('1 Specialist Matched');
  });

  it('pluralises the badge for multiple matches', () => {
    const rec = buildCareRecommendation([
      lab('HbA1c', 'High'),
      lab('Total Cholesterol', 'High'),
    ]);
    expect(rec.badge).toBe('2 Specialists Matched');
  });

  it('ignores normal markers when matching', () => {
    const rec = buildCareRecommendation([
      lab('HbA1c', 'Normal'),
      lab('Ferritin', 'Low'),
    ]);
    expect(rec.specialties).toEqual(['Hematologist']);
  });
});
