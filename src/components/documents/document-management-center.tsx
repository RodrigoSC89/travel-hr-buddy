import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Upload,
  Download,
  Search,
  Plus,
  Eye,
  Trash2,
  FolderOpen,
  Calendar,
  User,
  Building,
  AlertTriangle,
  Award,
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  type: "contract" | "certificate" | "manual" | "procedure" | "report" | "legal" | "safety";
  category: string;
  owner: string;
  department: string;
  upload_date: string;
  last_modified: string;
  file_size: string;
  file_format: string;
  status: "active" | "archived" | "under_review" | "expired";
  confidential: boolean;
  version: string;
  description?: string;
  tags: string[];
}

interface DocumentStats {
  total: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  recent_uploads: number;
  expiring_soon: number;
}

export const DocumentManagementCenter = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
    calculateStats();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      // Mock documents data
      const mockDocuments: Document[] = [
        {
          id: "1",
          title: "Manual de Segurança Marítima 2024",
          type: "manual",
          category: "Segurança",
          owner: "João Silva",
          department: "Operações",
          upload_date: "2024-01-15",
          last_modified: "2024-01-20",
          file_size: "2.5 MB",
          file_format: "PDF",
          status: "active",
          confidential: false,
          version: "2.1",
          description: "Manual completo de procedimentos de segurança para operações marítimas",
          tags: ["segurança", "procedimentos", "treinamento"],
        },
        {
          id: "2",
          title: "Contrato de Afretamento - MV Atlantic",
          type: "contract",
          category: "Legal",
          owner: "Maria Santos",
          department: "Jurídico",
          upload_date: "2024-02-01",
          last_modified: "2024-02-05",
          file_size: "1.2 MB",
          file_format: "PDF",
          status: "active",
          confidential: true,
          version: "1.0",
          description: "Contrato de afretamento para embarcação MV Atlantic",
          tags: ["contrato", "afretamento", "legal"],
        },
        {
          id: "3",
          title: "Certificado ISPS - Porto Santos",
          type: "certificate",
          category: "Certificações",
          owner: "Carlos Oliveira",
          department: "Compliance",
          upload_date: "2023-12-01",
          last_modified: "2023-12-01",
          file_size: "850 KB",
          file_format: "PDF",
          status: "expired",
          confidential: false,
          version: "1.0",
          description: "Certificado ISPS para operações no Porto de Santos",
          tags: ["certificado", "ISPS", "porto"],
        },
        {
          id: "4",
          title: "Relatório de Inspeção Q1 2024",
          type: "report",
          category: "Inspeções",
          owner: "Ana Costa",
          department: "Qualidade",
          upload_date: "2024-03-30",
          last_modified: "2024-03-30",
          file_size: "3.1 MB",
          file_format: "PDF",
          status: "under_review",
          confidential: false,
          version: "1.0",
          description: "Relatório trimestral de inspeções de segurança",
          tags: ["relatório", "inspeção", "trimestral"],
        },
        {
          id: "5",
          title: "Procedimento de Emergência - Derramamento",
          type: "procedure",
          category: "Emergência",
          owner: "Pedro Lima",
          department: "Segurança",
          upload_date: "2024-01-10",
          last_modified: "2024-01-15",
          file_size: "1.8 MB",
          file_format: "PDF",
          status: "active",
          confidential: false,
          version: "3.2",
          description: "Procedimentos para resposta a emergências de derramamento",
          tags: ["emergência", "derramamento", "procedimento"],
        },
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (documents.length === 0) return;

    const typeCount = documents.reduce(
      (acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const statusCount = documents.reduce(
      (acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const recentUploads = documents.filter(doc => {
      const uploadDate = new Date(doc.upload_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate > weekAgo;
    }).length;

    const expiringSoon = documents.filter(doc => doc.status === "expired").length;

    setStats({
      total: documents.length,
      by_type: typeCount,
      by_status: statusCount,
      recent_uploads: recentUploads,
      expiring_soon: expiringSoon,
    });
  };

  useEffect(() => {
    calculateStats();
  }, [documents]);

  const getTypeIcon = (type: Document["type"]) => {
    switch (type) {
    case "contract":
      return Building;
    case "certificate":
      return Award;
    case "manual":
      return FileText;
    case "procedure":
      return AlertTriangle;
    case "report":
      return Calendar;
    case "legal":
      return Building;
    case "safety":
      return AlertTriangle;
    default:
      return FileText;
    }
  };

  const getTypeText = (type: Document["type"]) => {
    switch (type) {
    case "contract":
      return "Contrato";
    case "certificate":
      return "Certificado";
    case "manual":
      return "Manual";
    case "procedure":
      return "Procedimento";
    case "report":
      return "Relatório";
    case "legal":
      return "Legal";
    case "safety":
      return "Segurança";
    default:
      return "Documento";
    }
  };

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
    case "active":
      return "bg-green-500";
    case "archived":
      return "bg-gray-500";
    case "under_review":
      return "bg-yellow-500";
    case "expired":
      return "bg-red-500";
    default:
      return "bg-gray-500";
    }
  };

  const getStatusText = (status: Document["status"]) => {
    switch (status) {
    case "active":
      return "Ativo";
    case "archived":
      return "Arquivado";
    case "under_review":
      return "Em Revisão";
    case "expired":
      return "Expirado";
    default:
      return "Desconhecido";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Centro de Documentos</h2>
          <p className="text-muted-foreground">
            Gerencie documentos, contratos e certificações da organização
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Lista
          </Button>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload de Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Título do Documento</Label>
                  <Input placeholder="Ex: Manual de Procedimentos..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contrato</SelectItem>
                        <SelectItem value="certificate">Certificado</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="procedure">Procedimento</SelectItem>
                        <SelectItem value="report">Relatório</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="safety">Segurança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Categoria</Label>
                    <Input placeholder="Ex: Operações" />
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descrição do documento..." />
                </div>

                <div>
                  <Label>Tags (separadas por vírgula)</Label>
                  <Input placeholder="Ex: segurança, procedimento, treinamento" />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground">Arraste arquivos aqui ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground">PDF, DOC, DOCX até 10MB</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(false)}>Fazer Upload</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total de Documentos</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{stats.recent_uploads}</div>
              <div className="text-sm text-muted-foreground">Uploads Recentes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats.by_status.under_review || 0}</div>
              <div className="text-sm text-muted-foreground">Em Revisão</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{stats.expiring_soon}</div>
              <div className="text-sm text-muted-foreground">Expirados</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Todos os Documentos</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
          <TabsTrigger value="review">Em Revisão</TabsTrigger>
          <TabsTrigger value="expired">Expirados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros e Busca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Buscar documentos, tags ou descrições..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="contract">Contratos</SelectItem>
                    <SelectItem value="certificate">Certificados</SelectItem>
                    <SelectItem value="manual">Manuais</SelectItem>
                    <SelectItem value="procedure">Procedimentos</SelectItem>
                    <SelectItem value="report">Relatórios</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="safety">Segurança</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                    <SelectItem value="under_review">Em Revisão</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos ({filteredDocuments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments.map(doc => {
                  const TypeIcon = getTypeIcon(doc.type);
                  return (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <TypeIcon className="h-6 w-6 text-primary" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{doc.title}</h3>
                              {doc.confidential && (
                                <Badge variant="destructive" className="text-xs">
                                  Confidencial
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getTypeText(doc.type)} • {doc.category} • v{doc.version}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doc.owner} • {doc.file_size} •{" "}
                              {new Date(doc.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge className={`${getStatusColor(doc.status)} text-azure-50 mb-1`}>
                              {getStatusText(doc.status)}
                            </Badge>
                            <div className="text-xs text-muted-foreground">{doc.file_format}</div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              Baixar
                            </Button>
                          </div>
                        </div>
                      </div>

                      {doc.description && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                        </div>
                      )}

                      {doc.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {doc.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Documentos adicionados nos últimos 7 dias</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos em Revisão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Documentos aguardando aprovação ou revisão</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Documentos Expirados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents
                  .filter(d => d.status === "expired")
                  .map(doc => (
                    <div key={doc.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{doc.title}</h3>
                          <p className="text-sm text-red-700">
                            {getTypeText(doc.type)} • Requer renovação
                          </p>
                        </div>
                        <Button variant="destructive">Renovar Agora</Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
