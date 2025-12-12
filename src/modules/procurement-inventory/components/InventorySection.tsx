import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  BarChart3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  QrCode,
  Scan,
  Clock,
  Calendar,
  MapPin,
  Tag,
  Box,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Brain,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  lot: string;
  expiryDate: string | null;
  lastMovement: string;
  unitCost: number;
  status: "ok" | "low" | "critical" | "excess";
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  reason: string;
  user: string;
  date: string;
  reference: string;
}

const mockInventory: InventoryItem[] = [
  { id: "1", sku: "FIL-OLE-001", name: "Filtro de óleo hidráulico", category: "Manutenção", quantity: 5, minStock: 10, maxStock: 50, unit: "un", location: "A1-01", lot: "L2024-001", expiryDate: "2025-06-15", lastMovement: "2024-01-15", unitCost: 450, status: "critical" },
  { id: "2", sku: "VAL-SEG-002", name: "Válvula de segurança DP", category: "DP System", quantity: 3, minStock: 5, maxStock: 15, unit: "un", location: "B2-03", lot: "L2024-002", expiryDate: null, lastMovement: "2024-01-10", unitCost: 6400, status: "low" },
  { id: "3", sku: "EPI-CAP-003", name: "EPI - Capacetes de segurança", category: "Segurança", quantity: 12, minStock: 20, maxStock: 100, unit: "un", location: "C1-01", lot: "L2023-045", expiryDate: "2026-12-31", lastMovement: "2024-01-18", unitCost: 64, status: "low" },
  { id: "4", sku: "OLE-LUB-004", name: "Óleo lubrificante 15W40", category: "Consumíveis", quantity: 280, minStock: 100, maxStock: 300, unit: "L", location: "D1-01", lot: "L2024-010", expiryDate: "2025-03-01", lastMovement: "2024-01-20", unitCost: 44.5, status: "ok" },
  { id: "5", sku: "JUN-VED-005", name: "Juntas de vedação", category: "Manutenção", quantity: 45, minStock: 30, maxStock: 100, unit: "un", location: "A2-05", lot: "L2024-008", expiryDate: null, lastMovement: "2024-01-12", unitCost: 50, status: "ok" },
  { id: "6", sku: "GRA-ROL-006", name: "Graxa para rolamentos", category: "Consumíveis", quantity: 350, minStock: 50, maxStock: 200, unit: "kg", location: "D2-02", lot: "L2023-089", expiryDate: "2024-08-15", lastMovement: "2024-01-08", unitCost: 28, status: "excess" },
];

const mockMovements: StockMovement[] = [
  { id: "1", itemId: "4", itemName: "Óleo lubrificante 15W40", type: "in", quantity: 100, reason: "Recebimento PO-2024-004", user: "Carlos Silva", date: "2024-01-20 14:30", reference: "REC-2024-042" },
  { id: "2", itemId: "1", itemName: "Filtro de óleo hidráulico", type: "out", quantity: 3, reason: "Consumo manutenção", user: "João Santos", date: "2024-01-15 09:15", reference: "OS-2024-089" },
  { id: "3", itemId: "3", itemName: "EPI - Capacetes", type: "out", quantity: 5, reason: "Distribuição tripulação", user: "Maria Costa", date: "2024-01-18 11:00", reference: "DIS-2024-015" },
  { id: "4", itemId: "6", itemName: "Graxa para rolamentos", type: "adjustment", quantity: -10, reason: "Ajuste inventário", user: "Admin", date: "2024-01-08 16:45", reference: "INV-2024-001" },
];

interface InventorySectionProps {
  searchQuery: string;
}

