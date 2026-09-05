import { useEffect, useState } from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import { DEFAULT_MODELS } from '../../state/persistence';
import type { ApiProvider, Role } from '../../types';
import { Button, Field, Input, Modal, Select } from '../ui';

const PROVIDERS: { id: ApiProvider; name: string; blurb: string }[] = [
  {
    id: 'offline',
    name: 'Offline / local only',
    blurb:
      'No network calls. Uses the built-in regex parser and rule-based assistant. Fully functional.',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    blurb: 'Structured extraction and chat via the Gemini API. Requires your own key.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    blurb: 'Structured extraction and chat via the OpenAI API. Requires your own key.',
  },
];

export function SettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { settings, role } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [provider, setProvider] = useState<ApiProvider>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (open) {
      setProvider(settings.provider);
      setApiKey(settings.apiKey);
      setModel(settings.model);
      setReveal(false);
    }
  }, [open, settings]);

  const needsKey = provider !== 'offline';
  const canSave = !needsKey || apiKey.trim().length > 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="AI provider settings"
      description="MediPulse ships with no API key. Bring your own, or stay offline."
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!canSave}
            onClick={() => {
              dispatch({
                type: 'settings/update',
                patch: {
                  provider,
                  apiKey: needsKey ? apiKey.trim() : '',
                  model: needsKey ? model.trim() || DEFAULT_MODELS[provider] || '' : '',
                },
              });
              toast.success(
                'Settings saved',
                provider === 'offline'
                  ? 'Using the local engine.'
                  : `Using ${provider} for extraction and chat.`,
              );
              onOpenChange(false);
            }}
          >
            Save settings
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Also exposed here, not just in the header: the header control is
            hidden below `sm`, so this is the only way to switch role on a
            phone. */}
        <Field
          label="View mode"
          hint="Patient view hides clinician-only controls. It is a UI affordance, not a security boundary."
        >
          {(props) => (
            <Select
              {...props}
              value={role}
              onChange={(e) =>
                dispatch({ type: 'role/set', role: e.target.value as Role })
              }
            >
              <option value="clinician">Clinician (full access)</option>
              <option value="patient">Patient (view only)</option>
            </Select>
          )}
        </Field>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Provider
          </legend>
          {PROVIDERS.map((option) => (
            <label
              key={option.id}
              className={clsx(
                'flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition',
                provider === option.id
                  ? 'border-blue-600 bg-blue-950/30'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700',
              )}
            >
              <input
                type="radio"
                name="ai-provider"
                value={option.id}
                checked={provider === option.id}
                onChange={() => {
                  setProvider(option.id);
                  if (!model) setModel(DEFAULT_MODELS[option.id] ?? '');
                }}
                className="mt-0.5 accent-blue-600"
              />
              <span>
                <span className="block text-xs font-semibold text-slate-100">
                  {option.name}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                  {option.blurb}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <Field
          label="API key"
          hint={
            needsKey
              ? 'Sent directly from your browser to the provider.'
              : 'Not needed in offline mode.'
          }
        >
          {(props) => (
            <div className="relative">
              <Input
                {...props}
                type={reveal ? 'text' : 'password'}
                value={apiKey}
                disabled={!needsKey}
                autoComplete="off"
                spellCheck={false}
                placeholder={needsKey ? 'Paste your key' : '—'}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-9"
              />
              {needsKey && (
                <button
                  type="button"
                  onClick={() => setReveal((r) => !r)}
                  aria-label={reveal ? 'Hide API key' : 'Show API key'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:text-slate-300"
                >
                  {reveal ? (
                    <EyeOff className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                  )}
                </button>
              )}
            </div>
          )}
        </Field>

        <Field label="Model" hint="Override if the default has been deprecated.">
          {(props) => (
            <Input
              {...props}
              value={model}
              disabled={!needsKey}
              spellCheck={false}
              placeholder={DEFAULT_MODELS[provider] || '—'}
              onChange={(e) => setModel(e.target.value)}
            />
          )}
        </Field>

        {needsKey && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-900/60 bg-amber-950/30 p-2.5 text-[11px] leading-relaxed text-amber-300">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              Your key is stored in this browser&apos;s <code>localStorage</code> and sent
              directly to the provider — never to a MediPulse server. Anyone with access to
              this browser profile can read it. On a shared machine, clear it when you are
              done.
            </span>
          </p>
        )}

        {settings.apiKey && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setApiKey('');
              setProvider('offline');
              dispatch({
                type: 'settings/update',
                patch: { provider: 'offline', apiKey: '', model: '' },
              });
              toast.success('API key forgotten', 'Switched to the local engine.');
            }}
          >
            Forget stored key
          </Button>
        )}
      </div>
    </Modal>
  );
}
