/**
 * Finance Command Center - Fully integrated with Supabase
 * Real CRUD for invoices and expenses
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  DollarSign, Plus, Search, Edit, Trash2, FileText, Calendar,
  TrendingUp, TrendingDown, CreditCard, Receipt, Users, Ship,
  Download, RefreshCw, MoreHorizontal, CheckCircle, Clock,
  AlertCircle, Send, Ban,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: "receivable" | "payable";
  description: string;
  vendor: string;
  vesselId?: string;
  vesselName?: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  category: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  id: string;
  description: string;
  category: string;
  vesselId?: string;
  vesselName?: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  status: "pending" | "approved" | "rejected" | "reimbursed";
  submittedBy: string;
  approvedBy?: string;
  receipt?: string;
  notes: string;
  createdAt: string;
}

const EXPENSE_CATEGORIES = [
  "Port Charges", "Fuel", "Provisions", "Maintenance", "Equipment",
  "Crew Wages", "Insurance", "Certifications", "Communications", "Travel", "Other",
];

const INVOICE_CATEGORIES = [
  "Charter", "Freight", "Demurrage", "Fuel", "Maintenance",
  "Port Services", "Crew Management", "Insurance", "Certifications", "Other",
];

export function FinanceCommandCenter() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [invoiceForm, setInvoiceForm] = useState({
    type: "payable" as "receivable" | "payable",
    description: "", vendor: "", vesselName: "", amount: "",
    currency: "USD", issueDate: "", dueDate: "", category: "", notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "", category: "", vesselName: "", amount: "",
    currency: "USD", date: "", paymentMethod: "", notes: "",
  });

  // ====== FETCH INVOICES ======
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["finance-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number || "",
        type: (inv.invoice_type === "receivable" ? "receivable" : "payable") as "receivable" | "payable",
        description: inv.description || "",
        vendor: inv.vendor_name || inv.client_name || "",
        vesselName: inv.vessel_name || "",
        amount: Number(inv.total_amount || inv.amount || 0),
        currency: inv.currency || "USD",
        issueDate: inv.issue_date || inv.created_at?.split("T")[0] || "",
        dueDate: inv.due_date || "",
        status: (["draft","sent","paid","overdue","cancelled"].includes(inv.status) ? inv.status : "draft") as Invoice["status"],
        category: inv.category || "",
        notes: inv.notes || "",
        createdAt: inv.created_at || "",
        updatedAt: inv.updated_at || inv.created_at || "",
      }));
    },
    staleTime: 30_000,
  });

  // ====== FETCH EXPENSES ======
  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ["finance-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((exp: any) => ({
        id: exp.id,
        description: exp.description || "",
        category: exp.category || "",
        vesselName: exp.vessel_name || "",
        amount: Number(exp.amount || 0),
        currency: exp.currency || "USD",
        date: exp.expense_date || exp.created_at?.split("T")[0] || "",
        paymentMethod: exp.payment_method || "",
        status: (exp.status || "pending") as Expense["status"],
        submittedBy: exp.submitted_by || "Current User",
        approvedBy: exp.approved_by,
        notes: exp.notes || "",
        createdAt: exp.created_at || "",
      }));
    },
    staleTime: 30_000,
  });

  // ====== MUTATIONS ======
  const saveInvoiceMutation = useMutation({
    mutationFn: async (form: typeof invoiceForm & { id?: string }) => {
      const payload: Record<string, unknown> = {
        description: form.description,
        vendor_name: form.vendor,
        vessel_name: form.vesselName,
        total_amount: parseFloat(form.amount),
        currency: form.currency,
        issue_date: form.issueDate || new Date().toISOString().split("T")[0],
        due_date: form.dueDate,
        category: form.category,
        notes: form.notes,
        invoice_type: form.type,
        status: "draft",
      };
      if (form.id) {
        const { error } = await supabase.from("invoices").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("invoices").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-invoices"] });
      toast.success(editingInvoice ? "Fatura atualizada" : "Fatura criada");
      setIsInvoiceFormOpen(false);
      resetInvoiceForm();
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const saveExpenseMutation = useMutation({
    mutationFn: async (form: typeof expenseForm & { id?: string }) => {
      const payload: any = {
        description: form.description,
        category: form.category,
        vessel_name: form.vesselName,
        amount: parseFloat(form.amount),
        currency: form.currency,
        expense_date: form.date,
        payment_method: form.paymentMethod,
        notes: form.notes,
        status: "pending",
      };
      if (form.id) {
        const { error } = await supabase.from("expenses").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("expenses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-expenses"] });
      toast.success(editingExpense ? "Despesa atualizada" : "Despesa registrada");
      setIsExpenseFormOpen(false);
      resetExpenseForm();
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-invoices"] });
      toast.success("Fatura removida");
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-expenses"] });
      toast.success("Despesa removida");
    },
  });

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- invoice status is dynamic string from DB enum
      const { error } = await supabase.from("invoices").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-invoices"] });
      toast.success("Status atualizado");
    },
  });

  const updateExpenseStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("expenses").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-expenses"] });
      toast.success("Despesa atualizada");
    },
  });

  // ====== COMPUTED ======
  const financialStats = useMemo(() => {
    const totalReceivable = invoices.filter((i) => i.type === "receivable" && i.status !== "cancelled").reduce((sum, i) => sum + i.amount, 0);
    const totalPayable = invoices.filter((i) => i.type === "payable" && i.status !== "cancelled").reduce((sum, i) => sum + i.amount, 0);
    const pendingExpenses = expenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
    const approvedExpenses = expenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + e.amount, 0);
    const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;
    return { totalReceivable, totalPayable, netPosition: totalReceivable - totalPayable, pendingExpenses, approvedExpenses, overdueInvoices };
  }, [invoices, expenses]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch = inv.description.toLowerCase().includes(searchTerm.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || inv.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || exp.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || exp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [expenses, searchTerm, statusFilter]);

  const formatCurrency = (amount: number, currency: string = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const resetInvoiceForm = () => {
    setInvoiceForm({ type: "payable", description: "", vendor: "", vesselName: "", amount: "", currency: "USD", issueDate: "", dueDate: "", category: "", notes: "" });
    setEditingInvoice(null);
  };

  const resetExpenseForm = () => {
    setExpenseForm({ description: "", category: "", vesselName: "", amount: "", currency: "USD", date: "", paymentMethod: "", notes: "" });
    setEditingExpense(null);
  };

  const handleSaveInvoice = () => {
    if (!invoiceForm.description || !invoiceForm.amount || !invoiceForm.dueDate) { toast.error("Preencha os campos obrigatórios"); return; }
    saveInvoiceMutation.mutate({ ...invoiceForm, id: editingInvoice?.id });
  };

  const handleSaveExpense = () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date) { toast.error("Preencha os campos obrigatórios"); return; }
    saveExpenseMutation.mutate({ ...expenseForm, id: editingExpense?.id });
  };

  const getInvoiceStatusBadge = (status: Invoice["status"]) => {
    const config = {
      draft: { label: "Rascunho", variant: "outline" as const, icon: FileText },
      sent: { label: "Enviada", variant: "secondary" as const, icon: Send },
      paid: { label: "Paga", variant: "default" as const, icon: CheckCircle },
      overdue: { label: "Vencida", variant: "destructive" as const, icon: AlertCircle },
      cancelled: { label: "Cancelada", variant: "outline" as const, icon: Ban },
    };
    const { label, variant, icon: Icon } = config[status];
    return <Badge variant={variant} className="gap-1"><Icon className="h-3 w-3" />{label}</Badge>;
  };

  const getExpenseStatusBadge = (status: Expense["status"]) => {
    const config = {
      pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      approved: { label: "Aprovada", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Rejeitada", variant: "destructive" as const, icon: Ban },
      reimbursed: { label: "Reembolsada", variant: "outline" as const, icon: CreditCard },
    };
    const { label, variant, icon: Icon } = config[status];
    return <Badge variant={variant} className="gap-1"><Icon className="h-3 w-3" />{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Centro Financeiro
          </h2>
          <p className="text-muted-foreground">Gestão de faturas, despesas e fluxo de caixa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { queryClient.invalidateQueries({ queryKey: ["finance-invoices"] }); queryClient.invalidateQueries({ queryKey: ["finance-expenses"] }); }}>
            <RefreshCw className="h-4 w-4 mr-2" />Atualizar
          </Button>
          <Button onClick={() => { if (activeTab === "invoices") { resetInvoiceForm(); setIsInvoiceFormOpen(true); } else { resetExpenseForm(); setIsExpenseFormOpen(true); } }}>
            <Plus className="h-4 w-4 mr-2" />{activeTab === "invoices" ? "Nova Fatura" : "Nova Despesa"}
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" /><span className="text-sm text-muted-foreground">A Receber</span></div><div className="text-xl font-bold text-success mt-1">{formatCurrency(financialStats.totalReceivable)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-destructive" /><span className="text-sm text-muted-foreground">A Pagar</span></div><div className="text-xl font-bold text-destructive mt-1">{formatCurrency(financialStats.totalPayable)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /><span className="text-sm text-muted-foreground">Posição Líquida</span></div><div className={`text-xl font-bold mt-1 ${financialStats.netPosition >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(financialStats.netPosition)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-warning" /><span className="text-sm text-muted-foreground">Desp. Pendentes</span></div><div className="text-xl font-bold text-warning mt-1">{formatCurrency(financialStats.pendingExpenses)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /><span className="text-sm text-muted-foreground">Desp. Aprovadas</span></div><div className="text-xl font-bold text-success mt-1">{formatCurrency(financialStats.approvedExpenses)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-destructive" /><span className="text-sm text-muted-foreground">Fat. Vencidas</span></div><div className="text-xl font-bold text-destructive mt-1">{financialStats.overdueInvoices}</div></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="invoices"><Receipt className="h-4 w-4 mr-2" />Faturas</TabsTrigger>
            <TabsTrigger value="expenses"><CreditCard className="h-4 w-4 mr-2" />Despesas</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-60" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="sent">Enviada</SelectItem><SelectItem value="paid">Paga</SelectItem><SelectItem value="overdue">Vencida</SelectItem><SelectItem value="pending">Pendente</SelectItem><SelectItem value="approved">Aprovada</SelectItem></SelectContent></Select>
          </div>
        </div>

        <TabsContent value="invoices" className="space-y-3 mt-4">
          {loadingInvoices ? <p className="text-center text-muted-foreground py-8">Carregando faturas...</p> : filteredInvoices.length === 0 ? <p className="text-center text-muted-foreground py-8">Nenhuma fatura encontrada</p> : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredInvoices.map((inv) => (
                  <Card key={inv.id} className="hover:bg-accent/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-sm text-muted-foreground">{inv.invoiceNumber}</span>
                            {getInvoiceStatusBadge(inv.status)}
                            <Badge variant="outline">{inv.type === "receivable" ? "A Receber" : "A Pagar"}</Badge>
                          </div>
                          <p className="font-medium">{inv.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{inv.vendor}</span>{inv.vesselName && <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{inv.vesselName}</span>}<span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Venc: {inv.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold">{formatCurrency(inv.amount, inv.currency)}</span>
                          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Opções da fatura" title="Opções"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingInvoice(inv); setInvoiceForm({ type: inv.type, description: inv.description, vendor: inv.vendor, vesselName: inv.vesselName || "", amount: String(inv.amount), currency: inv.currency, issueDate: inv.issueDate, dueDate: inv.dueDate, category: inv.category, notes: inv.notes }); setIsInvoiceFormOpen(true); }}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateInvoiceStatusMutation.mutate({ id: inv.id, status: "sent" })}><Send className="h-4 w-4 mr-2" />Marcar Enviada</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateInvoiceStatusMutation.mutate({ id: inv.id, status: "paid" })}><CheckCircle className="h-4 w-4 mr-2" />Marcar Paga</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { if (window.confirm("Remover fatura?")) deleteInvoiceMutation.mutate(inv.id); }}><Trash2 className="h-4 w-4 mr-2" />Remover</DropdownMenuItem>
                          </DropdownMenuContent></DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-3 mt-4">
          {loadingExpenses ? <p className="text-center text-muted-foreground py-8">Carregando despesas...</p> : filteredExpenses.length === 0 ? <p className="text-center text-muted-foreground py-8">Nenhuma despesa encontrada</p> : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredExpenses.map((exp) => (
                  <Card key={exp.id} className="hover:bg-accent/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            {getExpenseStatusBadge(exp.status)}
                            <Badge variant="outline">{exp.category}</Badge>
                          </div>
                          <p className="font-medium">{exp.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Por: {exp.submittedBy}</span>{exp.vesselName && <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{exp.vesselName}</span>}<span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{exp.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold">{formatCurrency(exp.amount, exp.currency)}</span>
                          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Opções da despesa" title="Opções"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingExpense(exp); setExpenseForm({ description: exp.description, category: exp.category, vesselName: exp.vesselName || "", amount: String(exp.amount), currency: exp.currency, date: exp.date, paymentMethod: exp.paymentMethod, notes: exp.notes }); setIsExpenseFormOpen(true); }}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateExpenseStatusMutation.mutate({ id: exp.id, status: "approved" })}><CheckCircle className="h-4 w-4 mr-2" />Aprovar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateExpenseStatusMutation.mutate({ id: exp.id, status: "rejected" })}><Ban className="h-4 w-4 mr-2" />Rejeitar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { if (window.confirm("Remover despesa?")) deleteExpenseMutation.mutate(exp.id); }}><Trash2 className="h-4 w-4 mr-2" />Remover</DropdownMenuItem>
                          </DropdownMenuContent></DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Invoice Form Dialog */}
      <Dialog open={isInvoiceFormOpen} onOpenChange={setIsInvoiceFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingInvoice ? "Editar Fatura" : "Nova Fatura"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tipo</Label><Select value={invoiceForm.type} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, type: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="receivable">A Receber</SelectItem><SelectItem value="payable">A Pagar</SelectItem></SelectContent></Select></div>
              <div><Label>Categoria</Label><Select value={invoiceForm.category} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, category: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{INVOICE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Descrição *</Label><Input value={invoiceForm.description} onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })} /></div>
            <div><Label>Fornecedor/Cliente</Label><Input value={invoiceForm.vendor} onChange={(e) => setInvoiceForm({ ...invoiceForm, vendor: e.target.value })} /></div>
            <div><Label>Embarcação</Label><Input value={invoiceForm.vesselName} onChange={(e) => setInvoiceForm({ ...invoiceForm, vesselName: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Valor *</Label><Input type="number" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} /></div>
              <div><Label>Moeda</Label><Select value={invoiceForm.currency} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="BRL">BRL</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Emissão</Label><Input type="date" value={invoiceForm.issueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })} /></div>
              <div><Label>Vencimento *</Label><Input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} /></div>
            </div>
            <div><Label>Notas</Label><Textarea value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveInvoice} disabled={saveInvoiceMutation.isPending}>{saveInvoiceMutation.isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Form Dialog */}
      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingExpense ? "Editar Despesa" : "Nova Despesa"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Descrição *</Label><Input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Categoria</Label><Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Embarcação</Label><Input value={expenseForm.vesselName} onChange={(e) => setExpenseForm({ ...expenseForm, vesselName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Valor *</Label><Input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></div>
              <div><Label>Moeda</Label><Select value={expenseForm.currency} onValueChange={(v) => setExpenseForm({ ...expenseForm, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="BRL">BRL</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select></div>
              <div><Label>Data *</Label><Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></div>
            </div>
            <div><Label>Forma de Pagamento</Label><Input value={expenseForm.paymentMethod} onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })} /></div>
            <div><Label>Notas</Label><Textarea value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveExpense} disabled={saveExpenseMutation.isPending}>{saveExpenseMutation.isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
