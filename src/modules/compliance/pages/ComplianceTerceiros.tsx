/**
 * Compliance Due Diligence - Gestão de Terceiros
 * Verificação e monitoramento de fornecedores e parceiros
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComplianceThirdParties } from "../hooks/useComplianceData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, Search, Plus, Building2, AlertTriangle, CheckCircle2,
  XCircle, Clock, Filter, Globe, Phone, Mail, FileSearch,
  Brain, Shield, TrendingUp, Ban, Eye, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface ThirdParty {
  id: string;
  name: string;
  type: "supplier" | "contractor" | "partner" | "agent" | "service_provider";
  country: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "approved" | "pending" | "under_review" | "blocked";
  dueDiligenceScore: number;
  lastReview: string;
  nextReview: string;
  documentsComplete: number;
  documentsRequired: number;
  aiRiskFlags: string[];
  isBlocked: boolean;
}

const fallbackThirdParties: ThirdParty[] = [
  {
    id: "1",
    name: "Maritime Solutions Ltd",
    type: "supplier",
    country: "Brasil",
    riskLevel: "low",
    status: "approved",
    dueDiligenceScore: 95,
    lastReview: "2024-11-15",
    nextReview: "2025-11-15",
    documentsComplete: 12,
    documentsRequired: 12,
    aiRiskFlags: [],
    isBlocked: false,
  },
  {
    id: "2",
    name: "Global Shipping Co",
    type: "contractor",
    country: "Singapura",
    riskLevel: "medium",
    status: "approved",
    dueDiligenceScore: 78,
    lastReview: "2024-08-20",
    nextReview: "2025-02-20",
    documentsComplete: 9,
    documentsRequired: 10,
    aiRiskFlags: ["Documentação pendente"],
    isBlocked: false,
  },
  {
    id: "3",
    name: "Oceanic Services SA",
    type: "service_provider",
    country: "Panamá",
    riskLevel: "high",
    status: "under_review",
    dueDiligenceScore: 52,
    lastReview: "2024-06-10",
    nextReview: "2024-12-10",
    documentsComplete: 5,
    documentsRequired: 12,
    aiRiskFlags: ["País de alto risco", "Documentação incompleta", "PEP associado"],
    isBlocked: false,
  },
  {
    id: "4",
    name: "TechNav Systems",
    type: "partner",
    country: "EUA",
    riskLevel: "low",
    status: "approved",
    dueDiligenceScore: 92,
    lastReview: "2024-10-01",
    nextReview: "2025-10-01",
    documentsComplete: 8,
    documentsRequired: 8,
    aiRiskFlags: [],
    isBlocked: false,
  },
  {
    id: "5",
    name: "Offshore Contractors ME",
    type: "contractor",
    country: "Emirados Árabes",
    riskLevel: "critical",
    status: "blocked",
    dueDiligenceScore: 25,
    lastReview: "2024-03-15",
    nextReview: "2024-09-15",
    documentsComplete: 2,
    documentsRequired: 15,
    aiRiskFlags: ["Sanções internacionais", "Fraude identificada", "Lista negra OFAC"],
    isBlocked: true,
  },
  {
    id: "6",
    name: "Port Logistics Brazil",
    type: "agent",
    country: "Brasil",
    riskLevel: "low",
    status: "pending",
    dueDiligenceScore: 0,
    lastReview: "",
    nextReview: "2025-01-15",
    documentsComplete: 0,
    documentsRequired: 10,
    aiRiskFlags: [],
    isBlocked: false,
  },
];

export default function ComplianceTerceiros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "", country: "", taxId: "", contact: "", description: "" });
  const { data: thirdParties, isLoading } = useComplianceThirdParties();
  const { user } = useAuth();

  const displayData = (thirdParties && thirdParties.length > 0) 
    ? ((thirdParties as unknown) as Record<string, unknown>[]).map((tp) => ({
        id: String(tp.id),
        name: String(tp.name || tp.title || "Unknown"),
        type: (String(tp.type || "supplier")) as ThirdParty["type"],
        country: String(tp.country || "Brasil"),
        riskLevel: (String(tp.risk_level || "low")) as ThirdParty["riskLevel"],
        status: (String(tp.status || "pending")) as ThirdParty["status"],
        dueDiligenceScore: Number(tp.due_diligence_score) || 0,
        lastReview: String(tp.last_review || ""),
        nextReview: String(tp.next_review || ""),
        documentsComplete: Number(tp.documents_complete) || 0,
        documentsRequired: Number(tp.documents_required) || 10,
        aiRiskFlags: (tp.ai_risk_flags as string[]) || [],
        isBlocked: Boolean(tp.is_blocked),
      }))
    : fallbackThirdParties;

  const handleSaveThirdParty = async () => {
    if (!formData.name.trim()) { toast.error("Nome da empresa é obrigatório"); return; }
    setIsSaving(true);
    try {
      const { error } = await supabase.from("action_items").insert({
        title: `Due Diligence: ${formData.name}`,
        description: `Tipo: ${formData.type} | País: ${formData.country} | CNPJ: ${formData.taxId} | Contato: ${formData.contact} | ${formData.description}`,
        source_module: "compliance-terceiros",
        status: "pending",
        priority: "high",
        created_by: user?.id,
      });
      if (error) throw error;
      toast.success("Terceiro cadastrado para análise de Due Diligence!");
      setShowAddDialog(false);
      setFormData({ name: "", type: "", country: "", taxId: "", contact: "", description: "" });
    } catch {
      toast.error("Erro ao cadastrar terceiro");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = displayData.filter(tp => {
    const matchesSearch = tp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === "all" || tp.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const stats = {
    total: displayData.length,
    approved: displayData.filter(t => t.status === "approved").length,
    pending: displayData.filter(t => t.status === "pending" || t.status === "under_review").length,
    blocked: displayData.filter(t => t.isBlocked).length,
    avgScore: Math.round(displayData.filter(t => t.dueDiligenceScore > 0).reduce((a, b) => a + b.dueDiligenceScore, 0) / displayData.filter(t => t.dueDiligenceScore > 0).length),
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "low": return <Badge className="bg-success/20 text-success border-success/30">Baixo</Badge>;
      case "medium": return <Badge className="bg-warning/20 text-warning border-warning/30">Médio</Badge>;
      case "high": return <Badge className="bg-warning/20 text-warning border-warning/30">Alto</Badge>;
      case "critical": return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Crítico</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getStatusBadge = (status: string, isBlocked: boolean) => {
    if (isBlocked) return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Bloqueado</Badge>;
    switch (status) {
      case "approved": return <Badge className="bg-success/20 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case "pending": return <Badge className="bg-info/20 text-info"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "under_review": return <Badge className="bg-warning/20 text-warning"><Eye className="h-3 w-3 mr-1" />Em Análise</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      supplier: "Fornecedor",
      contractor: "Contratado",
      partner: "Parceiro",
      agent: "Agente",
      service_provider: "Prestador de Serviço",
    };
    return labels[type] || type;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    if (score > 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Due Diligence - Terceiros
          </h1>
          <p className="text-muted-foreground mt-1">Gestão e verificação de fornecedores e parceiros</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Terceiro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Terceiro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input placeholder="Ex: Maritime Solutions Ltd" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">Fornecedor</SelectItem>
                      <SelectItem value="contractor">Contratado</SelectItem>
                      <SelectItem value="partner">Parceiro</SelectItem>
                      <SelectItem value="agent">Agente</SelectItem>
                      <SelectItem value="service_provider">Prestador de Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input placeholder="Ex: Brasil" value={formData.country} onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CNPJ/Tax ID</Label>
                  <Input placeholder="00.000.000/0001-00" value={formData.taxId} onChange={(e) => setFormData(p => ({ ...p, taxId: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <Input placeholder="nome@empresa.com" value={formData.contact} onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição do Serviço</Label>
                <Textarea placeholder="Descreva os serviços prestados..." rows={2} value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                <Brain className="h-5 w-5 text-accent-foreground" />
                <span className="text-sm">IA irá analisar riscos automaticamente após cadastro</span>
              </div>
              <Button className="w-full" onClick={handleSaveThirdParty} disabled={isSaving}>
                {isSaving ? "Cadastrando..." : "Iniciar Due Diligence"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <Building2 className="h-6 w-6 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Terceiros</div>
          </CardContent>
        </Card>
        <Card className="bg-success/10 border-success/30">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-success mb-2" />
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
            <div className="text-xs text-muted-foreground">Aprovados</div>
          </CardContent>
        </Card>
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-warning mb-2" />
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 text-center">
            <Ban className="h-6 w-6 mx-auto text-destructive mb-2" />
            <div className="text-2xl font-bold text-destructive">{stats.blocked}</div>
            <div className="text-xs text-muted-foreground">Bloqueados</div>
          </CardContent>
        </Card>
        <Card className="bg-info/10 border-info/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-info mb-2" />
            <div className="text-2xl font-bold text-info">{stats.avgScore}%</div>
            <div className="text-xs text-muted-foreground">Score Médio</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar terceiros..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Risco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Níveis</SelectItem>
            <SelectItem value="low">Baixo Risco</SelectItem>
            <SelectItem value="medium">Médio Risco</SelectItem>
            <SelectItem value="high">Alto Risco</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Third Parties List */}
      <div className="space-y-4">
        {filteredData.map(tp => (
          <Card key={tp.id} className={`hover:border-primary/30 transition-colors ${tp.isBlocked ? "border-destructive/30 bg-destructive/5" : ""}`}>
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-lg">{tp.name}</h3>
                    {getStatusBadge(tp.status, tp.isBlocked)}
                    {getRiskBadge(tp.riskLevel)}
                    <Badge variant="outline">{getTypeLabel(tp.type)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {tp.country}
                    </span>
                    {tp.lastReview && (
                      <span className="flex items-center gap-1">
                        <FileSearch className="h-4 w-4" />
                        Última análise: {new Date(tp.lastReview).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  {tp.aiRiskFlags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                    <Brain className="h-4 w-4 text-accent-foreground" />
                      {tp.aiRiskFlags.map((flag: string) => (
                        <Badge key={`risk-${flag}`} variant="outline" className="text-xs bg-accent/10 text-accent-foreground border-accent/30">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(tp.dueDiligenceScore)}`}>
                      {tp.dueDiligenceScore > 0 ? `${tp.dueDiligenceScore}%` : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">DD Score</div>
                    {tp.dueDiligenceScore > 0 && (
                      <Progress value={tp.dueDiligenceScore} className="h-1 w-20 mt-1" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {tp.documentsComplete}/{tp.documentsRequired}
                    </div>
                    <div className="text-xs text-muted-foreground">Documentos</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Analisar
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
