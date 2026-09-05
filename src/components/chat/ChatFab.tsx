import { MessageCircle } from 'lucide-react';
import { useAppState } from '../../hooks/useApp';
import { selectCurrentRecord } from '../../state/selectors';

/**
 * Kept in its own module so the entry chunk does not pull in the drawer's
 * markdown renderer just to draw a button.
 */
export function ChatFab({ onOpen }: { onOpen: () => void }) {
  const state = useAppState();
  const hasRecord = selectCurrentRecord(state) !== null;

  return (
    <button
      onClick={onOpen}
      aria-label="Open the MediPulse assistant"
      className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 active:scale-95 lg:bottom-6"
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
      {hasRecord && (
        <span
          className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400 motion-safe:animate-pulse-glow"
          aria-hidden
        />
      )}
    </button>
  );
}
