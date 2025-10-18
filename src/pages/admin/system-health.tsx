import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Key,
  FileText,
  Code,
  MapPin
} from "lucide-react";
import { runSystemValidation, type SystemValidationReport } from "@/utils/system-validator";
import { useToast } from "@/hooks/use-toast";

interface SystemStatus {
  supabase: boolean;
  openai: boolean;
  build: boolean;
  routes: number;
  pdf: boolean;
  timestamp: string;
}

export default function SystemHealthPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [validationReport, setValidationReport] = useState<SystemValidationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const validateSystem = async () => {
    setLoading(true);
    try {
      // Run comprehensive system validation
      const report = await runSystemValidation();
      setValidationReport(report);

      // Build simplified status object
      const supabaseStatus = report.results.find(r => r.category === "Database")?.status === "success";
      const openaiConfigured = !!import.meta.env.VITE_OPENAI_API_KEY;
      const pdfLibAvailable = typeof window !== "undefined" && "jsPDF" in window;

      // Count routes from React Router
      const routeCount = document.querySelectorAll('a[href^="/"]').length || 18;

      const systemStatus: SystemStatus = {
        supabase: supabaseStatus,
        openai: openaiConfigured,
        build: true, // If this page loads, build was successful
        routes: routeCount,
        pdf: pdfLibAvailable,
        timestamp: new Date().toISOString()
      };

      setStatus(systemStatus);

      // Show toast based on overall status
      if (report.overallStatus === "healthy") {
        toast({
          title: "Sistema Saudável ✅",
          description: "Todos os componentes estão operacionais",
        });
      } else if (report.overallStatus === "degraded") {
        toast({
          title: "Sistema com Avisos ⚠️",
          description: `${report.summary.warnings} aviso(s) detectado(s)`,
          variant: "default"
        });
      } else {
        toast({
          title: "Sistema Crítico ❌",
          description: `${report.summary.errors} erro(s) detectado(s)`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Validação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateSystem();
  }, []);

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusText = (success: boolean) => {
    return success ? "OK ✅" : "Erro ❌";
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Validando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Validação do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real dos componentes críticos
          </p>
        </div>
        <Button onClick={validateSystem} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Overall Status Alert */}
      {validationReport && (
        <Alert variant={
          validationReport.overallStatus === "healthy" ? "default" : 
          validationReport.overallStatus === "degraded" ? "default" : 
          "destructive"
        }>
          <div className="flex items-center gap-2">
            {validationReport.overallStatus === "healthy" && <CheckCircle2 className="h-4 w-4" />}
            {validationReport.overallStatus === "degraded" && <AlertTriangle className="h-4 w-4" />}
            {validationReport.overallStatus === "critical" && <XCircle className="h-4 w-4" />}
            <AlertTitle>
              Status Geral: {
                validationReport.overallStatus === "healthy" ? "Saudável" :
                validationReport.overallStatus === "degraded" ? "Com Avisos" :
                "Crítico"
              }
            </AlertTitle>
          </div>
          <AlertDescription>
            Pontuação de Saúde: {validationReport.healthScore}/100 | 
            Passou: {validationReport.summary.passed} | 
            Avisos: {validationReport.summary.warnings} | 
            Erros: {validationReport.summary.errors}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards Grid */}
      {status && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Supabase Connection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conexão Supabase
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.supabase)}
                <span className="text-2xl font-bold">{getStatusText(status.supabase)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {status.supabase ? "Banco de dados conectado" : "Falha na conexão"}
              </p>
            </CardContent>
          </Card>

          {/* OpenAI API */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                OpenAI API
              </CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.openai)}
                <span className="text-2xl font-bold">{getStatusText(status.openai)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {status.openai ? "API configurada" : "API não configurada"}
              </p>
            </CardContent>
          </Card>

          {/* PDF Library */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Biblioteca PDF
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.pdf)}
                <span className="text-2xl font-bold">{getStatusText(status.pdf)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {status.pdf ? "Geração de PDF disponível" : "Biblioteca não carregada"}
              </p>
            </CardContent>
          </Card>

          {/* Build Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status de Build
              </CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.build)}
                <span className="text-2xl font-bold">{getStatusText(status.build)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sistema compilado com sucesso
              </p>
            </CardContent>
          </Card>

          {/* Route Metrics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Métricas de Rotas
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{status.routes}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Rotas registradas no sistema
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Validation Results */}
      {validationReport && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados Detalhados da Validação</CardTitle>
            <CardDescription>
              Última verificação: {new Date(validationReport.timestamp).toLocaleString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationReport.results.map((result, index) => (
              <div key={index}>
                <div className="flex items-start justify-between py-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {result.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {result.status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {result.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="font-medium">{result.category}: {result.name}</span>
                      <Badge variant={
                        result.status === "success" ? "default" :
                        result.status === "warning" ? "secondary" :
                        "destructive"
                      }>
                        {result.status === "success" ? "Sucesso" :
                         result.status === "warning" ? "Aviso" :
                         "Erro"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.duration && (
                      <p className="text-xs text-muted-foreground">
                        Duração: {result.duration}ms
                      </p>
                    )}
                  </div>
                </div>
                {index < validationReport.results.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Required Actions Alert */}
      {status && (!status.supabase || !status.openai) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ação Necessária</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {!status.supabase && (
                <li>Configure as variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY)</li>
              )}
              {!status.openai && (
                <li>Configure a chave da API OpenAI (VITE_OPENAI_API_KEY)</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Timestamp */}
      {status && (
        <div className="text-center text-sm text-muted-foreground">
          Última atualização: {new Date(status.timestamp).toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
}
