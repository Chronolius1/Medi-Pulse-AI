import type { IntakeData, LabResult } from '../types';

/**
 * Deterministic summary used when no AI summary is available.
 * Ported from `renderSummary` (med.js:756-770).
 */
export function buildFallbackSummary(intake: IntakeData, labs: LabResult[]): string {
  const abnormal = labs.filter((l) => l.status !== 'Normal');
  const age = intake.age || 'unknown age';
  const sex = intake.sex || 'unspecified sex';
  const symptoms = intake.symptoms || 'none reported';

  if (labs.length === 0) {
    return `Patient (${age}Y, ${sex}) presents with symptoms: "${symptoms}". No laboratory entities were extracted from the supplied report.`;
  }

  if (abnormal.length === 0) {
    return `Patient (${age}Y, ${sex}) presents with symptoms: "${symptoms}". All ${labs.length} extracted parameters fall within their reference ranges.`;
  }

  const list = abnormal
    .map((l) => `${l.testName} (${l.value} ${l.unit}, ${l.status})`)
    .join(', ');

  return `Patient (${age}Y, ${sex}) presents with symptoms: "${symptoms}". Out-of-range parameters identified: ${list}. This synthesis is non-diagnostic and requires clinician review.`;
}

/**
 * Heuristic conflict detection used when the AI supplies none.
 * Ported from `renderConflicts` (med.js:732-754).
 */
export function buildHeuristicConflicts(intake: IntakeData, labs: LabResult[]): string[] {
  const conflicts: string[] = [];
  const conditions = (intake.conditions || '').toLowerCase();

  const tsh = labs.find((l) => l.testName.toLowerCase().includes('tsh'));
  if (tsh && tsh.status === 'High' && !conditions.includes('thyroid')) {
    conflicts.push(
      'Elevated TSH detected without a documented thyroid condition in the intake history.',
    );
  }

  const glucose = labs.find((l) => {
    const n = l.testName.toLowerCase();
    return n.includes('glucose') || n.includes('hba1c');
  });
  if (glucose && glucose.status === 'High' && !conditions.includes('diabet')) {
    conflicts.push(
      'Glycemic elevation detected without diabetes documented in the intake record.',
    );
  }

  return conflicts;
}
