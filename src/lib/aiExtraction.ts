import type { AiExtractionResult, ApiProvider, IntakeData, LabResult, Settings } from '../types';
import { createLabId } from './ids';
import { deriveStatus } from './labStatus';

const SYSTEM_PROMPT = `You are an expert clinical laboratory data extraction engine.
Given patient clinical intake details and raw medical laboratory report text, extract structured laboratory entities, an executive non-diagnostic clinical summary, and any potential medical conflicts.

Return STRICT JSON matching this exact structure:
{
  "summary": "Non-diagnostic clinical overview summarizing the patient findings concisely.",
  "conflicts": ["List of clinical conflicts or warnings, e.g. out-of-range lab findings that do not match stated medical history"],
  "labs": [
    {
      "testName": "Name of test (e.g. Hemoglobin, Fasting Glucose)",
      "value": 12.5,
      "unit": "unit string (e.g. g/dL, mg/dL, mIU/L)",
      "min": 10.0,
      "max": 15.0,
      "status": "Normal"
    }
  ]
}
Each lab entity's 'status' MUST be one of: "Normal", "High", or "Low" based on the reference range. 'value', 'min', and 'max' MUST be numeric floats.`;

function buildUserPrompt(rawText: string, intake: IntakeData): string {
  return `PATIENT INTAKE DATA:
Age: ${intake.age}
Biological Sex: ${intake.sex}
Reported Symptoms: ${intake.symptoms}
Known Conditions: ${intake.conditions}
Allergies: ${intake.allergies}
Current Medications: ${intake.medications}

LABORATORY REPORT TEXT:
${rawText}`;
}

export class AiExtractionError extends Error {}

function toNullableNumber(v: unknown): number | null {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

/**
 * Normalises whatever the model returned into LabResult[]. Models routinely
 * return numbers as strings, omit bounds, or invent a status that contradicts
 * the range — status is always recomputed from the range when one is present.
 */
function normaliseLabs(raw: unknown): LabResult[] {
  if (!Array.isArray(raw)) return [];
  const labs: LabResult[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const l = item as Record<string, unknown>;
    const value = toNullableNumber(l.value);
    if (typeof l.testName !== 'string' || !l.testName || value === null) continue;

    const min = toNullableNumber(l.min);
    const max = toNullableNumber(l.max);
    const claimed = l.status;
    const status =
      min !== null || max !== null
        ? deriveStatus(value, min, max)
        : claimed === 'High' || claimed === 'Low' || claimed === 'Normal'
          ? claimed
          : 'Normal';

    labs.push({
      id: createLabId(),
      testName: l.testName,
      value,
      min,
      max,
      unit: typeof l.unit === 'string' ? l.unit : '',
      status,
    });
  }

  return labs;
}

function parseJsonResponse(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    // Models sometimes wrap JSON in prose or a ```json fence.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new AiExtractionError('Model did not return parseable JSON.');
    return JSON.parse(match[0]) as Record<string, unknown>;
  }
}

async function callOpenAi(
  rawText: string,
  intake: IntakeData,
  settings: Settings,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(rawText, intake) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new AiExtractionError(err.error?.message ?? `OpenAI API returned HTTP ${response.status}`);
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new AiExtractionError('OpenAI returned an empty response.');
  return content;
}

async function callGemini(
  rawText: string,
  intake: IntakeData,
  settings: Settings,
  signal?: AbortSignal,
): Promise<string> {
  const model = settings.model || 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(endpoint, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': settings.apiKey.trim(),
    },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(rawText, intake)}` }] },
      ],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new AiExtractionError(err.error?.message ?? `Gemini API returned HTTP ${response.status}`);
  }

  const json = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new AiExtractionError('Gemini returned an empty response.');
  return content;
}

/**
 * Structured extraction via an LLM. Ported from `callAIExtraction`
 * (med.js:460-548) — with the hardcoded API key removed. The key now comes
 * from user-supplied settings and this is never called when it is absent.
 */
export async function callAiExtraction(
  rawText: string,
  intake: IntakeData,
  settings: Settings,
  signal?: AbortSignal,
): Promise<AiExtractionResult> {
  const provider: ApiProvider = settings.provider;
  if (provider === 'offline') {
    throw new AiExtractionError('Offline mode is active; no AI call was attempted.');
  }
  if (!settings.apiKey.trim()) {
    throw new AiExtractionError('No API key configured.');
  }

  const text =
    provider === 'openai'
      ? await callOpenAi(rawText, intake, settings, signal)
      : await callGemini(rawText, intake, settings, signal);

  const parsed = parseJsonResponse(text);
  const labs = normaliseLabs(parsed.labs);
  if (labs.length === 0) {
    throw new AiExtractionError('AI returned an empty laboratory array.');
  }

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : null,
    conflicts: Array.isArray(parsed.conflicts)
      ? parsed.conflicts.filter((c): c is string => typeof c === 'string')
      : [],
    labs,
  };
}

/** Human-readable engine name recorded on each processed record. */
export function engineLabel(provider: ApiProvider, model: string): string {
  if (provider === 'openai') return `OpenAI ${model || 'gpt-4o-mini'}`;
  if (provider === 'gemini') return `Google ${model || 'gemini-2.0-flash'}`;
  return 'Local Regex Engine';
}
