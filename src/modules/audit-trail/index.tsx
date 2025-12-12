/**
import { useState, useCallback } from "react";;
 * PATCH: Trilha de Auditoria com IA
 * Sistema inteligente de rastreamento e análise de ações
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileSearch, 
  Brain, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Filter,
  Download,
  Search,
  Activity,
  TrendingUp,
  Eye,
  FileText,
  Settings,
  Database,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  severity: "info" | "warning" | "critical";
  ipAddress: string;
  metadata?: Record<string, unknown>;
}

interface AIInsight {
  id: string;
  type: "anomaly" | "pattern" | "recommendation" | "risk";
  title: string;
  description: string;
  confidence: number;
  affectedEntries: number;
  timestamp: Date;
}

const mockAuditEntries: AuditEntry[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 60000),
    userId: "u1",
    userName: "Carlos Silva",
    action: "UPDATE",
    module: "Manutenção",
    details: "Alterou status de ordem de serviço #1234",
    severity: "info",
    ipAddress: "192.168.1.100"
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 120000),
    userId: "u2",
    userName: "João Santos",
    action: "DELETE",
    module: "Documentos",
    details: "Removeu documento de certificação",
    severity: "warning",
    ipAddress: "192.168.1.101"
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 180000),
    userId: "u3",
    userName: "Admin Sistema",
    action: "PERMISSION_CHANGE",
    module: "Segurança",
    details: "Alterou permissões de acesso crítico",
    severity: "critical",
    ipAddress: "192.168.1.1"
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 300000),
    userId: "u4",
    userName: "Maria Oliveira",
    action: "CREATE",
    module: "Tripulação",
    details: "Criou novo registro de tripulante",
    severity: "info",
    ipAddress: "192.168.1.102"
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 600000),
    userId: "u1",
    userName: "Carlos Silva",
    action: "EXPORT",
    module: "Relatórios",
    details: "Exportou relatório financeiro completo",
    severity: "warning",
    ipAddress: "192.168.1.100"
  },
];

const mockAIInsights: AIInsight[] = [
  {
    id: "i1",
    type: "anomaly",
    title: "Padrão de acesso incomum detectado",
    description: "Usuário Carlos Silva realizou 15 operações de exportação nas últimas 2 horas, acima da média de 3 por dia.",
    confidence: 87,
    affectedEntries: 15,
    timestamp: new Date()
  },
  {
    id: "i2",
    type: "risk",
    title: "Alterações críticas fora do horário",
    description: "3 modificações de permissões foram realizadas entre 22h e 6h na última semana.",
    confidence: 92,
    affectedEntries: 3,
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: "i3",
    type: "pattern",
    title: "Padrão de workflow identificado",
    description: "80% das atualizações de manutenção são seguidas por criação de documentos em até 1 hora.",
    confidence: 78,
    affectedEntries: 45,
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    id: "i4",
    type: "recommendation",
    title: "Oportunidade de automação",
    description: "Ações repetitivas de backup manual podem ser automatizadas, economizando ~4h/semana.",
    confidence: 85,
    affectedEntries: 28,
    timestamp: new Date(Date.now() - 86400000)
  },
];

export default function AuditTrail() {
  const { analyzeAudit, isLoading } = useNautilusEnhancementAI();
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(mockAuditEntries);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(mockAIInsights);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = 
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = !selectedSeverity || entry.severity === selectedSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  const runAIAnalysis = async () => {
    toast.info("Analisando padrões com IA...");
    
    const result = await analyzeAudit(auditEntries);
    
    if (result?.response) {
      const aiResponse = result.response;
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: aiResponse.riskLevel === "high" ? "risk" : aiResponse.riskLevel === "medium" ? "anomaly" : "pattern",
        title: aiResponse.summary || "Análise de IA concluída",
        description: aiResponse.findings?.join(" ") || `Análise de ${auditEntries.length} registros concluída.`,
        confidence: aiResponse.confidence || 85,
        affectedEntries: aiResponse.affectedCount || auditEntries.length,
        timestamp: new Date()
      };
      
      // Add anomaly insights if present
      const anomalyInsights: AIInsight[] = (aiResponse.anomalies || []).map((a: unknown, idx: number) => ({
        id: `anomaly-${Date.now()}-${idx}`,
        type: "anomaly" as const,
        title: a.title || "Anomalia detectada",
        description: a.description || a,
        confidence: a.confidence || 75,
        affectedEntries: a.count || 1,
        timestamp: new Date()
      }));
      
      setAIInsights(prev => [newInsight, ...anomalyInsights, ...prev]);
      toast.success("Análise de IA concluída!");
    } else {
      toast.error("Erro na análise de IA");
    }
  };

  const exportReport = () => {
    toast.success("Relatório de auditoria exportado!");
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/50";
    case "warning": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "info": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
    case "anomaly": return <AlertTriangle className="h-5 w-5 text-red-400" />;
    case "pattern": return <Activity className="h-5 w-5 text-blue-400" />;
    case "recommendation": return <TrendingUp className="h-5 w-5 text-green-400" />;
    case "risk": return <Shield className="h-5 w-5 text-orange-400" />;
    default: return <Brain className="h-5 w-5 text-primary" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
    case "anomaly": return "border-red-500/50 bg-red-500/5";
    case "pattern": return "border-blue-500/50 bg-blue-500/5";
    case "recommendation": return "border-green-500/50 bg-green-500/5";
    case "risk": return "border-orange-500/50 bg-orange-500/5";
    default: return "border-primary/50 bg-primary/5";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileSearch className="h-8 w-8 text-primary" />
            Trilha de Auditoria com IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Rastreamento inteligente de todas as ações do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={runAIAnalysis} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isLoading ? "Analisando..." : "Análise IA"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{auditEntries.length}</p>
                <p className="text-xs text-muted-foreground">Total Registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{auditEntries.filter(e => e.severity === "critical").length}</p>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Eye className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{aiInsights.length}</p>
                <p className="text-xs text-muted-foreground">Insights IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{aiInsights.filter(i => i.type === "recommendation").length}</p>
                <p className="text-xs text-muted-foreground">Recomendações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Registros de Auditoria</TabsTrigger>
          <TabsTrigger value="insights">Insights da IA</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico de Ações</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar registros..."
                      value={searchQuery}
                      onChange={handleChange}
                      className="pl-9 w-64"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={selectedSeverity === null ? "default" : "outline"}
                      size="sm"
                      onClick={handleSetSelectedSeverity}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={selectedSeverity === "critical" ? "default" : "outline"}
                      size="sm"
                      onClick={handleSetSelectedSeverity}
                    >
                      Críticos
                    </Button>
                    <Button
                      variant={selectedSeverity === "warning" ? "default" : "outline"}
                      size="sm"
                      onClick={handleSetSelectedSeverity}
                    >
                      Alertas
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredEntries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{entry.userName}</span>
                              <Badge variant="outline" className="text-xs">
                                {entry.action}
                              </Badge>
                              <Badge className={getSeverityColor(entry.severity)}>
                                {entry.severity === "critical" ? "Crítico" :
                                  entry.severity === "warning" ? "Alerta" : "Info"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{entry.details}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {entry.module}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {entry.timestamp.toLocaleString("pt-BR")}
                              </span>
                              <span>IP: {entry.ipAddress}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          Confiança: {insight.confidence}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {insight.affectedEntries} registros afetados
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {insight.timestamp.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    Investigar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Auditoria</CardTitle>
              <CardDescription>Gere relatórios detalhados para compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col" onClick={() => toast.success("Gerando relatório..."}>
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Relatório Diário</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col" onClick={() => toast.success("Gerando relatório..."}>
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Relatório de Segurança</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col" onClick={() => toast.success("Gerando relatório..."}>
                  <Brain className="h-6 w-6 mb-2" />
                  <span>Análise de IA</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
