// src/lib/pdf.ts
import { toast } from "sonner";

export function formatPDFContent(title: string, content: string, footer?: string) {
  const dateStr = new Date().toLocaleString();
  const defaultFooter = footer ?? `<div>Gerado em: ${dateStr} - Sistema Nautilus One</div>`;

  return `
    <div style="font-family: Arial, sans-serif;">
      <h1 style="color: #1e40af">${title}</h1>
      <div>${content}</div>
      <footer>${defaultFooter}</footer>
    </div>
  `;
}

type Html2PdfOptions = Partial<{
  filename: string;
  margin: number;
  image: { type: string; quality: number };
  html2canvas: { scale: number };
  jsPDF: { unit: string; format: string; orientation: "portrait" | "landscape" };
}>;

const DEFAULT_OPTIONS = {
  filename: "document.pdf",
  margin: 10,
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
};

function mergeOptions(defaults: any, custom?: any) {
  if (!custom) return defaults;
  return {
    ...defaults,
    ...custom,
    image: { ...(defaults.image ?? {}), ...(custom.image ?? {}) },
    html2canvas: { ...(defaults.html2canvas ?? {}), ...(custom.html2canvas ?? {}) },
    jsPDF: { ...(defaults.jsPDF ?? {}), ...(custom.jsPDF ?? {}) },
  };
}

export async function exportToPDF(
  contentHtml: string,
  filename?: string,
  customOptions?: Html2PdfOptions
) {
  toast.info("Gerando PDF...");

  // create temporary element
  const tempEl = document.createElement("div");
  tempEl.style.position = "absolute";
  tempEl.style.left = "-9999px";
  tempEl.innerHTML = contentHtml;
  document.body.appendChild(tempEl);

  const opts = mergeOptions(DEFAULT_OPTIONS, customOptions);
  if (filename) opts.filename = filename;

  try {
    // dynamic import ensures tests that mock dynamic import get the mocked module
    const html2pdfModule = (await import("html2pdf.js")) as any;
    const html2pdf = html2pdfModule?.default ?? html2pdfModule;

    // call html2pdf factory
    const instance = html2pdf();
    // .set must be called with the merged options
    instance.set(opts).from(tempEl);

    // save returns a Promise in normal usage; await so tests can observe rejection
    await instance.save();

    toast.success("PDF gerado com sucesso!");
  } catch (err) {
    toast.error("Erro ao gerar PDF");
    // rethrow so tests expecting reject can assert on the error
    throw err;
  } finally {
    // clean up temporary element
    tempEl.remove();
  }
}
