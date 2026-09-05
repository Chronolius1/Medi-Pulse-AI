/**
 * html2pdf.js ships no type declarations. This covers the fluent subset the
 * clinical PDF exporter uses (see src/lib/pdfExport.ts).
 */
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
    pagebreak?: { mode?: string | string[] };
  }

  interface Html2PdfWorker {
    set(options: Html2PdfOptions): Html2PdfWorker;
    from(element: HTMLElement | string): Html2PdfWorker;
    save(): Promise<void>;
    then(onFulfilled?: () => unknown): Promise<unknown>;
  }

  function html2pdf(): Html2PdfWorker;
  export default html2pdf;
}
