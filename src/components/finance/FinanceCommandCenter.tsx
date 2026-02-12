/**
 * Finance Command Center - PATCH 853
 * Full financial management with invoices, expenses, and payroll
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Users,
  Ship,
  Download,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Ban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2024-001",
    type: "receivable",
    description: "Charter Party - Atlantic Star",
    vendor: "Ocean Shipping Ltd",
    vesselId: "v-001",
    vesselName: "MV Atlantic Star",
    amount: 150000,
    currency: "USD",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    status: "paid",
    category: "Charter",
    notes: "Charter fee for January 2024",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-02-10T14:00:00Z",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2024-002",
    type: "payable",
    description: "Fuel Supply - Santos Port",
    vendor: "Petrobras Distribuidora",
    vesselId: "v-001",
    vesselName: "MV Atlantic Star",
    amount: 85000,
    currency: "USD",
    issueDate: "2024-02-01",
    dueDate: "2024-03-01",
    status: "sent",
    category: "Fuel",
    notes: "Bunker supply - 500 tons IFO380",
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2024-02-01T08:00:00Z",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2024-003",
    type: "payable",
    description: "Maintenance - Engine Overhaul",
    vendor: "Maritime Tech Services",
    vesselId: "v-002",
    vesselName: "MV Pacific Voyager",
    amount: 45000,
    currency: "USD",
    issueDate: "2024-02-10",
    dueDate: "2024-02-25",
    status: "overdue",
    category: "Maintenance",
    notes: "Main engine overhaul and parts",
    createdAt: "2024-02-10T11:00:00Z",
    updatedAt: "2024-02-26T09:00:00Z",
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-001",
    description: "Port Fees - Rotterdam",
    category: "Port Charges",
    vesselId: "v-001",
    vesselName: "MV Atlantic Star",
    amount: 12500,
    currency: "EUR",
    date: "2024-02-15",
    paymentMethod: "Bank Transfer",
    status: "approved",
    submittedBy: "Carlos Silva",
    approvedBy: "João Santos",
    notes: "Berthing and pilotage fees",
    createdAt: "2024-02-15T14:00:00Z",
  },
  {
    id: "exp-002",
    description: "Crew Supplies",
    category: "Provisions",
    vesselId: "v-001",
    vesselName: "MV Atlantic Star",
    amount: 3200,
    currency: "USD",
    date: "2024-02-18",
    paymentMethod: "Corporate Card",
    status: "pending",
    submittedBy: "Maria Santos",
    notes: "Monthly provisions for crew",
    createdAt: "2024-02-18T09:00:00Z",
  },
  {
    id: "exp-003",
    description: "Safety Equipment",
    category: "Equipment",
    vesselId: "v-002",
    vesselName: "MV Pacific Voyager",
    amount: 8500,
    currency: "USD",
    date: "2024-02-20",
    paymentMethod: "Purchase Order",
    status: "pending",
    submittedBy: "Roberto Ferreira",
    notes: "Life rafts and fire extinguishers",
    createdAt: "2024-02-20T11:00:00Z",
  },
];

const EXPENSE_CATEGORIES = [
  "Port Charges",
  "Fuel",
  "Provisions",
  "Maintenance",
  "Equipment",
  "Crew Wages",
  "Insurance",
  "Certifications",
  "Communications",
  "Travel",
  "Other",
];

const INVOICE_CATEGORIES = [
  "Charter",
  "Freight",
  "Demurrage",
  "Fuel",
  "Maintenance",
  "Port Services",
  "Crew Management",
  "Insurance",
  "Certifications",
  "Other",
];

export function FinanceCommandCenter() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [invoiceForm, setInvoiceForm] = useState({
    type: "payable" as "receivable" | "payable",
    description: "",
    vendor: "",
    vesselName: "",
    amount: "",
    currency: "USD",
    issueDate: "",
    dueDate: "",
    category: "",
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    category: "",
    vesselName: "",
    amount: "",
    currency: "USD",
    date: "",
    paymentMethod: "",
    notes: "",
  });

  const financialStats = useMemo(() => {
    const totalReceivable = invoices
      .filter((i) => i.type === "receivable" && i.status !== "cancelled")
      .reduce((sum, i) => sum + i.amount, 0);
    const totalPayable = invoices
      .filter((i) => i.type === "payable" && i.status !== "cancelled")
      .reduce((sum, i) => sum + i.amount, 0);
    const pendingExpenses = expenses
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + e.amount, 0);
    const approvedExpenses = expenses
      .filter((e) => e.status === "approved")
      .reduce((sum, e) => sum + e.amount, 0);
    const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;

    return {
      totalReceivable,
      totalPayable,
      netPosition: totalReceivable - totalPayable,
      pendingExpenses,
      approvedExpenses,
      overdueInvoices,
    };
  }, [invoices, expenses]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || exp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [expenses, searchTerm, statusFilter]);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      type: "payable",
      description: "",
      vendor: "",
      vesselName: "",
      amount: "",
      currency: "USD",
      issueDate: "",
      dueDate: "",
      category: "",
      notes: "",
    });
    setEditingInvoice(null);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: "",
      category: "",
      vesselName: "",
      amount: "",
      currency: "USD",
      date: "",
      paymentMethod: "",
      notes: "",
    });
    setEditingExpense(null);
  };

  const handleSaveInvoice = () => {
    if (!invoiceForm.description || !invoiceForm.amount || !invoiceForm.dueDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const now = new Date().toISOString();

    if (editingInvoice) {
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === editingInvoice.id
            ? {
                ...i,
                ...invoiceForm,
                amount: parseFloat(invoiceForm.amount),
                updatedAt: now,
              }
            : i
        )
      );
      toast.success("Fatura atualizada");
    } else {
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, "0")}`,
        type: invoiceForm.type,
        description: invoiceForm.description,
        vendor: invoiceForm.vendor,
        vesselName: invoiceForm.vesselName,
        amount: parseFloat(invoiceForm.amount),
        currency: invoiceForm.currency,
        issueDate: invoiceForm.issueDate || new Date().toISOString().split("T")[0],
        dueDate: invoiceForm.dueDate,
        status: "draft",
        category: invoiceForm.category,
        notes: invoiceForm.notes,
        createdAt: now,
        updatedAt: now,
      };
      setInvoices((prev) => [...prev, newInvoice]);
      toast.success("Fatura criada");
    }

    setIsInvoiceFormOpen(false);
    resetInvoiceForm();
  };

  const handleSaveExpense = () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const now = new Date().toISOString();

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id
            ? {
                ...e,
                ...expenseForm,
                amount: parseFloat(expenseForm.amount),
              }
            : e
        )
      );
      toast.success("Despesa atualizada");
    } else {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        description: expenseForm.description,
        category: expenseForm.category,
        vesselName: expenseForm.vesselName,
        amount: parseFloat(expenseForm.amount),
        currency: expenseForm.currency,
        date: expenseForm.date,
        paymentMethod: expenseForm.paymentMethod,
        status: "pending",
        submittedBy: "Current User",
        notes: expenseForm.notes,
        createdAt: now,
      };
      setExpenses((prev) => [...prev, newExpense]);
      toast.success("Despesa registrada");
    }

    setIsExpenseFormOpen(false);
    resetExpenseForm();
  };

  const handleInvoiceStatusChange = (id: string, newStatus: Invoice["status"]) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: newStatus, updatedAt: new Date().toISOString() }
          : i
      )
    );
    toast.success(`Status atualizado para ${newStatus}`);
  };

  const handleExpenseStatusChange = (id: string, newStatus: Expense["status"]) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: newStatus,
              approvedBy: newStatus === "approved" ? "Current User" : e.approvedBy,
            }
          : e
      )
    );
    toast.success(`Despesa ${newStatus === "approved" ? "aprovada" : "rejeitada"}`);
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta fatura?")) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      toast.success("Fatura removida");
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta despesa?")) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Despesa removida");
    }
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
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getExpenseStatusBadge = (status: Expense["status"]) => {
    const config = {
      pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
      approved: { label: "Aprovada", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Rejeitada", variant: "destructive" as const, icon: Ban },
      reimbursed: { label: "Reembolsada", variant: "outline" as const, icon: CreditCard },
    };
    const { label, variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
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
          <p className="text-muted-foreground">
            Gestão de faturas, despesas e fluxo de caixa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            onClick={() => {
              if (activeTab === "invoices") {
                resetInvoiceForm();
                setIsInvoiceFormOpen(true);
              } else {
                resetExpenseForm();
                setIsExpenseFormOpen(true);
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === "invoices" ? "Nova Fatura" : "Nova Despesa"}
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">A Receber</span>
            </div>
            <div className="text-xl font-bold text-success mt-1">
              {formatCurrency(financialStats.totalReceivable)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">A Pagar</span>
            </div>
            <div className="text-xl font-bold text-destructive mt-1">
              {formatCurrency(financialStats.totalPayable)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-info" />
              <span className="text-sm text-muted-foreground">Posição Líquida</span>
            </div>
            <div
              className={`text-xl font-bold mt-1 ${
                financialStats.netPosition >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {formatCurrency(financialStats.netPosition)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">Despesas Pendentes</span>
            </div>
            <div className="text-xl font-bold text-warning mt-1">
              {formatCurrency(financialStats.pendingExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">Despesas Aprovadas</span>
            </div>
            <div className="text-xl font-bold mt-1">
              {formatCurrency(financialStats.approvedExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Faturas Vencidas</span>
            </div>
            <div className="text-xl font-bold text-destructive mt-1">
              {financialStats.overdueInvoices}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="invoices" className="gap-2">
              <Receipt className="h-4 w-4" />
              Faturas ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Despesas ({expenses.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[250px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {activeTab === "invoices" ? (
                  <>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="paid">Paga</SelectItem>
                    <SelectItem value="overdue">Vencida</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovada</SelectItem>
                    <SelectItem value="rejected">Rejeitada</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <ScrollArea className="h-[450px]">
                <div className="space-y-3">
                  {filteredInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        inv.status === "overdue"
                          ? "border-destructive/50 bg-destructive/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            inv.type === "receivable"
                              ? "bg-success/10"
                              : "bg-destructive/10"
                          }`}
                        >
                          {inv.type === "receivable" ? (
                            <TrendingUp className="h-5 w-5 text-success" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{inv.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {inv.invoiceNumber} • {inv.vendor}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Vencimento: {new Date(inv.dueDate).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              inv.type === "receivable"
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {inv.type === "receivable" ? "+" : "-"}
                            {formatCurrency(inv.amount, inv.currency)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {inv.category}
                          </div>
                        </div>
                        {getInvoiceStatusBadge(inv.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingInvoice(inv);
                                setInvoiceForm({
                                  type: inv.type,
                                  description: inv.description,
                                  vendor: inv.vendor,
                                  vesselName: inv.vesselName || "",
                                  amount: inv.amount.toString(),
                                  currency: inv.currency,
                                  issueDate: inv.issueDate,
                                  dueDate: inv.dueDate,
                                  category: inv.category,
                                  notes: inv.notes,
                                });
                                setIsInvoiceFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {inv.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() => handleInvoiceStatusChange(inv.id, "sent")}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Enviar
                              </DropdownMenuItem>
                            )}
                            {inv.status === "sent" && (
                              <DropdownMenuItem
                                onClick={() => handleInvoiceStatusChange(inv.id, "paid")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar como Paga
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteInvoice(inv.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {filteredInvoices.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma fatura encontrada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <ScrollArea className="h-[450px]">
                <div className="space-y-3">
                  {filteredExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{exp.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {exp.category} • {exp.vesselName || "Geral"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {exp.submittedBy}
                            {exp.approvedBy && ` → ${exp.approvedBy}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(exp.amount, exp.currency)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(exp.date).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        {getExpenseStatusBadge(exp.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingExpense(exp);
                                setExpenseForm({
                                  description: exp.description,
                                  category: exp.category,
                                  vesselName: exp.vesselName || "",
                                  amount: exp.amount.toString(),
                                  currency: exp.currency,
                                  date: exp.date,
                                  paymentMethod: exp.paymentMethod,
                                  notes: exp.notes,
                                });
                                setIsExpenseFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {exp.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleExpenseStatusChange(exp.id, "approved")
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprovar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleExpenseStatusChange(exp.id, "rejected")
                                  }
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Rejeitar
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteExpense(exp.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {filteredExpenses.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma despesa encontrada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Form Dialog */}
      <Dialog open={isInvoiceFormOpen} onOpenChange={setIsInvoiceFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Editar Fatura" : "Nova Fatura"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Tipo *</Label>
              <Select
                value={invoiceForm.type}
                onValueChange={(v) =>
                  setInvoiceForm((prev) => ({
                    ...prev,
                    type: v as "receivable" | "payable",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receivable">A Receber</SelectItem>
                  <SelectItem value="payable">A Pagar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição *</Label>
              <Input
                value={invoiceForm.description}
                onChange={(e) =>
                  setInvoiceForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descrição da fatura"
              />
            </div>
            <div>
              <Label>Fornecedor/Cliente</Label>
              <Input
                value={invoiceForm.vendor}
                onChange={(e) =>
                  setInvoiceForm((prev) => ({ ...prev, vendor: e.target.value }))
                }
                placeholder="Nome do fornecedor ou cliente"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Moeda</Label>
                <Select
                  value={invoiceForm.currency}
                  onValueChange={(v) =>
                    setInvoiceForm((prev) => ({ ...prev, currency: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Emissão</Label>
                <Input
                  type="date"
                  value={invoiceForm.issueDate}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({ ...prev, issueDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Data de Vencimento *</Label>
                <Input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) =>
                    setInvoiceForm((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={invoiceForm.category}
                onValueChange={(v) =>
                  setInvoiceForm((prev) => ({ ...prev, category: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={invoiceForm.notes}
                onChange={(e) =>
                  setInvoiceForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Observações..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsInvoiceFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveInvoice}>
              {editingInvoice ? "Salvar" : "Criar Fatura"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Form Dialog */}
      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Editar Despesa" : "Nova Despesa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Descrição *</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descrição da despesa"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={expenseForm.category}
                onValueChange={(v) =>
                  setExpenseForm((prev) => ({ ...prev, category: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Moeda</Label>
                <Select
                  value={expenseForm.currency}
                  onValueChange={(v) =>
                    setExpenseForm((prev) => ({ ...prev, currency: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Data *</Label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Método de Pagamento</Label>
              <Select
                value={expenseForm.paymentMethod}
                onValueChange={(v) =>
                  setExpenseForm((prev) => ({ ...prev, paymentMethod: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Transferência Bancária</SelectItem>
                  <SelectItem value="Corporate Card">Cartão Corporativo</SelectItem>
                  <SelectItem value="Purchase Order">Ordem de Compra</SelectItem>
                  <SelectItem value="Cash">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={expenseForm.notes}
                onChange={(e) =>
                  setExpenseForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Observações..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsExpenseFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveExpense}>
              {editingExpense ? "Salvar" : "Registrar Despesa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FinanceCommandCenter;
