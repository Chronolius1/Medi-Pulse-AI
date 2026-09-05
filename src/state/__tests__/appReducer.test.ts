import { describe, expect, it } from 'vitest';
import { appReducer, initialState } from '../appReducer';
import { selectCurrentRecord, selectFilteredLabs } from '../selectors';
import type { AppState } from '../types';

const loaded = (): AppState =>
  appReducer(initialState, { type: 'demo/loadHistorical' });

describe('appReducer', () => {
  it('derives an audit entry from every auditable action', () => {
    const state = appReducer(initialState, { type: 'role/set', role: 'patient' });
    expect(state.audit[0]?.message).toBe('Role switched to: PATIENT');
  });

  it('caps the audit log', () => {
    let state = initialState;
    for (let i = 0; i < 250; i += 1) {
      state = appReducer(state, { type: 'audit/log', message: `entry ${i}` });
    }
    expect(state.audit).toHaveLength(200);
    expect(state.audit[0]?.message).toBe('entry 249');
  });

  it('loads the longitudinal demo and selects the latest visit', () => {
    const state = loaded();
    expect(state.records).toHaveLength(3);
    expect(selectCurrentRecord(state)?.id).toBe('REC-HIST-03');
    expect(state.activeTab).toBe('compare');
    expect(state.trends.activeMarker).toBe('Fasting Glucose');
  });

  it('edits a lab immutably and recomputes its status', () => {
    const before = loaded();
    const record = selectCurrentRecord(before)!;
    const glucose = record.labs.find((l) => l.testName === 'Fasting Glucose')!;
    expect(glucose.status).toBe('Normal');

    const after = appReducer(before, {
      type: 'lab/edit',
      recordId: record.id,
      labId: glucose.id,
      testName: glucose.testName,
      value: 250,
    });

    const edited = selectCurrentRecord(after)!.labs.find((l) => l.id === glucose.id)!;
    expect(edited.value).toBe(250);
    expect(edited.status).toBe('High');
    expect(edited.edited).toBe(true);
    // The original mutated in place, so the previous state changed too.
    expect(glucose.value).toBe(94);
  });

  it('does not alias the current record with its history entry', () => {
    const before = loaded();
    const record = selectCurrentRecord(before)!;
    const after = appReducer(before, {
      type: 'lab/edit',
      recordId: record.id,
      labId: record.labs[0]!.id,
      testName: record.labs[0]!.testName,
      value: 1,
    });
    // Reading through history and through the selector must agree.
    const fromHistory = after.records.find((r) => r.id === record.id)!;
    expect(fromHistory.labs[0]!.value).toBe(1);
    expect(selectCurrentRecord(after)!.labs[0]!.value).toBe(1);
  });

  it('clears custom doctors along with patient data', () => {
    let state = appReducer(loaded(), {
      type: 'doctors/add',
      doctor: {
        id: 'd1',
        name: 'Dr. Test',
        specialty: 'Primary Care',
        clinic: '',
        phone: '',
        source: 'custom',
      },
    });
    expect(state.doctors.custom).toHaveLength(1);

    state = appReducer(state, { type: 'data/clearAll', forgetApiKey: false });
    expect(state.records).toHaveLength(0);
    // The original left medipulse_custom_doctors behind.
    expect(state.doctors.custom).toHaveLength(0);
  });

  it('keeps the API key across a data wipe unless asked to forget it', () => {
    const withKey = appReducer(initialState, {
      type: 'settings/update',
      patch: { provider: 'gemini', apiKey: 'k' },
    });
    expect(appReducer(withKey, { type: 'data/clearAll', forgetApiKey: false }).settings.apiKey)
      .toBe('k');
    expect(appReducer(withKey, { type: 'data/clearAll', forgetApiKey: true }).settings.apiKey)
      .toBe('');
  });

  it('defaults the model when the provider changes', () => {
    const state = appReducer(initialState, {
      type: 'settings/update',
      patch: { provider: 'openai' },
    });
    expect(state.settings.model).toBe('gpt-4o-mini');
  });
});

describe('selectFilteredLabs', () => {
  it('filters by query and status together', () => {
    const state = loaded();
    expect(selectFilteredLabs({ ...state, labFilter: { query: 'glu', status: 'ALL' } }))
      .toHaveLength(1);
    expect(selectFilteredLabs({ ...state, labFilter: { query: '', status: 'Normal' } }))
      .toHaveLength(4);
    expect(selectFilteredLabs({ ...state, labFilter: { query: 'zzz', status: 'ALL' } }))
      .toHaveLength(0);
  });

  it('returns nothing when there is no current record', () => {
    // The original returned early here and left stale rows on screen.
    const state = { ...loaded(), currentRecordId: null };
    expect(selectFilteredLabs(state)).toEqual([]);
  });
});
