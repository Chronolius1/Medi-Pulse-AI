import { Plus, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import { useSynthesis } from '../../hooks/useSynthesis';
import { selectEffectiveProvider } from '../../state/selectors';
import { ClinicianOnly } from '../layout/ClinicianOnly';
import { Button, Card, SectionHeader, Textarea } from '../ui';
import { IntakeForm } from './IntakeForm';
import { PdfDropZone } from './PdfDropZone';
import { PresetBar } from './PresetBar';
import { RecordVault } from './RecordVault';

/** Truthful button label — the original always claimed Gemini was in use. */
function synthesisLabel(state: ReturnType<typeof useAppState>, running: boolean): string {
  if (!running) return 'Process medical record';
  const provider = selectEffectiveProvider(state);
  if (provider === 'offline') return 'Parsing locally…';
  const model =
    state.settings.model || (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash');
  return `Processing with ${model}…`;
}

export function IntakeTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { run, status } = useSynthesis();
  const running = status === 'running';

  return (
    <div className="space-y-5">
      <PresetBar />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="min-w-0 space-y-5 lg:col-span-4">
          <IntakeForm />
          <RecordVault />
        </div>

        <div className="min-w-0 space-y-4 lg:col-span-8">
          <Card className="space-y-4 p-4">
            <SectionHeader
              icon={<Sparkles className="h-4 w-4 text-blue-400" aria-hidden />}
              title="Laboratory report"
            />

            <PdfDropZone />

            <div>
              <label
                htmlFor="raw-report-text"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >
                Report text
              </label>
              <Textarea
                id="raw-report-text"
                rows={9}
                spellCheck={false}
                value={state.rawTextDraft}
                onChange={(e) => dispatch({ type: 'rawText/set', text: e.target.value })}
                placeholder={
                  'Paste the report, one marker per line:\n- Hemoglobin: 8.5 g/dL (Reference Range: 12.0 - 15.5 g/dL)'
                }
                className="font-mono text-xs"
              />
              <p className="mt-1 text-right text-[10px] text-slate-600">
                {state.rawTextDraft.length.toLocaleString()} characters
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <ClinicianOnly>
                <Button
                  size="lg"
                  className="sm:w-1/3"
                  icon={<Plus className="h-4 w-4" aria-hidden />}
                  onClick={() => dispatch({ type: 'rawText/appendManualMarker' })}
                >
                  Add manual marker
                </Button>
              </ClinicianOnly>
              <Button
                size="lg"
                variant="primary"
                loading={running}
                disabled={!state.rawTextDraft.trim()}
                onClick={() => void run()}
                icon={running ? undefined : <Sparkles className="h-4 w-4" aria-hidden />}
                className="flex-1"
              >
                {synthesisLabel(state, running)}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
