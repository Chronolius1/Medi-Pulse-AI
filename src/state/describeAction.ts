import type { Action } from './types';

/**
 * Derives the audit-log line for an action, or null when the action isn't
 * audit-worthy.
 *
 * The original called `logAudit()` by hand at 14 call sites adjacent to state
 * mutations, so it was possible (and did happen) to change state without an
 * audit entry. Deriving the log from the action stream makes that structurally
 * impossible — the right property for a clinical records tool.
 */
export function describeAction(action: Action): string | null {
  switch (action.type) {
    case 'role/set':
      return `Role switched to: ${action.role.toUpperCase()}`;
    case 'settings/update':
      return action.patch.provider
        ? `AI provider set to: ${action.patch.provider.toUpperCase()}`
        : action.patch.apiKey !== undefined
          ? action.patch.apiKey
            ? 'API key updated.'
            : 'API key cleared.'
          : null;
    case 'preset/load':
      return `Loaded ${action.key.toUpperCase()} preset case.`;
    case 'demo/loadHistorical':
      return 'Loaded 3-Visit Longitudinal Trend Demo dataset.';
    case 'pdf/extracted':
      return `Extracted text from uploaded PDF file: ${action.fileName}`;
    case 'synthesis/succeed':
      return `Processed record ${action.record.id} with ${action.record.labs.length} entities using ${action.record.engine}.`;
    case 'synthesis/fail':
      return `Synthesis failed: ${action.message}`;
    case 'synthesis/fellBack':
      return `[Fallback Alert] ${action.reason} Switched to Local Regex Engine.`;
    case 'record/select':
      return `Loaded record ${action.id} from vault.`;
    case 'lab/edit':
      return `Edited ${action.testName} to ${action.value}`;
    case 'doctors/add':
      return `Saved custom provider: ${action.doctor.name}`;
    case 'doctors/remove':
      return 'Removed a saved provider.';
    case 'data/clearAll':
      return action.forgetApiKey
        ? 'All patient data and the stored API key were cleared by the user.'
        : 'All patient data cleared by user.';
    case 'audit/log':
      return action.message;
    default:
      return null;
  }
}
