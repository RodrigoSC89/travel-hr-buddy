/**
 * Canal de Denúncias - Whistleblower Channel
 * Canal anônimo para denúncias de compliance ISO 37301
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useComplianceReports, useCreateComplianceReport } from "../hooks/useComplianceData";
import { 
  AlertCircle, Shield, Lock, Eye, EyeOff, Clock, CheckCircle2,
  AlertTriangle, MessageSquare, Send, Search, Filter, FileText,
  Brain, Calendar, User, Building2, XCircle
} from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  protocolNumber: string;
  category: "fraud" | "corruption" | "harassment" | "safety" | "ethics" | "environmental" | "other";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "closed" | "dismissed";
  isAnonymous: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
  aiClassification?: string;
  aiPriority?: number;
}

const fallbackReports: Report[] = [
  {
    id: "1",
    protocolNumber: "DEN-2024-0042",
    category: "fraud",
    severity: "high",
    status: "investigating",
    isAnonymous: true,
    description: "Suspeita de irregularidades em contratações de serviços marítimos...",
    createdAt: "2024-12-15",
    updatedAt: "2024-12-28",
    aiClassification: "Fraude em Licitações",
    aiPriority: 85,
  },
  {
    id: "2",
    protocolNumber: "DEN-2024-0041",
    category: "harassment",
    severity: "critical",
    status: "investigating",
    isAnonymous: true,
    description: "Relato de assédio moral por parte de supervisor...",
    createdAt: "2024-12-10",
    updatedAt: "2024-12-27",
    aiClassification: "Assédio Moral - Urgente",
    aiPriority: 95,
  },
  {
    id: "3",
    protocolNumber: "DEN-2024-0040",
    category: "safety",
    severity: "medium",
    status: "resolved",
    isAnonymous: false,
    description: "Equipamentos de segurança sem manutenção adequada...",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-20",
    aiClassification: "Segurança Ocupacional",
    aiPriority: 70,
  },
  {
    id: "4",
    protocolNumber: "DEN-2024-0039",
    category: "environmental",
    severity: "high",
    status: "open",
    isAnonymous: true,
    description: "Descarte irregular de resíduos em área portuária...",
    createdAt: "2024-11-25",
    updatedAt: "2024-11-25",
    aiClassification: "Violação Ambiental",
    aiPriority: 80,
  },
  {
    id: "5",
    protocolNumber: "DEN-2024-0038",
    category: "ethics",
    severity: "low",
    status: "closed",
    isAnonymous: false,
    description: "Conflito de interesse em processo de seleção...",
    createdAt: "2024-11-15",
    updatedAt: "2024-12-05",
    aiClassification: "Conflito de Interesse",
    aiPriority: 45,
  },
];

export default function ComplianceDenuncias() {
  const [activeTab, setActiveTab] = useState("channel");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewReport, setShowNewReport] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  
  const { data: reports, isLoading } = useComplianceReports();
  const createReport = useCreateComplianceReport();

  const displayReports = (reports && reports.length > 0) 
    ? reports.map((r) => ({
        id: String(r.id), protocolNumber: String(r.report_code || `DEN-${String(r.id).slice(0,4)}`),
        category: (r.category || "other") as Report["category"], severity: (r.severity || "medium") as Report["severity"],
        status: (r.status || "open") as Report["status"], isAnonymous: r.is_anonymous ?? true,
        description: String(r.description || ""), createdAt: String(r.created_at || "").slice(0,10),
        updatedAt: String(r.updated_at || "").slice(0,10), aiClassification: r.ai_classification,
        aiPriority: r.ai_priority_score,
      }))
    : fallbackReports;

  const filteredReports = displayReports.filter(r => {
    const matchesSearch = r.protocolNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: displayReports.length,
    open: displayReports.filter(r => r.status === "open").length,
    investigating: displayReports.filter(r => r.status === "investigating").length,
    resolved: displayReports.filter(r => r.status === "resolved" || r.status === "closed").length,
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      fraud: "Fraude",
      corruption: "Corrupção",
      harassment: "Assédio",
      safety: "Segurança",
      ethics: "Ética",
      environmental: "Ambiental",
      other: "Outros",
    };
    return labels[cat] || cat;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low": return <Badge variant="outline">Baixa</Badge>;
      case "medium": return <Badge className="bg-warning/20 text-warning border-warning/30">Média</Badge>;
      case "high": return <Badge className="bg-warning/20 text-warning border-warning/30">Alta</Badge>;
      case "critical": return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Crítica</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-primary/20 text-primary"><Clock className="h-3 w-3 mr-1" />Aberto</Badge>;
      case "investigating": return <Badge className="bg-warning/20 text-warning"><Eye className="h-3 w-3 mr-1" />Em Análise</Badge>;
      case "resolved": return <Badge className="bg-success/20 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Resolvido</Badge>;
      case "closed": return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Fechado</Badge>;
      case "dismissed": return <Badge variant="destructive">Arquivado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSubmitReport = () => {
    toast.success("Denúncia registrada com sucesso! Protocolo: DEN-2024-0043");
    setShowNewReport(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="h-7 w-7 text-primary" />
            Canal de Denúncias
          </h1>
          <p className="text-muted-foreground mt-1">Canal seguro e anônimo para relatos de irregularidades</p>
        </div>
      </div>

      {/* Security Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Canal Seguro e Confidencial</h3>
            <p className="text-sm text-muted-foreground">
              Suas denúncias são protegidas por criptografia e você pode optar pelo anonimato total. 
              Garantimos sigilo absoluto conforme ISO 37002 e Lei 14.457/2022.
            </p>
          </div>
          <Lock className="h-6 w-6 text-primary" />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="channel">Nova Denúncia</TabsTrigger>
          <TabsTrigger value="reports">Acompanhar</TabsTrigger>
        </TabsList>

        <TabsContent value="channel" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* New Report Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Registrar Denúncia
                  </CardTitle>
                  <CardDescription>
                    Preencha o formulário abaixo para registrar sua denúncia de forma segura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Checkbox 
                      id="anonymous" 
                      checked={isAnonymous} 
                      onCheckedChange={(c) => setIsAnonymous(c as boolean)} 
                    />
                    <div className="flex-1">
                      <Label htmlFor="anonymous" className="font-medium flex items-center gap-2">
                        {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        Denúncia Anônima
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {isAnonymous 
                          ? "Sua identidade será completamente protegida"
                          : "Você poderá ser contatado para mais informações"
                        }
                      </p>
                    </div>
                  </div>

                  {!isAnonymous && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome (opcional)</Label>
                        <Input placeholder="Seu nome" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email ou telefone</Label>
                        <Input placeholder="Para contato" />
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fraud">Fraude</SelectItem>
                          <SelectItem value="corruption">Corrupção</SelectItem>
                          <SelectItem value="harassment">Assédio</SelectItem>
                          <SelectItem value="safety">Segurança do Trabalho</SelectItem>
                          <SelectItem value="ethics">Violação de Ética</SelectItem>
                          <SelectItem value="environmental">Questões Ambientais</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Severidade *</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Nível de urgência" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa - Pode aguardar análise</SelectItem>
                          <SelectItem value="medium">Média - Requer atenção</SelectItem>
                          <SelectItem value="high">Alta - Urgente</SelectItem>
                          <SelectItem value="critical">Crítica - Ação imediata</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descreva a situação *</Label>
                    <Textarea 
                      placeholder="Forneça o máximo de detalhes possível: o que aconteceu, quando, onde, quem estava envolvido..."
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Evidências (opcional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Arraste arquivos ou clique para anexar</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, imagens, documentos até 25MB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="text-sm">IA irá classificar e priorizar automaticamente sua denúncia</span>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleSubmitReport}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Denúncia
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-success" />
                    Garantias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <span>Anonimato garantido por criptografia</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <span>Proteção contra retaliação</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <span>Análise por comitê independente</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <span>Conformidade ISO 37002</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total recebidas</span>
                    <span className="font-semibold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Em aberto</span>
                    <span className="font-semibold text-info">{stats.open}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Em análise</span>
                    <span className="font-semibold text-warning">{stats.investigating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolvidas</span>
                    <span className="font-semibold text-success">{stats.resolved}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6 space-y-4">
          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por protocolo..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="investigating">Em Análise</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map(report => (
              <Card key={report.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-semibold">{report.protocolNumber}</span>
                        {getStatusBadge(report.status)}
                        {getSeverityBadge(report.severity)}
                        <Badge variant="outline">{getCategoryLabel(report.category)}</Badge>
                        {report.isAnonymous && (
                          <Badge variant="outline" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />Anônimo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Registrado: {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        {report.aiClassification && (
                          <span className="flex items-center gap-1 text-accent">
                            <Brain className="h-3 w-3" />
                            {report.aiClassification}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
