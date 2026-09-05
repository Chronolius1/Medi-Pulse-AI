import type { PresetKey } from '../data/presets';
import type {
  ApiProvider,
  AuditEntry,
  Doctor,
  IntakeData,
  LabStatusFilter,
  PatientRecord,
  Role,
  Settings,
  TabId,
} from '../types';

export type { PresetKey };

export interface SynthesisState {
  status: 'idle' | 'running' | 'error';
  message?: string;
}

export interface AppState {
  hydrated: boolean;
  activeTab: TabId;
  role: Role;
  settings: Settings;
  records: PatientRecord[];
  /**
   * Identity, not an object reference. The original aliased `currentRecord` to
   * an entry in `patientsHistory`, so mutating one silently mutated the other.
   */
  currentRecordId: string | null;
  intakeDraft: IntakeData;
  rawTextDraft: string;
  synthesis: SynthesisState;
  labFilter: { query: string; status: LabStatusFilter };
  trends: { activeMarker: string | null; compareA: string | null; compareB: string | null };
  doctors: { location: string; specialty: string; custom: Doctor[]; showSampleData: boolean };
  audit: AuditEntry[];
}

/** The subset of state written to localStorage. */
export interface PersistedState {
  records: PatientRecord[];
  settings: Settings;
  customDoctors: Doctor[];
  location: string;
}

export type Action =
  // lifecycle
  | { type: 'hydrate'; payload: Partial<PersistedState> }
  | { type: 'tab/set'; tab: TabId }
  // identity & config
  | { type: 'role/set'; role: Role }
  | { type: 'settings/update'; patch: Partial<Settings> }
  // intake
  | { type: 'intake/setField'; field: keyof IntakeData; value: string }
  | { type: 'intake/reset' }
  | { type: 'rawText/set'; text: string }
  | { type: 'rawText/appendManualMarker' }
  | { type: 'preset/load'; key: PresetKey }
  | { type: 'demo/loadHistorical' }
  | { type: 'pdf/extracted'; fileName: string; text: string }
  // synthesis
  | { type: 'synthesis/start'; provider: ApiProvider }
  | { type: 'synthesis/succeed'; record: PatientRecord }
  | { type: 'synthesis/fail'; message: string }
  | { type: 'synthesis/fellBack'; reason: string }
  // records
  | { type: 'record/select'; id: string }
  | { type: 'lab/edit'; recordId: string; labId: string; testName: string; value: number }
  | { type: 'labFilter/set'; patch: Partial<AppState['labFilter']> }
  // trends
  | { type: 'trends/setMarker'; marker: string }
  | { type: 'trends/setCompare'; slot: 'A' | 'B'; id: string }
  // find care
  | { type: 'doctors/setLocation'; location: string }
  | { type: 'doctors/setSpecialty'; specialty: string }
  | { type: 'doctors/toggleSampleData'; show: boolean }
  | { type: 'doctors/add'; doctor: Doctor }
  | { type: 'doctors/remove'; id: string }
  // destructive
  | { type: 'data/clearAll'; forgetApiKey: boolean }
  // non-state events still worth an audit line
  | { type: 'audit/log'; message: string };
