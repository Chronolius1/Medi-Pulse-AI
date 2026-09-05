import { clinicalPresets } from '../data/presets';
import { historicalDemo } from '../data/historicalDemo';
import { createAuditId } from '../lib/ids';
import { deriveStatus } from '../lib/labStatus';
import type { AuditEntry, IntakeData } from '../types';
import { describeAction } from './describeAction';
import { DEFAULT_MODELS, DEFAULT_SETTINGS } from './persistence';
import type { Action, AppState } from './types';

const AUDIT_CAP = 200;

export const EMPTY_INTAKE: IntakeData = {
  age: '',
  sex: 'Female',
  symptoms: '',
  conditions: '',
  allergies: '',
  medications: '',
};

export const initialState: AppState = {
  hydrated: false,
  activeTab: 'intake',
  role: 'clinician',
  settings: DEFAULT_SETTINGS,
  records: [],
  currentRecordId: null,
  intakeDraft: EMPTY_INTAKE,
  rawTextDraft: '',
  synthesis: { status: 'idle' },
  labFilter: { query: '', status: 'ALL' },
  trends: { activeMarker: null, compareA: null, compareB: null },
  doctors: {
    location: 'New York, NY',
    specialty: 'ALL',
    custom: [],
    showSampleData: true,
  },
  audit: [],
};

/** Defaults the comparison selects to the two most recent visits. */
function defaultCompare(ids: string[]): { compareA: string | null; compareB: string | null } {
  if (ids.length === 0) return { compareA: null, compareB: null };
  if (ids.length === 1) return { compareA: ids[0]!, compareB: ids[0]! };
  return { compareA: ids[ids.length - 2]!, compareB: ids[ids.length - 1]! };
}

function withAudit(state: AppState, action: Action): AppState {
  const message = describeAction(action);
  if (!message) return state;
  const entry: AuditEntry = {
    id: createAuditId(),
    at: Date.now(),
    role: state.role,
    message,
  };
  return { ...state, audit: [entry, ...state.audit].slice(0, AUDIT_CAP) };
}

function baseReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate': {
      const records = action.payload.records ?? [];
      const latest = records[records.length - 1] ?? null;
      return {
        ...state,
        hydrated: true,
        records,
        currentRecordId: latest?.id ?? null,
        settings: action.payload.settings ?? state.settings,
        trends: { ...state.trends, ...defaultCompare(records.map((r) => r.id)) },
        doctors: {
          ...state.doctors,
          custom: action.payload.customDoctors ?? state.doctors.custom,
          location: action.payload.location ?? state.doctors.location,
        },
      };
    }

    case 'tab/set':
      return { ...state, activeTab: action.tab };

    case 'role/set':
      return { ...state, role: action.role };

    case 'settings/update': {
      const settings = { ...state.settings, ...action.patch };
      // Switching provider resets the model to that provider's default unless
      // the caller supplied one explicitly.
      if (action.patch.provider && action.patch.model === undefined) {
        settings.model = DEFAULT_MODELS[action.patch.provider] ?? '';
      }
      return { ...state, settings };
    }

    case 'intake/setField':
      return {
        ...state,
        intakeDraft: { ...state.intakeDraft, [action.field]: action.value },
      };

    case 'intake/reset':
      return { ...state, intakeDraft: EMPTY_INTAKE, rawTextDraft: '' };

    case 'rawText/set':
      return { ...state, rawTextDraft: action.text };

    case 'rawText/appendManualMarker':
      return {
        ...state,
        rawTextDraft: `${state.rawTextDraft}\n- Manual Marker: 0.0 mg/dL (Reference Range: 0.0 - 10.0 mg/dL)`,
      };

    case 'preset/load': {
      const preset = clinicalPresets[action.key];
      if (!preset) return state;
      const { report, ...intake } = preset;
      return { ...state, intakeDraft: intake, rawTextDraft: report };
    }

    case 'pdf/extracted':
      return { ...state, rawTextDraft: action.text };

    case 'demo/loadHistorical': {
      const records = historicalDemo.map((r) => ({ ...r }));
      const latest = records[records.length - 1]!;
      return {
        ...state,
        records,
        currentRecordId: latest.id,
        intakeDraft: { ...latest.intakeData },
        rawTextDraft: latest.rawText,
        activeTab: 'compare',
        trends: {
          activeMarker: 'Fasting Glucose',
          ...defaultCompare(records.map((r) => r.id)),
        },
      };
    }

    case 'synthesis/start':
      return { ...state, synthesis: { status: 'running' } };

    case 'synthesis/succeed': {
      const records = [...state.records, action.record];
      return {
        ...state,
        synthesis: { status: 'idle' },
        records,
        currentRecordId: action.record.id,
        activeTab: 'record',
        trends: { ...state.trends, ...defaultCompare(records.map((r) => r.id)) },
      };
    }

    case 'synthesis/fail':
      return { ...state, synthesis: { status: 'error', message: action.message } };

    case 'synthesis/fellBack':
      return state;

    case 'record/select':
      return { ...state, currentRecordId: action.id, activeTab: 'record' };

    case 'lab/edit': {
      const records = state.records.map((record) => {
        if (record.id !== action.recordId) return record;
        return {
          ...record,
          labs: record.labs.map((lab) =>
            lab.id === action.labId
              ? {
                  ...lab,
                  testName: action.testName,
                  value: action.value,
                  status: deriveStatus(action.value, lab.min, lab.max),
                  edited: true,
                }
              : lab,
          ),
        };
      });
      return { ...state, records };
    }

    case 'labFilter/set':
      return { ...state, labFilter: { ...state.labFilter, ...action.patch } };

    case 'trends/setMarker':
      return { ...state, trends: { ...state.trends, activeMarker: action.marker } };

    case 'trends/setCompare':
      return {
        ...state,
        trends: {
          ...state.trends,
          [action.slot === 'A' ? 'compareA' : 'compareB']: action.id,
        },
      };

    case 'doctors/setLocation':
      return { ...state, doctors: { ...state.doctors, location: action.location } };

    case 'doctors/setSpecialty':
      return { ...state, doctors: { ...state.doctors, specialty: action.specialty } };

    case 'doctors/toggleSampleData':
      return { ...state, doctors: { ...state.doctors, showSampleData: action.show } };

    case 'doctors/add':
      return {
        ...state,
        doctors: { ...state.doctors, custom: [...state.doctors.custom, action.doctor] },
      };

    case 'doctors/remove':
      return {
        ...state,
        doctors: {
          ...state.doctors,
          custom: state.doctors.custom.filter((d) => d.id !== action.id),
        },
      };

    case 'data/clearAll':
      return {
        ...initialState,
        hydrated: true,
        role: state.role,
        // Keep the credential unless the user explicitly asked to forget it.
        settings: action.forgetApiKey ? DEFAULT_SETTINGS : state.settings,
        doctors: {
          ...initialState.doctors,
          location: state.doctors.location,
          showSampleData: state.doctors.showSampleData,
        },
      };

    case 'audit/log':
      return state;

    default:
      return state;
  }
}

export function appReducer(state: AppState, action: Action): AppState {
  return withAudit(baseReducer(state, action), action);
}
