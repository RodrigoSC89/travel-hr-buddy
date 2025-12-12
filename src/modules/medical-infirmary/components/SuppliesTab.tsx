/**
import { useState, useMemo, useCallback } from "react";;
 * Medical Supplies Management Tab
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Pill, Search, Package, AlertTriangle, Calendar, 
  Plus, Download, Filter, Brain, ShoppingCart, BarChart3,
  CheckCircle2, Clock, MapPin, Trash2
} from "lucide-react";
import { mockSupplies, medicalCategories } from "../data/mockData";
import { MedicalSupply } from "../types";
import { toast } from "sonner";
import { useMedicalAI } from "../hooks/useMedicalAI";

export default function SuppliesTab() {
  const { analyzeInventoryRisks, isLoading } = useMedicalAI();
  const [supplies, setSupplies] = useState<MedicalSupply[]>(mockSupplies);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<unknown>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    minStock: 0,
    unit: "",
    expiryDate: "",
    batchNumber: "",
    location: ""
  });

  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || supply.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || supply.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  };

  const statusCounts = {
    ok: supplies.filter(s => s.status === "ok").length,
    low: supplies.filter(s => s.status === "low").length,
    expiring: supplies.filter(s => s.status === "expiring").length,
    critical: supplies.filter(s => s.status === "critical").length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "ok": return "bg-green-500/10 border-green-500/30 text-green-500";
    case "low": return "bg-amber-500/10 border-amber-500/30 text-amber-500";
    case "expiring": return "bg-orange-500/10 border-orange-500/30 text-orange-500";
    case "critical": return "bg-red-500/10 border-red-500/30 text-red-500";
    default: return "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "ok": return <Badge className="bg-green-500/20 text-green-500">OK</Badge>;
    case "low": return <Badge className="bg-amber-500/20 text-amber-500">Baixo</Badge>;
    case "expiring": return <Badge className="bg-orange-500/20 text-orange-500">Vencendo</Badge>;
    case "critical": return <Badge className="bg-red-500/20 text-red-500">Crítico</Badge>;
    default: return null;
    }
  };

  const handleAIAnalysis = async () => {
    const result = await analyzeInventoryRisks(supplies);
    if (result) {
      setAiAnalysis(result);
      toast.success("Análise de estoque concluída");
    } else {
      toast.error("Erro na análise");
    }
  };

  const handleAddItem = () => {
    const newSupply: MedicalSupply = {
      id: Date.now().toString(),
      ...newItem,
      status: newItem.quantity < newItem.minStock ? "low" : "ok",
      lastRestock: new Date().toISOString().split("T")[0]
    };
    setSupplies(prev => [...prev, newSupply]);
    setShowAddDialog(false);
    setNewItem({
      name: "",
      category: "",
      quantity: 0,
      minStock: 0,
      unit: "",
      expiryDate: "",
      batchNumber: "",
      location: ""
    });
    toast.success("Item adicionado ao estoque");
  };

  const handleRequestRestock = (supply: MedicalSupply) => {
    toast.success(`Solicitação de reposição enviada: ${supply.name}`);
  };

  const handleExport = () => {
    toast.success("Exportando inventário...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar medicamento ou lote..."
              value={searchQuery}
              onChange={handleChange}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleSetShowFilters}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAIAnalysis} disabled={isLoading}>
            <Brain className="h-4 w-4 mr-2" />
            Análise IA
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Item ao Estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Medicamento</Label>
                  <Input 
                    value={newItem.name}
                    onChange={handleChange}))}
                    placeholder="Ex: Paracetamol 500mg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={newItem.category} onValueChange={(v) => setNewItem(prev => ({ ...prev, category: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicalCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Input 
                      value={newItem.unit}
                      onChange={handleChange}))}
                      placeholder="Ex: comprimidos"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input 
                      type="number"
                      value={newItem.quantity}
                      onChange={handleChange}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque Mínimo</Label>
                    <Input 
                      type="number"
                      value={newItem.minStock}
                      onChange={handleChange}))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Validade</Label>
                    <Input 
                      type="date"
                      value={newItem.expiryDate}
                      onChange={handleChange}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número do Lote</Label>
                    <Input 
                      value={newItem.batchNumber}
                      onChange={handleChange}))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Input 
                    value={newItem.location}
                    onChange={handleChange}))}
                    placeholder="Ex: Armário A1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleSetShowAddDialog}>Cancelar</Button>
                <Button onClick={handleAddItem}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Categoria</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {medicalCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={statusFilter === "all" ? "default" : "outline"} 
                    size="sm"
                    onClick={handleSetStatusFilter}
                  >
                    Todos
                  </Button>
                  <Button 
                    variant={statusFilter === "critical" ? "default" : "outline"} 
                    size="sm"
                    onClick={handleSetStatusFilter}
                  >
                    Crítico ({statusCounts.critical})
                  </Button>
                  <Button 
                    variant={statusFilter === "low" ? "default" : "outline"} 
                    size="sm"
                    onClick={handleSetStatusFilter}
                  >
                    Baixo ({statusCounts.low})
                  </Button>
                  <Button 
                    variant={statusFilter === "expiring" ? "default" : "outline"} 
                    size="sm"
                    onClick={handleSetStatusFilter}
                  >
                    Vencendo ({statusCounts.expiring})
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      {aiAnalysis && (
        <Card className={`border-l-4 ${
          aiAnalysis.riskLevel === "high" ? "border-l-red-500 bg-red-500/5" :
            aiAnalysis.riskLevel === "medium" ? "border-l-amber-500 bg-amber-500/5" :
              "border-l-green-500 bg-green-500/5"
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise de Estoque por IA
              <Badge variant="outline">{Math.round(aiAnalysis.confidence * 100)}% confiança</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Riscos Identificados:</p>
                <ul className="text-sm space-y-1">
                  {aiAnalysis.predictedIssues?.length > 0 ? 
                    aiAnalysis.predictedIssues.map((issue: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        {issue}
                      </li>
                    )) : (
                      <>
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          Soro fisiológico abaixo do mínimo (8 de 15)
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          Dipirona vence em 2 meses
                        </li>
                      </>
                    )
                  }
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Recomendações:</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Solicitar reposição urgente de Soro fisiológico
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Verificar uso de Dipirona antes do vencimento
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Repor estoque de Adrenalina
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{supplies.length}</p>
                <p className="text-xs text-muted-foreground">Total de Itens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{statusCounts.critical}</p>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{statusCounts.expiring}</p>
                <p className="text-xs text-muted-foreground">Vencendo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <BarChart3 className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{statusCounts.low}</p>
                <p className="text-xs text-muted-foreground">Estoque Baixo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplies Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Inventário de Medicamentos
          </CardTitle>
          <CardDescription>
            {filteredSupplies.length} itens encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSupplies.map((supply) => (
                <div 
                  key={supply.id} 
                  className={`p-4 rounded-lg border ${getStatusColor(supply.status)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{supply.name}</p>
                      <p className="text-xs text-muted-foreground">{supply.category}</p>
                    </div>
                    {getStatusBadge(supply.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantidade:</span>
                      <span className="font-medium">{supply.quantity} {supply.unit}</span>
                    </div>
                    <Progress 
                      value={(supply.quantity / (supply.minStock * 2)) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs">
                      <span>Mín: {supply.minStock}</span>
                      <span>Máx: {supply.minStock * 2}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Validade: {new Date(supply.expiryDate).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {supply.location}
                    </div>
                    <div className="text-muted-foreground">
                      Lote: {supply.batchNumber}
                    </div>
                  </div>
                  
                  {(supply.status === "low" || supply.status === "critical") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => handlehandleRequestRestock}
                    >
                      <ShoppingCart className="h-3 w-3 mr-2" />
                      Solicitar Reposição
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
