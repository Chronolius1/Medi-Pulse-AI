import type { PatientRecord } from '../types';

/**
 * Downloads a record as JSON. Ported from `exportJSON` (med.js:1314-1321),
 * which used a `data:` URL — those hit length limits on large records and are
 * blocked by stricter CSPs. A Blob object URL has neither problem.
 */
export function exportRecordAsJson(record: PatientRecord): void {
  const blob = new Blob([JSON.stringify(record, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${record.id}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
