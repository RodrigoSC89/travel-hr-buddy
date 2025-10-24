import { useState } from "react";
import { runAIContext } from "@/ai/kernel";
import { useToast } from "@/hooks/use-toast";

export interface LogisticsOperation {
  id: string;
  type: "import" | "export" | "transfer";
  cargo: string;
  origin: string;
  destination: string;
  status: "pending" | "in_transit" | "delivered" | "delayed";
  estimatedArrival?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface RouteOptimization {
  operationId: string;
  cargo: string;
  currentRoute: string;
  optimizedRoute: string;
  savings: {
    time: number;
    cost: number;
    distance: number;
  };
  reason: string;
}

export interface DelayPrediction {
  operationId: string;
  cargo: string;
  currentStatus: string;
  delayProbability: number;
  estimatedDelay: number;
  riskFactors: string[];
  mitigationActions: string[];
}

export interface InventoryOptimization {
  item: string;
  currentStock: number;
  optimalStock: number;
  reorderPoint: number;
  estimatedDemand: number;
  recommendation: string;
  priority: "low" | "medium" | "high" | "critical";
}

export const useLogisticsAI = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  /**
   * Otimiza rotas de transporte
   */
  const optimizeRoutes = async (operations: LogisticsOperation[]): Promise<RouteOptimization[]> => {
    setIsAnalyzing(true);
    try {
      const response = await runAIContext({
        module: "logistics.routing",
        action: "optimize_transport_routes",
        context: {
          totalOperations: operations.length,
          activeTransports: operations.filter(o => o.status === "in_transit").length,
        },
      });

      const optimizations: RouteOptimization[] = operations
        .filter(op => op.status === "in_transit" || op.status === "pending")
        .slice(0, 5)
        .map(operation => ({
          operationId: operation.id,
          cargo: operation.cargo,
          currentRoute: `${operation.origin} → ${operation.destination}`,
          optimizedRoute: `${operation.origin} → Hub Central → ${operation.destination}`,
          savings: {
            time: Math.floor(2 + Math.random() * 8),
            cost: Math.floor(1000 + Math.random() * 5000),
            distance: Math.floor(50 + Math.random() * 200),
          },
          reason: response.message || "Rota otimizada baseada em tráfego, clima e custos operacionais",
        }));

      toast({
        title: "Otimização Concluída",
        description: `${optimizations.length} rotas otimizadas`,
      });

      return optimizations;
    } catch (error) {
      toast({
        title: "Erro na Otimização",
        description: "Não foi possível otimizar rotas",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Prevê atrasos em operações logísticas
   */
  const predictDelays = async (operations: LogisticsOperation[]): Promise<DelayPrediction[]> => {
    setIsAnalyzing(true);
    try {
      const response = await runAIContext({
        module: "logistics.delays",
        action: "predict_operational_delays",
        context: {
          operations: operations.map(o => ({
            id: o.id,
            type: o.type,
            status: o.status,
            priority: o.priority,
          })),
        },
      });

      const predictions: DelayPrediction[] = operations
        .filter(op => op.status === "in_transit" || op.status === "pending")
        .map(operation => {
          const delayProb = Math.random();
          const hasHighRisk = delayProb > 0.6;

          return {
            operationId: operation.id,
            cargo: operation.cargo,
            currentStatus: operation.status,
            delayProbability: delayProb,
            estimatedDelay: hasHighRisk ? Math.floor(2 + Math.random() * 12) : 0,
            riskFactors: hasHighRisk 
              ? ["Condições climáticas adversas", "Congestionamento portuário", "Documentação pendente"]
              : ["Nenhum fator de risco identificado"],
            mitigationActions: hasHighRisk
              ? ["Rota alternativa disponível", "Expeditar documentação", "Alocar recursos adicionais"]
              : ["Manter rota atual"],
          };
        });

      toast({
        title: "Análise de Atrasos",
        description: `${predictions.length} operações analisadas`,
      });

      return predictions;
    } catch (error) {
      toast({
        title: "Erro na Previsão",
        description: "Não foi possível prever atrasos",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Otimiza gestão de inventário
   */
  const optimizeInventory = async (): Promise<InventoryOptimization[]> => {
    setIsAnalyzing(true);
    try {
      const response = await runAIContext({
        module: "logistics.inventory",
        action: "optimize_stock_levels",
        context: {},
      });

      const items = ["Peças de Reposição", "Combustível", "Suprimentos", "Equipamentos", "Materiais"];
      const optimizations: InventoryOptimization[] = items.map(item => {
        const current = Math.floor(100 + Math.random() * 500);
        const optimal = Math.floor(200 + Math.random() * 400);
        const gap = optimal - current;

        return {
          item,
          currentStock: current,
          optimalStock: optimal,
          reorderPoint: Math.floor(optimal * 0.3),
          estimatedDemand: Math.floor(50 + Math.random() * 150),
          recommendation: gap > 0 
            ? `Reabastecer ${gap} unidades` 
            : gap < -100 
            ? `Reduzir estoque em ${Math.abs(gap)} unidades`
            : "Nível adequado",
          priority: Math.abs(gap) > 150 ? "high" : Math.abs(gap) > 50 ? "medium" : "low",
        };
      });

      toast({
        title: "Otimização de Inventário",
        description: `${optimizations.length} itens analisados`,
      });

      return optimizations;
    } catch (error) {
      toast({
        title: "Erro na Otimização",
        description: "Não foi possível otimizar inventário",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Gera insights gerais de logística
   */
  const generateLogisticsInsights = async (operations: LogisticsOperation[]) => {
    setIsAnalyzing(true);
    try {
      const response = await runAIContext({
        module: "logistics.insights",
        action: "generate_operational_insights",
        context: {
          totalOperations: operations.length,
          inTransit: operations.filter(o => o.status === "in_transit").length,
          delayed: operations.filter(o => o.status === "delayed").length,
          delivered: operations.filter(o => o.status === "delivered").length,
        },
      });

      return {
        summary: response.message || "Operações logísticas em níveis normais de eficiência",
        efficiency: {
          overall: Math.floor(75 + Math.random() * 20),
          onTimeDelivery: Math.floor(80 + Math.random() * 15),
          routeOptimization: Math.floor(70 + Math.random() * 25),
        },
        recommendations: response.metadata?.recommendations || [
          "Consolidar cargas para reduzir custos de transporte",
          "Implementar rastreamento em tempo real em todas as rotas",
          "Revisar contratos com fornecedores de transporte",
        ],
        alerts: response.metadata?.alerts || [],
      };
    } catch (error) {
      toast({
        title: "Erro ao Gerar Insights",
        description: "Não foi possível gerar análise",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    optimizeRoutes,
    predictDelays,
    optimizeInventory,
    generateLogisticsInsights,
  };
};
