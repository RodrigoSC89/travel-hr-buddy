/**
 * Procurement Tabs - All tab content for ProcurementCommandCenter
 */
import { lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Store, Search, Star, MapPin, Clock, Mail, CheckCircle2,
  Plus, Filter, FileText, Brain, ShoppingCart, AlertTriangle,
  Truck, Package, Award, BarChart3, Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PurchaseOrdersManager } from '@/components/procurement/PurchaseOrdersManager';
import { ApprovalWorkflow } from '@/components/procurement/ApprovalWorkflow';
import { SupplierScorecard } from '@/components/procurement/SupplierScorecard';
import { 
  statusColors, categoryLabels, getStatusColor, getUrgencyColor,
  type Supplier, type RFQRequest, type StockItem, type PurchaseRecommendation, type InventoryItem 
} from "./types";

const SpendAnalyticsDashboard = lazy(() => import('@/components/procurement/SpendAnalyticsDashboard'));

interface ProcurementTabsProps {
  activeTab: string;
  setActiveTab: (v: string) => void;
  suppliers: Supplier[];
  rfqRequests: RFQRequest[];
  recommendations: PurchaseRecommendation[];
  criticalStockItems: StockItem[];
  stockItems: StockItem[];
  inventoryItems: InventoryItem[];
  filteredSuppliers: Supplier[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  suppliersLoading: boolean;
  rfqLoading: boolean;
  inventoryLoading: boolean;
  inventoryValue: number;
  onExecuteAutoPurchase: (rec: PurchaseRecommendation) => void;
  onViewAlternatives: (rec: PurchaseRecommendation) => void;
  onShowNewRFQDialog: () => void;
  onShowNewItemDialog: () => void;
  onCopyItem: (item: InventoryItem) => void;
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={cn("h-3.5 w-3.5", star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating?.toFixed(1) || "N/A"})</span>
    </div>
  );
}

