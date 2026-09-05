import type { LabResult } from '../types';
import { createLabId } from './ids';
import { deriveStatus } from './labStatus';

const VALUE_RE = /^([\d.]+)\s*([a-zA-Z0-9/^%]+)?/;
const RANGE_RE = /Reference Range:\s*([\d.]+)\s*-\s*([\d.]+)\s*([a-zA-Z0-9/^%]+)?/i;

/**
 * Offline lab extractor. Parses lines of the form:
 *   - Hemoglobin: 8.5 g/dL (Reference Range: 12.0 - 15.5 g/dL)
 *
 * Ported from `localRegexParser` (med.js:640-671). This is the fallback that
 * makes the app fully functional with no API key at all.
 */
export function localRegexParser(text: string): LabResult[] {
  const labs: LabResult[] = [];

  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('-')) continue;

    const clean = line.replace(/^[\s-]+/, '').trim();
    const parts = clean.split(':');
    if (parts.length < 2) continue;

    const testName = parts[0]!.trim();
    const rest = parts.slice(1).join(':').trim();

    const valMatch = rest.match(VALUE_RE);
    const refMatch = rest.match(RANGE_RE);
    if (!valMatch || !refMatch) continue;

    const value = Number.parseFloat(valMatch[1]!);
    const min = Number.parseFloat(refMatch[1]!);
    const max = Number.parseFloat(refMatch[2]!);
    if (!Number.isFinite(value)) continue;

    const safeMin = Number.isFinite(min) ? min : null;
    const safeMax = Number.isFinite(max) ? max : null;

    labs.push({
      id: createLabId(),
      testName,
      value,
      min: safeMin,
      max: safeMax,
      unit: valMatch[2] ?? refMatch[3] ?? '',
      status: deriveStatus(value, safeMin, safeMax),
    });
  }

  return labs;
}
