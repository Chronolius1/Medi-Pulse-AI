import clsx from 'clsx';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import { buildComparisonRows } from '../../lib/trends';
import { EmptyState, Select } from '../ui';

/** Ported from `populateComparisonDropdowns` / `renderComparison` (med.js:1208-1269). */
export function ComparisonTable() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const recordA = state.records.find((r) => r.id === state.trends.compareA) ?? null;
  const recordB = state.records.find((r) => r.id === state.trends.compareB) ?? null;
  const rows = buildComparisonRows(recordA, recordB);

  if (state.records.length < 2) {
    return (
      <EmptyState
        title="Two visits are needed to compare"
        body="Process another report, or load the 3-visit demo, to see change over time."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {(['A', 'B'] as const).map((slot) => (
          <div key={slot}>
            <label
              htmlFor={`compare-${slot}`}
              className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
            >
              {slot === 'A' ? 'Baseline visit' : 'Comparison visit'}
            </label>
            <Select
              id={`compare-${slot}`}
              value={(slot === 'A' ? state.trends.compareA : state.trends.compareB) ?? ''}
              onChange={(e) =>
                dispatch({ type: 'trends/setCompare', slot, id: e.target.value })
              }
            >
              {state.records.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.date} ({record.id})
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <caption className="sr-only">Marker values compared between two visits</caption>
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wide text-slate-500">
              <th scope="col" className="p-2.5 font-semibold">Test marker</th>
              <th scope="col" className="p-2.5 font-semibold">Baseline</th>
              <th scope="col" className="p-2.5 font-semibold">Comparison</th>
              <th scope="col" className="p-2.5 font-semibold">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.testName} className="border-b border-slate-800/60 last:border-0">
                <th scope="row" className="p-2.5 text-xs font-semibold text-slate-200">
                  {row.testName}
                </th>
                <td className="p-2.5 text-xs text-slate-400">
                  {row.valueA === null ? '—' : `${row.valueA} ${row.unit}`}
                </td>
                <td className="p-2.5 text-xs text-slate-200">
                  {row.valueB === null ? '—' : `${row.valueB} ${row.unit}`}
                </td>
                <td
                  className={clsx(
                    'p-2.5 text-xs font-semibold',
                    row.delta === null && 'text-slate-600',
                    row.delta !== null && row.delta > 0 && 'text-rose-400',
                    row.delta !== null && row.delta < 0 && 'text-emerald-400',
                    row.delta === 0 && 'text-slate-400',
                  )}
                >
                  {row.delta === null
                    ? '—'
                    : row.delta > 0
                      ? `▲ +${row.delta}`
                      : row.delta < 0
                        ? `▼ ${row.delta}`
                        : 'No change'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
