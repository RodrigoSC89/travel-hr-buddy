/**
 * Type declarations for html2pdf.js library
 * PATCH 659: Enable type safety for PDF generation
 */

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      logging?: boolean;
      letterRendering?: boolean;
      allowTaint?: boolean;
      [key: string]: unknown;
    };
    jsPDF?: {
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: 'a3' | 'a4' | 'a5' | 'letter' | 'legal' | [number, number];
      orientation?: 'portrait' | 'landscape';
      compress?: boolean;
      [key: string]: unknown;
    };
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
    enableLinks?: boolean;
  }

  interface Html2PdfWorker {
    set(options: Html2PdfOptions): Html2PdfWorker;
    from(element: HTMLElement | string): Html2PdfWorker;
    save(filename?: string): Promise<void>;
    output(type: 'blob'): Promise<Blob>;
    output(type: 'datauristring'): Promise<string>;
    output(type: 'arraybuffer'): Promise<ArrayBuffer>;
    outputPdf(type?: string): Html2PdfWorker;
    then<T>(callback: (pdf: T) => void): Promise<T>;
    catch(callback: (error: Error) => void): Promise<void>;
    toPdf(): Html2PdfWorker;
    get(type: string): Promise<unknown>;
  }

  function html2pdf(): Html2PdfWorker;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Html2PdfWorker;

  export default html2pdf;
  export type { Html2PdfOptions, Html2PdfWorker };
}
