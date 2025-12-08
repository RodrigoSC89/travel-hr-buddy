import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Ship,
  FileCheck,
  FileText,
  Wrench,
  Monitor,
  Users,
  Activity,
  AlertTriangle,
  Brain,
  BarChart3,
  ClipboardList,
  Download,
  Settings,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  FileWarning,
  Sparkles
} from "lucide-react";
import { DP_CHECKLIST_CATEGORIES, DP_CHECKLIST_ITEMS } from "@/data/imca-dp-checklist";
import { IMCADPChecklist } from "./IMCADPChecklist";
import { IMCADPAIAssistant } from "./IMCADPAIAssistant";
import { IMCADPCompetencyMatrix } from "./IMCADPCompetencyMatrix";
import { IMCADPNonConformities } from "./IMCADPNonConformities";

interface AuditStatus {
  totalItems: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  notApplicable: number;
  imperativeNCs: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "ASOG": <FileCheck className="h-5 w-5" />,
  "DOC": <FileText className="h-5 w-5" />,
  "MNT": <Wrench className="h-5 w-5" />,
  "INF": <Monitor className="h-5 w-5" />,
  "COMP": <Users className="h-5 w-5" />,
  "MON": <Activity className="h-5 w-5" />,
  "EMG": <AlertTriangle className="h-5 w-5" />
};

