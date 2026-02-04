/**
 * Nauti Documents Premium - v2.0
 * Centro de Documentos com OCR e IA
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, LayoutDashboard, Upload, Search, FolderOpen,
  FileCheck, Bot, Scan, Plus, Clock, Tag, Filter,
  Download, Trash2, Eye, CheckCircle
} from "lucide-react";
import { PremiumModuleShell } from "@/components/ui/premium-module-kit";
import type { ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Documents Dashboard
function DocumentsDashboard() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadDocuments() {
      const { data } = await supabase
        .from("ai_documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (data) setDocuments(data);
      setLoading(false);
    }
    loadDocuments();
  }, []);

  const pendingOCR = documents.filter(d => d.ocr_status === "pending").length;
  const completedOCR = documents.filter(d => d.ocr_status === "completed").length;

  const filteredDocs = documents.filter(d => 
    d.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Docs</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">OCR Completo</p>
                <p className="text-2xl font-bold text-success">{completedOCR}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pendente OCR</p>
                <p className="text-2xl font-bold text-warning">{pendingOCR}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Armazenamento</p>
                <p className="text-2xl font-bold">2.4 GB</p>
              </div>
              <FolderOpen className="h-8 w-8 text-info opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">IA Insights</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Bot className="h-8 w-8 text-violet-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar documentos..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" className="gap-2">
            <Scan className="h-4 w-4" />
            OCR em Lote
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Upload iniciado")}>
              <Upload className="h-4 w-4" />
              Fazer Upload de Documento
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Iniciando OCR")}>
              <Scan className="h-4 w-4" />
              Processar com OCR
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Análise IA")}>
              <Bot className="h-4 w-4" />
              Análise com IA
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => toast.success("Template gerado")}>
              <FileCheck className="h-4 w-4" />
              Gerar Documento
            </Button>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Certificados", count: 45, color: "bg-blue-500" },
                { name: "Contratos", count: 23, color: "bg-green-500" },
                { name: "Manuais", count: 18, color: "bg-amber-500" },
                { name: "Relatórios", count: 67, color: "bg-violet-500" },
                { name: "Inspeções", count: 34, color: "bg-rose-500" },
                { name: "Treinamentos", count: 29, color: "bg-cyan-500" },
                { name: "Regulatórios", count: 41, color: "bg-orange-500" },
                { name: "Outros", count: 12, color: "bg-gray-500" },
              ].map((cat) => (
                <div key={cat.name} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="font-medium text-sm">{cat.name}</span>
                  </div>
                  <p className="text-2xl font-bold">{cat.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Recentes
          </CardTitle>
          <CardDescription>Últimos documentos enviados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum documento encontrado</p>
              <Button className="mt-4" onClick={() => toast.success("Upload")}>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.slice(0, 8).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{doc.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.category || "Sem categoria"} • {doc.file_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">{new Date(doc.created_at).toLocaleDateString("pt-BR")}</p>
                      <Badge variant={
                        doc.ocr_status === "completed" ? "default" :
                        doc.ocr_status === "processing" ? "secondary" : "outline"
                      }>
                        {doc.ocr_status === "completed" ? "OCR ✓" :
                         doc.ocr_status === "processing" ? "Processando" : "Pendente"}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NautiDocumentsPremium() {
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleExport = () => {
    toast.success("Documentos exportados");
  };

  const tabs: ModuleTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      content: <DocumentsDashboard />
    },
    {
      id: "all",
      label: "Todos",
      icon: FolderOpen,
      content: <div className="text-center py-12 text-muted-foreground">Todos os Documentos</div>
    },
    {
      id: "ocr",
      label: "OCR",
      icon: Scan,
      badge: 5,
      content: <div className="text-center py-12 text-muted-foreground">Processamento OCR</div>
    },
    {
      id: "templates",
      label: "Templates",
      icon: FileCheck,
      content: <div className="text-center py-12 text-muted-foreground">Templates de Documentos</div>
    }
  ];

  const actions = (
    <>
      <Button variant="outline" size="sm" className="gap-2">
        <Scan className="h-4 w-4" />
        OCR
      </Button>
      <Button size="sm" className="gap-2">
        <Upload className="h-4 w-4" />
        Upload
      </Button>
    </>
  );

  return (
    <PremiumModuleShell
      title="Document Center"
      subtitle="Gestão de documentos com OCR e IA"
      icon={FileText}
      iconGradient="from-amber-500 to-orange-600"
      tabs={tabs}
      defaultTab="dashboard"
      actions={actions}
      onRefresh={handleRefresh}
      onExport={handleExport}
      showAIBadge={true}
      aiStatus="active"
      alerts={5}
    />
  );
}
