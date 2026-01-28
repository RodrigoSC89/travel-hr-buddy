/**
 * useSmartOCR Hook
 * React interface for Smart OCR Engine
 */
import { useState, useCallback } from 'react';
import { 
  smartOCREngine,
  type DocumentInput,
  type OCRResult
} from '@/lib/ai/engines/smart-ocr-engine';

export interface UseSmartOCRReturn {
  isProcessing: boolean;
  result: OCRResult | null;
  processDocument: (input: DocumentInput) => Promise<OCRResult>;
  processDocuments: (inputs: DocumentInput[]) => Promise<OCRResult[]>;
  extractCertificateData: (ocrResult: OCRResult) => {
    certificateType: string;
    certificateNumber: string | null;
    holderName: string | null;
    issueDate: Date | null;
    expiryDate: Date | null;
    issuingAuthority: string | null;
    status: 'valid' | 'expired' | 'expiring_soon' | 'unknown';
  };
}

export function useSmartOCR(): UseSmartOCRReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);

  const processDocument = useCallback(async (input: DocumentInput): Promise<OCRResult> => {
    setIsProcessing(true);
    try {
      const ocrResult = await smartOCREngine.processDocument(input);
      setResult(ocrResult);
      return ocrResult;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processDocuments = useCallback(async (inputs: DocumentInput[]): Promise<OCRResult[]> => {
    setIsProcessing(true);
    try {
      return await smartOCREngine.processDocuments(inputs);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const extractCertificateData = useCallback((ocrResult: OCRResult) => {
    return smartOCREngine.extractCertificateData(ocrResult);
  }, []);

  return {
    isProcessing,
    result,
    processDocument,
    processDocuments,
    extractCertificateData
  };
}
