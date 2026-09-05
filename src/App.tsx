import { Suspense, lazy, useState } from 'react';
import { ChatFab } from './components/chat/ChatFab';
import { IntakeTab } from './components/intake/IntakeTab';
import { Header } from './components/layout/Header';
import { MobileTabBar } from './components/layout/TabNav';
import { Skeleton } from './components/ui';
import { useAppState } from './hooks/useApp';

// Intake is the landing tab, so it ships in the entry chunk. Everything else —
// including Chart.js, react-markdown and the Radix dialog tree — loads on first
// use, keeping first paint small.
const RecordTab = lazy(() =>
  import('./components/record/RecordTab').then((m) => ({ default: m.RecordTab })),
);
const TrendsTab = lazy(() =>
  import('./components/trends/TrendsTab').then((m) => ({ default: m.TrendsTab })),
);
const FindCareTab = lazy(() =>
  import('./components/findcare/FindCareTab').then((m) => ({ default: m.FindCareTab })),
);
const ChatDrawer = lazy(() =>
  import('./components/chat/ChatDrawer').then((m) => ({ default: m.ChatDrawer })),
);
const SettingsModal = lazy(() =>
  import('./components/settings/SettingsModal').then((m) => ({ default: m.SettingsModal })),
);

function TabFallback() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/**
 * Tabs are mounted conditionally rather than hidden with CSS. The original used
 * `.tab-content { display: none }`, so Chart.js measured a 0x0 canvas on the
 * inactive Trends tab — hence the `setTimeout(renderTrendChart, 50)` hack at
 * med.js:451. Unmounting removes the problem instead of working around it.
 */
function ActiveTab() {
  const { activeTab } = useAppState();
  switch (activeTab) {
    case 'intake':
      return <IntakeTab />;
    case 'record':
      return <RecordTab />;
    case 'compare':
      return <TrendsTab />;
    case 'doctors':
      return <FindCareTab />;
    default:
      return null;
  }
}

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <main
        id="main"
        className="mx-auto w-full max-w-7xl flex-1 px-3 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10"
      >
        <Suspense fallback={<TabFallback />}>
          <ActiveTab />
        </Suspense>
      </main>

      <footer className="border-t border-slate-800 px-4 py-4 pb-24 text-center text-[10px] leading-relaxed text-slate-600 lg:pb-4">
        MediPulse AI Pro is a document synthesis tool, not a medical device. It does not
        provide diagnoses, prescribe medications, or alter dosages. All data stays in this
        browser.
      </footer>

      <MobileTabBar />

      {!chatOpen && <ChatFab onOpen={() => setChatOpen(true)} />}
      <Suspense fallback={null}>
        {chatOpen && <ChatDrawer open onClose={() => setChatOpen(false)} />}
        {settingsOpen && <SettingsModal open onOpenChange={setSettingsOpen} />}
      </Suspense>
    </div>
  );
}
