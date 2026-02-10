/**
 * Smart Document Hub - Central de Documentos Inteligente
 * OCR, classificação automática e workflow de aprovação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Upload, Search, Filter, FolderOpen,
  Clock, CheckCircle2, AlertTriangle, Eye, Download,
  Sparkles, FileCheck, FileWarning, Trash2, Share2,
  Brain, Tag, Calendar, User, MoreVertical
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  status: "approved" | "pending" | "rejected" | "processing";
  uploadedBy: string;
  uploadedAt: string;
  expiresAt?: string;
  size: string;
  aiClassification?: string;
  aiConfidence?: number;
  tags: string[];
}

const fallbackDocuments: Document[] = [
  { id: "1", name: "Certificado SMC.pdf", type: "PDF", category: "Certificados", status: "approved", uploadedBy: "João Silva", uploadedAt: "2024-01-15", expiresAt: "2025-01-15", size: "2.4 MB", aiClassification: "Certificado de Segurança", aiConfidence: 98, tags: ["ISM", "Segurança"] },
  { id: "2", name: "Contrato_Afretamento_2024.docx", type: "DOCX", category: "Contratos", status: "pending", uploadedBy: "Maria Santos", uploadedAt: "2024-01-14", size: "1.8 MB", aiClassification: "Contrato Comercial", aiConfidence: 95, tags: ["Comercial", "Afretamento"] },
  { id: "3", name: "Relatório_Inspeção_PSC.pdf", type: "PDF", category: "Inspeções", status: "approved", uploadedBy: "Carlos Lima", uploadedAt: "2024-01-13", size: "5.2 MB", aiClassification: "Relatório de Inspeção", aiConfidence: 99, tags: ["PSC", "Compliance"] },
  { id: "4", name: "Plano_Manutenção_2024.xlsx", type: "XLSX", category: "Manutenção", status: "processing", uploadedBy: "Ana Costa", uploadedAt: "2024-01-12", size: "890 KB", aiClassification: "Plano Operacional", aiConfidence: 87, tags: ["PMS", "Manutenção"] },
  { id: "5", name: "STCW_Tripulação_Completo.pdf", type: "PDF", category: "Certificados", status: "rejected", uploadedBy: "Pedro Rocha", uploadedAt: "2024-01-11", expiresAt: "2023-12-31", size: "3.1 MB", aiClassification: "Certificado de Competência", aiConfidence: 92, tags: ["STCW", "Tripulação"] },
  { id: "6", name: "Manual_SOPEP.pdf", type: "PDF", category: "Manuais", status: "approved", uploadedBy: "Lucia Mendes", uploadedAt: "2024-01-10", size: "8.7 MB", aiClassification: "Manual Operacional", aiConfidence: 96, tags: ["MARPOL", "Emergência"] },
];

const categories = [
  { name: "Certificados", count: 45, icon: FileCheck },
  { name: "Contratos", count: 23, icon: FileText },
  { name: "Inspeções", count: 18, icon: Eye },
  { name: "Manutenção", count: 31, icon: FileWarning },
  { name: "Manuais", count: 12, icon: FolderOpen },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
    approved: { variant: "default", label: "Aprovado" },
    pending: { variant: "secondary", label: "Pendente" },
    rejected: { variant: "destructive", label: "Rejeitado" },
    processing: { variant: "outline", label: "Processando" },
  };
  const { variant, label } = config[status] || { variant: "outline", label: status };
  return <Badge variant={variant}>{label}</Badge>;
};

export default function SmartDocumentHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const filteredDocs = fallbackDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pendingDocs = fallbackDocuments.filter(d => d.status === "pending").length;
  const expiringDocs = fallbackDocuments.filter(d => d.expiresAt && new Date(d.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            Central de Documentos
          </h2>
          <p className="text-muted-foreground">
            Gestão inteligente com OCR e classificação automática
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-warning/10 text-warning">
            <Clock className="h-3 w-3 mr-1" />
            {pendingDocs} Pendentes
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {expiringDocs} Expirando
          </Badge>
          <Button onClick={simulateUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Processando documento...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm">OCR + IA</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card
              key={cat.name}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === cat.name ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? "all" : cat.name)}
            >
              <CardContent className="p-4 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-semibold">{cat.count}</p>
                <p className="text-xs text-muted-foreground">{cat.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos, tags, categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros Avançados
        </Button>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Documentos Recentes</CardTitle>
          <CardDescription>
            {filteredDocs.length} documentos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      doc.type === "PDF" ? "bg-red-100 dark:bg-red-900" :
                      doc.type === "DOCX" ? "bg-blue-100 dark:bg-blue-900" :
                      "bg-green-100 dark:bg-green-900"
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        doc.type === "PDF" ? "text-red-500" :
                        doc.type === "DOCX" ? "text-blue-500" :
                        "text-green-500"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <FolderOpen className="h-3 w-3 mr-1" />
                          {doc.category}
                        </Badge>
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* AI Classification */}
                    {doc.aiClassification && (
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">{doc.aiClassification}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Confiança: {doc.aiConfidence}%
                        </span>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 justify-end">
                        <User className="h-3 w-3" />
                        {doc.uploadedBy}
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    {/* Status */}
                    <StatusBadge status={doc.status} />

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
