import { forwardRef } from 'react';
import { formatRange } from '../../lib/labStatus';
import type { LabStatus, PatientRecord, Role } from '../../types';
import './clinicalPdf.css';

const BADGE: Record<LabStatus, string> = {
  Normal: 'clinical-badge-normal',
  High: 'clinical-badge-high',
  Low: 'clinical-badge-low',
};

/**
 * The printable clinical document. Ported from `exportClinicalPDF`
 * (med.js:1082-1203), which built this as an innerHTML string interpolating
 * unescaped patient text and model output — so a report containing "<" broke
 * the layout, and one containing a tag executed. As JSX it is escaped and typed.
 */
export const ClinicalPdfDocument = forwardRef<
  HTMLDivElement,
  { record: PatientRecord; role: Role }
>(function ClinicalPdfDocument({ record, role }, ref) {
  const intake = record.intakeData;
  const isPatientCopy = role === 'patient';

  const fields: [string, string][] = [
    ['Record ID', record.id],
    ['Report date', record.date],
    ['Age', intake.age || '—'],
    ['Biological sex', intake.sex || '—'],
    ['Reported symptoms', intake.symptoms || '—'],
    ['Known conditions', intake.conditions || '—'],
    ['Allergies', intake.allergies || '—'],
    ['Current medications', intake.medications || '—'],
  ];

  return (
    <div ref={ref} className="clinical-pdf-wrapper">
      <div className="clinical-pdf-header">
        <div>
          <h1 className="clinical-pdf-title">MediPulse AI Pro</h1>
          <p className="clinical-pdf-subtitle">
            Structured Medical Synthesis Report
            {isPatientCopy ? ' — Patient Copy' : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '9px', color: '#64748b' }}>
          <p style={{ margin: 0 }}>Generated {new Date().toLocaleString()}</p>
          <p style={{ margin: '2px 0 0' }}>Engine: {record.engine}</p>
        </div>
      </div>

      <section className="clinical-pdf-section">
        <h2 className="clinical-pdf-section-title">Patient profile</h2>
        <dl className="clinical-pdf-grid">
          {fields.map(([label, value]) => (
            <div key={label} className="clinical-pdf-field">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {record.conflicts.length > 0 && (
        <section className="clinical-pdf-section">
          <div className="clinical-pdf-conflicts">
            <strong>Clinical flags &amp; discrepancies:</strong>
            <ul>
              {record.conflicts.map((conflict) => (
                <li key={conflict}>{conflict}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {record.summary && (
        <section className="clinical-pdf-section">
          <h2 className="clinical-pdf-section-title">
            {isPatientCopy ? 'What this report says' : 'Non-diagnostic synthesis'}
          </h2>
          <div className="clinical-pdf-summary">{record.summary}</div>
        </section>
      )}

      <section className="clinical-pdf-section">
        <h2 className="clinical-pdf-section-title">Biomarker findings</h2>
        <table className="clinical-pdf-table">
          <thead>
            <tr>
              <th>Test name</th>
              <th>Result</th>
              <th>Reference range</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {record.labs.map((lab) => (
              <tr key={lab.id}>
                <td style={{ fontWeight: 600 }}>
                  {lab.testName}
                  {lab.edited ? ' (corrected)' : ''}
                </td>
                <td style={{ fontWeight: 700 }}>
                  {lab.value} {lab.unit}
                </td>
                <td>{formatRange(lab.min, lab.max, lab.unit)}</td>
                <td>
                  <span className={BADGE[lab.status]}>{lab.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="clinical-pdf-disclaimer">
        <strong>Important:</strong> MediPulse AI Pro is a document synthesis tool, not a
        medical device. It does not provide medical diagnoses, prescribe medications, or
        alter dosages. All findings are extracted from the supplied source report and
        require review by a qualified physician before any clinical decision is made.
      </p>

      {!isPatientCopy && (
        <div className="clinical-pdf-signature">
          <div>Reviewing clinician (print name)</div>
          <div>Signature</div>
          <div>Date</div>
        </div>
      )}
    </div>
  );
});
