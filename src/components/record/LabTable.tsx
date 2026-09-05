import { Pencil, Search, TableProperties } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import { selectCurrentRecord, selectFilteredLabs } from '../../state/selectors';
import type { LabResult, LabStatusFilter } from '../../types';
import { ClinicianOnly } from '../layout/ClinicianOnly';
import { Button, Card, EmptyState, Input, SectionHeader, Select, StatusBadge } from '../ui';
import { EditLabModal } from './EditLabModal';
import { RangeBar } from './RangeBar';

export function LabTable({ actions }: { actions?: React.ReactNode }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const record = selectCurrentRecord(state);
  // Derived, not imperatively re-rendered: the original left stale rows on
  // screen whenever there was no current record.
  const labs = selectFilteredLabs(state);
  const [editing, setEditing] = useState<LabResult | null>(null);

  const isClinician = state.role === 'clinician';
  const total = record?.labs.length ?? 0;

  return (
    <Card className="overflow-hidden">
      <div className="space-y-3 border-b border-slate-800 p-4">
        <SectionHeader
          icon={<TableProperties className="h-4 w-4 text-blue-400" aria-hidden />}
          title="Extracted lab findings"
          action={actions}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <Input
              type="search"
              aria-label="Search markers by name"
              placeholder="Search markers…"
              value={state.labFilter.query}
              onChange={(e) =>
                dispatch({ type: 'labFilter/set', patch: { query: e.target.value } })
              }
              className="pl-8"
            />
          </div>
          <Select
            aria-label="Filter by status"
            value={state.labFilter.status}
            onChange={(e) =>
              dispatch({
                type: 'labFilter/set',
                patch: { status: e.target.value as LabStatusFilter },
              })
            }
            className="sm:w-40"
          >
            <option value="ALL">All statuses</option>
            <option value="High">High only</option>
            <option value="Low">Low only</option>
            <option value="Normal">Normal only</option>
          </Select>
        </div>
      </div>

      {labs.length === 0 ? (
        <EmptyState
          icon={<TableProperties className="h-6 w-6" aria-hidden />}
          title={total === 0 ? 'No markers extracted' : 'No markers match this filter'}
          body={
            total === 0
              ? 'Process a report in the Intake tab to populate this table.'
              : 'Try clearing the search box or selecting a different status.'
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <caption className="sr-only">
              Extracted laboratory markers with values, reference ranges and status
            </caption>
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="p-3 font-semibold">Test name</th>
                <th scope="col" className="p-3 font-semibold">Result</th>
                <th scope="col" className="p-3 font-semibold">Reference range</th>
                <th scope="col" className="p-3 font-semibold">Status</th>
                {isClinician && (
                  <th scope="col" className="p-3 font-semibold">Edit</th>
                )}
              </tr>
            </thead>
            <tbody>
              {labs.map((lab) => (
                <tr
                  key={lab.id}
                  className="border-b border-slate-800/60 transition last:border-0 hover:bg-slate-800/30"
                >
                  <th scope="row" className="p-3 text-xs font-semibold text-slate-200">
                    {lab.testName}
                    {lab.edited && (
                      <span className="ml-1.5 rounded bg-slate-800 px-1 py-0.5 text-[9px] font-medium text-slate-400">
                        edited
                      </span>
                    )}
                  </th>
                  <td className="whitespace-nowrap p-3 text-xs font-bold text-white">
                    {lab.value} <span className="font-normal text-slate-400">{lab.unit}</span>
                  </td>
                  <td className="p-3">
                    <RangeBar lab={lab} />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={lab.status} />
                  </td>
                  {isClinician && (
                    <td className="p-3">
                      <ClinicianOnly>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditing(lab)}
                          aria-label={`Correct ${lab.testName}`}
                          icon={<Pencil className="h-3 w-3" aria-hidden />}
                        >
                          Edit
                        </Button>
                      </ClinicianOnly>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditLabModal
        lab={editing}
        recordId={record?.id ?? null}
        onClose={() => setEditing(null)}
      />
    </Card>
  );
}
