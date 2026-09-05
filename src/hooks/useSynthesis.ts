import { useCallback } from 'react';
import { callAiExtraction, engineLabel } from '../lib/aiExtraction';
import { createRecordId } from '../lib/ids';
import { localRegexParser } from '../lib/regexParser';
import { buildHeuristicConflicts } from '../lib/summary';
import { selectEffectiveProvider } from '../state/selectors';
import type { PatientRecord } from '../types';
import { useAppDispatch, useAppState } from './useApp';
import { useToast } from './useToast';

/**
 * Orchestrates a synthesis run. Ported from `processSynthesis`
 * (med.js:550-638), preserving the central behaviour: an AI failure never
 * dead-ends, it degrades to the local regex engine and says so.
 */
export function useSynthesis() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const run = useCallback(async () => {
    const rawText = state.rawTextDraft.trim();
    if (!rawText) {
      toast.error('Nothing to process', 'Paste a lab report or upload a PDF first.');
      return;
    }

    const provider = selectEffectiveProvider(state);
    const intake = state.intakeDraft;

    dispatch({ type: 'synthesis/start', provider });

    let labs = [];
    let summary: string | null = null;
    let conflicts: string[] | null = null;
    let engine = 'Local Regex Engine';

    if (provider === 'offline') {
      labs = localRegexParser(rawText);
    } else {
      try {
        const result = await callAiExtraction(rawText, intake, state.settings);
        labs = result.labs;
        summary = result.summary;
        conflicts = result.conflicts;
        engine = engineLabel(provider, state.settings.model);
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'Unknown error.';
        dispatch({ type: 'synthesis/fellBack', reason: `AI extraction error (${reason}).` });
        toast.error('AI extraction failed — used the local engine instead', reason);
        labs = localRegexParser(rawText);
        engine = 'Local Regex Engine (AI Fallback)';
      }
    }

    if (labs.length === 0) {
      dispatch({
        type: 'synthesis/fail',
        message: 'No laboratory entities could be extracted.',
      });
      toast.error(
        'No markers extracted',
        'Check that each result is on its own line, e.g. "- Hemoglobin: 8.5 g/dL (Reference Range: 12.0 - 15.5 g/dL)".',
      );
      return;
    }

    const now = new Date();
    const record: PatientRecord = {
      id: createRecordId(),
      date: now.toISOString().split('T')[0]!,
      timestamp: now.toLocaleTimeString(),
      intakeData: intake,
      rawText,
      labs,
      summary,
      conflicts: conflicts ?? buildHeuristicConflicts(intake, labs),
      engine,
    };

    dispatch({ type: 'synthesis/succeed', record });
    toast.success(
      `Extracted ${labs.length} marker${labs.length === 1 ? '' : 's'}`,
      `Processed with the ${engine}.`,
    );
  }, [state, dispatch, toast]);

  return { run, status: state.synthesis.status };
}
