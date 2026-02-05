/**
 * AIAuditTrail - Trilha de Auditoria de IA
 * Enterprise-grade AI decision logging and compliance
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ClipboardList, Brain, Search, Filter, Download, 
  CheckCircle2, XCircle, AlertTriangle, Clock, User, 
  FileText, Eye, ThumbsUp, ThumbsDown
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditEntry {
  id: string;
  timestamp: Date;
  agentName: string;
  agentType: string;
  module: string;
  action: string;
  input: string;
  output: string;
  confidence: number;
  status: "approved" | "rejected" | "pending" | "auto_approved";
  approvedBy?: string;
  approvedAt?: Date;
  humanOverride: boolean;
  reasoning?: string;
  impactLevel: "low" | "medium" | "high" | "critical";
}

const mockEntries: AuditEntry[] = [
  {
    id: "audit-1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    agentName: "Document Analyzer",
    agentType: "analysis",
    module: "Document Center",
    action: "Classificação de Documento",
    input: "Certificado_ISPS_2024.pdf",
    output: "Classificado como: Certificado ISPS | Validade: 12/2025",
    confidence: 96.5,
    status: "auto_approved",
    humanOverride: false,
    impactLevel: "low",
  },
  {
    id: "audit-2",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    agentName: "Maintenance Predictor",
    agentType: "prediction",
    module: "Maintenance Hub",
    action: "Previsão de Falha",
    input: "Motor Principal - MV Atlantic Star",
    output: "Probabilidade de falha: 78% em 30 dias | Recomendação: Manutenção preventiva",
    confidence: 78.0,
    status: "pending",
    humanOverride: false,
    reasoning: "Baseado em vibração anormal e histórico de manutenção",
    impactLevel: "high",
  },
  {
    id: "audit-3",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    agentName: "Crew Matcher",
    agentType: "automation",
    module: "People Hub",
    action: "Alocação de Tripulação",
    input: "Vaga: Chief Officer - MV Pacific Dawn",
    output: "Candidato recomendado: Carlos Silva (Match: 94%)",
    confidence: 94.0,
    status: "approved",
    approvedBy: "Maria Santos",
    approvedAt: new Date(Date.now() - 30 * 60 * 1000),
    humanOverride: false,
    impactLevel: "medium",
  },
  {
    id: "audit-4",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    agentName: "Voyage Optimizer",
    agentType: "prediction",
    module: "Operations Hub",
    action: "Otimização de Rota",
    input: "Rotterdam → Singapore via Suez",
    output: "Economia estimada: 12% combustível | Desvio recomendado por condições",
    confidence: 82.5,
    status: "rejected",
    approvedBy: "Capt. João Silva",
    humanOverride: true,
    reasoning: "Condições meteorológicas não justificam desvio neste momento",
    impactLevel: "high",
  },
  {
    id: "audit-5",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    agentName: "Compliance Monitor",
    agentType: "monitoring",
    module: "Compliance Hub",
    action: "Verificação de Certificado",
    input: "Verificação automática de validade - Frota completa",
    output: "3 certificados expirando em 30 dias | Alertas gerados",
    confidence: 99.1,
    status: "auto_approved",
    humanOverride: false,
    impactLevel: "critical",
  },
];

const statusConfig = {
  approved: { icon: CheckCircle2, color: "bg-green-100 text-green-700", label: "Aprovado" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejeitado" },
  pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pendente" },
  auto_approved: { icon: CheckCircle2, color: "bg-blue-100 text-blue-700", label: "Auto-Aprovado" },
};

const impactColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export function AIAuditTrail() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const filteredEntries = mockEntries.filter(entry => {
    const matchesSearch = entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockEntries.length,
    approved: mockEntries.filter(e => e.status === "approved" || e.status === "auto_approved").length,
    pending: mockEntries.filter(e => e.status === "pending").length,
    rejected: mockEntries.filter(e => e.status === "rejected").length,
    overrides: mockEntries.filter(e => e.humanOverride).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Auditoria de IA
          </h2>
          <p className="text-muted-foreground">Trilha completa de decisões e ações de IA</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Log
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total de Ações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-muted-foreground">Aprovadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejeitadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.overrides}</p>
            <p className="text-xs text-muted-foreground">Overrides Humanos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por ação ou agente..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="auto_approved">Auto-Aprovados</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audit List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Log de Auditoria</CardTitle>
          <CardDescription>Últimas ações registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEntries.map((entry) => {
              const StatusIcon = statusConfig[entry.status].icon;
              
              return (
                <motion.div
                  key={entry.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{entry.action}</span>
                          <Badge variant="outline" className="text-xs">{entry.agentName}</Badge>
                          <Badge className={impactColors[entry.impactLevel]} variant="outline">
                            {entry.impactLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{entry.output}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(entry.timestamp, "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                          <span>{entry.module}</span>
                          <span>Confiança: {entry.confidence}%</span>
                          {entry.humanOverride && (
                            <Badge variant="outline" className="text-purple-600 border-purple-600">
                              Override Humano
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={statusConfig[entry.status].color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[entry.status].label}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {selectedEntry && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {selectedEntry.action}
                </CardTitle>
                <CardDescription>{selectedEntry.agentName} • {selectedEntry.module}</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setSelectedEntry(null)}>Fechar</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Input</p>
                <p className="font-medium">{selectedEntry.input}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Output</p>
                <p className="font-medium">{selectedEntry.output}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Confiança</p>
                <p className="text-xl font-bold">{selectedEntry.confidence}%</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusConfig[selectedEntry.status].color}>
                  {statusConfig[selectedEntry.status].label}
                </Badge>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Impacto</p>
                <Badge className={impactColors[selectedEntry.impactLevel]}>
                  {selectedEntry.impactLevel.toUpperCase()}
                </Badge>
              </div>
            </div>

            {selectedEntry.reasoning && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-1">Raciocínio da IA</p>
                <p className="text-sm text-blue-600">{selectedEntry.reasoning}</p>
              </div>
            )}

            {selectedEntry.approvedBy && (
              <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm">
                    {selectedEntry.status === "rejected" ? "Rejeitado" : "Aprovado"} por <strong>{selectedEntry.approvedBy}</strong>
                  </p>
                  {selectedEntry.approvedAt && (
                    <p className="text-xs text-muted-foreground">
                      {format(selectedEntry.approvedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedEntry.status === "pending" && (
              <div className="flex gap-2">
                <Button className="flex-1" variant="default">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
                <Button className="flex-1" variant="destructive">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AIAuditTrail;
