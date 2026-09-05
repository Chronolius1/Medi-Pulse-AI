/**
 * PDF text extraction. Ported from `parsePDFFile` (med.js:367-386), which used
 * the pdf.js CDN global. Three failure modes are guarded here that the original
 * never hit only because it loaded a prebuilt CDN bundle:
 *
 * 1. Worker delivery. The worker is imported with Vite's `?worker&inline`,
 *    which embeds its source in an ordinary application chunk and starts it
 *    from a Blob URL. Nothing about the worker is fetched by path at runtime,
 *    which rules out the two ways the usual approaches break in production:
 *      - `workerSrc = 'pdfjs-dist/build/pdf.worker.min.mjs'` resolves in dev
 *        (the dev server handles bare specifiers) and 404s in the build,
 *        because Rollup never emitted that file.
 *      - `?url` does emit the file, but as a standalone `.mjs`. Module workers
 *        require a JavaScript MIME type, and a number of static hosts and CDNs
 *        serve `.mjs` as text/plain or application/octet-stream, so the worker
 *        fails to instantiate even though the request returned 200. It is also
 *        sensitive to `base` being wrong under a subpath deployment.
 *    The inline worker ships as `.js` through the same pipeline as the rest of
 *    the app: if it can load, so can the worker. Note that a strict CSP needs
 *    `worker-src 'self' blob:` for this (Vite falls back to a `data:` URL).
 * 2. `Promise.withResolvers` — pdfjs-dist v4's modern build uses this ES2024
 *    API, which throws on Firefox <121 and Safari <17.4. `build.target` does
 *    not help; it is a runtime API, not syntax. The legacy build avoids it.
 * 3. Detached ArrayBuffer — pdf.js transfers the buffer it is given, so
 *    re-uploading the same File throws. We hand it a copy.
 */
type PdfjsModule = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

const MAX_BYTES = 20 * 1024 * 1024;

export class PdfError extends Error {}

let pdfjsPromise: Promise<PdfjsModule> | null = null;

async function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const [lib, { default: PdfWorker }] = await Promise.all([
        import('pdfjs-dist/legacy/build/pdf.mjs'),
        import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker&inline'),
      ]);
      try {
        lib.GlobalWorkerOptions.workerPort = new PdfWorker();
      } catch {
        // Only reachable if the environment blocks Blob/data workers outright
        // (a CSP without `worker-src blob:`). Reset so a later attempt can
        // retry rather than reusing a half-initialised module.
        pdfjsPromise = null;
        throw new PdfError(
          'This browser or site policy blocked the PDF reader. Paste the report text instead.',
        );
      }
      return lib;
    })();
  }
  return pdfjsPromise;
}

/**
 * Rebuilds line breaks from glyph positions.
 *
 * pdf.js returns positioned text runs, not lines. The original joined every run
 * on a page with a single space (med.js:378), collapsing the whole page onto one
 * line — which the line-oriented regex parser could then never match. Grouping
 * runs by their y coordinate restores the layout the parser expects.
 */
function reconstructLines(items: readonly unknown[]): string {
  const lines: { y: number; parts: string[] }[] = [];
  const TOLERANCE = 2; // points; absorbs sub-pixel baseline jitter

  for (const raw of items) {
    // Marked-content entries carry no text; skip anything without a string.
    if (!raw || typeof raw !== 'object' || !('str' in raw)) continue;
    const item = raw as TextItemLike;
    if (!item.str) continue;
    const y = item.transform?.[5] ?? 0;
    const line = lines.find((l) => Math.abs(l.y - y) <= TOLERANCE);
    if (line) {
      line.parts.push(item.str);
    } else {
      lines.push({ y, parts: [item.str] });
    }
    // pdf.js flags an explicit end-of-line; honour it when present.
    if (item.hasEOL) lines.push({ y: y - 1000 - lines.length, parts: [] });
  }

  return lines
    .map((line) => line.parts.join(' ').replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

interface TextItemLike {
  str?: string;
  transform?: number[];
  hasEOL?: boolean;
}

export async function extractPdfText(
  file: File,
  onProgress?: (page: number, total: number) => void,
): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new PdfError('Please upload a valid PDF file.');
  }
  if (file.size > MAX_BYTES) {
    throw new PdfError('That PDF is larger than 20 MB. Try a smaller file.');
  }

  const lib = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  // Copy: pdf.js transfers ownership of the buffer it receives.
  const task = lib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
  const pdf = await task.promise;

  try {
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i += 1) {
      onProgress?.(i, pdf.numPages);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(reconstructLines(content.items));
    }
    const text = pages.join('\n').trim();
    if (!text) {
      throw new PdfError(
        'No selectable text found. This looks like a scanned PDF — paste the report text instead.',
      );
    }
    return text;
  } finally {
    // The original never destroyed the document, leaking a worker per upload.
    await pdf.destroy();
  }
}
