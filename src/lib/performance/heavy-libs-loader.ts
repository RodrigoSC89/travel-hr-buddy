/**
 * Heavy Libraries Loader
 * Centralized lazy loading for heavy dependencies to reduce initial bundle
 */

// Cache for loaded libraries
const loadedLibs: Record<string, unknown> = {};

async function loadLib<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (!loadedLibs[key]) {
    loadedLibs[key] = await loader();
  }
  return loadedLibs[key] as T;
}

// ========== Maps ==========

export const loadMapboxGL = () => loadLib("mapbox-gl", async () => {
  const { getMapboxGLAsync } = await import("@/lib/mapbox-shim");
  return getMapboxGLAsync();
});

// ========== Documents / Export ==========

export const loadXLSX = () => loadLib("xlsx", async () => {
  const XLSX = await import("xlsx");
  return XLSX;
});

export const loadJsPDF = () => loadLib("jspdf", async () => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  return { jsPDF, autoTable };
});

export const loadDocx = () => loadLib("docx", async () => {
  const docx = await import("docx");
  return docx;
});

// ========== Utility ==========

export const isLibLoaded = (key: string): boolean => !!loadedLibs[key];

export const preloadLibs = async (libs: Array<() => Promise<unknown>>): Promise<void> => {
  await Promise.allSettled(libs.map(loader => loader()));
};
