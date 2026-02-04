/**
 * Document Approval Workflow - Fluxo de Aprovação de Documentos
 * Gestão de revisões e aprovações com versionamento
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  History,
  MessageSquare,
  Send,
  User,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Stamp,
  FileCheck,
  FileX,
  GitBranch,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Document {
  id: string;
  title: string;
  type: string;
  category: string;
  version: string;
  status: "draft" | "pending_review" | "pending_approval" | "approved" | "rejected" | "expired";
  author: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  currentStep: number;
  totalSteps: number;
  reviewers: Reviewer[];
  versions: Version[];
  comments: Comment[];
}

interface Reviewer {
  id: string;
  name: string;
  role: string;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  reviewedAt?: Date;
  comment?: string;
}

interface Version {
  id: string;
  version: string;
  createdAt: Date;
  author: string;
  changes: string;
}

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "SMS Manual - Revisão 2024",
    type: "Manual",
    category: "ISM",
    version: "3.2",
    status: "pending_approval",
    author: "Carlos Silva",
    createdAt: new Date(2024, 0, 10),
    updatedAt: new Date(2024, 0, 18),
    currentStep: 2,
    totalSteps: 3,
    reviewers: [
      { id: "1", name: "Maria Santos", role: "QSMS Manager", status: "approved", reviewedAt: new Date(2024, 0, 15), comment: "Conforme." },
      { id: "2", name: "Roberto Lima", role: "DPA", status: "pending" },
      { id: "3", name: "João Costa", role: "CEO", status: "pending" },
    ],
    versions: [
      { id: "1", version: "3.2", createdAt: new Date(2024, 0, 10), author: "Carlos Silva", changes: "Atualização de procedimentos de emergência" },
      { id: "2", version: "3.1", createdAt: new Date(2023, 6, 1), author: "Carlos Silva", changes: "Revisão anual" },
      { id: "3", version: "3.0", createdAt: new Date(2022, 6, 1), author: "Ana Souza", changes: "Reestruturação completa" },
    ],
    comments: [
      { id: "1", author: "Maria Santos", message: "Revisado e aprovado. Pequena sugestão no capítulo 5.", timestamp: new Date(2024, 0, 15) },
    ],
  },
  {
    id: "2",
    title: "Procedimento de Abandono",
    type: "Procedimento",
    category: "Segurança",
    version: "2.0",
    status: "approved",
    author: "Pedro Oliveira",
    createdAt: new Date(2024, 0, 5),
    updatedAt: new Date(2024, 0, 12),
    expiresAt: new Date(2025, 0, 12),
    currentStep: 3,
    totalSteps: 3,
    reviewers: [
      { id: "1", name: "Carlos Silva", role: "Capitão", status: "approved", reviewedAt: new Date(2024, 0, 8) },
      { id: "2", name: "Maria Santos", role: "QSMS Manager", status: "approved", reviewedAt: new Date(2024, 0, 10) },
      { id: "3", name: "Roberto Lima", role: "DPA", status: "approved", reviewedAt: new Date(2024, 0, 12) },
    ],
    versions: [
      { id: "1", version: "2.0", createdAt: new Date(2024, 0, 5), author: "Pedro Oliveira", changes: "Novo formato e atualização de procedimentos" },
    ],
    comments: [],
  },
  {
    id: "3",
    title: "Checklist de Inspeção PSC",
    type: "Checklist",
    category: "Compliance",
    version: "1.1",
    status: "pending_review",
    author: "Ana Souza",
    createdAt: new Date(2024, 0, 18),
    updatedAt: new Date(2024, 0, 18),
    currentStep: 1,
    totalSteps: 2,
    reviewers: [
      { id: "1", name: "Carlos Silva", role: "Capitão", status: "pending" },
      { id: "2", name: "Maria Santos", role: "QSMS Manager", status: "pending" },
    ],
    versions: [
      { id: "1", version: "1.1", createdAt: new Date(2024, 0, 18), author: "Ana Souza", changes: "Adição de itens MARPOL" },
    ],
    comments: [],
  },
];

export default function DocumentApprovalWorkflow() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | "request_changes" | null>(null);
  const [comment, setComment] = useState("");

  const pendingDocs = MOCK_DOCUMENTS.filter(
    (d) => d.status === "pending_review" || d.status === "pending_approval"
  );

  const getStatusBadge = (status: Document["status"]) => {
    const config = {
      draft: { label: "Rascunho", color: "bg-gray-500/10 text-gray-500" },
      pending_review: { label: "Aguardando Revisão", color: "bg-blue-500/10 text-blue-500" },
      pending_approval: { label: "Aguardando Aprovação", color: "bg-amber-500/10 text-amber-500" },
      approved: { label: "Aprovado", color: "bg-green-500/10 text-green-500" },
      rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive" },
      expired: { label: "Expirado", color: "bg-destructive/10 text-destructive" },
    };
    const { label, color } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const getReviewerStatusIcon = (status: Reviewer["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "changes_requested":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleApproval = (action: "approve" | "reject" | "request_changes") => {
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const confirmApproval = () => {
    const messages = {
      approve: "Documento aprovado com sucesso!",
      reject: "Documento rejeitado.",
      request_changes: "Alterações solicitadas ao autor.",
    };
    toast.success(messages[approvalAction!]);
    setShowApprovalDialog(false);
    setApprovalAction(null);
    setComment("");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Ação</p>
                <p className="text-2xl font-bold">{pendingDocs.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados (mês)</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documentos</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirando</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documentos para Aprovação</CardTitle>
                <CardDescription>Revise e aprove documentos pendentes</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-9 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pendentes
                  <Badge variant="secondary" className="ml-2">{pendingDocs.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="approved">Aprovados</TabsTrigger>
                <TabsTrigger value="all">Todos</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-3">
                    {MOCK_DOCUMENTS.filter(
                      (d) => d.status === "pending_review" || d.status === "pending_approval"
                    ).map((doc) => (
                      <motion.div
                        key={doc.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedDocument(doc)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedDocument?.id === doc.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <p className="font-medium">{doc.title}</p>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                v{doc.version}
                              </span>
                              <Badge variant="outline">{doc.category}</Badge>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {doc.author}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm">
                              <span>Etapa {doc.currentStep}/{doc.totalSteps}</span>
                            </div>
                            <Progress
                              value={(doc.currentStep / doc.totalSteps) * 100}
                              className="h-1.5 w-20 mt-1"
                            />
                          </div>
                        </div>
                        {/* Reviewers */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                          {doc.reviewers.map((reviewer) => (
                            <div
                              key={reviewer.id}
                              className="flex items-center gap-1"
                              title={`${reviewer.name} - ${reviewer.role}`}
                            >
                              {getReviewerStatusIcon(reviewer.status)}
                              <span className="text-xs">{reviewer.name.split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="approved">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-3">
                    {MOCK_DOCUMENTS.filter((d) => d.status === "approved").map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-green-500" />
                            <p className="font-medium">{doc.title}</p>
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aprovado em {format(doc.updatedAt, "dd/MM/yyyy")}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="all">
                <div className="text-center py-12 text-muted-foreground">
                  Mostrando todos os 156 documentos
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDocument ? (
              <div className="space-y-6">
                {/* Document Info */}
                <div>
                  <h3 className="font-bold">{selectedDocument.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedDocument.status)}
                    <Badge variant="outline">v{selectedDocument.version}</Badge>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Autor</span>
                    <span>{selectedDocument.author}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Categoria</span>
                    <span>{selectedDocument.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Criado</span>
                    <span>{format(selectedDocument.createdAt, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Atualizado</span>
                    <span>{format(selectedDocument.updatedAt, "dd/MM/yyyy")}</span>
                  </div>
                </div>

                {/* Version History */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Histórico de Versões
                  </h4>
                  <div className="space-y-2">
                    {selectedDocument.versions.slice(0, 3).map((ver) => (
                      <div key={ver.id} className="text-xs p-2 bg-muted/50 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">v{ver.version}</span>
                          <span className="text-muted-foreground">
                            {format(ver.createdAt, "dd/MM/yy")}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">{ver.changes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approval Flow */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Fluxo de Aprovação</h4>
                  <div className="space-y-2">
                    {selectedDocument.reviewers.map((reviewer) => (
                      <div key={reviewer.id} className="flex items-center gap-2 p-2 border rounded">
                        {getReviewerStatusIcon(reviewer.status)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{reviewer.name}</p>
                          <p className="text-xs text-muted-foreground">{reviewer.role}</p>
                        </div>
                        {reviewer.reviewedAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(reviewer.reviewedAt, { locale: ptBR, addSuffix: true })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {(selectedDocument.status === "pending_review" ||
                  selectedDocument.status === "pending_approval") && (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => handleApproval("approve")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleApproval("request_changes")}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Alterações
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleApproval("reject")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Selecione um documento para ver detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve"
                ? "Confirmar Aprovação"
                : approvalAction === "reject"
                ? "Confirmar Rejeição"
                : "Solicitar Alterações"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Comentário {approvalAction !== "approve" ? "(obrigatório)" : "(opcional)"}</Label>
            <Textarea
              placeholder="Adicione um comentário..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant={approvalAction === "reject" ? "destructive" : "default"}
              onClick={confirmApproval}
              disabled={approvalAction !== "approve" && !comment}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
