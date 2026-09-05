import { User } from 'lucide-react';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import type { IntakeData } from '../../types';
import { Card, Field, Input, SectionHeader, Select } from '../ui';

const TEXT_FIELDS: { field: keyof IntakeData; label: string; placeholder: string }[] = [
  { field: 'symptoms', label: 'Reported symptoms', placeholder: 'Fatigue, dizziness' },
  { field: 'conditions', label: 'Known conditions', placeholder: 'Hypothyroidism' },
  { field: 'allergies', label: 'Allergies', placeholder: 'Penicillin' },
  { field: 'medications', label: 'Current medications', placeholder: 'Levothyroxine 50mcg' },
];

export function IntakeForm() {
  const { intakeDraft } = useAppState();
  const dispatch = useAppDispatch();

  const set = (field: keyof IntakeData) => (value: string) =>
    dispatch({ type: 'intake/setField', field, value });

  return (
    <Card className="space-y-3 p-4">
      <SectionHeader
        icon={<User className="h-4 w-4 text-blue-400" aria-hidden />}
        title="Demographics & clinical profile"
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Age">
          {(props) => (
            <Input
              {...props}
              type="number"
              min={0}
              max={130}
              inputMode="numeric"
              value={intakeDraft.age}
              placeholder="45"
              onChange={(e) => set('age')(e.target.value)}
            />
          )}
        </Field>
        <Field label="Biological sex">
          {(props) => (
            <Select
              {...props}
              value={intakeDraft.sex}
              onChange={(e) => set('sex')(e.target.value)}
            >
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </Select>
          )}
        </Field>
      </div>

      {TEXT_FIELDS.map(({ field, label, placeholder }) => (
        <Field key={field} label={label}>
          {(props) => (
            <Input
              {...props}
              value={intakeDraft[field]}
              placeholder={placeholder}
              onChange={(e) => set(field)(e.target.value)}
            />
          )}
        </Field>
      ))}
    </Card>
  );
}
