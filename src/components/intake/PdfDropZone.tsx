import { useCallback, useRef, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import clsx from 'clsx';
import { extractPdfText, PdfError } from '../../lib/pdfText';
import { useAppDispatch } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import { Spinner } from '../ui';

export function PdfDropZone() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setProgress('Reading PDF…');
      try {
        const text = await extractPdfText(file, (page, total) =>
          setProgress(`Extracting page ${page} of ${total}…`),
        );
        dispatch({ type: 'pdf/extracted', fileName: file.name, text });
        toast.success('PDF text extracted', file.name);
      } catch (err) {
        const message =
          err instanceof PdfError
            ? err.message
            : 'Could not read that PDF. Try pasting the report text instead.';
        toast.error('PDF upload failed', message);
      } finally {
        setProgress(null);
        // Allow re-selecting the same file.
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [dispatch, toast],
  );

  const busy = progress !== null;

  return (
    <div>
      <input
        ref={inputRef}
        id="pdf-file-input"
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a lab report PDF"
        aria-busy={busy}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (busy) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={clsx(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition',
          dragging ? 'border-blue-500 bg-blue-950/20' : 'border-slate-700 hover:border-slate-600',
          busy && 'cursor-wait opacity-70',
        )}
      >
        {busy ? (
          <>
            <Spinner className="h-5 w-5 text-blue-400" />
            <p className="text-xs font-medium text-slate-300">{progress}</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-slate-500" aria-hidden />
            <p className="text-xs font-medium text-slate-300">
              Drop a lab report PDF here, or select a file
            </p>
            <p className="flex items-center gap-1 text-[11px] text-slate-500">
              <FileText className="h-3 w-3" aria-hidden />
              Text is extracted in your browser — the file is never uploaded anywhere.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
