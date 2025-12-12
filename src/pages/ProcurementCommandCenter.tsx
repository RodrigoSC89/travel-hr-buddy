/**
 * PROCUREMENT COMMAND CENTER
 * Módulo unificado de Procurement & Inventory AI + Autonomous Procurement + Supplier Marketplace
 * Gestão completa de compras, fornecedores, inventário e automação de procurement
 */

import { useEffect, useState, useCallback, useMemo } from "react";;;
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Store, Search, Star, MapPin, Phone, Mail, Globe, 
  Plus, Filter, FileText, Send, Clock, CheckCircle2,
  TrendingUp, TrendingDown, Users, Package, Award,
  Brain, ShoppingCart, AlertTriangle, DollarSign,
  Truck, Sparkles, Building2, Zap, RefreshCw, ArrowRight,
  BarChart3, Edit, Trash2, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ============================================
// INTERFACES
// ============================================

interface Supplier {
  id: string;
  company_name: string;
  trading_name: string;
  category: string[];
  services: string[];
  ports_served: string[];
  countries: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  city: string;
  country: string;
  rating: number;
  total_orders: number;
  total_value: number;
  payment_terms: string;
  lead_time_days: number;
  certifications: string[];
  is_approved: boolean;
  is_active: boolean;
}

interface RFQRequest {
  id: string;
  rfq_number: string;
  title: string;
  category: string;
  delivery_port: string;
  status: string;
  deadline: string;
  budget_estimate: number;
  currency: string;
}

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

interface PurchaseRecommendation {
  id: string;
  item: StockItem;
  suggestedQuantity: number;
  suggestedSupplier: {
    id: string;
    name: string;
    rating: number;
    leadTime: number;
  };
  estimatedCost: number;
  urgency: "immediate" | "soon" | "planned";
  aiReasoning: string;
  savingsOpportunity: number;
}

interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  description: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  total_value: number;
  status: string;
  location: string;
}

// ============================================
// CONSTANTS
// ============================================

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-muted",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  quoted: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  awarded: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  expired: "bg-muted text-muted-foreground border-muted",
};

