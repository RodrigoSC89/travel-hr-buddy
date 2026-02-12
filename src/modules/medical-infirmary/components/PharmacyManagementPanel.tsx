/**
 * Pharmacy Management Panel - Real Supabase Integration
 * Controle de estoque, validades, dispensação e lotes
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Pill, Package, AlertTriangle, Plus, Search, QrCode, 
  Calendar, ArrowUpDown, Download, Filter,
  CheckCircle2, XCircle, Clock, TrendingUp, Trash2,
  ShieldCheck, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { differenceInDays, isPast } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const categories = [
  "Analgésico", "Antibiótico", "Anti-inflamatório", "Emergência", 
  "Opioide", "Antipirético", "Antiemético", "Curativo"
];

export default function PharmacyManagementPanel() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDispenseDialog, setShowDispenseDialog] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "stock" | "expiry">("name");
  const [dispenseQty, setDispenseQty] = useState(1);
  const [newMed, setNewMed] = useState({ name: '', genericName: '', category: 'Analgésico', form: 'Comprimido', strength: '', currentStock: 0, minStock: 10, maxStock: 100, unit: 'comp', batchNumber: '', expiryDate: '', manufacturer: '', storageCondition: 'Temperatura ambiente', controlledSubstance: false, location: '', pricePerUnit: 0 });

  // Fetch medications from Supabase
  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['pharmacy-medications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('category', 'medication')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        // Try pharmacy_inventory as fallback
        const { data: altData } = await (supabase.from as Function)('inventory_items')
          .select('*')
          .order('name', { ascending: true })
          .limit(50);

        if (!altData || altData.length === 0) return [];
        return (altData as Record<string, unknown>[]).map(mapToMedication);
      }
      return data.map(mapToMedication);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase returns dynamic shape from multiple tables
  function mapToMedication(d: Record<string, unknown>): Medication {
    return {
      id: String(d.id),
      name: String(d.name || d.item_name || 'Item'),
      genericName: String(d.generic_name || d.description || ''),
      category: String(d.subcategory || d.category || 'Geral'),
      form: String(d.form || d.unit_type || 'Unidade'),
      strength: String(d.strength || d.specifications || ''),
      currentStock: Number(d.current_stock ?? d.quantity ?? 0),
      minStock: Number(d.min_stock ?? d.minimum_quantity ?? 10),
      maxStock: Number(d.max_stock ?? d.maximum_quantity ?? 100),
      unit: String(d.unit || d.unit_type || 'un'),
      batchNumber: String(d.batch_number || d.lot_number || `LOT-${String(d.id || '').slice(0, 6)}`),
      expiryDate: String(d.expiry_date || d.expiration_date || new Date(Date.now() + 180 * 86400000).toISOString()),
      manufacturer: String(d.manufacturer || d.supplier || ''),
      storageCondition: String(d.storage_condition || 'Temperatura ambiente'),
      controlledSubstance: Boolean(d.controlled_substance ?? d.is_controlled ?? false),
      location: String(d.location || d.storage_location || ''),
      lastRestock: String(d.last_restock || d.updated_at || d.created_at || new Date().toISOString()),
      pricePerUnit: Number(d.price_per_unit ?? d.unit_price ?? 0),
    };
  }

  // Add medication mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- inventory_items schema differs from generated types for medication data
      const { error } = await (supabase.from as Function)('inventory_items').insert({
        name: newMed.name,
        description: newMed.genericName,
        category: 'medication',
        subcategory: newMed.category,
        quantity: newMed.currentStock,
        minimum_quantity: newMed.minStock,
        unit_type: newMed.unit,
        status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-medications'] });
      setShowAddDialog(false);
      toast.success('Medicamento adicionado com sucesso');
    },
    onError: () => toast.error('Erro ao adicionar medicamento'),
  });

  // Dispense mutation
  const dispenseMutation = useMutation({
    mutationFn: async ({ medId, qty }: { medId: string; qty: number }) => {
      const med = medications.find(m => m.id === medId);
      if (!med) throw new Error('Medicamento não encontrado');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic column mapping
      const { error } = await (supabase.from as Function)('inventory_items').update({
        quantity: Math.max(0, med.currentStock - qty),
      }).eq('id', medId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-medications'] });
      setShowDispenseDialog(false);
      setSelectedMed(null);
      toast.success('Medicamento dispensado com sucesso');
    },
  });

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Card key={`pharm-skeleton-${i}`}><CardContent className="p-4"><div className="animate-pulse h-16 bg-muted rounded" /></CardContent></Card>)}
        </div>
        <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Itens</p></div></div></CardContent></Card>
        <Card className={stats.lowStock > 0 ? "border-destructive/50" : ""}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div><div><p className="text-2xl font-bold text-destructive">{stats.lowStock}</p><p className="text-xs text-muted-foreground">Estoque Baixo</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div><div><p className="text-2xl font-bold text-warning">{stats.expiringSoon}</p><p className="text-xs text-muted-foreground">Vencendo 90d</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><XCircle className="h-5 w-5 text-destructive" /></div><div><p className="text-2xl font-bold text-destructive">{stats.expired}</p><p className="text-xs text-muted-foreground">Vencidos</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-accent/50"><ShieldCheck className="h-5 w-5 text-accent-foreground" /></div><div><p className="text-2xl font-bold text-accent-foreground">{stats.controlled}</p><p className="text-xs text-muted-foreground">Controlados</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-success/10"><TrendingUp className="h-5 w-5 text-success" /></div><div><p className="text-2xl font-bold text-success">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p><p className="text-xs text-muted-foreground">Valor Total</p></div></div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar medicamento ou lote..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="critical">Críticos</SelectItem><SelectItem value="low-stock">Estoque Baixo</SelectItem><SelectItem value="expiring">Vencendo</SelectItem><SelectItem value="ok">OK</SelectItem></SelectContent></Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "name" | "stock" | "expiry")}><SelectTrigger className="w-36"><ArrowUpDown className="h-4 w-4 mr-2" /><SelectValue placeholder="Ordenar" /></SelectTrigger><SelectContent><SelectItem value="name">Nome</SelectItem><SelectItem value="stock">Estoque</SelectItem><SelectItem value="expiry">Validade</SelectItem></SelectContent></Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { const csv = medications.map(m => `${m.name},${m.currentStock},${m.expiryDate}`).join('\n'); const blob = new Blob([`Nome,Estoque,Validade\n${csv}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'farmacia.csv'; a.click(); toast.success('Exportado!'); }}><Download className="h-4 w-4 mr-2" />Exportar</Button>
          <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Adicionar</Button>
        </div>
      </div>

      {/* Grid */}
      {filteredMedications.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" /><h3 className="font-medium mb-2">Nenhum medicamento encontrado</h3><p className="text-sm text-muted-foreground mb-4">{searchQuery ? 'Tente ajustar a busca' : 'Adicione o primeiro medicamento ao inventário'}</p><Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Adicionar Medicamento</Button></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredMedications.map((med, index) => {
              const status = getMedicationStatus(med);
              const stockPercent = (med.currentStock / med.maxStock) * 100;
              const daysUntilExpiry = differenceInDays(new Date(med.expiryDate), new Date());
              return (
                <motion.div key={med.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.03 }}>
                  <Card className={`hover:border-primary/50 transition-all cursor-pointer ${status === "expired" ? "border-destructive/50 bg-destructive/5" : status === "expiring-soon" || status === "low-stock" ? "border-amber-500/50" : ""}`} onClick={() => { setSelectedMed(med); setShowDispenseDialog(true); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${med.controlledSubstance ? "bg-purple-500/10" : "bg-primary/10"}`}><Pill className={`h-5 w-5 ${med.controlledSubstance ? "text-purple-500" : "text-primary"}`} /></div>
                          <div><h4 className="font-medium text-sm">{med.name}</h4><p className="text-xs text-muted-foreground">{med.genericName}</p></div>
                        </div>
                        {med.controlledSubstance && <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 text-xs"><ShieldCheck className="h-3 w-3 mr-1" />Controlado</Badge>}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1"><span className="text-muted-foreground">Estoque</span><span className={stockPercent < 50 ? "text-destructive font-medium" : ""}>{med.currentStock} / {med.maxStock} {med.unit}</span></div>
                          <Progress value={stockPercent} className={`h-2 ${stockPercent < 50 ? "[&>div]:bg-destructive" : ""}`} />
                          {med.currentStock < med.minStock && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Abaixo do mínimo ({med.minStock})</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs"><Badge variant="outline">{med.category}</Badge><Badge variant="outline">{med.form}</Badge><span className="text-muted-foreground">{med.location}</span></div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Validade</span>
                          <span className={`font-medium ${status === "expired" ? "text-destructive" : status === "expiring-soon" ? "text-amber-600" : "text-muted-foreground"}`}>
                            {status === "expired" ? "VENCIDO" : `${Math.abs(daysUntilExpiry)} dias`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Adicionar Medicamento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome *</Label><Input value={newMed.name} onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Paracetamol 500mg" /></div>
              <div className="space-y-2"><Label>Nome Genérico</Label><Input value={newMed.genericName} onChange={e => setNewMed(p => ({ ...p, genericName: e.target.value }))} placeholder="Ex: Paracetamol" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Categoria</Label><Select value={newMed.category} onValueChange={v => setNewMed(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Estoque Atual</Label><Input type="number" value={newMed.currentStock} onChange={e => setNewMed(p => ({ ...p, currentStock: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>Estoque Mínimo</Label><Input type="number" value={newMed.minStock} onChange={e => setNewMed(p => ({ ...p, minStock: parseInt(e.target.value) || 10 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Fabricante</Label><Input value={newMed.manufacturer} onChange={e => setNewMed(p => ({ ...p, manufacturer: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Localização</Label><Input value={newMed.location} onChange={e => setNewMed(p => ({ ...p, location: e.target.value }))} placeholder="Ex: Armário A1" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !newMed.name}>{addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispense Dialog */}
      <Dialog open={showDispenseDialog} onOpenChange={setShowDispenseDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dispensar Medicamento</DialogTitle></DialogHeader>
          {selectedMed && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedMed.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedMed.genericName} • Lote: {selectedMed.batchNumber}</p>
                <p className="text-sm mt-1">Estoque atual: <strong>{selectedMed.currentStock} {selectedMed.unit}</strong></p>
              </div>
              <div className="space-y-2"><Label>Quantidade a Dispensar</Label><Input type="number" min={1} max={selectedMed.currentStock} value={dispenseQty} onChange={e => setDispenseQty(parseInt(e.target.value) || 1)} /></div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDispenseDialog(false)}>Cancelar</Button>
                <Button onClick={() => dispenseMutation.mutate({ medId: selectedMed.id, qty: dispenseQty })} disabled={dispenseMutation.isPending || dispenseQty > selectedMed.currentStock}>
                  {dispenseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Dispensar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}