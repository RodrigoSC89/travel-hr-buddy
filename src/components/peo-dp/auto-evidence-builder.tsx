import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Calendar,
  Shield,
  AlertTriangle,
  Eye,
  Printer,
  Send,
  Link2,
  FolderOpen,
  FileCheck,
  FilePlus,
  Archive,
  Layers,
  Target,
  BookOpen,
  Brain,
  Sparkles,
  Loader2
} from "lucide-react";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";

interface EvidenceItem {
  id: string;
  type: "logbook" | "checklist" | "certificate" | "report" | "photo" | "system_log" | "training";
  name: string;
  date: string;
  source: string;
  status: "available" | "pending" | "missing";
  linkedTo?: string[];
  fileSize?: string;
}

interface EvidencePackage {
  id: string;
  name: string;
  type: "audit" | "trial" | "incident" | "compliance" | "training";
  targetAudience: "IMCA" | "Petrobras" | "NI" | "DNV" | "Internal";
  status: "draft" | "in_progress" | "ready" | "submitted";
  createdAt: string;
  dueDate?: string;
  items: EvidenceItem[];
  completeness: number;
  validator?: string;
}

interface AuditRequirement {
  id: string;
  standard: string;
  clause: string;
  description: string;
  evidenceTypes: string[];
  mandatory: boolean;
}

const mockEvidenceItems: EvidenceItem[] = [
  { id: "EV-001", type: "logbook", name: "DP Logbook - Dezembro 2024", date: "2024-12-04", source: "Smart DP Logbook", status: "available", fileSize: "2.4 MB" },
  { id: "EV-002", type: "checklist", name: "ASOG Checklist - MV Atlantic Explorer", date: "2024-12-01", source: "Checklist Builder", status: "available", fileSize: "1.2 MB" },
  { id: "EV-003", type: "certificate", name: "DP Annual Trial Certificate 2024", date: "2024-11-15", source: "FMEA/Trials", status: "available", fileSize: "450 KB" },
  { id: "EV-004", type: "report", name: "FMEA Report - Rev.5", date: "2024-10-20", source: "FMEA Integration", status: "available", fileSize: "8.5 MB" },
  { id: "EV-005", type: "system_log", name: "DP System Events Log", date: "2024-12-04", source: "Sistema DP", status: "available", fileSize: "5.1 MB" },
  { id: "EV-006", type: "training", name: "CPD Records - João Silva", date: "2024-12-01", source: "Competence Hub", status: "available", fileSize: "890 KB" },
  { id: "EV-007", type: "checklist", name: "Bias Test Records", date: "2024-11-28", source: "DP Trials", status: "pending", fileSize: "320 KB" },
  { id: "EV-008", type: "certificate", name: "Capability Plot 2024", date: "2024-11-10", source: "DP Trials", status: "available", fileSize: "1.8 MB" },
  { id: "EV-009", type: "photo", name: "Evidências Fotográficas - Bridge Layout", date: "2024-11-05", source: "Inspeção", status: "missing" }
];

const mockPackages: EvidencePackage[] = [
  {
    id: "PKG-001",
    name: "Auditoria IMCA M190 - Annual DP Trial",
    type: "trial",
    targetAudience: "IMCA",
    status: "in_progress",
    createdAt: "2024-12-01",
    dueDate: "2024-12-15",
    items: mockEvidenceItems.slice(0, 5),
    completeness: 75,
    validator: "Carlos Eduardo"
  },
  {
    id: "PKG-002",
    name: "Compliance Petrobras - PEO-DP 2024",
    type: "compliance",
    targetAudience: "Petrobras",
    status: "draft",
    createdAt: "2024-12-03",
    dueDate: "2024-12-20",
    items: mockEvidenceItems.slice(2, 6),
    completeness: 45
  },
  {
    id: "PKG-003",
    name: "Relatório de Incidente - Perda MRU#1",
    type: "incident",
    targetAudience: "Internal",
    status: "ready",
    createdAt: "2024-11-30",
    items: mockEvidenceItems.slice(0, 3),
    completeness: 100,
    validator: "João Silva"
  }
];

