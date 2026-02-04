/**
 * Document Center Hub Enhanced
 * Central de documentos com UX premium
 * 
 * Features:
 * - Dashboard de documentos
 * - Gestão de templates
 * - OCR e classificação IA
 * - Workflows de aprovação
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  FileText, LayoutTemplate, CheckSquare, BarChart3, GitBranch, Download,
  Search, Loader2, Upload, FolderOpen, Clock, Eye, FileCheck, AlertTriangle,
  Plus, Filter, ArrowRight, Brain, Sparkles, FileType, Archive
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ModuleOnboarding, 
  QuickActionsBar, 
  InteractiveKPICard,
  ActionableAlertList 
} from "@/components/ui/module-enhancements";

// Lazy loads
const ReportsCommand = lazy(() => import("@/pages/ReportsCommandPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const TemplatesPage = lazy(() => import("@/pages/Templates"));
const ChecklistsPage = lazy(() => import("@/pages/admin/checklists"));
const ExportCenter = lazy(() => import("@/pages/ExportCenter"));
const AdvancedSearch = lazy(() => import("@/pages/AdvancedSearch"));

function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando documentos...</span>
    </div>
  );
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "checklists", label: "Checklists", icon: CheckSquare },
  { id: "reports", label: "Relatórios", icon: FileCheck },
  { id: "export", label: "Exportar", icon: Download },
  { id: "search", label: "Busca IA", icon: Search, badge: "AI" },
];

// Onboarding
const onboardingSteps = [
  {
    title: "Bem-vindo ao Document Center",
    description: "Central integrada para gestão de todos os documentos marítimos da sua frota.",
    icon: <FileText className="h-8 w-8 text-primary" />
  },
  {
    title: "Upload Inteligente",
    description: "Faça upload de documentos e a IA classifica, extrai dados e organiza automaticamente.",
    icon: <Brain className="h-8 w-8 text-primary" />
  },
  {
    title: "Templates Prontos",
    description: "Use templates pré-configurados para ISM, ISPS, MLC e outros padrões marítimos.",
    icon: <LayoutTemplate className="h-8 w-8 text-primary" />
  },
  {
    title: "Busca Avançada com IA",
    description: "Encontre qualquer documento usando linguagem natural ou filtros avançados.",
    icon: <Search className="h-8 w-8 text-primary" />
  }
];

// Quick actions
const quickActions = [
  { id: "upload", label: "Fazer Upload", icon: <Upload className="h-4 w-4" />, badge: 0 },
  { id: "new-template", label: "Novo Template", icon: <Plus className="h-4 w-4" />, badge: 0 },
  { id: "pending", label: "Pendentes", icon: <Clock className="h-4 w-4" />, badge: 8 },
  { id: "expiring", label: "Expirando", icon: <AlertTriangle className="h-4 w-4" />, badge: 5 },
  { id: "generate-report", label: "Gerar Relatório", icon: <FileCheck className="h-4 w-4" />, badge: 0 },
];

// Document KPIs
const docKPIs = [
  {
    title: "Total de Documentos",
    value: "2,847",
    subtitle: "+45 esta semana",
    change: 45,
    trend: "up" as const,
    icon: <FileText className="h-5 w-5" />,
    details: [
      { label: "Tripulação", value: "1,245" },
      { label: "Embarcações", value: "856" },
      { label: "Operacionais", value: "746" }
    ]
  },
  {
    title: "Documentos Válidos",
    value: "96.2%",
    subtitle: "109 expiram em 30 dias",
    change: -0.5,
    trend: "down" as const,
    icon: <FileCheck className="h-5 w-5" />,
    details: [
      { label: "Válidos", value: "2,739" },
      { label: "Expirando", value: "109" },
      { label: "Expirados", value: "12" }
    ]
  },
  {
    title: "OCR Processados",
    value: "342",
    subtitle: "este mês",
    change: 28,
    trend: "up" as const,
    icon: <Brain className="h-5 w-5" />,
    details: [
      { label: "Certificados", value: "189" },
      { label: "Contratos", value: "98" },
      { label: "Outros", value: "55" }
    ]
  },
  {
    title: "Templates Ativos",
    value: "48",
    subtitle: "12 categorias",
    change: 3,
    trend: "up" as const,
    icon: <LayoutTemplate className="h-5 w-5" />,
    details: [
      { label: "ISM/ISPS", value: "18" },
      { label: "MLC/STCW", value: "15" },
      { label: "Operacionais", value: "15" }
    ]
  }
];

// Document alerts
const docAlerts = [
  {
    id: "1",
    title: "12 certificados expirando",
    description: "Certificados de tripulantes vencem nos próximos 15 dias",
    severity: "high" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    module: "Certificados",
    actions: [
      { label: "Ver Lista", onClick: () => toast.info("Abrindo lista...") },
      { label: "Notificar", onClick: () => toast.success("Notificações enviadas") }
    ]
  },
  {
    id: "2",
    title: "8 documentos aguardando aprovação",
    description: "Contratos e certificados pendentes de revisão",
    severity: "medium" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    module: "Workflow",
    actions: [
      { label: "Revisar", onClick: () => toast.info("Abrindo revisão...") }
    ]
  },
  {
    id: "3",
    title: "Backup semanal concluído",
    description: "2,847 documentos arquivados com sucesso",
    severity: "info" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    module: "Sistema",
    actions: []
  }
];

// Recent documents
const recentDocs = [
  { name: "Certificado STCW - João Silva", type: "PDF", size: "2.4 MB", date: "Hoje", status: "válido" },
  { name: "Contrato SEA - Maria Santos", type: "PDF", size: "1.8 MB", date: "Hoje", status: "pendente" },
  { name: "Relatório ISM Q1 2026", type: "DOCX", size: "3.2 MB", date: "Ontem", status: "aprovado" },
  { name: "Checklist ISPS - Nautilus Star", type: "PDF", size: "0.8 MB", date: "Ontem", status: "válido" },
];

// Document categories
const categories = [
  { name: "Certificados STCW", count: 456, color: "bg-blue-500" },
  { name: "Contratos SEA", count: 234, color: "bg-green-500" },
  { name: "Relatórios ISM", count: 189, color: "bg-purple-500" },
  { name: "Checklists ISPS", count: 312, color: "bg-orange-500" },
  { name: "Documentos MLC", count: 156, color: "bg-pink-500" },
];

export default function DocumentCenterHubEnhanced() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("document-center-onboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab && TABS.some(t => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("document-center-onboarding", "true");
    setShowOnboarding(false);
    toast.success("Bem-vindo ao Document Center! 📄");
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    toast.info(`Executando: ${action?.label}`);
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    toast.success("Alerta arquivado");
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveTab("search");
      toast.info(`Buscando: ${searchQuery}`);
    }
  };

  const activeAlerts = docAlerts.filter(a => !dismissedAlerts.includes(a.id));

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showOnboarding && (
          <ModuleOnboarding
            moduleName="Document Center"
            steps={onboardingSteps}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5">
              <FileText className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Document Center
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  OCR + IA
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Central de documentos, relatórios e templates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar documentos..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Tour
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <QuickActionsBar
          actions={quickActions}
          onActionClick={handleQuickAction}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto p-1">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 py-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{tab.label}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="text-[10px] px-1">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab - NEW */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {docKPIs.map((kpi, index) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <InteractiveKPICard {...kpi} />
                </motion.div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alerts + Recent */}
              <div className="lg:col-span-2 space-y-6">
                {/* Alerts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Alertas de Documentos
                    </h3>
                    <Badge variant="outline">{activeAlerts.length} pendentes</Badge>
                  </div>
                  <ActionableAlertList
                    alerts={activeAlerts}
                    onDismiss={handleDismissAlert}
                    emptyMessage="Nenhum alerta pendente."
                  />
                </div>

                {/* Recent Documents */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Documentos Recentes
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("documents")}>
                        Ver Todos
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentDocs.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="p-2 rounded bg-primary/10">
                            <FileType className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.type} • {doc.size} • {doc.date}</p>
                          </div>
                          <Badge 
                            variant={doc.status === "válido" ? "default" : doc.status === "pendente" ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Categories */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-primary" />
                      Categorias
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{cat.name}</span>
                          <span className="font-medium">{cat.count}</span>
                        </div>
                        <Progress 
                          value={(cat.count / 500) * 100} 
                          className={`h-1.5 [&>div]:${cat.color}`} 
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Storage Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Archive className="h-4 w-4 text-primary" />
                      Armazenamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Usado</span>
                        <span className="font-medium">12.4 GB / 50 GB</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 rounded bg-muted">
                        <p className="font-medium">2,847</p>
                        <p className="text-muted-foreground">Arquivos</p>
                      </div>
                      <div className="text-center p-2 rounded bg-muted">
                        <p className="font-medium">48</p>
                        <p className="text-muted-foreground">Templates</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Upload */}
                <Card className="border-dashed border-2">
                  <CardContent className="p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Arraste documentos aqui</p>
                    <p className="text-xs text-muted-foreground mb-3">ou clique para selecionar</p>
                    <Button size="sm" variant="secondary" onClick={() => handleQuickAction("upload")}>
                      <Upload className="h-4 w-4 mr-2" />
                      Fazer Upload
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <DocumentsPage />
            </Suspense>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <TemplatesPage />
            </Suspense>
          </TabsContent>

          <TabsContent value="checklists" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <ChecklistsPage />
            </Suspense>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <ReportsCommand />
            </Suspense>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <ExportCenter />
            </Suspense>
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <Suspense fallback={<TabLoadingSkeleton />}>
              <AdvancedSearch />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
