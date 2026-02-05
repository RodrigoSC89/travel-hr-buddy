/**
 * Document Center Premium - Centro de Documentos Completo
 * Integra todos os componentes de gestão documental
 * ENTERPRISE UPGRADE - Phase 6
 */

import React, { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, FileText, FolderOpen, Upload, 
  Search, History, Brain, ClipboardList, BookOpen
} from "lucide-react";

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

export default function DocumentCenterPremium() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "intelligence";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-amber-500" />
            Document Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de gestão documental com workflows de aprovação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Brain className="h-3 w-3 mr-1" />
            OCR + IA
          </Badge>
          <Badge variant="outline" className="text-sm">
            Enterprise
          </Badge>
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

        {/* Enterprise Components - Phase 6 */}
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
          <div className="text-center py-12 text-muted-foreground">
            <LayoutDashboard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Relatórios Documentais</p>
            <p className="text-sm">Analytics e métricas de documentação</p>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Centro de Exportação</p>
            <p className="text-sm">Exportar documentos em diversos formatos</p>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Histórico de Versões</p>
            <p className="text-sm">Controle de versões e audit trail</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
