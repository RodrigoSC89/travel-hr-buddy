import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { useToast } from "@/hooks/use-toast";
import { asogService } from "@/modules/asog-review/asogService";
import type { OperationalStatus, ValidationResult, ASOGReport, ASOGLimits } from "@/modules/asog-review/types";
import {
  Shield,
  Anchor,
  Wind,
  Settings,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  TrendingUp,
  Target,
  Play,
  FileJson,
} from "lucide-react";

const ASOGReview = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [dados, setDados] = useState<OperationalStatus | null>(null);
  const [resultado, setResultado] = useState<ValidationResult | null>(null);
  const [relatorio, setRelatorio] = useState<ASOGReport | null>(null);
  const [limites] = useState<ASOGLimits>(asogService.obterLimites());

  const handleRunASOGReview = async () => {
    setIsProcessing(true);
    try {
      const { dados: novoDados, resultado: novoResultado, relatorio: novoRelatorio } = asogService.start();
      setDados(novoDados);
      setResultado(novoResultado);
      setRelatorio(novoRelatorio);

      if (novoResultado.conformidade) {
        toast({
          title: "✅ Operação Conforme",
          description: "A operação está dentro dos parâmetros ASOG.",
          variant: "default",
        });
      } else {
        toast({
          title: "⚠️ Operação Não Conforme",
          description: `${novoResultado.alertas.length} alerta(s) identificado(s).`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao executar ASOG Review.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReport = () => {
    if (relatorio) {
      asogService.downloadRelatorio(relatorio);
      toast({
        title: "Relatório Baixado",
        description: "O relatório ASOG foi baixado com sucesso.",
      });
    }
  };

  const handleReset = () => {
    setDados(null);
    setResultado(null);
    setRelatorio(null);
    toast({
      title: "Dados Resetados",
      description: "Execute um novo ASOG Review.",
    });
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="ASOG Review"
        description="Sistema de Auditoria de Diretrizes Operacionais de DP"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "Compliance ASOG" },
          { icon: Wind, label: "Monitoramento Ambiental" },
          { icon: Settings, label: "Status de Thrusters" },
          { icon: Target, label: "Validação Automática" },
        ]}
      />

      <div className="space-y-6">
        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Painel de Controle
            </CardTitle>
            <CardDescription>Inicie a auditoria ASOG ou exporte relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRunASOGReview}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isProcessing ? "Processando..." : "Executar ASOG Review"}
              </Button>
              
              {relatorio && (
                <>
                  <Button
                    onClick={handleDownloadReport}
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
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ASOG Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Limites ASOG Configurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-sm">Velocidade do Vento</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{limites.wind_speed_max} nós</p>
                <p className="text-xs text-muted-foreground mt-1">Máximo permitido</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-sm">Tolerância de Thrusters</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{limites.thruster_loss_tolerance}</p>
                <p className="text-xs text-muted-foreground mt-1">Unidades inoperantes permitidas</p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-sm">Nível de Alerta DP</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{limites.dp_alert_level}</p>
                <p className="text-xs text-muted-foreground mt-1">Status requerido</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Data */}
        {dados && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Dados Operacionais Coletados
              </CardTitle>
              <CardDescription>
                Coletado em: {new Date(dados.timestamp).toLocaleString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4" />
                    <span className="font-semibold text-sm">Velocidade do Vento</span>
                  </div>
                  <p className="text-2xl font-bold">{dados.wind_speed} nós</p>
                  <Badge
                    variant={dados.wind_speed > limites.wind_speed_max ? "destructive" : "default"}
                    className="mt-2"
                  >
                    {dados.wind_speed > limites.wind_speed_max ? "Acima do Limite" : "Dentro do Limite"}
                  </Badge>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-semibold text-sm">Thrusters Operacionais</span>
                  </div>
                  <p className="text-2xl font-bold">{dados.thrusters_operacionais}/4</p>
                  <Badge
                    variant={(4 - dados.thrusters_operacionais) > limites.thruster_loss_tolerance ? "destructive" : "default"}
                    className="mt-2"
                  >
                    {(4 - dados.thrusters_operacionais) > limites.thruster_loss_tolerance ? "Não Conforme" : "Conforme"}
                  </Badge>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-semibold text-sm">Status DP</span>
                  </div>
                  <p className="text-2xl font-bold">{dados.dp_status}</p>
                  <Badge
                    variant={dados.dp_status !== limites.dp_alert_level ? "destructive" : "default"}
                    className="mt-2"
                  >
                    {dados.dp_status !== limites.dp_alert_level ? "Fora do Padrão" : "Padrão ASOG"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Results */}
        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {resultado.conformidade ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                Resultado da Validação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-6 rounded-lg ${resultado.conformidade ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                <div className="flex items-center gap-3 mb-4">
                  {resultado.conformidade ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
                          ✅ Operação Conforme ao ASOG
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          Todos os parâmetros estão dentro dos limites operacionais.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <div>
                        <h3 className="text-xl font-bold text-red-700 dark:text-red-400">
                          ❌ Operação Não Conforme
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-500">
                          {resultado.alertas.length} alerta(s) identificado(s).
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {resultado.alertas.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Alertas:</h4>
                    {resultado.alertas.map((alerta, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-white dark:bg-slate-900 rounded border border-red-200 dark:border-red-800"
                      >
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{alerta}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* JSON Report Preview */}
        {relatorio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Relatório JSON
              </CardTitle>
              <CardDescription>Visualização do relatório gerado</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-slate-900 text-green-400 rounded-lg overflow-auto text-xs max-h-96">
                {asogService.exportarRelatorioJSON(relatorio)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="asog-review"
        moduleName="ASOG Review"
        actions={[
          {
            id: "run",
            label: "Executar Review",
            icon: <Play className="h-3 w-3" />,
            action: handleRunASOGReview,
          },
          {
            id: "download",
            label: "Baixar Relatório",
            icon: <Download className="h-3 w-3" />,
            action: handleDownloadReport,
            disabled: !relatorio,
          },
          {
            id: "reset",
            label: "Resetar",
            icon: <RefreshCw className="h-3 w-3" />,
            action: handleReset,
          },
        ]}
        quickActions={[
          {
            id: "refresh",
            label: "Atualizar",
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => window.location.reload(),
            shortcut: "F5",
          },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default ASOGReview;
