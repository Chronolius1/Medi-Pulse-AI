/**
 * Short unique ids. `crypto.randomUUID` is available in every browser this app
 * targets, but the counter fallback keeps ids stable in non-secure contexts
 * (plain-HTTP LAN previews) where `crypto` is undefined.
 */
let counter = 0;

function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 8);
  }
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}

export const createRecordId = (): string => `REC-${Date.now()}`;
export const createLabId = (): string => `lab-${uid()}`;
export const createDoctorId = (): string => `doc-${uid()}`;
export const createMessageId = (): string => `msg-${uid()}`;
export const createAuditId = (): string => `aud-${uid()}`;
export const createToastId = (): string => `tst-${uid()}`;