export function IMCADPAuditDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDPClass, setSelectedDPClass] = useState<"DP1" | "DP2" | "DP3">("DP2");
  const [auditData, setAuditData] = useState<Record<number, { status: string; notes: string; evidence: string }>>({});

  // Calculate audit statistics
  const getAuditStatus = (): AuditStatus => {
    const applicableItems = DP_CHECKLIST_ITEMS.filter(item => 
      item.applicableDPClass.includes(selectedDPClass)
    );
    
    const compliant = Object.entries(auditData).filter(([_, v]) => v.status === "C").length;
    const nonCompliant = Object.entries(auditData).filter(([_, v]) => v.status === "NC").length;
    const notApplicable = Object.entries(auditData).filter(([_, v]) => v.status === "NA").length;
    const pending = applicableItems.length - compliant - nonCompliant - notApplicable;
    
    const imperativeNCs = Object.entries(auditData)
      .filter(([id, v]) => {
        const item = DP_CHECKLIST_ITEMS.find(i => i.id === parseInt(id));
        return v.status === "NC" && item?.isImperative;
      }).length;

    return {
      totalItems: applicableItems.length,
      compliant,
      nonCompliant,
      pending,
      notApplicable,
      imperativeNCs
    };
  };

  const status = getAuditStatus();
  const complianceScore = status.totalItems > 0 
    ? Math.round(((status.compliant) / (status.totalItems - status.notApplicable)) * 100) || 0
    : 0;

  const getCategoryStatus = (categoryCode: string) => {
    const items = DP_CHECKLIST_ITEMS.filter(i => 
      (i.categoryCode === categoryCode || (categoryCode === "ASOG" && i.categoryCode === "CAMO")) &&
      i.applicableDPClass.includes(selectedDPClass)
    );
    
    const compliant = items.filter(i => auditData[i.id]?.status === "C").length;
    const nonCompliant = items.filter(i => auditData[i.id]?.status === "NC").length;
    const total = items.length;
    
    return { compliant, nonCompliant, total, score: total > 0 ? Math.round((compliant / total) * 100) : 0 };
  };

  const handleExportAudit = () => {
    toast({
      title: "Exportando Auditoria",
      description: "Relatório sendo gerado em PDF..."
    });
    // Implementation for PDF export would go here
  };

  const handleFilterSettings = () => {
    toast({
      title: "Filtros",
      description: "Configurações de filtro abertas"
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ship className="h-8 w-8 text-primary" />
            Auditoria IMCA DP
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de Auditoria de Posicionamento Dinâmico com IA Integrada
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            {(["DP1", "DP2", "DP3"] as const).map(dpClass => (
              <Button
                key={dpClass}
                variant={selectedDPClass === dpClass ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedDPClass(dpClass)}
              >
                {dpClass}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={handleFilterSettings}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setAuditData({})}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleExportAudit}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Geral</p>
                <p className="text-3xl font-bold text-primary">{complianceScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/50" />
            </div>
            <Progress value={complianceScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-green-500/50 transition-colors" onClick={() => setActiveTab("checklist")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformes</p>
                <p className="text-3xl font-bold text-green-600">{status.compliant}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => setActiveTab("nc")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Conformes</p>
                <p className="text-3xl font-bold text-red-600">{status.nonCompliant}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => setActiveTab("checklist")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold text-amber-600">{status.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-destructive/50 transition-colors" onClick={() => setActiveTab("nc")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NCs Impeditivas</p>
                <p className="text-3xl font-bold text-destructive">{status.imperativeNCs}</p>
              </div>
              <FileWarning className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("checklist")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Itens</p>
                <p className="text-3xl font-bold">{status.totalItems}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="nc" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            NCs / Ações
          </TabsTrigger>
          <TabsTrigger value="competency" className="gap-2">
            <Users className="h-4 w-4" />
            Competências
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2 relative">
            <Brain className="h-4 w-4" />
            Assistente IA
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-amber-500" />
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DP_CHECKLIST_CATEGORIES.map(category => {
              const catStatus = getCategoryStatus(category.code);
              return (
                <Card 
                  key={category.code}
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                  onClick={() => setActiveTab("checklist")}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {categoryIcons[category.code]}
                        </div>
                        <div>
                          <CardTitle className="text-base">{category.name}</CardTitle>
                          <CardDescription className="text-xs">{category.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{catStatus.score}%</span>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600">
                          {catStatus.compliant} C
                        </Badge>
                        <Badge variant="outline" className="bg-red-500/10 text-red-600">
                          {catStatus.nonCompliant} NC
                        </Badge>
                      </div>
                    </div>
                    <Progress value={catStatus.score} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {catStatus.total} itens aplicáveis para {selectedDPClass}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Normas Aplicadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {[
                      { code: "IMCA M220", name: "ASOG/CAMO Guidelines" },
                      { code: "IMCA M117", name: "DP Personnel Training" },
                      { code: "IMCA M166", name: "FMEA Guidance" },
                      { code: "IMCA M190", name: "Annual Trials" },
                      { code: "IMO MSC.1/Circ.1580", name: "DP Systems Guidelines" },
                      { code: "NORMAM-13", name: "Requisitos Nacionais" }
                    ].map(std => (
                      <div key={std.code} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <Badge variant="secondary">{std.code}</Badge>
                        <span className="text-sm text-muted-foreground">{std.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {status.nonCompliant > 0 && (
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-red-500/10">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{status.nonCompliant} não conformidades identificadas</p>
                          <p className="text-xs text-muted-foreground">Ação corretiva necessária</p>
                        </div>
                      </div>
                    )}
                    {status.imperativeNCs > 0 && (
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-destructive/10">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{status.imperativeNCs} NCs impeditivas</p>
                          <p className="text-xs text-muted-foreground">Requer tratamento imediato</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Auditoria em andamento</p>
                        <p className="text-xs text-muted-foreground">Classe {selectedDPClass} selecionada</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <IMCADPChecklist 
            selectedDPClass={selectedDPClass}
            auditData={auditData}
            setAuditData={setAuditData}
          />
        </TabsContent>

        {/* Non-Conformities Tab */}
        <TabsContent value="nc">
          <IMCADPNonConformities 
            auditData={auditData}
            selectedDPClass={selectedDPClass}
          />
        </TabsContent>

        {/* Competency Tab */}
        <TabsContent value="competency">
          <IMCADPCompetencyMatrix selectedDPClass={selectedDPClass} />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai">
          <IMCADPAIAssistant selectedDPClass={selectedDPClass} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Auditoria</CardTitle>
              <CardDescription>Personalize as configurações do módulo de auditoria DP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Informações da Embarcação</h4>
                  <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
                    <p className="text-sm"><strong>Classe DP:</strong> {selectedDPClass}</p>
                    <p className="text-sm"><strong>Itens Aplicáveis:</strong> {status.totalItems}</p>
                    <p className="text-sm"><strong>Itens Impeditivos:</strong> {DP_CHECKLIST_ITEMS.filter(i => i.isImperative && i.applicableDPClass.includes(selectedDPClass)).length}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Exportação</h4>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={handleExportAudit}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button variant="outline" onClick={() => toast({ title: "Excel", description: "Exportando para Excel..." })}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Excel
                    </Button>
                    <Button variant="outline" onClick={() => toast({ title: "JSON", description: "Exportando dados..." })}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar JSON
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
