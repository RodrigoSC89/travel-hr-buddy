import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  Download, 
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity
} from "lucide-react";
import { 
  searchAuditLogs, 
  getAuditStatistics, 
  exportAuditLogsCSV,
  type AIAuditEntry 
} from "@/lib/ai/audit-logger";
import { toast } from "sonner";

export const AIAuditPanel: React.FC = () => {
  const [logs, setLogs] = useState<AIAuditEntry[]>([]);
  const [stats, setStats] = useState({
    totalInteractions: 0,
    avgConfidence: 0,
    approvalRate: 0,
    ragUsageRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        searchAuditLogs({}, 100, 0),
        getAuditStatistics("").catch(() => ({
          totalInteractions: 0,
          avgConfidence: 0,
          avgResponseTime: 0,
          approvalRate: 0,
          ragUsageRate: 0,
          byModule: {},
          byModel: {}
        }))
      ]);
      setLogs(logsData);
      setStats({
        totalInteractions: statsData.totalInteractions,
        avgConfidence: statsData.avgConfidence,
        approvalRate: statsData.approvalRate,
        ragUsageRate: statsData.ragUsageRate
      });
    } catch (error) {
      console.error("Error loading AI logs:", error);
      toast.error("Erro ao carregar logs de IA");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = exportAuditLogsCSV(logs);
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ai_audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      
      toast.success("Logs exportados com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar logs");
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.user_input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ai_response?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" ||
      (filter === "approved" && log.approval_decision === "approved") ||
      (filter === "rejected" && log.approval_decision === "rejected") ||
      (filter === "pending" && log.requires_approval && !log.approval_decision) ||
      (filter === "rag" && log.rag_enabled);
    
    return matchesSearch && matchesFilter;
  });

  const getConfidenceBadge = (confidence: number | undefined) => {
    if (!confidence) return null;
    if (confidence >= 0.8) return <Badge className="bg-green-500/20 text-green-600">{(confidence * 100).toFixed(0)}%</Badge>;
    if (confidence >= 0.5) return <Badge className="bg-yellow-500/20 text-yellow-600">{(confidence * 100).toFixed(0)}%</Badge>;
    return <Badge className="bg-red-500/20 text-red-600">{(confidence * 100).toFixed(0)}%</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Auditoria de IA</h2>
          <p className="text-muted-foreground">Logging completo para conformidade ISM/MLC</p>
        </div>
        <Button className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalInteractions}</p>
                <p className="text-sm text-muted-foreground">Total Interações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.avgConfidence * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <CheckCircle className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.approvalRate).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Taxa Aprovação</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Brain className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.ragUsageRate).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Uso de RAG</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar nos logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["all", "approved", "rejected", "pending", "rag"].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === "all" && "Todos"}
                  {f === "approved" && "Aprovados"}
                  {f === "rejected" && "Rejeitados"}
                  {f === "pending" && "Pendentes"}
                  {f === "rag" && "Com RAG"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Interação com IA</CardTitle>
          <CardDescription>
            Registro completo para auditoria regulamentar - {filteredLogs.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log encontrado</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{log.module_name || "N/A"}</Badge>
                        <Badge variant="outline">{log.interaction_type || "N/A"}</Badge>
                        {log.model_version && (
                          <Badge variant="secondary">{log.model_version}</Badge>
                        )}
                        {getConfidenceBadge(log.confidence_score)}
                        {log.rag_enabled && (
                          <Badge className="bg-purple-500/20 text-purple-600">RAG</Badge>
                        )}
                        {log.requires_approval && (
                          log.approval_decision === "approved" ? (
                            <Badge className="bg-green-500/20 text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprovado
                            </Badge>
                          ) : log.approval_decision === "rejected" ? (
                            <Badge className="bg-red-500/20 text-red-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejeitado
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {log.created_at ? new Date(log.created_at).toLocaleString("pt-BR") : "N/A"}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Input do Usuário:</p>
                        <p className="text-sm">{log.user_input}</p>
                      </div>
                      
                      {log.ai_response && (
                        <div className="bg-primary/5 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Resposta da IA:</p>
                          <p className="text-sm line-clamp-3">{log.ai_response}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {log.response_time_ms && (
                        <span>Tempo: {log.response_time_ms}ms</span>
                      )}
                      {log.tokens_input && (
                        <span>Tokens In: {log.tokens_input}</span>
                      )}
                      {log.tokens_output && (
                        <span>Tokens Out: {log.tokens_output}</span>
                      )}
                      {log.user_name && (
                        <span>Usuário: {log.user_name}</span>
                      )}
                      {log.rag_source_documents && log.rag_source_documents.length > 0 && (
                        <span>Fontes RAG: {log.rag_source_documents.length}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAuditPanel;
