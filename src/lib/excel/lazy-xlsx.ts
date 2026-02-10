/**
 * Lazy XLSX Loader
 * Dynamically imports xlsx only when needed (~400KB savings on initial load)
 */

let cachedXLSX: typeof import('xlsx') | null = null;

export async function getXLSX() {
  if (!cachedXLSX) {
    cachedXLSX = await import('xlsx');
  }
  return cachedXLSX;
}
