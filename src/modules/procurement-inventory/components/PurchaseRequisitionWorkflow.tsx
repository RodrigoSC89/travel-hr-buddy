 /**
  * Purchase Requisition Workflow - Fluxo de Requisições
  * Workflow visual de aprovação com budget check
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 import { 
   FileText, Plus, Search, Clock, CheckCircle2, XCircle,
   User, Calendar, DollarSign, AlertTriangle, ChevronRight, Ship
 } from "lucide-react";
 
 interface Requisition {
   id: string;
   requisitionNumber: string;
   title: string;
   category: string;
   requester: string;
   vessel?: string;
   items: { id: string; name: string; quantity: number; unit: string; estimatedPrice: number }[];
   totalValue: number;
   priority: "low" | "medium" | "high" | "urgent";
   status: "draft" | "pending" | "approved" | "rejected";
   dueDate: string;
   budgetCheck: "within" | "over" | "pending";
   approvalHistory: { approver: string; role: string; status: string; date?: string }[];
 }
 
 const mockRequisitions: Requisition[] = [
   {
     id: "1", requisitionNumber: "REQ-2024-001", title: "Filtros de Combustível - Manutenção Preventiva",
     category: "Peças de Reposição", requester: "Carlos Silva", vessel: "MV Atlantic Explorer",
     items: [{ id: "1", name: "Filtro Primário FW-500", quantity: 10, unit: "un", estimatedPrice: 450 }],
     totalValue: 7700, priority: "high", status: "pending", dueDate: "2024-01-20", budgetCheck: "within",
     approvalHistory: [{ approver: "Carlos Silva", role: "Requisitor", status: "approved", date: "2024-01-14" }, { approver: "João Pereira", role: "Gerente", status: "pending" }]
   },
   {
     id: "2", requisitionNumber: "REQ-2024-002", title: "Provisões - Viagem Santos/Rotterdam",
     category: "Provisões", requester: "Ana Costa", vessel: "MV Pacific Voyager",
     items: [{ id: "1", name: "Provisões Diversas", quantity: 1, unit: "lote", estimatedPrice: 45000 }],
     totalValue: 45000, priority: "urgent", status: "approved", dueDate: "2024-01-15", budgetCheck: "within",
     approvalHistory: [{ approver: "Ana Costa", role: "Requisitor", status: "approved", date: "2024-01-13" }, { approver: "Pedro Lima", role: "Gerente", status: "approved", date: "2024-01-14" }]
   },
 ];
 
 const StatusBadge = ({ status }: { status: string }) => {
   const config: Record<string, { color: string, label: string }> = {
     draft: { color: "bg-muted text-muted-foreground", label: "Rascunho" },
     pending: { color: "bg-warning/10 text-warning border-warning/30", label: "Pendente" },
     approved: { color: "bg-success/10 text-success border-success/30", label: "Aprovado" },
     rejected: { color: "bg-destructive/10 text-destructive border-destructive/30", label: "Rejeitado" },
   };
   const { color, label } = config[status] || { color: "bg-muted", label: status };
   return <Badge className={`${color} border`}>{label}</Badge>;
 };
 
 const PriorityBadge = ({ priority }: { priority: string }) => {
   const config: Record<string, { color: string, label: string }> = {
     low: { color: "bg-muted text-muted-foreground", label: "Baixa" },
     medium: { color: "bg-primary/10 text-primary", label: "Média" },
     high: { color: "bg-warning/10 text-warning", label: "Alta" },
     urgent: { color: "bg-destructive/10 text-destructive", label: "Urgente" },
   };
   const { color, label } = config[priority] || { color: "bg-muted", label: priority };
   return <Badge className={color}>{label}</Badge>;
 };
 
 export default function PurchaseRequisitionWorkflow() {
   const [searchTerm, setSearchTerm] = useState("");
   const [filterStatus, setFilterStatus] = useState("all");
   const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
   const [isNewReqOpen, setIsNewReqOpen] = useState(false);
 
   const filteredReqs = mockRequisitions.filter(r => {
     const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesStatus = filterStatus === "all" || r.status === filterStatus;
     return matchesSearch && matchesStatus;
   });
 
   const pendingCount = mockRequisitions.filter(r => r.status === "pending").length;
   const totalValue = mockRequisitions.reduce((sum, r) => sum + r.totalValue, 0);
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />Requisições de Compra</h2>
           <p className="text-muted-foreground">Workflow de aprovação com verificação de orçamento</p>
         </div>
         <Dialog open={isNewReqOpen} onOpenChange={setIsNewReqOpen}>
           <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Requisição</Button></DialogTrigger>
           <DialogContent className="max-w-2xl">
             <DialogHeader><DialogTitle>Nova Requisição de Compra</DialogTitle></DialogHeader>
             <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2 space-y-2"><Label>Título</Label><Input placeholder="Descrição da requisição..." /></div>
               <div className="space-y-2"><Label>Categoria</Label><Select><SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger><SelectContent><SelectItem value="parts">Peças</SelectItem><SelectItem value="provisions">Provisões</SelectItem></SelectContent></Select></div>
               <div className="space-y-2"><Label>Prioridade</Label><Select><SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="high">Alta</SelectItem></SelectContent></Select></div>
               <div className="col-span-2 space-y-2"><Label>Descrição</Label><Textarea placeholder="Detalhes..." /></div>
             </div>
             <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setIsNewReqOpen(false)}>Cancelar</Button><Button onClick={() => setIsNewReqOpen(false)}>Criar</Button></div>
           </DialogContent>
         </Dialog>
       </div>
 
       <div className="grid grid-cols-4 gap-4">
         <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div><div><p className="text-2xl font-bold">{pendingCount}</p><p className="text-xs text-muted-foreground">Aguardando Aprovação</p></div></CardContent></Card>
         <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" /></div><div><p className="text-2xl font-bold">{mockRequisitions.filter(r => r.status === "approved").length}</p><p className="text-xs text-muted-foreground">Aprovadas</p></div></CardContent></Card>
         <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">R$ {(totalValue / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Valor Total</p></div></CardContent></Card>
         <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-muted"><FileText className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-2xl font-bold">{mockRequisitions.length}</p><p className="text-xs text-muted-foreground">Total</p></div></CardContent></Card>
       </div>
 
       <div className="flex gap-4">
         <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar requisição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
         <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pending">Pendente</SelectItem><SelectItem value="approved">Aprovado</SelectItem></SelectContent></Select>
       </div>
 
       <div className="grid grid-cols-3 gap-6">
         <div className="col-span-2">
           <ScrollArea className="h-[600px]">
             <div className="space-y-4">
               {filteredReqs.map((req) => (
                 <Card key={req.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedRequisition?.id === req.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedRequisition(req)}>
                   <CardContent className="p-4">
                     <div className="flex items-start justify-between mb-3">
                       <div>
                         <div className="flex items-center gap-2 mb-1"><span className="font-mono text-sm text-muted-foreground">{req.requisitionNumber}</span><StatusBadge status={req.status} /><PriorityBadge priority={req.priority} /></div>
                         <p className="font-semibold">{req.title}</p>
                       </div>
                       <div className="text-right"><p className="font-bold">R$ {req.totalValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">{req.items.length} itens</p></div>
                     </div>
                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <span className="flex items-center gap-1"><User className="h-3 w-3" />{req.requester}</span>
                       {req.vessel && <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{req.vessel}</span>}
                       <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(req.dueDate).toLocaleDateString("pt-BR")}</span>
                     </div>
                     {req.budgetCheck !== "pending" && <div className={`mt-3 p-2 rounded-lg text-xs flex items-center gap-2 ${req.budgetCheck === "within" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{req.budgetCheck === "within" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}{req.budgetCheck === "within" ? "Dentro do orçamento" : "Acima do orçamento"}</div>}
                     {req.approvalHistory.length > 0 && <div className="mt-3 flex items-center gap-1">{req.approvalHistory.map((step, index) => (<React.Fragment key={index}><div className={`h-6 w-6 rounded-full flex items-center justify-center ${step.status === "approved" ? "bg-success text-success-foreground" : step.status === "pending" ? "bg-warning text-warning-foreground" : "bg-muted"}`}>{step.status === "approved" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}</div>{index < req.approvalHistory.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}</React.Fragment>))}</div>}
                   </CardContent>
                 </Card>
               ))}
             </div>
           </ScrollArea>
         </div>
         <div>
           {selectedRequisition ? (
             <Card>
               <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">{selectedRequisition.requisitionNumber}</CardTitle><StatusBadge status={selectedRequisition.status} /></div><CardDescription>{selectedRequisition.title}</CardDescription></CardHeader>
               <CardContent className="space-y-4">
                 <div><p className="text-sm font-medium mb-2">Itens</p><div className="space-y-2">{selectedRequisition.items.map((item) => <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"><span>{item.name}</span><span className="font-medium">{item.quantity} {item.unit}</span></div>)}</div></div>
                 <div><p className="text-sm font-medium mb-2">Fluxo de Aprovação</p><div className="space-y-2">{selectedRequisition.approvalHistory.map((step, index) => <div key={index} className="flex items-center gap-3 p-2 border rounded-lg"><div className={`h-8 w-8 rounded-full flex items-center justify-center ${step.status === "approved" ? "bg-success/10" : "bg-warning/10"}`}>{step.status === "approved" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-warning" />}</div><div className="flex-1"><p className="text-sm font-medium">{step.approver}</p><p className="text-xs text-muted-foreground">{step.role}</p></div>{step.date && <span className="text-xs text-muted-foreground">{step.date}</span>}</div>)}</div></div>
                 {selectedRequisition.status === "pending" && <div className="flex gap-2"><Button className="flex-1 bg-success hover:bg-success/90"><CheckCircle2 className="h-4 w-4 mr-2" />Aprovar</Button><Button variant="destructive" className="flex-1"><XCircle className="h-4 w-4 mr-2" />Rejeitar</Button></div>}
               </CardContent>
             </Card>
           ) : <Card><CardContent className="p-8 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Selecione uma requisição</p></CardContent></Card>}
         </div>
       </div>
     </div>
   );
 }