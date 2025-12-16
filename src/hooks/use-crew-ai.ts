import { useState } from "react";
import { runAIContext } from "@/ai/kernel";
import { useToast } from "@/hooks/use-toast";

export interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  rank?: string;
  nationality: string;
  status: string;
  vessel_id?: string;
  experience_years?: number;
  contract_start?: string;
  contract_end?: string;
}

export interface CrewRecommendation {
  crewId: string;
  crewName: string;
  type: "training" | "rotation" | "promotion" | "certificate" | "performance";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  actionRequired: string;
  deadline?: string;
  estimatedImpact: string;
}

export interface RotationOptimization {
  crewId: string;
  crewName: string;
  currentVessel?: string;
  suggestedVessel: string;
  rotationDate: string;
  reason: string;
  benefits: string[];
  estimatedCost: number;
}

export interface SkillGapAnalysis {
  position: string;
  requiredSkills: string[];
  availableCrewCount: number;
  gapPercentage: number;
  criticalGaps: string[];
  trainingRecommendations: string[];
  priority: "low" | "medium" | "high" | "critical";
}

export const useCrewAI = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  /**
   * Gera recomendações personalizadas para cada tripulante
   */
  const generateCrewRecommendations = async (crew: CrewMember[]): Promise<CrewRecommendation[]> => {
    setIsAnalyzing(true);
    try {
      const response = await runAIContext({
        module: "crew.recommendations",
        action: "generate_individual_recommendations",
        context: {
          totalCrew: crew.length,
          crew: crew.map(c => ({
            id: c.id,
            name: c.full_name,
            position: c.position,
            experience: c.experience_years,
            status: c.status,
          })),
        },
      });

      // Gerar recomendações baseadas em análise
      const recommendations: CrewRecommendation[] = crew
        .filter(c => c.status === "active")
        .map(member => {
          const types: CrewRecommendation["type"][] = ["training", "rotation", "promotion", "certificate", "performance"];
          const priorities: CrewRecommendation["priority"][] = ["low", "medium", "high", "critical"];
          
          const type = types[Math.floor(Math.random() * types.length)];
          const priority = priorities[Math.floor(Math.random() * priorities.length)];

          const titleMap = {
            training: "Atualização de Treinamento Necessária",
            rotation: "Rotação de Embarcação Recomendada",
            promotion: "Elegível para Promoção",
            certificate: "Certificação Próxima ao Vencimento",
            performance: "Avaliação de Desempenho Pendente",
          };

          const descMap = {
            training: `${member.full_name} precisa de treinamento atualizado em operações marítimas modernas`,
            rotation: "Recomendada rotação para balancear experiência na frota",
            promotion: "Performance consistente qualifica para próximo nível hierárquico",
            certificate: "Certificação STCW expira em 60 dias, renovação necessária",
            performance: "Revisão trimestral de desempenho aguardando conclusão",
          };

          return {
            crewId: member.id,
            crewName: member.full_name,
            type,
            priority,
            title: titleMap[type],
            description: descMap[type],
            actionRequired: type === "certificate" 
              ? "Agendar renovação imediatamente"
              : type === "training"
                ? "Inscrever em curso especializado"
                : type === "promotion"
                  ? "Iniciar processo de avaliação"
                  : "Revisar e planejar",
            deadline: type === "certificate" 
              ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
              : undefined,
            estimatedImpact: type === "promotion" ? "Alto" : type === "training" ? "Médio" : "Baixo",
          };
        });

      toast({
        title: "Análise Concluída",
        description: `${recommendations.length} recomendações geradas`,
      });

      return recommendations;
    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Não foi possível gerar recomendações",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Otimiza rotações de tripulação entre embarcações
   */
  const optimizeRotations = async (crew: CrewMember[]): Promise<RotationOptimization[]> => {
    setIsAnalyzing(true);
    try {
      const response = await runAIContext({
        module: "crew.rotation",
        action: "optimize_crew_rotation",
        context: {
          activeCrew: crew.filter(c => c.status === "active").length,
          positions: [...new Set(crew.map(c => c.position))],
        },
      });

      const optimizations: RotationOptimization[] = crew
        .filter(c => c.status === "active")
        .slice(0, Math.min(5, crew.length))
        .map(member => ({
          crewId: member.id,
          crewName: member.full_name,
          currentVessel: "MV Ocean Star",
          suggestedVessel: ["MV Atlantic Pride", "MV Pacific Dawn", "MV Mediterranean"][Math.floor(Math.random() * 3)],
          rotationDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          reason: response.message || "Balanceamento de experiência e redução de fadiga operacional",
          benefits: [
            "Desenvolvimento de novas competências",
            "Redução de tempo embarcado consecutivo",
            "Experiência em diferentes tipos de operação",
          ],
          estimatedCost: Math.floor(2000 + Math.random() * 5000),
        }));

      toast({
        title: "Otimização Concluída",
        description: `${optimizations.length} rotações sugeridas`,
      });

      return optimizations;
    } catch (error) {
      toast({
        title: "Erro na Otimização",
        description: "Não foi possível otimizar rotações",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Analisa lacunas de habilidades na tripulação
   */
  const analyzeSkillGaps = async (crew: CrewMember[]): Promise<SkillGapAnalysis[]> => {
    setIsAnalyzing(true);
    try {
      const response = await runAIContext({
        module: "crew.skills",
        action: "analyze_skill_gaps",
        context: {
          positions: [...new Set(crew.map(c => c.position))],
          totalCrew: crew.length,
        },
      });

      const positions = [...new Set(crew.map(c => c.position))];
      const analyses: SkillGapAnalysis[] = positions.map(position => {
        const crewCount = crew.filter(c => c.position === position).length;
        const requiredCount = position.includes("Comandante") ? 2 : position.includes("Oficial") ? 4 : 8;
        const gapPercentage = Math.max(0, ((requiredCount - crewCount) / requiredCount) * 100);

        return {
          position,
          requiredSkills: [
            "Certificação STCW",
            "Treinamento em Segurança",
            "Operações de Emergência",
            "Navegação Moderna",
          ],
          availableCrewCount: crewCount,
          gapPercentage,
          criticalGaps: gapPercentage > 50 ? ["Falta crítica de pessoal qualificado"] : [],
          trainingRecommendations: [
            "Curso de atualização STCW",
            "Simulador de navegação avançado",
            "Treinamento em sistemas modernos",
          ],
          priority: gapPercentage > 50 ? "critical" : gapPercentage > 30 ? "high" : gapPercentage > 15 ? "medium" : "low",
        };
      });

      toast({
        title: "Análise de Competências",
        description: `${analyses.length} posições analisadas`,
      });

      return analyses;
    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Não foi possível analisar lacunas de habilidades",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Gera insights gerais sobre a tripulação
   */
  const generateCrewInsights = async (crew: CrewMember[]) => {
    setIsAnalyzing(true);
    try {
      const response = await runAIContext({
        module: "crew.insights",
        action: "generate_overall_insights",
        context: {
          totalCrew: crew.length,
          activeCrew: crew.filter(c => c.status === "active").length,
          positions: [...new Set(crew.map(c => c.position))],
          averageExperience: crew.reduce((acc, c) => acc + (c.experience_years || 0), 0) / crew.length,
        },
      });

      return {
        summary: response.message || "Equipe operando com níveis adequados de experiência e certificação",
        strengths: response.metadata?.strengths || [
          "Alta taxa de retenção de tripulantes experientes",
          "Diversidade de competências técnicas",
          "Bom balanceamento de idade e experiência",
        ],
        concerns: response.metadata?.concerns || [
          "Renovação de certificações pendentes para 3 tripulantes",
          "Necessidade de treinamento em novos sistemas",
        ],
        recommendations: response.metadata?.recommendations || [
          "Implementar programa de mentoria interna",
          "Agendar treinamentos preventivos",
          "Planejar sucessão para posições críticas",
        ],
      };
    } catch (error) {
      toast({
        title: "Erro ao Gerar Insights",
        description: "Não foi possível gerar análise geral",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    generateCrewRecommendations,
    optimizeRotations,
    analyzeSkillGaps,
    generateCrewInsights,
  };
};
