import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIContext {
  drills?: any[];
  certifications?: any[];
  crewMembers?: any[];
  drillType?: string;
  drillData?: any;
}

interface UseSOLASAIReturn {
  isLoading: boolean;
  sendMessage: (message: string) => Promise<string | null>;
  analyzeDrill: (drillData: any) => Promise<string | null>;
  generateReport: (context: AIContext) => Promise<string | null>;
  predictTraining: (context: AIContext) => Promise<string | null>;
  suggestSchedule: (context: AIContext) => Promise<string | null>;
}

export function useSOLASAI(): UseSOLASAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callAI = useCallback(async (
    type: 'chat' | 'analyze_drill' | 'generate_report' | 'predict_training' | 'suggest_schedule',
    message?: string,
    context?: AIContext
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('solas-training-ai', {
        body: { type, message, context }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.code === 'RATE_LIMIT') {
          toast({
            title: 'Limite de requisições',
            description: 'Aguarde um momento antes de tentar novamente.',
            variant: 'destructive'
          });
        } else if (data.code === 'CREDITS_EXHAUSTED') {
          toast({
            title: 'Créditos insuficientes',
            description: 'Adicione mais créditos para continuar usando a IA.',
            variant: 'destructive'
          });
        }
        return null;
      }

      return data.response;
    } catch (error) {
      console.error('SOLAS AI error:', error);
      toast({
        title: 'Erro na IA',
        description: 'Não foi possível processar sua solicitação.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const sendMessage = useCallback((message: string) => 
    callAI('chat', message), [callAI]);

  const analyzeDrill = useCallback((drillData: any) => 
    callAI('analyze_drill', undefined, { drillData }), [callAI]);

  const generateReport = useCallback((context: AIContext) => 
    callAI('generate_report', undefined, context), [callAI]);

  const predictTraining = useCallback((context: AIContext) => 
    callAI('predict_training', undefined, context), [callAI]);

  const suggestSchedule = useCallback((context: AIContext) => 
    callAI('suggest_schedule', undefined, context), [callAI]);

  return {
    isLoading,
    sendMessage,
    analyzeDrill,
    generateReport,
    predictTraining,
    suggestSchedule
  };
}
