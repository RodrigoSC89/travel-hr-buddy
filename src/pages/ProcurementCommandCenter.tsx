/**
 * PROCUREMENT COMMAND CENTER - Optimized with Framer Motion + React.memo + useCallback
 */
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { logger } from "@/lib/logger";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, FileText, RefreshCw, DollarSign, AlertTriangle, Users, Send, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { type Supplier, type RFQRequest, type StockItem, type PurchaseRecommendation, type InventoryItem } from "./procurement/types";
import { ProcurementTabs } from "./procurement/ProcurementTabs";
import { NewSupplierDialog, NewRFQDialog, NewItemDialog, AlternativesDialog } from "./procurement/ProcurementDialogs";
import { staggerContainer, kpiCard, fadeUp } from "@/lib/animations/motion-variants";

const KPICard = memo(({ icon: Icon, label, value, gradient, iconColor, borderColor, valueColor }: {
  icon: React.ElementType; label: string; value: string | number; gradient: string; iconColor: string; borderColor: string; valueColor?: string;
}) => (
  <motion.div variants={kpiCard}>
    <Card className={`${gradient ? `bg-gradient-to-br ${gradient}` : 'bg-card/50 backdrop-blur'} ${borderColor} hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor === 'text-primary' ? 'bg-primary/20' : iconColor === 'text-success' ? 'bg-success/20' : iconColor === 'text-warning' ? 'bg-warning/20' : 'bg-secondary/20'}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${valueColor || ''}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));
KPICard.displayName = 'KPICard';

export default function ProcurementCommandCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [showNewRFQDialog, setShowNewRFQDialog] = useState(false);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [showAlternativesDialog, setShowAlternativesDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<PurchaseRecommendation | null>(null);
  
  const [newSupplier, setNewSupplier] = useState({ company_name: "", contact_email: "", contact_phone: "", city: "", country: "", category: "" });
  const [newRFQ, setNewRFQ] = useState({ title: "", category: "spare_parts", delivery_port: "", budget_estimate: 0, deadline: "" });
  const [newItem, setNewItem] = useState({ name: "", item_code: "", category: "", current_stock: 0, minimum_stock: 0, maximum_stock: 100, unit_cost: 0, location: "" });
  
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiStats, setAiStats] = useState({ pendingOrders: 0, autoOrders: 0, savingsThisMonth: 0, supplierScore: 0 });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").eq("is_active", true).order("rating", { ascending: false });
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const { data: rfqRequests = [], isLoading: rfqLoading } = useQuery({
    queryKey: ["rfq-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rfq_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as RFQRequest[];
    },
  });

  const loadAIProcurementData = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const { data: invData, error: invError } = await fromUntyped("inventory_items").select("*").order("current_stock", { ascending: true });
      if (invError) throw invError;
      const realItems = (invData || []) as Record<string, unknown>[];
      
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
        return { id: String(item.id), name: String(item.name || 'Item sem nome'), category: String(item.category || 'Geral'), currentStock: current, minStock: min, maxStock: max, unit: 'un', avgConsumption, daysUntilEmpty, status, autoOrderEnabled: current < min };
      });

      const criticalItems = realStock.filter(s => s.status === 'critical' || s.status === 'low');
      const bestSupplier = suppliers.length > 0 
        ? { id: suppliers[0].id, name: suppliers[0].company_name, rating: suppliers[0].rating || 4.0, leadTime: suppliers[0].lead_time_days || 5 }
        : { id: 'none', name: 'Nenhum fornecedor', rating: 0, leadTime: 0 };

      const realRecommendations: PurchaseRecommendation[] = criticalItems.slice(0, 5).map((item) => ({
        id: `rec-${item.id}`, item,
        suggestedQuantity: Math.max(item.minStock - item.currentStock, item.minStock),
        suggestedSupplier: bestSupplier,
        estimatedCost: Math.round((item.minStock - item.currentStock) * 50),
        urgency: item.status === 'critical' ? 'immediate' as const : 'soon' as const,
        aiReasoning: item.status === 'critical' ? `Estoque crítico com apenas ${item.daysUntilEmpty} dias de suprimento. Reposição urgente necessária.` : `Estoque abaixo do mínimo (${item.currentStock}/${item.minStock}). Pedido preventivo recomendado.`,
        savingsOpportunity: Math.round((item.minStock - item.currentStock) * 2.5),
      }));

      setStockItems(realStock.length > 0 ? realStock : []);
      setRecommendations(realRecommendations);

      const pendingRfqs = rfqRequests.filter((r) => r.status === 'sent' || r.status === 'draft').length;
      const awardedRfqs = rfqRequests.filter((r) => r.status === 'awarded').length;
      const totalSavings = realRecommendations.reduce((sum, r) => sum + r.savingsOpportunity, 0);
      const avgRating = suppliers.length > 0 ? Math.round(suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length * 10) : 0;
      setAiStats({ pendingOrders: pendingRfqs, autoOrders: awardedRfqs, savingsThisMonth: totalSavings, supplierScore: avgRating });
    } catch (error) {
      logger.error('Error loading procurement data', error as Error);
      setStockItems([]); setRecommendations([]);
    } finally { setIsAnalyzing(false); }
  }, [suppliers, rfqRequests]);

  const loadInventoryItems = useCallback(async () => {
    try {
      setInventoryLoading(true);
      const { data, error } = await fromUntyped("inventory_items").select("*").order("name");
      if (error) throw error;
      setInventoryItems((data as unknown as InventoryItem[]) || []);
    } catch (error: unknown) {
      toast({ title: "Erro ao carregar inventário", description: error instanceof Error ? error.message : "Erro desconhecido", variant: "destructive" });
    } finally { setInventoryLoading(false); }
  }, [toast]);

  useEffect(() => { loadAIProcurementData(); loadInventoryItems(); }, []);

  const approvedSuppliers = useMemo(() => suppliers.filter(s => s.is_approved), [suppliers]);
  const pendingRFQs = useMemo(() => rfqRequests.filter(r => r.status === "sent" || r.status === "quoted"), [rfqRequests]);
  const criticalStockItems = useMemo(() => stockItems.filter(item => item.status === 'critical' || item.status === 'low'), [stockItems]);
  const inventoryValue = useMemo(() => inventoryItems.reduce((sum, item) => sum + (item.total_value || 0), 0), [inventoryItems]);
  const filteredSuppliers = useMemo(() => suppliers.filter(s => s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city?.toLowerCase().includes(searchQuery.toLowerCase()) || s.country?.toLowerCase().includes(searchQuery.toLowerCase())), [suppliers, searchQuery]);

  const executeAutoPurchase = useCallback(async (rec: PurchaseRecommendation) => {
    try {
      const { error } = await fromUntyped("rfq_requests").insert({ title: `Pedido Automático - ${rec.item.name}`, category: rec.item.category.toLowerCase().replace(/ /g, '_'), status: 'sent', budget_estimate: rec.estimatedCost, currency: 'BRL', rfq_number: `RFQ-AUTO-${Date.now()}` });
      if (error) throw error;
      setRecommendations(prev => prev.filter(r => r.id !== rec.id));
      setAiStats(prev => ({ ...prev, pendingOrders: prev.pendingOrders + 1, autoOrders: prev.autoOrders + 1 }));
      toast({ title: "✅ Compra Iniciada", description: `Pedido de ${rec.suggestedQuantity} ${rec.item.unit} de ${rec.item.name} enviado para ${rec.suggestedSupplier.name}` });
    } catch { toast({ title: "Erro ao criar pedido", description: "Tente novamente", variant: "destructive" }); }
  }, [toast]);

  const handleCreateSupplier = useCallback(async () => {
    try {
      const { error } = await supabase.from("suppliers").insert({ ...newSupplier, trading_name: newSupplier.company_name, category: [newSupplier.category], services: [], ports_served: [], countries: [newSupplier.country], rating: 0, total_orders: 0, total_value: 0, is_approved: false, is_active: true });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setShowNewSupplierDialog(false);
      setNewSupplier({ company_name: "", contact_email: "", contact_phone: "", city: "", country: "", category: "" });
      toast({ title: "✅ Fornecedor cadastrado", description: "Aguardando aprovação" });
    } catch { toast({ title: "Erro ao cadastrar", description: "Tente novamente", variant: "destructive" }); }
  }, [newSupplier, queryClient, toast]);

  const handleCreateRFQ = useCallback(async () => {
    try {
      const { error } = await fromUntyped("rfq_requests").insert({ ...newRFQ, rfq_number: `RFQ-${Date.now()}`, status: 'draft', currency: 'BRL' });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["rfq-requests"] });
      setShowNewRFQDialog(false);
      setNewRFQ({ title: "", category: "spare_parts", delivery_port: "", budget_estimate: 0, deadline: "" });
      toast({ title: "✅ RFQ criada", description: "Solicitação de cotação registrada" });
    } catch { toast({ title: "Erro ao criar RFQ", description: "Tente novamente", variant: "destructive" }); }
  }, [newRFQ, queryClient, toast]);

  const handleCreateItem = useCallback(async () => {
    try {
      const { error } = await fromUntyped("inventory_items").insert({ ...newItem, status: 'active', total_value: newItem.current_stock * newItem.unit_cost });
      if (error) throw error;
      loadInventoryItems();
      setShowNewItemDialog(false);
      setNewItem({ name: "", item_code: "", category: "", current_stock: 0, minimum_stock: 0, maximum_stock: 100, unit_cost: 0, location: "" });
      toast({ title: "✅ Item adicionado", description: "Item de inventário cadastrado com sucesso" });
    } catch { toast({ title: "Erro ao adicionar item", description: "Tente novamente", variant: "destructive" }); }
  }, [newItem, loadInventoryItems, toast]);

  const handleViewAlternatives = useCallback((rec: PurchaseRecommendation) => { setSelectedRecommendation(rec); setShowAlternativesDialog(true); }, []);
  const handleCopyItem = useCallback((item: InventoryItem) => { navigator.clipboard.writeText(`Item: ${item.name} | Estoque: ${item.current_stock}/${item.minimum_stock} | Valor: R$ ${item.total_value?.toFixed(2) || '0.00'}`); toast({ title: "✏️ Dados copiados", description: "Dados do item copiados para clipboard." }); }, [toast]);

  const kpis = useMemo(() => [
    { icon: ShoppingCart, label: "Pedidos Pendentes", value: aiStats.pendingOrders, gradient: "from-secondary/10 to-accent/10", iconColor: "text-secondary-foreground", borderColor: "border-secondary/20" },
    { icon: Zap, label: "Auto-Compras", value: aiStats.autoOrders, gradient: "from-primary/10 to-info/10", iconColor: "text-primary", borderColor: "border-primary/20" },
    { icon: DollarSign, label: "Economia (mês)", value: `R$ ${aiStats.savingsThisMonth.toLocaleString()}`, gradient: "from-success/10 to-success/5", iconColor: "text-success", borderColor: "border-success/20", valueColor: "text-success" },
    { icon: AlertTriangle, label: "Estoque Crítico", value: criticalStockItems.length, gradient: "from-warning/10 to-warning/5", iconColor: "text-warning", borderColor: "border-warning/20", valueColor: "text-warning" },
    { icon: Users, label: "Fornecedores", value: approvedSuppliers.length, gradient: "", iconColor: "text-primary", borderColor: "border-border/50" },
    { icon: Send, label: "RFQs Pendentes", value: pendingRFQs.length, gradient: "", iconColor: "text-warning", borderColor: "border-border/50" },
  ], [aiStats, criticalStockItems.length, approvedSuppliers.length, pendingRFQs.length]);

  return (
    <>
      <Helmet>
        <title>Procurement Command Center | Nauti One</title>
        <meta name="description" content="Central de comando de procurement com IA, gestão de fornecedores, inventário e compras automatizadas" />
      </Helmet>

      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="min-h-screen bg-background p-6 space-y-6">
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />🛒 Procurement Command Center
            </h1>
            <p className="text-muted-foreground mt-1">Gestão inteligente de compras, fornecedores e inventário com IA</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => loadAIProcurementData()}>
              <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />Analisar
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setShowNewSupplierDialog(true)}><Plus className="h-4 w-4" />Novo Fornecedor</Button>
            <Button className="gap-2" onClick={() => setShowNewRFQDialog(true)}><FileText className="h-4 w-4" />Nova RFQ</Button>
          </div>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} icon={kpi.icon} label={kpi.label} value={kpi.value} gradient={kpi.gradient} iconColor={kpi.iconColor} borderColor={kpi.borderColor} valueColor={kpi.valueColor} />
          ))}
        </motion.div>

        <motion.div variants={fadeUp}>
          <ProcurementTabs
            activeTab={activeTab} setActiveTab={setActiveTab}
            suppliers={suppliers} rfqRequests={rfqRequests} recommendations={recommendations}
            criticalStockItems={criticalStockItems} stockItems={stockItems} inventoryItems={inventoryItems}
            filteredSuppliers={filteredSuppliers} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            suppliersLoading={suppliersLoading} rfqLoading={rfqLoading} inventoryLoading={inventoryLoading}
            inventoryValue={inventoryValue}
            onExecuteAutoPurchase={executeAutoPurchase}
            onViewAlternatives={handleViewAlternatives}
            onShowNewRFQDialog={() => setShowNewRFQDialog(true)}
            onShowNewItemDialog={() => setShowNewItemDialog(true)}
            onCopyItem={handleCopyItem}
          />
        </motion.div>

        <NewSupplierDialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog} newSupplier={newSupplier} setNewSupplier={setNewSupplier} onSubmit={handleCreateSupplier} />
        <NewRFQDialog open={showNewRFQDialog} onOpenChange={setShowNewRFQDialog} newRFQ={newRFQ} setNewRFQ={setNewRFQ} onSubmit={handleCreateRFQ} />
        <NewItemDialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog} newItem={newItem} setNewItem={setNewItem} onSubmit={handleCreateItem} />
        <AlternativesDialog open={showAlternativesDialog} onOpenChange={setShowAlternativesDialog} recommendation={selectedRecommendation} suppliers={suppliers} onSelect={(supplier) => { toast({ title: "Fornecedor Selecionado", description: `${supplier.company_name} foi selecionado` }); setShowAlternativesDialog(false); }} />
      </motion.div>
    </>
  );
}
