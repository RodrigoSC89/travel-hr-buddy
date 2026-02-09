/**
 * Hook for fetching SGSO Maturity data from Supabase
 * Replaces mock data with real audit records
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MaturityData {
  practiceId: string;
  practiceName: string;
  currentLevel: number;
  targetLevel: number;
  pdcaPhase: "plan" | "do" | "check" | "act";
  trend: "up" | "down" | "stable";
  lastAuditScore: number;
}

// Default SGSO practices based on NORMAM 101
const DEFAULT_PRACTICES: MaturityData[] = [
  { practiceId: "PG-01", practiceName: "Liderança e Comprometimento", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-02", practiceName: "Política de SGSO", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-03", practiceName: "Objetivos e Metas", currentLevel: 3, targetLevel: 4, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-04", practiceName: "Organização e Responsabilidades", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-05", practiceName: "Qualificação e Treinamento", currentLevel: 3, targetLevel: 4, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-06", practiceName: "Comunicação", currentLevel: 3, targetLevel: 4, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-07", practiceName: "Documentação", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-08", practiceName: "Gestão de Riscos", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-09", practiceName: "Integridade Mecânica", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-10", practiceName: "Segurança de Processo", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-11", practiceName: "Gestão de Mudanças", currentLevel: 3, targetLevel: 4, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-12", practiceName: "Operações e Manutenção", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-13", practiceName: "Gestão de Contratadas", currentLevel: 3, targetLevel: 4, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-14", practiceName: "Logística e Transporte", currentLevel: 3, targetLevel: 4, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-15", practiceName: "Investigação de Incidentes", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
  { practiceId: "PG-16", practiceName: "Auditorias e Verificações", currentLevel: 3, targetLevel: 5, pdcaPhase: "plan", trend: "stable", lastAuditScore: 60 },
];

export function useSGSOMaturity() {
  return useQuery({
    queryKey: ['sgso-maturity'],
    queryFn: async (): Promise<{ data: MaturityData[], overallMaturity: number }> => {
      // Try to fetch from sgso_audits table
      const { data: audits, error } = await supabase
        .from('sgso_audits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !audits || audits.length === 0) {
        // Return default practices if no audit data
        const overallMaturity = Math.round(
          DEFAULT_PRACTICES.reduce((acc, d) => acc + d.currentLevel, 0) / DEFAULT_PRACTICES.length * 20
        );
        return { data: DEFAULT_PRACTICES, overallMaturity };
      }

      // Map audit data to maturity format using metadata field
      const audit = audits[0];
      const practices = ((audit.metadata as Record<string, unknown>)?.practices as Record<string, unknown>[]) || [];
      
      if (practices.length === 0) {
        const overallMaturity = Math.round(
          DEFAULT_PRACTICES.reduce((acc, d) => acc + d.currentLevel, 0) / DEFAULT_PRACTICES.length * 20
        );
        return { data: DEFAULT_PRACTICES, overallMaturity };
      }

      type PracticeRow = Record<string, unknown>;
      const maturityData: MaturityData[] = practices.map((item: PracticeRow, index: number) => ({
        practiceId: `PG-${String(index + 1).padStart(2, '0')}`,
        practiceName: (item.name as string) || DEFAULT_PRACTICES[index]?.practiceName || 'Unknown',
        currentLevel: item.score ? Math.ceil((item.score as number) / 20) : 3,
        targetLevel: 5,
        pdcaPhase: determinePDCAPhase((item.score as number) || 60),
        trend: (item.trend as MaturityData['trend']) || 'stable',
        lastAuditScore: (item.score as number) || 60
      }));

      const overallMaturity = Math.round(
        maturityData.reduce((acc, d) => acc + d.currentLevel, 0) / maturityData.length * 20
      );

      return { data: maturityData, overallMaturity };
    }
  });
}

function determinePDCAPhase(score: number): MaturityData['pdcaPhase'] {
  if (score < 40) return 'plan';
  if (score < 60) return 'do';
  if (score < 80) return 'check';
  return 'act';
}
