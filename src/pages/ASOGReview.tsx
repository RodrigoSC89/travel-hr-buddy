/**
 * ASOG Review Page
 * Activity Specific Operating Guidelines - Maritime DP Operations Compliance
 * Module #33/33 - Nautilus One v1.1.0
 */

import React, { useState } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { asogService } from "@/modules/asog-review/asogService";
import type { OperationalData, ValidationResult, ASOGReport, ASOGLimits } from "@/modules/asog-review/types";
import { toast } from "sonner";
import {
  Shield,
  Anchor,
  Wind,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  Play,
  FileJson,
  Activity
} from "lucide-react";

const ASOGReview = () => {
  const [dados, setDados] = useState<OperationalData | null>(null);
  const [resultado, setResultado] = useState<ValidationResult | null>(null);
  const [relatorio, setRelatorio] = useState<ASOGReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [limits] = useState<ASOGLimits>(asogService.getASOGLimits());

  /**
   * Execute ASOG Review
   */
  const handleExecutarReview = () => {
    setIsProcessing(true);
    
    try {
      toast.info("Iniciando ASOG Review...");
      
      const reviewResult = asogService.start();
      
      setDados(reviewResult.dados);
      setResultado(reviewResult.resultado);
      setRelatorio(reviewResult.relatorio);
      
      if (reviewResult.resultado.conformidade) {
        toast.success("✅ CONFORME - Operação dentro dos parâmetros ASOG");
      } else {
        toast.warning("❌ NÃO CONFORME - Violações detectadas", {
          description: reviewResult.resultado.alertas.join("\n"),
        });
      }
    } catch (error) {
      toast.error("Erro ao executar ASOG Review", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Download report as JSON
   */
  const handleDownloadRelatorio = () => {
    if (!relatorio) {
      toast.error("Nenhum relatório disponível para download");
      return;
    }

    try {
      asogService.downloadRelatorio(relatorio);
      toast.success("Relatório baixado com sucesso");
    } catch (error) {
      toast.error("Erro ao baixar relatório", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  /**
   * Reset service and clear data
   */
  const handleReset = () => {
    asogService.reset();
    setDados(null);
    setResultado(null);
    setRelatorio(null);
    toast.info("ASOG Review resetado");
  };

  /**
   * Get status color based on conformance
   */
  const getStatusColor = (conforme: boolean) => {
    return conforme ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  /**
   * Get badge variant based on value and limit
   */
  const getBadgeVariant = (value: number, limit: number, isMax: boolean): "default" | "destructive" | "outline" => {
    if (isMax && value > limit) return "destructive";
    if (!isMax && value < limit) return "destructive";
    return "default";
  };

  /**
   * Get DP status color
   */
  const getDPStatusColor = (status: string): string => {
    switch (status) {
      case "Green":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "Yellow":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
      case "Red":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Shield}
        title="ASOG Review"
        description="Activity Specific Operating Guidelines - Dynamic Positioning Operations Compliance"
        gradient="blue"
        badges={[
          { icon: Shield, label: "DP Compliance" },
          { icon: Activity, label: "Real-time Validation" },
          { icon: FileJson, label: "JSON Reports" },
        ]}
      />

      {/* Control Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Painel de Controle
          </CardTitle>
          <CardDescription>
            Execute revisões ASOG, baixe relatórios e gerencie operações DP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExecutarReview}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isProcessing ? "Processando..." : "Executar ASOG Review"}
            </Button>
            
            <Button
              onClick={handleDownloadRelatorio}
              disabled={!relatorio}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar Relatório
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ASOG Limits Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Limites ASOG Configurados
          </CardTitle>
          <CardDescription>
            Parâmetros de segurança para operações de posicionamento dinâmico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">Velocidade do Vento</span>
              </div>
              <div className="text-2xl font-bold">{limits.wind_speed_max} nós</div>
              <div className="text-sm text-muted-foreground">Máximo permitido</div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold">Perda de Thrusters</span>
              </div>
              <div className="text-2xl font-bold">{limits.thruster_loss_tolerance} unidade</div>
              <div className="text-sm text-muted-foreground">Tolerância máxima</div>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-semibold">Status DP</span>
              </div>
              <div className="text-2xl font-bold">{limits.dp_alert_level}</div>
              <div className="text-sm text-muted-foreground">Nível requerido</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Data */}
      {dados && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Dados Operacionais Coletados
            </CardTitle>
            <CardDescription>
              Timestamp: {new Date(dados.timestamp).toLocaleString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    <span className="font-semibold">Vento</span>
                  </div>
                  <Badge variant={getBadgeVariant(dados.wind_speed, limits.wind_speed_max, true)}>
                    {dados.wind_speed > limits.wind_speed_max ? "Acima do Limite" : "Normal"}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{dados.wind_speed} nós</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="font-semibold">Thrusters</span>
                  </div>
                  <Badge variant={getBadgeVariant(dados.thrusters_operacionais, 4 - limits.thruster_loss_tolerance, false)}>
                    {4 - dados.thrusters_operacionais > limits.thruster_loss_tolerance ? "Crítico" : "Normal"}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{dados.thrusters_operacionais}/4 operacionais</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-semibold">DP Status</span>
                  </div>
                </div>
                <div className={`text-2xl font-bold px-3 py-1 rounded-md inline-block ${getDPStatusColor(dados.dp_status)}`}>
                  {dados.dp_status}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {resultado && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {resultado.conformidade ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              Resultado da Validação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold mb-4 ${getStatusColor(resultado.conformidade)}`}>
              {resultado.conformidade ? "✅ CONFORME" : "❌ NÃO CONFORME"}
            </div>
            
            {resultado.alertas.length > 0 && (
              <div className="space-y-2">
                <div className="font-semibold">Alertas Detectados:</div>
                {resultado.alertas.map((alerta, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{alerta}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
            
            {resultado.conformidade && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Todas as operações estão dentro dos parâmetros ASOG estabelecidos.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* JSON Report Preview */}
      {relatorio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Prévia do Relatório JSON
            </CardTitle>
            <CardDescription>
              Relatório estruturado para auditoria e registro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(relatorio, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </ModulePageWrapper>
  );
};

export default ASOGReview;