export default function InventorySection({ searchQuery }: InventorySectionProps) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<"in" | "out" | "adjustment" | "transfer">("in");
  const [inventory, setInventory] = useState(mockInventory);
  const [movements, setMovements] = useState(mockMovements);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState<keyof InventoryItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // New item form state
  const [newItem, setNewItem] = useState({
    sku: "",
    name: "",
    category: "",
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    unit: "",
    location: "",
    lot: "",
    expiryDate: "",
    unitCost: 0,
  });

  // Movement form state
  const [movementData, setMovementData] = useState({
    quantity: 0,
    reason: "",
    reference: "",
  });

  const categories = [...new Set(inventory.map(i => i.category))];

  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
  });

  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  });

  const handleAddItem = () => {
    const status = newItem.quantity <= newItem.minStock * 0.5 ? "critical" :
      newItem.quantity <= newItem.minStock ? "low" :
        newItem.quantity >= newItem.maxStock ? "excess" : "ok";

    const item: InventoryItem = {
      id: Date.now().toString(),
      ...newItem,
      expiryDate: newItem.expiryDate || null,
      lastMovement: new Date().toISOString().split("T")[0],
      status,
    };

    setInventory(prev => [...prev, item]);
    setShowAddItem(false);
    setNewItem({
      sku: "",
      name: "",
      category: "",
      quantity: 0,
      minStock: 0,
      maxStock: 0,
      unit: "",
      location: "",
      lot: "",
      expiryDate: "",
      unitCost: 0,
    });
    toast.success("Item adicionado ao estoque com sucesso!");
  });

  const handleMovement = () => {
    if (!selectedItem) return;

    const newQuantity = movementType === "in" 
      ? selectedItem.quantity + movementData.quantity
      : movementType === "out" 
        ? selectedItem.quantity - movementData.quantity
        : selectedItem.quantity + movementData.quantity; // adjustment can be + or -

    // Update inventory
    setInventory(prev => prev.map(item => {
      if (item.id === selectedItem.id) {
        const status = newQuantity <= item.minStock * 0.5 ? "critical" :
          newQuantity <= item.minStock ? "low" :
            newQuantity >= item.maxStock ? "excess" : "ok";
        return { ...item, quantity: newQuantity, status, lastMovement: new Date().toISOString().split("T")[0] };
      }
      return item;
    }));

    // Add movement record
    const movement: StockMovement = {
      id: Date.now().toString(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: movementType,
      quantity: movementType === "out" ? -movementData.quantity : movementData.quantity,
      reason: movementData.reason,
      user: "Usuário Atual",
      date: new Date().toLocaleString("pt-BR"),
      reference: movementData.reference,
    };

    setMovements(prev => [movement, ...prev]);
    setShowMovement(false);
    setSelectedItem(null);
    setMovementData({ quantity: 0, reason: "", reference: "" });
    toast.success(`Movimentação de ${movementType === "in" ? "entrada" : movementType === "out" ? "saída" : "ajuste"} registrada!`);
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const criticalItems = inventory.filter(i => i.status === "critical").length;
  const lowItems = inventory.filter(i => i.status === "low").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de SKUs</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                <p className="text-2xl font-bold">R$ {(totalValue / 1000).toFixed(1)}k</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-amber-600">{lowItems}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-amber-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-destructive">{criticalItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="items" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="items">Itens em Estoque</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="locations">Localizações</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ok">OK</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="excess">Excesso</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>

            <Button onClick={handleSetShowAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </div>

        <TabsContent value="items">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handlehandleSort}>
                      <div className="flex items-center gap-1">
                        SKU
                        {sortField === "sku" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handlehandleSort}>
                      <div className="flex items-center gap-1">
                        Descrição
                        {sortField === "name" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </div>
                    </TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => handlehandleSort}>
                      <div className="flex items-center justify-center gap-1">
                        Qtd
                        {sortField === "quantity" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Nível</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.expiryDate && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Validade: {item.expiryDate}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{item.quantity}</span>
                        <span className="text-muted-foreground text-sm"> {item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress 
                            value={(item.quantity / item.maxStock) * 100} 
                            className={`h-2 ${
                              item.status === "critical" ? "[&>div]:bg-destructive" : 
                                item.status === "low" ? "[&>div]:bg-amber-500" :
                                  item.status === "excess" ? "[&>div]:bg-purple-500" : "[&>div]:bg-green-500"
                            }`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.lot}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === "critical" ? "destructive" :
                            item.status === "low" ? "default" :
                              item.status === "excess" ? "secondary" : "outline"
                        }>
                          {item.status === "critical" ? "Crítico" :
                            item.status === "low" ? "Baixo" :
                              item.status === "excess" ? "Excesso" : "OK"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item);
                              setMovementType("in");
                              setShowMovement(true);
                            }}
                          >
                            <ArrowDown className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item);
                              setMovementType("out");
                              setShowMovement(true);
                            }}
                          >
                            <ArrowUp className="h-4 w-4 text-red-500" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="text-sm">{mov.date}</TableCell>
                      <TableCell>
                        <Badge variant={
                          mov.type === "in" ? "default" :
                            mov.type === "out" ? "destructive" :
                              mov.type === "transfer" ? "secondary" : "outline"
                        }>
                          {mov.type === "in" && <ArrowDown className="h-3 w-3 mr-1" />}
                          {mov.type === "out" && <ArrowUp className="h-3 w-3 mr-1" />}
                          {mov.type === "in" ? "Entrada" :
                            mov.type === "out" ? "Saída" :
                              mov.type === "transfer" ? "Transferência" : "Ajuste"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{mov.itemName}</TableCell>
                      <TableCell className="text-center">
                        <span className={mov.quantity > 0 ? "text-green-600" : "text-red-600"}>
                          {mov.quantity > 0 ? "+" : ""}{mov.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{mov.reason}</TableCell>
                      <TableCell className="font-mono text-sm">{mov.reference}</TableCell>
                      <TableCell className="text-sm">{mov.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["A1", "A2", "B1", "B2", "C1", "D1", "D2"].map((loc) => {
              const items = inventory.filter(i => i.location.startsWith(loc));
              const hasAlerts = items.some(i => i.status === "critical" || i.status === "low");
              return (
                <Card key={loc} className={hasAlerts ? "border-amber-500/50" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="flex items-center gap-2">
                        <Warehouse className="h-5 w-5" />
                        Setor {loc}
                      </span>
                      {hasAlerts && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{items.length} itens</p>
                    <p className="text-sm text-muted-foreground">
                      {items.reduce((sum, i) => sum + i.quantity, 0)} unidades total
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {items.slice(0, 3).map((item) => (
                        <Badge key={item.id} variant="secondary" className="text-xs">
                          {item.sku}
                        </Badge>
                      ))}
                      {items.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{items.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item ao Estoque</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input 
                placeholder="FIL-OLE-007"
                value={newItem.sku}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome/Descrição</Label>
              <Input 
                placeholder="Nome do item"
                value={newItem.name}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                value={newItem.category} 
                onValueChange={(v) => setNewItem(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Consumíveis">Consumíveis</SelectItem>
                  <SelectItem value="Segurança">Segurança</SelectItem>
                  <SelectItem value="DP System">DP System</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select 
                value={newItem.unit} 
                onValueChange={(v) => setNewItem(prev => ({ ...prev, unit: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade (un)</SelectItem>
                  <SelectItem value="L">Litros (L)</SelectItem>
                  <SelectItem value="kg">Quilos (kg)</SelectItem>
                  <SelectItem value="m">Metros (m)</SelectItem>
                  <SelectItem value="pç">Peças (pç)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade Inicial</Label>
              <Input 
                type="number"
                value={newItem.quantity}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Custo Unitário (R$)</Label>
              <Input 
                type="number"
                step="0.01"
                value={newItem.unitCost}
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
            <div className="space-y-2">
              <Label>Estoque Máximo</Label>
              <Input 
                type="number"
                value={newItem.maxStock}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <Input 
                placeholder="A1-01"
                value={newItem.location}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Lote</Label>
              <Input 
                placeholder="L2024-XXX"
                value={newItem.lot}
                onChange={handleChange}))}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Data de Validade (opcional)</Label>
              <Input 
                type="date"
                value={newItem.expiryDate}
                onChange={handleChange}))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowAddItem}>Cancelar</Button>
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={showMovement} onOpenChange={setShowMovement}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {movementType === "in" ? "Entrada de Estoque" :
                movementType === "out" ? "Saída de Estoque" : "Ajuste de Estoque"}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-semibold">{selectedItem.name}</p>
                <p className="text-sm text-muted-foreground">SKU: {selectedItem.sku} | Atual: {selectedItem.quantity} {selectedItem.unit}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Movimentação</Label>
                <Select 
                  value={movementType} 
                  onValueChange={(v: "in" | "out" | "adjustment") => setMovementType(v}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Entrada</SelectItem>
                    <SelectItem value="out">Saída</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input 
                  type="number"
                  value={movementData.quantity}
                  onChange={handleChange}))}
                />
              </div>

              <div className="space-y-2">
                <Label>Motivo</Label>
                <Textarea 
                  placeholder="Descreva o motivo da movimentação..."
                  value={movementData.reason}
                  onChange={handleChange}))}
                />
              </div>

              <div className="space-y-2">
                <Label>Referência (OS, PO, etc.)</Label>
                <Input 
                  placeholder="OS-2024-XXX"
                  value={movementData.reference}
                  onChange={handleChange}))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowMovement}>Cancelar</Button>
            <Button onClick={handleMovement}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar Movimentação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
