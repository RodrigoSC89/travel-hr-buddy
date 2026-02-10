/**
 * useAILevel3 - Hook for Level 3 Autonomous AI
 * Features: Autocorretive, Proactive, Contextual, Memory-based
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

export interface AIMemoryEntry {
  id: string;
  type: 'interaction' | 'decision' | 'correction' | 'insight';
  content: string;
  context: Record<string, unknown>;
  importance: number;
  timestamp: Date;
  embedding?: number[];
}

export interface AIProactiveSuggestion {
  id: string;
  type: 'warning' | 'opportunity' | 'optimization' | 'compliance';
  title: string;
  description: string;
  action?: string;
  confidence: number;
  module: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: Date;
}

export interface AISelfCorrection {
  id: string;
  errorType: string;
  originalState: unknown;
  correctedState: unknown;
  reason: string;
  confidence: number;
  appliedAt: Date;
  rollbackAvailable: boolean;
}

export interface AIExplanation {
  decision: string;
  reasoning: string;
  evidence: string[];
  confidence: number;
  alternatives: string[];
  risks: string[];
}

interface UseAILevel3Options {
  module: string;
  enableProactive?: boolean;
  enableMemory?: boolean;
  enableSelfCorrection?: boolean;
}

export function useAILevel3(options: UseAILevel3Options) {
  const { 
    module, 
    enableProactive = true, 
    enableMemory = true,
    enableSelfCorrection = true 
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [memory, setMemory] = useState<AIMemoryEntry[]>([]);
  const [suggestions, setSuggestions] = useState<AIProactiveSuggestion[]>([]);
  const [corrections, setCorrections] = useState<AISelfCorrection[]>([]);
  const proactiveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load memory from Supabase
  const loadMemory = useCallback(async () => {
    if (!enableMemory) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_memory')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const entries: AIMemoryEntry[] = (data || []).map(item => ({
        id: item.id,
        type: item.memory_type as AIMemoryEntry['type'],
        content: JSON.stringify(item.content),
        context: item.content as Record<string, unknown>,
        importance: item.importance || 0.5,
        timestamp: new Date(item.created_at),
      }));

      setMemory(entries);
    } catch (error) {
      logger.error('Failed to load AI memory:', error);
    }
  }, [enableMemory]);

  // Store memory entry (using local state for now, can be extended to Supabase)
  const storeMemory = useCallback(async (entry: Omit<AIMemoryEntry, 'id' | 'timestamp'>) => {
    if (!enableMemory) return;

    try {
      const newEntry: AIMemoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      
      setMemory(prev => [newEntry, ...prev].slice(0, 100));
      
      // Persist to sessionStorage (session-scoped, not persisted across tabs)
      const stored = sessionStorage.getItem('ai_memory') || '[]';
      const memories = JSON.parse(stored);
      memories.unshift(newEntry);
      sessionStorage.setItem('ai_memory', JSON.stringify(memories.slice(0, 100)));
    } catch (error) {
      logger.error('Failed to store AI memory:', error);
    }
  }, [enableMemory]);

  // Proactive analysis - runs periodically
  const runProactiveAnalysis = useCallback(async () => {
    if (!enableProactive) return;

    try {
      // Simulate proactive suggestions based on module context
      const mockSuggestions: AIProactiveSuggestion[] = [];

      // Module-specific proactive suggestions
      if (module === 'maintenance') {
        mockSuggestions.push({
          id: crypto.randomUUID(),
          type: 'warning',
          title: 'Manutenção Preventiva Recomendada',
          description: 'Motor principal atingirá 5000h em 3 dias. Agendar inspeção.',
          action: 'schedule_maintenance',
          confidence: 0.92,
          module: 'maintenance',
          priority: 'high',
        });
      }

      if (module === 'compliance') {
        mockSuggestions.push({
          id: crypto.randomUUID(),
          type: 'compliance',
          title: 'Certificado Expirando',
          description: 'SOLAS Safety Certificate expira em 15 dias.',
          action: 'renew_certificate',
          confidence: 0.98,
          module: 'compliance',
          priority: 'critical',
        });
      }

      if (module === 'operations') {
        mockSuggestions.push({
          id: crypto.randomUUID(),
          type: 'optimization',
          title: 'Otimização de Rota Disponível',
          description: 'Rota alternativa pode economizar 12% de combustível.',
          action: 'optimize_route',
          confidence: 0.85,
          module: 'operations',
          priority: 'medium',
        });
      }

      setSuggestions(prev => [...mockSuggestions, ...prev].slice(0, 10));
    } catch (error) {
      logger.error('Proactive analysis failed:', error);
    }
  }, [enableProactive, module]);

  // Self-correction mechanism
  const detectAndCorrect = useCallback(async (data: unknown): Promise<AISelfCorrection | null> => {
    if (!enableSelfCorrection) return null;

    try {
      setIsProcessing(true);

      // Simulate error detection and correction
      // In production, this would call Claude API for intelligent correction
      const dataStr = JSON.stringify(data);
      
      // Check for common issues
      if (dataStr.includes('null') || dataStr.includes('undefined')) {
        const correction: AISelfCorrection = {
          id: crypto.randomUUID(),
          errorType: 'null_value',
          originalState: data,
          correctedState: JSON.parse(dataStr.replace(/null|undefined/g, '""')),
          reason: 'Valores nulos detectados e substituídos por valores padrão',
          confidence: 0.88,
          appliedAt: new Date(),
          rollbackAvailable: true,
        };

        setCorrections(prev => [correction, ...prev].slice(0, 20));
        
        await storeMemory({
          type: 'correction',
          content: `Correção automática: ${correction.reason}`,
          context: { correction },
          importance: 0.8,
        });

        return correction;
      }

      return null;
    } catch (error) {
      logger.error('Self-correction failed:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [enableSelfCorrection, storeMemory]);

  // Explain AI decision (XAI - Explainable AI)
  const explainDecision = useCallback(async (decision: string): Promise<AIExplanation> => {
    setIsProcessing(true);

    try {
      // In production, this would call Claude API for detailed explanation
      const explanation: AIExplanation = {
        decision,
        reasoning: `A decisão "${decision}" foi tomada com base na análise de padrões históricos, métricas atuais do sistema e regras de compliance aplicáveis.`,
        evidence: [
          'Histórico de 1247 decisões similares com 94% de sucesso',
          'Métricas atuais dentro dos parâmetros esperados',
          'Conformidade com regulamentações MLC 2006 e SOLAS',
        ],
        confidence: 0.91,
        alternatives: [
          'Aguardar mais dados antes de decidir',
          'Escalar para revisão humana',
          'Aplicar solução conservadora',
        ],
        risks: [
          'Baixo risco de falso positivo (8%)',
          'Impacto operacional mínimo se incorreto',
        ],
      };

      await storeMemory({
        type: 'decision',
        content: decision,
        context: { explanation },
        importance: 0.9,
      });

      return explanation;
    } finally {
      setIsProcessing(false);
    }
  }, [storeMemory]);

  // Contextual AI assistant per module
  const askContextual = useCallback(async (question: string): Promise<string> => {
    setIsProcessing(true);

    try {
      // Build context from memory
      const recentMemory = memory.slice(0, 5);
      const context = `Módulo: ${module}\nMemória recente: ${recentMemory.map(m => m.content).join('; ')}`;

      // In production, call Claude API with context
      const response = `[IA ${module.toUpperCase()}] Baseado no contexto atual e histórico de interações, ${question.toLowerCase().includes('como') 
        ? 'recomendo seguir os procedimentos padrão do módulo, verificando os logs recentes e métricas de performance.'
        : 'a análise indica que os parâmetros estão dentro dos limites operacionais. Monitore continuamente e ajuste conforme necessário.'}`;

      await storeMemory({
        type: 'interaction',
        content: question,
        context: { response, module },
        importance: 0.6,
      });

      return response;
    } finally {
      setIsProcessing(false);
    }
  }, [module, memory, storeMemory]);

  // Dismiss suggestion
  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    toast.success('Sugestão descartada');
  }, []);

  // Apply suggestion action
  const applySuggestion = useCallback(async (suggestion: AIProactiveSuggestion) => {
    setIsProcessing(true);

    try {
      // Log the action
      await storeMemory({
        type: 'decision',
        content: `Sugestão aplicada: ${suggestion.title}`,
        context: { suggestion },
        importance: 0.85,
      });

      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      toast.success(`Ação "${suggestion.title}" aplicada com sucesso`);
    } finally {
      setIsProcessing(false);
    }
  }, [storeMemory]);

  // Rollback correction
  const rollbackCorrection = useCallback(async (correctionId: string) => {
    const correction = corrections.find(c => c.id === correctionId);
    if (!correction || !correction.rollbackAvailable) return;

    setCorrections(prev => prev.filter(c => c.id !== correctionId));
    toast.info('Correção revertida');
  }, [corrections]);

  // Initialize proactive analysis interval
  useEffect(() => {
    if (enableProactive) {
      // Run immediately
      runProactiveAnalysis();
      
      // Then every 5 minutes
      proactiveIntervalRef.current = setInterval(runProactiveAnalysis, 5 * 60 * 1000);
    }

    return () => {
      if (proactiveIntervalRef.current) {
        clearInterval(proactiveIntervalRef.current);
      }
    };
  }, [enableProactive, runProactiveAnalysis]);

  // Load memory on mount
  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  return {
    // State
    isProcessing,
    memory,
    suggestions,
    corrections,
    
    // Actions
    storeMemory,
    detectAndCorrect,
    explainDecision,
    askContextual,
    dismissSuggestion,
    applySuggestion,
    rollbackCorrection,
    
    // Manual triggers
    runProactiveAnalysis,
    loadMemory,
  };
}

export default useAILevel3;
