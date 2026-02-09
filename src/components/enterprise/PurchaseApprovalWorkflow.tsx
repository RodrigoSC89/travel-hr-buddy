 /**
  * Purchase Approval Workflow - Multi-Step Visual Workflow
  * Workflow de aprovação de compras com steps visuais
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
 import { Progress } from "@/components/ui/progress";
 import { Separator } from "@/components/ui/separator";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { 
   CheckCircle, Clock, XCircle, AlertTriangle, User, 
   FileText, DollarSign, Building, Send, Eye, Plus,
   ChevronRight, ArrowRight, Loader2, MessageSquare
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { toast } from "sonner";
 
 interface ApprovalStep {
   id: string;
   name: string;
   role: string;
   status: "pending" | "approved" | "rejected" | "current";
   approver?: string;
   date?: string;
   comments?: string;
 }
 
 interface PurchaseRequest {
   id: string;
   title: string;
   description: string;
   requestedBy: string;
   department: string;
   amount: number;
   currency: string;
   priority: "low" | "medium" | "high" | "urgent";
   category: string;
   vessel?: string;
   supplier?: string;
   createdAt: string;
   currentStep: number;
   steps: ApprovalStep[];
   attachments: string[];
 }
 
 interface PurchaseApprovalWorkflowProps {
   requests?: PurchaseRequest[];
   onApprove?: (id: string, comments: string) => void;
   onReject?: (id: string, reason: string) => void;
 }
 
 const defaultRequests: PurchaseRequest[] = [
   {
     id: "PR-2026-001",
     title: "Peças de reposição - Motor Principal",
     description: "Conjunto de anéis de pistão e juntas para manutenção programada do motor MAN B&W 6S60MC-C",
     requestedBy: "Carlos Oliveira",
     department: "Manutenção",
     amount: 45000,
     currency: "USD",
     priority: "high",
     category: "Peças & Spares",
     vessel: "MV Nautilus Star",
     supplier: "MAN Energy Solutions",
     createdAt: "2026-02-01",
     currentStep: 2,
     steps: [
       { id: "1", name: "Requisição", role: "Solicitante", status: "approved", approver: "Carlos Oliveira", date: "2026-02-01" },
       { id: "2", name: "Supervisor Técnico", role: "Chefe de Máquinas", status: "approved", approver: "João Santos", date: "2026-02-02", comments: "Aprovado. Peças críticas para manutenção de 6000h." },
       { id: "3", name: "Gerente de Compras", role: "Procurement Manager", status: "current" },
       { id: "4", name: "Diretor Financeiro", role: "CFO", status: "pending" },
       { id: "5", name: "Pedido de Compra", role: "Sistema", status: "pending" },
     ],
     attachments: ["cotacao_man.pdf", "especificacao_tecnica.pdf"]
   },
   {
     id: "PR-2026-002",
     title: "Provisões - Viagem Atlântico Sul",
     description: "Provisões para 45 dias de viagem para 24 tripulantes",
     requestedBy: "Maria Costa",
     department: "Catering",
     amount: 12500,
     currency: "USD",
     priority: "medium",
     category: "Provisões",
     vessel: "MV Nautilus Explorer",
     supplier: "Seaport Provisions Ltd",
     createdAt: "2026-02-03",
     currentStep: 1,
     steps: [
       { id: "1", name: "Requisição", role: "Solicitante", status: "approved", approver: "Maria Costa", date: "2026-02-03" },
       { id: "2", name: "Comandante", role: "Master", status: "current" },
       { id: "3", name: "Gerente de Compras", role: "Procurement Manager", status: "pending" },
       { id: "4", name: "Pedido de Compra", role: "Sistema", status: "pending" },
     ],
     attachments: ["lista_provisoes.xlsx"]
   },
   {
     id: "PR-2026-003",
     title: "Serviço de Classificadora - Vistoria Anual",
     description: "Vistoria anual DNV GL para renovação de certificados de classe",
     requestedBy: "André Lima",
     department: "Compliance",
     amount: 28000,
     currency: "USD",
     priority: "urgent",
     category: "Serviços",
     vessel: "MV Nautilus Voyager",
     supplier: "DNV GL",
     createdAt: "2026-02-04",
     currentStep: 3,
     steps: [
       { id: "1", name: "Requisição", role: "Solicitante", status: "approved", approver: "André Lima", date: "2026-02-04" },
       { id: "2", name: "Supervisor Técnico", role: "Superintendente", status: "approved", approver: "Ricardo Mendes", date: "2026-02-04" },
       { id: "3", name: "Gerente de Compras", role: "Procurement Manager", status: "approved", approver: "Paula Ferreira", date: "2026-02-04" },
       { id: "4", name: "Diretor Financeiro", role: "CFO", status: "current" },
       { id: "5", name: "Pedido de Compra", role: "Sistema", status: "pending" },
     ],
     attachments: ["proposta_dnv.pdf", "escopo_vistoria.pdf"]
   }
 ];
 
 export function PurchaseApprovalWorkflow({ 
   requests = defaultRequests,
   onApprove,
   onReject 
 }: PurchaseApprovalWorkflowProps) {
   const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
   const [detailsOpen, setDetailsOpen] = useState(false);
   const [approvalComments, setApprovalComments] = useState("");
   const [isProcessing, setIsProcessing] = useState(false);
   const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
 
   const getPriorityColor = (priority: string) => {
     const colors: Record<string, string> = {
       low: "bg-muted text-muted-foreground",
       medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
       high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
       urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
     };
     return colors[priority] || colors.medium;
   };
 
   const getStepIcon = (status: string) => {
     switch (status) {
       case "approved": return <CheckCircle className="h-5 w-5 text-success" />;
       case "rejected": return <XCircle className="h-5 w-5 text-destructive" />;
       case "current": return <Clock className="h-5 w-5 text-primary animate-pulse" />;
       default: return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
     }
   };
 
   const handleApprove = async (request: PurchaseRequest) => {
     setIsProcessing(true);
     try {
       onApprove?.(request.id, approvalComments);
       toast.success(`Requisição ${request.id} aprovada!`);
     } finally {
       setIsProcessing(false);
       setDetailsOpen(false);
       setApprovalComments("");
     }
   };
 
   const handleReject = async (request: PurchaseRequest) => {
     if (!approvalComments.trim()) {
       toast.error("Informe o motivo da rejeição");
       return;
     }
     setIsProcessing(true);
     try {
       onReject?.(request.id, approvalComments);
       toast.error(`Requisição ${request.id} rejeitada`);
     } finally {
       setIsProcessing(false);
       setDetailsOpen(false);
       setApprovalComments("");
     }
   };
 
   const pendingCount = requests.filter(r => r.steps.some(s => s.status === "current")).length;
   const approvedToday = requests.filter(r => r.steps.every(s => s.status === "approved")).length;
 
   return (
     <div className="space-y-6">
       {/* Stats */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card>
           <CardContent className="p-4 flex items-center justify-between">
             <div>
               <p className="text-xs text-muted-foreground">Aguardando Aprovação</p>
               <p className="text-2xl font-bold text-primary">{pendingCount}</p>
             </div>
             <Clock className="h-8 w-8 text-primary opacity-30" />
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4 flex items-center justify-between">
             <div>
               <p className="text-xs text-muted-foreground">Aprovadas Hoje</p>
               <p className="text-2xl font-bold text-success">{approvedToday}</p>
             </div>
             <CheckCircle className="h-8 w-8 text-success opacity-30" />
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4 flex items-center justify-between">
             <div>
               <p className="text-xs text-muted-foreground">Valor Total Pendente</p>
               <p className="text-2xl font-bold">$73.5K</p>
             </div>
             <DollarSign className="h-8 w-8 text-muted-foreground opacity-30" />
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4 flex items-center justify-between">
             <div>
               <p className="text-xs text-muted-foreground">Urgentes</p>
               <p className="text-2xl font-bold text-destructive">
                 {requests.filter(r => r.priority === "urgent").length}
               </p>
             </div>
             <AlertTriangle className="h-8 w-8 text-destructive opacity-30" />
           </CardContent>
         </Card>
       </div>
 
       {/* Filter */}
       <div className="flex gap-2">
         {["all", "pending", "approved", "rejected"].map((f) => (
           <Button
             key={f}
             variant={filter === f ? "default" : "outline"}
             size="sm"
             onClick={() => setFilter(f as typeof filter)}
           >
             {f === "all" ? "Todas" : f === "pending" ? "Pendentes" : f === "approved" ? "Aprovadas" : "Rejeitadas"}
           </Button>
         ))}
       </div>
 
       {/* Request Cards */}
       <div className="space-y-4">
         {requests.map((request) => {
           const progress = (request.steps.filter(s => s.status === "approved").length / request.steps.length) * 100;
           const currentStep = request.steps.find(s => s.status === "current");
 
           return (
             <Card 
               key={request.id}
               className="hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => {
                 setSelectedRequest(request);
                 setDetailsOpen(true);
               }}
             >
               <CardContent className="p-4">
                 <div className="flex items-start justify-between gap-4">
                   {/* Left - Info */}
                   <div className="flex-1 space-y-2">
                     <div className="flex items-center gap-2">
                       <Badge variant="outline">{request.id}</Badge>
                       <Badge className={getPriorityColor(request.priority)}>
                         {request.priority.toUpperCase()}
                       </Badge>
                       <Badge variant="secondary">{request.category}</Badge>
                     </div>
                     <h4 className="font-semibold">{request.title}</h4>
                     <p className="text-sm text-muted-foreground line-clamp-1">{request.description}</p>
                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <User className="h-3 w-3" />
                         {request.requestedBy}
                       </span>
                       <span className="flex items-center gap-1">
                         <Building className="h-3 w-3" />
                         {request.department}
                       </span>
                       {request.vessel && (
                         <span className="flex items-center gap-1">
                           🚢 {request.vessel}
                         </span>
                       )}
                     </div>
                   </div>
 
                   {/* Right - Amount & Status */}
                   <div className="text-right space-y-2">
                     <p className="text-2xl font-bold">
                       {request.currency} {request.amount.toLocaleString()}
                     </p>
                     <div className="flex items-center gap-2 justify-end">
                       <span className="text-xs text-muted-foreground">
                         {currentStep ? `Aguardando: ${currentStep.role}` : "Concluído"}
                       </span>
                       {currentStep?.status === "current" && (
                         <Clock className="h-4 w-4 text-primary animate-pulse" />
                       )}
                     </div>
                   </div>
                 </div>
 
                 {/* Progress Bar */}
                 <div className="mt-4 space-y-2">
                   <div className="flex justify-between text-xs text-muted-foreground">
                     <span>Progresso da Aprovação</span>
                     <span>{Math.round(progress)}%</span>
                   </div>
                   <Progress value={progress} className="h-2" />
                   
                   {/* Steps Mini View */}
                   <div className="flex items-center gap-1 pt-2">
                     {request.steps.map((step, idx) => (
                       <React.Fragment key={step.id}>
                         <div className={cn(
                           "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                           step.status === "approved" && "bg-success/20 text-success",
                           step.status === "rejected" && "bg-destructive/20 text-destructive",
                           step.status === "current" && "bg-primary/20 text-primary ring-2 ring-primary",
                           step.status === "pending" && "bg-muted text-muted-foreground"
                         )}>
                           {step.status === "approved" ? "✓" : step.status === "rejected" ? "✕" : idx + 1}
                         </div>
                         {idx < request.steps.length - 1 && (
                           <div className={cn(
                             "flex-1 h-0.5",
                             step.status === "approved" ? "bg-success" : "bg-muted"
                           )} />
                         )}
                       </React.Fragment>
                     ))}
                   </div>
                 </div>
               </CardContent>
             </Card>
           );
         })}
       </div>
 
       {/* Details Dialog */}
       <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
         <DialogContent className="max-w-3xl max-h-[90vh]">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <FileText className="h-5 w-5" />
               {selectedRequest?.id} - {selectedRequest?.title}
             </DialogTitle>
           </DialogHeader>
 
           {selectedRequest && (
             <ScrollArea className="max-h-[60vh]">
               <div className="space-y-6 pr-4">
                 {/* Request Info */}
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label className="text-xs text-muted-foreground">Solicitante</Label>
                     <p className="font-medium">{selectedRequest.requestedBy}</p>
                   </div>
                   <div>
                     <Label className="text-xs text-muted-foreground">Departamento</Label>
                     <p className="font-medium">{selectedRequest.department}</p>
                   </div>
                   <div>
                     <Label className="text-xs text-muted-foreground">Fornecedor</Label>
                     <p className="font-medium">{selectedRequest.supplier || "A definir"}</p>
                   </div>
                   <div>
                     <Label className="text-xs text-muted-foreground">Embarcação</Label>
                     <p className="font-medium">{selectedRequest.vessel || "N/A"}</p>
                   </div>
                 </div>
 
                 <div>
                   <Label className="text-xs text-muted-foreground">Descrição</Label>
                   <p className="mt-1">{selectedRequest.description}</p>
                 </div>
 
                 <Separator />
 
                 {/* Workflow Steps */}
                 <div>
                   <h4 className="font-semibold mb-4">Fluxo de Aprovação</h4>
                   <div className="space-y-3">
                     {selectedRequest.steps.map((step, idx) => (
                       <div 
                         key={step.id}
                         className={cn(
                           "flex items-start gap-4 p-3 rounded-lg border",
                           step.status === "current" && "bg-primary/5 border-primary",
                           step.status === "approved" && "bg-success/5 border-success/30",
                           step.status === "rejected" && "bg-destructive/5 border-destructive/30"
                         )}
                       >
                         {getStepIcon(step.status)}
                         <div className="flex-1">
                           <div className="flex items-center justify-between">
                             <div>
                               <p className="font-medium">{step.name}</p>
                               <p className="text-sm text-muted-foreground">{step.role}</p>
                             </div>
                             {step.approver && (
                               <div className="text-right text-sm">
                                 <p>{step.approver}</p>
                                 <p className="text-muted-foreground">{step.date}</p>
                               </div>
                             )}
                           </div>
                           {step.comments && (
                             <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                               <MessageSquare className="h-3 w-3 inline mr-1" />
                               {step.comments}
                             </div>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
 
                 <Separator />
 
                 {/* Approval Section */}
                 {selectedRequest.steps.some(s => s.status === "current") && (
                   <div className="space-y-3">
                     <h4 className="font-semibold">Sua Decisão</h4>
                     <Textarea
                       placeholder="Comentários (obrigatório para rejeição)"
                       value={approvalComments}
                       onChange={(e) => setApprovalComments(e.target.value)}
                     />
                     <div className="flex gap-2">
                       <Button 
                         className="flex-1" 
                         onClick={() => handleApprove(selectedRequest)}
                         disabled={isProcessing}
                       >
                         {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                         Aprovar
                       </Button>
                       <Button 
                         variant="destructive" 
                         className="flex-1"
                         onClick={() => handleReject(selectedRequest)}
                         disabled={isProcessing}
                       >
                         {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                         Rejeitar
                       </Button>
                     </div>
                   </div>
                 )}
               </div>
             </ScrollArea>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 }
 
 export default PurchaseApprovalWorkflow;