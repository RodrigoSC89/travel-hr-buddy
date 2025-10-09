import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Fuel,
  Shield,
  Thermometer,
  Activity,
  MapPin,
  Users,
  Wrench,
  FileText,
  Mail,
  Phone,
  Settings,
  Eye,
  X,
  BrainCircuit,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IntelligentAlert {
  id: string;
  type: "safety" | "maintenance" | "operational" | "weather" | "fuel" | "crew" | "cargo";
  severity: "info" | "warning" | "critical" | "emergency";
  title: string;
  description: string;
  vessel_name: string;
  vessel_id: string;
  location?: string;
  predicted_impact: string;
  ai_confidence: number; // 0-100
  recommendations: string[];
  created_at: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolution_notes?: string;
  status: "open" | "acknowledged" | "resolved" | "false_positive";
  auto_generated: boolean;
  related_data: {
    current_value?: number;
    threshold_value?: number;
    trend?: "increasing" | "decreasing" | "stable";
    prediction_horizon?: string;
  };
}

const IntelligentAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<IntelligentAlert | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadIntelligentAlerts();

    // Simulate real-time alert generation
    const interval = setInterval(() => {
      generateNewAlert();
    }, 45000); // Generate new alert every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const loadIntelligentAlerts = () => {
    const mockAlerts: IntelligentAlert[] = [
      {
        id: "1",
        type: "maintenance",
        severity: "warning",
        title: "Predição de Falha no Motor Principal",
        description:
          "Sistema de IA detectou padrões anômalos na vibração do motor principal. Falha prevista em 72 horas.",
        vessel_name: "MV Atlântico Explorer",
        vessel_id: "1",
        location: "Santos, Brasil",
        predicted_impact: "Parada operacional de 24-48 horas se não tratada",
        ai_confidence: 87,
        recommendations: [
          "Reduzir velocidade para 12 nós imediatamente",
          "Agendar inspeção técnica urgente no próximo porto",
          "Monitorar vibração a cada 2 horas",
          "Preparar peças de reposição",
        ],
        created_at: "2024-01-18T10:30:00Z",
        is_acknowledged: false,
        status: "open",
        auto_generated: true,
        related_data: {
          current_value: 8.5,
          threshold_value: 6.0,
          trend: "increasing",
          prediction_horizon: "72 horas",
        },
      },
      {
        id: "2",
        type: "fuel",
        severity: "critical",
        title: "Consumo de Combustível Anômalo",
        description:
          "IA detectou aumento de 23% no consumo de combustível comparado ao padrão histórico da rota.",
        vessel_name: "MV Pacífico Star",
        vessel_id: "2",
        location: "Paranaguá, Brasil",
        predicted_impact: "Combustível insuficiente para completar viagem",
        ai_confidence: 94,
        recommendations: [
          "Verificar possível vazamento no sistema",
          "Otimizar rota para economia de combustível",
          "Considerar abastecimento de emergência",
          "Inspecionar filtros e sistema de injeção",
        ],
        created_at: "2024-01-18T08:15:00Z",
        is_acknowledged: true,
        acknowledged_by: "Capitão Silva",
        acknowledged_at: "2024-01-18T09:00:00Z",
        status: "acknowledged",
        auto_generated: true,
        related_data: {
          current_value: 18.5,
          threshold_value: 15.0,
          trend: "increasing",
          prediction_horizon: "24 horas",
        },
      },
      {
        id: "3",
        type: "weather",
        severity: "emergency",
        title: "Tempestade Severa Detectada na Rota",
        description:
          "Sistema meteorológico avançado prevê tempestade categoria 3 na rota atual em 6 horas.",
        vessel_name: "MV Índico Pioneer",
        vessel_id: "3",
        location: "Alto Mar - Nordeste",
        predicted_impact: "Risco extremo à segurança da embarcação e tripulação",
        ai_confidence: 96,
        recommendations: [
          "Alterar rota imediatamente para sudoeste",
          "Reduzir velocidade para 8 nós",
          "Ativar protocolo de segurança em tempestade",
          "Informar autoridades marítimas",
          "Preparar tripulação para condições adversas",
        ],
        created_at: "2024-01-18T07:45:00Z",
        is_acknowledged: true,
        acknowledged_by: "Centro de Operações",
        acknowledged_at: "2024-01-18T08:00:00Z",
        status: "resolved",
        resolution_notes: "Rota alterada com sucesso. Embarcação desviou da tempestade.",
        auto_generated: true,
        related_data: {
          current_value: 85,
          threshold_value: 70,
          trend: "increasing",
          prediction_horizon: "6 horas",
        },
      },
      {
        id: "4",
        type: "safety",
        severity: "warning",
        title: "Padrão de Fadiga da Tripulação Detectado",
        description:
          "Algoritmo de monitoramento identifica sinais de fadiga excessiva baseado em turnos e desempenho.",
        vessel_name: "MV Mediterrâneo",
        vessel_id: "4",
        location: "Vitória, Brasil",
        predicted_impact: "Aumento do risco de acidentes e erros operacionais",
        ai_confidence: 78,
        recommendations: [
          "Implementar rotação de turnos mais frequente",
          "Aumentar período de descanso obrigatório",
          "Monitorar sinais vitais da tripulação",
          "Considerar redução da velocidade",
        ],
        created_at: "2024-01-18T06:20:00Z",
        is_acknowledged: false,
        status: "open",
        auto_generated: true,
        related_data: {
          current_value: 82,
          threshold_value: 75,
          trend: "increasing",
          prediction_horizon: "12 horas",
        },
      },
    ];

    setAlerts(mockAlerts);
  };

  const generateNewAlert = () => {
    const alertTypes = ["maintenance", "operational", "fuel", "safety"];
    const severities = ["info", "warning", "critical"];
    const vessels = ["MV Atlântico Explorer", "MV Pacífico Star", "MV Índico Pioneer"];

    const newAlert: IntelligentAlert = {
      id: Math.random().toString(),
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
      severity: severities[Math.floor(Math.random() * severities.length)] as any,
      title: "Anomalia Detectada pelo Sistema de IA",
      description: "Sistema inteligente identificou padrão anômalo que requer atenção.",
      vessel_name: vessels[Math.floor(Math.random() * vessels.length)],
      vessel_id: Math.floor(Math.random() * 4 + 1).toString(),
      predicted_impact: "Impacto operacional potencial detectado",
      ai_confidence: Math.floor(Math.random() * 30 + 70), // 70-100%
      recommendations: ["Investigar anomalia", "Monitorar parâmetros", "Notificar equipe técnica"],
      created_at: new Date().toISOString(),
      is_acknowledged: false,
      status: "open",
      auto_generated: true,
      related_data: {
        trend: "increasing",
      },
    };

    setAlerts(prev => [newAlert, ...prev]);

    if (newAlert.severity === "critical" || newAlert.severity === "emergency") {
      toast({
        title: "⚠️ Novo Alerta Crítico",
        description: `${newAlert.title} - ${newAlert.vessel_name}`,
        variant: "destructive",
      });
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? {
            ...alert,
            is_acknowledged: true,
            acknowledged_by: "Usuário Atual",
            acknowledged_at: new Date().toISOString(),
            status: "acknowledged",
          }
          : alert
      )
    );

    toast({
      title: "Alerta Reconhecido",
      description: "O alerta foi marcado como reconhecido",
    });
  };

  const resolveAlert = (alertId: string, notes: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? {
            ...alert,
            status: "resolved",
            resolution_notes: notes,
          }
          : alert
      )
    );

    setResolutionNotes("");
    setShowDetailsDialog(false);

    toast({
      title: "Alerta Resolvido",
      description: "O alerta foi marcado como resolvido",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "info":
      return "bg-info text-info-foreground";
    case "warning":
      return "bg-warning text-warning-foreground";
    case "critical":
      return "bg-destructive text-destructive-foreground";
    case "emergency":
      return "bg-red-600 text-white animate-pulse";
    default:
      return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
    case "info":
      return "Informativo";
    case "warning":
      return "Atenção";
    case "critical":
      return "Crítico";
    case "emergency":
      return "Emergência";
    default:
      return "Desconhecido";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "safety":
      return <Shield className="h-4 w-4" />;
    case "maintenance":
      return <Wrench className="h-4 w-4" />;
    case "operational":
      return <Activity className="h-4 w-4" />;
    case "weather":
      return <Thermometer className="h-4 w-4" />;
    case "fuel":
      return <Fuel className="h-4 w-4" />;
    case "crew":
      return <Users className="h-4 w-4" />;
    case "cargo":
      return <FileText className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success";
    if (confidence >= 75) return "text-warning";
    return "text-destructive";
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  const stats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === "open").length,
    critical: alerts.filter(a => a.severity === "critical" || a.severity === "emergency").length,
    resolved: alerts.filter(a => a.status === "resolved").length,
    avgConfidence:
      alerts.length > 0
        ? Math.round(alerts.reduce((sum, a) => sum + a.ai_confidence, 0) / alerts.length)
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alertas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abertos</p>
                <p className="text-2xl font-bold text-warning">{stats.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <Zap className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold text-success">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisão IA</p>
                <p className="text-2xl font-bold text-primary">{stats.avgConfidence}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Alertas Inteligentes
          </h2>
          <p className="text-muted-foreground">
            Sistema de IA para detecção preditiva de anomalias
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-success">
            <Activity className="h-3 w-3 mr-1" />
            IA Ativa
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar IA
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="open">Abertos</option>
              <option value="acknowledged">Reconhecidos</option>
              <option value="resolved">Resolvidos</option>
            </select>

            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todas Severidades</option>
              <option value="emergency">Emergência</option>
              <option value="critical">Crítico</option>
              <option value="warning">Atenção</option>
              <option value="info">Informativo</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Tipos</option>
              <option value="safety">Segurança</option>
              <option value="maintenance">Manutenção</option>
              <option value="operational">Operacional</option>
              <option value="weather">Meteorológico</option>
              <option value="fuel">Combustível</option>
              <option value="crew">Tripulação</option>
            </select>

            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => (
          <Card key={alert.id} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(alert.type)}
                    <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                      {getSeverityText(alert.severity)}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{alert.title}</h3>
                      {alert.auto_generated && (
                        <Badge variant="outline" className="text-xs">
                          <BrainCircuit className="h-3 w-3 mr-1" />
                          IA
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.vessel_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.created_at).toLocaleString("pt-BR")}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${getConfidenceColor(alert.ai_confidence)}`}
                      >
                        <TrendingUp className="h-3 w-3" />
                        Confiança: {alert.ai_confidence}%
                      </span>
                    </div>

                    {alert.predicted_impact && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium text-warning">Impacto Previsto:</p>
                        <p className="text-sm">{alert.predicted_impact}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Dialog
                    open={showDetailsDialog && selectedAlert?.id === alert.id}
                    onOpenChange={setShowDetailsDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAlert(alert)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {getTypeIcon(alert.type)}
                          {alert.title}
                          <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                            {getSeverityText(alert.severity)}
                          </Badge>
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Embarcação</Label>
                            <p className="text-sm">{alert.vessel_name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Localização</Label>
                            <p className="text-sm">{alert.location || "Não informado"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Confiança da IA</Label>
                            <p
                              className={`text-sm font-medium ${getConfidenceColor(alert.ai_confidence)}`}
                            >
                              {alert.ai_confidence}%
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <p className="text-sm capitalize">{alert.status.replace("_", " ")}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Descrição</Label>
                          <p className="text-sm mt-1">{alert.description}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Impacto Previsto</Label>
                          <p className="text-sm mt-1">{alert.predicted_impact}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Recomendações da IA</Label>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            {alert.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {alert.status === "open" && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="resolution">Notas de Resolução</Label>
                              <Textarea
                                id="resolution"
                                value={resolutionNotes}
                                onChange={e => setResolutionNotes(e.target.value)}
                                placeholder="Descreva as ações tomadas para resolver este alerta..."
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => resolveAlert(alert.id, resolutionNotes)}
                                disabled={!resolutionNotes.trim()}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolver Alerta
                              </Button>
                            </div>
                          </div>
                        )}

                        {alert.resolution_notes && (
                          <div>
                            <Label className="text-sm font-medium">Resolução</Label>
                            <p className="text-sm mt-1 p-3 bg-success/10 rounded-lg">
                              {alert.resolution_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {!alert.is_acknowledged && alert.status === "open" && (
                    <Button variant="default" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reconhecer
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum alerta encontrado</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IntelligentAlerts;
