/**
 * DowntimeAIAnalysisCard - Análise IA de eventos de downtime
 * Verifica justificativas, calcula impacto SLA, e sugere ações
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
import { logger } from '@/lib/logger';
  Brain, AlertTriangle, CheckCircle, XCircle, Clock,
  Loader2, FileText, DollarSign, Shield, Lightbulb,
  TrendingUp, TrendingDown, RefreshCw
} from "lucide-react";

interface DowntimeEvent {
  id: string;
  start_time: string;
  end_time?: string | null;
  duration_hours?: number | null;
  reason: string | null;
  reason_category: string | null;
  impact_level: string | null;
  justification_status: string | null;
  ai_analysis?: any;
  contract_id?: string | null;
}

interface AIAnalysisResult {
  justification_valid: boolean;
  sla_impact: number;
  penalty_estimate: number;
  analysis: string;
  recommendations: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  generated_at: string;
}

interface DowntimeAIAnalysisCardProps {
  events: DowntimeEvent[];
  contracts: Array<{
    id: string;
    contract_number: string;
    client_name: string;
    sla_downtime_percent: number | null;
    penalty_per_hour: number | null;
  }>;
  onAnalysisComplete?: () => void;
}

export function DowntimeAIAnalysisCard({ events, contracts, onAnalysisComplete }: DowntimeAIAnalysisCardProps) {
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AIAnalysisResult>>({});
  const [selectedEvent, setSelectedEvent] = useState<DowntimeEvent | null>(null);

  const analyzeDowntime = async (event: DowntimeEvent) => {
    setAnalyzing(event.id);
    setSelectedEvent(event);

    try {
      // Find associated contract
      const contract = contracts.find(c => c.id === event.contract_id) || contracts[0];
      
      if (!contract) {
        toast.error("Nenhum contrato encontrado para análise");
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-downtime', {
        body: {
          downtime_event: {
            start_time: event.start_time,
            end_time: event.end_time,
            reason: event.reason,
            system_affected: event.reason_category,
            impact_level: event.impact_level,
            duration_hours: event.duration_hours
          },
          contract: {
            sla_downtime_percent: contract.sla_downtime_percent || 5,
            penalty_per_hour: contract.penalty_per_hour || 1000,
            client: contract.client_name
          },
          vessel_name: "Embarcação Principal"
        }
      });

      if (error) throw error;

      const result: AIAnalysisResult = {
        justification_valid: data.justification_valid || false,
        sla_impact: data.sla_impact || 0,
        penalty_estimate: data.penalty_estimate || 0,
        analysis: data.analysis || "Análise não disponível",
        recommendations: data.recommendations || [],
        risk_level: determineRiskLevel(data.sla_impact || 0, event.impact_level),
        generated_at: data.generated_at || new Date().toISOString()
      };

      setAnalysisResults(prev => ({ ...prev, [event.id]: result }));
      toast.success("Análise IA concluída!");
      onAnalysisComplete?.();

    } catch (error) {
      logger.error("AI Analysis error:", error);
      toast.error("Erro na análise IA");
    } finally {
      setAnalyzing(null);
    }
  };

  const determineRiskLevel = (slaImpact: number, impactLevel: string | null): 'low' | 'medium' | 'high' | 'critical' => {
    if (impactLevel === 'critical' || slaImpact > 75) return 'critical';
    if (impactLevel === 'high' || slaImpact > 50) return 'high';
    if (impactLevel === 'medium' || slaImpact > 25) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const pendingAnalysis = events.filter(e => !analysisResults[e.id]);
  const analyzedEvents = events.filter(e => analysisResults[e.id]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Análise IA de Downtime
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Verificação inteligente de justificativas e cálculo de impacto SLA
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Eventos pendentes de análise */}
        {pendingAnalysis.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Pendentes de Análise ({pendingAnalysis.length})
            </h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {pendingAnalysis.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-4 w-4 ${
                        event.impact_level === 'critical' ? 'text-red-500' : 
                        event.impact_level === 'high' ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          {event.reason || 'Motivo não especificado'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.duration_hours ? `${event.duration_hours.toFixed(1)}h` : 'N/A'} • 
                          {new Date(event.start_time).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeDowntime(event)}
                      disabled={analyzing === event.id}
                    >
                      {analyzing === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-1" />
                          Analisar
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <Separator />

        {/* Resultados da Análise */}
        {selectedEvent && analysisResults[selectedEvent.id] && (
          <div className="space-y-4 animate-in fade-in-50">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Resultado da Análise
            </h4>
            
            {(() => {
              const result = analysisResults[selectedEvent.id];
              return (
                <div className="space-y-4">
                  {/* Status Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {result.justification_valid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Justificativa</p>
                      <Badge variant={result.justification_valid ? 'default' : 'destructive'}>
                        {result.justification_valid ? 'Válida' : 'Inválida'}
                      </Badge>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <Shield className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Impacto SLA</p>
                      <p className="font-bold text-lg">{result.sla_impact}%</p>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <DollarSign className="h-4 w-4 mx-auto text-green-500 mb-1" />
                      <p className="text-xs text-muted-foreground">Penalidade Est.</p>
                      <p className="font-bold text-lg">
                        ${result.penalty_estimate.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <AlertTriangle className="h-4 w-4 mx-auto mb-1" style={{ 
                        color: result.risk_level === 'critical' ? '#ef4444' : 
                               result.risk_level === 'high' ? '#f97316' : 
                               result.risk_level === 'medium' ? '#eab308' : '#22c55e'
                      }} />
                      <p className="text-xs text-muted-foreground">Nível Risco</p>
                      <Badge className={getRiskColor(result.risk_level)}>
                        {result.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Análise Detalhada */}
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Análise Detalhada
                    </h5>
                    <ScrollArea className="h-[150px]">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {result.analysis}
                      </p>
                    </ScrollArea>
                  </div>

                  {/* Recomendações */}
                  {result.recommendations.length > 0 && (
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-blue-500">
                        <Lightbulb className="h-4 w-4" />
                        Recomendações IA
                      </h5>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Histórico de análises */}
        {analyzedEvents.length > 0 && !selectedEvent && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Análises Concluídas ({analyzedEvents.length})
            </h4>
            <div className="space-y-2">
              {analyzedEvents.slice(0, 3).map((event) => {
                const result = analysisResults[event.id];
                return (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getRiskColor(result.risk_level)}`} />
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          {event.reason || 'Evento analisado'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SLA: {result.sla_impact}% • Penalidade: ${result.penalty_estimate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={result.justification_valid ? 'outline' : 'destructive'}>
                      {result.justification_valid ? 'Justificado' : 'Não Justificado'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum evento de downtime para análise</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DowntimeAIAnalysisCard;
