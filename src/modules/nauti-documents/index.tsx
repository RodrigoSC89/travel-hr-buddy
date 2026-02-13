/**
 * Nautilus Documents - Módulo Unificado de Documentos
 * PATCH UNIFY-3.0 - Fusão dos módulos de Documentos
 */

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderOpen } from "lucide-react";

// Import dos módulos originais
const DocumentHub = () => <div className="text-center py-8 text-muted-foreground">Hub de documentos em manutenção.</div>;

const NautilusDocuments: React.FC = () => {
  const [activeTab, setActiveTab] = useState("documents");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Nautilus Documents</h1>
            <p className="text-sm text-muted-foreground">
              Document management hub
            </p>
          </div>
          <Badge variant="outline" className="ml-2">Unified</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">
            <FolderOpen className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <DocumentHub />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NautilusDocuments;
