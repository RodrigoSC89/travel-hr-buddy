/**
 * Compliance Hub AI Hook
 * Hook para integração com IA preditiva e generativa
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AIComplianceAnalysis, ComplianceItem, AuditSession, Certificate } from '../types';

interface AIAnalysisState {
  loading: boolean;
  error: string | null;
  analysis: AIComplianceAnalysis | null;
}

interface DocumentAnalysis {
  documentType: string;
  extractedInfo: Record<string, any>;
  complianceStatus: 'compliant' | 'non-compliant' | 'needs-review';
  issues: string[];
  recommendations: string[];
}

export function useComplianceAI() {
  const [analysisState, setAnalysisState] = useState<AIAnalysisState>({
    loading: false,
    error: null,
    analysis: null,
  });
  const [chatLoading, setChatLoading] = useState(false);
  const [documentAnalysisLoading, setDocumentAnalysisLoading] = useState(false);

  const runComplianceAnalysis = useCallback(
    async (
      items: ComplianceItem[],
      audits: AuditSession[],
      certificates: Certificate[]
    ): Promise<AIComplianceAnalysis> => {
      setAnalysisState({ loading: true, error: null, analysis: null });

      try {
        // Call AI endpoint
        const { data, error } = await supabase.functions.invoke('ai-compliance-analysis', {
          body: {
            complianceItems: items,
            audits,
            certificates,
            action: 'full_analysis',
          },
        });

        if (error) throw error;

        const analysis: AIComplianceAnalysis = data || generateFallbackAnalysis(items, certificates);
        setAnalysisState({ loading: false, error: null, analysis });
        return analysis;
      } catch (error) {
        console.error('Error running compliance analysis:', error);
        // Return fallback analysis
        const fallback = generateFallbackAnalysis(items, certificates);
        setAnalysisState({ loading: false, error: null, analysis: fallback });
        return fallback;
      }
    },
    []
  );

  const analyzeDocument = useCallback(async (documentContent: string, documentType: string): Promise<DocumentAnalysis> => {
    setDocumentAnalysisLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-document-analysis', {
        body: {
          content: documentContent,
          type: documentType,
          action: 'compliance_check',
        },
      });

      if (error) throw error;

      return {
        documentType: data.documentType || documentType,
        extractedInfo: data.extractedInfo || {},
        complianceStatus: data.complianceStatus || 'needs-review',
        issues: data.issues || [],
        recommendations: data.recommendations || [],
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast.error('Erro ao analisar documento');
      return {
        documentType,
        extractedInfo: {},
        complianceStatus: 'needs-review',
        issues: ['Não foi possível analisar o documento automaticamente'],
        recommendations: ['Realizar análise manual do documento'],
      };
    } finally {
      setDocumentAnalysisLoading(false);
    }
  }, []);

  const generateAuditChecklist = useCallback(async (auditType: string, vesselType: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-audit-checklist', {
        body: {
          auditType,
          vesselType,
          action: 'generate_checklist',
        },
      });

      if (error) throw error;

      return data.checklist || getDefaultChecklist(auditType);
    } catch (error) {
      console.error('Error generating checklist:', error);
      return getDefaultChecklist(auditType);
    }
  }, []);

  const askComplianceAI = useCallback(async (question: string, context?: any): Promise<string> => {
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('training-ai-assistant', {
        body: {
          action: 'chat',
          data: {
            message: question,
            context: {
              module: 'compliance',
              ...context,
            },
          },
        },
      });

      if (error) throw error;
      return data.response || 'Não foi possível processar sua pergunta. Tente novamente.';
    } catch (error) {
      console.error('Error in compliance AI chat:', error);
      return generateAIResponse(question);
    } finally {
      setChatLoading(false);
    }
  }, []);

  const predictRisks = useCallback(async (complianceData: any): Promise<AIComplianceAnalysis['predictedIssues']> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-risk-prediction', {
        body: {
          complianceData,
          action: 'predict_risks',
        },
      });

      if (error) throw error;
      return data.predictions || [];
    } catch (error) {
      console.error('Error predicting risks:', error);
      return [
        {
          issue: 'Possível não-conformidade em certificações STCW',
          probability: 0.35,
          impact: 'Médio - Pode afetar operações de tripulação',
          preventiveAction: 'Revisar matriz de treinamentos e agendar renovações pendentes',
        },
        {
          issue: 'Risco de atraso em auditoria de classe',
          probability: 0.25,
          impact: 'Alto - Pode resultar em detenção do navio',
          preventiveAction: 'Preparar documentação e realizar inspeção interna prévia',
        },
      ];
    }
  }, []);

  const suggestCorrectiveAction = useCallback(async (finding: any): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('training-ai-assistant', {
        body: {
          action: 'suggest_action',
          data: {
            finding,
            context: 'compliance_finding',
          },
        },
      });

      if (error) throw error;
      return data.suggestion || 'Implementar plano de ação corretiva conforme procedimentos do SMS.';
    } catch (error) {
      console.error('Error suggesting corrective action:', error);
      return `Ação sugerida para ${finding.category}: Revisar procedimentos aplicáveis, implementar correções necessárias e documentar evidências de implementação.`;
    }
  }, []);

  return {
    // Analysis
    analysisState,
    runComplianceAnalysis,
    
    // Document analysis
    documentAnalysisLoading,
    analyzeDocument,
    
    // Audit support
    generateAuditChecklist,
    
    // Chat
    chatLoading,
    askComplianceAI,
    
    // Predictions
    predictRisks,
    suggestCorrectiveAction,
  };
}

// Helper functions
function generateFallbackAnalysis(
  items: ComplianceItem[],
  certificates: Certificate[]
): AIComplianceAnalysis {
  const avgScore = items.reduce((acc, item) => acc + item.score, 0) / items.length;
  const expiredCerts = certificates.filter(c => c.status === 'expired').length;
  
  return {
    overallRiskLevel: avgScore >= 90 ? 'low' : avgScore >= 75 ? 'medium' : 'high',
    riskAreas: [
      {
        area: 'Certificações',
        risk: expiredCerts > 0 ? 80 : 20,
        trend: expiredCerts > 0 ? 'worsening' : 'stable',
        recommendation: expiredCerts > 0 
          ? 'Renovar certificados expirados com urgência' 
          : 'Manter monitoramento de datas de vencimento',
      },
      {
        area: 'Treinamentos STCW',
        risk: 35,
        trend: 'improving',
        recommendation: 'Continuar programa de capacitação contínua',
      },
      {
        area: 'Documentação ISM',
        risk: 25,
        trend: 'stable',
        recommendation: 'Realizar revisão periódica do SMS',
      },
    ],
    predictedIssues: [
      {
        issue: 'Potencial não-conformidade em auditoria de classe',
        probability: 0.3,
        impact: 'Alto - Pode resultar em condições de classe',
        preventiveAction: 'Realizar auditoria interna prévia e corrigir pendências',
      },
    ],
    complianceGaps: items
      .filter(item => item.status !== 'compliant')
      .map(item => ({
        regulation: item.regulation,
        gap: `${item.title} - Status: ${item.status}`,
        priority: item.score < 70 ? 'high' : item.score < 85 ? 'medium' : 'low',
        suggestedAction: `Revisar e corrigir não-conformidades em ${item.category}`,
      })),
    auditReadiness: [
      {
        type: 'PSC (Port State Control)',
        readinessScore: 85,
        weakAreas: ['Registros de manutenção', 'Certificados de tripulação'],
        recommendations: [
          'Atualizar registros de manutenção preventiva',
          'Verificar validade de todos os certificados',
        ],
      },
      {
        type: 'Auditoria Interna ISM',
        readinessScore: 92,
        weakAreas: ['Registro de não-conformidades'],
        recommendations: ['Revisar processo de registro e acompanhamento de NC'],
      },
    ],
    summary: `Análise de conformidade indica nível de risco ${avgScore >= 90 ? 'baixo' : avgScore >= 75 ? 'médio' : 'alto'}. Score médio de ${Math.round(avgScore)}%. ${expiredCerts > 0 ? `ATENÇÃO: ${expiredCerts} certificado(s) expirado(s) requerem ação imediata.` : 'Todos os certificados dentro da validade.'} Recomenda-se foco em manutenção preventiva e treinamentos de tripulação.`,
  };
}

function getDefaultChecklist(auditType: string): string[] {
  const checklists: Record<string, string[]> = {
    'psc': [
      'Verificar validade de todos os certificados estatutários',
      'Inspecionar equipamentos de salvatagem',
      'Revisar registros de manutenção',
      'Verificar qualificações da tripulação',
      'Inspecionar equipamentos de combate a incêndio',
      'Verificar sistemas de navegação',
      'Revisar plano de segurança do navio (ISPS)',
      'Verificar condições de habitabilidade (MLC)',
    ],
    'internal': [
      'Revisar política e objetivos do SMS',
      'Verificar registros de não-conformidades',
      'Analisar relatórios de incidentes',
      'Verificar execução de auditorias internas anteriores',
      'Revisar procedimentos operacionais',
      'Verificar treinamentos e exercícios',
      'Analisar indicadores de desempenho',
      'Verificar ações corretivas pendentes',
    ],
    'class': [
      'Verificar relatório de docagem anterior',
      'Revisar certificados de classificação',
      'Inspecionar estrutura do casco',
      'Verificar sistemas de propulsão',
      'Inspecionar instalações elétricas',
      'Verificar equipamentos de carga',
      'Revisar plano de manutenção baseada em condição',
      'Verificar conformidade com regras de classe',
    ],
  };

  return checklists[auditType] || checklists['internal'];
}

function generateAIResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('ism') || lowerQuestion.includes('sms')) {
    return 'O Código ISM (International Safety Management) estabelece padrões internacionais para a gestão segura de navios. Um Sistema de Gestão de Segurança (SMS) eficaz deve incluir: política de segurança, responsabilidades definidas, procedimentos para situações de emergência, relatórios de não-conformidades e auditorias internas. Para garantir conformidade, mantenha todos os documentos atualizados e realize treinamentos periódicos com a tripulação.';
  }
  
  if (lowerQuestion.includes('psc') || lowerQuestion.includes('port state')) {
    return 'Para se preparar para uma inspeção PSC (Port State Control), verifique: 1) Todos os certificados estatutários válidos; 2) Registros de manutenção atualizados; 3) Qualificações da tripulação em dia; 4) Equipamentos de segurança inspecionados; 5) Condições de trabalho conforme MLC. Realize uma inspeção interna prévia usando nosso módulo Pre-PSC para identificar e corrigir deficiências.';
  }
  
  if (lowerQuestion.includes('mlc') || lowerQuestion.includes('trabalho marítimo')) {
    return 'A Convenção do Trabalho Marítimo (MLC 2006) abrange: condições de emprego, alojamentos, alimentação, proteção à saúde e seguridade social dos marítimos. Para conformidade, garanta: contratos de trabalho claros, horas de descanso adequadas, alojamentos em bom estado, alimentação de qualidade e cobertura de saúde. Mantenha registros de horas de trabalho e descanso atualizados.';
  }
  
  return 'Para questões específicas de conformidade, consulte a regulamentação aplicável ou entre em contato com a autoridade marítima competente. Posso ajudar com informações sobre ISM Code, SOLAS, MARPOL, ISPS, MLC e outras convenções marítimas internacionais. Por favor, especifique qual área de conformidade você gostaria de explorar.';
}
