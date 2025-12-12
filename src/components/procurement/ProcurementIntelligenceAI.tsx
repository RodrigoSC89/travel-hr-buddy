/**
import { useState, useMemo, useCallback } from "react";;
 * Procurement Intelligence AI - Diferencial vs ShipServ
 * - Previsão de necessidades
 * - Análise de TCO
 * - Sugestão de fornecedores
 * - Otimização de estoque
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { AIModuleEnhancer } from "@/components/ai/AIModuleEnhancer";
import {
  Brain,
  ShoppingCart,
  TrendingUp,
  Package,
  DollarSign,
  Truck,
  AlertTriangle,
  Search,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  avgConsumption: number; // per month
  lastOrder: string;
  unitCost: number;
  leadTime: number; // days
}

interface PurchasePrediction {
  itemId: string;
  itemName: string;
  predictedNeed: number;
  suggestedOrderDate: string;
  confidence: number;
  basedOn: string;
}

interface SupplierSuggestion {
  id: string;
  name: string;
  rating: number;
  deliveryTime: number;
  price: number;
  reliability: number;
  aiScore: number;
}

export const ProcurementIntelligenceAI = memo(function() {
  const { predict, analyze, suggest, isLoading } = useNautilusAI();
  const [predictions, setPredictions] = useState<PurchasePrediction[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierSuggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulated inventory data
  const inventoryData: InventoryItem[] = [
    { id: "inv-001", name: "Filtro de Óleo Lubrificante", category: "Motor", currentStock: 8, minStock: 5, maxStock: 20, avgConsumption: 3, lastOrder: "2024-10-15", unitCost: 450, leadTime: 14 },
    { id: "inv-002", name: "Selo Mecânico Bomba Principal", category: "Bombas", currentStock: 2, minStock: 3, maxStock: 8, avgConsumption: 0.5, lastOrder: "2024-08-20", unitCost: 2800, leadTime: 21 },
    { id: "inv-003", name: "Óleo Hidráulico ISO 46", category: "Lubrificantes", currentStock: 12, minStock: 10, maxStock: 30, avgConsumption: 5, lastOrder: "2024-11-01", unitCost: 85, leadTime: 7 },
    { id: "inv-004", name: "Pastilha de Zinco (Anodo)", category: "Proteção Catódica", currentStock: 45, minStock: 20, maxStock: 100, avgConsumption: 15, lastOrder: "2024-10-28", unitCost: 35, leadTime: 10 },
    { id: "inv-005", name: "Kit Reparo Válvula Pneumática", category: "Pneumática", currentStock: 1, minStock: 2, maxStock: 6, avgConsumption: 0.3, lastOrder: "2024-07-10", unitCost: 1200, leadTime: 28 },
  ];

  const runPredictiveAnalysis = async () => {
    try {
      const result = await predict("procurement", `
        Analise o inventário e preveja necessidades de compra:
        
        ${inventoryData.map(item => `
          - ${item.name}
            - Estoque atual: ${item.currentStock} / Mínimo: ${item.minStock}
            - Consumo médio: ${item.avgConsumption}/mês
            - Lead time: ${item.leadTime} dias
            - Último pedido: ${item.lastOrder}
        `).join("\n")}
        
        Considere lead times, consumo histórico e criticidade.
      `);

      // Generate predictions for low-stock items
      const preds: PurchasePrediction[] = inventoryData
        .filter(item => item.currentStock <= item.minStock * 1.5)
        .map(item => {
          const daysUntilMin = ((item.currentStock - item.minStock) / item.avgConsumption) * 30;
          const orderDate = new Date();
          orderDate.setDate(orderDate.getDate() + Math.max(0, daysUntilMin - item.leadTime));
          
          return {
            itemId: item.id,
            itemName: item.name,
            predictedNeed: Math.ceil(item.avgConsumption * 2),
            suggestedOrderDate: orderDate.toISOString().split("T")[0],
            confidence: 85 + Math.random() * 10,
            basedOn: "Consumo histórico + Lead time"
          };
        });

      setPredictions(preds);
      toast.success("Análise preditiva concluída", {
        description: `${preds.length} itens precisam de atenção`
      });
    } catch (error) {
      toast.error("Erro na análise");
    }
  };

  const findSuppliers = async (itemName: string) => {
    try {
      const result = await suggest("procurement", `
        Sugira os melhores fornecedores para: ${itemName}
        
        Considere: preço, prazo de entrega, confiabilidade, localização (Brasil).
      `);

      // Simulated supplier suggestions
      const sugs: SupplierSuggestion[] = [
        { id: "sup-001", name: "MarineSupply Brasil", rating: 4.8, deliveryTime: 7, price: 420, reliability: 95, aiScore: 92 },
        { id: "sup-002", name: "ShipParts Internacional", rating: 4.5, deliveryTime: 14, price: 380, reliability: 88, aiScore: 85 },
        { id: "sup-003", name: "Náutica & Cia", rating: 4.2, deliveryTime: 5, price: 490, reliability: 92, aiScore: 80 },
      ];

      setSuppliers(sugs);
      toast.success("Fornecedores encontrados", {
        description: `${sugs.length} opções disponíveis`
      };
    } catch (error) {
      toast.error("Erro ao buscar fornecedores");
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    const ratio = item.currentStock / item.minStock;
    if (ratio < 1) return { color: "text-red-500", label: "Crítico" };
    if (ratio < 1.5) return { color: "text-yellow-500", label: "Baixo" };
    return { color: "text-green-500", label: "OK" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
            <ShoppingCart className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Procurement Intelligence
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Preditiva
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Previsão de necessidades • Análise TCO • Sugestão de fornecedores
            </p>
          </div>
        </div>
        <Button onClick={runPredictiveAnalysis} disabled={isLoading}>
          <Zap className="h-4 w-4 mr-2" />
          Análise Preditiva
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{inventoryData.length}</p>
                <p className="text-xs text-muted-foreground">Itens no Inventário</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {inventoryData.filter(i => i.currentStock <= i.minStock).length}
                </p>
                <p className="text-xs text-muted-foreground">Estoque Crítico</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  R$ {(inventoryData.reduce((acc, i) => acc + i.currentStock * i.unitCost, 0) / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-muted-foreground">Valor em Estoque</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{predictions.length}</p>
                <p className="text-xs text-muted-foreground">Pedidos Sugeridos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventário
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <TrendingUp className="h-4 w-4 mr-2" />
            Previsões IA
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Truck className="h-4 w-4 mr-2" />
            Fornecedores IA
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Brain className="h-4 w-4 mr-2" />
            Assistente IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Controle de Inventário</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {inventoryData.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.name}</span>
                              <Badge variant="outline">{item.category}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Custo: R$ {item.unitCost}</span>
                              <span>Lead time: {item.leadTime} dias</span>
                              <span>Consumo: {item.avgConsumption}/mês</span>
                            </div>
                          </div>
                          <Badge variant="outline" className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Estoque: {item.currentStock} un</span>
                            <span>Min: {item.minStock} | Max: {item.maxStock}</span>
                          </div>
                          <Progress
                            value={(item.currentStock / item.maxStock) * 100}
                            className={`h-2 ${
                              item.currentStock <= item.minStock ? "[&>div]:bg-red-500" :
                                item.currentStock <= item.minStock * 1.5 ? "[&>div]:bg-yellow-500" :
                                  "[&>div]:bg-green-500"
                            }`}
                          />
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button size="sm" variant="outline" onClick={() => handlefindSuppliers}>
                            <Search className="h-3 w-3 mr-1" />
                            Buscar Fornecedores
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Previsões de Compra
                <Badge className="bg-purple-500">
                  <Brain className="h-3 w-3 mr-1" />
                  IA Preditiva
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {predictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Execute a análise preditiva para ver recomendações</p>
                  <Button className="mt-4" onClick={runPredictiveAnalysis}>
                    <Zap className="h-4 w-4 mr-2" />
                    Analisar
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
                    {predictions.map((pred) => (
                      <div key={pred.itemId} className="p-4 border rounded-lg bg-gradient-to-r from-purple-500/5 to-transparent">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{pred.itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantidade sugerida: {pred.predictedNeed} unidades
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            {pred.confidence.toFixed(0)}% confiança
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-blue-500">
                            <Clock className="h-3 w-3" />
                            Pedir até: {pred.suggestedOrderDate}
                          </span>
                          <span className="text-muted-foreground">
                            Baseado em: {pred.basedOn}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Criar Pedido
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handlefindSuppliers}>
                            <Truck className="h-3 w-3 mr-1" />
                            Ver Fornecedores
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fornecedores Sugeridos pela IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    value={searchTerm}
                    onChange={handleChange}
                    placeholder="Buscar item para encontrar fornecedores..."
                  />
                  <Button onClick={() => handlefindSuppliers}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {suppliers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Busque um item para encontrar fornecedores</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suppliers.map((sup, idx) => (
                    <div key={sup.id} className={`p-4 border rounded-lg ${idx === 0 ? "border-green-500 bg-green-500/5" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <Badge className="bg-green-500">
                                <Star className="h-3 w-3 mr-1" />
                                Recomendado IA
                              </Badge>
                            )}
                            <p className="font-medium">{sup.name}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {sup.rating}
                            </span>
                            <span>Entrega: {sup.deliveryTime} dias</span>
                            <span>Confiabilidade: {sup.reliability}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">R$ {sup.price}</p>
                          <p className="text-xs text-muted-foreground">Score IA: {sup.aiScore}%</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button size="sm" variant="outline">Ver Detalhes</Button>
                        <Button size="sm">Solicitar Cotação</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIModuleEnhancer
            module="procurement"
            title="Assistente de Compras"
            description="Pergunte sobre fornecedores, preços, TCO ou otimização"
            context={{ inventoryData, predictions, suppliers }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default ProcurementIntelligenceAI;
