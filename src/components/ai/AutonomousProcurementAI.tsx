/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * AUTONOMOUS PROCUREMENT AI - Automação de Compras Inteligente
 * Compras automáticas, sugestões de fornecedores, ordens de compra inteligentes
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Brain, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle,
  Package, Truck, DollarSign, Clock, Sparkles, Building2,
  Star, Zap, RefreshCw, ArrowRight, BarChart3
} from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  avgConsumption: number;
  daysUntilEmpty: number;
  status: "critical" | "low" | "normal" | "excess";
  autoOrderEnabled: boolean;
}

interface Supplier {
  id: string;
  name: string;
  rating: number;
  leadTime: number;
  priceIndex: number;
  reliability: number;
  lastOrder: string;
  category: string[];
}

interface PurchaseRecommendation {
  id: string;
  item: StockItem;
  suggestedQuantity: number;
  suggestedSupplier: Supplier;
  estimatedCost: number;
  urgency: "immediate" | "soon" | "planned";
  aiReasoning: string;
  savingsOpportunity: number;
}

export const AutonomousProcurementAI: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    autoOrders: 0,
    savingsThisMonth: 0,
    supplierScore: 0
  });

  useEffect(() => {
    loadProcurementData();
  }, []);

  const loadProcurementData = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const mockStock: StockItem[] = [
      {
        id: "stk-001",
        name: "Óleo Lubrificante 15W-40",
        category: "Lubrificantes",
        currentStock: 50,
        minStock: 100,
        maxStock: 500,
        unit: "litros",
        avgConsumption: 25,
        daysUntilEmpty: 2,
        status: "critical",
        autoOrderEnabled: true
      },
      {
        id: "stk-002",
        name: "Filtro de Combustível Primário",
        category: "Filtros",
        currentStock: 8,
        minStock: 10,
        maxStock: 50,
        unit: "unidades",
        avgConsumption: 2,
        daysUntilEmpty: 4,
        status: "low",
        autoOrderEnabled: true
      },
      {
        id: "stk-003",
        name: "Kit Vedação Bomba Hidráulica",
        category: "Vedações",
        currentStock: 15,
        minStock: 5,
        maxStock: 30,
        unit: "kits",
        avgConsumption: 0.5,
        daysUntilEmpty: 30,
        status: "normal",
        autoOrderEnabled: false
      },
      {
        id: "stk-004",
        name: "Graxa Marítima EP2",
        category: "Lubrificantes",
        currentStock: 180,
        minStock: 50,
        maxStock: 200,
        unit: "kg",
        avgConsumption: 5,
        daysUntilEmpty: 36,
        status: "normal",
        autoOrderEnabled: true
      }
    ];

    const mockSuppliers: Supplier[] = [
      {
        id: "sup-001",
        name: "MarineSupply Global",
        rating: 4.8,
        leadTime: 3,
        priceIndex: 0.95,
        reliability: 98,
        lastOrder: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        category: ["Lubrificantes", "Filtros"]
      },
      {
        id: "sup-002",
        name: "OceanParts Ltd",
        rating: 4.5,
        leadTime: 5,
        priceIndex: 0.88,
        reliability: 95,
        lastOrder: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: ["Vedações", "Peças"]
      },
      {
        id: "sup-003",
        name: "NavalTech Solutions",
        rating: 4.2,
        leadTime: 7,
        priceIndex: 0.82,
        reliability: 92,
        lastOrder: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        category: ["Lubrificantes", "Equipamentos"]
      }
    ];

    const mockRecommendations: PurchaseRecommendation[] = [
      {
        id: "rec-001",
        item: mockStock[0],
        suggestedQuantity: 200,
        suggestedSupplier: mockSuppliers[0],
        estimatedCost: 4500,
        urgency: "immediate",
        aiReasoning: "Estoque crítico com apenas 2 dias de suprimento. Consumo médio alto. Fornecedor MarineSupply oferece melhor lead time (3 dias) e excelente rating.",
        savingsOpportunity: 320
      },
      {
        id: "rec-002",
        item: mockStock[1],
        suggestedQuantity: 20,
        suggestedSupplier: mockSuppliers[0],
        estimatedCost: 1800,
        urgency: "soon",
        aiReasoning: "Estoque baixo com 4 dias restantes. Pedido conjunto com óleo lubrificante reduz custo de frete.",
        savingsOpportunity: 150
      }
    ];

    setStockItems(mockStock);
    setSuppliers(mockSuppliers);
    setRecommendations(mockRecommendations);
    setStats({
      pendingOrders: 3,
      autoOrders: 12,
      savingsThisMonth: 4850,
      supplierScore: 96
    });
    setIsAnalyzing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "critical": return "bg-red-500 text-white";
    case "low": return "bg-yellow-500 text-black";
    case "normal": return "bg-green-500 text-white";
    case "excess": return "bg-blue-500 text-white";
    default: return "bg-gray-500 text-white";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
    case "immediate": return "text-red-500 bg-red-500/10 border-red-500/30";
    case "soon": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    case "planned": return "text-blue-500 bg-blue-500/10 border-blue-500/30";
    default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const executeAutoPurchase = async (rec: PurchaseRecommendation) => {
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <ShoppingCart className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto-Compras (mês)</p>
                <p className="text-2xl font-bold">{stats.autoOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Economia (mês)</p>
                <p className="text-2xl font-bold text-green-500">R$ {stats.savingsThisMonth.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Star className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Fornecedores</p>
                <p className="text-2xl font-bold">{stats.supplierScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations" className="gap-2">
            <Brain className="h-4 w-4" />
            Recomendações IA
          </TabsTrigger>
          <TabsTrigger value="stock" className="gap-2">
            <Package className="h-4 w-4" />
            Estoque Crítico
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Building2 className="h-4 w-4" />
            Fornecedores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-l-4 ${
                rec.urgency === "immediate" ? "border-l-red-500" :
                  rec.urgency === "soon" ? "border-l-yellow-500" : "border-l-blue-500"
              }`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getUrgencyColor(rec.urgency)}>
                          {rec.urgency === "immediate" ? "Urgente" : 
                            rec.urgency === "soon" ? "Em breve" : "Planejado"}
                        </Badge>
                        <h3 className="text-lg font-semibold">{rec.item.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Quantidade</p>
                          <p className="font-medium">{rec.suggestedQuantity} {rec.item.unit}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fornecedor Sugerido</p>
                          <p className="font-medium flex items-center gap-1">
                            {rec.suggestedSupplier.name}
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {rec.suggestedSupplier.rating}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Lead Time</p>
                          <p className="font-medium flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            {rec.suggestedSupplier.leadTime} dias
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Custo Estimado</p>
                          <p className="font-medium">R$ {rec.estimatedCost.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Análise IA</span>
                        </div>
                        <p className="text-sm">{rec.aiReasoning}</p>
                      </div>

                      {rec.savingsOpportunity > 0 && (
                        <div className="flex items-center gap-2 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Oportunidade de economia: R$ {rec.savingsOpportunity.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => handleexecuteAutoPurchase}
                        className={rec.urgency === "immediate" ? "bg-red-500 hover:bg-red-600" : ""}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {rec.urgency === "immediate" ? "Comprar Agora" : "Aprovar Compra"}
                      </Button>
                      <Button variant="outline" size="sm">
                        Ver Alternativas
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stockItems.filter(item => item.status === "critical" || item.status === "low").map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === "critical" ? "Crítico" : "Baixo"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Estoque Atual</span>
                        <span className="font-medium">{item.currentStock} / {item.maxStock} {item.unit}</span>
                      </div>
                      <Progress 
                        value={(item.currentStock / item.maxStock) * 100}
                        className={`h-2 ${
                          item.status === "critical" ? "[&>div]:bg-red-500" :
                            item.status === "low" ? "[&>div]:bg-yellow-500" : ""
                        }`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mínimo: {item.minStock}</span>
                        <span className={item.daysUntilEmpty <= 7 ? "text-red-500 font-medium" : ""}>
                          {item.daysUntilEmpty} dias até esgotamento
                        </span>
                      </div>
                    </div>

                    {item.autoOrderEnabled && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                        <Zap className="h-3 w-3" />
                        Compra automática ativa
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{supplier.name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{supplier.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lead Time</span>
                        <span>{supplier.leadTime} dias</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Índice de Preço</span>
                        <span className={supplier.priceIndex < 0.9 ? "text-green-500" : ""}>
                          {Math.round((1 - supplier.priceIndex) * 100)}% abaixo do mercado
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confiabilidade</span>
                        <span>{supplier.reliability}%</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {supplier.category.map(cat => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutonomousProcurementAI;
