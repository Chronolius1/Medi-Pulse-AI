import type { IntakeData, LabResult, PatientRecord } from '../types';

/**
 * Offline rule-based assistant. Ported from `localChatResponse`
 * (med.js:1814-1882) with one important change: every branch now returns
 * MARKDOWN rather than raw HTML.
 *
 * The original built HTML strings that were injected with innerHTML, which is
 * what made the chat an XSS sink. Markdown is rendered through react-markdown
 * with raw HTML disabled, so model or user text can never become markup.
 */
export function localChatResponse(message: string, record: PatientRecord | null): string {
  const q = message.toLowerCase();
  const labs: LabResult[] = record?.labs ?? [];
  const abnormal = labs.filter((l) => l.status !== 'Normal');
  const intake: Partial<IntakeData> = record?.intakeData ?? {};

  const range = (l: LabResult): string =>
    l.min !== null && l.max !== null ? `normal range: ${l.min}–${l.max} ${l.unit}` : 'no reference range on file';

  // Abnormal labs
  if (
    q.includes('abnormal') ||
    q.includes('out of range') ||
    q.includes('high') ||
    q.includes('low') ||
    (q.includes('explain') && q.includes('lab'))
  ) {
    if (!record) {
      return "I don't have an active report to analyze. Please process a medical report in the Intake tab first.";
    }
    if (abnormal.length === 0) {
      return 'Great news — all your lab values fall within their normal reference ranges based on the processed report. Routine follow-up with your physician is still recommended.';
    }
    const items = abnormal
      .map((l) => `- **${l.testName}:** ${l.value} ${l.unit} (${l.status}; ${range(l)})`)
      .join('\n');
    return `Based on your most recent report, here are the out-of-range findings:\n\n${items}\n\nThese are *informational only*. Please discuss the clinical significance with your doctor.`;
  }

  // Specialist recommendation
  if (
    q.includes('specialist') ||
    q.includes('doctor') ||
    q.includes('refer') ||
    q.includes('who should')
  ) {
    if (abnormal.length === 0) {
      return 'With normal lab values, a visit to your **Primary Care physician** for a routine check-up is typically appropriate. They can guide any further referrals.';
    }
    const has = (...needles: string[]): boolean =>
      abnormal.some((l) => needles.some((n) => l.testName.toLowerCase().includes(n)));

    const lines: string[] = [];
    if (has('tsh', 'thyroid')) lines.push('- Endocrinologist (thyroid issues)');
    if (has('hemoglobin', 'ferritin', 'iron')) lines.push('- Hematologist (blood/anemia)');
    if (has('glucose', 'hba1c')) lines.push('- Endocrinologist (glucose/diabetes)');
    if (has('cholesterol', 'ldl')) lines.push('- Cardiologist (lipids)');
    lines.push('- Primary Care physician for overall coordination');

    return `Based on your out-of-range findings, the **Find Care** tab will show matched specialists in your area. Common recommendations include:\n\n${lines.join('\n')}\n\n*Always confirm referrals with your primary doctor.*`;
  }

  // Questions for the doctor
  if (q.includes('question') || q.includes('ask my doctor') || q.includes('appointment')) {
    const questions = [
      'What do these lab results mean for my overall health?',
      'Are there lifestyle changes I should make?',
      'Do I need follow-up tests or repeat labs?',
      'Are there any medication adjustments needed?',
      'When should I schedule my next check-up?',
    ];
    for (const l of abnormal) {
      questions.unshift(`What does ${l.testName} being ${l.status.toLowerCase()} mean specifically for me?`);
    }
    const items = questions.slice(0, 6).map((item) => `- ${item}`).join('\n');
    return `Here are suggested questions for your next appointment:\n\n${items}\n\nBringing a printed copy of your lab report can also help the conversation.`;
  }

  // Summary / overview
  if (q.includes('summary') || q.includes('overview') || q.includes('report')) {
    if (record?.summary) {
      return `**Clinical Summary:**\n\n${record.summary}\n\n*This is an automated synthesis — not a medical diagnosis.*`;
    }
    if (record) {
      return `Your report from **${record.date}** contains **${labs.length} lab markers** with **${abnormal.length} out-of-range values**. Open the Record tab to see the full breakdown.`;
    }
    return 'No report has been processed yet. Go to the Intake tab and select **Process Medical Record**.';
  }

  // Symptoms
  if (
    q.includes('symptom') ||
    q.includes('feel') ||
    q.includes('pain') ||
    q.includes('fatigue') ||
    q.includes('tired')
  ) {
    return `Your recorded symptoms are: **${intake.symptoms || 'not specified'}**. Lab results can sometimes correlate with symptoms — for example, fatigue may relate to anemia or thyroid issues. Always discuss symptom-lab correlations with your physician for proper context.`;
  }

  // Medications
  if (
    q.includes('medication') ||
    q.includes('drug') ||
    q.includes('dose') ||
    q.includes('prescription')
  ) {
    return `Your recorded medications are: **${intake.medications || 'not specified'}**.\n\n⚠️ I'm not able to advise on medication changes, dosages, or interactions. Please consult your prescribing physician or pharmacist for any medication-related questions.`;
  }

  // Greeting
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.length < 8) {
    return `Hello! I'm your **MediPulse AI Assistant**. I can help you:\n\n- Explain your lab results\n- Identify which specialist to see\n- Suggest questions for your doctor\n- Summarize your clinical report\n\nWhat would you like to know?`;
  }

  // Fallback
  const context = record
    ? `Your latest report (${record.date}) has ${abnormal.length} out-of-range value${abnormal.length === 1 ? '' : 's'}. `
    : '';
  return `I can help you understand your lab results, suggest specialists, or prepare questions for your doctor. ${context}Could you clarify what you'd like to know? For example: *"Explain my abnormal labs"* or *"What specialist should I see?"*`;
}
