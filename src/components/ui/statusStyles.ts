import type { LabStatus } from '../../types';

/**
 * Single definition of the status colour triad. The original repeated this map
 * in four places (the table renderer, the chart point colours, the PDF export
 * and the care banner), which is how they drifted apart.
 */
export const STATUS_STYLES: Record<LabStatus, { badge: string; dot: string; hex: string }> = {
  Normal: {
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    dot: 'bg-emerald-400',
    hex: '#34d399',
  },
  Low: {
    badge: 'bg-amber-950 text-amber-300 border-amber-800',
    dot: 'bg-amber-400',
    hex: '#fbbf24',
  },
  High: {
    badge: 'bg-rose-950 text-rose-300 border-rose-800',
    dot: 'bg-rose-400',
    hex: '#f87171',
  },
};
