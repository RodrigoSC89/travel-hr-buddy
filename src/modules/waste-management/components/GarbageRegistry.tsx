/**
 * Controle de Resíduos Sólidos - Garbage Record Book
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  Plus,
  Download,
  Search,
  Filter,
  Calendar,
  MapPin,
  Ship,
  Package,
  Recycle,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface WasteRecord {
  id: string;
  date: string;
  category: string;
  subcategory: string;
  quantity: number;
  unit: string;
  source: string;
  destination: string;
  method: string;
  vessel: string;
  certificate: string;
  status: "pending" | "completed" | "verified";
  notes: string;
}

const wasteCategories = {
  A: { label: "Plásticos", subcategories: ["Embalagens", "Cabos", "Redes de pesca", "Outros"] },
  B: { label: "Resíduos alimentares", subcategories: ["Cozinha", "Refeitório", "Provisões estragadas"] },
  C: { label: "Resíduos domésticos", subcategories: ["Papel", "Papelão", "Vidro", "Metal", "Têxteis"] },
  D: { label: "Óleo de cozinha", subcategories: ["Óleo usado", "Gorduras"] },
  E: { label: "Cinzas de incinerador", subcategories: ["Cinzas", "Escórias"] },
  F: { label: "Resíduos operacionais", subcategories: ["Carga", "Manutenção", "Equipamentos"] },
  G: { label: "Carcaça de animais", subcategories: ["Animais mortos a bordo"] },
  H: { label: "Material de pesca", subcategories: ["Redes", "Linhas", "Armadilhas"] },
  I: { label: "E-waste", subcategories: ["Eletrônicos", "Baterias", "Lâmpadas"] },
};

const initialRecords: WasteRecord[] = [
  { id: "1", date: "2024-01-14", category: "A", subcategory: "Embalagens", quantity: 45, unit: "kg", source: "Cozinha", destination: "Reciclagem", method: "Empresa credenciada", vessel: "PSV Atlantic Explorer", certificate: "CERT-2024-001", status: "verified", notes: "" },
  { id: "2", date: "2024-01-13", category: "B", subcategory: "Cozinha", quantity: 28, unit: "kg", source: "Refeitório", destination: "Compostagem", method: "Porto de Macaé", vessel: "PSV Atlantic Explorer", certificate: "CERT-2024-002", status: "completed", notes: "" },
  { id: "3", date: "2024-01-12", category: "C", subcategory: "Papel", quantity: 15, unit: "kg", source: "Escritório", destination: "Reciclagem", method: "Cooperativa", vessel: "AHTS Pacific Star", certificate: "CERT-2024-003", status: "verified", notes: "" },
  { id: "4", date: "2024-01-11", category: "D", subcategory: "Óleo usado", quantity: 35, unit: "L", source: "Cozinha", destination: "Re-refino", method: "Empresa certificada", vessel: "OSV Caribbean Wind", certificate: "CERT-2024-004", status: "verified", notes: "" },
  { id: "5", date: "2024-01-10", category: "I", subcategory: "Baterias", quantity: 8, unit: "kg", source: "Operações", destination: "Logística reversa", method: "Fabricante", vessel: "PSV Gulf Stream", certificate: "CERT-2024-005", status: "pending", notes: "Aguardando manifesto" },
];

export function GarbageRegistry() {
  const [records, setRecords] = useState<WasteRecord[]>(initialRecords);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newRecord, setNewRecord] = useState<Partial<WasteRecord>>({
    date: new Date().toISOString().split("T")[0],
    category: "",
    subcategory: "",
    quantity: 0,
    unit: "kg",
    source: "",
    destination: "",
    method: "",
    vessel: "",
    notes: "",
  });

  const handleAddRecord = () => {
    const record: WasteRecord = {
      id: Date.now().toString(),
      ...newRecord as Omit<WasteRecord, "id" | "certificate" | "status">,
      certificate: `CERT-${new Date().getFullYear()}-${String(records.length + 1).padStart(3, "0")}`,
      status: "pending",
    };
    setRecords([record, ...records]);
    setIsAddDialogOpen(false);
    setNewRecord({
      date: new Date().toISOString().split("T")[0],
      category: "",
      subcategory: "",
      quantity: 0,
      unit: "kg",
      source: "",
      destination: "",
      method: "",
      vessel: "",
      notes: "",
    });
    toast.success("Registro de resíduo adicionado!");
  };

  const handleVerify = (id: string) => {
    setRecords(records.map(r => 
      r.id === id ? { ...r, status: "verified" as const } : r
    ));
    toast.success("Registro verificado!");
  };

  const filteredRecords = records.filter(record => {
    if (filterCategory !== "all" && record.category !== filterCategory) return false;
    if (filterStatus !== "all" && record.status !== filterStatus) return false;
    if (searchTerm && !record.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !record.vessel.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalByCategory = Object.keys(wasteCategories).reduce((acc, cat) => {
    acc[cat] = records.filter(r => r.category === cat).reduce((sum, r) => sum + r.quantity, 0);
    return acc;
  }, {} as Record<string, number>);

  const totalRecycled = records.filter(r => r.destination.toLowerCase().includes("reciclagem")).reduce((sum, r) => sum + r.quantity, 0);
  const totalWaste = records.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Registrado</p>
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-xs text-green-600">Registros este mês</p>
              </div>
              <FileText className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Volume Total</p>
                <p className="text-2xl font-bold">{totalWaste} kg</p>
                <p className="text-xs text-primary">Todas categorias</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Reciclagem</p>
                <p className="text-2xl font-bold">{totalWaste > 0 ? Math.round((totalRecycled / totalWaste) * 100) : 0}%</p>
                <p className="text-xs text-info">{totalRecycled} kg reciclados</p>
              </div>
              <Recycle className="h-8 w-8 text-info opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{records.filter(r => r.status === "pending").length}</p>
                <p className="text-xs text-warning">Aguardando verificação</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Resumo por Categoria MARPOL Anexo V
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {Object.entries(wasteCategories).map(([key, val]) => (
              <div key={key} className="text-center p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Cat. {key}</div>
                <div className="font-bold text-lg">{totalByCategory[key] || 0}</div>
                <div className="text-xs text-muted-foreground truncate" title={val.label}>{val.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {Object.entries(wasteCategories).map(([key, val]) => (
                <SelectItem key={key} value={key}>{key} - {val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Completo</SelectItem>
              <SelectItem value="verified">Verificado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Resíduo</DialogTitle>
                <DialogDescription>
                  Adicione um novo registro de resíduo sólido (MARPOL Anexo V).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Embarcação</Label>
                    <Select 
                      value={newRecord.vessel} 
                      onValueChange={(v) => setNewRecord({ ...newRecord, vessel: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PSV Atlantic Explorer">PSV Atlantic Explorer</SelectItem>
                        <SelectItem value="AHTS Pacific Star">AHTS Pacific Star</SelectItem>
                        <SelectItem value="OSV Caribbean Wind">OSV Caribbean Wind</SelectItem>
                        <SelectItem value="PSV Gulf Stream">PSV Gulf Stream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select 
                      value={newRecord.category} 
                      onValueChange={(v) => setNewRecord({ ...newRecord, category: v, subcategory: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(wasteCategories).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{key} - {val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Subcategoria</Label>
                    <Select 
                      value={newRecord.subcategory} 
                      onValueChange={(v) => setNewRecord({ ...newRecord, subcategory: v })}
                      disabled={!newRecord.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {newRecord.category && wasteCategories[newRecord.category as keyof typeof wasteCategories]?.subcategories.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={newRecord.quantity}
                      onChange={(e) => setNewRecord({ ...newRecord, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Unidade</Label>
                    <Select 
                      value={newRecord.unit} 
                      onValueChange={(v) => setNewRecord({ ...newRecord, unit: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="m³">m³</SelectItem>
                        <SelectItem value="un">unidades</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Origem</Label>
                    <Input
                      value={newRecord.source}
                      onChange={(e) => setNewRecord({ ...newRecord, source: e.target.value })}
                      placeholder="Ex: Cozinha"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Destino</Label>
                    <Select 
                      value={newRecord.destination} 
                      onValueChange={(v) => setNewRecord({ ...newRecord, destination: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reciclagem">Reciclagem</SelectItem>
                        <SelectItem value="Compostagem">Compostagem</SelectItem>
                        <SelectItem value="Incineração">Incineração</SelectItem>
                        <SelectItem value="Aterro sanitário">Aterro Sanitário</SelectItem>
                        <SelectItem value="Logística reversa">Logística Reversa</SelectItem>
                        <SelectItem value="Re-refino">Re-refino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Método</Label>
                    <Input
                      value={newRecord.method}
                      onChange={(e) => setNewRecord({ ...newRecord, method: e.target.value })}
                      placeholder="Ex: Empresa credenciada"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    placeholder="Informações adicionais..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddRecord}>Registrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Records Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Embarcação</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Certificado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {record.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline" className="mb-1">Cat. {record.category}</Badge>
                      <p className="text-sm text-muted-foreground">{record.subcategory}</p>
                    </div>
                  </TableCell>
                  <TableCell>{record.quantity} {record.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{record.vessel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {record.destination}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{record.certificate}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      record.status === "verified" ? "default" : 
                      record.status === "completed" ? "secondary" : 
                      "outline"
                    } className={record.status === "verified" ? "bg-green-600" : ""}>
                      {record.status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {record.status === "pending" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {record.status === "verified" ? "Verificado" : record.status === "completed" ? "Completo" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {record.status === "pending" && (
                      <Button variant="ghost" size="sm" onClick={() => handleVerify(record.id)}>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
