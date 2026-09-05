import clsx from 'clsx';
import type { LabStatus } from '../../types';
import { STATUS_STYLES } from './statusStyles';

export function StatusBadge({ status, className }: { status: LabStatus; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold',
        STATUS_STYLES[status].badge,
        className,
      )}
    >
      {status}
    </span>
  );
}
