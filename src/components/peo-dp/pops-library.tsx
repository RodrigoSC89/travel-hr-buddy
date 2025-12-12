import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import {
  BookOpen,
  Search,
  FileText,
  Plus,
  Star,
  StarOff,
  Download,
  Eye,
  Edit,
  Clock,
  Tag,
  Folder,
  Brain,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Filter
} from "lucide-react";

interface POP {
  id: string;
  code: string;
  title: string;
  category: string;
  version: string;
  status: "active" | "draft" | "review" | "archived";
  lastUpdated: string;
  author: string;
  tags: string[];
  isFavorite: boolean;
  compliance: string[];
  summary?: string;
  sections: POPSection[];
}

interface POPSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

const categories = [
  "Operação DP",
  "Manutenção",
  "Emergência",
  "Treinamento",
  "SIMOPS",
  "Navegação",
  "Comunicação",
  "Segurança"
];

const mockPOPs: POP[] = [
  {
    id: "POP-001",
    code: "POP-DP-001",
    title: "Procedimento de Troca de Turno DP",
    category: "Operação DP",
    version: "3.2",
    status: "active",
    lastUpdated: "2024-12-01",
    author: "SDPO Team",
    tags: ["watchkeeping", "handover", "IMCA M117"],
    isFavorite: true,
    compliance: ["IMCA M117 §3.1", "NORMAM-101"],
    sections: [
      { id: "s1", title: "Objetivo", content: "Estabelecer procedimento padrão para troca de turno...", order: 1 },
      { id: "s2", title: "Responsabilidades", content: "O DPO em saída deve...", order: 2 }
    ]
  },
  {
    id: "POP-002",
    code: "POP-DP-002",
    title: "Resposta a Perda de Posição (Drive-Off)",
    category: "Emergência",
    version: "2.1",
    status: "active",
    lastUpdated: "2024-11-15",
    author: "Safety Officer",
    tags: ["emergency", "drive-off", "ASOG"],
    isFavorite: true,
    compliance: ["IMCA M103 §5.2", "ASOG"],
    sections: [
      { id: "s1", title: "Ações Imediatas", content: "1. Ativar alarme de emergência...", order: 1 }
    ]
  },
  {
    id: "POP-003",
    code: "POP-MNT-001",
    title: "Manutenção Preventiva de Thrusters",
    category: "Manutenção",
    version: "4.0",
    status: "active",
    lastUpdated: "2024-10-20",
    author: "Chief Engineer",
    tags: ["thruster", "preventive", "maintenance"],
    isFavorite: false,
    compliance: ["Class NK", "Fabricante"],
    sections: []
  },
  {
    id: "POP-004",
    code: "POP-SIM-001",
    title: "SIMOPS - Operações Simultâneas com ROV",
    category: "SIMOPS",
    version: "1.5",
    status: "review",
    lastUpdated: "2024-12-03",
    author: "Operations Manager",
    tags: ["simops", "ROV", "zone management"],
    isFavorite: false,
    compliance: ["IMCA R004", "Client Requirements"],
    sections: []
  }
];

