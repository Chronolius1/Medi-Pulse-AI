import type { ClinicalPreset } from '../types';

/** One-click demo cases. Ported from `clinicalPresets` in med.js. */
export const clinicalPresets: Record<'anemia' | 'thyroid' | 'diabetes', ClinicalPreset> = {
  anemia: {
    age: '38',
    sex: 'Female',
    symptoms: 'Severe fatigue, dizziness, cold hands',
    conditions: 'Mild Gastritis',
    allergies: 'None',
    medications: 'Multivitamins',
    report: `METROPOLITAN DIAGNOSTIC LABS
Date: 2026-08-14

COMPREHENSIVE BLOOD PANEL:
- Hemoglobin: 8.5 g/dL (Reference Range: 12.0 - 15.5 g/dL)
- Serum Iron: 32 ug/dL (Reference Range: 60 - 170 ug/dL)
- Ferritin: 10 ng/mL (Reference Range: 20 - 200 ng/mL)
- White Blood Cell: 6.2 x10^3 / uL (Reference Range: 4.5 - 11.0 x10^3 / uL)`,
  },
  thyroid: {
    age: '45',
    sex: 'Female',
    symptoms: 'Fatigue, unexplained weight gain, muscle weakness',
    conditions: 'None Reported',
    allergies: 'Penicillin',
    medications: 'None',
    report: `METROPOLITAN DIAGNOSTIC LABS
Date: 2026-08-14

THYROID FUNCTION PANEL:
- Thyroid Stimulating Hormone (TSH): 7.2 mIU/L (Reference Range: 0.4 - 4.0 mIU/L)
- Free T4: 0.6 ng/dL (Reference Range: 0.8 - 1.8 ng/dL)
- Fasting Glucose: 92 mg/dL (Reference Range: 70 - 99 mg/dL)`,
  },
  diabetes: {
    age: '52',
    sex: 'Male',
    symptoms: 'Increased thirst, frequent urination, blurred vision',
    conditions: 'Hypertension',
    allergies: 'Sulfa Drugs',
    medications: 'Amlodipine 5mg',
    report: `METROPOLITAN DIAGNOSTIC LABS
Date: 2026-08-14

METABOLIC PANEL:
- Fasting Glucose: 168 mg/dL (Reference Range: 70 - 99 mg/dL)
- HbA1c: 8.4 % (Reference Range: 4.0 - 5.6 %)
- Total Cholesterol: 235 mg/dL (Reference Range: 125 - 200 mg/dL)`,
  },
};

export type PresetKey = 'anemia' | 'thyroid' | 'diabetes';

export const presetLabels: { key: PresetKey; label: string }[] = [
  { key: 'anemia', label: 'Iron Deficiency Anemia' },
  { key: 'thyroid', label: 'Hypothyroidism' },
  { key: 'diabetes', label: 'Type 2 Diabetes' },
];
