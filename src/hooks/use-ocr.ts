/**
 * Lazy-loaded OCR hook using Tesseract.js
 * Reduces initial bundle by ~500KB by loading only when needed
 */

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
}

interface UseOCROptions {
  language?: string;
  onProgress?: (progress: number) => void;
}

interface UseOCRReturn {
  isLoading: boolean;
  progress: number;
  result: OCRResult | null;
  error: string | null;
  recognize: (image: File | Blob | string) => Promise<OCRResult | null>;
  reset: () => void;
}

// Cached worker
let tesseractWorker: any = null;

const initWorker = async (language: string = "eng") => {
  if (!tesseractWorker) {
    const Tesseract = await import("tesseract.js");
    tesseractWorker = await Tesseract.createWorker(language, 1, {
      logger: (m: any) => {
        if (m.status === "recognizing text") {
          // Progress callback handled separately
        }
      }
    });
  }
  return tesseractWorker;
};

export const useOCR = (options: UseOCROptions = {}): UseOCRReturn => {
  const { language = "eng", onProgress } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const recognize = useCallback(async (image: File | Blob | string): Promise<OCRResult | null> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    
    const startTime = Date.now();

    try {
      const Tesseract = await import("tesseract.js");
      
      const worker = await Tesseract.createWorker(language, 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text" && m.progress) {
            const progressValue = Math.round(m.progress * 100);
            setProgress(progressValue);
            onProgress?.(progressValue);
          }
        }
      });

      const { data } = await worker.recognize(image);
      await worker.terminate();

      const ocrResult: OCRResult = {
        text: data.text,
        confidence: data.confidence,
        language,
        processingTime: Date.now() - startTime
      };

      setResult(ocrResult);
      setProgress(100);

      toast({
        title: "OCR Concluído",
        description: `Texto extraído com ${ocrResult.confidence.toFixed(1)}% de confiança.`
      });

      return ocrResult;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "OCR failed";
      setError(errorMsg);
      
      toast({
        title: "Erro no OCR",
        description: errorMsg,
        variant: "destructive"
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [language, onProgress, toast]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    isLoading,
    progress,
    result,
    error,
    recognize,
    reset
  };
};

/**
 * Standalone function for non-React contexts
 */
export const lazyRecognizeText = async (
  image: File | Blob | string,
  language: string = "eng"
): Promise<OCRResult> => {
  const startTime = Date.now();
  const Tesseract = await import("tesseract.js");
  
  const worker = await Tesseract.createWorker(language);
  const { data } = await worker.recognize(image);
  await worker.terminate();

  return {
    text: data.text,
    confidence: data.confidence,
    language,
    processingTime: Date.now() - startTime
  };
};

export default useOCR;
