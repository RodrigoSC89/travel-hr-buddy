/**
 * PROCUREMENT WORKFLOW ENGINE
 * Workflow de aprovação multinível com comparativo de cotações IA
 * Benchmark: SAP Ariba, Coupa, Oracle Procurement Cloud
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingCart, FileCheck, Users, AlertTriangle, CheckCircle2,
  Clock, DollarSign, TrendingUp, Brain, Send, ChevronRight,
  MoreHorizontal, Plus, Search, Filter, ArrowUpDown, Download,
  Sparkles, Target, BarChart3, XCircle, RefreshCw, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Interfaces
interface ApprovalLevel {
  id: string;
  level: number;
  approverName: string;
  approverRole: string;
  approverAvatar?: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  approvedAt?: Date;
  comments?: string;
  threshold: number;
}

interface PurchaseRequisition {
  id: string;
  prNumber: string;
  title: string;
  requester: string;
  department: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "pending_approval" | "approved" | "rejected" | "completed";
  totalValue: number;
  currency: string;
  createdAt: Date;
  dueDate?: Date;
  currentLevel: number;
  approvalLevels: ApprovalLevel[];
  items: { description: string; quantity: number; unitPrice: number }[];
  aiScore?: number;
  aiRecommendation?: string;
}

interface QuotationComparison {
  id: string;
  rfqId: string;
  suppliers: {
    name: string;
    price: number;
    leadTime: number;
    quality: number;
    reliability: number;
    aiScore: number;
  }[];
  aiRecommendation: string;
  potentialSavings: number;
}

// Status configs
const statusConfig = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  pending_approval: { label: "Aguardando Aprovação", color: "bg-warning/20 text-warning" },
  approved: { label: "Aprovado", color: "bg-success/20 text-success" },
  rejected: { label: "Rejeitado", color: "bg-destructive/20 text-destructive" },
  completed: { label: "Concluído", color: "bg-primary/20 text-primary" },
};

const priorityConfig = {
  low: { label: "Baixa", color: "bg-muted" },
  medium: { label: "Média", color: "bg-warning/50" },
  high: { label: "Alta", color: "bg-orange-500/50" },
  urgent: { label: "Urgente", color: "bg-destructive" },
};

// Fallback data for empty states
const fallbackRequisitions: PurchaseRequisition[] = [
  {
    id: "1",
    prNumber: "PR-2026-0001",
    title: "Spare Parts - Main Engine Overhaul",
    requester: "Carlos Santos",
    department: "Engenharia",
    category: "Peças de Reposição",
    priority: "high",
    status: "pending_approval",
    totalValue: 45000,
    currency: "USD",
    createdAt: new Date(),
    currentLevel: 1,
    aiScore: 87,
    approvalLevels: [
      { id: "1", level: 1, approverName: "João Silva", approverRole: "Supervisor", status: "pending", threshold: 50000 },
    ],
    items: [{ description: "Cylinder Liner Set", quantity: 4, unitPrice: 5000 }],
  },
];

const fallbackComparison: QuotationComparison = {
  id: "1",
  rfqId: "RFQ-2026-0015",
  suppliers: [
    { name: "Marine Parts Global", price: 42500, leadTime: 14, quality: 4.5, reliability: 92, aiScore: 89 },
    { name: "Shiptech Solutions", price: 45000, leadTime: 10, quality: 4.8, reliability: 95, aiScore: 92 },
  ],
  aiRecommendation: "Recomendamos Shiptech Solutions.",
  potentialSavings: 3200,
};

export function ProcurementWorkflowEngine() {
  const [activeTab, setActiveTab] = useState("requisitions");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null);
  const [isNewPROpen, setIsNewPROpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>(fallbackRequisitions);
  const [comparison] = useState<QuotationComparison>(fallbackComparison);

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const { data, error } = await supabase
          .from("action_items")
          .select("*")
          .eq("source_module", "procurement")
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        if (data && data.length > 0) {
          const mapped: PurchaseRequisition[] = data.map((row, idx) => ({
            id: row.id,
            prNumber: `PR-${String(idx + 1).padStart(4, '0')}`,
            title: row.title,
            requester: row.assigned_to_name || "N/A",
            department: row.source_module || "Geral",
            category: "Geral",
            priority: (row.priority as PurchaseRequisition["priority"]) || "medium",
            status: row.status === "done" ? "approved" as const : "pending_approval" as const,
            totalValue: 0,
            currency: "USD",
            createdAt: new Date(row.created_at || Date.now()),
            currentLevel: 1,
            approvalLevels: [],
            items: [{ description: row.description || row.title, quantity: 1, unitPrice: 0 }],
          }));
          setRequisitions(mapped);
        }
      } catch { /* use fallback */ }
    };
    fetchRequisitions();
  }, []);
  // KPIs
  const kpis = {
    pendingApprovals: requisitions.filter(r => r.status === "pending_approval").length,
    totalValuePending: requisitions.filter(r => r.status === "pending_approval").reduce((acc, r) => acc + r.totalValue, 0),
    avgApprovalTime: 2.3,
    complianceRate: 98.5,
  };

  const handleApprove = (prId: string, level: number) => {
    toast.success(`Requisição aprovada no nível ${level}`);
  };

  const handleReject = (prId: string, reason: string) => {
    toast.error(`Requisição rejeitada: ${reason}`);
  };

  const filteredRequisitions = requisitions.filter(r => 
    filterStatus === "all" || r.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovações Pendentes</p>
                <p className="text-3xl font-bold">{kpis.pendingApprovals}</p>
              </div>
              <Clock className="h-10 w-10 text-warning opacity-50" />
            </div>
            <Progress value={30} className="mt-3 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Pendente</p>
                <p className="text-3xl font-bold">${(kpis.totalValuePending / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-10 w-10 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Aprovação</p>
                <p className="text-3xl font-bold">{kpis.avgApprovalTime}d</p>
              </div>
              <TrendingUp className="h-10 w-10 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Compliance</p>
                <p className="text-3xl font-bold">{kpis.complianceRate}%</p>
              </div>
              <FileCheck className="h-10 w-10 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="requisitions" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Requisições
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              <FileCheck className="h-4 w-4" />
              Minhas Aprovações
            </TabsTrigger>
            <TabsTrigger value="ai-comparison" className="gap-2">
              <Brain className="h-4 w-4" />
              Comparativo IA
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="pending_approval">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => setIsNewPROpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Requisição
            </Button>
          </div>
        </div>

        {/* Requisitions Tab */}
        <TabsContent value="requisitions" className="space-y-4">
          <div className="grid gap-4">
            {filteredRequisitions.map((pr) => (
              <Card key={pr.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPR(pr)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{pr.prNumber}</Badge>
                        <Badge className={priorityConfig[pr.priority].color}>
                          {priorityConfig[pr.priority].label}
                        </Badge>
                        <Badge className={statusConfig[pr.status].color}>
                          {statusConfig[pr.status].label}
                        </Badge>
                        {pr.aiScore && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white gap-1">
                            <Sparkles className="h-3 w-3" />
                            IA: {pr.aiScore}%
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{pr.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Solicitante: {pr.requester}</span>
                        <span>•</span>
                        <span>{pr.department}</span>
                        <span>•</span>
                        <span>{pr.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${pr.totalValue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Nível {pr.currentLevel}/{pr.approvalLevels.length}</p>
                    </div>
                  </div>

                  {/* Approval Timeline */}
                  <div className="mt-4 flex items-center gap-2">
                    {pr.approvalLevels.map((level, idx) => (
                      <React.Fragment key={level.id}>
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
                          level.status === "approved" && "bg-success/20 text-success",
                          level.status === "pending" && "bg-warning/20 text-warning",
                          level.status === "rejected" && "bg-destructive/20 text-destructive",
                        )}>
                          {level.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                          {level.status === "pending" && <Clock className="h-3 w-3" />}
                          {level.status === "rejected" && <XCircle className="h-3 w-3" />}
                          <span>{level.approverName}</span>
                        </div>
                        {idx < pr.approvalLevels.length - 1 && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Requisições Aguardando Sua Aprovação
              </CardTitle>
              <CardDescription>
                Revise e aprove as requisições de compra pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requisitions.filter(r => r.status === "pending_approval").map((pr) => (
                <div key={pr.id} className="flex items-center justify-between p-4 border rounded-lg mb-3 last:mb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{pr.title}</p>
                      <p className="text-sm text-muted-foreground">{pr.prNumber} • ${pr.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedPR(pr)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleReject(pr.id, "Pendente de documentação")}>
                      Rejeitar
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(pr.id, pr.currentLevel)}>
                      Aprovar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Comparison Tab */}
        <TabsContent value="ai-comparison" className="space-y-4">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Comparativo Inteligente de Cotações
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Análise automatizada de propostas com recomendação baseada em IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Suppliers Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {comparison.suppliers.map((supplier, idx) => (
                  <Card key={supplier.name} className={cn(
                    "relative",
                    idx === 1 && "ring-2 ring-purple-500 shadow-lg"
                  )}>
                    {idx === 1 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-500 text-white">
                          <Target className="h-3 w-3 mr-1" />
                          Recomendado
                        </Badge>
                      </div>
                    )}
                    <CardContent className="pt-6">
                      <h4 className="font-bold text-lg mb-4">{supplier.name}</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Preço</span>
                          <span className="font-bold text-lg">${supplier.price.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Lead Time</span>
                          <span className="font-medium">{supplier.leadTime} dias</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Qualidade</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={cn(
                                "w-3 h-3 rounded-full",
                                i < Math.floor(supplier.quality) ? "bg-yellow-500" : "bg-muted"
                              )} />
                            ))}
                            <span className="ml-1 text-sm">{supplier.quality}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Confiabilidade</span>
                          <span className="font-medium">{supplier.reliability}%</span>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Score IA</span>
                            <Badge className={cn(
                              supplier.aiScore >= 90 ? "bg-success" :
                              supplier.aiScore >= 80 ? "bg-warning" : "bg-muted"
                            )}>
                              {supplier.aiScore}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" variant={idx === 1 ? "default" : "outline"}>
                        Selecionar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Recommendation */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <Brain className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-2">Recomendação da IA</h4>
                      <p className="text-muted-foreground">{comparison.aiRecommendation}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <Badge variant="outline" className="text-success border-success">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Savings Potencial: ${comparison.potentialSavings.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PR Detail Dialog */}
      {selectedPR && (
        <Dialog open={!!selectedPR} onOpenChange={() => setSelectedPR(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {selectedPR.prNumber} - {selectedPR.title}
              </DialogTitle>
              <DialogDescription>
                Solicitado por {selectedPR.requester} • {selectedPR.department}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* AI Insight */}
              {selectedPR.aiRecommendation && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Análise IA</span>
                    <Badge className="bg-purple-500 text-white">Score: {selectedPR.aiScore}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPR.aiRecommendation}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Itens da Requisição</h4>
                <div className="border rounded-lg divide-y">
                  {selectedPR.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3">
                      <span>{item.description}</span>
                      <div className="text-right">
                        <p className="font-medium">${(item.quantity * item.unitPrice).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} x ${item.unitPrice}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-muted/50">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">${selectedPR.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Approval Flow */}
              <div>
                <h4 className="font-medium mb-2">Fluxo de Aprovação</h4>
                <div className="space-y-2">
                  {selectedPR.approvalLevels.map((level) => (
                    <div key={level.id} className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      level.status === "approved" && "bg-success/10 border-success/20",
                      level.status === "pending" && "bg-warning/10 border-warning/20",
                      level.status === "rejected" && "bg-destructive/10 border-destructive/20",
                    )}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{level.approverName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{level.approverName}</p>
                          <p className="text-xs text-muted-foreground">{level.approverRole}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">até ${level.threshold.toLocaleString()}</span>
                        {level.status === "approved" && <CheckCircle2 className="h-5 w-5 text-success" />}
                        {level.status === "pending" && <Clock className="h-5 w-5 text-warning" />}
                        {level.status === "rejected" && <XCircle className="h-5 w-5 text-destructive" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPR(null)}>Fechar</Button>
              <Button variant="destructive">Rejeitar</Button>
              <Button>Aprovar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ProcurementWorkflowEngine;
