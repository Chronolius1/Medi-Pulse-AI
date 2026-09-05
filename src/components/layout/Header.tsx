import { Activity, Settings as SettingsIcon, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import { selectEffectiveProvider } from '../../state/selectors';
import type { Role } from '../../types';
import { Select } from '../ui/Field';
import { TabNav } from './TabNav';

/** Truthful provider label — the original always read "API: Gemini (Active)". */
function providerLabel(state: ReturnType<typeof useAppState>): {
  text: string;
  live: boolean;
} {
  const effective = selectEffectiveProvider(state);
  const { provider } = state.settings;

  if (effective === 'offline') {
    return provider === 'offline'
      ? { text: 'Offline · local engine', live: false }
      : { text: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} · no key`, live: false };
  }
  return {
    text: `${effective === 'openai' ? 'OpenAI' : 'Gemini'} · key set`,
    live: true,
  };
}

export function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const label = providerLabel(state);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-500/20">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-none text-white sm:text-lg">
              MediPulse AI Pro
            </h1>
            <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
              Structured Medical Synthesis Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 transition hover:bg-slate-700"
            aria-label={`AI provider settings. Current: ${label.text}`}
          >
            <Zap
              className={clsx('h-3.5 w-3.5', label.live ? 'text-emerald-400' : 'text-slate-500')}
              aria-hidden
            />
            <span className="hidden md:inline">{label.text}</span>
            <SettingsIcon className="h-3.5 w-3.5 md:hidden" aria-hidden />
          </button>

          <div className="hidden items-center gap-1.5 sm:flex">
            <label htmlFor="role-selector" className="text-[11px] text-slate-400">
              Role
            </label>
            <Select
              id="role-selector"
              value={state.role}
              onChange={(e) => dispatch({ type: 'role/set', role: e.target.value as Role })}
              className="w-auto px-2 py-1 text-xs"
            >
              <option value="clinician">Clinician (full access)</option>
              <option value="patient">Patient (view only)</option>
            </Select>
          </div>

          <TabNav />
        </div>
      </div>
    </header>
  );
}
