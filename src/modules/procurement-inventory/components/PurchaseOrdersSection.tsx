import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  Download,
  Send,
  Building2,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Receipt,
  Inbox,
  Zap,
  Brain,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface PurchaseOrder {
  id: string;
  number: string;
  supplier: string;
  supplierContact: string;
  supplierEmail: string;
  items: POItem[];
  status: "draft" | "sent" | "confirmed" | "shipped" | "partial" | "delivered" | "delayed" | "cancelled";
  createdAt: string;
  sentAt?: string;
  expectedDelivery: string;
  actualDelivery?: string;
  totalValue: number;
  paymentTerms: string;
  notes: string;
  requisitionRef?: string;
  aiGenerated: boolean;
  trackingCode?: string;
  receivedItems?: number;
  totalItems?: number;
}

interface POItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  receivedQty: number;
  unit: string;
  unitPrice: number;
}

const mockOrders: PurchaseOrder[] = [
  {
    id: "1",
    number: "PO-2024-042",
    supplier: "HidroMar",
    supplierContact: "Carlos Mendes",
    supplierEmail: "carlos@hidromar.com",
    items: [
      { id: "1", sku: "FIL-OLE-001", name: "Filtro de óleo hidráulico", quantity: 15, receivedQty: 0, unit: "un", unitPrice: 450 },
    ],
    status: "confirmed",
    createdAt: "2024-01-20 10:00",
    sentAt: "2024-01-20 10:30",
    expectedDelivery: "2024-01-25",
    totalValue: 6750,
    paymentTerms: "30 dias",
    notes: "Entrega prioritária",
    requisitionRef: "REQ-2024-089",
    aiGenerated: true,
    receivedItems: 0,
    totalItems: 15,
  },
  {
    id: "2",
    number: "PO-2024-041",
    supplier: "SafetyFirst",
    supplierContact: "Maria Lima",
    supplierEmail: "maria@safetyfirst.com",
    items: [
      { id: "1", sku: "EPI-CAP-003", name: "Capacete de segurança", quantity: 50, receivedQty: 20, unit: "un", unitPrice: 64 },
      { id: "2", sku: "EPI-BOT-004", name: "Botas de segurança", quantity: 25, receivedQty: 25, unit: "par", unitPrice: 180 },
    ],
    status: "partial",
    createdAt: "2024-01-18 14:00",
    sentAt: "2024-01-18 14:30",
    expectedDelivery: "2024-01-22",
    totalValue: 7700,
    paymentTerms: "45 dias",
    notes: "",
    aiGenerated: false,
    receivedItems: 45,
    totalItems: 75,
    trackingCode: "BR1234567890",
  },
  {
    id: "3",
    number: "PO-2024-040",
    supplier: "PetroLub",
    supplierContact: "João Santos",
    supplierEmail: "joao@petrolub.com",
    items: [
      { id: "1", sku: "OLE-LUB-004", name: "Óleo lubrificante 15W40", quantity: 200, receivedQty: 200, unit: "L", unitPrice: 44.50 },
    ],
    status: "delivered",
    createdAt: "2024-01-15 09:00",
    sentAt: "2024-01-15 09:30",
    expectedDelivery: "2024-01-18",
    actualDelivery: "2024-01-18",
    totalValue: 8900,
    paymentTerms: "30 dias",
    notes: "",
    aiGenerated: true,
    receivedItems: 200,
    totalItems: 200,
  },
  {
    id: "4",
    number: "PO-2024-039",
    supplier: "NavTech",
    supplierContact: "Pedro Costa",
    supplierEmail: "pedro@navtech.com",
    items: [
      { id: "1", sku: "VAL-SEG-002", name: "Válvula de segurança DP", quantity: 2, receivedQty: 0, unit: "un", unitPrice: 6400 },
    ],
    status: "delayed",
    createdAt: "2024-01-10 11:00",
    sentAt: "2024-01-10 11:30",
    expectedDelivery: "2024-01-17",
    totalValue: 12800,
    paymentTerms: "60 dias",
    notes: "Peça importada - prazo estendido",
    requisitionRef: "REQ-2024-086",
    aiGenerated: true,
    receivedItems: 0,
    totalItems: 2,
  },
];

interface PurchaseOrdersSectionProps {
  searchQuery: string;
}

