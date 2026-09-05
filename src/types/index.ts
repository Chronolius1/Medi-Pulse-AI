/** Status assigned to a lab value relative to its reference range. */
export type LabStatus = 'Normal' | 'High' | 'Low';

/** A single extracted laboratory marker. */
export interface LabResult {
  /**
   * Stable identity. The original app looked rows up by reference equality
   * (`findIndex(l => l === lab)`), which breaks the moment updates become
   * immutable — as they are here.
   */
  id: string;
  testName: string;
  value: number;
  /**
   * Reference bounds. Nullable: a marker can be extracted without a usable
   * range, and the original code rendered "null - null" in that case.
   */
  min: number | null;
  max: number | null;
  unit: string;
  status: LabStatus;
  /** Set when a clinician has manually corrected the value. */
  edited?: boolean;
}

/** Patient-reported context captured on the Intake tab. */
export interface IntakeData {
  age: string;
  sex: string;
  symptoms: string;
  conditions: string;
  allergies: string;
  medications: string;
}

/** One processed visit: intake + source text + extracted markers + synthesis. */
export interface PatientRecord {
  id: string;
  date: string;
  timestamp: string;
  intakeData: IntakeData;
  rawText: string;
  labs: LabResult[];
  /** AI-generated summary; null when the local engine produced the record. */
  summary: string | null;
  /** Normalised to [] rather than null so consumers never branch on nullability. */
  conflicts: string[];
  /** Human-readable name of the extraction engine that produced this record. */
  engine: string;
}

/** A specialist in the curated directory or the user's saved list. */
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  phone: string;
  rating?: string;
  distance?: string;
  address?: string;
  focus?: string;
  /** Curated entries are sample data; custom entries are user-supplied. */
  source: 'curated' | 'custom';
}

/** A clinical case preset loadable from the Intake tab. */
export interface ClinicalPreset extends IntakeData {
  report: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  /** Markdown. Rendered via react-markdown — never injected as HTML. */
  content: string;
  at: number;
}

export interface AuditEntry {
  id: string;
  at: number;
  role: Role;
  message: string;
}

/**
 * 'offline' forces the local regex parser and the rule-based assistant. It is
 * also the effective provider whenever no API key is stored.
 */
export type ApiProvider = 'gemini' | 'openai' | 'offline';

export interface Settings {
  provider: ApiProvider;
  apiKey: string;
  /** Model ids age out; keeping this configurable avoids a redeploy. */
  model: string;
}

export type Role = 'clinician' | 'patient';

export type TabId = 'intake' | 'record' | 'compare' | 'doctors';

export type LabStatusFilter = LabStatus | 'ALL';

/** Shape returned by the LLM extraction prompt. */
export interface AiExtractionResult {
  summary: string | null;
  conflicts: string[];
  labs: LabResult[];
}

/** A single point in a biomarker trajectory. */
export interface TrendPoint {
  date: string;
  value: number | null;
  status: LabStatus | null;
}

export interface TrendStats {
  baseline: number | null;
  latest: number | null;
  delta: number | null;
  unit: string;
  min: number | null;
  max: number | null;
}

export interface ComparisonRow {
  testName: string;
  unit: string;
  valueA: number | null;
  valueB: number | null;
  delta: number | null;
}

export interface CareRecommendation {
  specialties: string[];
  text: string;
  badge: string;
  tone: 'neutral' | 'normal' | 'matched';
}
