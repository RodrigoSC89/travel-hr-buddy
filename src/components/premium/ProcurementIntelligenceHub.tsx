/**
 * Procurement Intelligence Hub
 * Advanced procurement with RFQ automation, supplier scoring, and spend analytics
 * PATCH Sprint 15: Replaced mock data with useProcurementIntelligenceData hook
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart, Package, Store, FileText, Truck,
  BarChart3, DollarSign, Star, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Users, Target, Zap, Brain,
  ArrowRight, PieChart, Award, Calendar, Send,
  ThumbsUp, ThumbsDown, Timer, Globe, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useProcurementIntelligenceData, type Supplier, type RFQ } from "@/hooks/useProcurementIntelligenceData";

export default function ProcurementIntelligenceHub() {
  const { data, isLoading } = useProcurementIntelligenceData();
  const suppliers = data?.suppliers || [];
  const rfqs = data?.rfqs || [];
  const spendByCategory = data?.spendByCategory || [];

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);

  // Select first items once data loads
  React.useEffect(() => {
    if (suppliers.length > 0 && !selectedSupplier) setSelectedSupplier(suppliers[0]);
    if (rfqs.length > 0 && !selectedRFQ) setSelectedRFQ(rfqs[0]);
  }, [suppliers, rfqs]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={`proc-intel-skeleton-${i}`} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": case "awarded": case "ordered": return "bg-success/10 text-success";
      case "pending": case "sent": case "quoted": return "bg-warning/10 text-warning";
      case "evaluating": return "bg-info/10 text-info";
      case "blocked": case "rejected": return "bg-destructive/10 text-destructive";
      case "draft": case "closed": return "bg-muted text-muted-foreground";
      default: return "bg-muted";
    }
  };

  const totalSpend = suppliers.reduce((sum, s) => sum + s.totalSpend, 0);
  const avgRating = suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length : 0;
  const pendingRFQs = rfqs.filter(r => ["sent", "quoted", "evaluating"].includes(r.status)).length;
  const totalSavings = rfqs.reduce((sum, r) => sum + (r.savings || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Spend YTD</span>
            </div>
            <p className="text-2xl font-bold">R$ {(totalSpend / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Savings</span>
            </div>
            <p className="text-2xl font-bold">R$ {(totalSavings / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">RFQs Pendentes</span>
            </div>
            <p className="text-2xl font-bold">{pendingRFQs}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-4 w-4 text-info" />
              <span className="text-xs text-muted-foreground">Fornecedores</span>
            </div>
            <p className="text-2xl font-bold">{suppliers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Rating Médio</span>
            </div>
            <p className="text-2xl font-bold">{avgRating.toFixed(1)}/5</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">RFQs Total</span>
            </div>
            <p className="text-2xl font-bold">{rfqs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="spend-analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spend-analytics" className="gap-2">
            <PieChart className="h-4 w-4" />
            Spend Analytics
          </TabsTrigger>
          <TabsTrigger value="rfq-management" className="gap-2">
            <FileText className="h-4 w-4" />
            RFQ Management
          </TabsTrigger>
          <TabsTrigger value="supplier-portal" className="gap-2">
            <Store className="h-4 w-4" />
            Supplier Portal
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Spend Analytics */}
        <TabsContent value="spend-analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Spend by Category
                  <Badge variant="outline">YTD</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendByCategory.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">R$ {(item.value / 1000).toFixed(0)}K</span>
                          <Badge variant="outline">{item.percentage}%</Badge>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                  {spendByCategory.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum dado de spend disponível. Cadastre fornecedores para visualizar.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Suppliers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suppliers.slice(0, 4).sort((a, b) => b.totalSpend - a.totalSpend).map((supplier, idx) => (
                    <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                          {idx + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground">{supplier.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {(supplier.totalSpend / 1000).toFixed(0)}K</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-warning" />
                          <span className="text-xs">{supplier.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RFQ Management */}
        <TabsContent value="rfq-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  RFQs
                </span>
                <Button size="sm">+ Nova RFQ</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {rfqs.map((rfq) => (
                    <div
                      key={rfq.id}
                      onClick={() => setSelectedRFQ(rfq)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        selectedRFQ?.id === rfq.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{rfq.rfqNumber}</p>
                        <Badge className={getStatusColor(rfq.status)}>{rfq.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rfq.title}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{rfq.vessel}</span>
                        <span>Budget: R$ {rfq.budget.toLocaleString()}</span>
                      </div>
                      {rfq.savings && rfq.savings > 0 && (
                        <Badge className="mt-2 bg-success/10 text-success">
                          Economia: R$ {rfq.savings.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {rfqs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma RFQ encontrada. Crie sua primeira RFQ.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Portal */}
        <TabsContent value="supplier-portal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Portal de Fornecedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      onClick={() => setSelectedSupplier(supplier)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        selectedSupplier?.id === supplier.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground">{supplier.category} • {supplier.country}</p>
                        </div>
                        <Badge className={getStatusColor(supplier.status)}>{supplier.status}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
                        <div className="bg-muted/50 rounded p-2">
                          <p className="font-bold">{supplier.rating.toFixed(1)}</p>
                          <p className="text-muted-foreground">Rating</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <p className="font-bold">{supplier.onTimeDelivery}%</p>
                          <p className="text-muted-foreground">On-Time</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <p className="font-bold">{supplier.qualityScore}%</p>
                          <p className="text-muted-foreground">Quality</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <p className="font-bold">{supplier.responseTime}h</p>
                          <p className="text-muted-foreground">Response</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Procurement Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-success/10 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Consolidação de Pedidos
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Agrupar pedidos de {suppliers.length} fornecedores pode gerar economia.
                  </p>
                  <Badge className="bg-success/10 text-success">Economia potencial: 12%</Badge>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Contratos Expirando
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {suppliers.filter(s => new Date(s.contractEnd) < new Date(Date.now() + 90 * 86400000)).length} contratos expiram em 90 dias.
                  </p>
                  <Badge className="bg-warning/10 text-warning">Renegociação recomendada</Badge>
                </div>
                <div className="p-4 bg-info/10 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-info" />
                    Diversificação
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Set(suppliers.map(s => s.country)).size} países na base de fornecedores.
                  </p>
                  <Badge className="bg-info/10 text-info">Diversificação geográfica</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
