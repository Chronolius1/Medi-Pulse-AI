import type { ChatMessage, PatientRecord, Settings } from '../types';

export class ChatAiError extends Error {}

/** Builds the clinical context block injected into the system prompt. */
export function buildPatientContext(record: PatientRecord | null): string {
  if (!record) return 'No medical report has been processed yet.';

  const intake = record.intakeData;
  const abnormal = record.labs.filter((l) => l.status !== 'Normal');
  const findings =
    abnormal.length > 0
      ? abnormal
          .map((l) => {
            const range = l.min !== null && l.max !== null ? `; normal ${l.min}-${l.max}` : '';
            return `${l.testName} ${l.value}${l.unit} (${l.status}${range})`;
          })
          .join(', ')
      : 'None — all values normal';

  return `Patient: ${intake.age}Y ${intake.sex}. Symptoms: ${intake.symptoms}. Conditions: ${intake.conditions}. Medications: ${intake.medications}.
Out-of-range findings: ${findings}.
Clinical summary: ${record.summary ?? 'Not available.'}`;
}

function buildSystemPrompt(record: PatientRecord | null): string {
  return `You are MediPulse AI, a non-diagnostic clinical synthesis assistant. You help patients and clinicians understand lab results, explain what values mean, and suggest questions to discuss with their doctor.

IMPORTANT RULES:
- You are NOT a doctor and do NOT provide diagnoses, prescriptions, or dosage changes.
- Always remind the user to consult a qualified physician for medical decisions.
- Be concise, warm, and clear. Format key points as markdown bullet lists when helpful.
- Respond in plain markdown only. Never emit raw HTML.
- Use patient-friendly language unless context indicates a clinician.

Current patient context:
${buildPatientContext(record)}`;
}

/**
 * Context-aware chat completion. Ported from `callChatAI` (med.js:1735-1800).
 * Returns markdown, which the UI renders through react-markdown.
 */
export async function callChatAi(
  userMessage: string,
  history: ChatMessage[],
  record: PatientRecord | null,
  settings: Settings,
  signal?: AbortSignal,
): Promise<string> {
  if (settings.provider === 'offline' || !settings.apiKey.trim()) {
    throw new ChatAiError('No AI provider configured.');
  }

  const systemPrompt = buildSystemPrompt(record);

  if (settings.provider === 'openai') {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: settings.model || 'gpt-4o-mini',
        messages,
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    if (!response.ok) throw new ChatAiError(`OpenAI HTTP ${response.status}`);
    const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new ChatAiError('OpenAI returned an empty response.');
    return content;
  }

  const model = settings.model || 'gemini-2.0-flash';
  const transcript = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
  const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${transcript}\n\nUser: ${userMessage}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': settings.apiKey.trim(),
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
      }),
    },
  );

  if (!response.ok) throw new ChatAiError(`Gemini HTTP ${response.status}`);
  const json = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new ChatAiError('Gemini returned an empty response.');
  return content;
}
