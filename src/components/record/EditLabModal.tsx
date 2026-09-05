import { useEffect, useState } from 'react';
import { deriveStatus } from '../../lib/labStatus';
import { useAppDispatch } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import type { LabResult } from '../../types';
import { Button, Field, Input, Modal, StatusBadge } from '../ui';

/** Ported from `openEditModal` / `saveEditModal` (med.js:772-800). */
export function EditLabModal({
  lab,
  recordId,
  onClose,
}: {
  lab: LabResult | null;
  recordId: string | null;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [testName, setTestName] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (lab) {
      setTestName(lab.testName);
      setValue(String(lab.value));
    }
  }, [lab]);

  const parsed = Number.parseFloat(value);
  const valid = testName.trim().length > 0 && Number.isFinite(parsed);
  const preview = lab && valid ? deriveStatus(parsed, lab.min, lab.max) : null;

  return (
    <Modal
      open={lab !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Correct laboratory value"
      description="Manual corrections are recorded in the audit log and marked on the record."
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!valid}
            onClick={() => {
              if (!lab || !recordId || !valid) return;
              dispatch({
                type: 'lab/edit',
                recordId,
                labId: lab.id,
                testName: testName.trim(),
                value: parsed,
              });
              toast.success('Value updated', `${testName.trim()} set to ${parsed}.`);
              onClose();
            }}
          >
            Save value
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Test name">
          {(props) => (
            <Input {...props} value={testName} onChange={(e) => setTestName(e.target.value)} />
          )}
        </Field>
        <Field
          label={`Result${lab?.unit ? ` (${lab.unit})` : ''}`}
          error={value !== '' && !Number.isFinite(parsed) ? 'Enter a number.' : undefined}
        >
          {(props) => (
            <Input
              {...props}
              type="number"
              step="any"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
        </Field>
        {preview && (
          <p className="flex items-center gap-2 text-[11px] text-slate-400">
            Resulting status: <StatusBadge status={preview} />
          </p>
        )}
      </div>
    </Modal>
  );
}
