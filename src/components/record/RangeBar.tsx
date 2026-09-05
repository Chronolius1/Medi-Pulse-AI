import clsx from 'clsx';
import { formatRange, rangePercent } from '../../lib/labStatus';
import type { LabResult } from '../../types';
import { STATUS_STYLES } from '../ui/statusStyles';

/**
 * Visual reference-range indicator. Ported from the inline markup in
 * `renderTable` (med.js:701-720).
 *
 * Two fixes: an unusable range (missing or zero-width bounds) rendered NaN
 * before, and the bar carried no accessible name at all — it was invisible to
 * screen readers.
 */
export function RangeBar({ lab }: { lab: LabResult }) {
  const percent = rangePercent(lab.value, lab.min, lab.max);

  if (percent === null) {
    return (
      <span className="text-[10px] italic text-slate-600">No reference range</span>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${lab.value} ${lab.unit}, ${lab.status.toLowerCase()}. Reference range ${formatRange(lab.min, lab.max, lab.unit)}.`}
      className="min-w-[100px]"
    >
      <div className="relative h-1.5 rounded-full bg-slate-800">
        <div className="absolute inset-y-0 left-[15%] right-[15%] rounded-full bg-emerald-900/60" />
        <span
          className={clsx(
            'absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-slate-950',
            STATUS_STYLES[lab.status].dot,
          )}
          style={{ left: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        {formatRange(lab.min, lab.max, lab.unit)}
      </p>
    </div>
  );
}
