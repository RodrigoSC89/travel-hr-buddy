/**
 * Document Center Premium - Centro de Documentos Completo
 * Integra todos os componentes de gestão documental
 */

import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, FileText, FolderOpen, Upload, 
  Search, History, Brain
} from "lucide-react";

// Lazy load components
const DocumentCommandCenter = lazy(() => import("@/modules/document-center/components/DocumentCommandCenter"));
const DocumentWorkflowManager = lazy(() => import("@/modules/document-center/components/DocumentWorkflowManager"));

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
        <Badge variant="outline">
          <Brain className="h-3 w-3 mr-1" />
          OCR + IA
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="command" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger value="command" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Comando</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex flex-col items-center gap-1 py-2">
            <FolderOpen className="h-4 w-4" />
            <span className="text-xs">Biblioteca</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex flex-col items-center gap-1 py-2">
            <Upload className="h-4 w-4" />
            <span className="text-xs">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2">
            <History className="h-4 w-4" />
            <span className="text-xs">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="command">
          <Suspense fallback={<LoadingSkeleton />}>
            <DocumentCommandCenter />
          </Suspense>
        </TabsContent>

        <TabsContent value="workflow">
          <Suspense fallback={<LoadingSkeleton />}>
            <DocumentWorkflowManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="library">
          <div className="text-center py-12 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Biblioteca de Documentos</p>
            <p className="text-sm">Navegação hierárquica por categorias</p>
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Upload de Documentos</p>
            <p className="text-sm">Upload com classificação automática via IA</p>
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
