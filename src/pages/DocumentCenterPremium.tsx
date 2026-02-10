/**
 * Document Center Premium - Centro de Documentos Completo
 * Tier-1 UX: Functional empty states, real data, export capabilities
 * ENTERPRISE UPGRADE - Phase 6
 */

import React, { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, FileText, FolderOpen, Upload, 
  Search, History, Brain, ClipboardList, BookOpen,
  RefreshCw, Download, Plus, Activity, File, Clock
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";

// Lazy load components
const DocumentCommandCenter = lazy(() => import("@/modules/document-center/components/DocumentCommandCenter"));
const DocumentWorkflowManager = lazy(() => import("@/modules/document-center/components/DocumentWorkflowManager"));
const DocumentIntelligenceHub = lazy(() => import("@/components/premium/DocumentIntelligenceHub"));

// Enterprise Components - Phase 6
import { 
  DocumentViewer,
  TemplateManager,
  ChecklistBuilder,
  KnowledgeHub
} from "@/components/enterprise";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

// Reports Tab with real document metrics
function DocumentReportsTab() {
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["doc-reports-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title, document_type, status, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (docs.length === 0) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="Sem dados para relatórios"
        message="Faça upload de documentos primeiro para gerar métricas e analytics documentais."
        actionLabel="Ir para Biblioteca"
        onAction={() => toast.success("Use a aba Biblioteca acima para fazer upload de documentos")}
      />
    );
  }

  const categories = [...new Set(docs.map((d: any) => d.category || 'Sem categoria'))];
  const statuses = docs.reduce((acc: Record<string, number>, d: any) => {
    const s = d.status || 'draft';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5" />
          Relatórios Documentais
        </h3>
        <Button variant="outline" size="sm" onClick={() => {
          const csv = ["Título,Categoria,Status,Criado", ...docs.map((d: any) => 
            `"${d.title}",${d.category || 'N/A'},${d.status || 'draft'},${new Date(d.created_at).toLocaleDateString('pt-BR')}`
          )].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'document-report.csv'; a.click();
          URL.revokeObjectURL(url);
          toast.success("Relatório exportado");
        }}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Documentos</p>
            <p className="text-2xl font-bold">{docs.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Categorias</p>
            <p className="text-2xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
        {Object.entries(statuses).slice(0, 2).map(([status, count]) => (
          <Card key={status} className="border-l-4 border-l-accent">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground capitalize">{status}</p>
              <p className="text-2xl font-bold">{count as number}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {docs.slice(0, 10).map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.category || 'Sem categoria'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{d.status || 'draft'}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export Center Tab
function ExportCenterTab() {
  const queryClient = useQueryClient();

  const exportFormats = [
    { 
      format: "CSV", 
      icon: FileText, 
      description: "Planilha de documentos",
      action: async () => {
        const { data } = await supabase.from("documents").select("title, document_type, status, created_at");
        if (data && data.length > 0) {
          const csv = ["Título,Tipo,Status,Data", ...data.map(d => 
            `"${d.title}",${d.document_type || 'N/A'},${d.status || 'draft'},${new Date(d.created_at || Date.now()).toLocaleDateString('pt-BR')}`
          )].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'documents-export.csv'; a.click();
          URL.revokeObjectURL(url);
          toast.success("CSV exportado com sucesso");
        } else {
          toast.info("Sem documentos para exportar");
        }
      }
    },
    { 
      format: "JSON", 
      icon: FileText, 
      description: "Dados estruturados",
      action: async () => {
        const { data } = await supabase.from("documents").select("*");
        if (data && data.length > 0) {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'documents-export.json'; a.click();
          URL.revokeObjectURL(url);
          toast.success("JSON exportado com sucesso");
        } else {
          toast.info("Sem documentos para exportar");
        }
      }
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Upload className="h-5 w-5" />
        Centro de Exportação
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {exportFormats.map((exp) => (
          <Card 
            key={exp.format} 
            className="hover:border-primary hover:shadow-md transition-all cursor-pointer group"
            onClick={exp.action}
          >
            <CardContent className="p-6 text-center">
              <exp.icon className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <p className="font-medium">Exportar {exp.format}</p>
              <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Version History Tab
function VersionHistoryTab() {
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["doc-version-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title, version, status, updated_at, created_at")
        .order("updated_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (docs.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Sem histórico de versões"
        message="O controle de versões e audit trail será exibido aqui quando documentos forem criados e editados."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <History className="h-5 w-5" />
        Histórico de Versões
      </h3>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {docs.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">v{d.version || '1.0'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{d.status || 'draft'}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.updated_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DocumentCenterPremium() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "intelligence";
  const queryClient = useQueryClient();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Real doc count for badge
  const { data: docCount = 0 } = useQuery({
    queryKey: ["doc-center-count"],
    queryFn: async () => {
      const { count } = await supabase.from("documents").select("*", { count: "exact", head: true });
      return count || 0;
    },
    staleTime: 60000,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            Document Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de gestão documental com workflows de aprovação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary">
            <FileText className="h-3 w-3 mr-1" />
            {docCount} documentos
          </Badge>
          <Badge variant="outline" className="text-primary">
            <Brain className="h-3 w-3 mr-1" />
            OCR + IA
          </Badge>
          <Button variant="outline" size="sm" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["doc"] });
            toast.success("Documentos atualizados");
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1">
          <TabsTrigger value="intelligence" className="flex flex-col items-center gap-1 py-2">
            <Brain className="h-4 w-4" />
            <span className="text-xs">Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="viewer" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Visualizador</span>
          </TabsTrigger>
          <TabsTrigger value="template-mgr" className="flex flex-col items-center gap-1 py-2">
            <ClipboardList className="h-4 w-4" />
            <span className="text-xs">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="checklist-builder" className="flex flex-col items-center gap-1 py-2">
            <ClipboardList className="h-4 w-4" />
            <span className="text-xs">Checklists</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex flex-col items-center gap-1 py-2">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs">Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex flex-col items-center gap-1 py-2">
            <FolderOpen className="h-4 w-4" />
            <span className="text-xs">Biblioteca</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex flex-col items-center gap-1 py-2">
            <Upload className="h-4 w-4" />
            <span className="text-xs">Exportar</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2">
            <History className="h-4 w-4" />
            <span className="text-xs">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence">
          <Suspense fallback={<LoadingSkeleton />}>
            <DocumentIntelligenceHub />
          </Suspense>
        </TabsContent>

        <TabsContent value="viewer">
          <DocumentViewer />
        </TabsContent>

        <TabsContent value="template-mgr">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="checklist-builder">
          <ChecklistBuilder />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeHub />
        </TabsContent>

        <TabsContent value="workflow">
          <Suspense fallback={<LoadingSkeleton />}>
            <DocumentWorkflowManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="documents">
          <Suspense fallback={<LoadingSkeleton />}>
            <DocumentCommandCenter />
          </Suspense>
        </TabsContent>

        <TabsContent value="reports">
          <DocumentReportsTab />
        </TabsContent>

        <TabsContent value="export">
          <ExportCenterTab />
        </TabsContent>

        <TabsContent value="history">
          <VersionHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