const mockRequirements: AuditRequirement[] = [
  { id: "REQ-001", standard: "IMCA M190", clause: "4.2.1", description: "DP Annual Trial Certificate válido", evidenceTypes: ["certificate"], mandatory: true },
  { id: "REQ-002", standard: "IMCA M190", clause: "4.2.2", description: "FMEA atualizado e aprovado", evidenceTypes: ["report"], mandatory: true },
  { id: "REQ-003", standard: "IMCA M190", clause: "4.3.1", description: "Registros de Logbook DP", evidenceTypes: ["logbook", "system_log"], mandatory: true },
  { id: "REQ-004", standard: "IMCA M117", clause: "5.1", description: "Registros CPD da tripulação DP", evidenceTypes: ["training", "certificate"], mandatory: true },
  { id: "REQ-005", standard: "IMCA M109", clause: "3.2", description: "ASOG atualizado e assinado", evidenceTypes: ["checklist"], mandatory: true },
  { id: "REQ-006", standard: "IMCA M190", clause: "4.4", description: "Capability Plot validado", evidenceTypes: ["certificate", "report"], mandatory: false }
];

export const AutoEvidenceBuilder: React.FC = () => {
  const [packages, setPackages] = useState<EvidencePackage[]>(mockPackages);
  const [evidenceItems] = useState<EvidenceItem[]>(mockEvidenceItems);
  const [requirements] = useState<AuditRequirement[]>(mockRequirements);
  const [selectedPackage, setSelectedPackage] = useState<EvidencePackage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("packages");
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  const { generateEvidence, loading: aiLoading } = useAIAdvisor({
    profile: "inspector",
    language: "pt-BR",
  };

  const filteredItems = evidenceItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePackage = () => {
    toast.success("Assistente de criação de pacote iniciado");
  };

  const handleGeneratePDF = (pkg: EvidencePackage) => {
    toast.success(`Gerando PDF: ${pkg.name}`);
  };

  const handleSubmitPackage = (pkg: EvidencePackage) => {
    setPackages(packages.map(p => p.id === pkg.id ? { ...p, status: "submitted" } : p));
    toast.success(`Pacote ${pkg.name} enviado para validação`);
  };

  const handleAutoCollect = () => {
    toast.success("Coletando evidências automaticamente dos módulos...");
  };

  const handleGenerateAISummary = async (pkg: EvidencePackage) => {
    setGeneratingSummary(pkg.id);
    try {
      const eventData = {
        type: pkg.type,
        name: pkg.name,
        date: pkg.createdAt,
        vessel: "MV Atlantic Explorer",
        description: `Pacote de evidências contendo ${pkg.items.length} documentos para ${pkg.targetAudience}. Status: ${pkg.status}. Completude: ${pkg.completeness}%.`,
        items: pkg.items.map(i => ({ name: i.name, type: i.type, status: i.status })),
      };
      
      const summary = await generateEvidence(eventData);
      setAiSummaries(prev => ({ ...prev, [pkg.id]: summary }));
      toast.success("Resumo técnico gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar resumo");
    } finally {
      setGeneratingSummary(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "ready": return <Badge className="bg-green-500">Pronto</Badge>;
    case "in_progress": return <Badge className="bg-blue-500">Em Progresso</Badge>;
    case "draft": return <Badge variant="secondary">Rascunho</Badge>;
    case "submitted": return <Badge className="bg-purple-500">Enviado</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
    case "available": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
    case "missing": return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default: return null;
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
    case "logbook": return <BookOpen className="h-4 w-4" />;
    case "checklist": return <FileCheck className="h-4 w-4" />;
    case "certificate": return <Shield className="h-4 w-4" />;
    case "report": return <FileText className="h-4 w-4" />;
    case "photo": return <Eye className="h-4 w-4" />;
    case "system_log": return <Layers className="h-4 w-4" />;
    case "training": return <Target className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Archive className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Auto-Evidence Builder</h2>
            <p className="text-muted-foreground">Gerador automático de evidências para auditorias</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAutoCollect}>
            <Link2 className="w-4 h-4 mr-2" />Coletar Automaticamente
          </Button>
          <Button onClick={handleCreatePackage}>
            <Plus className="w-4 h-4 mr-2" />Novo Pacote
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pacotes Ativos</p>
                <p className="text-2xl font-bold">{packages.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prontos</p>
                <p className="text-2xl font-bold">{packages.filter(p => p.status === "ready").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evidências</p>
                <p className="text-2xl font-bold">{evidenceItems.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{evidenceItems.filter(e => e.status === "pending").length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faltantes</p>
                <p className="text-2xl font-bold">{evidenceItems.filter(e => e.status === "missing").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />Pacotes de Evidências
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />Biblioteca de Evidências
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />Requisitos de Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {packages.map(pkg => (
              <Card key={pkg.id} className="hover:shadow-lg transition-all">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{pkg.name}</h3>
                        {getStatusBadge(pkg.status)}
                        <Badge variant="outline">{pkg.targetAudience}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Criado: {new Date(pkg.createdAt).toLocaleDateString("pt-BR")}</span>
                        {pkg.dueDate && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Prazo: {new Date(pkg.dueDate).toLocaleDateString("pt-BR")}</span>}
                        <span className="flex items-center gap-1"><FileText className="h-4 w-4" />{pkg.items.length} documentos</span>
                        {pkg.validator && <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" />Validador: {pkg.validator}</span>}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Completude</span>
                          <span className={`font-medium ${pkg.completeness === 100 ? "text-green-500" : pkg.completeness >= 70 ? "text-yellow-500" : "text-red-500"}`}>{pkg.completeness}%</span>
                        </div>
                        <Progress value={pkg.completeness} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {pkg.items.slice(0, 4).map(item => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {getItemTypeIcon(item.type)}
                            <span className="ml-1">{item.name.substring(0, 20)}...</span>
                          </Badge>
                        ))}
                        {pkg.items.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{pkg.items.length - 4} mais</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handlehandleGenerateAISummary}
                        disabled={generatingSummary === pkg.id}
                      >
                        {generatingSummary === pkg.id ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Brain className="w-3 h-3 mr-1" />
                        )}
                        Resumo IA
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlehandleGeneratePDF}>
                        <Download className="w-3 h-3 mr-1" />PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />Visualizar
                      </Button>
                      {pkg.status === "ready" && (
                        <Button size="sm" onClick={() => handlehandleSubmitPackage}>
                          <Send className="w-3 h-3 mr-1" />Enviar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* AI Summary Section */}
                  {aiSummaries[pkg.id] && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Resumo Técnico (IA)</span>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-xs bg-background/50 p-3 rounded">
                          {aiSummaries[pkg.id]}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar evidências..." value={searchTerm} onChange={handleChange} className="pl-10" />
              </div>
            </CardContent>
          </Card>

          {/* Evidence List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Biblioteca de Evidências</CardTitle>
              <CardDescription>Documentos disponíveis para inclusão em pacotes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                      />
                      <div className="p-2 bg-muted rounded">
                        {getItemTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{item.source}</span>
                          <span>{new Date(item.date).toLocaleDateString("pt-BR")}</span>
                          {item.fileSize && <span>{item.fileSize}</span>}
                        </div>
                      </div>
                      {getItemStatusIcon(item.status)}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedItems.length > 0 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{selectedItems.length} itens selecionados</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSetSelectedItems}>Limpar</Button>
                    <Button><FilePlus className="w-4 h-4 mr-2" />Criar Pacote</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisitos de Auditoria</CardTitle>
              <CardDescription>Mapeamento de evidências necessárias por norma</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {requirements.map(req => {
                    const hasEvidence = evidenceItems.some(e => req.evidenceTypes.includes(e.type) && e.status === "available");
                    return (
                      <div key={req.id} className={`p-4 rounded-lg border ${hasEvidence ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{req.standard}</Badge>
                              <Badge variant="secondary">{req.clause}</Badge>
                              {req.mandatory && <Badge variant="destructive">Obrigatório</Badge>}
                            </div>
                            <p className="mt-2 font-medium">{req.description}</p>
                            <div className="flex gap-1 mt-2">
                              {req.evidenceTypes.map(type => (
                                <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                              ))}
                            </div>
                          </div>
                          {hasEvidence ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoEvidenceBuilder;
