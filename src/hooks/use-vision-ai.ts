/**
 * Hook para análise de imagens com IA Vision
 * Com fallback automático para Mock quando API não disponível
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mockVision } from '@/services/mock-vision-service';

interface VisionAnalysisResult {
  success: boolean;
  analysis: string;
  analysisType: string;
  timestamp: string;
  error?: string;
  isMock?: boolean;
  confidence?: number;
  tags?: string[];
  recommendations?: string[];
}

type AnalysisType = 
  | 'equipment' 
  | 'document' 
  | 'vessel' 
  | 'safety' 
  | 'cargo' 
  | 'general';

interface UseVisionAIOptions {
  onSuccess?: (result: VisionAnalysisResult) => void;
  onError?: (error: Error) => void;
  forceMock?: boolean;
}

export function useVisionAI(options: UseVisionAIOptions = {}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  /**
   * Fallback para Mock Vision
   */
  const useMockAnalysis = async (
    image: File | string,
    analysisType: AnalysisType,
    customPrompt?: string
  ): Promise<VisionAnalysisResult> => {
    setUsingMock(true);
    
    const file = typeof image === 'string' 
      ? new File([], 'image.jpg') // Dummy file for URL
      : image;
    
    const mockResult = await mockVision.analyzeImage(file, analysisType, customPrompt);
    
    return {
      success: true,
      analysis: mockResult.analysis,
      analysisType: mockResult.analysisType,
      timestamp: mockResult.timestamp,
      isMock: true,
      confidence: mockResult.confidence,
      tags: mockResult.tags,
      recommendations: mockResult.recommendations,
    };
  };

  const analyzeImage = useCallback(async (
    image: File | string,
    analysisType: AnalysisType = 'general',
    customPrompt?: string
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setUsingMock(false);

    // Se forçar mock, usa diretamente
    if (options.forceMock) {
      try {
        const mockResult = await useMockAnalysis(image, analysisType, customPrompt);
        setResult(mockResult);
        options.onSuccess?.(mockResult);
        return mockResult;
      } finally {
        setIsAnalyzing(false);
      }
    }

    try {
      let imageUrl: string | undefined;
      let imageBase64: string | undefined;

      if (typeof image === 'string') {
        // Already a URL
        imageUrl = image;
      } else {
        // Convert file to base64
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      }

      const { data, error: fnError } = await supabase.functions.invoke('nauti-vision', {
        body: {
          imageUrl,
          imageBase64,
          analysisType,
          prompt: customPrompt,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      const resultWithFlag = { ...data, isMock: false };
      setResult(resultWithFlag);
      options.onSuccess?.(resultWithFlag);
      return resultWithFlag;

    } catch (err) {
      console.warn('[useVisionAI] API failed, using mock:', err);
      
      // Fallback para Mock
      try {
        const mockResult = await useMockAnalysis(image, analysisType, customPrompt);
        setResult(mockResult);
        options.onSuccess?.(mockResult);
        return mockResult;
      } catch (mockErr) {
        const errorMessage = mockErr instanceof Error ? mockErr.message : 'Failed to analyze image';
        setError(errorMessage);
        options.onError?.(mockErr instanceof Error ? mockErr : new Error(errorMessage));
        return null;
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [options]);

  const analyzeEquipment = useCallback((image: File | string, prompt?: string) => {
    return analyzeImage(image, 'equipment', prompt || 'Analise o estado deste equipamento. Identifique condição, desgaste e necessidade de manutenção.');
  }, [analyzeImage]);

  const analyzeDocument = useCallback((image: File | string, prompt?: string) => {
    return analyzeImage(image, 'document', prompt || 'Extraia as informações deste documento/certificado. Verifique validade e dados importantes.');
  }, [analyzeImage]);

  const analyzeVesselCondition = useCallback((image: File | string, prompt?: string) => {
    return analyzeImage(image, 'vessel', prompt || 'Avalie a condição geral da embarcação. Identifique problemas visíveis ou riscos.');
  }, [analyzeImage]);

  const analyzeSafety = useCallback((image: File | string, prompt?: string) => {
    return analyzeImage(image, 'safety', prompt || 'Identifique riscos de segurança, EPIs faltantes ou não conformidades nesta imagem.');
  }, [analyzeImage]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setUsingMock(false);
  }, []);

  return {
    analyzeImage,
    analyzeEquipment,
    analyzeDocument,
    analyzeVesselCondition,
    analyzeSafety,
    isAnalyzing,
    result,
    error,
    usingMock,
    reset,
  };
}
