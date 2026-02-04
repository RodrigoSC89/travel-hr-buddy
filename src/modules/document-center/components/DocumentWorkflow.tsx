/**
 * Document Workflow - Premium Document Center Component
 * Sistema de workflow e aprovação de documentos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  FileText, 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Users,
  Send,
  MessageSquare,
  Eye,
  Download,
  Upload,
  ArrowRight,
  RotateCcw,
  Stamp,
  PenTool,
  History,
  Filter,
  Search,
  Calendar,
  Building2,
  Ship,
  Shield,
  FileCheck,
  FileClock,
  FileX
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowDocument {
  id: string;
  title: string;
  type: string;
  category: string;
  version: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  createdAt: string;
  currentStep: number;
  totalSteps: number;
  status: "draft" | "pending" | "in-review" | "approved" | "rejected" | "expired";
  priority: "low" | "normal" | "high" | "urgent";
  dueDate: string;
  vessel?: string;
  department: string;
  steps: WorkflowStep[];
  comments: WorkflowComment[];
  attachments: number;
  size: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: "review" | "approval" | "signature" | "verification";
  assignee: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  status: "pending" | "in-progress" | "completed" | "rejected" | "skipped";
  completedAt?: string;
  comments?: string;
  signature?: string;
}

interface WorkflowComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  type: "comment" | "approval" | "rejection" | "revision-request";
}

const mockDocuments: WorkflowDocument[] = [
  {
    id: "1",
    title: "Procedimento de Segurança - Operações de Carga",
    type: "Procedimento",
    category: "SMS",
    version: "2.1",
    createdBy: {
      id: "u1",
      name: "Carlos Silva",
      role: "Safety Officer",
      avatar: undefined
    },
    createdAt: "2024-01-15T10:00:00Z",
    currentStep: 2,
    totalSteps: 4,
    status: "in-review",
    priority: "high",
    dueDate: "2024-01-25T18:00:00Z",
    vessel: "MV Atlantic Pioneer",
    department: "Safety",
    steps: [
      { id: "s1", name: "Elaboração", type: "review", assignee: { id: "u1", name: "Carlos Silva", role: "Safety Officer" }, status: "completed", completedAt: "2024-01-15T14:00:00Z" },
      { id: "s2", name: "Revisão Técnica", type: "review", assignee: { id: "u2", name: "Ana Rodrigues", role: "Chief Officer" }, status: "in-progress" },
      { id: "s3", name: "Aprovação DPA", type: "approval", assignee: { id: "u3", name: "Roberto Santos", role: "DPA" }, status: "pending" },
      { id: "s4", name: "Assinatura Capitão", type: "signature", assignee: { id: "u4", name: "João Mendes", role: "Master" }, status: "pending" }
    ],
    comments: [
      { id: "c1", userId: "u1", userName: "Carlos Silva", content: "Documento atualizado conforme novas diretrizes IMO", timestamp: "2024-01-15T14:00:00Z", type: "comment" },
      { id: "c2", userId: "u2", userName: "Ana Rodrigues", content: "Revisando seção 3.2 - procedimentos de emergência", timestamp: "2024-01-18T09:30:00Z", type: "comment" }
    ],
    attachments: 3,
    size: "2.4 MB"
  },
  {
    id: "2",
    title: "Certificado ISPS - Renovação Anual",
    type: "Certificado",
    category: "Compliance",
    version: "1.0",
    createdBy: {
      id: "u5",
      name: "Maria Costa",
      role: "Compliance Manager"
    },
    createdAt: "2024-01-10T08:00:00Z",
    currentStep: 3,
    totalSteps: 3,
    status: "pending",
    priority: "urgent",
    dueDate: "2024-01-20T12:00:00Z",
    vessel: "MV Pacific Voyager",
    department: "Compliance",
    steps: [
      { id: "s1", name: "Preparação", type: "review", assignee: { id: "u5", name: "Maria Costa", role: "Compliance Manager" }, status: "completed", completedAt: "2024-01-12T16:00:00Z" },
      { id: "s2", name: "Verificação CSO", type: "verification", assignee: { id: "u6", name: "Pedro Lima", role: "CSO" }, status: "completed", completedAt: "2024-01-15T11:00:00Z" },
      { id: "s3", name: "Aprovação Final", type: "approval", assignee: { id: "u3", name: "Roberto Santos", role: "DPA" }, status: "pending" }
    ],
    comments: [],
    attachments: 5,
    size: "8.1 MB"
  },
  {
    id: "3",
    title: "Relatório de Auditoria Interna - Q4 2023",
    type: "Relatório",
    category: "Auditoria",
    version: "1.2",
    createdBy: {
      id: "u7",
      name: "Fernanda Souza",
      role: "Internal Auditor"
    },
    createdAt: "2024-01-05T09:00:00Z",
    currentStep: 4,
    totalSteps: 4,
    status: "approved",
    priority: "normal",
    dueDate: "2024-01-15T18:00:00Z",
    department: "Quality",
    steps: [
      { id: "s1", name: "Elaboração", type: "review", assignee: { id: "u7", name: "Fernanda Souza", role: "Internal Auditor" }, status: "completed", completedAt: "2024-01-08T17:00:00Z" },
      { id: "s2", name: "Revisão QA", type: "review", assignee: { id: "u8", name: "Lucas Oliveira", role: "QA Manager" }, status: "completed", completedAt: "2024-01-10T14:00:00Z" },
      { id: "s3", name: "Aprovação Gerência", type: "approval", assignee: { id: "u9", name: "Patricia Alves", role: "Operations Manager" }, status: "completed", completedAt: "2024-01-12T10:00:00Z" },
      { id: "s4", name: "Assinatura Diretor", type: "signature", assignee: { id: "u10", name: "Ricardo Ferreira", role: "Director" }, status: "completed", completedAt: "2024-01-14T16:00:00Z", signature: "Ricardo Ferreira" }
    ],
    comments: [
      { id: "c1", userId: "u8", userName: "Lucas Oliveira", content: "Excelente relatório. Aprovado sem ressalvas.", timestamp: "2024-01-10T14:00:00Z", type: "approval" }
    ],
    attachments: 12,
    size: "15.3 MB"
  }
];

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-slate-500", icon: FileText },
  pending: { label: "Pendente", color: "bg-yellow-500", icon: FileClock },
  "in-review": { label: "Em Revisão", color: "bg-blue-500", icon: Eye },
  approved: { label: "Aprovado", color: "bg-green-500", icon: FileCheck },
  rejected: { label: "Rejeitado", color: "bg-red-500", icon: FileX },
  expired: { label: "Expirado", color: "bg-gray-500", icon: AlertTriangle }
};

const priorityConfig = {
  low: { label: "Baixa", color: "text-slate-500" },
  normal: { label: "Normal", color: "text-blue-500" },
  high: { label: "Alta", color: "text-orange-500" },
  urgent: { label: "Urgente", color: "text-red-500" }
};

const stepTypeIcons = {
  review: Eye,
  approval: CheckCircle2,
  signature: PenTool,
  verification: Shield
};

export default function DocumentWorkflow() {
  const [selectedDoc, setSelectedDoc] = useState<WorkflowDocument | null>(mockDocuments[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [commentText, setCommentText] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const pendingDocs = mockDocuments.filter(d => d.status === "pending" || d.status === "in-review").length;
  const approvedDocs = mockDocuments.filter(d => d.status === "approved").length;
  const urgentDocs = mockDocuments.filter(d => d.priority === "urgent").length;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getDaysRemaining = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredDocs = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <FileClock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingDocs}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FileCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedDocs}</p>
                <p className="text-xs text-muted-foreground">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{urgentDocs}</p>
                <p className="text-xs text-muted-foreground">Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockDocuments.length}</p>
                <p className="text-xs text-muted-foreground">Total em Workflow</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos
            </CardTitle>
            <div className="space-y-2 mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar documento..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredDocs.map((doc) => {
                  const StatusConfig = statusConfig[doc.status];
                  const StatusIcon = StatusConfig.icon;
                  const daysRemaining = getDaysRemaining(doc.dueDate);
                  
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        selectedDoc?.id === doc.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} • v{doc.version}</p>
                        </div>
                        <Badge className={cn("text-white text-xs ml-2", StatusConfig.color)}>
                          {StatusConfig.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        {doc.vessel && (
                          <>
                            <Ship className="h-3 w-3" />
                            <span>{doc.vessel}</span>
                            <span>•</span>
                          </>
                        )}
                        <Building2 className="h-3 w-3" />
                        <span>{doc.department}</span>
                      </div>

                      {/* Progress */}
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-xs">
                          <span>Etapa {doc.currentStep} de {doc.totalSteps}</span>
                          <span>{Math.round((doc.currentStep / doc.totalSteps) * 100)}%</span>
                        </div>
                        <Progress value={(doc.currentStep / doc.totalSteps) * 100} className="h-1.5" />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className={cn(
                          "flex items-center gap-1",
                          priorityConfig[doc.priority].color
                        )}>
                          <AlertTriangle className="h-3 w-3" />
                          {priorityConfig[doc.priority].label}
                        </span>
                        <span className={cn(
                          daysRemaining <= 2 ? "text-red-500" :
                          daysRemaining <= 5 ? "text-yellow-500" : "text-muted-foreground"
                        )}>
                          {daysRemaining > 0 ? `${daysRemaining} dias` : "Vencido"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Document Details */}
        <Card className="lg:col-span-2">
          {selectedDoc ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={cn("text-white mb-2", statusConfig[selectedDoc.status].color)}>
                      {statusConfig[selectedDoc.status].label}
                    </Badge>
                    <CardTitle className="text-lg">{selectedDoc.title}</CardTitle>
                    <CardDescription>
                      {selectedDoc.type} • Versão {selectedDoc.version} • {selectedDoc.size}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="workflow">
                  <TabsList className="mb-4">
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="comments">
                      Comentários
                      {selectedDoc.comments.length > 0 && (
                        <Badge variant="secondary" className="ml-2">{selectedDoc.comments.length}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                  </TabsList>

                  <TabsContent value="workflow">
                    <div className="space-y-4">
                      {/* Document Info */}
                      <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Criado por:</span>
                            <span className="font-medium">{selectedDoc.createdBy.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Data:</span>
                            <span className="font-medium">{formatDate(selectedDoc.createdAt)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Prazo:</span>
                            <span className={cn(
                              "font-medium",
                              getDaysRemaining(selectedDoc.dueDate) <= 2 ? "text-red-500" : ""
                            )}>{formatDate(selectedDoc.dueDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Anexos:</span>
                            <span className="font-medium">{selectedDoc.attachments} arquivos</span>
                          </div>
                        </div>
                      </div>

                      {/* Workflow Steps */}
                      <div className="relative">
                        {selectedDoc.steps.map((step, index) => {
                          const StepIcon = stepTypeIcons[step.type];
                          const isActive = step.status === "in-progress";
                          const isCompleted = step.status === "completed";
                          const isRejected = step.status === "rejected";
                          
                          return (
                            <div key={step.id} className="flex gap-4 pb-6 last:pb-0">
                              <div className="relative">
                                <div className={cn(
                                  "w-12 h-12 rounded-full flex items-center justify-center border-2",
                                  isCompleted ? "bg-green-500/20 border-green-500" :
                                  isActive ? "bg-blue-500/20 border-blue-500 animate-pulse" :
                                  isRejected ? "bg-red-500/20 border-red-500" :
                                  "bg-muted border-border"
                                )}>
                                  <StepIcon className={cn(
                                    "h-5 w-5",
                                    isCompleted ? "text-green-500" :
                                    isActive ? "text-blue-500" :
                                    isRejected ? "text-red-500" :
                                    "text-muted-foreground"
                                  )} />
                                </div>
                                {index < selectedDoc.steps.length - 1 && (
                                  <div className={cn(
                                    "absolute top-12 left-1/2 w-0.5 h-full -translate-x-1/2",
                                    isCompleted ? "bg-green-500" : "bg-border"
                                  )} />
                                )}
                              </div>
                              
                              <div className="flex-1 pt-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{step.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={step.assignee.avatar} />
                                        <AvatarFallback className="text-xs">
                                          {step.assignee.name.split(" ").map(n => n[0]).join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-muted-foreground">
                                        {step.assignee.name} • {step.assignee.role}
                                      </span>
                                    </div>
                                    {step.completedAt && (
                                      <p className="text-xs text-green-500 mt-1">
                                        Concluído em {formatDateTime(step.completedAt)}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    {isActive && (
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Rejeitar
                                        </Button>
                                        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                                          <DialogTrigger asChild>
                                            <Button size="sm">
                                              <CheckCircle2 className="h-4 w-4 mr-1" />
                                              Aprovar
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Confirmar Aprovação</DialogTitle>
                                              <DialogDescription>
                                                Você está aprovando a etapa "{step.name}" do documento.
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <Textarea 
                                                placeholder="Comentário opcional..."
                                                rows={3}
                                              />
                                              {step.type === "signature" && (
                                                <div className="p-4 border-2 border-dashed rounded-lg text-center">
                                                  <PenTool className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                  <p className="text-sm text-muted-foreground">
                                                    Clique para adicionar assinatura digital
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                            <DialogFooter>
                                              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                                                Cancelar
                                              </Button>
                                              <Button onClick={() => setShowApproveDialog(false)}>
                                                <Stamp className="h-4 w-4 mr-2" />
                                                Confirmar Aprovação
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    )}
                                    {isCompleted && (
                                      <Badge variant="outline" className="text-green-500 border-green-500">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Concluído
                                      </Badge>
                                    )}
                                    {step.status === "pending" && !isActive && (
                                      <Badge variant="outline" className="text-muted-foreground">
                                        Aguardando
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="comments">
                    <div className="space-y-4">
                      {/* Add Comment */}
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>EU</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea 
                            placeholder="Adicione um comentário..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Solicitar Revisão
                            </Button>
                            <Button size="sm" disabled={!commentText.trim()}>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Comments List */}
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                          {selectedDoc.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.userAvatar} />
                                <AvatarFallback className="text-xs">
                                  {comment.userName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{comment.userName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(comment.timestamp)}
                                  </span>
                                  {comment.type !== "comment" && (
                                    <Badge variant={comment.type === "approval" ? "default" : "destructive"} className="text-xs">
                                      {comment.type === "approval" ? "Aprovação" : 
                                       comment.type === "rejection" ? "Rejeição" : "Revisão"}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm mt-1">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center">
                        <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Histórico completo de versões</p>
                        <p className="text-sm">Em breve: comparação de versões e rollback</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px] text-muted-foreground">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Selecione um documento para ver detalhes</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
