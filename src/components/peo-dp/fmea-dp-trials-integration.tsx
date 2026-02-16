import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Shield,
  Zap,
  Database,
  BarChart3,
  FileCheck,
  Ship,
  Settings,
  TrendingUp,
  AlertCircle,
  Download,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface FMEAReport {
  id: string;
  vesselName: string;
  reportDate: string;
  reportType: "FMEA" | "ASOG" | "DP_TRIAL";
  status: "pending" | "imported" | "analyzed";
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;
  overallRisk: "low" | "medium" | "high" | "critical";
  fileName: string;
  capabilityPlot?: CapabilityData;
}

interface CapabilityData {
  windSpeed: number[];
  waveHeight: number[];
  currentSpeed: number[];
  heading: number[];
  dpCapability: number[];
}

interface ASOGLevel {
  level: number;
  description: string;
  status: "green" | "yellow" | "red";
  thresholds: string[];
  actions: string[];
}

export const FMEADPTrialsIntegration: React.FC = () => {
  const [reports, setReports] = useState<FMEAReport[]>([
    {
      id: "fmea-1",
      vesselName: "PSV Atlantic Explorer",
      reportDate: "2024-03-15",
      reportType: "FMEA",
      status: "analyzed",
      criticalFindings: 2,
      majorFindings: 5,
      minorFindings: 12,
      overallRisk: "medium",
      fileName: "FMEA_Atlantic_Explorer_2024.pdf"
    },
    {
      id: "trial-1",
      vesselName: "PSV Atlantic Explorer",
      reportDate: "2024-02-20",
      reportType: "DP_TRIAL",
      status: "imported",
      criticalFindings: 0,
      majorFindings: 1,
      minorFindings: 3,
      overallRisk: "low",
      fileName: "DP_Annual_Trial_2024.pdf",
      capabilityPlot: {
        windSpeed: [10, 15, 20, 25, 30, 35],
        waveHeight: [1.5, 2.0, 2.5, 3.0, 3.5, 4.0],
        currentSpeed: [0.5, 1.0, 1.5, 2.0, 2.5],
        heading: [0, 45, 90, 135, 180, 225, 270, 315],
        dpCapability: [95, 92, 88, 82, 75, 65]
      }
    },
    {
      id: "asog-1",
      vesselName: "PSV Atlantic Explorer",
      reportDate: "2024-01-10",
      reportType: "ASOG",
      status: "analyzed",
      criticalFindings: 1,
      majorFindings: 3,
      minorFindings: 8,
      overallRisk: "medium",
      fileName: "ASOG_Review_2024.pdf"
    }
  ]);

  const [asogLevels] = useState<ASOGLevel[]>([
    {
      level: 0,
      description: "Operação Normal",
      status: "green",
      thresholds: ["Todos os sistemas operacionais", "Redundância completa"],
      actions: ["Manter vigilância normal", "Monitorar condições ambientais"]
    },
    {
      level: 1,
      description: "Degradado - Alerta",
      status: "yellow",
      thresholds: ["Perda de redundância parcial", "Sistema auxiliar em falha"],
      actions: ["Notificar OIM", "Preparar contingência", "Aumentar vigilância"]
    },
    {
      level: 2,
      description: "Degradado - Crítico",
      status: "yellow",
      thresholds: ["Perda de redundância significativa", "Sistema principal comprometido"],
      actions: ["Notificar cliente", "Preparar desconexão", "Reduzir operação"]
    },
    {
      level: 3,
      description: "Emergência - Drive-off",
      status: "red",
      thresholds: ["Perda de posição iminente", "Falha múltipla de sistemas"],
      actions: ["Iniciar desconexão", "Afastar da estrutura", "Notificar autoridades"]
    }
  ]);

  const [selectedReport, setSelectedReport] = useState<FMEAReport | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Process file synchronously (local state)
    const newReport: FMEAReport = {
      id: `report-${Date.now()}`,
      vesselName: "Nova Embarcação",
      reportDate: new Date().toISOString().split("T")[0],
      reportType: "FMEA",
      status: "pending",
      criticalFindings: 0,
      majorFindings: 0,
      minorFindings: 0,
      overallRisk: "low",
      fileName: file.name
    };

    setReports(prev => [newReport, ...prev]);
    setIsUploading(false);
    toast.success("Relatório importado com sucesso!", {
      description: "Análise automática será iniciada."
    });
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: "bg-success/20 text-success",
      medium: "bg-warning/20 text-warning",
      high: "bg-warning/30 text-warning",
      critical: "bg-destructive/20 text-destructive"
    };
    return colors[risk as keyof typeof colors] || colors.low;
  };

  const getStatusIcon = (status: string) => {
    if (status === "analyzed") return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === "imported") return <Clock className="h-4 w-4 text-warning" />;
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Integração FMEA & DP Trials</CardTitle>
                <CardDescription>
                  Importação e análise de relatórios FMEA, ASOG e DP Annual Trials
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                id="fmea-upload"
                className="hidden"
                accept=".pdf,.xlsx,.xls"
                onChange={handleFileUpload}
              />
              <Button 
                onClick={() => document.getElementById("fmea-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Relatório
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Relatórios FMEA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {reports.filter(r => r.reportType === "FMEA").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              DP Trials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">
                {reports.filter(r => r.reportType === "DP_TRIAL").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revisões ASOG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">
                {reports.filter(r => r.reportType === "ASOG").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Achados Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">
                {reports.reduce((sum, r) => sum + r.criticalFindings, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Relatórios Importados</TabsTrigger>
          <TabsTrigger value="asog">Matriz ASOG</TabsTrigger>
          <TabsTrigger value="capability">Capability Plot</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Técnicos</CardTitle>
              <CardDescription>
                Lista de relatórios FMEA, ASOG e DP Trials importados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedReport?.id === report.id ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(report.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{report.vesselName}</span>
                          <Badge variant="outline">{report.reportType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {report.fileName} • {report.reportDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-destructive">{report.criticalFindings} críticos</span>
                          <span className="text-warning">{report.majorFindings} maiores</span>
                        </div>
                      </div>
                      <Badge className={getRiskBadge(report.overallRisk)}>
                        Risco {report.overallRisk === "low" ? "Baixo" : 
                               report.overallRisk === "medium" ? "Médio" :
                               report.overallRisk === "high" ? "Alto" : "Crítico"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Report Details */}
          {selectedReport && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Detalhes do Relatório: {selectedReport.vesselName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="text-sm text-destructive font-medium">Achados Críticos</div>
                    <div className="text-3xl font-bold text-destructive">{selectedReport.criticalFindings}</div>
                    <p className="text-xs text-destructive/70 mt-1">Requerem ação imediata</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="text-sm text-warning font-medium">Achados Maiores</div>
                    <div className="text-3xl font-bold text-warning">{selectedReport.majorFindings}</div>
                    <p className="text-xs text-warning/70 mt-1">Prazo de 30 dias</p>
                  </div>
                  <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                    <div className="text-sm text-info font-medium">Achados Menores</div>
                    <div className="text-3xl font-bold text-info">{selectedReport.minorFindings}</div>
                    <p className="text-xs text-info/70 mt-1">Melhoria contínua</p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Sistemas Analisados</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Propulsão", "Energia", "Posicionamento", "Controle", "Navegação", "Comunicação", "Segurança", "Auxiliares"].map((system) => (
                      <Badge key={system} variant="secondary" className="justify-center">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ASOG Matrix Tab */}
        <TabsContent value="asog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-warning" />
                Matriz ASOG (Activity Specific Operating Guidelines)
              </CardTitle>
              <CardDescription>
                Níveis de degradação e ações de contingência conforme IMCA M 182
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {asogLevels.map((level) => (
                <div
                  key={level.level}
                  className={`p-4 rounded-lg border-2 ${
                    level.status === "green" ? "border-success/30 bg-success/5" :
                    level.status === "yellow" ? "border-warning/30 bg-warning/5" :
                    "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        level.status === "green" ? "bg-success" :
                        level.status === "yellow" ? "bg-warning" :
                        "bg-destructive"
                      }`}>
                        {level.level}
                      </div>
                      <div>
                        <h4 className="font-semibold">{level.description}</h4>
                        <p className="text-sm text-muted-foreground">Nível ASOG {level.level}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Condições de Gatilho:</h5>
                      <ul className="space-y-1">
                        {level.thresholds.map((threshold) => (
                          <li key={threshold} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {threshold}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Ações Requeridas:</h5>
                      <ul className="space-y-1">
                        {level.actions.map((action) => (
                          <li key={action} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capability Plot Tab */}
        <TabsContent value="capability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                DP Capability Plot
              </CardTitle>
              <CardDescription>
                Envelope operacional baseado nos DP Annual Trials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Wind Capability */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    Capacidade vs Vento
                  </h4>
                  <div className="space-y-2">
                    {[10, 15, 20, 25, 30, 35].map((wind, idx) => {
                      const capability = [95, 92, 88, 82, 75, 65][idx];
                      return (
                        <div key={wind} className="flex items-center gap-3">
                          <span className="text-sm w-16">{wind} kts</span>
                          <Progress value={capability} className="flex-1 h-3" />
                          <span className={`text-sm font-medium w-12 ${
                            capability >= 80 ? "text-green-600" :
                            capability >= 60 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {capability}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Current Capability */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Capacidade vs Corrente
                  </h4>
                  <div className="space-y-2">
                    {[0.5, 1.0, 1.5, 2.0, 2.5].map((current, idx) => {
                      const capability = [98, 95, 90, 82, 70][idx];
                      return (
                        <div key={current} className="flex items-center gap-3">
                          <span className="text-sm w-16">{current} kts</span>
                          <Progress value={capability} className="flex-1 h-3" />
                          <span className={`text-sm font-medium w-12 ${
                            capability >= 80 ? "text-green-600" :
                            capability >= 60 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {capability}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Heading Rose */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Capacidade por Heading</h4>
                <div className="grid grid-cols-8 gap-2">
                  {["N", "NE", "E", "SE", "S", "SW", "W", "NW"].map((dir, idx) => {
                    const capability = [92, 88, 85, 88, 90, 86, 84, 89][idx];
                    return (
                      <div key={dir} className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-bold">{dir}</div>
                        <div className={`text-sm ${
                          capability >= 85 ? "text-green-600" : "text-yellow-600"
                        }`}>
                          {capability}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Recomendações do Sistema</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Capacidade ótima até 25 kts de vento em todas as direções</li>
                  <li>• Reduzir operações críticas quando corrente &gt; 2.0 kts</li>
                  <li>• Heading preferencial: Norte/Sul para máxima eficiência</li>
                  <li>• Próximo DP Trial recomendado em: 6 meses</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
