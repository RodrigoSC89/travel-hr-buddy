/**
 * Compliance Regulamentos - Gestão de Regulamentos e Regras Legais
 * ISO 37301 Compliance Management
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComplianceRules } from "../hooks/useComplianceData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { 
  FileText, Search, Plus, Filter, Calendar, AlertTriangle, 
  CheckCircle2, Clock, BookOpen, Scale, Globe, Building2,
  Brain, TrendingUp, Shield
} from "lucide-react";
import { toast } from "sonner";

interface Regulation {
  id: string;
  name: string;
  code: string;
  category: "maritime" | "labor" | "environmental" | "financial" | "safety";
  jurisdiction: string;
  status: "active" | "pending" | "expired" | "draft";
  effectiveDate: string;
  expiryDate?: string;
  complianceLevel: number;
  requirements: number;
  completedRequirements: number;
  aiRecommendations: number;
}

const fallbackRegulations: Regulation[] = [
  {
    id: "1",
    name: "MLC 2006 - Maritime Labour Convention",
    code: "MLC-2006",
    category: "labor",
    jurisdiction: "Internacional (IMO)",
    status: "active",
    effectiveDate: "2013-08-20",
    complianceLevel: 92,
    requirements: 48,
    completedRequirements: 44,
    aiRecommendations: 3,
  },
  {
    id: "2",
    name: "STCW - Standards of Training, Certification and Watchkeeping",
    code: "STCW-78/10",
    category: "safety",
    jurisdiction: "Internacional (IMO)",
    status: "active",
    effectiveDate: "2010-01-01",
    complianceLevel: 88,
    requirements: 35,
    completedRequirements: 31,
    aiRecommendations: 2,
  },
  {
    id: "3",
    name: "SOLAS - Safety of Life at Sea",
    code: "SOLAS-74",
    category: "safety",
    jurisdiction: "Internacional (IMO)",
    status: "active",
    effectiveDate: "1980-05-25",
    complianceLevel: 95,
    requirements: 62,
    completedRequirements: 59,
    aiRecommendations: 1,
  },
  {
    id: "4",
    name: "MARPOL - Marine Pollution",
    code: "MARPOL-73/78",
    category: "environmental",
    jurisdiction: "Internacional (IMO)",
    status: "active",
    effectiveDate: "1983-10-02",
    complianceLevel: 78,
    requirements: 28,
    completedRequirements: 22,
    aiRecommendations: 4,
  },
  {
    id: "5",
    name: "LGPD - Lei Geral de Proteção de Dados",
    code: "LGPD-BR",
    category: "financial",
    jurisdiction: "Brasil",
    status: "active",
    effectiveDate: "2020-09-18",
    complianceLevel: 85,
    requirements: 15,
    completedRequirements: 13,
    aiRecommendations: 2,
  },
  {
    id: "6",
    name: "NR-30 - Segurança em Aquaviários",
    code: "NR-30",
    category: "labor",
    jurisdiction: "Brasil (MTE)",
    status: "active",
    effectiveDate: "2002-01-01",
    complianceLevel: 90,
    requirements: 22,
    completedRequirements: 20,
    aiRecommendations: 1,
  },
];

export default function ComplianceRegulamentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", category: "", jurisdiction: "", description: "" });
  const { data: rules, isLoading } = useComplianceRules();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use backend data when available, fallback to mock
  const regulations = (rules && rules.length > 0) ? rules.map((r) => ({
    id: r.id,
    name: r.title || "",
    code: r.legal_reference || "",
    category: (r.category || "maritime") as Regulation["category"],
    jurisdiction: r.jurisdiction || "Internacional",
    status: (r.status || "active") as Regulation["status"],
    effectiveDate: r.effective_date || r.created_at || "",
    complianceLevel: 80,
    requirements: 10,
    completedRequirements: 8,
    aiRecommendations: 0,
  })) : fallbackRegulations;

  const handleSaveRegulation = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome do regulamento é obrigatório");
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.from("action_items").insert({
        title: `Regulamento: ${formData.name} (${formData.code})`,
        description: `Categoria: ${formData.category} | Jurisdição: ${formData.jurisdiction} | ${formData.description}`,
        source_module: "compliance-regulamentos",
        status: "pending",
        priority: "medium",
        created_by: user?.id,
      });
      if (error) throw error;
      toast.success("Regulamento adicionado com sucesso!");
      setShowAddDialog(false);
      setFormData({ name: "", code: "", category: "", jurisdiction: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["compliance-rules"] });
    } catch {
      toast.error("Erro ao salvar regulamento. Tente novamente.");
      setShowAddDialog(false);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRegulations = regulations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reg.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || reg.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: regulations.length,
    active: regulations.filter(r => r.status === "active").length,
    avgCompliance: Math.round(regulations.reduce((a, b) => a + b.complianceLevel, 0) / regulations.length),
    pendingAI: regulations.reduce((a, b) => a + b.aiRecommendations, 0),
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      maritime: "bg-primary/20 text-primary border-primary/30",
      labor: "bg-info/20 text-info border-info/30",
      environmental: "bg-success/20 text-success border-success/30",
      financial: "bg-warning/20 text-warning border-warning/30",
      safety: "bg-destructive/20 text-destructive border-destructive/30",
    };
    const labels: Record<string, string> = {
      maritime: "Marítimo",
      labor: "Trabalhista",
      environmental: "Ambiental",
      financial: "Financeiro",
      safety: "Segurança",
    };
    return <Badge className={colors[category] || ""}>{labels[category] || category}</Badge>;
  };

  const getComplianceColor = (level: number) => {
    if (level >= 90) return "text-emerald-400";
    if (level >= 70) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-7 w-7 text-primary" />
            Regulamentos & Regras Legais
          </h1>
          <p className="text-muted-foreground mt-1">Gestão de conformidade regulatória ISO 37301</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Regulamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Regulamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Regulamento</Label>
                <Input placeholder="Ex: MLC 2006 - Maritime Labour Convention" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input placeholder="Ex: MLC-2006" value={formData.code} onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maritime">Marítimo</SelectItem>
                      <SelectItem value="labor">Trabalhista</SelectItem>
                      <SelectItem value="environmental">Ambiental</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                      <SelectItem value="safety">Segurança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jurisdição</Label>
                <Input placeholder="Ex: Internacional (IMO)" value={formData.jurisdiction} onChange={(e) => setFormData(p => ({ ...p, jurisdiction: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Descrição do regulamento e seus requisitos principais..." rows={3} value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={handleSaveRegulation} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Regulamento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Regulamentos</div>
          </CardContent>
        </Card>
        <Card className="bg-success/10 border-success/30">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-success mb-2" />
            <div className="text-2xl font-bold text-success">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Ativos</div>
          </CardContent>
        </Card>
        <Card className="bg-info/10 border-info/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-info mb-2" />
            <div className="text-2xl font-bold text-info">{stats.avgCompliance}%</div>
            <div className="text-xs text-muted-foreground">Conformidade Média</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/10 border-secondary/30">
          <CardContent className="p-4 text-center">
            <Brain className="h-6 w-6 mx-auto text-secondary-foreground mb-2" />
            <div className="text-2xl font-bold text-secondary-foreground">{stats.pendingAI}</div>
            <div className="text-xs text-muted-foreground">Recomendações IA</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar regulamentos..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            <SelectItem value="maritime">Marítimo</SelectItem>
            <SelectItem value="labor">Trabalhista</SelectItem>
            <SelectItem value="environmental">Ambiental</SelectItem>
            <SelectItem value="financial">Financeiro</SelectItem>
            <SelectItem value="safety">Segurança</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Regulations List */}
      <div className="space-y-4">
        {filteredRegulations.map(reg => (
          <Card key={reg.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-lg">{reg.name}</h3>
                    {getCategoryBadge(reg.category)}
                    {reg.aiRecommendations > 0 && (
                      <Badge className="bg-purple-500/20 text-purple-400">
                        <Brain className="h-3 w-3 mr-1" />
                        {reg.aiRecommendations} IA
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      {reg.code}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {reg.jurisdiction}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Desde {new Date(reg.effectiveDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getComplianceColor(reg.complianceLevel)}`}>
                      {reg.complianceLevel}%
                    </div>
                    <div className="text-xs text-muted-foreground">Conformidade</div>
                    <Progress value={reg.complianceLevel} className="h-1 w-24 mt-1" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {reg.completedRequirements}/{reg.requirements}
                    </div>
                    <div className="text-xs text-muted-foreground">Requisitos</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.info(`${reg.name}`, { description: `${reg.completedRequirements}/${reg.requirements} requisitos atendidos. Jurisdição: ${reg.jurisdiction}. Código: ${reg.code}` })}>
                    <FileText className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
