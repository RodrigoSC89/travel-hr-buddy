// @ts-nocheck
/**
 * PATCH 352: Purchase Orders Management
 * Create and track purchase orders with status updates
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingCart,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  FileText
} from "lucide-react";
import { format } from "date-fns";

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: string;
  status: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  total_amount?: number;
  notes?: string;
  created_at: string;
}

interface PurchaseOrderItem {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity: number;
}

export const PurchaseOrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    order_number: `PO-${Date.now()}`,
    supplier: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
    items: [
      { item_name: "", quantity: 1, unit_price: 0 }
    ]
  });

  useEffect(() => {
    loadOrders();
    
    const channel = supabase
      .channel("purchase_orders_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "purchase_orders"
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*")
        .order("order_date", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error loading orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("purchase_order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error: any) {
      console.error("Error loading order items:", error);
    }
  };

  const createOrder = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Calculate total amount
      const totalAmount = formData.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price),
        0
      );

      // Create purchase order
      const { data: orderData, error: orderError } = await supabase
        .from("purchase_orders")
        .insert({
          order_number: formData.order_number,
          supplier: formData.supplier,
          order_date: formData.order_date,
          expected_delivery_date: formData.expected_delivery_date,
          total_amount: totalAmount,
          notes: formData.notes,
          status: "pending",
          created_by: user.user.id
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const itemsToInsert = formData.items.map(item => ({
        order_id: orderData.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        received_quantity: 0
      }));

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "✅ Order Created",
        description: `Purchase order ${formData.order_number} has been created`,
      });

      setIsCreateOpen(false);
      resetForm();
      loadOrders();
    } catch (error: any) {
      toast({
        title: "Error creating order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === "delivered") {
        updates.actual_delivery_date = new Date().toISOString().split("T")[0];
      }

      const { error } = await supabase
        .from("purchase_orders")
        .update(updates)
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "✅ Status Updated",
        description: `Order status changed to ${newStatus}`,
      });

      loadOrders();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const viewOrder = async (order: PurchaseOrder) => {
    setSelectedOrder(order);
    await loadOrderItems(order.id);
    setIsViewOpen(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_name: "", quantity: 1, unit_price: 0 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const resetForm = () => {
    setFormData({
      order_number: `PO-${Date.now()}`,
      supplier: "",
      order_date: new Date().toISOString().split("T")[0],
      expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "",
      items: [{ item_name: "", quantity: 1, unit_price: 0 }]
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: "Pending", className: "bg-yellow-500", icon: Clock },
      approved: { label: "Approved", className: "bg-blue-500", icon: CheckCircle },
      ordered: { label: "Ordered", className: "bg-purple-500", icon: ShoppingCart },
      in_transit: { label: "In Transit", className: "bg-orange-500", icon: Truck },
      delivered: { label: "Delivered", className: "bg-green-500", icon: CheckCircle },
      cancelled: { label: "Cancelled", className: "bg-red-500", icon: XCircle },
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-500", icon: FileText };
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Orders
              </CardTitle>
              <CardDescription>
                Create and track purchase orders and deliveries
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                  <DialogDescription>
                    Create a new purchase order with items
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="order_number">Order Number</Label>
                      <Input
                        id="order_number"
                        value={formData.order_number}
                        onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="Supplier name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="order_date">Order Date</Label>
                      <Input
                        id="order_date"
                        type="date"
                        value={formData.order_date}
                        onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expected_delivery_date">Expected Delivery</Label>
                      <Input
                        id="expected_delivery_date"
                        type="date"
                        value={formData.expected_delivery_date}
                        onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Order Items</Label>
                      <Button type="button" size="sm" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    
                    {formData.items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-5">
                              <Label>Item Name</Label>
                              <Input
                                value={item.item_name}
                                onChange={(e) => updateItem(index, "item_name", e.target.value)}
                                placeholder="Item name"
                              />
                            </div>
                            <div className="col-span-3">
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-3">
                              <Label>Unit Price</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-1 flex items-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(index)}
                                disabled={formData.items.length === 1}
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Subtotal: ${(item.quantity * item.unit_price).toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="text-right text-lg font-semibold">
                      Total: ${calculateTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createOrder}>Create Order</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell>{format(new Date(order.order_date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      {order.expected_delivery_date
                        ? format(new Date(order.expected_delivery_date), "MMM dd, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${order.total_amount?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => viewOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, "approved")}
                          >
                            Approve
                          </Button>
                        )}
                        {order.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, "ordered")}
                          >
                            Order
                          </Button>
                        )}
                        {order.status === "ordered" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, "in_transit")}
                          >
                            Ship
                          </Button>
                        )}
                        {order.status === "in_transit" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, "delivered")}
                          >
                            Deliver
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.order_number} - {selectedOrder?.supplier}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Date</Label>
                  <div className="text-sm">{format(new Date(selectedOrder.order_date), "MMM dd, yyyy")}</div>
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <div className="text-sm">
                    {selectedOrder.expected_delivery_date
                      ? format(new Date(selectedOrder.expected_delivery_date), "MMM dd, yyyy")
                      : "-"}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <div className="text-lg font-semibold">${selectedOrder.total_amount?.toFixed(2) || "0.00"}</div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label>Notes</Label>
                  <div className="text-sm text-muted-foreground">{selectedOrder.notes}</div>
                </div>
              )}

              <div>
                <Label>Order Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">${item.total_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.received_quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
