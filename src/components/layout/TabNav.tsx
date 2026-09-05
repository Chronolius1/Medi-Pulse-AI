import clsx from 'clsx';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import { TABS } from './tabs';

/** Desktop pill nav. */
export function TabNav() {
  const { activeTab } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <nav
      aria-label="Workflow steps"
      className="hidden rounded-lg border border-slate-700 bg-slate-800 p-1 text-xs font-medium lg:flex"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => dispatch({ type: 'tab/set', tab: tab.id })}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          className={clsx(
            'rounded-md px-3 py-1.5 transition',
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white',
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

/** Mobile bottom bar — the original layout had no small-screen navigation. */
export function MobileTabBar() {
  const { activeTab } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <nav
      aria-label="Workflow steps"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-800 bg-slate-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'tab/set', tab: tab.id })}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition',
              active ? 'text-blue-400' : 'text-slate-500',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {tab.short}
          </button>
        );
      })}
    </nav>
  );
}
