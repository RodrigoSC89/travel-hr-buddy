import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Shield,
  Database,
  Globe,
  Users,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Eye,
  Zap,
} from "lucide-react";

interface Risk {
  id: string;
  category: "technical" | "operational" | "infrastructure" | "security";
  name: string;
  description: string;
  probability: "high" | "medium" | "low";
  impact: "critical" | "moderate" | "light";
  priority: number;
  status: "open" | "mitigated" | "closed";
  mitigation: string;
  owner: string;
  lastReview: string;
}

export const RiskManagementDashboard: React.FC = () => {
  const [risks] = useState<Risk[]>([
    {
      id: "1",
      category: "technical",
      name: "Falha do Servidor Principal",
      description: "Indisponibilidade completa do servidor principal por falha de hardware",
      probability: "medium",
      impact: "critical",
      priority: 1,
      status: "mitigated",
      mitigation: "Failover automático implementado com redundância geográfica",
      owner: "DevOps Team",
      lastReview: "2024-01-15",
    },
    {
      id: "2",
      category: "operational",
      name: "Exclusão Acidental de Dados",
      description: "Usuário administrativo exclui dados críticos por engano",
      probability: "high",
      impact: "moderate",
      priority: 2,
      status: "mitigated",
      mitigation: "Confirmação dupla + backup versionado com recuperação em 1h",
      owner: "Data Team",
      lastReview: "2024-01-14",
    },
    {
      id: "3",
      category: "security",
      name: "Vazamento de Credenciais Admin",
      description: "Comprometimento de conta administrativa por phishing ou ataque",
      probability: "low",
      impact: "critical",
      priority: 1,
      status: "open",
      mitigation: "MFA obrigatório + monitoramento de acesso + alertas em tempo real",
      owner: "Security Team",
      lastReview: "2024-01-13",
    },
    {
      id: "4",
      category: "infrastructure",
      name: "Queda de Conectividade DNS",
      description: "Falha na resolução DNS impedindo acesso ao sistema",
      probability: "medium",
      impact: "critical",
      priority: 1,
      status: "mitigated",
      mitigation: "Múltiplos provedores DNS + cache local + failover automático",
      owner: "Infrastructure Team",
      lastReview: "2024-01-12",
    },
    {
      id: "5",
      category: "technical",
      name: "Sobrecarga de Sistema",
      description: "Travamento do sistema por alta carga de usuários simultâneos",
      probability: "high",
      impact: "moderate",
      priority: 2,
      status: "open",
      mitigation: "Auto-scaling + load balancing + rate limiting implementado",
      owner: "Performance Team",
      lastReview: "2024-01-11",
    },
    {
      id: "6",
      category: "security",
      name: "Injeção SQL",
      description: "Tentativa de ataque por injeção SQL nos formulários do sistema",
      probability: "medium",
      impact: "critical",
      priority: 1,
      status: "mitigated",
      mitigation: "Validação de entrada + prepared statements + WAF ativo",
      owner: "Security Team",
      lastReview: "2024-01-10",
    },
  ]);

  const [contingencyPlans] = useState([
    {
      risk: "Falha do Servidor Principal",
      immediate: "Ativar failover automático em 30 segundos",
      corrective: "Investigar causa raiz e substituir hardware em 4h",
      preventive: "Implementar monitoramento proativo de hardware",
    },
    {
      risk: "Exclusão Acidental de Dados",
      immediate: "Recuperar dados do backup mais recente em 1h",
      corrective: "Verificar integridade dos dados restaurados em 2h",
      preventive: "Implementar confirmação dupla para exclusões em massa",
    },
    {
      risk: "Vazamento de Credenciais Admin",
      immediate: "Reset imediato de senhas + bloqueio de sessões",
      corrective: "Auditoria completa de acesso + análise de logs",
      preventive: "MFA obrigatório + treinamento de segurança",
    },
  ]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return Database;
      case "operational":
        return Users;
      case "infrastructure":
        return Globe;
      case "security":
        return Shield;
      default:
        return AlertTriangle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technical":
        return "text-blue-500";
      case "operational":
        return "text-green-500";
      case "infrastructure":
        return "text-purple-500";
      case "security":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "light":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "mitigated":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const riskStats = {
    total: risks.length,
    critical: risks.filter(r => r.impact === "critical").length,
    high: risks.filter(r => r.probability === "high").length,
    open: risks.filter(r => r.status === "open").length,
    mitigated: risks.filter(r => r.status === "mitigated").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Gestão de Riscos - BCP</h1>
          <Badge variant="secondary">Business Continuity Plan</Badge>
        </div>
        <p className="text-muted-foreground">
          Plano de Continuidade Operacional e Gestão de Riscos do Nautilus One
        </p>
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Riscos</p>
                <p className="text-2xl font-bold">{riskStats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Impacto Crítico</p>
                <p className="text-2xl font-bold">{riskStats.critical}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alta Probabilidade</p>
                <p className="text-2xl font-bold">{riskStats.high}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Aberto</p>
                <p className="text-2xl font-bold">{riskStats.open}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mitigados</p>
                <p className="text-2xl font-bold">{riskStats.mitigated}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risks">Mapa de Riscos</TabsTrigger>
          <TabsTrigger value="contingency">Planos de Contingência</TabsTrigger>
          <TabsTrigger value="matrix">Matriz de Impacto</TabsTrigger>
          <TabsTrigger value="actions">Ações Imediatas</TabsTrigger>
        </TabsList>

        <TabsContent value="risks">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Inventário de Riscos</h3>
              <Button>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Novo Risco
              </Button>
            </div>

            <div className="space-y-3">
              {risks.map(risk => {
                const CategoryIcon = getCategoryIcon(risk.category);
                return (
                  <Card key={risk.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <CategoryIcon className={`w-6 h-6 ${getCategoryColor(risk.category)}`} />
                          <div>
                            <h4 className="font-semibold text-lg">{risk.name}</h4>
                            <p className="text-muted-foreground">{risk.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getProbabilityColor(risk.probability)}>
                            {risk.probability === "high"
                              ? "Alta"
                              : risk.probability === "medium"
                                ? "Média"
                                : "Baixa"}
                          </Badge>
                          <Badge className={getImpactColor(risk.impact)}>
                            {risk.impact === "critical"
                              ? "Crítico"
                              : risk.impact === "moderate"
                                ? "Moderado"
                                : "Leve"}
                          </Badge>
                          <Badge className={getStatusColor(risk.status)}>
                            {risk.status === "open"
                              ? "Aberto"
                              : risk.status === "mitigated"
                                ? "Mitigado"
                                : "Fechado"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Prioridade</p>
                          <div className="flex items-center gap-2">
                            <Progress value={risk.priority * 33.33} className="flex-1" />
                            <span className="text-sm font-semibold">P{risk.priority}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Responsável</p>
                          <p className="text-sm">{risk.owner}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Última Revisão</p>
                          <p className="text-sm">{risk.lastReview}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Plano de Mitigação:</p>
                        <p className="text-sm">{risk.mitigation}</p>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Detalhes
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Activity className="w-4 h-4 mr-2" />
                          Testar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contingency">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Planos de Contingência</h3>
            <div className="space-y-4">
              {contingencyPlans.map((plan, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      {plan.risk}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                          🚨 Ação Imediata (1h)
                        </h4>
                        <p className="text-sm">{plan.immediate}</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          🔧 Ação Corretiva (24h)
                        </h4>
                        <p className="text-sm">{plan.corrective}</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          🛡️ Prevenção Futura
                        </h4>
                        <p className="text-sm">{plan.preventive}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matrix">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Matriz de Impacto vs Probabilidade</h3>
            <div className="grid grid-cols-4 gap-2 p-4 border rounded-lg">
              <div className="text-center font-semibold">Impacto / Probabilidade</div>
              <div className="text-center font-semibold bg-green-100 dark:bg-green-900/20 p-2 rounded">
                Baixa
              </div>
              <div className="text-center font-semibold bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded">
                Média
              </div>
              <div className="text-center font-semibold bg-red-100 dark:bg-red-900/20 p-2 rounded">
                Alta
              </div>

              <div className="font-semibold bg-red-100 dark:bg-red-900/20 p-2 rounded">Crítico</div>
              <div className="p-2 border rounded bg-yellow-50 dark:bg-yellow-900/10">
                <div className="text-xs font-semibold">Médio</div>
                <div className="text-xs">1 risco</div>
              </div>
              <div className="p-2 border rounded bg-red-50 dark:bg-red-900/10">
                <div className="text-xs font-semibold">Alto</div>
                <div className="text-xs">2 riscos</div>
              </div>
              <div className="p-2 border rounded bg-red-100 dark:bg-red-900/20">
                <div className="text-xs font-semibold">Crítico</div>
                <div className="text-xs">1 risco</div>
              </div>

              <div className="font-semibold bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded">
                Moderado
              </div>
              <div className="p-2 border rounded bg-green-50 dark:bg-green-900/10">
                <div className="text-xs font-semibold">Baixo</div>
                <div className="text-xs">0 riscos</div>
              </div>
              <div className="p-2 border rounded bg-yellow-50 dark:bg-yellow-900/10">
                <div className="text-xs font-semibold">Médio</div>
                <div className="text-xs">1 risco</div>
              </div>
              <div className="p-2 border rounded bg-red-50 dark:bg-red-900/10">
                <div className="text-xs font-semibold">Alto</div>
                <div className="text-xs">1 risco</div>
              </div>

              <div className="font-semibold bg-green-100 dark:bg-green-900/20 p-2 rounded">
                Leve
              </div>
              <div className="p-2 border rounded bg-green-50 dark:bg-green-900/10">
                <div className="text-xs font-semibold">Baixo</div>
                <div className="text-xs">0 riscos</div>
              </div>
              <div className="p-2 border rounded bg-green-50 dark:bg-green-900/10">
                <div className="text-xs font-semibold">Baixo</div>
                <div className="text-xs">0 riscos</div>
              </div>
              <div className="p-2 border rounded bg-yellow-50 dark:bg-yellow-900/10">
                <div className="text-xs font-semibold">Médio</div>
                <div className="text-xs">0 riscos</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ações Imediatas Requeridas</h3>
            <div className="space-y-3">
              {risks
                .filter(r => r.status === "open")
                .map(risk => (
                  <Card
                    key={risk.id}
                    className="border-orange-200 bg-orange-50 dark:bg-orange-900/20"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                            {risk.name}
                          </h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Prioridade {risk.priority} - Impacto {risk.impact}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Implementar Agora
                          </Button>
                          <Button size="sm">Marcar como Mitigado</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
