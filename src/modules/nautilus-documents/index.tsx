/**
import { useState, useCallback } from "react";;
 * Nautilus Documents - Módulo Unificado de Documentos
 * PATCH UNIFY-3.0 - Fusão dos módulos de Documentos
 * 
 * Módulos fundidos:
 * - document-hub → Nautilus Documents
 * - incident-reports → Nautilus Documents
 */

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, FolderOpen, Brain } from "lucide-react";

// Import dos módulos originais
import DocumentHub from "@/modules/document-hub";
import IncidentReports from "@/modules/incident-reports";

const NautilusDocuments: React.FC = () => {
  const [activeTab, setActiveTab] = useState("documents");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
            <FolderOpen className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nautilus Documents</h1>
            <p className="text-muted-foreground">Centro Unificado de Documentos e Relatórios</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-400 border-green-500/30">
          <Brain className="h-3 w-3" />
          IA Integrada
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Incidentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-6">
          <DocumentHub />
        </TabsContent>

        <TabsContent value="incidents" className="mt-6">
          <IncidentReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NautilusDocuments;