export function ProcurementTabs(props: ProcurementTabsProps) {
  const {
    activeTab, setActiveTab, suppliers, rfqRequests, recommendations,
    criticalStockItems, stockItems, inventoryItems, filteredSuppliers,
    searchQuery, setSearchQuery, suppliersLoading, rfqLoading,
    inventoryLoading, inventoryValue, onExecuteAutoPurchase,
    onViewAlternatives, onShowNewRFQDialog, onShowNewItemDialog, onCopyItem
  } = props;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" />Overview</TabsTrigger>
        <TabsTrigger value="ai-recommendations" className="gap-2"><Brain className="h-4 w-4" />IA Compras</TabsTrigger>
        <TabsTrigger value="inventory" className="gap-2"><Package className="h-4 w-4" />Inventário</TabsTrigger>
        <TabsTrigger value="suppliers" className="gap-2"><Store className="h-4 w-4" />Fornecedores</TabsTrigger>
        <TabsTrigger value="rfq" className="gap-2"><FileText className="h-4 w-4" />RFQ/Cotações</TabsTrigger>
        <TabsTrigger value="orders" className="gap-2"><Truck className="h-4 w-4" />Pedidos</TabsTrigger>
        <TabsTrigger value="approvals" className="gap-2"><CheckCircle2 className="h-4 w-4" />Aprovações</TabsTrigger>
        <TabsTrigger value="scorecard" className="gap-2"><Award className="h-4 w-4" />Scorecard</TabsTrigger>
        <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" />Analytics</TabsTrigger>
      </TabsList>

      {/* OVERVIEW TAB */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Recomendações IA</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="font-medium">{rec.item.name}</p><p className="text-sm text-muted-foreground">{rec.suggestedQuantity} {rec.item.unit} • R$ {rec.estimatedCost.toLocaleString()}</p></div>
                  <Badge className={getUrgencyColor(rec.urgency)}>{rec.urgency === 'immediate' ? 'Urgente' : rec.urgency === 'soon' ? 'Em breve' : 'Planejado'}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("ai-recommendations")}>Ver Todas Recomendações</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Estoque Crítico</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {criticalStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{item.currentStock} / {item.maxStock} {item.unit}</p></div>
                  <Badge className={getStatusColor(item.status)}>{item.daysUntilEmpty} dias</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("inventory")}>Ver Inventário Completo</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" />Top Fornecedores</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {suppliers.slice(0, 4).map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="font-medium">{supplier.company_name}</p><p className="text-sm text-muted-foreground">{supplier.city}, {supplier.country}</p></div>
                  {renderStars(supplier.rating)}
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("suppliers")}>Ver Todos Fornecedores</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-info" />RFQs Recentes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {rfqRequests.slice(0, 4).map((rfq) => (
                <div key={rfq.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="font-medium">{rfq.title}</p><p className="text-sm text-muted-foreground">{rfq.rfq_number}</p></div>
                  <Badge className={cn("border", statusColors[rfq.status])}>{rfq.status}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("rfq")}>Ver Todas RFQs</Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* AI RECOMMENDATIONS TAB */}
      <TabsContent value="ai-recommendations" className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div key={rec.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className={`border-l-4 ${rec.urgency === 'immediate' ? 'border-l-destructive' : rec.urgency === 'soon' ? 'border-l-warning' : 'border-l-info'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getUrgencyColor(rec.urgency)}>{rec.urgency === 'immediate' ? 'Urgente' : rec.urgency === 'soon' ? 'Em breve' : 'Planejado'}</Badge>
                      <h3 className="text-lg font-semibold">{rec.item.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Quantidade</p><p className="font-medium">{rec.suggestedQuantity} {rec.item.unit}</p></div>
                      <div><p className="text-muted-foreground">Fornecedor Sugerido</p><p className="font-medium flex items-center gap-1">{rec.suggestedSupplier.name}<Star className="h-3 w-3 text-warning fill-warning" />{rec.suggestedSupplier.rating}</p></div>
                      <div><p className="text-muted-foreground">Lead Time</p><p className="font-medium flex items-center gap-1"><Truck className="h-4 w-4" />{rec.suggestedSupplier.leadTime} dias</p></div>
                      <div><p className="text-muted-foreground">Custo Estimado</p><p className="font-medium">R$ {rec.estimatedCost.toLocaleString()}</p></div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1"><Brain className="h-4 w-4 text-primary" /><span className="text-xs font-medium text-primary">Análise IA</span></div>
                      <p className="text-sm">{rec.aiReasoning}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => onExecuteAutoPurchase(rec)} className={rec.urgency === 'immediate' ? 'bg-destructive hover:bg-destructive/90' : ''}>
                      <ShoppingCart className="h-4 w-4 mr-2" />{rec.urgency === 'immediate' ? 'Comprar Agora' : 'Aprovar Compra'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onViewAlternatives(rec)}>Ver Alternativas</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        <Card className="mt-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Itens com Estoque Crítico/Baixo</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticalStockItems.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge className={getStatusColor(item.status)}>{item.status === 'critical' ? 'Crítico' : 'Baixo'}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>{item.currentStock}/{item.maxStock} {item.unit}</span>
                      <span className="ml-4">{item.daysUntilEmpty} dias restantes</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* INVENTORY TAB */}
      <TabsContent value="inventory" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Inventário</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">Valor total: R$ {inventoryValue.toLocaleString()}</Badge>
              <Button size="sm" onClick={onShowNewItemDialog}><Plus className="h-4 w-4 mr-2" />Novo Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : inventoryItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum item no inventário</p>
                <Button variant="link" className="mt-2" onClick={onShowNewItemDialog}><Plus className="h-4 w-4 mr-1" />Adicionar Primeiro Item</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {inventoryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.item_code} • {item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.current_stock} / {item.minimum_stock}</p>
                        <p className="text-sm text-muted-foreground">{item.location}</p>
                      </div>
                      <Badge variant="outline">R$ {item.total_value?.toFixed(2) || '0.00'}</Badge>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button size="sm" variant="outline" aria-label="Copiar dados do item" title="Copiar dados" onClick={() => onCopyItem(item)}><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* SUPPLIERS TAB */}
      <TabsContent value="suppliers" className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar fornecedores por nome, cidade ou país..." className="pl-10 bg-muted/30" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setSearchQuery('')}><Filter className="h-4 w-4" />Limpar Filtros</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliersLoading ? (
            <p className="col-span-full text-center py-8 text-muted-foreground">Carregando...</p>
          ) : filteredSuppliers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Store className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
            </div>
          ) : (
            filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{supplier.company_name}</h3>
                      {supplier.trading_name && <p className="text-sm text-muted-foreground">{supplier.trading_name}</p>}
                    </div>
                    {supplier.is_approved && <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovado</Badge>}
                  </div>
                  {renderStars(supplier.rating)}
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{supplier.city}, {supplier.country}</div>
                    {supplier.contact_email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{supplier.contact_email}</div>}
                    {supplier.lead_time_days && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-3.5 w-3.5" />Lead time: {supplier.lead_time_days} dias</div>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(supplier.category || []).slice(0, 3).map((cat) => <Badge key={cat} variant="outline" className="text-xs">{categoryLabels[cat] || cat}</Badge>)}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{supplier.total_orders || 0} pedidos</span>
                    <span className="font-medium text-foreground">R$ {(supplier.total_value || 0).toLocaleString()}</span>
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
            <Button size="sm" className="gap-2" onClick={onShowNewRFQDialog}><Plus className="h-4 w-4" />Nova RFQ</Button>
          </CardHeader>
          <CardContent>
            {rfqLoading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : rfqRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma RFQ criada</p>
                <Button variant="link" className="mt-2" onClick={onShowNewRFQDialog}><Plus className="h-4 w-4 mr-1" />Criar Primeira RFQ</Button>
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
                        <td className="p-3"><Badge className={cn("border", statusColors[rfq.status])}>{rfq.status}</Badge></td>
                        <td className="p-3 text-foreground">{rfq.currency} {rfq.budget_estimate?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders"><PurchaseOrdersManager /></TabsContent>
      <TabsContent value="approvals"><ApprovalWorkflow /></TabsContent>
      <TabsContent value="scorecard"><SupplierScorecard /></TabsContent>
      <TabsContent value="analytics">
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
          <SpendAnalyticsDashboard />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
