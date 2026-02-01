/**
 * Document Center Hub
 * Unified hub for documents and reports
 * 
 * FUSION GROUP H - PROMPT MASTER V4.1
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  LayoutTemplate,
  CheckSquare,
  BarChart3,
  GitBranch,
  Download,
  Search,
  Loader2
} from "lucide-react";

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
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "checklists", label: "Checklists", icon: CheckSquare },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "workflow", label: "Workflow", icon: GitBranch },
  { id: "export", label: "Exportar", icon: Download },
  { id: "search", label: "Busca", icon: Search },
];

export default function DocumentCenterHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "documents";
  const [activeTab, setActiveTab] = useState(initialTab);

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Document Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Central de documentos, relatórios e templates
          </p>
        </div>
        <Badge variant="outline">7 módulos</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto p-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 py-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

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

        <TabsContent value="workflow" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <DocumentsPage />
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
  );
}