const categoryLabels: Record<string, string> = {
  spare_parts: "Peças Sobressalentes",
  provisions: "Provisões",
  deck_supplies: "Suprimentos de Convés",
  engine_supplies: "Suprimentos de Máquinas",
  safety_equipment: "Equipamentos de Segurança",
  navigation: "Navegação",
  lubricants: "Lubrificantes",
  chemicals: "Químicos",
  services: "Serviços",
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProcurementCommandCenter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // AI Procurement State
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiStats, setAiStats] = useState({
    pendingOrders: 0,
    autoOrders: 0,
    savingsThisMonth: 0,
    supplierScore: 0
  });

  // Inventory State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Supplier Marketplace Queries
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const { data: rfqRequests = [], isLoading: rfqLoading } = useQuery({
    queryKey: ["rfq-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RFQRequest[];
    },
  });

  useEffect(() => {
    loadAIProcurementData();
    loadInventoryItems();
  }, []);

  // ============================================
  // DATA LOADING FUNCTIONS
  // ============================================

  const loadAIProcurementData = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

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

    const mockRecommendations: PurchaseRecommendation[] = [
      {
        id: "rec-001",
        item: mockStock[0],
        suggestedQuantity: 200,
        suggestedSupplier: { id: "sup-001", name: "MarineSupply Global", rating: 4.8, leadTime: 3 },
        estimatedCost: 4500,
        urgency: "immediate",
        aiReasoning: "Estoque crítico com apenas 2 dias de suprimento. Consumo médio alto. Fornecedor MarineSupply oferece melhor lead time (3 dias) e excelente rating.",
        savingsOpportunity: 320
      },
      {
        id: "rec-002",
        item: mockStock[1],
        suggestedQuantity: 20,
        suggestedSupplier: { id: "sup-001", name: "MarineSupply Global", rating: 4.8, leadTime: 3 },
        estimatedCost: 1800,
        urgency: "soon",
        aiReasoning: "Estoque baixo com 4 dias restantes. Pedido conjunto com óleo lubrificante reduz custo de frete.",
        savingsOpportunity: 150
      }
    ];

    setStockItems(mockStock);
    setRecommendations(mockRecommendations);
    setAiStats({
      pendingOrders: 3,
      autoOrders: 12,
      savingsThisMonth: 4850,
      supplierScore: 96
    });
    setIsAnalyzing(false);
  };

  const loadInventoryItems = async () => {
    try {
      setInventoryLoading(true);
      const { data, error } = await supabase
        .from("inventory_items" as unknown)
        .select("*")
        .order("name");

      if (error) throw error;
      setInventoryItems((data as unknown as InventoryItem[]) || []);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Erro ao carregar inventário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setInventoryLoading(false);
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const approvedSuppliers = suppliers.filter(s => s.is_approved);
  const pendingRFQs = rfqRequests.filter(r => r.status === "sent" || r.status === "quoted");
  const totalSpend = suppliers.reduce((sum, s) => sum + (s.total_value || 0), 0);
  const criticalStockItems = stockItems.filter(item => item.status === "critical" || item.status === "low");
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + (item.total_value || 0), 0);

  const filteredSuppliers = suppliers.filter(s => 
    s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={cn(
            "h-3.5 w-3.5",
            star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating?.toFixed(1) || "N/A"})</span>
    </div>
  );

  const executeAutoPurchase = async (rec: PurchaseRecommendation) => {
    toast({
      title: "Compra Iniciada",
      description: `Pedido de ${rec.suggestedQuantity} ${rec.item.unit} de ${rec.item.name} enviado para ${rec.suggestedSupplier.name}`,
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <Helmet>
        <title>Procurement Command Center | Nautilus One</title>
        <meta name="description" content="Central de comando de procurement com IA, gestão de fornecedores, inventário e compras automatizadas" />
      </Helmet>

      <div className="min-h-screen bg-background p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              🛒 Procurement Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestão inteligente de compras, fornecedores e inventário com IA
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => loadAIProcurementData(}>
              <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
              Analisar
            </Button>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Fornecedor
            </Button>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Nova RFQ
            </Button>
          </div>
        </div>

        {/* KPI Cards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <ShoppingCart className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
                  <p className="text-2xl font-bold">{aiStats.pendingOrders}</p>
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
                  <p className="text-sm text-muted-foreground">Auto-Compras</p>
                  <p className="text-2xl font-bold">{aiStats.autoOrders}</p>
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
                  <p className="text-2xl font-bold text-green-500">R$ {aiStats.savingsThisMonth.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estoque Crítico</p>
                  <p className="text-2xl font-bold text-orange-500">{criticalStockItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fornecedores</p>
                  <p className="text-2xl font-bold">{approvedSuppliers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Send className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RFQs Pendentes</p>
                  <p className="text-2xl font-bold">{pendingRFQs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-recommendations" className="gap-2">
              <Brain className="h-4 w-4" />
              IA Compras
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              Inventário
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <Store className="h-4 w-4" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger value="rfq" className="gap-2">
              <FileText className="h-4 w-4" />
              RFQ/Cotações
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Truck className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Recommendations Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Recomendações IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{rec.item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {rec.suggestedQuantity} {rec.item.unit} • R$ {rec.estimatedCost.toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getUrgencyColor(rec.urgency)}>
                        {rec.urgency === "immediate" ? "Urgente" : rec.urgency === "soon" ? "Em breve" : "Planejado"}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={handleSetActiveTab}>
                    Ver Todas Recomendações
                  </Button>
                </CardContent>
              </Card>

              {/* Critical Stock */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Estoque Crítico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {criticalStockItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.currentStock} / {item.maxStock} {item.unit}
                        </p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.daysUntilEmpty} dias
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={handleSetActiveTab}>
                    Ver Inventário Completo
                  </Button>
                </CardContent>
              </Card>

              {/* Top Suppliers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Top Fornecedores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suppliers.slice(0, 4).map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{supplier.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {supplier.city}, {supplier.country}
                        </p>
                      </div>
                      {renderStars(supplier.rating)}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={handleSetActiveTab}>
                    Ver Todos Fornecedores
                  </Button>
                </CardContent>
              </Card>

              {/* Recent RFQs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    RFQs Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rfqRequests.slice(0, 4).map((rfq) => (
                    <div key={rfq.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{rfq.title}</p>
                        <p className="text-sm text-muted-foreground">{rfq.rfq_number}</p>
                      </div>
                      <Badge className={cn("border", statusColors[rfq.status])}>
                        {rfq.status}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={handleSetActiveTab}>
                    Ver Todas RFQs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI RECOMMENDATIONS TAB */}
          <TabsContent value="ai-recommendations" className="space-y-4">
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

            {/* Critical Stock Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens com Estoque Crítico/Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {criticalStockItems.map((item, index) => (
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* INVENTORY TAB */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar itens..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleChange}
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  <SelectItem value="spare_parts">Peças</SelectItem>
                  <SelectItem value="consumables">Consumíveis</SelectItem>
                  <SelectItem value="safety_equipment">Segurança</SelectItem>
                  <SelectItem value="lubricants">Lubrificantes</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={loadInventoryItems}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Itens de Inventário</CardTitle>
                    <CardDescription>
                      {inventoryItems.length} itens • Valor total: R$ {inventoryValue.toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inventoryLoading ? (
                    <div className="text-center py-8">Carregando...</div>
                  ) : inventoryItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum item encontrado</p>
                    </div>
                  ) : (
                    inventoryItems.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent">
                        <div className="flex-shrink-0">
                          {item.current_stock <= item.minimum_stock ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{item.name}</h4>
                            <Badge variant={item.status === "active" ? "default" : "secondary"}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Código: {item.item_code}</span>
                            <span>•</span>
                            <span className="capitalize">{item.category?.replace("_", " ")}</span>
                            <span>•</span>
                            <span>{item.location}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium">
                            Estoque: {item.current_stock} / {item.minimum_stock}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Valor: R$ {item.total_value?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUPPLIERS TAB */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar fornecedores por nome, cidade ou país..." 
                  className="pl-10 bg-muted/30"
                  value={searchQuery}
                  onChange={handleChange}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliersLoading ? (
                <p className="col-span-full text-center py-8 text-muted-foreground">Carregando...</p>
              ) : filteredSuppliers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Store className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
                  <Button variant="link" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Fornecedor
                  </Button>
                </div>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{supplier.company_name}</h3>
                          {supplier.trading_name && (
                            <p className="text-sm text-muted-foreground">{supplier.trading_name}</p>
                          )}
                        </div>
                        {supplier.is_approved && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Aprovado
                          </Badge>
                        )}
                      </div>

                      {renderStars(supplier.rating)}

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {supplier.city}, {supplier.country}
                        </div>
                        {supplier.contact_email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {supplier.contact_email}
                          </div>
                        )}
                        {supplier.lead_time_days && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            Lead time: {supplier.lead_time_days} dias
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {(supplier.category || []).slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {categoryLabels[cat] || cat}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {supplier.total_orders || 0} pedidos
                        </span>
                        <span className="font-medium text-foreground">
                          R$ {(supplier.total_value || 0).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* RFQ TAB */}
          <TabsContent value="rfq" className="space-y-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Solicitações de Cotação (RFQ)</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova RFQ
                </Button>
              </CardHeader>
              <CardContent>
                {rfqLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Carregando...</p>
                ) : rfqRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma RFQ criada</p>
                    <Button variant="link" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Criar Primeira RFQ
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left p-3 text-muted-foreground font-medium">Nº RFQ</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Título</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Categoria</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Porto</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rfqRequests.map((rfq) => (
                          <tr key={rfq.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="p-3 font-mono text-sm text-foreground">{rfq.rfq_number}</td>
                            <td className="p-3 text-foreground">{rfq.title}</td>
                            <td className="p-3 text-muted-foreground">{categoryLabels[rfq.category] || rfq.category}</td>
                            <td className="p-3 text-muted-foreground">{rfq.delivery_port}</td>
                            <td className="p-3">
                              <Badge className={cn("border", statusColors[rfq.status])}>
                                {rfq.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-foreground">
                              {rfq.currency} {rfq.budget_estimate?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Pedidos de Compra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Truck className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Gestão de pedidos integrada</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Tracking de entregas, recebimentos e gestão de estoque
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
