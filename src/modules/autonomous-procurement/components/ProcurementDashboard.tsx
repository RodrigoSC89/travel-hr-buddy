import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Package,
  Truck,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Brain,
  Sparkles,
  Send,
  BarChart3,
  Link,
  FileText,
  Search,
  Zap,
  Star,
  Building2,
} from "lucide-react";

interface PurchaseOrder {
  id: string;
  item: string;
  category: string;
  quantity: number;
  unit: string;
  supplier: string;
  status: "pending" | "approved" | "ordered" | "shipped" | "delivered" | "delayed";
  criticality: "low" | "medium" | "high" | "critical";
  estimatedDelivery: string;
  cost: number;
  aiGenerated: boolean;
}

interface Supplier {
  id: string;
  name: string;
  rating: number;
  deliveryRate: number;
  avgLeadTime: number;
  totalOrders: number;
  status: "active" | "preferred" | "suspended";
}

const mockOrders: PurchaseOrder[] = [
  { id: "PO-2024-001", item: "Filtro de óleo hidráulico", category: "Manutenção", quantity: 10, unit: "un", supplier: "HidroMar", status: "shipped", criticality: "high", estimatedDelivery: "2024-01-22", cost: 4500, aiGenerated: true },
  { id: "PO-2024-002", item: "Válvula de segurança DP", category: "DP System", quantity: 2, unit: "un", supplier: "NavTech", status: "ordered", criticality: "critical", estimatedDelivery: "2024-01-25", cost: 12800, aiGenerated: false },
  { id: "PO-2024-003", item: "EPI - Capacetes", category: "Segurança", quantity: 50, unit: "un", supplier: "SafetyFirst", status: "delayed", criticality: "medium", estimatedDelivery: "2024-01-20", cost: 3200, aiGenerated: true },
  { id: "PO-2024-004", item: "Óleo lubrificante 15W40", category: "Consumíveis", quantity: 200, unit: "L", supplier: "PetroLub", status: "delivered", criticality: "high", estimatedDelivery: "2024-01-18", cost: 8900, aiGenerated: true },
  { id: "PO-2024-005", item: "Juntas de vedação", category: "Manutenção", quantity: 30, unit: "un", supplier: "SealMaster", status: "pending", criticality: "low", estimatedDelivery: "2024-01-28", cost: 1500, aiGenerated: false },
];

const mockSuppliers: Supplier[] = [
  { id: "1", name: "HidroMar", rating: 4.8, deliveryRate: 97, avgLeadTime: 5, totalOrders: 234, status: "preferred" },
  { id: "2", name: "NavTech", rating: 4.9, deliveryRate: 99, avgLeadTime: 7, totalOrders: 156, status: "preferred" },
  { id: "3", name: "SafetyFirst", rating: 4.2, deliveryRate: 85, avgLeadTime: 8, totalOrders: 89, status: "active" },
  { id: "4", name: "PetroLub", rating: 4.6, deliveryRate: 94, avgLeadTime: 4, totalOrders: 312, status: "preferred" },
];

