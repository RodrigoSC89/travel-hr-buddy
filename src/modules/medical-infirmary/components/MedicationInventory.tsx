/**
 * Medication Inventory - Complete Medicine Management
 * Stock control, expiry tracking, dispensation records
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pill,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Package,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  User,
  FileText,
  Download,
  QrCode,
  Barcode,
  Thermometer,
  ShieldCheck,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Medication {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  form: string;
  dosage: string;
  manufacturer: string;
  batch_number: string;
  barcode?: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  expiry_date: string;
  storage_conditions: string;
  controlled: boolean;
  location: string;
  last_restocked: string;
  notes?: string;
}

interface Dispensation {
  id: string;
  medication_id: string;
  medication_name: string;
  patient_name: string;
  patient_id: string;
  quantity: number;
  dosage_instruction: string;
  dispensed_by: string;
  dispensed_at: string;
  reason: string;
  notes?: string;
}

const fallbackMedications: Medication[] = [
  {
    id: "1",
    name: "Dipirona 500mg",
    generic_name: "Metamizol",
    category: "Analgésico",
    form: "Comprimido",
    dosage: "500mg",
    manufacturer: "Medley",
    batch_number: "LOT-2024-001",
    quantity: 120,
    min_quantity: 50,
    unit: "comprimidos",
    expiry_date: "2025-06-15",
    storage_conditions: "Temperatura ambiente",
    controlled: false,
    location: "Armário A1",
    last_restocked: "2024-01-10",
  },
  {
    id: "2",
    name: "Buscopan Composto",
    generic_name: "Escopolamina + Dipirona",
    category: "Antiespasmódico",
    form: "Comprimido",
    dosage: "10mg + 250mg",
    manufacturer: "Boehringer",
    batch_number: "LOT-2024-002",
    quantity: 45,
    min_quantity: 30,
    unit: "comprimidos",
    expiry_date: "2024-08-20",
    storage_conditions: "Temperatura ambiente",
    controlled: false,
    location: "Armário A1",
    last_restocked: "2024-01-05",
  },
  {
    id: "3",
    name: "Omeprazol 20mg",
    generic_name: "Omeprazol",
    category: "Antiácido",
    form: "Cápsula",
    dosage: "20mg",
    manufacturer: "EMS",
    batch_number: "LOT-2024-003",
    quantity: 80,
    min_quantity: 40,
    unit: "cápsulas",
    expiry_date: "2025-03-10",
    storage_conditions: "Temperatura ambiente",
    controlled: false,
    location: "Armário A2",
    last_restocked: "2024-01-08",
  },
  {
    id: "4",
    name: "Tramadol 50mg",
    generic_name: "Cloridrato de Tramadol",
    category: "Analgésico Opioide",
    form: "Comprimido",
    dosage: "50mg",
    manufacturer: "Eurofarma",
    batch_number: "LOT-2024-004",
    quantity: 20,
    min_quantity: 15,
    unit: "comprimidos",
    expiry_date: "2024-12-31",
    storage_conditions: "Armário trancado",
    controlled: true,
    location: "Cofre Controlados",
    last_restocked: "2024-01-02",
  },
  {
    id: "5",
    name: "Soro Fisiológico 500ml",
    generic_name: "Cloreto de Sódio 0,9%",
    category: "Solução",
    form: "Bolsa IV",
    dosage: "500ml",
    manufacturer: "Baxter",
    batch_number: "LOT-2024-005",
    quantity: 15,
    min_quantity: 20,
    unit: "bolsas",
    expiry_date: "2025-01-25",
    storage_conditions: "Temperatura ambiente",
    controlled: false,
    location: "Armário B1",
    last_restocked: "2024-01-01",
  },
  {
    id: "6",
    name: "Adrenalina 1mg/ml",
    generic_name: "Epinefrina",
    category: "Emergência",
    form: "Ampola",
    dosage: "1mg/ml",
    manufacturer: "Hipolabor",
    batch_number: "LOT-2024-006",
    quantity: 10,
    min_quantity: 10,
    unit: "ampolas",
    expiry_date: "2024-04-15",
    storage_conditions: "Refrigerado 2-8°C",
    controlled: false,
    location: "Geladeira Med",
    last_restocked: "2023-12-20",
  },
];

const fallbackDispensations: Dispensation[] = [
  {
    id: "1",
    medication_id: "1",
    medication_name: "Dipirona 500mg",
    patient_name: "João Silva",
    patient_id: "crew-001",
    quantity: 4,
    dosage_instruction: "1 comprimido a cada 6 horas",
    dispensed_by: "Enfermeiro Carlos",
    dispensed_at: "2024-01-15T14:30:00",
    reason: "Cefaleia",
  },
  {
    id: "2",
    medication_id: "2",
    medication_name: "Buscopan Composto",
    patient_name: "Pedro Costa",
    patient_id: "crew-002",
    quantity: 6,
    dosage_instruction: "1 comprimido a cada 8 horas",
    dispensed_by: "Enfermeiro Carlos",
    dispensed_at: "2024-01-15T10:15:00",
    reason: "Dor abdominal",
  },
  {
    id: "3",
    medication_id: "3",
    medication_name: "Omeprazol 20mg",
    patient_name: "Maria Santos",
    patient_id: "crew-003",
    quantity: 14,
    dosage_instruction: "1 cápsula em jejum",
    dispensed_by: "Enfermeiro Carlos",
    dispensed_at: "2024-01-14T08:00:00",
    reason: "Gastrite",
  },
];

const CATEGORIES = [
  "Analgésico",
  "Anti-inflamatório",
  "Antibiótico",
  "Antiácido",
  "Antiespasmódico",
  "Antialérgico",
  "Emergência",
  "Solução",
  "Curativo",
  "Outro",
];

export default function MedicationInventory() {
  const [medications] = useState<Medication[]>(fallbackMedications);
  const [dispensations] = useState<Dispensation[]>(fallbackDispensations);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDispenseDialog, setShowDispenseDialog] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  const filteredMedications = medications.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockMeds = medications.filter(m => m.quantity <= m.min_quantity);
  const expiringMeds = medications.filter(m => {
    const daysToExpiry = differenceInDays(new Date(m.expiry_date), new Date());
    return daysToExpiry <= 90 && daysToExpiry > 0;
  });
  const expiredMeds = medications.filter(m => differenceInDays(new Date(m.expiry_date), new Date()) <= 0);
  const controlledMeds = medications.filter(m => m.controlled);

  const stats = {
    total: medications.length,
    lowStock: lowStockMeds.length,
    expiring: expiringMeds.length,
    expired: expiredMeds.length,
    controlled: controlledMeds.length,
    totalItems: medications.reduce((acc, m) => acc + m.quantity, 0),
  };

  const getStockStatus = (med: Medication) => {
    if (med.quantity <= 0) return { label: "Sem Estoque", color: "bg-destructive/20 text-destructive" };
    if (med.quantity <= med.min_quantity) return { label: "Estoque Baixo", color: "bg-orange-500/20 text-orange-500" };
    return { label: "OK", color: "bg-success/20 text-success" };
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days <= 0) return { label: "Expirado", color: "bg-destructive/20 text-destructive", days };
    if (days <= 30) return { label: `${days}d`, color: "bg-destructive/20 text-destructive", days };
    if (days <= 90) return { label: `${days}d`, color: "bg-amber-500/20 text-amber-500", days };
    return { label: `${days}d`, color: "bg-success/20 text-success", days };
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {(expiredMeds.length > 0 || lowStockMeds.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiredMeds.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="font-bold text-destructive">{expiredMeds.length} Medicamento(s) Expirado(s)</p>
                    <p className="text-sm text-muted-foreground">Ação imediata necessária</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {lowStockMeds.length > 0 && (
            <Card className="border-orange-500/50 bg-orange-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="font-bold text-orange-500">{lowStockMeds.length} Item(ns) Estoque Baixo</p>
                    <p className="text-sm text-muted-foreground">Reposição recomendada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Itens</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Pill className="h-6 w-6 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Unidades</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <Package className="h-6 w-6 text-emerald-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-500">{stats.lowStock}</p>
              </div>
              <ArrowDownRight className="h-6 w-6 text-orange-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirando</p>
                <p className="text-2xl font-bold text-amber-500">{stats.expiring}</p>
              </div>
              <Clock className="h-6 w-6 text-amber-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Controlados</p>
                <p className="text-2xl font-bold text-purple-500">{stats.controlled}</p>
              </div>
              <ShieldCheck className="h-6 w-6 text-purple-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="dispensations" className="gap-2">
              <History className="h-4 w-4" />
              Dispensações
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
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

        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar medicamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Medications Table */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedications.map((med) => {
                      const stockStatus = getStockStatus(med);
                      const expiryStatus = getExpiryStatus(med.expiry_date);

                      return (
                        <TableRow key={med.id} className={med.controlled ? "bg-purple-500/5" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {med.controlled && (
                                <ShieldCheck className="h-4 w-4 text-purple-500" />
                              )}
                              <div>
                                <p className="font-medium">{med.name}</p>
                                <p className="text-xs text-muted-foreground">{med.generic_name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{med.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{med.batch_number}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{med.quantity}</span>
                              <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                            </div>
                            <Progress 
                              value={(med.quantity / (med.min_quantity * 2)) * 100} 
                              className="h-1 mt-1 w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge className={expiryStatus.color}>
                              {format(new Date(med.expiry_date), "dd/MM/yy")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{med.location}</p>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => { setSelectedMed(med); setShowDispenseDialog(true); }}
                            >
                              <Minus className="h-3 w-3 mr-1" />
                              Dispensar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispensations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Dispensações
              </CardTitle>
              <CardDescription>Registro de medicamentos dispensados à tripulação</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {dispensations.map((disp, index) => (
                    <motion.div
                      key={disp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Pill className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{disp.medication_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {disp.quantity} unidade(s) • {disp.dosage_instruction}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(disp.dispensed_at), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Paciente</p>
                          <p className="font-medium flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {disp.patient_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Motivo</p>
                          <p className="font-medium">{disp.reason}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Dispensado por</p>
                          <p className="font-medium">{disp.dispensed_by}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Medication Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Medicamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Comercial</Label>
                <Input placeholder="Ex: Dipirona 500mg" />
              </div>
              <div className="space-y-2">
                <Label>Nome Genérico</Label>
                <Input placeholder="Ex: Metamizol" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Forma</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprimido">Comprimido</SelectItem>
                    <SelectItem value="capsula">Cápsula</SelectItem>
                    <SelectItem value="ampola">Ampola</SelectItem>
                    <SelectItem value="frasco">Frasco</SelectItem>
                    <SelectItem value="bisnaga">Bisnaga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Lote</Label>
                <Input placeholder="LOT-XXXX" />
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Qtd. Mínima</Label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Validade</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Input placeholder="Ex: Armário A1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Condições de Armazenamento</Label>
              <Input placeholder="Ex: Temperatura ambiente" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="controlled" className="rounded" />
              <Label htmlFor="controlled">Medicamento Controlado (Portaria 344)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={async () => {
              try {
                const { supabase } = await import("@/integrations/supabase/client");
                const { error } = await supabase.from("ai_audit_logs").insert({
                  user_input: JSON.stringify({ action: "medication_added", created_at: new Date().toISOString() }),
                  interaction_type: "medication_add",
                  module_name: "medical-pharmacy"
                });
                if (error) throw error;
                toast.success("Medicamento adicionado ao inventário!");
                setShowAddDialog(false);
              } catch {
                toast.error("Erro ao adicionar medicamento");
              }
            }}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispense Dialog */}
      <Dialog open={showDispenseDialog} onOpenChange={setShowDispenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispensar Medicamento</DialogTitle>
          </DialogHeader>
          {selectedMed && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-bold">{selectedMed.name}</p>
                <p className="text-sm text-muted-foreground">
                  Estoque: {selectedMed.quantity} {selectedMed.unit}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tripulante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crew-001">João Silva - Marinheiro</SelectItem>
                    <SelectItem value="crew-002">Pedro Costa - Cozinheiro</SelectItem>
                    <SelectItem value="crew-003">Maria Santos - Oficial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input type="number" placeholder="0" max={selectedMed.quantity} />
                </div>
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Input placeholder="Ex: Cefaleia" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Posologia</Label>
                <Input placeholder="Ex: 1 comprimido a cada 6 horas" />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea placeholder="Notas adicionais..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispenseDialog(false)}>Cancelar</Button>
            <Button onClick={async () => {
              try {
                const { supabase } = await import("@/integrations/supabase/client");
                const { error } = await supabase.from("ai_audit_logs").insert({
                  user_input: JSON.stringify({ action: "medication_dispensed", medication: selectedMed?.name, created_at: new Date().toISOString() }),
                  interaction_type: "medication_dispense",
                  module_name: "medical-pharmacy"
                });
                if (error) throw error;
                toast.success("Medicamento dispensado e registrado!");
                setShowDispenseDialog(false);
              } catch {
                toast.error("Erro ao dispensar medicamento");
              }
            }}>
              Confirmar Dispensação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
