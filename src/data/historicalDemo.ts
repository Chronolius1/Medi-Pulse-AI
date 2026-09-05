import type { PatientRecord } from '../types';

/**
 * Three-visit longitudinal demo: a Type 2 diabetes case improving under
 * metformin. Ported from `historicalDemo` in med.js.
 *
 * BUG FIX: the original stored `rawText` as double-quoted strings containing
 * literal `\\n` sequences, so the Source Viewer rendered "\n" as visible text
 * instead of line breaks. These are real newlines.
 */
export const historicalDemo: PatientRecord[] = [
  {
    id: 'REC-HIST-01',
    date: '2026-06-15',
    timestamp: '2026-06-15 09:30:00',
    intakeData: {
      age: '52',
      sex: 'Male',
      symptoms: 'Polydipsia, frequent nocturia, profound fatigue',
      conditions: 'Hypertension',
      allergies: 'Sulfa Drugs',
      medications: 'Amlodipine 5mg',
    },
    rawText: `METROPOLITAN DIAGNOSTIC LABS
Patient: Demo Longitudinal Subject
Date: 2026-06-15

METABOLIC & LIPID PANEL:
- Fasting Glucose: 168 mg/dL (Reference Range: 70 - 99 mg/dL)
- HbA1c: 8.4 % (Reference Range: 4.0 - 5.6 %)
- Total Cholesterol: 235 mg/dL (Reference Range: 125 - 200 mg/dL)
- Serum Creatinine: 1.1 mg/dL (Reference Range: 0.7 - 1.3 mg/dL)`,
    labs: [
      { id: 'h1-glu', testName: 'Fasting Glucose', value: 168, unit: 'mg/dL', min: 70, max: 99, status: 'High' },
      { id: 'h1-a1c', testName: 'HbA1c', value: 8.4, unit: '%', min: 4.0, max: 5.6, status: 'High' },
      { id: 'h1-chol', testName: 'Total Cholesterol', value: 235, unit: 'mg/dL', min: 125, max: 200, status: 'High' },
      { id: 'h1-cre', testName: 'Serum Creatinine', value: 1.1, unit: 'mg/dL', min: 0.7, max: 1.3, status: 'Normal' },
    ],
    summary:
      'Visit 1 (Baseline): Uncontrolled glycemic status with marked hyperglycemia (Fasting Glucose 168 mg/dL, HbA1c 8.4%) and hypercholesterolemia. Renal indices baseline normal.',
    conflicts: ['Marked glycemic elevation without diabetes documented in intake record.'],
    engine: 'Structured Regex Engine',
  },
  {
    id: 'REC-HIST-02',
    date: '2026-07-20',
    timestamp: '2026-07-20 10:15:00',
    intakeData: {
      age: '52',
      sex: 'Male',
      symptoms: 'Decreased thirst, improving daytime stamina',
      conditions: 'Hypertension, Type 2 Diabetes',
      allergies: 'Sulfa Drugs',
      medications: 'Amlodipine 5mg, Metformin 500mg',
    },
    rawText: `METROPOLITAN DIAGNOSTIC LABS
Patient: Demo Longitudinal Subject
Date: 2026-07-20

METABOLIC & LIPID PANEL:
- Fasting Glucose: 135 mg/dL (Reference Range: 70 - 99 mg/dL)
- HbA1c: 7.4 % (Reference Range: 4.0 - 5.6 %)
- Total Cholesterol: 208 mg/dL (Reference Range: 125 - 200 mg/dL)
- Serum Creatinine: 1.0 mg/dL (Reference Range: 0.7 - 1.3 mg/dL)`,
    labs: [
      { id: 'h2-glu', testName: 'Fasting Glucose', value: 135, unit: 'mg/dL', min: 70, max: 99, status: 'High' },
      { id: 'h2-a1c', testName: 'HbA1c', value: 7.4, unit: '%', min: 4.0, max: 5.6, status: 'High' },
      { id: 'h2-chol', testName: 'Total Cholesterol', value: 208, unit: 'mg/dL', min: 125, max: 200, status: 'High' },
      { id: 'h2-cre', testName: 'Serum Creatinine', value: 1.0, unit: 'mg/dL', min: 0.7, max: 1.3, status: 'Normal' },
    ],
    summary:
      'Visit 2 (30-Day Follow-Up): Positive therapeutic response following metformin therapy initiation. Fasting glucose reduced by 33 mg/dL and HbA1c improved to 7.4%.',
    conflicts: [],
    engine: 'Structured Regex Engine',
  },
  {
    id: 'REC-HIST-03',
    date: '2026-08-25',
    timestamp: '2026-08-25 11:00:00',
    intakeData: {
      age: '52',
      sex: 'Male',
      symptoms: 'Asymptomatic, sustained energy, no nocturia',
      conditions: 'Hypertension, Type 2 Diabetes',
      allergies: 'Sulfa Drugs',
      medications: 'Amlodipine 5mg, Metformin 1000mg',
    },
    rawText: `METROPOLITAN DIAGNOSTIC LABS
Patient: Demo Longitudinal Subject
Date: 2026-08-25

METABOLIC & LIPID PANEL:
- Fasting Glucose: 94 mg/dL (Reference Range: 70 - 99 mg/dL)
- HbA1c: 5.5 % (Reference Range: 4.0 - 5.6 %)
- Total Cholesterol: 178 mg/dL (Reference Range: 125 - 200 mg/dL)
- Serum Creatinine: 0.9 mg/dL (Reference Range: 0.7 - 1.3 mg/dL)`,
    labs: [
      { id: 'h3-glu', testName: 'Fasting Glucose', value: 94, unit: 'mg/dL', min: 70, max: 99, status: 'Normal' },
      { id: 'h3-a1c', testName: 'HbA1c', value: 5.5, unit: '%', min: 4.0, max: 5.6, status: 'Normal' },
      { id: 'h3-chol', testName: 'Total Cholesterol', value: 178, unit: 'mg/dL', min: 125, max: 200, status: 'Normal' },
      { id: 'h3-cre', testName: 'Serum Creatinine', value: 0.9, unit: 'mg/dL', min: 0.7, max: 1.3, status: 'Normal' },
    ],
    summary:
      'Visit 3 (60-Day Follow-Up): Optimal biomarker normalization achieved. Fasting Glucose (94 mg/dL), HbA1c (5.5%), and Total Cholesterol (178 mg/dL) all normalized.',
    conflicts: [],
    engine: 'Structured Regex Engine',
  },
];
