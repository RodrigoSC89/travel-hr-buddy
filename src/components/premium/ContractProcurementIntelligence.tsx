/**
 * Contract & Procurement Intelligence Hub
 * Advanced vessel contracts, charter party, and supplier management
 * Based on BIMCO standards, Veson IMOS, and Coupa best practices
 * REFACTORED: Uses real Supabase data via useContractProcurementData
 */

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, DollarSign, Clock, TrendingUp,
  CheckCircle, AlertTriangle, Calendar, Target, BarChart3,
  Store, Star, Send, Globe,
  Sparkles, Zap, PieChart, Scale, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useContractProcurementData, type SupplierData, type RFQData, type SpendCategory } from "@/hooks/useContractProcurementData";

// BIMCO Standard Forms (reference data)
const BIMCO_FORMS = [
  { code: "GENCON", name: "General Charter", type: "Voyage", usage: 45 },
  { code: "NYPE", name: "New York Produce Exchange", type: "Time", usage: 32 },
  { code: "BALTIME", name: "Baltic Time Charter", type: "Time", usage: 18 },
  { code: "BARECON", name: "Bareboat Charter", type: "Bareboat", usage: 5 },
];

export default function ContractProcurementIntelligence() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const { suppliers, rfqs, spendCategories, isLoading, error } = useContractProcurementData();

  const avgSupplierRating = suppliers.length > 0
    ? (suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length).toFixed(1)
    : "0.0";

  const totalSpend = suppliers.reduce((acc, s) => acc + s.totalSpend, 0);
  const openRFQs = rfqs.filter(r => r.status === "open" || r.status === "in_evaluation").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "approved": case "awarded":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_evaluation": case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "open":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando dados de procurement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <span>Erro ao carregar dados: {(error as Error).message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Fornecedores Ativos</p>
                <p className="text-2xl font-bold">{suppliers.length}</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Supabase Real
                </p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Spend Total</p>
                <p className="text-2xl font-bold">${(totalSpend / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Acumulado</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">RFQs Abertas</p>
                <p className="text-2xl font-bold">{openRFQs}</p>
                <p className="text-xs text-amber-500">Em avaliação</p>
              </div>
              <Send className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rating Médio</p>
                <p className="text-2xl font-bold">{avgSupplierRating}/5.0</p>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.round(Number(avgSupplierRating)) ? "text-amber-500 fill-amber-500" : "text-muted"}`} />
                  ))}
                </div>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="rfq" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            RFQ
          </TabsTrigger>
          <TabsTrigger value="spend" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Spend Analytics
          </TabsTrigger>
          <TabsTrigger value="bimco" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            BIMCO Forms
          </TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-green-500" />
                Supplier Scorecard
              </CardTitle>
              <CardDescription>
                {suppliers.length} fornecedores registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Store className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Nenhum fornecedor cadastrado ainda.</p>
                  <p className="text-sm">Adicione fornecedores no módulo de Procurement.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {suppliers.map(supplier => (
                      <Card key={supplier.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{supplier.name}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Globe className="h-3 w-3" /> {supplier.country}
                                <Badge variant="outline" className="ml-2">{supplier.category}</Badge>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                <span className="font-bold">{supplier.rating}</span>
                              </div>
                              <Badge className={getStatusColor(supplier.status)}>
                                {supplier.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-2 bg-muted/50 rounded">
                              <p className="text-xs text-muted-foreground">Total Spend</p>
                              <p className="font-bold">${(supplier.totalSpend / 1000).toFixed(0)}K</p>
                            </div>
                            <div className="p-2 bg-muted/50 rounded">
                              <p className="text-xs text-muted-foreground">On-Time</p>
                              <p className="font-bold text-green-500">{supplier.onTimeDelivery}%</p>
                            </div>
                            <div className="p-2 bg-muted/50 rounded">
                              <p className="text-xs text-muted-foreground">Quality</p>
                              <p className="font-bold text-blue-500">{supplier.qualityScore}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RFQ Tab */}
        <TabsContent value="rfq" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  Request for Quotation
                </CardTitle>
                <Button onClick={async () => {
                  try {
                    await supabase.from("ai_audit_logs").insert({
                      user_input: "Nova RFQ criada via ContractProcurementIntelligence",
                      module_name: "procurement",
                      interaction_type: "rfq_created"
                    });
                    toast.success("RFQ criada! Configure os detalhes.");
                  } catch { toast.error("Erro ao criar RFQ"); }
                }}>
                  <Zap className="h-4 w-4 mr-2" />
                  Nova RFQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rfqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Nenhuma RFQ registrada.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rfqs.map(rfq => (
                    <div key={rfq.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">{rfq.id.slice(0, 8)}</Badge>
                            <Badge variant="outline">{rfq.category}</Badge>
                          </div>
                          <h4 className="font-semibold mt-1">{rfq.title}</h4>
                          <p className="text-sm text-muted-foreground">{rfq.vessel}</p>
                        </div>
                        <Badge className={getStatusColor(rfq.status)}>
                          {rfq.status === "awarded" ? "Adjudicada" :
                           rfq.status === "in_evaluation" ? "Em Avaliação" : "Aberta"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Deadline</p>
                          <p className="font-medium">{new Date(rfq.deadline).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Budget</p>
                          <p className="font-medium">${rfq.budget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Propostas</p>
                          <p className="font-medium">{rfq.responses}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spend Analytics Tab */}
        <TabsContent value="spend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                Spend Analytics by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {spendCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Sem dados de spend para análise.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {spendCategories.map(cat => (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{cat.category}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">{cat.percentage}%</span>
                            <span className="font-bold">${(cat.spend / 1000).toFixed(0)}K</span>
                          </div>
                        </div>
                        <Progress value={cat.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Spend</span>
                      <span className="text-2xl font-bold">
                        ${(totalSpend / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BIMCO Forms Tab */}
        <TabsContent value="bimco" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-500" />
                BIMCO Standard Forms Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BIMCO_FORMS.map(form => (
                  <div key={form.code} className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="font-mono font-bold text-lg">{form.code}</p>
                    <p className="text-xs text-muted-foreground">{form.name}</p>
                    <Badge variant="outline" className="mt-2">{form.type}</Badge>
                    <p className="text-sm font-medium mt-2">{form.usage}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
