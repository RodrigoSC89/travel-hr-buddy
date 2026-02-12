/**
 * AdvancedDowntimeValidator - AI-powered downtime validation component
 * Implements multi-factor validation with BROA evidence generation
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/utils/production-logger";
import { 
  Brain, FileCheck, AlertTriangle, CheckCircle2, XCircle,
  Download, RefreshCw, Shield, Clock, BarChart3, FileText
} from "lucide-react";

interface ValidationResult {
  is_valid: boolean;
  confidence: number;
  reasoning: string;
  required_evidence: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  broa_compliant: boolean;
  validation_factors: {
    technical_validity: number;
    documentation_completeness: number;
    historical_consistency: number;
    severity_proportionality: number;
  };
}

interface Props {
  downtimeId?: string;
  downtimeEvent?: {
    start_time: string;
    end_time?: string;
    reason: string;
    reason_category: string;
    impact_level: string;
    duration_hours?: number;
  };
  onValidationComplete?: (result: ValidationResult) => void;
}

export function AdvancedDowntimeValidator({ downtimeId, downtimeEvent, onValidationComplete }: Props) {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{
    validation: ValidationResult;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- BROA evidence is dynamic JSON from edge function
    broa_evidence: { document_type?: string; version?: string; generated_at?: string; downtime_event?: { id?: string }; validation?: { status?: string }; compliance?: { references?: string[] }; [key: string]: unknown };
    duration_hours: number;
    historical_events_analyzed: number;
  } | null>(null);

  const runValidation = async () => {
    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-downtime-ai', {
        body: { 
          downtimeId,
          downtime_entry: downtimeEvent,
          include_historical_analysis: true
        },
      });

      if (error) throw error;
      
      setResult(data);
      onValidationComplete?.(data.validation);
      toast.success('Validação IA concluída com sucesso');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error('Validation error:', { error: errorMessage });
      if (errorMessage.includes('429')) {
        toast.error('Limite de requisições excedido. Tente novamente em alguns minutos.');
      } else {
        toast.error('Erro ao validar downtime com IA');
      }
    } finally {
      setValidating(false);
    }
  };

  const downloadBROAEvidence = () => {
    if (!result?.broa_evidence) return;
    
    const blob = new Blob([JSON.stringify(result.broa_evidence, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `broa-evidence-${result.broa_evidence.downtime_event?.id || 'new'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Evidência BROA exportada');
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-info" />
            Validador de Downtime com IA
          </CardTitle>
          <Button 
            onClick={runValidation} 
            disabled={validating}
            size="sm"
          >
            {validating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Validar com IA
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!result ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Clique em "Validar com IA" para iniciar a análise</p>
            <p className="text-sm mt-1">A IA analisará a justificativa, histórico e conformidade BROA</p>
          </div>
        ) : (
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Resumo</TabsTrigger>
              <TabsTrigger value="factors">Fatores</TabsTrigger>
              <TabsTrigger value="analysis">Análise</TabsTrigger>
              <TabsTrigger value="broa">BROA</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {/* Status Principal */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {result.validation.is_valid ? (
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  ) : (
                    <XCircle className="h-8 w-8 text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold text-lg">
                      {result.validation.is_valid ? 'Justificativa Válida' : 'Requer Revisão'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Confiança: {result.validation.confidence}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRiskColor(result.validation.risk_level)}>
                    Risco: {result.validation.risk_level.toUpperCase()}
                  </Badge>
                  {result.validation.broa_compliant && (
                    <Badge variant="outline" className="border-success text-success">
                      <Shield className="h-3 w-3 mr-1" />
                      BROA Compliant
                    </Badge>
                  )}
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-info" />
                  <p className="text-xl font-bold">{result.duration_hours.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Duração</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <BarChart3 className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <p className="text-xl font-bold">{result.historical_events_analyzed}</p>
                  <p className="text-xs text-muted-foreground">Histórico</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <p className="text-xl font-bold">{result.validation.required_evidence.length}</p>
                  <p className="text-xs text-muted-foreground">Evidências</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <FileCheck className="h-5 w-5 mx-auto mb-1 text-success" />
                  <p className="text-xl font-bold">{result.validation.recommendations.length}</p>
                  <p className="text-xs text-muted-foreground">Recomendações</p>
                </div>
              </div>

              {/* Evidências Necessárias */}
              {result.validation.required_evidence.length > 0 && (
                <div className="p-4 border border-warning/50 bg-warning/10 rounded-lg">
                  <p className="font-medium text-warning flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Evidências Necessárias
                  </p>
                  <ul className="space-y-1">
                    {result.validation.required_evidence.map((ev) => (
                      <li key={ev} className="text-sm flex items-start gap-2">
                        <span className="text-warning">•</span>
                        {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="factors" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Fatores de validação analisados pela IA:
              </p>
              
              {Object.entries(result.validation.validation_factors).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className={getScoreColor(value)}>{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}

              <div className="p-4 bg-muted/30 rounded-lg mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Score Médio:</strong>{' '}
                  {(Object.values(result.validation.validation_factors).reduce((a, b) => a + b, 0) / 4).toFixed(0)}%
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Análise Detalhada:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {result.validation.reasoning}
                    </p>
                  </div>

                  {result.validation.recommendations.length > 0 && (
                    <div>
                      <p className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Recomendações:
                      </p>
                      <ul className="space-y-2">
                        {result.validation.recommendations.map((rec, recIdx) => (
                          <li key={rec} className="text-sm p-2 bg-muted/30 rounded flex items-start gap-2">
                            <span className="text-success font-medium">{recIdx + 1}.</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="broa" className="space-y-4">
              {result.broa_evidence ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-success" />
                      <span className="font-medium">Evidência BROA Gerada</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadBROAEvidence}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar JSON
                    </Button>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span>{result.broa_evidence.document_type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Versão:</span>
                      <span>{result.broa_evidence.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gerado em:</span>
                      <span>{new Date(String(result.broa_evidence.generated_at || '')).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="default" className="bg-success">
                        {result.broa_evidence.validation?.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Normas:</span>
                      <span>{result.broa_evidence.compliance?.references?.join(', ')}</span>
                    </div>
                  </div>

                  <ScrollArea className="h-[200px] border rounded-lg p-3">
                    <pre className="text-xs">
                      {JSON.stringify(result.broa_evidence, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Evidência BROA não disponível</p>
                  <p className="text-sm mt-1">
                    A evidência é gerada apenas para downtimes validados como conformes
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export default AdvancedDowntimeValidator;
