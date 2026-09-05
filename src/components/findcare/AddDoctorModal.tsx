import { useState } from 'react';
import { useAppDispatch } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import { createDoctorId } from '../../lib/ids';
import { SPECIALTIES } from '../../data/specialists';
import { Button, Field, Input, Modal, Select } from '../ui';

const EMPTY = { name: '', specialty: SPECIALTIES[0] as string, clinic: '', phone: '' };

export function AddDoctorModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);

  const valid = form.name.trim().length > 0;

  const save = () => {
    if (!valid) return;
    dispatch({
      type: 'doctors/add',
      doctor: {
        id: createDoctorId(),
        name: form.name.trim(),
        specialty: form.specialty,
        clinic: form.clinic.trim(),
        phone: form.phone.trim(),
        source: 'custom',
      },
    });
    toast.success('Provider saved', form.name.trim());
    setForm(EMPTY);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) setForm(EMPTY);
        onOpenChange(next);
      }}
      title="Save a provider"
      description="Kept in this browser alongside your records."
      size="sm"
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={save}>
            Save provider
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Provider name">
          {(props) => (
            <Input
              {...props}
              autoFocus
              value={form.name}
              placeholder="Dr. Jane Okafor"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          )}
        </Field>
        <Field label="Specialty">
          {(props) => (
            <Select
              {...props}
              value={form.specialty}
              onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
            >
              {SPECIALTIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Clinic or practice">
          {(props) => (
            <Input
              {...props}
              value={form.clinic}
              placeholder="Riverside Medical Group"
              onChange={(e) => setForm((f) => ({ ...f, clinic: e.target.value }))}
            />
          )}
        </Field>
        <Field label="Phone">
          {(props) => (
            <Input
              {...props}
              type="tel"
              value={form.phone}
              placeholder="(555) 010-2233"
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          )}
        </Field>
      </div>
    </Modal>
  );
}
