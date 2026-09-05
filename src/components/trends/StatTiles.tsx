import clsx from 'clsx';
import { formatRange } from '../../lib/labStatus';
import type { TrendStats } from '../../types';

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'up' | 'down' | 'flat';
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={clsx(
          'mt-1 text-sm font-bold',
          tone === 'up' && 'text-rose-400',
          tone === 'down' && 'text-emerald-400',
          !tone && 'text-white',
          tone === 'flat' && 'text-slate-300',
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Ported from `updateTrendStats` (med.js:1042-1077). */
export function StatTiles({ stats }: { stats: TrendStats }) {
  const fmt = (n: number | null): string =>
    n === null ? '—' : `${n} ${stats.unit}`.trim();

  let deltaLabel = '—';
  let deltaTone: 'up' | 'down' | 'flat' | undefined;
  if (stats.delta !== null) {
    const rounded = Number.parseFloat(stats.delta.toFixed(2));
    if (rounded > 0) {
      deltaLabel = `▲ +${rounded} ${stats.unit}`.trim();
      deltaTone = 'up';
    } else if (rounded < 0) {
      deltaLabel = `▼ ${rounded} ${stats.unit}`.trim();
      deltaTone = 'down';
    } else {
      deltaLabel = '0 (no change)';
      deltaTone = 'flat';
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label="Baseline" value={fmt(stats.baseline)} />
      <Tile label="Latest" value={fmt(stats.latest)} />
      <Tile label="Change" value={deltaLabel} tone={deltaTone} />
      {/* The original printed the literal string "null - null" here. */}
      <Tile label="Reference range" value={formatRange(stats.min, stats.max, stats.unit)} />
    </div>
  );
}
