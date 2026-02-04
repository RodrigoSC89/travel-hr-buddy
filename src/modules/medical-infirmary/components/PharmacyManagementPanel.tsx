/**
 * Pharmacy Management Panel - Gestão Completa de Farmácia
 * Controle de estoque, validades, dispensação e lotes
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Pill, Package, AlertTriangle, Plus, Search, QrCode, 
  Barcode, Calendar, ArrowUpDown, Download, Filter,
  CheckCircle2, XCircle, Clock, TrendingUp, Truck, Trash2,
  FileText, History, Sparkles, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format, addDays, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Medication {
  id: string;
  name: string;
  genericName: string;
  category: string;
  form: string;
  strength: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  manufacturer: string;
  storageCondition: string;
  controlledSubstance: boolean;
  location: string;
  lastRestock: string;
  pricePerUnit: number;
}

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    genericName: "Paracetamol",
    category: "Analgésico",
    form: "Comprimido",
    strength: "500mg",
    currentStock: 150,
    minStock: 50,
    maxStock: 300,
    unit: "comp",
    batchNumber: "PAR2024001",
    expiryDate: "2025-06-15",
    manufacturer: "Medley",
    storageCondition: "Temperatura ambiente",
    controlledSubstance: false,
    location: "Armário A1",
    lastRestock: "2024-01-10",
    pricePerUnit: 0.15
  },
  {
    id: "2",
    name: "Dipirona 1g",
    genericName: "Metamizol",
    category: "Analgésico/Antipirético",
    form: "Comprimido",
    strength: "1g",
    currentStock: 80,
    minStock: 40,
    maxStock: 200,
    unit: "comp",
    batchNumber: "DIP2024002",
    expiryDate: "2024-12-20",
    manufacturer: "EMS",
    storageCondition: "Temperatura ambiente",
    controlledSubstance: false,
    location: "Armário A1",
    lastRestock: "2024-01-05",
    pricePerUnit: 0.25
  },
  {
    id: "3",
    name: "Morfina 10mg/ml",
    genericName: "Sulfato de Morfina",
    category: "Opioide",
    form: "Ampola",
    strength: "10mg/ml",
    currentStock: 15,
    minStock: 10,
    maxStock: 30,
    unit: "amp",
    batchNumber: "MOR2024001",
    expiryDate: "2025-03-10",
    manufacturer: "Cristália",
    storageCondition: "Refrigerado 2-8°C",
    controlledSubstance: true,
    location: "Cofre B2",
    lastRestock: "2024-01-15",
    pricePerUnit: 12.50
  },
  {
    id: "4",
    name: "Adrenalina 1mg/ml",
    genericName: "Epinefrina",
    category: "Emergência",
    form: "Ampola",
    strength: "1mg/ml",
    currentStock: 8,
    minStock: 15,
    maxStock: 40,
    unit: "amp",
    batchNumber: "ADR2024003",
    expiryDate: "2024-04-05",
    manufacturer: "Hipolabor",
    storageCondition: "Refrigerado 2-8°C",
    controlledSubstance: false,
    location: "Kit Emergência",
    lastRestock: "2023-12-20",
    pricePerUnit: 8.00
  },
  {
    id: "5",
    name: "Amoxicilina 500mg",
    genericName: "Amoxicilina",
    category: "Antibiótico",
    form: "Cápsula",
    strength: "500mg",
    currentStock: 200,
    minStock: 60,
    maxStock: 300,
    unit: "caps",
    batchNumber: "AMO2024005",
    expiryDate: "2025-08-30",
    manufacturer: "Eurofarma",
    storageCondition: "Temperatura ambiente",
    controlledSubstance: false,
    location: "Armário A2",
    lastRestock: "2024-01-12",
    pricePerUnit: 0.45
  },
];

const categories = [
  "Analgésico", "Antibiótico", "Anti-inflamatório", "Emergência", 
  "Opioide", "Antipirético", "Antiemético", "Curativo"
];

export default function PharmacyManagementPanel() {
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDispenseDialog, setShowDispenseDialog] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "stock" | "expiry">("name");

  const getMedicationStatus = (med: Medication) => {
    const daysUntilExpiry = differenceInDays(new Date(med.expiryDate), new Date());
    const stockPercentage = (med.currentStock / med.minStock) * 100;
    
    if (isPast(new Date(med.expiryDate))) return "expired";
    if (daysUntilExpiry <= 30) return "expiring-soon";
    if (daysUntilExpiry <= 90) return "expiring";
    if (stockPercentage < 100) return "low-stock";
    if (stockPercentage > 200) return "overstocked";
    return "ok";
  };

  const filteredMedications = medications
    .filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || med.category === categoryFilter;
      
      if (statusFilter === "all") return matchesSearch && matchesCategory;
      const status = getMedicationStatus(med);
      if (statusFilter === "critical") return matchesSearch && matchesCategory && 
        (status === "expired" || status === "expiring-soon" || status === "low-stock");
      return matchesSearch && matchesCategory && status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "stock") return a.currentStock - b.currentStock;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });

  const stats = {
    total: medications.length,
    lowStock: medications.filter(m => m.currentStock < m.minStock).length,
    expiringSoon: medications.filter(m => {
      const days = differenceInDays(new Date(m.expiryDate), new Date());
      return days <= 90 && days > 0;
    }).length,
    expired: medications.filter(m => isPast(new Date(m.expiryDate))).length,
    controlled: medications.filter(m => m.controlledSubstance).length,
    totalValue: medications.reduce((acc, m) => acc + (m.currentStock * m.pricePerUnit), 0),
  };

  const handleDispense = (med: Medication, quantity: number, reason: string) => {
    setMedications(prev => prev.map(m => 
      m.id === med.id ? { ...m, currentStock: m.currentStock - quantity } : m
    ));
    toast.success(`${quantity} ${med.unit} de ${med.name} dispensado`);
    setShowDispenseDialog(false);
  };

  const handleRestock = (med: Medication, quantity: number, batch: string, expiry: string) => {
    setMedications(prev => prev.map(m => 
      m.id === med.id ? { 
        ...m, 
        currentStock: m.currentStock + quantity,
        batchNumber: batch,
        expiryDate: expiry,
        lastRestock: format(new Date(), "yyyy-MM-dd")
      } : m
    ));
    toast.success(`${quantity} ${med.unit} de ${med.name} reabastecido`);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Itens Cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.lowStock > 0 ? "border-destructive/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.lowStock}</p>
                <p className="text-xs text-muted-foreground">Estoque Baixo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.expiringSoon > 0 ? "border-warning/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{stats.expiringSoon}</p>
                <p className="text-xs text-muted-foreground">Vencendo 90d</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.expired}</p>
                <p className="text-xs text-muted-foreground">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ShieldCheck className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.controlled}</p>
                <p className="text-xs text-muted-foreground">Controlados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Valor Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar medicamento ou lote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="critical">Críticos</SelectItem>
              <SelectItem value="low-stock">Estoque Baixo</SelectItem>
              <SelectItem value="expiring">Vencendo</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-36">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="stock">Estoque</SelectItem>
              <SelectItem value="expiry">Validade</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Escanear
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredMedications.map((med, index) => {
            const status = getMedicationStatus(med);
            const stockPercent = (med.currentStock / med.maxStock) * 100;
            const daysUntilExpiry = differenceInDays(new Date(med.expiryDate), new Date());
            
            return (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`hover:border-primary/50 transition-all cursor-pointer ${
                  status === "expired" ? "border-destructive/50 bg-destructive/5" :
                  status === "expiring-soon" || status === "low-stock" ? "border-warning/50" : ""
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          med.controlledSubstance ? "bg-purple-500/10" : "bg-primary/10"
                        }`}>
                          <Pill className={`h-5 w-5 ${
                            med.controlledSubstance ? "text-purple-500" : "text-primary"
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{med.name}</h4>
                          <p className="text-xs text-muted-foreground">{med.genericName}</p>
                        </div>
                      </div>
                      {med.controlledSubstance && (
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 text-xs">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Controlado
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Stock Progress */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Estoque</span>
                          <span className={stockPercent < 50 ? "text-destructive font-medium" : ""}>
                            {med.currentStock} / {med.maxStock} {med.unit}
                          </span>
                        </div>
                        <Progress 
                          value={stockPercent} 
                          className={`h-2 ${stockPercent < 50 ? "[&>div]:bg-destructive" : ""}`}
                        />
                        {med.currentStock < med.minStock && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Abaixo do mínimo ({med.minStock})
                          </p>
                        )}
                      </div>

                      {/* Info Row */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <Badge variant="outline">{med.category}</Badge>
                        <Badge variant="outline">{med.form}</Badge>
                        <span className="text-muted-foreground">{med.location}</span>
                      </div>

                      {/* Expiry */}
                      <div className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        status === "expired" ? "bg-destructive/10 text-destructive" :
                        status === "expiring-soon" ? "bg-warning/10 text-warning" :
                        status === "expiring" ? "bg-amber-500/10 text-amber-600" :
                        "bg-muted/50"
                      }`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Validade: {format(new Date(med.expiryDate), "dd/MM/yyyy")}
                        </span>
                        <span>
                          {daysUntilExpiry < 0 ? "Vencido" : 
                           daysUntilExpiry === 0 ? "Vence hoje" :
                           `${daysUntilExpiry} dias`}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs"
                          onClick={() => {
                            setSelectedMed(med);
                            setShowDispenseDialog(true);
                          }}
                        >
                          Dispensar
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => {
                            setSelectedMed(med);
                            toast.info("Abrindo formulário de reabastecimento...");
                          }}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Reabastecer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Dispense Dialog */}
      <Dialog open={showDispenseDialog} onOpenChange={setShowDispenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Dispensar Medicamento
            </DialogTitle>
            <DialogDescription>
              {selectedMed?.name} - Estoque atual: {selectedMed?.currentStock} {selectedMed?.unit}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleDispense(
              selectedMed!,
              Number(formData.get("quantity")),
              formData.get("reason") as string
            );
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number" 
                  min="1" 
                  max={selectedMed?.currentStock} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient">Paciente</Label>
                <Input id="patient" name="patient" placeholder="Nome do tripulante" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo</Label>
                <Textarea id="reason" name="reason" placeholder="Indicação clínica..." required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDispenseDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Confirmar Dispensação</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredMedications.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhum medicamento encontrado</p>
          <p className="text-sm">Ajuste os filtros ou adicione novos itens</p>
        </div>
      )}
    </div>
  );
}
