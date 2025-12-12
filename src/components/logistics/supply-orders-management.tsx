import { useEffect, useState, useCallback } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface SupplyOrder {
  id: string;
  order_number: string;
  item_id: string | null;
  quantity: number;
  status: string;
  priority: string;
  supplier: string | null;
  delivery_address: string | null;
  estimated_delivery_date: string | null;
  notes: string | null;
  created_at: string;
  logistics_inventory?: {
    item_name: string;
    item_code: string;
  } | null;
}

export const SupplyOrdersManagement = memo(() => {
  const [orders, setOrders] = useState<SupplyOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrder, setNewOrder] = useState({
    item_id: "",
    quantity: "",
    priority: "medium",
    supplier: "",
    delivery_address: "",
    estimated_delivery_date: "",
    notes: ""
  };
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchInventoryItems();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("logistics_supply_orders")
      .select(`
        *,
        logistics_inventory (
          item_name,
          item_code
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar ordens", variant: "destructive" });
      return;
    }

    setOrders(data || []);
  };

  const fetchInventoryItems = async () => {
    const { data } = await supabase
      .from("logistics_inventory")
      .select("*")
      .order("item_name");
    
    setInventoryItems(data || []);
  };

  const createOrder = async () => {
    const orgId = await getCurrentOrgId();
    if (!orgId) return;

    const orderNumber = `SO-${Date.now()}`;
    const { error } = await supabase
      .from("logistics_supply_orders")
      .insert({
        organization_id: orgId,
        order_number: orderNumber,
        ...newOrder,
        quantity: parseInt(newOrder.quantity)
      };

    if (error) {
      toast({ title: "Erro ao criar ordem", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Ordem criada com sucesso!" });
    setIsCreating(false);
    setNewOrder({
      item_id: "",
      quantity: "",
      priority: "medium",
      supplier: "",
      delivery_address: "",
      estimated_delivery_date: "",
      notes: ""
    });
    fetchOrders();
  };

  const updateOrderStatus = async (orderId: string, status: string, failureReason?: string) => {
    const updates: unknown = { status };
    if (status === "delivered") {
      updates.actual_delivery_date = new Date().toISOString().split("T")[0];
    }
    if (failureReason) {
      updates.failure_reason = failureReason;
    }

    const { error } = await supabase
      .from("logistics_supply_orders")
      .update(updates)
      .eq("id", orderId);

    if (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
      return;
    }

    toast({ title: `Status atualizado: ${status}` });
    fetchOrders();
  };

  const getCurrentOrgId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("organization_users")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    return data?.organization_id;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      approved: "bg-blue-500",
      in_transit: "bg-purple-500",
      delivered: "bg-green-500",
      failed: "bg-red-500",
      cancelled: "bg-gray-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgent" || priority === "high") {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    };
    return <Package className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ordens de Suprimentos</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Ordem de Suprimento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Item</Label>
                <Select value={newOrder.item_id} onValueChange={(v) => setNewOrder({...newOrder, item_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.item_name} ({item.item_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={newOrder.quantity}
                    onChange={handleChange})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Prioridade</Label>
                  <Select value={newOrder.priority} onValueChange={(v) => setNewOrder({...newOrder, priority: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Fornecedor</Label>
                <Input
                  value={newOrder.supplier}
                  onChange={handleChange})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Endereço de Entrega</Label>
                <Input
                  value={newOrder.delivery_address}
                  onChange={handleChange})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data Estimada de Entrega</Label>
                <Input
                  type="date"
                  value={newOrder.estimated_delivery_date}
                  onChange={handleChange})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Notas</Label>
                <Textarea
                  value={newOrder.notes}
                  onChange={handleChange})}
                />
              </div>
            </div>
            <Button onClick={createOrder} className="w-full">Criar Ordem</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(order.priority)}
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.logistics_inventory?.item_name} - {order.quantity} unidades
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Fornecedor</p>
                  <p className="font-medium">{order.supplier}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prioridade</p>
                  <p className="font-medium capitalize">{order.priority}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entrega Estimada</p>
                  <p className="font-medium">
                    {order.estimated_delivery_date ? format(new Date(order.estimated_delivery_date), "dd/MM/yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Criado em</p>
                  <p className="font-medium">{format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}</p>
                </div>
              </div>
              {order.notes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                {order.status === "pending" && (
                  <Button size="sm" onClick={() => handleupdateOrderStatus}>
                    Aprovar
                  </Button>
                )}
                {order.status === "approved" && (
                  <Button size="sm" onClick={() => handleupdateOrderStatus}>
                    Em Trânsito
                  </Button>
                )}
                {order.status === "in_transit" && (
                  <>
                    <Button size="sm" onClick={() => handleupdateOrderStatus}>
                      Marcar como Entregue
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt("Motivo da falha:");
                        if (reason) updateOrderStatus(order.id, "failed", reason);
                      }}
                    >
                      Falha na Entrega
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});
