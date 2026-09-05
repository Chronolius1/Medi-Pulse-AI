import type { LabResult, PatientRecord } from '../types';
import type { AppState } from './types';

export function selectCurrentRecord(state: AppState): PatientRecord | null {
  if (!state.currentRecordId) return null;
  return state.records.find((r) => r.id === state.currentRecordId) ?? null;
}

export function selectAbnormalLabs(record: PatientRecord | null): LabResult[] {
  return (record?.labs ?? []).filter((l) => l.status !== 'Normal');
}

/** Distinct marker names across the whole history, in first-seen order. */
export function selectAvailableMarkers(state: AppState): string[] {
  const seen = new Set<string>();
  const markers: string[] = [];
  for (const record of state.records) {
    for (const lab of record.labs) {
      const key = lab.testName.toLowerCase();
      if (lab.testName && !seen.has(key)) {
        seen.add(key);
        markers.push(lab.testName);
      }
    }
  }
  return markers;
}

/**
 * Applies the search + status filter to the current record's labs.
 *
 * The original `filterTable()` returned early when there was no current record,
 * leaving whatever rows were previously rendered on screen. Deriving the list
 * makes that state unreachable.
 */
export function selectFilteredLabs(state: AppState): LabResult[] {
  const record = selectCurrentRecord(state);
  const labs = record?.labs ?? [];
  const query = state.labFilter.query.trim().toLowerCase();
  return labs.filter((lab) => {
    const matchesQuery = !query || lab.testName.toLowerCase().includes(query);
    const matchesStatus =
      state.labFilter.status === 'ALL' || lab.status === state.labFilter.status;
    return matchesQuery && matchesStatus;
  });
}

/** The marker actually plotted: the chosen one, else Fasting Glucose, else first. */
export function selectActiveMarker(state: AppState): string | null {
  const markers = selectAvailableMarkers(state);
  if (markers.length === 0) return null;
  const chosen = state.trends.activeMarker;
  if (chosen && markers.some((m) => m.toLowerCase() === chosen.toLowerCase())) {
    return chosen;
  }
  return markers.find((m) => m === 'Fasting Glucose') ?? markers[0]!;
}

export function selectIsClinician(state: AppState): boolean {
  return state.role === 'clinician';
}

/** The provider that will actually be used — 'offline' whenever no key is set. */
export function selectEffectiveProvider(state: AppState): AppState['settings']['provider'] {
  const { provider, apiKey } = state.settings;
  if (provider === 'offline') return 'offline';
  return apiKey.trim() ? provider : 'offline';
}
