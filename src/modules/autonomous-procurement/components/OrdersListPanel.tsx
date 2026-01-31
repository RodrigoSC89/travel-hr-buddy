/**
 * OrdersListPanel - CRUD completo para pedidos de compra
 * Substitui placeholder "Em desenvolvimento"
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, Plus, Search, Filter, Edit, Trash2, 
  CheckCircle, Clock, Send, Eye, RefreshCw, Download, Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PurchaseOrder {
  id: string;
  order_number: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "submitted" | "approved" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  currency: string;
  supplier_id: string;
  supplier_name: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  submitted: { label: "Enviado", color: "bg-blue-500/20 text-blue-500" },
  approved: { label: "Aprovado", color: "bg-green-500/20 text-green-500" },
  shipped: { label: "Enviado", color: "bg-purple-500/20 text-purple-500" },
  delivered: { label: "Entregue", color: "bg-success/20 text-success" },
  cancelled: { label: "Cancelado", color: "bg-destructive/20 text-destructive" },
};

export default function OrdersListPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "spare_parts",
    total_amount: 0,
    currency: "BRL",
    supplier_name: ""
  });

  // Fetch orders
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []).map((item: any) => ({
        id: item.id,
        order_number: item.rfq_number || `PO-${item.id.slice(0, 8)}`,
        title: item.title,
        description: item.description || "",
        category: item.category,
        status: item.status || "draft",
        total_amount: item.budget_estimate || 0,
        currency: item.currency || "BRL",
        supplier_id: item.supplier_id || "",
        supplier_name: item.supplier_name || "Fornecedor não definido",
        created_at: item.created_at,
        updated_at: item.updated_at
      })) as PurchaseOrder[];
    }
  });

  // Create order mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("rfq_requests" as any).insert({
        rfq_number: `PO-${Date.now()}`,
        title: data.title,
        description: data.description,
        category: data.category,
        budget_estimate: data.total_amount,
        currency: data.currency,
        supplier_name: data.supplier_name,
        status: "draft"
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({ title: "✅ Pedido criado", description: "Pedido de compra registrado com sucesso" });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Erro ao criar pedido", description: String(error), variant: "destructive" });
    }
  });

  // Update order mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof formData) => {
      const { error } = await supabase.from("rfq_requests" as any)
        .update({
          title: data.title,
          description: data.description,
          category: data.category,
          budget_estimate: data.total_amount,
          supplier_name: data.supplier_name
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({ title: "✅ Pedido atualizado" });
      setShowEditDialog(false);
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar", description: String(error), variant: "destructive" });
    }
  });

  // Delete order mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rfq_requests" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({ title: "🗑️ Pedido removido" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover", description: String(error), variant: "destructive" });
    }
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("rfq_requests" as any)
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({ title: "✅ Status atualizado" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "spare_parts",
      total_amount: 0,
      currency: "BRL",
      supplier_name: ""
    });
  };

  const handleEdit = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setFormData({
      title: order.title,
      description: order.description,
      category: order.category,
      total_amount: order.total_amount,
      currency: order.currency,
      supplier_name: order.supplier_name
    });
    setShowEditDialog(true);
  };

  const handleSubmitOrder = async (id: string) => {
    await statusMutation.mutateAsync({ id, status: "submitted" });
    toast({ title: "📤 Pedido enviado", description: "Aguardando aprovação" });
  };

  const handleApproveOrder = async (id: string) => {
    await statusMutation.mutateAsync({ id, status: "approved" });
  };

  const handleExport = useCallback(() => {
    const csv = orders.map(o => 
      `${o.order_number},${o.title},${o.status},${o.total_amount},${o.supplier_name}`
    ).join("\n");
    const blob = new Blob([`Número,Título,Status,Valor,Fornecedor\n${csv}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast({ title: "📥 Exportado", description: `${orders.length} pedidos exportados` });
  }, [orders, toast]);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pedidos de Compra
            <Badge variant="secondary">{orders.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Novo Pedido
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="submitted">Enviado</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="shipped">Em Trânsito</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Nenhum pedido corresponde à sua busca" : "Crie seu primeiro pedido de compra"}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Pedido
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{order.order_number}</span>
                    <Badge className={statusConfig[order.status]?.color || "bg-muted"}>
                      {statusConfig[order.status]?.label || order.status}
                    </Badge>
                  </div>
                  <span className="font-bold">
                    {order.currency} {order.total_amount.toLocaleString()}
                  </span>
                </div>
                
                <h4 className="font-medium">{order.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {order.supplier_name} • {order.category}
                </p>

                <div className="flex gap-2 justify-end">
                  {order.status === "draft" && (
                    <Button size="sm" variant="outline" onClick={() => handleSubmitOrder(order.id)}>
                      <Send className="h-4 w-4 mr-1" />
                      Enviar
                    </Button>
                  )}
                  {order.status === "submitted" && (
                    <Button size="sm" variant="outline" onClick={() => handleApproveOrder(order.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(order)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(order.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Pedido de Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Peças para motor principal"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalhes do pedido..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spare_parts">Peças</SelectItem>
                    <SelectItem value="provisions">Provisões</SelectItem>
                    <SelectItem value="safety">Segurança</SelectItem>
                    <SelectItem value="lubricants">Lubrificantes</SelectItem>
                    <SelectItem value="services">Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor Estimado</Label>
                <Input 
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_amount: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Input 
                value={formData.supplier_name}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                placeholder="Nome do fornecedor"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.title || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Valor</Label>
              <Input 
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button 
              onClick={() => selectedOrder && updateMutation.mutate({ id: selectedOrder.id, ...formData })}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
