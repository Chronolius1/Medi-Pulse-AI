import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ClinicalPdfDocument } from '../components/export/ClinicalPdfDocument';
import type { PatientRecord, Role } from '../types';
import { useToast } from './useToast';

interface PendingExport {
  record: PatientRecord;
  role: Role;
}

/**
 * Renders the clinical document off-screen, then hands the live node to
 * html2pdf.
 *
 * html2canvas reads *computed* styles, so the node must actually be laid out —
 * `display: none` yields a blank page. Off-screen positioning gives a real
 * layout while keeping it invisible and out of the accessibility tree.
 */
export function useClinicalPdfExport(): {
  exportPdf: (record: PatientRecord, role: Role) => Promise<void>;
  busy: boolean;
  portal: ReactNode;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<PendingExport | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const exportPdf = useCallback(
    async (record: PatientRecord, role: Role) => {
      setBusy(true);
      setPending({ record, role });
      try {
        // Let React commit, then give the browser two frames plus font loading
        // so the capture sees final layout rather than a half-painted node.
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
        await document.fonts?.ready;

        const element = ref.current;
        if (!element) throw new Error('The PDF document did not mount.');

        const { default: html2pdf } = await import('html2pdf.js');
        await html2pdf()
          .set({
            margin: [10, 10, 10, 10],
            filename: `MediPulse_${record.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              logging: false,
              // The app body is slate-950; without this the capture can inherit it.
              backgroundColor: '#ffffff',
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] },
          })
          .from(element)
          .save();

        toast.success('Clinical PDF downloaded', `MediPulse_${record.id}.pdf`);
      } catch (err) {
        toast.error(
          'PDF generation failed',
          err instanceof Error ? err.message : 'Try exporting JSON instead.',
        );
      } finally {
        setBusy(false);
        setPending(null);
      }
    },
    [toast],
  );

  const portal = pending ? (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: '-10000px',
        width: '800px',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <ClinicalPdfDocument ref={ref} record={pending.record} role={pending.role} />
    </div>
  ) : null;

  return { exportPdf, busy, portal };
}
