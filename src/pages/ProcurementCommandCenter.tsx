/**
 * PROCUREMENT COMMAND CENTER
 * Módulo unificado de Procurement & Inventory AI + Autonomous Procurement + Supplier Marketplace
 * Gestão completa de compras, fornecedores, inventário e automação de procurement
 */

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { 
  Store, Search, Star, MapPin, Phone, Mail, Globe, 
  Plus, Filter, FileText, Send, Clock, CheckCircle2,
  TrendingUp, TrendingDown, Users, Package, Award,
  Brain, ShoppingCart, AlertTriangle, DollarSign,
  Truck, Sparkles, Building2, Zap, RefreshCw, ArrowRight,
  BarChart3, Edit, Trash2, Download, Eye, Copy
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
  status: 'critical' | 'low' | 'normal' | 'excess';
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
  urgency: 'immediate' | 'soon' | 'planned';
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
  sent: "bg-primary/20 text-primary border-primary/30",
  quoted: "bg-warning/20 text-warning border-warning/30",
  awarded: "bg-success/20 text-success border-success/30",
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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Dialog States
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [showNewRFQDialog, setShowNewRFQDialog] = useState(false);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [showAlternativesDialog, setShowAlternativesDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<PurchaseRecommendation | null>(null);
  
  // Form States
  const [newSupplier, setNewSupplier] = useState({ company_name: "", contact_email: "", contact_phone: "", city: "", country: "", category: "" });
  const [newRFQ, setNewRFQ] = useState({ title: "", category: "spare_parts", delivery_port: "", budget_estimate: 0, deadline: "" });
  const [newItem, setNewItem] = useState({ name: "", item_code: "", category: "", current_stock: 0, minimum_stock: 0, maximum_stock: 100, unit_cost: 0, location: "" });
  
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
    try {
      // Load real inventory data for stock analysis
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- inventory_items not in generated types
      const { data: invData, error: invError } = await (supabase.from as Function)("inventory_items")
        .select("*")
        .order("current_stock", { ascending: true });

      if (invError) throw invError;

      const realItems = (invData || []) as Record<string, unknown>[];
      
      // Build stock items from real inventory
      const realStock: StockItem[] = realItems.map((item: Record<string, unknown>) => {
        const current = Number(item.current_stock) || 0;
        const min = Number(item.minimum_stock) || 10;
        const max = Number(item.maximum_stock) || 100;
        const avgConsumption = Math.max(1, Math.round(min / 7));
        const daysUntilEmpty = avgConsumption > 0 ? Math.round(current / avgConsumption) : 999;
        let status: StockItem['status'] = 'normal';
        if (current <= 0 || daysUntilEmpty <= 3) status = 'critical';
        else if (current < min) status = 'low';
        else if (current > max * 0.9) status = 'excess';

        return {
          id: String(item.id),
          name: String(item.name || 'Item sem nome'),
          category: String(item.category || 'Geral'),
          currentStock: current,
          minStock: min,
          maxStock: max,
          unit: 'un',
          avgConsumption,
          daysUntilEmpty,
          status,
          autoOrderEnabled: current < min,
        };
      });

      // Build recommendations from critical/low stock items
      const criticalItems = realStock.filter(s => s.status === 'critical' || s.status === 'low');
      const bestSupplier = suppliers.length > 0 
        ? { id: suppliers[0].id, name: suppliers[0].company_name, rating: suppliers[0].rating || 4.0, leadTime: suppliers[0].lead_time_days || 5 }
        : { id: 'none', name: 'Nenhum fornecedor', rating: 0, leadTime: 0 };

      const realRecommendations: PurchaseRecommendation[] = criticalItems.slice(0, 5).map((item) => ({
        id: `rec-${item.id}`,
        item,
        suggestedQuantity: Math.max(item.minStock - item.currentStock, item.minStock),
        suggestedSupplier: bestSupplier,
        estimatedCost: Math.round((item.minStock - item.currentStock) * 50),
        urgency: item.status === 'critical' ? 'immediate' as const : 'soon' as const,
        aiReasoning: item.status === 'critical' 
          ? `Estoque crítico com apenas ${item.daysUntilEmpty} dias de suprimento. Reposição urgente necessária.`
          : `Estoque abaixo do mínimo (${item.currentStock}/${item.minStock}). Pedido preventivo recomendado.`,
        savingsOpportunity: Math.round((item.minStock - item.currentStock) * 2.5),
      }));

      setStockItems(realStock.length > 0 ? realStock : []);
      setRecommendations(realRecommendations);

      // Calculate stats from real data
      const pendingRfqs = rfqRequests.filter((r) => r.status === 'sent' || r.status === 'draft').length;
      const awardedRfqs = rfqRequests.filter((r) => r.status === 'awarded').length;
      const totalSavings = realRecommendations.reduce((sum, r) => sum + r.savingsOpportunity, 0);
      const avgRating = suppliers.length > 0 
        ? Math.round(suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length * 10) 
        : 0;

      setAiStats({
        pendingOrders: pendingRfqs,
        autoOrders: awardedRfqs,
        savingsThisMonth: totalSavings,
        supplierScore: avgRating,
      });
    } catch (error) {
      logger.error('Error loading procurement data', error as Error);
      setStockItems([]);
      setRecommendations([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      setInventoryLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- inventory_items not in generated types
      const { data, error } = await (supabase.from as Function)("inventory_items")
        .select("*")
        .order("name");

      if (error) throw error;
      setInventoryItems((data as unknown as InventoryItem[]) || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao carregar inventário",
        description: errorMessage,
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
  const criticalStockItems = stockItems.filter(item => item.status === 'critical' || item.status === 'low');
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + (item.total_value || 0), 0);

  const filteredSuppliers = suppliers.filter(s => 
    s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'low': return 'bg-warning text-warning-foreground';
      case 'normal': return 'bg-success text-success-foreground';
      case 'excess': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'soon': return 'text-warning bg-warning/10 border-warning/30';
      case 'planned': return 'text-info bg-info/10 border-info/30';
      default: return 'text-muted-foreground bg-muted/10';
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
    try {
      // Create purchase order in database
      const { error } = await (supabase.from as Function)("rfq_requests").insert({
        title: `Pedido Automático - ${rec.item.name}`,
        category: rec.item.category.toLowerCase().replace(/ /g, '_'),
        status: 'sent',
        budget_estimate: rec.estimatedCost,
        currency: 'BRL',
        rfq_number: `RFQ-AUTO-${Date.now()}`
      });
      
      if (error) throw error;
      
      // Remove from recommendations
      setRecommendations(prev => prev.filter(r => r.id !== rec.id));
      setAiStats(prev => ({ ...prev, pendingOrders: prev.pendingOrders + 1, autoOrders: prev.autoOrders + 1 }));
      
      toast({
        title: "✅ Compra Iniciada",
        description: `Pedido de ${rec.suggestedQuantity} ${rec.item.unit} de ${rec.item.name} enviado para ${rec.suggestedSupplier.name}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao criar pedido",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleCreateSupplier = async () => {
    try {
      const { error } = await supabase.from("suppliers").insert({
        ...newSupplier,
        trading_name: newSupplier.company_name,
        category: [newSupplier.category],
        services: [],
        ports_served: [],
        countries: [newSupplier.country],
        rating: 0,
        total_orders: 0,
        total_value: 0,
        is_approved: false,
        is_active: true
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setShowNewSupplierDialog(false);
      setNewSupplier({ company_name: "", contact_email: "", contact_phone: "", city: "", country: "", category: "" });
      toast({ title: "✅ Fornecedor cadastrado", description: "Aguardando aprovação" });
    } catch (error) {
      toast({ title: "Erro ao cadastrar", description: "Tente novamente", variant: "destructive" });
    }
  };

  const handleCreateRFQ = async () => {
    try {
      const { error } = await (supabase.from as Function)("rfq_requests").insert({
        ...newRFQ,
        rfq_number: `RFQ-${Date.now()}`,
        status: 'draft',
        currency: 'BRL'
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["rfq-requests"] });
      setShowNewRFQDialog(false);
      setNewRFQ({ title: "", category: "spare_parts", delivery_port: "", budget_estimate: 0, deadline: "" });
      toast({ title: "✅ RFQ criada", description: "Solicitação de cotação registrada" });
    } catch (error) {
      toast({ title: "Erro ao criar RFQ", description: "Tente novamente", variant: "destructive" });
    }
  };

  const handleCreateItem = async () => {
    try {
      const { error } = await (supabase.from as Function)("inventory_items").insert({
        ...newItem,
        status: 'active',
        total_value: newItem.current_stock * newItem.unit_cost
      });
      
      if (error) throw error;
      
      loadInventoryItems();
      setShowNewItemDialog(false);
      setNewItem({ name: "", item_code: "", category: "", current_stock: 0, minimum_stock: 0, maximum_stock: 100, unit_cost: 0, location: "" });
      toast({ title: "✅ Item adicionado", description: "Item de inventário cadastrado com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao adicionar item", description: "Tente novamente", variant: "destructive" });
    }
  };

  const handleViewAlternatives = (rec: PurchaseRecommendation) => {
    setSelectedRecommendation(rec);
    setShowAlternativesDialog(true);
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
            <Button variant="outline" className="gap-2" onClick={() => loadAIProcurementData()}>
              <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
              Analisar
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setShowNewSupplierDialog(true)}>
              <Plus className="h-4 w-4" />
              Novo Fornecedor
            </Button>
            <Button className="gap-2" onClick={() => setShowNewRFQDialog(true)}>
              <FileText className="h-4 w-4" />
              Nova RFQ
            </Button>
          </div>
        </div>

        {/* KPI Cards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <ShoppingCart className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
                  <p className="text-2xl font-bold">{aiStats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-info/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auto-Compras</p>
                  <p className="text-2xl font-bold">{aiStats.autoOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Economia (mês)</p>
                  <p className="text-2xl font-bold text-success">R$ {aiStats.savingsThisMonth.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estoque Crítico</p>
                  <p className="text-2xl font-bold text-warning">{criticalStockItems.length}</p>
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
                <div className="p-2 rounded-lg bg-warning/20">
                  <Send className="h-5 w-5 text-warning" />
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
                    <Brain className="h-5 w-5 text-primary" />
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
                        {rec.urgency === 'immediate' ? 'Urgente' : rec.urgency === 'soon' ? 'Em breve' : 'Planejado'}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("ai-recommendations")}>
                    Ver Todas Recomendações
                  </Button>
                </CardContent>
              </Card>

              {/* Critical Stock */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
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
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("inventory")}>
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
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("suppliers")}>
                    Ver Todos Fornecedores
                  </Button>
                </CardContent>
              </Card>

              {/* Recent RFQs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-info" />
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
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("rfq")}>
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
                  rec.urgency === 'immediate' ? 'border-l-destructive' :
                  rec.urgency === 'soon' ? 'border-l-warning' : 'border-l-info'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getUrgencyColor(rec.urgency)}>
                            {rec.urgency === 'immediate' ? 'Urgente' : 
                             rec.urgency === 'soon' ? 'Em breve' : 'Planejado'}
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
                              <Star className="h-3 w-3 text-warning fill-warning" />
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

                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium text-primary">Análise IA</span>
                          </div>
                          <p className="text-sm">{rec.aiReasoning}</p>
                        </div>

                        {rec.savingsOpportunity > 0 && (
                          <div className="flex items-center gap-2 text-green-600">
                            <TrendingUp className="h-4 w-4 text-success" />
                            <span className="text-sm font-medium">
                              Oportunidade de economia: R$ {rec.savingsOpportunity.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          onClick={() => executeAutoPurchase(rec)}
                          className={rec.urgency === 'immediate' ? 'bg-destructive hover:bg-destructive/90' : ''}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {rec.urgency === 'immediate' ? 'Comprar Agora' : 'Aprovar Compra'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewAlternatives(rec)}>
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
                              {item.status === 'critical' ? 'Crítico' : 'Baixo'}
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
                              item.status === 'critical' ? '[&>div]:bg-destructive' :
                              item.status === 'low' ? '[&>div]:bg-warning' : ''
                              }`}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Mínimo: {item.minStock}</span>
                              <span className={item.daysUntilEmpty <= 7 ? 'text-destructive font-medium' : ''}>
                                {item.daysUntilEmpty} dias até esgotamento
                              </span>
                            </div>
                          </div>

                          {item.autoOrderEnabled && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-success">
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              <Button onClick={() => setShowNewItemDialog(true)}>
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
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{item.name}</h4>
                            <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
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
                          <Button size="sm" variant="outline" aria-label="Copiar dados do item" title="Copiar dados" onClick={() => { navigator.clipboard.writeText(`Item: ${item.name} | Estoque: ${item.current_stock}/${item.minimum_stock} | Valor: R$ ${item.total_value?.toFixed(2) || '0.00'}`); toast({ title: "✏️ Dados copiados", description: "Dados do item copiados para clipboard." }); }}>
                            <Copy className="h-4 w-4" />
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2" onClick={() => { setSearchQuery(''); }}>
                <Filter className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliersLoading ? (
                <p className="col-span-full text-center py-8 text-muted-foreground">Carregando...</p>
              ) : filteredSuppliers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Store className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
                  <Button variant="link" className="mt-2" onClick={() => { setActiveTab('suppliers'); }}>
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
                          <Badge className="bg-success/20 text-success border-success/30">
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
                <Button size="sm" className="gap-2" onClick={() => setShowNewRFQDialog(true)}>
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
                    <Button variant="link" className="mt-2" onClick={() => setShowNewRFQDialog(true)}>
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

        {/* New Supplier Dialog */}
        <Dialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
              <DialogDescription>Preencha os dados do fornecedor para cadastro</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Empresa *</Label>
                <Input 
                  value={newSupplier.company_name} 
                  onChange={(e) => setNewSupplier({...newSupplier, company_name: e.target.value})}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email de Contato</Label>
                  <Input 
                    type="email"
                    value={newSupplier.contact_email} 
                    onChange={(e) => setNewSupplier({...newSupplier, contact_email: e.target.value})}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={newSupplier.contact_phone} 
                    onChange={(e) => setNewSupplier({...newSupplier, contact_phone: e.target.value})}
                    placeholder="+55 21 99999-9999"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input 
                    value={newSupplier.city} 
                    onChange={(e) => setNewSupplier({...newSupplier, city: e.target.value})}
                    placeholder="Rio de Janeiro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input 
                    value={newSupplier.country} 
                    onChange={(e) => setNewSupplier({...newSupplier, country: e.target.value})}
                    placeholder="Brasil"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria Principal</Label>
                <Select value={newSupplier.category} onValueChange={(v) => setNewSupplier({...newSupplier, category: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSupplierDialog(false)}>Cancelar</Button>
              <Button onClick={handleCreateSupplier} disabled={!newSupplier.company_name}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Fornecedor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New RFQ Dialog */}
        <Dialog open={showNewRFQDialog} onOpenChange={setShowNewRFQDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Cotação (RFQ)</DialogTitle>
              <DialogDescription>Crie uma nova RFQ para solicitar cotações de fornecedores</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input 
                  value={newRFQ.title} 
                  onChange={(e) => setNewRFQ({...newRFQ, title: e.target.value})}
                  placeholder="Ex: Compra de filtros para motor principal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={newRFQ.category} onValueChange={(v) => setNewRFQ({...newRFQ, category: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Porto de Entrega</Label>
                  <Input 
                    value={newRFQ.delivery_port} 
                    onChange={(e) => setNewRFQ({...newRFQ, delivery_port: e.target.value})}
                    placeholder="Ex: Porto de Santos"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Orçamento Estimado (R$)</Label>
                  <Input 
                    type="number"
                    value={newRFQ.budget_estimate} 
                    onChange={(e) => setNewRFQ({...newRFQ, budget_estimate: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Limite</Label>
                  <Input 
                    type="date"
                    value={newRFQ.deadline} 
                    onChange={(e) => setNewRFQ({...newRFQ, deadline: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewRFQDialog(false)}>Cancelar</Button>
              <Button onClick={handleCreateRFQ} disabled={!newRFQ.title}>
                <FileText className="h-4 w-4 mr-2" />
                Criar RFQ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Inventory Item Dialog */}
        <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
              <DialogDescription>Cadastre um novo item no sistema de inventário</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input 
                    value={newItem.name} 
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Nome do item"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input 
                    value={newItem.item_code} 
                    onChange={(e) => setNewItem({...newItem, item_code: e.target.value})}
                    placeholder="SKU-001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input 
                    value={newItem.category} 
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    placeholder="Ex: Lubrificantes"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Input 
                    value={newItem.location} 
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    placeholder="Ex: Armazém A"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estoque Atual</Label>
                  <Input 
                    type="number"
                    value={newItem.current_stock} 
                    onChange={(e) => setNewItem({...newItem, current_stock: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mínimo</Label>
                  <Input 
                    type="number"
                    value={newItem.minimum_stock} 
                    onChange={(e) => setNewItem({...newItem, minimum_stock: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Máximo</Label>
                  <Input 
                    type="number"
                    value={newItem.maximum_stock} 
                    onChange={(e) => setNewItem({...newItem, maximum_stock: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Custo Unitário (R$)</Label>
                <Input 
                  type="number"
                  value={newItem.unit_cost} 
                  onChange={(e) => setNewItem({...newItem, unit_cost: Number(e.target.value)})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>Cancelar</Button>
              <Button onClick={handleCreateItem} disabled={!newItem.name}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alternatives Dialog */}
        <Dialog open={showAlternativesDialog} onOpenChange={setShowAlternativesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fornecedores Alternativos</DialogTitle>
              <DialogDescription>
                {selectedRecommendation && `Alternativas para: ${selectedRecommendation.item.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {suppliers.slice(0, 5).map((supplier, index) => (
                <div key={supplier.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{supplier.company_name}</p>
                      <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {renderStars(supplier.rating)}
                    <Badge variant="outline">{supplier.lead_time_days || 5} dias</Badge>
                    <Button size="sm" onClick={() => {
                      toast({ title: "Fornecedor Selecionado", description: `${supplier.company_name} foi selecionado` });
                      setShowAlternativesDialog(false);
                    }}>
                      Selecionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlternativesDialog(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