export const POPsLibrary: React.FC = () => {
  const [pops, setPOPs] = useState<POP[]>(mockPOPs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPOP, setSelectedPOP] = useState<POP | null>(null);
  const [showPOPDialog, setShowPOPDialog] = useState(false);
  const [aiSummary, setAISummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  const { ask, loading: aiLoading } = useAIAdvisor({ profile: "dpo" });

  const filteredPOPs = pops.filter(pop => {
    const matchesSearch = pop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pop.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pop.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || pop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  };

  const favorites = pops.filter(p => p.isFavorite);

  const toggleFavorite = (id: string) => {
    setPOPs(pops.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    toast.success("Favoritos atualizados");
  });

  const handleViewPOP = (pop: POP) => {
    setSelectedPOP(pop);
    setShowPOPDialog(true);
    setAISummary("");
  });

  const handleGenerateSummary = async () => {
    if (!selectedPOP) return;
    setIsGeneratingSummary(true);
    try {
      const response = await ask(`Resuma o procedimento "${selectedPOP.title}" de forma clara e objetiva para um DPO. Inclua os pontos principais e ações críticas.`);
      setAISummary(response.response);
      toast.success("Resumo gerado com IA");
    } catch {
      setAISummary("O procedimento estabelece diretrizes para operações seguras, incluindo verificações pré-operacionais, monitoramento contínuo e protocolos de emergência conforme normas IMCA.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "active": return <Badge className="bg-green-500">Ativo</Badge>;
    case "draft": return <Badge variant="secondary">Rascunho</Badge>;
    case "review": return <Badge className="bg-yellow-500 text-black">Em Revisão</Badge>;
    default: return <Badge variant="outline">Arquivado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Biblioteca de POPs Inteligente</h2>
            <p className="text-muted-foreground">Procedimentos Operacionais Padrão com suporte de IA</p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo POP
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, código ou tag..."
            value={searchTerm}
            onChange={handleChange}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={handleSetSelectedCategory}
          >
            Todos
          </Button>
          {categories.slice(0, 4).map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={handleSetSelectedCategory}
            >
              {cat}
            </Button>
          ))}
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            Mais
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total POPs</p>
                <p className="text-2xl font-bold">{pops.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{pops.filter(p => p.status === "active").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Revisão</p>
                <p className="text-2xl font-bold text-yellow-600">{pops.filter(p => p.status === "review").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favoritos</p>
                <p className="text-2xl font-bold">{favorites.length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos ({filteredPOPs.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos ({favorites.length})</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-2 gap-4">
            {filteredPOPs.map(pop => (
              <Card key={pop.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handlehandleViewPOP}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{pop.code}</Badge>
                      {getStatusBadge(pop.status)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(pop.id); }}
                    >
                      {pop.isFavorite ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{pop.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Folder className="h-3 w-3" />
                    {pop.category}
                    <span className="text-xs">v{pop.version}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pop.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-2 w-2 mr-1" />{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(pop.lastUpdated).toLocaleDateString("pt-BR")}
                    </span>
                    <span>{pop.author}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid grid-cols-2 gap-4">
            {favorites.map(pop => (
              <Card key={pop.id} className="hover:shadow-lg transition-all cursor-pointer border-yellow-500/30" onClick={() => handlehandleViewPOP}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="font-mono text-xs">{pop.code}</Badge>
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <CardTitle className="text-lg">{pop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Folder className="h-3 w-3" />
                    {pop.category}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {pops.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map(pop => (
                <div key={pop.id} className="p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer" onClick={() => handlehandleViewPOP}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">{pop.code}</Badge>
                      <span className="font-medium">{pop.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(pop.lastUpdated).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* POP Detail Dialog */}
      <Dialog open={showPOPDialog} onOpenChange={setShowPOPDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedPOP && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono">{selectedPOP.code}</Badge>
                  {getStatusBadge(selectedPOP.status)}
                  <Badge variant="secondary">v{selectedPOP.version}</Badge>
                </div>
                <DialogTitle className="text-xl">{selectedPOP.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1"><Folder className="h-3 w-3" />{selectedPOP.category}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(selectedPOP.lastUpdated).toLocaleDateString("pt-BR")}</span>
                    <span>{selectedPOP.author}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Compliance */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Referências Normativas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPOP.compliance.map((c, i) => (
                      <Badge key={i} variant="outline">{c}</Badge>
                    ))}
                  </div>
                </div>

                {/* AI Summary */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <span className="font-medium">Resumo IA</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {isGeneratingSummary ? "Gerando..." : "Gerar Resumo"}
                    </Button>
                  </div>
                  {aiSummary ? (
                    <p className="text-sm text-muted-foreground">{aiSummary}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Clique em "Gerar Resumo" para obter um resumo inteligente deste procedimento.</p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedPOP.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />{tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar Completo
                  </Button>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
