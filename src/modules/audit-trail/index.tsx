/**
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
import { Skeleton } from "@/components/ui/skeleton";
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
  Sparkles,
  Inbox
} from "lucide-react";
import { toast } from "sonner";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";
import { useAuditEntries, useAIInsights, type AuditEntry, type AIInsight } from "@/hooks/useAuditTrailData";

export default function AuditTrail() {
  const { analyzeAudit, isLoading: isAnalyzing } = useNautilusEnhancementAI();
  const { data: auditEntries = [], isLoading: isLoadingEntries } = useAuditEntries();
  const { data: aiInsights = [], isLoading: isLoadingInsights } = useAIInsights();
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
    
    const result = await analyzeAudit(auditEntries as unknown as Record<string, unknown>[]);
    
    if (result?.response) {
      toast.success("Análise de IA concluída!");
    } else {
      toast.error("Erro na análise de IA");
    }
  };

  const exportReport = (type: 'daily' | 'security' | 'ai' = 'daily') => {
    const now = new Date();
    const reportTitle = type === 'daily' ? 'Relatório Diário' : type === 'security' ? 'Relatório de Segurança' : 'Análise de IA';
    
    const content = `
TRILHA DE AUDITORIA - ${reportTitle.toUpperCase()}
${'='.repeat(50)}
Gerado em: ${now.toLocaleString('pt-BR')}
Período: ${new Date(now.getTime() - 86400000).toLocaleDateString('pt-BR')} - ${now.toLocaleDateString('pt-BR')}

RESUMO EXECUTIVO
----------------
Total de Registros: ${auditEntries.length}
Eventos Críticos: ${auditEntries.filter(e => e.severity === 'critical').length}
Alertas: ${auditEntries.filter(e => e.severity === 'warning').length}
Insights IA: ${aiInsights.length}

REGISTROS DETALHADOS
--------------------
${auditEntries.map(entry => `
[${entry.timestamp.toLocaleString('pt-BR')}] ${entry.severity.toUpperCase()}
Usuário: ${entry.userName} (${entry.userId})
Ação: ${entry.action}
Módulo: ${entry.module}
Detalhes: ${entry.details}
IP: ${entry.ipAddress}
`).join('\n---\n')}

${type === 'ai' ? `
INSIGHTS DA IA
--------------
${aiInsights.map(insight => `
[${insight.type.toUpperCase()}] ${insight.title}
Confiança: ${insight.confidence}%
${insight.description}
Registros afetados: ${insight.affectedEntries}
`).join('\n---\n')}` : ''}

${type === 'security' ? `
ANÁLISE DE SEGURANÇA
--------------------
- Eventos críticos detectados: ${auditEntries.filter(e => e.severity === 'critical').length}
- Alterações de permissão: ${auditEntries.filter(e => e.action === 'PERMISSION_CHANGE').length}
- Acessos fora do horário: Verificar logs de 22h-6h
- Exportações de dados: ${auditEntries.filter(e => e.action === 'EXPORT').length}
` : ''}

--- Fim do Relatório ---
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-${type}-${now.toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`${reportTitle} exportado com sucesso!`);
  };

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
          <Button variant="outline" onClick={() => exportReport('daily')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={runAIAnalysis} disabled={isAnalyzing || isLoadingEntries}>
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isAnalyzing ? "Analisando..." : "Análise IA"}
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={selectedSeverity === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSeverity(null)}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={selectedSeverity === "critical" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSeverity("critical")}
                    >
                      Críticos
                    </Button>
                    <Button
                      variant={selectedSeverity === "warning" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSeverity("warning")}
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
                <Button variant="outline" className="h-24 flex-col" onClick={() => exportReport('daily')}>
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Relatório Diário</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col" onClick={() => exportReport('security')}>
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Relatório de Segurança</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col" onClick={() => exportReport('ai')}>
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
