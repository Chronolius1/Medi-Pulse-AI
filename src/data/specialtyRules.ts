/**
 * Maps abnormal lab marker names to the specialty that should review them.
 * Extracted from the if-chain in `renderCareRecommendation` (med.js:1404-1421)
 * so the rules are data rather than control flow.
 */
export interface SpecialtyRule {
  specialty: string;
  /** Lowercased substrings matched against the lab's testName. */
  match: string[];
  reason: string;
}

export const specialtyRules: SpecialtyRule[] = [
  {
    specialty: 'Hematologist',
    match: ['hemoglobin', 'ferritin', 'iron', 'hgb'],
    reason: 'blood and iron studies',
  },
  {
    specialty: 'Endocrinologist',
    match: ['tsh', 't4', 't3', 'thyroid'],
    reason: 'thyroid function',
  },
  {
    specialty: 'Endocrinologist',
    match: ['glucose', 'hba1c', 'insulin'],
    reason: 'glycemic control',
  },
  {
    specialty: 'Cardiologist',
    match: ['cholesterol', 'ldl', 'hdl', 'triglyceride'],
    reason: 'lipid profile',
  },
  {
    specialty: 'Primary Care',
    match: ['creatinine', 'bun', 'gfr'],
    reason: 'renal indices',
  },
];
