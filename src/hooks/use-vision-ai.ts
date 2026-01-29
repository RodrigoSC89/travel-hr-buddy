/**
 * Hook para análise de imagens com IA Vision
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VisionAnalysisResult {
  success: boolean;
  analysis: string;
  analysisType: string;
  timestamp: string;
  error?: string;
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
}

export function useVisionAI(options: UseVisionAIOptions = {}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (
    image: File | string,
    analysisType: AnalysisType = 'general',
    customPrompt?: string
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

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

      setResult(data);
      options.onSuccess?.(data);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
      return null;
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
    reset,
  };
}
