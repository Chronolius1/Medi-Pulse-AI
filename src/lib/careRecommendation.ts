import { specialtyRules } from '../data/specialtyRules';
import type { CareRecommendation, LabResult } from '../types';

/**
 * Maps out-of-range markers to the specialties that should review them.
 *
 * Ported from `renderCareRecommendation` (med.js:1389-1440), but pure: the
 * original also reached out and mutated the specialty dropdown as a side
 * effect. The tab now offers an explicit "filter to this specialty" button
 * instead of silently changing a filter under the user.
 */
export function buildCareRecommendation(labs: LabResult[]): CareRecommendation {
  if (labs.length === 0) {
    return {
      specialties: [],
      text: 'Synthesize medical records to generate automated specialist care recommendations based on out-of-range lab findings.',
      badge: 'Auto Care Match',
      tone: 'neutral',
    };
  }

  const abnormal = labs.filter((l) => l.status !== 'Normal');
  const specialties: string[] = [];

  for (const lab of abnormal) {
    const name = lab.testName.toLowerCase();
    for (const rule of specialtyRules) {
      if (rule.match.some((m) => name.includes(m)) && !specialties.includes(rule.specialty)) {
        specialties.push(rule.specialty);
      }
    }
  }

  if (specialties.length === 0) {
    return {
      specialties: [],
      text: 'All lab values appear within normal ranges. A routine follow-up with your Primary Care physician is recommended.',
      badge: 'All Normal',
      tone: 'normal',
    };
  }

  const abnormalList = abnormal.map((l) => `${l.testName} (${l.status})`).join(', ');
  const specList = specialties.join(', ');

  return {
    specialties,
    text: `Based on your out-of-range findings — ${abnormalList} — we recommend consulting a: ${specList}. Review the providers below to find care in your area.`,
    badge: `${specialties.length} Specialist${specialties.length > 1 ? 's' : ''} Matched`,
    tone: 'matched',
  };
}
