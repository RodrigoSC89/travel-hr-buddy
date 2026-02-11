/**
 * Invoice Approval Workflow - Fluxo de Aprovação Financeira
 * Workflow multi-nível com delegação e histórico
 * PATCH: Usando dados reais do Supabase
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  User,
  Building2,
  Calendar,
  AlertCircle,
  ArrowRight,
  Send,
  Eye,
  Download,
  MessageSquare,
  History,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  Paperclip,
  Stamp,
  UserCheck,
  UserX,
  RotateCcw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useInvoicesData, Invoice, Approver, Comment } from "@/hooks/useInvoicesData";

export default function InvoiceApprovalWorkflow() {
  const { invoices, pendingInvoices, totalPendingAmount, approvedThisMonth, isLoading, approve, reject } = useInvoicesData();
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApproval = (action: "approve" | "reject") => {
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const confirmApproval = () => {
    if (selectedInvoice) {
      if (approvalAction === "approve") {
        approve({ invoiceId: selectedInvoice.id, comment: comment || undefined });
      } else {
        reject({ invoiceId: selectedInvoice.id, reason: comment || "Sem motivo especificado" });
      }
    }
    setShowApprovalDialog(false);
    setApprovalAction(null);
    setComment("");
    setSelectedInvoice(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-warning/10 text-warning">Pendente</Badge>;
      case "approved":
        return <Badge className="bg-success/10 text-success">Aprovada</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive">Rejeitada</Badge>;
      case "on_hold":
        return <Badge className="bg-info/10 text-info">Em Espera</Badge>;
      case "paid":
        return <Badge className="bg-accent/10 text-accent-foreground">Paga</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: Invoice["urgency"]) => {
    switch (urgency) {
      case "critical":
        return <Badge variant="destructive">Urgente</Badge>;
      case "high":
        return <Badge className="bg-warning/10 text-warning">Alta</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Aprovação</p>
                <p className="text-2xl font-bold">{pendingInvoices.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas (mês)</p>
                <p className="text-2xl font-bold">{approvedThisMonth}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Pendente</p>
                <p className="text-2xl font-bold">${(totalPendingAmount / 1000).toFixed(0)}K</p>
              </div>
              <Wallet className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Aprovação</p>
                <p className="text-2xl font-bold">2.3d</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Faturas para Aprovação</CardTitle>
                <CardDescription>Clique para ver detalhes e aprovar</CardDescription>
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
                  <Badge variant="secondary" className="ml-2">{pendingInvoices.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="approved">Aprovadas</TabsTrigger>
                <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {pendingInvoices.map((invoice) => (
                      <motion.div
                        key={invoice.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedInvoice(invoice)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedInvoice?.id === invoice.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{invoice.number}</p>
                              {getUrgencyBadge(invoice.urgency)}
                              {getStatusBadge(invoice.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{invoice.vendor}</p>
                            <p className="text-sm">{invoice.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {invoice.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Vence {format(invoice.dueDate, "dd/MM")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {invoice.attachments} anexos
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {invoice.currency} {invoice.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <span>Etapa {invoice.currentStep}/{invoice.totalSteps}</span>
                            </div>
                            <Progress
                              value={(invoice.currentStep / invoice.totalSteps) * 100}
                              className="h-1 w-24 mt-1"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="approved">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {invoices.filter((i) => i.status === "approved").map((invoice) => (
                      <div
                        key={invoice.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{invoice.number}</p>
                              {getStatusBadge(invoice.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{invoice.vendor}</p>
                          </div>
                          <p className="font-bold">
                            {invoice.currency} {invoice.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="rejected">
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma fatura rejeitada este mês
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInvoice ? (
              <div className="space-y-6">
                {/* Invoice Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Número</span>
                    <span className="font-medium">{selectedInvoice.number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valor</span>
                    <span className="font-bold text-lg">
                      {selectedInvoice.currency} {selectedInvoice.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Vencimento</span>
                    <span>{format(selectedInvoice.dueDate, "dd/MM/yyyy")}</span>
                  </div>
                </div>

                {/* Approval Flow */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Fluxo de Aprovação</h4>
                  <div className="space-y-3">
                    {selectedInvoice.approvers.map((approver, index) => (
                      <div key={approver.id} className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${
                          approver.status === "approved" ? "bg-success" :
                          approver.status === "rejected" ? "bg-destructive" :
                          approver.status === "pending" ? "bg-warning" :
                          "bg-muted-foreground"
                        }`}>
                          {approver.status === "approved" ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : approver.status === "rejected" ? (
                            <XCircle className="h-4 w-4 text-white" />
                          ) : (
                            <Clock className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{approver.name}</p>
                          <p className="text-xs text-muted-foreground">{approver.role}</p>
                        </div>
                        {approver.approvedAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(approver.approvedAt, { locale: ptBR, addSuffix: true })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                {selectedInvoice.comments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Comentários</h4>
                    <div className="space-y-2">
                      {selectedInvoice.comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(comment.timestamp, { locale: ptBR, addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleApproval("approve")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprovar
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
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Anexos
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comentar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Selecione uma fatura para ver os detalhes</p>
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
              {approvalAction === "approve" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? "Esta ação aprovará a fatura e a enviará para o próximo nível de aprovação."
                : "Por favor, informe o motivo da rejeição."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Comentário {approvalAction === "reject" ? "(obrigatório)" : "(opcional)"}</Label>
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
              variant={approvalAction === "approve" ? "default" : "destructive"}
              onClick={confirmApproval}
              disabled={approvalAction === "reject" && !comment}
            >
              {approvalAction === "approve" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
