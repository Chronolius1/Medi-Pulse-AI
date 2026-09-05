import { Bookmark, FileText } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import { Card, EmptyState, SectionHeader, SkeletonList } from '../ui';

/** Ported from `renderVault` / `loadVaultRecord` (med.js:1271-1298). */
export function RecordVault() {
  const { records, currentRecordId, hydrated } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <Card className="space-y-3 p-4">
      <SectionHeader
        icon={<Bookmark className="h-4 w-4 text-blue-400" aria-hidden />}
        title="Local record vault"
        action={
          records.length > 0 ? (
            <span className="text-[10px] text-slate-500">{records.length} stored</span>
          ) : undefined
        }
      />

      {!hydrated ? (
        <SkeletonList rows={2} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" aria-hidden />}
          title="No records yet"
          body="Process a report and it will be saved here in this browser."
        />
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {records.map((record) => {
            const abnormal = record.labs.filter((l) => l.status !== 'Normal').length;
            const active = record.id === currentRecordId;
            return (
              <li key={record.id}>
                <button
                  onClick={() => dispatch({ type: 'record/select', id: record.id })}
                  aria-current={active ? 'true' : undefined}
                  className={clsx(
                    'w-full rounded-lg border p-2.5 text-left transition',
                    active
                      ? 'border-blue-600 bg-blue-950/40'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700',
                  )}
                >
                  <p className="text-xs font-semibold text-slate-200">{record.date}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {record.id} · {record.labs.length} marker
                    {record.labs.length === 1 ? '' : 's'}
                    {abnormal > 0 && (
                      <span className="text-rose-400"> · {abnormal} out of range</span>
                    )}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
