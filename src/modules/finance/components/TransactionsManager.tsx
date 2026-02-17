/**
 * Transactions Manager - Complete Financial CRUD
 * Full transaction management with AI categorization
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Brain,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  transaction_type: "income" | "expense" | "transfer";
  category: string;
  subcategory?: string;
  transaction_date: string;
  due_date?: string;
  status: "pending" | "completed" | "cancelled" | "overdue";
  payment_method?: string;
  reference_number?: string;
  vessel_id?: string;
  vessel_name?: string;
  supplier_id?: string;
  supplier_name?: string;
  notes?: string;
  attachments?: string[];
  created_at: string;
  tags?: string[];
}

const CATEGORIES = {
  income: ["Charter", "Freight", "Service", "Other Income"],
  expense: ["Fuel", "Maintenance", "Crew", "Port Fees", "Insurance", "Supplies", "Administrative", "Other Expense"],
};

const PAYMENT_METHODS = ["Wire Transfer", "Credit Card", "Cash", "Check", "Letter of Credit"];

export default function TransactionsManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    transaction_type: "expense",
    category: "",
    transaction_date: format(new Date(), "yyyy-MM-dd"),
    due_date: "",
    status: "pending",
    payment_method: "",
    reference_number: "",
    notes: "",
  });

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["financial-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select(`
          *,
          vessels:vessel_id (name)
        `)
        .order("transaction_date", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []).map((t) => ({
        ...t,
        vessel_name: (t.vessels as unknown as Record<string, string> | null)?.name,
      })) as unknown as Transaction[];
    },
    staleTime: 1000 * 60,
  });

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Transaction>) => {
      const { error } = await supabase.from("financial_transactions").insert([{
        description: data.description || "",
        amount: data.amount || 0,
        category: data.category || "",
        transaction_date: data.transaction_date || new Date().toISOString(),
        type: data.transaction_type || "expense",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      toast.success("Transação criada com sucesso");
      setShowAddDialog(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao criar transação"),
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
      const updateData: Record<string, unknown> = {};
      if (data.description !== undefined) updateData.description = data.description;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.transaction_type !== undefined) updateData.transaction_type = data.transaction_type;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.transaction_date !== undefined) updateData.transaction_date = data.transaction_date;
      if (data.status !== undefined) updateData.status = data.status;
      
      const { error } = await supabase
        .from("financial_transactions")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      toast.success("Transação atualizada");
      setShowEditDialog(false);
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("financial_transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      toast.success("Transação excluída");
      setShowDeleteDialog(false);
      setSelectedTransaction(null);
    },
    onError: () => toast.error("Erro ao excluir"),
  });

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      transaction_type: "expense",
      category: "",
      transaction_date: format(new Date(), "yyyy-MM-dd"),
      due_date: "",
      status: "pending",
      payment_method: "",
      reference_number: "",
      notes: "",
    });
  };

  const filteredTransactions = transactions.filter((t: Transaction) => {
    const matchesSearch = t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || t.transaction_type === typeFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totals = {
    income: transactions.filter((t: Transaction) => t.transaction_type === "income").reduce((acc: number, t: Transaction) => acc + (t.amount || 0), 0),
    expense: transactions.filter((t: Transaction) => t.transaction_type === "expense").reduce((acc: number, t: Transaction) => acc + (t.amount || 0), 0),
    pending: transactions.filter((t: Transaction) => t.status === "pending").length,
    overdue: transactions.filter((t: Transaction) => t.status === "overdue").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/20 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Concluída</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/20 text-destructive"><AlertTriangle className="h-3 w-3 mr-1" />Vencida</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreate = () => {
    createMutation.mutate({
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      transaction_type: formData.transaction_type as Transaction["transaction_type"],
      category: formData.category,
      transaction_date: formData.transaction_date,
      due_date: formData.due_date || undefined,
      status: formData.status as Transaction["status"],
      payment_method: formData.payment_method,
      reference_number: formData.reference_number,
      notes: formData.notes,
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      description: transaction.description || "",
      amount: transaction.amount?.toString() || "",
      transaction_type: transaction.transaction_type || "expense",
      category: transaction.category || "",
      transaction_date: transaction.transaction_date || "",
      due_date: transaction.due_date || "",
      status: transaction.status || "pending",
      payment_method: transaction.payment_method || "",
      reference_number: transaction.reference_number || "",
      notes: transaction.notes || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedTransaction) return;
    updateMutation.mutate({
      id: selectedTransaction.id,
      data: {
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        transaction_type: formData.transaction_type as "income" | "expense" | "transfer",
        category: formData.category,
        transaction_date: formData.transaction_date,
        due_date: formData.due_date || undefined,
        status: formData.status as "pending" | "completed" | "cancelled" | "overdue",
        payment_method: formData.payment_method || undefined,
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined,
      },
    });
  };

  const handleExport = () => {
    const data = filteredTransactions || [];
    if (data.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }
    const csvRows = [
      "Data;Descrição;Tipo;Categoria;Valor;Status;Método Pagamento",
      ...data.map((t: Transaction) =>
        `${t.transaction_date};${t.description};${t.transaction_type};${t.category};${t.amount};${t.status};${t.payment_method || ""}`
      )
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transações exportadas com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Receitas</p>
                <p className="text-2xl font-bold text-success">
                  R$ {(totals.income / 1000).toFixed(0)}K
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Despesas</p>
                <p className="text-2xl font-bold text-destructive">
                  R$ {(totals.expense / 1000).toFixed(0)}K
                </p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-warning">{totals.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-destructive">{totals.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
              <SelectItem value="transfer">Transferências</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="overdue">Vencida</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transações
          </CardTitle>
          <CardDescription>
            {filteredTransactions.length} transações encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhuma transação encontrada</p>
              <p className="text-sm">Crie sua primeira transação</p>
              <Button className="mt-4" onClick={() => { resetForm(); setShowAddDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === filteredTransactions.length}
                        onCheckedChange={(checked) => {
                          setSelectedIds(checked ? filteredTransactions.map((t: Transaction) => t.id) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(transaction.id)}
                          onCheckedChange={(checked) => {
                            setSelectedIds(checked
                              ? [...selectedIds, transaction.id]
                              : selectedIds.filter(id => id !== transaction.id)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(transaction.transaction_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.reference_number && (
                            <p className="text-xs text-muted-foreground">Ref: {transaction.reference_number}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${
                          transaction.transaction_type === "income" ? "text-success" : "text-destructive"
                        }`}>
                          {transaction.transaction_type === "income" ? "+" : "-"}
                          R$ {(transaction.amount || 0).toLocaleString("pt-BR")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Mais opções da transação" title="Mais opções">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowDeleteDialog(true);
                            }}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? "Editar Transação" : "Nova Transação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.transaction_type} onValueChange={(v) => setFormData({ ...formData, transaction_type: v, category: "" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da transação"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(CATEGORIES[formData.transaction_type as keyof typeof CATEGORIES] || []).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data da Transação</Label>
                <Input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="overdue">Vencida</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Referência</Label>
              <Input
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="Número de referência (opcional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionais..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setShowEditDialog(false); }}>
              Cancelar
            </Button>
            <Button onClick={showEditDialog ? handleUpdate : handleCreate}>
              {showEditDialog ? "Salvar Alterações" : "Criar Transação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{selectedTransaction?.description}</p>
            <p className="text-sm text-muted-foreground">
              Valor: R$ {(selectedTransaction?.amount || 0).toLocaleString("pt-BR")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => selectedTransaction && deleteMutation.mutate(selectedTransaction.id)}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
