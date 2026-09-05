import { AlertTriangle, Bot, Download, FileCode, FileText, ScrollText } from 'lucide-react';
import clsx from 'clsx';
import { useAppState } from '../../hooks/useApp';
import { useClinicalPdfExport } from '../../hooks/useClinicalPdfExport';
import { exportRecordAsJson } from '../../lib/exportJson';
import { buildFallbackSummary, buildHeuristicConflicts } from '../../lib/summary';
import { selectCurrentRecord } from '../../state/selectors';
import { ClinicianOnly } from '../layout/ClinicianOnly';
import { Button, Card, EmptyState, SectionHeader } from '../ui';
import { LabTable } from './LabTable';

export function RecordTab() {
  const state = useAppState();
  const record = selectCurrentRecord(state);
  const { exportPdf, busy, portal } = useClinicalPdfExport();
  const isPatient = state.role === 'patient';

  if (!record) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={<FileText className="h-7 w-7" aria-hidden />}
          title="No record selected"
          body="Process a report in the Intake tab, or pick a saved record from the vault, to see the synthesis here."
        />
      </Card>
    );
  }

  const summary = record.summary ?? buildFallbackSummary(record.intakeData, record.labs);
  const conflicts =
    record.conflicts.length > 0
      ? record.conflicts
      : buildHeuristicConflicts(record.intakeData, record.labs);

  return (
    <div className="space-y-5">
      {portal}

      <Card className="space-y-3 p-4">
        <SectionHeader
          icon={<Bot className="h-4 w-4 text-blue-400" aria-hidden />}
          title={isPatient ? 'What this report says' : 'Non-diagnostic synthesis overview'}
          action={
            <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
              {record.engine}
            </span>
          }
        />
        <p className="text-sm font-light leading-relaxed text-slate-200">{summary}</p>
        <p className="rounded-lg border border-amber-900/60 bg-amber-950/40 p-2.5 text-[11px] leading-relaxed text-amber-300">
          MediPulse does not provide medical diagnoses, prescribe medications, or alter
          dosages. Discuss all findings with a qualified physician.
        </p>
      </Card>

      {conflicts.length > 0 && (
        <Card className="space-y-2 border-amber-900/60 bg-amber-950/20 p-4">
          <SectionHeader
            icon={<AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden />}
            title={isPatient ? 'Discuss with your doctor' : 'Clinical flags & discrepancies'}
          />
          <ul className="list-inside list-disc space-y-1 text-xs text-amber-200">
            {conflicts.map((conflict) => (
              <li key={conflict}>{conflict}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-12">
        <ClinicianOnly>
          <Card className="min-w-0 space-y-3 p-4 lg:col-span-4">
            <SectionHeader
              icon={<ScrollText className="h-4 w-4 text-blue-400" aria-hidden />}
              title="Original source text"
            />
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
              {record.rawText}
            </pre>
          </Card>
        </ClinicianOnly>

        <div
          className={clsx(
            // min-w-0 lets the lab table scroll inside its own container instead of
            // widening the page: grid children default to min-width: auto.
            'min-w-0',
            state.role === 'clinician' ? 'lg:col-span-8' : 'lg:col-span-12',
          )}
        >
          <LabTable
            actions={
              <div className="flex gap-2">
                <Button
                  size="sm"
                  icon={<FileCode className="h-3.5 w-3.5" aria-hidden />}
                  onClick={() => exportRecordAsJson(record)}
                >
                  JSON
                </Button>
                <Button
                  size="sm"
                  loading={busy}
                  icon={busy ? undefined : <Download className="h-3.5 w-3.5" aria-hidden />}
                  onClick={() => void exportPdf(record, state.role)}
                >
                  PDF
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <ClinicianOnly>
        <AuditLog />
      </ClinicianOnly>
    </div>
  );
}

function AuditLog() {
  const { audit } = useAppState();

  return (
    <Card className="space-y-3 p-4">
      <SectionHeader
        icon={<ScrollText className="h-4 w-4 text-blue-400" aria-hidden />}
        title="System audit log"
      />
      {audit.length === 0 ? (
        <p className="text-[11px] text-slate-600">No activity recorded yet.</p>
      ) : (
        <ul
          className="max-h-52 space-y-1 overflow-y-auto font-mono text-[11px]"
          aria-live="polite"
        >
          {audit.map((entry) => (
            <li key={entry.id} className="text-slate-500">
              <span className="text-slate-600">
                [{new Date(entry.at).toLocaleTimeString()}]
              </span>{' '}
              <span className="text-blue-400">[{entry.role.toUpperCase()}]</span>{' '}
              <span className="text-slate-400">{entry.message}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
