import type { Doctor, LabResult, PatientRecord, Settings } from '../types';
import { createDoctorId, createLabId } from '../lib/ids';
import { deriveStatus } from '../lib/labStatus';
import { ENV_GEMINI_API_KEY } from '../lib/env';
import type { PersistedState } from './types';

/**
 * localStorage keys. The first three are kept byte-identical to the vanilla app
 * so an existing user's data survives the rewrite.
 */
export const STORAGE_KEYS = {
  history: 'medipulse_history',
  provider: 'medipulse_api_provider',
  customDoctors: 'medipulse_custom_doctors',
  apiKey: 'medipulse_api_key',
  model: 'medipulse_api_model',
  location: 'medipulse_location',
  schemaVersion: 'medipulse_schema_version',
} as const;

export const SCHEMA_VERSION = '2';

export const DEFAULT_SETTINGS: Settings = {
  provider: 'offline',
  apiKey: '',
  model: '',
};

/** Model defaults per provider. Overridable in the Settings modal. */
export const DEFAULT_MODELS: Record<string, string> = {
  gemini: 'gemini-2.0-flash',
  openai: 'gpt-4o-mini',
  offline: '',
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function toNullableNumber(value: unknown): number | null {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

/**
 * Normalises a lab from any schema version: v1 entries have no `id`, and both
 * versions can carry non-numeric or absent bounds.
 */
function migrateLab(raw: unknown): LabResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const l = raw as Record<string, unknown>;
  const value = toNullableNumber(l.value);
  if (typeof l.testName !== 'string' || value === null) return null;

  const min = toNullableNumber(l.min);
  const max = toNullableNumber(l.max);
  const status =
    l.status === 'High' || l.status === 'Low' || l.status === 'Normal'
      ? l.status
      : deriveStatus(value, min, max);

  return {
    id: typeof l.id === 'string' ? l.id : createLabId(),
    testName: l.testName,
    value,
    min,
    max,
    unit: typeof l.unit === 'string' ? l.unit : '',
    status,
    edited: l.edited === true,
  };
}

function migrateRecord(raw: unknown): PatientRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string') return null;

  const intake = (r.intakeData ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

  return {
    id: r.id,
    date: typeof r.date === 'string' ? r.date : '',
    timestamp: typeof r.timestamp === 'string' ? r.timestamp : '',
    intakeData: {
      age: str(intake.age),
      sex: str(intake.sex) || 'Female',
      symptoms: str(intake.symptoms),
      conditions: str(intake.conditions),
      allergies: str(intake.allergies),
      medications: str(intake.medications),
    },
    // v1 demo records stored literal "\n" escapes; unescape defensively.
    rawText: typeof r.rawText === 'string' ? r.rawText.replace(/\\n/g, '\n') : '',
    labs: Array.isArray(r.labs)
      ? r.labs.map(migrateLab).filter((l): l is LabResult => l !== null)
      : [],
    summary: typeof r.summary === 'string' ? r.summary : null,
    conflicts: Array.isArray(r.conflicts) ? r.conflicts.filter((c): c is string => typeof c === 'string') : [],
    engine: typeof r.engine === 'string' ? r.engine : 'Unknown Engine',
  };
}

function migrateDoctor(raw: unknown): Doctor | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Record<string, unknown>;
  if (typeof d.name !== 'string' || !d.name) return null;
  return {
    id: typeof d.id === 'string' ? d.id : createDoctorId(),
    name: d.name,
    specialty: typeof d.specialty === 'string' ? d.specialty : 'Primary Care',
    clinic: typeof d.clinic === 'string' ? d.clinic : '',
    phone: typeof d.phone === 'string' ? d.phone : '',
    address: typeof d.address === 'string' ? d.address : undefined,
    source: 'custom',
  };
}

export function loadPersistedState(): Partial<PersistedState> {
  if (typeof localStorage === 'undefined') return {};

  const rawRecords = readJson<unknown[]>(STORAGE_KEYS.history);
  const rawDoctors = readJson<unknown[]>(STORAGE_KEYS.customDoctors);

  const storedProvider = localStorage.getItem(STORAGE_KEYS.provider);
  // First visit with a build-time Gemini key: start on Gemini instead of offline.
  // Once the user has saved any provider choice, that choice is respected.
  let provider =
    storedProvider ?? (ENV_GEMINI_API_KEY ? 'gemini' : DEFAULT_SETTINGS.provider);
  // v1 stored a dormant 'mock' provider; it is now called 'offline'.
  if (provider === 'mock') provider = 'offline';
  if (provider !== 'gemini' && provider !== 'openai' && provider !== 'offline') {
    provider = 'offline';
  }

  // A key saved in Settings always wins over the build-time default.
  const apiKey =
    localStorage.getItem(STORAGE_KEYS.apiKey) ?? (provider === 'gemini' ? ENV_GEMINI_API_KEY : '');
  // A stored provider with no key can't work — fall back to the local engine.
  const effectiveProvider = provider !== 'offline' && !apiKey ? 'offline' : provider;

  return {
    records: Array.isArray(rawRecords)
      ? rawRecords.map(migrateRecord).filter((r): r is PatientRecord => r !== null)
      : [],
    customDoctors: Array.isArray(rawDoctors)
      ? rawDoctors.map(migrateDoctor).filter((d): d is Doctor => d !== null)
      : [],
    settings: {
      provider: effectiveProvider as Settings['provider'],
      apiKey,
      model: localStorage.getItem(STORAGE_KEYS.model) ?? DEFAULT_MODELS[effectiveProvider] ?? '',
    },
    location: localStorage.getItem(STORAGE_KEYS.location) ?? 'New York, NY',
  };
}

export function persistState(state: PersistedState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.records));
    localStorage.setItem(STORAGE_KEYS.customDoctors, JSON.stringify(state.customDoctors));
    localStorage.setItem(STORAGE_KEYS.provider, state.settings.provider);
    localStorage.setItem(STORAGE_KEYS.model, state.settings.model);
    localStorage.setItem(STORAGE_KEYS.location, state.location);
    if (state.settings.apiKey) {
      localStorage.setItem(STORAGE_KEYS.apiKey, state.settings.apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.apiKey);
    }
  } catch (err) {
    console.warn('Storage quota or error saving state:', err);
  }
}

/**
 * Clears patient data. The API key is preserved unless explicitly requested —
 * clearing records shouldn't force a credential re-entry.
 *
 * The original only removed `medipulse_history`, leaving saved custom doctors
 * behind after a "Clear All Data" that claimed to wipe everything.
 */
export function clearPersistedState(forgetApiKey: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.history);
  localStorage.removeItem(STORAGE_KEYS.customDoctors);
  localStorage.removeItem(STORAGE_KEYS.location);
  if (forgetApiKey) {
    localStorage.removeItem(STORAGE_KEYS.apiKey);
    localStorage.removeItem(STORAGE_KEYS.provider);
    localStorage.removeItem(STORAGE_KEYS.model);
  }
}
