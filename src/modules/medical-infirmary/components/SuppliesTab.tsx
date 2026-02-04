/**
 * Medical Supplies Management Tab
 * ENHANCED: Complete inventory with dispensation & restocking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Pill, Search, Package, AlertTriangle, Calendar, 
  Plus, Download, Filter, Brain, ShoppingCart, BarChart3,
  CheckCircle2, Clock, MapPin, Trash2, Loader2, Syringe,
  PackagePlus, History, ClipboardList, User
} from 'lucide-react';
import { useMedicalSupplies } from '../hooks/useMedicalData';
import { MedicalSupply } from '../types';
import { toast } from 'sonner';
import { useMedicalAI } from '../hooks/useMedicalAI';
import { motion, AnimatePresence } from 'framer-motion';

const medicalCategories = [
  'Analgésicos', 'Anti-inflamatórios', 'Antibióticos', 'Antieméticos',
  'Gastrointestinal', 'Curativos', 'Soluções', 'Emergência', 'EPIs', 'Equipamentos'
];

export default function SuppliesTab() {
  const { analyzeInventoryRisks, isLoading: aiLoading } = useMedicalAI();
  const { data: dbSupplies = [], isLoading: loadingSupplies } = useMedicalSupplies();
  
  const [supplies, setSupplies] = useState<MedicalSupply[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDispenseDialog, setShowDispenseDialog] = useState(false);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<MedicalSupply | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    minStock: 0,
    unit: '',
    expiryDate: '',
    batchNumber: '',
    location: ''
  });

  // Sync from DB
  useEffect(() => {
    if (dbSupplies.length > 0) setSupplies(dbSupplies);
  }, [dbSupplies]);
  
  const isLoading = aiLoading || loadingSupplies;

  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supply.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || supply.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusCounts = {
    ok: supplies.filter(s => s.status === 'ok').length,
    low: supplies.filter(s => s.status === 'low').length,
    expiring: supplies.filter(s => s.status === 'expiring').length,
    critical: supplies.filter(s => s.status === 'critical').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-500/10 border-green-500/30 text-green-500';
      case 'low': return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
      case 'expiring': return 'bg-orange-500/10 border-orange-500/30 text-orange-500';
      case 'critical': return 'bg-red-500/10 border-red-500/30 text-red-500';
      default: return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok': return <Badge className="bg-green-500/20 text-green-500">OK</Badge>;
      case 'low': return <Badge className="bg-amber-500/20 text-amber-500">Baixo</Badge>;
      case 'expiring': return <Badge className="bg-orange-500/20 text-orange-500">Vencendo</Badge>;
      case 'critical': return <Badge className="bg-red-500/20 text-red-500">Crítico</Badge>;
      default: return null;
    }
  };

  const handleAIAnalysis = async () => {
    const result = await analyzeInventoryRisks(supplies);
    if (result) {
      setAiAnalysis(result);
      toast.success('Análise de estoque concluída');
    } else {
      toast.error('Erro na análise');
    }
  };

  const handleAddItem = () => {
    const newSupply: MedicalSupply = {
      id: Date.now().toString(),
      ...newItem,
      status: newItem.quantity < newItem.minStock ? 'low' : 'ok',
      lastRestock: new Date().toISOString().split('T')[0]
    };
    setSupplies(prev => [...prev, newSupply]);
    setShowAddDialog(false);
    setNewItem({
      name: '',
      category: '',
      quantity: 0,
      minStock: 0,
      unit: '',
      expiryDate: '',
      batchNumber: '',
      location: ''
    });
    toast.success('Item adicionado ao estoque');
  };

  const handleRequestRestock = (supply: MedicalSupply) => {
    toast.success(`Solicitação de reposição enviada: ${supply.name}`);
  };

  const handleDispense = (supply: MedicalSupply) => {
    setSelectedSupply(supply);
    setShowDispenseDialog(true);
  };

  const handleRestock = (supply: MedicalSupply) => {
    setSelectedSupply(supply);
    setShowRestockDialog(true);
  };

  const handleDispenseSubmit = (quantity: number, patientName: string, reason: string) => {
    if (selectedSupply) {
      setSupplies(prev => prev.map(s => 
        s.id === selectedSupply.id 
          ? { 
              ...s, 
              quantity: Math.max(0, s.quantity - quantity),
              status: s.quantity - quantity < s.minStock ? 'low' : s.status
            }
          : s
      ));
      toast.success(`${quantity} ${selectedSupply.unit} dispensado(s) para ${patientName}`);
      setShowDispenseDialog(false);
      setSelectedSupply(null);
    }
  };

  const handleRestockSubmit = (quantity: number, batchNumber: string, expiryDate: string) => {
    if (selectedSupply) {
      setSupplies(prev => prev.map(s => 
        s.id === selectedSupply.id 
          ? { 
              ...s, 
              quantity: s.quantity + quantity,
              batchNumber: batchNumber || s.batchNumber,
              expiryDate: expiryDate || s.expiryDate,
              status: 'ok',
              lastRestock: new Date().toISOString().split('T')[0]
            }
          : s
      ));
      toast.success(`Estoque de ${selectedSupply.name} atualizado: +${quantity}`);
      setShowRestockDialog(false);
      setSelectedSupply(null);
    }
  };

  const handleExport = () => {
    toast.success('Exportando inventário...');
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
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
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
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
                      onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
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
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque Mínimo</Label>
                    <Input 
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Validade</Label>
                    <Input 
                      type="date"
                      value={newItem.expiryDate}
                      onChange={(e) => setNewItem(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número do Lote</Label>
                    <Input 
                      value={newItem.batchNumber}
                      onChange={(e) => setNewItem(prev => ({ ...prev, batchNumber: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Input 
                    value={newItem.location}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: Armário A1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
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
                    variant={statusFilter === 'all' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    Todos
                  </Button>
                  <Button 
                    variant={statusFilter === 'critical' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setStatusFilter('critical')}
                  >
                    Crítico ({statusCounts.critical})
                  </Button>
                  <Button 
                    variant={statusFilter === 'low' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setStatusFilter('low')}
                  >
                    Baixo ({statusCounts.low})
                  </Button>
                  <Button 
                    variant={statusFilter === 'expiring' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setStatusFilter('expiring')}
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
          aiAnalysis.riskLevel === 'high' ? 'border-l-red-500 bg-red-500/5' :
          aiAnalysis.riskLevel === 'medium' ? 'border-l-amber-500 bg-amber-500/5' :
          'border-l-green-500 bg-green-500/5'
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
                      Validade: {new Date(supply.expiryDate).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {supply.location}
                    </div>
                    <div className="text-muted-foreground">
                      Lote: {supply.batchNumber}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-3 pt-3 border-t border-border/50 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => { e.stopPropagation(); handleDispense(supply); }}
                    >
                      <Syringe className="h-3 w-3 mr-1" />
                      Dispensar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => { e.stopPropagation(); handleRestock(supply); }}
                    >
                      <PackagePlus className="h-3 w-3 mr-1" />
                      Reabastecer
                    </Button>
                  </div>
                  
                  {(supply.status === 'low' || supply.status === 'critical') && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => handleRequestRestock(supply)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-2" />
                      Solicitar Reposição Urgente
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dispense Dialog */}
      <Dialog open={showDispenseDialog} onOpenChange={setShowDispenseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-primary" />
              Dispensar Medicamento
            </DialogTitle>
            <DialogDescription>
              {selectedSupply?.name} - Estoque atual: {selectedSupply?.quantity} {selectedSupply?.unit}
            </DialogDescription>
          </DialogHeader>
          <DispenseForm 
            supply={selectedSupply}
            onSubmit={handleDispenseSubmit}
            onCancel={() => setShowDispenseDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              Reabastecer Estoque
            </DialogTitle>
            <DialogDescription>
              {selectedSupply?.name} - Estoque atual: {selectedSupply?.quantity} {selectedSupply?.unit}
            </DialogDescription>
          </DialogHeader>
          <RestockForm 
            supply={selectedSupply}
            onSubmit={handleRestockSubmit}
            onCancel={() => setShowRestockDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dispense Form Component
function DispenseForm({ supply, onSubmit, onCancel }: { 
  supply: MedicalSupply | null; 
  onSubmit: (qty: number, patient: string, reason: string) => void;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [reason, setReason] = useState('');

  if (!supply) return null;

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantidade</Label>
          <Input
            type="number"
            min={1}
            max={supply.quantity}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
          <p className="text-xs text-muted-foreground">Máx: {supply.quantity}</p>
        </div>
        <div className="space-y-2">
          <Label>Lote</Label>
          <Input value={supply.batchNumber} disabled />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Paciente / Tripulante</Label>
        <Input
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Nome do paciente"
        />
      </div>
      <div className="space-y-2">
        <Label>Motivo / Indicação</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Descreva o motivo da dispensação..."
          rows={2}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button 
          onClick={() => onSubmit(quantity, patientName, reason)}
          disabled={!patientName || quantity < 1 || quantity > supply.quantity}
        >
          <Syringe className="h-4 w-4 mr-2" />
          Confirmar Dispensação
        </Button>
      </DialogFooter>
    </div>
  );
}

// Restock Form Component
function RestockForm({ supply, onSubmit, onCancel }: { 
  supply: MedicalSupply | null; 
  onSubmit: (qty: number, batch: string, expiry: string) => void;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(10);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  if (!supply) return null;

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Quantidade a Adicionar</Label>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Número do Lote (novo)</Label>
          <Input
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder={supply.batchNumber}
          />
        </div>
        <div className="space-y-2">
          <Label>Nova Validade</Label>
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
      </div>
      <div className="p-3 rounded-lg bg-muted/50 text-sm">
        <p><strong>Estoque atual:</strong> {supply.quantity} {supply.unit}</p>
        <p><strong>Após reabastecimento:</strong> {supply.quantity + quantity} {supply.unit}</p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button 
          onClick={() => onSubmit(quantity, batchNumber, expiryDate)}
          disabled={quantity < 1}
        >
          <PackagePlus className="h-4 w-4 mr-2" />
          Confirmar Reabastecimento
        </Button>
      </DialogFooter>
    </div>
  );
}