export default function PurchaseOrdersSection({ searchQuery }: PurchaseOrdersSectionProps) {
  const [orders, setOrders] = useState(mockOrders);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === "" ||
      order.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleReceiveItems = (orderId: string, items: POItem[]) => {
    const totalReceived = items.reduce((sum, item) => sum + item.receivedQty, 0);
    const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0);
    
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newStatus = totalReceived === totalOrdered ? "delivered" : "partial";
        return {
          ...order,
          items,
          status: newStatus,
          receivedItems: totalReceived,
          actualDelivery: totalReceived === totalOrdered ? new Date().toISOString().split("T")[0] : undefined,
        };
      }
      return order;
    }));
    
    setShowReceive(false);
    toast.success("Recebimento registrado com sucesso!");
  };

  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status)).length;
  const delayedOrders = orders.filter(o => o.status === "delayed").length;
  const totalValue = orders.reduce((sum, o) => sum + o.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pedidos</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{activeOrders}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-destructive">{delayedOrders}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">R$ {(totalValue / 1000).toFixed(1)}k</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="shipped">Enviado</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="delayed">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleSetShowNewOrder}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead className="text-center">Progresso</TableHead>
                <TableHead>Entrega Prev.</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{order.number}</span>
                      {order.aiGenerated && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      )}
                    </div>
                    {order.requisitionRef && (
                      <p className="text-xs text-muted-foreground">{order.requisitionRef}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{order.supplier}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {order.items.slice(0, 2).map((item, idx) => (
                        <p key={idx} className="text-sm truncate max-w-48">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{order.items.length - 2} mais
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress
                        value={order.totalItems ? (order.receivedItems! / order.totalItems) * 100 : 0}
                        className={`h-2 ${
                          order.status === "delivered" ? "[&>div]:bg-green-500" :
                            order.status === "delayed" ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
                        }`}
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        {order.receivedItems}/{order.totalItems}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.expectedDelivery}</span>
                    </div>
                    {order.trackingCode && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {order.trackingCode}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    R$ {order.totalValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === "delivered" ? "default" :
                        order.status === "delayed" ? "destructive" :
                          order.status === "shipped" || order.status === "confirmed" ? "secondary" :
                            order.status === "partial" ? "outline" : "outline"
                    }>
                      {order.status === "shipped" && <Truck className="h-3 w-3 mr-1" />}
                      {order.status === "delivered" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {order.status === "delayed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {order.status === "confirmed" && <Clock className="h-3 w-3 mr-1" />}
                      {order.status === "draft" ? "Rascunho" :
                        order.status === "sent" ? "Enviado" :
                          order.status === "confirmed" ? "Confirmado" :
                            order.status === "shipped" ? "Em Trânsito" :
                              order.status === "partial" ? "Parcial" :
                                order.status === "delivered" ? "Entregue" :
                                  order.status === "delayed" ? "Atrasado" : "Cancelado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {["confirmed", "shipped", "partial"].includes(order.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowReceive(true);
                          }}
                        >
                          <Inbox className="h-4 w-4 mr-1" />
                          Receber
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-xl font-bold">{selectedOrder.number}</p>
                    <p className="text-sm text-muted-foreground">
                      Criado em {selectedOrder.createdAt}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  selectedOrder.status === "delivered" ? "default" :
                    selectedOrder.status === "delayed" ? "destructive" : "secondary"
                } className="text-sm">
                  {selectedOrder.status === "delivered" ? "Entregue" :
                    selectedOrder.status === "delayed" ? "Atrasado" :
                      selectedOrder.status === "confirmed" ? "Confirmado" :
                        selectedOrder.status === "shipped" ? "Em Trânsito" :
                          selectedOrder.status === "partial" ? "Parcial" : selectedOrder.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Fornecedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-semibold">{selectedOrder.supplier}</p>
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {selectedOrder.supplierContact}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedOrder.supplierEmail}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Datas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enviado:</span>
                      <span>{selectedOrder.sentAt || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Previsão:</span>
                      <span>{selectedOrder.expectedDelivery}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entrega:</span>
                      <span>{selectedOrder.actualDelivery || "Aguardando"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Itens do Pedido</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead className="text-center">Recebido</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.receivedQty === item.quantity ? "default" : "outline"}>
                            {item.receivedQty}/{item.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">R$ {item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">
                          R$ {(item.quantity * item.unitPrice).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total do Pedido</p>
                    <p className="text-2xl font-bold">R$ {selectedOrder.totalValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Pagamento: {selectedOrder.paymentTerms}
                    </p>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm"><strong>Observações:</strong> {selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={showReceive} onOpenChange={setShowReceive}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Recebimento</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <ReceiveItemsForm
              order={selectedOrder}
              onConfirm={(items) => handleReceiveItems(selectedOrder.id, items)}
              onCancel={() => setShowReceive(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* New Order Dialog */}
      <Dialog open={showNewOrder} onOpenChange={setShowNewOrder}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Novo Pedido de Compra</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <p>Recomendamos criar pedidos a partir de requisições aprovadas.</p>
            <p className="text-sm mt-2">
              Assim você garante o fluxo de aprovação e rastreabilidade completa.
            </p>
            <Button className="mt-4" onClick={handleSetShowNewOrder}>
              Ir para Requisições
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for receiving items
function ReceiveItemsForm({ 
  order, 
  onConfirm, 
  onCancel 
}: { 
  order: PurchaseOrder; 
  onConfirm: (items: POItem[]) => void; 
  onCancel: () => void;
}) {
  const [items, setItems] = useState(order.items.map(item => ({
    ...item,
    receivingQty: item.quantity - item.receivedQty,
  })));

  const updateQty = (id: string, qty: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, receivingQty: qty } : item
    ));
  };

  const handleConfirm = () => {
    const updatedItems = items.map(item => ({
      ...item,
      receivedQty: item.receivedQty + item.receivingQty,
    }));
    onConfirm(updatedItems);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="p-3 rounded-lg bg-muted">
        <p className="font-mono font-semibold">{order.number}</p>
        <p className="text-sm text-muted-foreground">Fornecedor: {order.supplier}</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                Pedido: {item.quantity} | Já recebido: {item.receivedQty} | Pendente: {item.quantity - item.receivedQty}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Recebendo:</Label>
              <Input
                type="number"
                className="w-20"
                min={0}
                max={item.quantity - item.receivedQty}
                value={item.receivingQty}
                onChange={handleChange}
              />
              <span className="text-sm text-muted-foreground">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleConfirm}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Confirmar Recebimento
        </Button>
      </DialogFooter>
    </div>
  );
}

// Missing import
import { User } from "lucide-react";
