/**
 * Lazy PDF Generator
 * Dynamically imports jsPDF only when needed (~600KB savings on initial load)
 */

let cachedJsPDF: typeof import('jspdf').default | null = null;
let cachedAutoTable: typeof import('jspdf-autotable').default | null = null;

export async function getJsPDF() {
  if (!cachedJsPDF) {
    const mod = await import('jspdf');
    cachedJsPDF = mod.default;
  }
  return cachedJsPDF;
}

export async function getAutoTable() {
  if (!cachedAutoTable) {
    const mod = await import('jspdf-autotable');
    cachedAutoTable = mod.default;
  }
  return cachedAutoTable;
}

/**
 * Create a new PDF document with lazy loading
 * Returns both the doc instance and autoTable function
 */
export async function createPDF(options?: ConstructorParameters<typeof import('jspdf').default>[0]) {
  const [JsPDF] = await Promise.all([getJsPDF(), getAutoTable()]);
  const doc = new JsPDF(options);
  return doc;
}
