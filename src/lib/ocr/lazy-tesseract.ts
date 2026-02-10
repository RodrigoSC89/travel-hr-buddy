/**
 * Lazy Tesseract.js Wrapper
 * Loads tesseract.js (~500KB) on demand instead of in initial bundle
 */

type TesseractModule = typeof import("tesseract.js");

let _tesseract: TesseractModule | null = null;

export async function getTesseract(): Promise<TesseractModule> {
  if (!_tesseract) {
    _tesseract = await import("tesseract.js");
  }
  return _tesseract;
}

export async function createLazyWorker(lang?: string, oem?: number, options?: Record<string, unknown>) {
  const { createWorker } = await getTesseract();
  return createWorker(lang as string, oem as number, options);
}

export async function recognizeLazy(
  image: File | string | Blob,
  lang: string,
  options?: Record<string, unknown>
) {
  const Tesseract = await getTesseract();
  return Tesseract.recognize(image, lang, options);
}