export default function ProcurementDashboard() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Olá! Sou o assistente de compras do Nautilus. Posso ajudar com pedidos, fornecedores e análises de custo. O que precisa?" },
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { role: "user", content: chatMessage }]);
    
    setTimeout(() => {
      const responses: Record<string, string> = {
        atrasados: "Há 1 pedido atrasado: PO-2024-003 (EPI - Capacetes) da SafetyFirst. Previsão original: 20/01. Deseja que eu contate o fornecedor ou busque alternativas?",
        criticos: "Pedidos críticos: 1) PO-2024-002 - Válvula DP (NavTech) - em processamento. O estoque de segurança está em 15 dias. Recomendo acompanhamento diário.",
        fornecedor: "Top 3 fornecedores por SLA: 1) NavTech (99%), 2) HidroMar (97%), 3) PetroLub (94%). A SafetyFirst está com índice abaixo da média - sugiro revisão de contrato.",
        default: "Analisei os dados de compras. Temos 5 pedidos ativos, 1 atrasado. O custo total do mês está 8% abaixo do budget. Posso detalhar algum item específico?",
      };
      
      const key = chatMessage.toLowerCase().includes("atrasa") ? "atrasados" 
        : chatMessage.toLowerCase().includes("critic") ? "criticos"
          : chatMessage.toLowerCase().includes("fornecedor") ? "fornecedor"
            : "default";
        
      setChatHistory(prev => [...prev, { role: "assistant", content: responses[key] }]);
    }, 1000);
    
    setChatMessage("");
  };

  const totalCost = mockOrders.reduce((sum, o) => sum + o.cost, 0);
  const delayedOrders = mockOrders.filter(o => o.status === "delayed").length;
  const aiGeneratedOrders = mockOrders.filter(o => o.aiGenerated).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                <p className="text-2xl font-bold">{mockOrders.length}</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">R$ {(totalCost / 1000).toFixed(1)}k</p>
                <p className="text-xs text-green-600">↓ 8% vs budget</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Atrasados</p>
                <p className="text-2xl font-bold">{delayedOrders}</p>
                <p className="text-xs text-amber-600">Ação requerida</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requisições IA</p>
                <p className="text-2xl font-bold">{aiGeneratedOrders}</p>
                <p className="text-xs text-purple-600">Automáticas</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lead Time Médio</p>
                <p className="text-2xl font-bold">5.8 dias</p>
                <p className="text-xs text-blue-600">↓ 1.2 dias</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant + Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Procurement Assistant */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-primary/5 to-orange-500/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              Assistente de Compras
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                LLM
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto space-y-3 mb-4 p-3 bg-background/50 rounded-lg">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Pergunte sobre pedidos, fornecedores..."
                value={chatMessage}
                onChange={handleChange}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Atrasados
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Críticos
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Fornecedor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pedidos de Compra
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Nova Requisição
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        order.criticality === "critical" ? "bg-red-500/10 text-red-600" :
                          order.criticality === "high" ? "bg-amber-500/10 text-amber-600" :
                            order.criticality === "medium" ? "bg-blue-500/10 text-blue-600" :
                              "bg-muted text-muted-foreground"
                      }`}>
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{order.item}</p>
                          {order.aiGenerated && (
                            <Badge variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.id} • {order.quantity} {order.unit} • {order.supplier}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      order.status === "delivered" ? "default" :
                        order.status === "delayed" ? "destructive" :
                          order.status === "shipped" ? "secondary" : "outline"
                    }>
                      {order.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {order.status === "delivered" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {order.status === "delayed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {order.status === "shipped" && <Truck className="h-3 w-3 mr-1" />}
                      {order.status === "pending" ? "Pendente" :
                        order.status === "approved" ? "Aprovado" :
                          order.status === "ordered" ? "Pedido" :
                            order.status === "shipped" ? "Enviado" :
                              order.status === "delivered" ? "Entregue" : "Atrasado"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Prev: {order.estimatedDelivery}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        R$ {order.cost.toLocaleString()}
                      </span>
                      <Badge variant={
                        order.criticality === "critical" ? "destructive" :
                          order.criticality === "high" ? "default" : "secondary"
                      } className="text-xs">
                        {order.criticality === "critical" ? "Crítico" :
                          order.criticality === "high" ? "Alta" :
                            order.criticality === "medium" ? "Média" : "Baixa"}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Desempenho de Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockSuppliers.map((supplier) => (
              <div key={supplier.id} className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{supplier.name}</h4>
                  <Badge variant={supplier.status === "preferred" ? "default" : "secondary"}>
                    {supplier.status === "preferred" ? "⭐ Preferencial" : "Ativo"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {supplier.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Taxa de Entrega</span>
                    <span className={`font-medium ${supplier.deliveryRate >= 95 ? "text-green-600" : supplier.deliveryRate >= 90 ? "text-amber-600" : "text-red-600"}`}>
                      {supplier.deliveryRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lead Time Médio</span>
                    <span className="font-medium">{supplier.avgLeadTime} dias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Pedidos</span>
                    <span className="font-medium">{supplier.totalOrders}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Recomendações da IA</h3>
              <p className="text-sm text-muted-foreground">
                3 oportunidades de negociação identificadas • 2 peças substitutas disponíveis
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Link className="h-4 w-4 mr-2" />
                Peças Substitutas
              </Button>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Ver Análise
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
