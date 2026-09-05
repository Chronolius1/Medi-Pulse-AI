import type { Doctor } from '../types';

function openMaps(query: string): void {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Ported from `openMapsForDoctor` (med.js:1497-1500). The original built this
 * into an inline onclick attribute with naive quote escaping, so a provider
 * name containing a backslash or newline broke out of the handler.
 */
export function openMapsForDoctor(doctor: Doctor, location: string): void {
  const parts = [doctor.name, doctor.address, `near ${location}`].filter(Boolean);
  openMaps(parts.join(', '));
}

/** Ported from `searchOnGoogleMaps` (med.js:1594-1600). */
export function searchSpecialtyOnMaps(specialty: string, location: string): void {
  const term = specialty === 'ALL' ? 'doctor' : specialty;
  openMaps(`${term} near ${location}`);
}
