/**
 * Document Approval Workflow - Fluxo de Aprovação de Documentos
 * Integrado com Supabase (ai_generated_documents)
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  FileText, CheckCircle2, XCircle, Clock, Eye, Download,
  Search, Filter, History, User, AlertTriangle, RotateCcw,
  FileCheck, GitBranch, Layers, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DocumentRow {
  id: string;
  title: string;
  document_type: string;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  content: string | null;
  metadata: Record<string, unknown> | null;
}

export default function DocumentApprovalWorkflow() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | "request_changes" | null>(null);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  // Fetch documents from ai_generated_documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["document-approval-workflow"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as DocumentRow[];
    },
  });

  // Approve / reject mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === "approved") {
        updateData.approved_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("ai_generated_documents")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-approval-workflow"] });
    },
  });

  const selectedDocument = documents.find((d) => d.id === selectedDocId) || null;

  const pendingDocs = documents.filter((d) => d.status === "pending" || d.status === "draft");
  const approvedDocs = documents.filter((d) => d.status === "approved");

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      draft: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
      pending: { label: "Aguardando Aprovação", color: "bg-warning/10 text-warning" },
      approved: { label: "Aprovado", color: "bg-success/10 text-success" },
      rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive" },
    };
    const { label, color } = config[status] || { label: status, color: "bg-muted text-muted-foreground" };
    return <Badge className={color}>{label}</Badge>;
  };

  const handleApproval = (action: "approve" | "reject" | "request_changes") => {
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const confirmApproval = async () => {
    if (!selectedDocument || !approvalAction) return;
    const statusMap = { approve: "approved", reject: "rejected", request_changes: "draft" };
    const messages = {
      approve: "Documento aprovado com sucesso!",
      reject: "Documento rejeitado.",
      request_changes: "Alterações solicitadas ao autor.",
    };
    try {
      await updateStatusMutation.mutateAsync({ id: selectedDocument.id, status: statusMap[approvalAction] });
      toast.success(messages[approvalAction]);
    } catch {
      toast.error("Erro ao atualizar documento.");
    }
    setShowApprovalDialog(false);
    setApprovalAction(null);
    setComment("");
  };

  const filteredPending = pendingDocs.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando documentos...</span>
      </div>
    );
  }

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
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold">{approvedDocs.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documentos</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
                <p className="text-2xl font-bold">{documents.filter((d) => d.status === "rejected").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-accent-foreground" />
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
                  <Input placeholder="Buscar..." className="pl-9 w-[200px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
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
                    {filteredPending.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>Nenhum documento pendente</p>
                      </div>
                    ) : (
                      filteredPending.map((doc) => (
                        <motion.div
                          key={doc.id}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => setSelectedDocId(doc.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedDocId === doc.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
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
                                <Badge variant="outline">{doc.document_type}</Badge>
                                <span className="text-xs">
                                  {format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="approved">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-3">
                    {approvedDocs.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Nenhum documento aprovado ainda</p>
                      </div>
                    ) : (
                      approvedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedDocId(doc.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileCheck className="h-4 w-4 text-success" />
                              <p className="font-medium">{doc.title}</p>
                            </div>
                            {getStatusBadge(doc.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Aprovado em {format(new Date(doc.updated_at), "dd/MM/yyyy")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="all">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedDocId(doc.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <p className="font-medium">{doc.title}</p>
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
                <div>
                  <h3 className="font-bold">{selectedDocument.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedDocument.status)}
                    <Badge variant="outline">{selectedDocument.document_type}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <span>{selectedDocument.document_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Criado</span>
                    <span>{format(new Date(selectedDocument.created_at), "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Atualizado</span>
                    <span>{format(new Date(selectedDocument.updated_at), "dd/MM/yyyy")}</span>
                  </div>
                </div>

                {selectedDocument.content && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Conteúdo</h4>
                    <div className="p-3 bg-muted/50 rounded text-sm max-h-40 overflow-y-auto">
                      {selectedDocument.content.substring(0, 500)}
                      {selectedDocument.content.length > 500 && "..."}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {(selectedDocument.status === "pending" || selectedDocument.status === "draft") && (
                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => handleApproval("approve")}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => handleApproval("request_changes")}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Alterações
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={() => handleApproval("reject")}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                )}
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
              {approvalAction === "approve" ? "Confirmar Aprovação" :
               approvalAction === "reject" ? "Confirmar Rejeição" :
               "Solicitar Alterações"}
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
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>Cancelar</Button>
            <Button
              variant={approvalAction === "reject" ? "destructive" : "default"}
              onClick={confirmApproval}
              disabled={(approvalAction !== "approve" && !comment) || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
