/**
 * Document Workflow Manager - PATCH 900
 * Full CRUD for documents with approval workflow
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, FolderOpen, Upload, Plus, Search, 
  CheckCircle2, Clock, XCircle, Edit, Trash2, Eye, Download,
  Send, FileCheck, AlertTriangle, History, Users
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  category: "policy" | "procedure" | "form" | "certificate" | "report" | "manual";
  version: string;
  status: "draft" | "pending_review" | "approved" | "rejected" | "archived";
  author: string;
  createdDate: string;
  lastModified: string;
  approver?: string;
  approvedDate?: string;
  fileSize: string;
  department: string;
  tags: string[];
}

interface ApprovalRequest {
  id: string;
  documentId: string;
  documentTitle: string;
  requestedBy: string;
  requestedDate: string;
  status: "pending" | "approved" | "rejected";
  approver?: string;
  comments?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export const DocumentWorkflowManager: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("documents");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "DOC-001",
      title: "ISM Code Manual",
      category: "manual",
      version: "3.2",
      status: "approved",
      author: "Capt. James Wilson",
      createdDate: "2023-06-15",
      lastModified: "2024-01-10",
      approver: "Fleet Director",
      approvedDate: "2024-01-12",
      fileSize: "2.4 MB",
      department: "Operations",
      tags: ["ISM", "Safety", "Compliance"]
    },
    {
      id: "DOC-002",
      title: "Emergency Response Procedure",
      category: "procedure",
      version: "2.1",
      status: "pending_review",
      author: "Maria Santos",
      createdDate: "2024-01-20",
      lastModified: "2024-02-01",
      fileSize: "890 KB",
      department: "Safety",
      tags: ["Emergency", "SOLAS", "Drill"]
    },
    {
      id: "DOC-003",
      title: "Crew Onboarding Checklist",
      category: "form",
      version: "1.5",
      status: "draft",
      author: "Carlos Silva",
      createdDate: "2024-02-05",
      lastModified: "2024-02-05",
      fileSize: "156 KB",
      department: "HR",
      tags: ["HR", "Onboarding", "Checklist"]
    },
    {
      id: "DOC-004",
      title: "Environmental Policy",
      category: "policy",
      version: "4.0",
      status: "approved",
      author: "Ana Costa",
      createdDate: "2022-03-01",
      lastModified: "2024-01-15",
      approver: "CEO",
      approvedDate: "2024-01-18",
      fileSize: "1.2 MB",
      department: "ESG",
      tags: ["MARPOL", "Environmental", "Policy"]
    }
  ]);

  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([
    {
      id: "APR-001",
      documentId: "DOC-002",
      documentTitle: "Emergency Response Procedure",
      requestedBy: "Maria Santos",
      requestedDate: "2024-02-01",
      status: "pending",
      priority: "high"
    },
    {
      id: "APR-002",
      documentId: "DOC-005",
      documentTitle: "Bridge Procedures Manual",
      requestedBy: "João Silva",
      requestedDate: "2024-01-28",
      status: "approved",
      approver: "Capt. Wilson",
      comments: "Approved with minor corrections",
      priority: "medium"
    }
  ]);

  const [newDoc, setNewDoc] = useState({
    title: "",
    category: "procedure" as Document["category"],
    department: "",
    tags: ""
  });

  const handleCreateDocument = () => {
    if (!newDoc.title || !newDoc.department) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    const doc: Document = {
      id: `DOC-${String(documents.length + 1).padStart(3, "0")}`,
      title: newDoc.title,
      category: newDoc.category,
      version: "1.0",
      status: "draft",
      author: "Current User",
      createdDate: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      fileSize: "0 KB",
      department: newDoc.department,
      tags: newDoc.tags.split(",").map(t => t.trim()).filter(Boolean)
    };

    setDocuments([doc, ...documents]);
    setShowDocDialog(false);
    setNewDoc({ title: "", category: "procedure", department: "", tags: "" });
    toast({ title: "Documento Criado", description: `${doc.title} criado como rascunho` });
  };

  const handleSubmitForApproval = (doc: Document) => {
    setDocuments(documents.map(d => 
      d.id === doc.id ? { ...d, status: "pending_review" as const } : d
    ));

    const approval: ApprovalRequest = {
      id: `APR-${String(approvalRequests.length + 1).padStart(3, "0")}`,
      documentId: doc.id,
      documentTitle: doc.title,
      requestedBy: doc.author,
      requestedDate: new Date().toISOString().split("T")[0],
      status: "pending",
      priority: "medium"
    };

    setApprovalRequests([approval, ...approvalRequests]);
    toast({ title: "Enviado para Aprovação", description: `${doc.title} aguardando revisão` });
  };

  const handleApproveDocument = (request: ApprovalRequest) => {
    setApprovalRequests(approvalRequests.map(r => 
      r.id === request.id ? { 
        ...r, 
        status: "approved" as const, 
        approver: "Current Approver",
        comments: "Aprovado conforme revisão"
      } : r
    ));

    setDocuments(documents.map(d => 
      d.id === request.documentId ? { 
        ...d, 
        status: "approved" as const,
        approver: "Current Approver",
        approvedDate: new Date().toISOString().split("T")[0]
      } : d
    ));

    toast({ title: "Documento Aprovado", description: `${request.documentTitle} aprovado com sucesso` });
  };

  const handleRejectDocument = (request: ApprovalRequest) => {
    setApprovalRequests(approvalRequests.map(r => 
      r.id === request.id ? { 
        ...r, 
        status: "rejected" as const, 
        approver: "Current Approver",
        comments: "Necessário revisão adicional"
      } : r
    ));

    setDocuments(documents.map(d => 
      d.id === request.documentId ? { ...d, status: "rejected" as const } : d
    ));

    toast({ 
      title: "Documento Rejeitado", 
      description: `${request.documentTitle} requer correções`,
      variant: "destructive"
    });
  };

  const handleArchiveDocument = (doc: Document) => {
    setDocuments(documents.map(d => 
      d.id === doc.id ? { ...d, status: "archived" as const } : d
    ));
    toast({ title: "Documento Arquivado", description: `${doc.title} foi arquivado` });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast({ title: "Documento Removido", description: "Documento deletado permanentemente" });
  };

  const handleNewVersion = (doc: Document) => {
    const [major, minor] = doc.version.split(".").map(Number);
    const newVersion = `${major}.${minor + 1}`;
    
    setDocuments(documents.map(d => 
      d.id === doc.id ? { 
        ...d, 
        version: newVersion, 
        status: "draft" as const,
        lastModified: new Date().toISOString().split("T")[0]
      } : d
    ));
    
    toast({ title: "Nova Versão Criada", description: `${doc.title} v${newVersion}` });
  };

  const getCategoryBadge = (category: Document["category"]) => {
    const config = {
      policy: { color: "bg-purple-500/20 text-purple-400", icon: FileText },
      procedure: { color: "bg-blue-500/20 text-blue-400", icon: FileCheck },
      form: { color: "bg-green-500/20 text-green-400", icon: FileText },
      certificate: { color: "bg-yellow-500/20 text-yellow-400", icon: FileCheck },
      report: { color: "bg-orange-500/20 text-orange-400", icon: FileText },
      manual: { color: "bg-red-500/20 text-red-400", icon: FolderOpen }
    };
    const { color } = config[category];
    return <Badge className={color}>{category.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: Document["status"]) => {
    const config = {
      draft: { color: "bg-gray-500/20 text-gray-400", icon: Edit, label: "Rascunho" },
      pending_review: { color: "bg-yellow-500/20 text-yellow-400", icon: Clock, label: "Em Revisão" },
      approved: { color: "bg-green-500/20 text-green-400", icon: CheckCircle2, label: "Aprovado" },
      rejected: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Rejeitado" },
      archived: { color: "bg-gray-500/20 text-gray-400", icon: FolderOpen, label: "Arquivado" }
    };
    const { color, icon: Icon, label } = config[status];
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: ApprovalRequest["priority"]) => {
    const config = {
      low: { color: "bg-gray-500/20 text-gray-400" },
      medium: { color: "bg-blue-500/20 text-blue-400" },
      high: { color: "bg-orange-500/20 text-orange-400" },
      urgent: { color: "bg-red-500/20 text-red-400" }
    };
    const { color } = config[priority];
    return <Badge className={color}>{priority.toUpperCase()}</Badge>;
  };

  const filteredDocuments = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || d.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const pendingApprovals = approvalRequests.filter(r => r.status === "pending");

  // Stats
  const totalDocs = documents.length;
  const approvedDocs = documents.filter(d => d.status === "approved").length;
  const pendingDocs = documents.filter(d => d.status === "pending_review").length;
  const draftDocs = documents.filter(d => d.status === "draft").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Document Workflow Manager</h1>
            <p className="text-muted-foreground">Gestão de Documentos e Aprovações</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documentos</p>
                <p className="text-2xl font-bold">{totalDocs}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold">{approvedDocs}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingDocs}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold">{draftDocs}</p>
              </div>
              <Edit className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="policy">Políticas</SelectItem>
                <SelectItem value="procedure">Procedimentos</SelectItem>
                <SelectItem value="form">Formulários</SelectItem>
                <SelectItem value="certificate">Certificados</SelectItem>
                <SelectItem value="report">Relatórios</SelectItem>
                <SelectItem value="manual">Manuais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowDocDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
          </Button>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents">
                <FolderOpen className="h-4 w-4 mr-2" />
                Documentos ({filteredDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="approvals">
                <FileCheck className="h-4 w-4 mr-2" />
                Aprovações Pendentes ({pendingApprovals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-4">
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{doc.title}</span>
                          <Badge variant="outline">v{doc.version}</Badge>
                          {getCategoryBadge(doc.category)}
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>👤 {doc.author}</span>
                          <span>🏢 {doc.department}</span>
                          <span>📅 {doc.lastModified}</span>
                          <span>📦 {doc.fileSize}</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.status === "draft" && (
                        <Button size="sm" onClick={() => handleSubmitForApproval(doc)}>
                          <Send className="h-4 w-4 mr-1" />
                          Enviar
                        </Button>
                      )}
                      {doc.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => handleNewVersion(doc)}>
                          <History className="h-4 w-4 mr-1" />
                          Nova Versão
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleArchiveDocument(doc)}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="approvals" className="mt-4">
              <div className="space-y-3">
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma aprovação pendente</p>
                  </div>
                ) : (
                  pendingApprovals.map((request) => (
                    <div 
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Clock className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{request.documentTitle}</span>
                            {getPriorityBadge(request.priority)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>👤 Solicitado por: {request.requestedBy}</span>
                            <span>📅 {request.requestedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleApproveDocument(request)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectDocument(request)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New Document Dialog */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título do Documento</Label>
              <Input
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                placeholder="Ex: Procedimento de Segurança"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={newDoc.category}
                onValueChange={(v) => setNewDoc({ ...newDoc, category: v as Document["category"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy">Política</SelectItem>
                  <SelectItem value="procedure">Procedimento</SelectItem>
                  <SelectItem value="form">Formulário</SelectItem>
                  <SelectItem value="certificate">Certificado</SelectItem>
                  <SelectItem value="report">Relatório</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Departamento</Label>
              <Input
                value={newDoc.department}
                onChange={(e) => setNewDoc({ ...newDoc, department: e.target.value })}
                placeholder="Ex: Operations, Safety, HR"
              />
            </div>
            <div>
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={newDoc.tags}
                onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                placeholder="Ex: ISM, Safety, Compliance"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDocument}>Criar Documento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentWorkflowManager;
