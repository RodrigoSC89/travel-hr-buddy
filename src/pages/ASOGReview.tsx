import React, { useState } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { asogService } from "@/modules/asog-review/asogService";
import type { OperationalData, ValidationResult, ASOGReport } from "@/modules/asog-review/types";
import {
  Shield,
  Anchor,
  Wind,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Play,
  RotateCcw,
  TrendingUp,
  Activity,
  FileJson,
} from "lucide-react";

const ASOGReview = () => {
  const { toast } = useToast();
  const [operationalData, setOperationalData] = useState<OperationalData | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [report, setReport] = useState<ASOGReport | null>(null);

  const limits = asogService.getLimits();

  const handleExecuteReview = () => {
    try {
      const { dados, resultado, relatorio } = asogService.start();
      setOperationalData(dados);
      setValidationResult(resultado);
      setReport(relatorio);

      toast({
        title: resultado.conformidade ? "✅ CONFORME" : "❌ NÃO CONFORME",
        description: resultado.conformidade
          ? "Operação dentro dos parâmetros ASOG"
          : `${resultado.alertas.length} violação(ões) detectada(s)`,
        variant: resultado.conformidade ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar revisão ASOG",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = () => {
    if (!report) {
      toast({
        title: "Aviso",
        description: "Execute uma revisão primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      asogService.downloadRelatorio(report);
      toast({
        title: "Sucesso",
        description: "Relatório baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar relatório",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setOperationalData(null);
    setValidationResult(null);
    setReport(null);
    toast({
      title: "Reset",
      description: "Dados limpos com sucesso",
    });
  };

  const getWindSpeedStatus = (windSpeed: number) => {
    if (windSpeed > limits.max_wind_speed) {
      return { color: "bg-red-500", text: "Acima do Limite" };
    }
    if (windSpeed > limits.max_wind_speed * 0.8) {
      return { color: "bg-yellow-500", text: "Próximo ao Limite" };
    }
    return { color: "bg-green-500", text: "Normal" };
  };

  const getThrusterStatus = (operational: number) => {
    const total = 4;
    const lost = total - operational;
    if (lost > limits.max_thruster_loss) {
      return { color: "bg-red-500", text: "Excede Limite" };
    }
    if (lost === limits.max_thruster_loss) {
      return { color: "bg-yellow-500", text: "No Limite" };
    }
    return { color: "bg-green-500", text: "Normal" };
  };

  const getDPStatusColor = (status: string) => {
    switch (status) {
    case "Green":
      return "bg-green-500";
    case "Yellow":
      return "bg-yellow-500";
    case "Red":
      return "bg-red-500";
    default:
      return "bg-gray-500";
    }
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="ASOG Review - DP Operations"
        description="Revisão de Diretrizes Operacionais Específicas para Operações com Dynamic Positioning"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "ASOG Compliance" },
          { icon: Activity, label: "Real-time Validation" },
          { icon: TrendingUp, label: "Module 33/33" },
        ]}
      />

      {/* Control Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Painel de Controle
          </CardTitle>
          <CardDescription>Execute revisões ASOG e gerencie relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExecuteReview} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Executar Revisão ASOG
            </Button>
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              disabled={!report}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar Relatório
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={!operationalData}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ASOG Limits Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Limites ASOG Configurados
          </CardTitle>
          <CardDescription>Limites máximos para operações seguras com DP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Wind className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Velocidade do Vento</p>
                <p className="text-2xl font-bold">{limits.max_wind_speed} knots</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Activity className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Perda de Thrusters</p>
                <p className="text-2xl font-bold">{limits.max_thruster_loss} unidade</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <AlertTriangle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Status DP Requerido</p>
                <p className="text-2xl font-bold">{limits.required_dp_status}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Data Display */}
      {operationalData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Dados Operacionais Coletados
            </CardTitle>
            <CardDescription>
              Coletado em: {new Date(operationalData.timestamp).toLocaleString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Wind Speed */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    Velocidade do Vento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">{operationalData.wind_speed} knots</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getWindSpeedStatus(operationalData.wind_speed).color}`} />
                      <span className="text-xs text-muted-foreground">
                        {getWindSpeedStatus(operationalData.wind_speed).text}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Thrusters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Thrusters Operacionais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">{operationalData.thrusters_operacionais}/4</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getThrusterStatus(operationalData.thrusters_operacionais).color}`} />
                      <span className="text-xs text-muted-foreground">
                        {getThrusterStatus(operationalData.thrusters_operacionais).text}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DP Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Status DP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className={`text-xl ${getDPStatusColor(operationalData.dp_status)}`}>
                      {operationalData.dp_status}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getDPStatusColor(operationalData.dp_status)}`} />
                      <span className="text-xs text-muted-foreground">
                        {operationalData.dp_status === limits.required_dp_status ? "Conforme" : "Não Conforme"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.conformidade ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado da Validação
            </CardTitle>
            <CardDescription>
              Status de conformidade com diretrizes ASOG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={validationResult.conformidade ? "default" : "destructive"}
                  className="text-lg py-2 px-4"
                >
                  {validationResult.conformidade ? "✅ CONFORME" : "❌ NÃO CONFORME"}
                </Badge>
              </div>

              {validationResult.alertas.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Alertas de Não Conformidade:</p>
                  <ul className="space-y-2">
                    {validationResult.alertas.map((alerta, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20"
                      >
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{alerta}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Report Preview */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Relatório JSON
            </CardTitle>
            <CardDescription>Visualização do relatório completo</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(report, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </ModulePageWrapper>
  );
};

export default ASOGReview;
