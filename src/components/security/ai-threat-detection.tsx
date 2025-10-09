import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  Lock,
  Eye,
  Zap,
  TrendingUp,
  User,
  MapPin,
  Clock,
  XCircle,
} from "lucide-react";

interface SecurityThreat {
  id: string;
  type: "intrusion" | "anomaly" | "suspicious" | "malware" | "ddos";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  detectedAt: string;
  source: {
    ip: string;
    location?: string;
    user?: string;
  };
  status: "active" | "investigating" | "resolved" | "false_positive";
  confidence: number;
  affectedSystems: string[];
  aiAnalysis: string;
}

interface SecurityMetric {
  name: string;
  value: number;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

export const AIThreatDetection: React.FC = () => {
  const [threats, setThreats] = useState<SecurityThreat[]>([
    {
      id: "1",
      type: "suspicious",
      severity: "high",
      title: "Tentativa de Acesso Não Autorizado",
      description: "Múltiplas tentativas de login falhadas do mesmo IP em curto período",
      detectedAt: "2025-05-12T14:35:22",
      source: {
        ip: "203.45.78.91",
        location: "Localização Desconhecida",
        user: "admin_test",
      },
      status: "investigating",
      confidence: 94,
      affectedSystems: ["Sistema de Autenticação", "API Gateway"],
      aiAnalysis:
        "Padrão de ataque de força bruta detectado. IP sem histórico legítimo de acesso. Recomenda-se bloqueio imediato.",
    },
    {
      id: "2",
      type: "anomaly",
      severity: "medium",
      title: "Comportamento Anômalo de Usuário",
      description: "Padrão de acesso incomum detectado - horário e localização atípicos",
      detectedAt: "2025-05-12T13:12:45",
      source: {
        ip: "192.168.1.45",
        location: "São Paulo, BR",
        user: "joao.silva@company.com",
      },
      status: "active",
      confidence: 76,
      affectedSystems: ["Dashboard Executivo", "Dados de Tripulação"],
      aiAnalysis:
        "Usuário acessando de localização diferente do padrão. Horário de acesso fora do expediente normal. Pode ser legítimo, mas requer verificação.",
    },
    {
      id: "3",
      type: "intrusion",
      severity: "critical",
      title: "Tentativa de SQL Injection",
      description: "Detectada tentativa de injeção SQL no endpoint de relatórios",
      detectedAt: "2025-05-12T12:05:18",
      source: {
        ip: "45.123.67.89",
        location: "Desconhecido",
      },
      status: "resolved",
      confidence: 98,
      affectedSystems: ["API de Relatórios", "Banco de Dados"],
      aiAnalysis:
        "Tentativa clara de exploração de vulnerabilidade. Padrão de ataque automatizado detectado. IP bloqueado automaticamente.",
    },
    {
      id: "4",
      type: "ddos",
      severity: "high",
      title: "Tráfego Anormal Detectado",
      description: "Volume de requisições 300% acima da média em 5 minutos",
      detectedAt: "2025-05-12T11:23:56",
      source: {
        ip: "Múltiplos IPs",
        location: "Diversos países",
      },
      status: "investigating",
      confidence: 88,
      affectedSystems: ["API Gateway", "Load Balancer"],
      aiAnalysis:
        "Possível ataque DDoS em andamento. Tráfego originado de botnet identificada. Sistema de mitigação ativado.",
    },
    {
      id: "5",
      type: "anomaly",
      severity: "low",
      title: "Acesso a Dados Sensíveis",
      description: "Download em massa de documentos de tripulação",
      detectedAt: "2025-05-12T10:47:33",
      source: {
        ip: "10.0.2.15",
        location: "Rede Interna",
        user: "maria.santos@company.com",
      },
      status: "false_positive",
      confidence: 65,
      affectedSystems: ["Sistema de Documentos"],
      aiAnalysis:
        "Padrão suspeito de download, mas usuário possui permissões adequadas. Ação dentro do escopo de trabalho normal após verificação.",
    },
  ]);

  const [metrics] = useState<SecurityMetric[]>([
    { name: "Tentativas de Intrusão", value: 23, trend: "down", status: "good" },
    { name: "Anomalias Detectadas", value: 45, trend: "up", status: "warning" },
    { name: "Taxa de Falsos Positivos", value: 8, trend: "down", status: "good" },
    { name: "Tempo Médio de Resposta", value: 3.2, trend: "down", status: "good" },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "active":
      return "text-red-600";
    case "investigating":
      return "text-yellow-600";
    case "resolved":
      return "text-green-600";
    case "false_positive":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
    case "intrusion":
      return <Shield className="h-5 w-5 text-red-600" />;
    case "anomaly":
      return <Eye className="h-5 w-5 text-yellow-600" />;
    case "suspicious":
      return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    case "malware":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "ddos":
      return <Zap className="h-5 w-5 text-purple-600" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const activeThreats = threats.filter(
    t => t.status === "active" || t.status === "investigating"
  ).length;
  const criticalThreats = threats.filter(t => t.severity === "critical").length;
  const avgConfidence = Math.round(
    threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ameaças Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeThreats}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Nível Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{criticalThreats}</div>
            <p className="text-xs text-muted-foreground">Alta severidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Confiança IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">Precisão média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium">Protegido</span>
            </div>
            <p className="text-xs text-muted-foreground">Todas camadas ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI Threat Detection
              </CardTitle>
              <CardDescription>
                Detecção inteligente de intrusões e comportamentos suspeitos com IA
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              Tempo Real
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="threats">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="threats">Ameaças</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="protection">Proteção</TabsTrigger>
            </TabsList>

            <TabsContent value="threats" className="space-y-4 mt-4">
              {threats.map(threat => (
                <Card
                  key={threat.id}
                  className={`border-l-4 ${
                    threat.severity === "critical"
                      ? "border-l-red-600"
                      : threat.severity === "high"
                        ? "border-l-orange-600"
                        : threat.severity === "medium"
                          ? "border-l-yellow-600"
                          : "border-l-blue-600"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">{getThreatIcon(threat.type)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{threat.title}</CardTitle>
                            <Badge variant={getSeverityColor(threat.severity) as any}>
                              {threat.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <CardDescription className="mt-1">{threat.description}</CardDescription>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${getStatusColor(threat.status)}`}>
                        {threat.status === "active" && (
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                        )}
                        {threat.status === "investigating" && (
                          <Eye className="h-4 w-4 inline mr-1" />
                        )}
                        {threat.status === "resolved" && (
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                        )}
                        {threat.status.replace("_", " ").toUpperCase()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Confidence */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Confiança da IA</span>
                        <span className="font-medium">{threat.confidence}%</span>
                      </div>
                      <Progress value={threat.confidence} className="h-2" />
                    </div>

                    {/* Source Info */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3" />
                          IP/Origem
                        </div>
                        <div className="font-mono text-sm">{threat.source.ip}</div>
                      </div>
                      {threat.source.user && (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <User className="h-3 w-3" />
                            Usuário
                          </div>
                          <div className="text-sm">{threat.source.user}</div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          Detectado
                        </div>
                        <div className="text-sm">
                          {new Date(threat.detectedAt).toLocaleTimeString("pt-BR")}
                        </div>
                      </div>
                    </div>

                    {/* Affected Systems */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Sistemas Afetados:</div>
                      <div className="flex flex-wrap gap-2">
                        {threat.affectedSystems.map((system, idx) => (
                          <Badge key={idx} variant="outline">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Análise da IA
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            {threat.aiAnalysis}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {threat.status === "active" && (
                        <>
                          <Button size="sm" variant="destructive" className="flex-1">
                            <Lock className="h-4 w-4 mr-2" />
                            Bloquear IP
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Investigar
                          </Button>
                        </>
                      )}
                      {threat.status === "investigating" && (
                        <>
                          <Button size="sm" className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolver
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Falso Positivo
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.map((metric, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-base">{metric.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between mb-2">
                        <div className="text-3xl font-bold">
                          {metric.value}
                          {metric.name.includes("Taxa") ? "%" : ""}
                        </div>
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            metric.trend === "down"
                              ? "text-green-600"
                              : metric.trend === "up"
                                ? "text-red-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {metric.trend === "up" ? "↗" : metric.trend === "down" ? "↘" : "→"}
                          <span>
                            {metric.trend === "up" ? "+" : metric.trend === "down" ? "-" : ""}
                            {Math.abs(Math.random() * 15).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                      <div className="mt-2 text-xs text-muted-foreground">
                        Status:{" "}
                        <span
                          className={
                            metric.status === "good"
                              ? "text-green-600"
                              : metric.status === "warning"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }
                        >
                          {metric.status === "good"
                            ? "Bom"
                            : metric.status === "warning"
                              ? "Atenção"
                              : "Crítico"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Ameaças (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Gráfico de tendências de segurança</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="protection" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Camadas de Proteção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: "Firewall Inteligente", status: "active" },
                      { name: "WAF - Web Application Firewall", status: "active" },
                      { name: "Proteção DDoS", status: "active" },
                      { name: "Detecção de Anomalias IA", status: "active" },
                      { name: "Análise Comportamental", status: "active" },
                      { name: "Threat Intelligence Feed", status: "active" },
                    ].map((layer, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{layer.name}</span>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ações Automáticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Bloqueio automático de IPs suspeitos",
                      "Rate limiting adaptativo",
                      "Isolamento de sessões comprometidas",
                      "Notificação em tempo real",
                      "Backup automático antes de ações",
                      "Log detalhado de todas atividades",
                    ].map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIThreatDetection;
