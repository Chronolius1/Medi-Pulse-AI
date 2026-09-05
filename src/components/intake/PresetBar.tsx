import { RotateCcw, Sparkles, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { presetLabels } from '../../data/presets';
import { useAppDispatch } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import { clearPersistedState } from '../../state/persistence';
import { ClinicianOnly } from '../layout/ClinicianOnly';
import { Button, Card, ConfirmModal, SectionHeader } from '../ui';

export function PresetBar() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [forgetKey, setForgetKey] = useState(false);

  return (
    <Card className="space-y-3 p-4">
      <SectionHeader
        icon={<Sparkles className="h-4 w-4 text-blue-400" aria-hidden />}
        title="Demo presets"
      />
      <p className="text-[11px] text-slate-500">
        Load a sample case to see the full pipeline without uploading anything.
      </p>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
        {presetLabels.map((preset) => (
          <Button
            key={preset.key}
            size="sm"
            className="shrink-0"
            onClick={() => {
              dispatch({ type: 'preset/load', key: preset.key });
              toast.info(`Loaded the ${preset.label} case`);
            }}
          >
            {preset.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="primary"
          className="shrink-0"
          icon={<TrendingUp className="h-3.5 w-3.5" aria-hidden />}
          onClick={() => {
            dispatch({ type: 'demo/loadHistorical' });
            toast.info('Loaded the 3-visit longitudinal demo', 'Opening the Trends tab.');
          }}
        >
          3-Visit Trend Demo
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-3">
        <Button
          size="sm"
          variant="ghost"
          icon={<RotateCcw className="h-3.5 w-3.5" aria-hidden />}
          onClick={() => dispatch({ type: 'intake/reset' })}
        >
          Reset form
        </Button>
        <ClinicianOnly>
          <Button
            size="sm"
            variant="ghost"
            className="text-rose-400 hover:bg-rose-950 hover:text-rose-300"
            icon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
            onClick={() => setConfirmOpen(true)}
          >
            Clear all data
          </Button>
        </ClinicianOnly>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Clear all patient data?"
        description="This permanently deletes every processed record, the audit log and your saved providers from this browser. It cannot be undone."
        confirmLabel="Delete everything"
        onConfirm={() => {
          clearPersistedState(forgetKey);
          dispatch({ type: 'data/clearAll', forgetApiKey: forgetKey });
          toast.success('All patient data cleared');
          setForgetKey(false);
        }}
        extra={
          <label className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={forgetKey}
              onChange={(e) => setForgetKey(e.target.checked)}
              className="mt-0.5 accent-blue-600"
            />
            <span>
              Also forget my stored API key. Leave this unchecked to keep using the same
              provider after the wipe.
            </span>
          </label>
        }
      />
    </Card>
  );
}
