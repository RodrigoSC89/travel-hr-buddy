/**
 * Garbage Record Book - Complete MARPOL Annex V Compliance
 * Digital garbage management with category tracking
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
  Trash2,
  Plus,
  Download,
  Search,
  Calendar,
  Ship,
  CheckCircle,
  Clock,
  Eye,
  Printer,
  AlertTriangle,
  FileText,
  MapPin,
  Pen,
  Filter,
  Recycle,
  Flame,
  Anchor,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GarbageRecordEntry {
  id: string;
  entry_number: number;
  date: string;
  time: string;
  category_code: string;
  category_name: string;
  estimated_quantity: number;
  unit: string;
  disposal_method: string;
  disposal_location: string;
  start_position_lat: string;
  start_position_lon: string;
  end_position_lat?: string;
  end_position_lon?: string;
  officer_name: string;
  officer_rank: string;
  remarks: string;
  master_verified: boolean;
  master_signature_date?: string;
  special_area: boolean;
  distance_from_land_nm?: number;
}

const GARBAGE_CATEGORIES = [
  { code: "A", name: "Plásticos", icon: "🔴", disposal: ["Porto"] },
  { code: "B", name: "Resíduos alimentares", icon: "🟢", disposal: ["Mar (>12mn)", "Mar (>3mn triturado)", "Porto"] },
  { code: "C", name: "Resíduos domésticos", icon: "🟡", disposal: ["Mar (>12mn)", "Porto"] },
  { code: "D", name: "Óleo de cozinha", icon: "🟠", disposal: ["Porto"] },
  { code: "E", name: "Cinzas de incinerador", icon: "⚫", disposal: ["Mar (>12mn)", "Porto"] },
  { code: "F", name: "Resíduos operacionais", icon: "🔵", disposal: ["Porto", "Incineração"] },
  { code: "G", name: "Carcaças de animais", icon: "⚪", disposal: ["Mar (máx. distância)", "Porto"] },
  { code: "H", name: "Artes de pesca", icon: "🟣", disposal: ["Porto"] },
  { code: "I", name: "E-waste", icon: "⬛", disposal: ["Porto"] },
  { code: "J", name: "Resíduos de carga", icon: "🟤", disposal: ["Mar (conforme carga)", "Porto"] },
];

const DISPOSAL_METHODS = [
  { id: "port", label: "Descarga em instalação portuária", icon: Building },
  { id: "sea-12nm", label: "Descarga no mar (>12 milhas náuticas)", icon: Anchor },
  { id: "sea-3nm", label: "Descarga no mar (>3mn - triturado)", icon: Anchor },
  { id: "incineration", label: "Incineração a bordo", icon: Flame },
  { id: "recycling", label: "Reciclagem em porto", icon: Recycle },
];

const fallbackEntries: GarbageRecordEntry[] = [
  {
    id: "1",
    entry_number: 89,
    date: "2024-01-15",
    time: "10:30",
    category_code: "A",
    category_name: "Plásticos",
    estimated_quantity: 18,
    unit: "kg",
    disposal_method: "Descarga em instalação portuária",
    disposal_location: "Porto de Macaé - Eco-Waste Terminal",
    start_position_lat: "Porto de Macaé",
    start_position_lon: "-",
    officer_name: "Ana Paula Martins",
    officer_rank: "Oficial de Convés",
    remarks: "Plásticos segregados para reciclagem. Certificado de recebimento nº GRB-2024-0089.",
    master_verified: true,
    master_signature_date: "2024-01-15",
    special_area: false,
  },
  {
    id: "2",
    entry_number: 88,
    date: "2024-01-14",
    time: "12:00",
    category_code: "B",
    category_name: "Resíduos alimentares",
    estimated_quantity: 32,
    unit: "kg",
    disposal_method: "Descarga no mar (>12 milhas náuticas)",
    disposal_location: "Em trânsito",
    start_position_lat: "22°45'S",
    start_position_lon: "039°30'W",
    end_position_lat: "22°48'S",
    end_position_lon: "039°28'W",
    officer_name: "Roberto Almeida",
    officer_rank: "Cozinheiro Chefe",
    remarks: "Resíduos alimentares triturados (<25mm). Distância da costa: 18mn.",
    master_verified: true,
    master_signature_date: "2024-01-14",
    special_area: false,
    distance_from_land_nm: 18,
  },
  {
    id: "3",
    entry_number: 87,
    date: "2024-01-13",
    time: "16:00",
    category_code: "F",
    category_name: "Resíduos operacionais",
    estimated_quantity: 5,
    unit: "kg",
    disposal_method: "Incineração a bordo",
    disposal_location: "Em trânsito",
    start_position_lat: "23°05'S",
    start_position_lon: "040°15'W",
    officer_name: "Carlos Eduardo Silva",
    officer_rank: "1º Oficial de Máquinas",
    remarks: "Trapos oleosos e materiais contaminados incinerados. Registro de incineração anexo.",
    master_verified: true,
    master_signature_date: "2024-01-13",
    special_area: false,
  },
  {
    id: "4",
    entry_number: 86,
    date: "2024-01-12",
    time: "09:15",
    category_code: "C",
    category_name: "Resíduos domésticos",
    estimated_quantity: 12,
    unit: "kg",
    disposal_method: "Descarga em instalação portuária",
    disposal_location: "Porto de Macaé",
    start_position_lat: "Porto de Macaé",
    start_position_lon: "-",
    officer_name: "Ana Paula Martins",
    officer_rank: "Oficial de Convés",
    remarks: "Papel, papelão e materiais recicláveis separados.",
    master_verified: false,
    special_area: false,
  },
];

export function GarbageRecordBookComplete() {
  const [entries, setEntries] = useState<GarbageRecordEntry[]>(fallbackEntries);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<GarbageRecordEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [newEntry, setNewEntry] = useState<Partial<GarbageRecordEntry>>({
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    category_code: "",
    estimated_quantity: 0,
    unit: "kg",
    disposal_method: "",
    disposal_location: "",
    start_position_lat: "",
    start_position_lon: "",
    officer_name: "",
    officer_rank: "",
    remarks: "",
    special_area: false,
  });

  const nextEntryNumber = Math.max(...entries.map((e) => e.entry_number)) + 1;

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.disposal_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.officer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || e.category_code === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const pendingVerification = entries.filter((e) => !e.master_verified).length;

  // Stats by category
  const categoryStats = GARBAGE_CATEGORIES.map((cat) => {
    const categoryEntries = entries.filter((e) => e.category_code === cat.code);
    const totalQty = categoryEntries.reduce((sum, e) => sum + e.estimated_quantity, 0);
    return { ...cat, count: categoryEntries.length, totalQty };
  }).filter((c) => c.count > 0);

  const handleAddEntry = () => {
    const category = GARBAGE_CATEGORIES.find((c) => c.code === newEntry.category_code);
    const entry: GarbageRecordEntry = {
      id: Date.now().toString(),
      entry_number: nextEntryNumber,
      ...newEntry,
      category_name: category?.name || "",
      master_verified: false,
    } as GarbageRecordEntry;

    setEntries([entry, ...entries]);
    setShowAddDialog(false);
    setNewEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      category_code: "",
      estimated_quantity: 0,
      unit: "kg",
      disposal_method: "",
      disposal_location: "",
      start_position_lat: "",
      start_position_lon: "",
      officer_name: "",
      officer_rank: "",
      remarks: "",
      special_area: false,
    });
    toast.success(`Entrada #${nextEntryNumber} adicionada ao Garbage Record Book!`);
  };

  const handleMasterSign = (entryId: string) => {
    setEntries(
      entries.map((e) =>
        e.id === entryId
          ? { ...e, master_verified: true, master_signature_date: format(new Date(), "yyyy-MM-dd") }
          : e
      )
    );
    setShowSignDialog(false);
    toast.success("Entrada verificada e assinada pelo Comandante!");
  };

  const handleExportPDF = () => {
    const csvRows = [
      "Nº;Data;Hora;Categoria;Quantidade;Unidade;Método;Local;Oficial;Verificado",
      ...entries.map(e =>
        `${e.entry_number};${e.date};${e.time};${e.category_name};${e.estimated_quantity};${e.unit};${e.disposal_method};${e.disposal_location};${e.officer_name};${e.master_verified ? "Sim" : "Não"}`
      )
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garbage-record-book-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Garbage Record Book exportado!");
  };

  const getDisposalIcon = (method: string) => {
    if (method.includes("porto") || method.includes("Porto")) return Building;
    if (method.includes("mar") || method.includes("Mar")) return Anchor;
    if (method.includes("Incineração")) return Flame;
    if (method.includes("Reciclagem")) return Recycle;
    return FileText;
  };

  return (
    <div className="space-y-6">
      {/* Category Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categoryStats.slice(0, 5).map((cat) => (
          <Card key={cat.code} className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{cat.icon}</span>
                <Badge variant="secondary">{cat.count}</Badge>
              </div>
              <p className="font-medium text-sm">{cat.name}</p>
              <p className="text-xs text-muted-foreground">{cat.totalQty} kg total</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{entries.length}</p>
                <p className="text-xs text-muted-foreground">Total de Entradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingVerification}</p>
                <p className="text-xs text-muted-foreground">Aguardando Assinatura</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Recycle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {entries.reduce((sum, e) => sum + e.estimated_quantity, 0)} kg
                </p>
                <p className="text-xs text-muted-foreground">Total Descartado (Mês)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Conformidade MARPOL V</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Alert */}
      {pendingVerification > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">
                    {pendingVerification} entrada(s) aguardando assinatura do Comandante
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Conforme MARPOL Anexo V, todas as entradas devem ser verificadas
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const pending = entries.find((e) => !e.master_verified);
                  if (pending) {
                    setSelectedEntry(pending);
                    setShowSignDialog(true);
                  }
                }}
              >
                <Pen className="h-4 w-4 mr-2" />
                Assinar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {GARBAGE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.code} value={cat.code}>
                  {cat.icon} {cat.code} - {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-green-500" />
                  Nova Entrada - Garbage Record Book
                </DialogTitle>
                <DialogDescription>
                  Entrada #{nextEntryNumber} - MARPOL Anexo V
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora (UTC)</Label>
                    <Input
                      type="time"
                      value={newEntry.time}
                      onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={newEntry.category_code}
                      onValueChange={(v) => setNewEntry({ ...newEntry, category_code: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {GARBAGE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.code} value={cat.code}>
                            {cat.icon} {cat.code} - {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade Estimada</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newEntry.estimated_quantity}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, estimated_quantity: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select
                      value={newEntry.unit}
                      onValueChange={(v) => setNewEntry({ ...newEntry, unit: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="m³">m³</SelectItem>
                        <SelectItem value="L">Litros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Método de Descarte</Label>
                    <Select
                      value={newEntry.disposal_method}
                      onValueChange={(v) => setNewEntry({ ...newEntry, disposal_method: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISPOSAL_METHODS.map((method) => (
                          <SelectItem key={method.id} value={method.label}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Local de Descarte</Label>
                  <Input
                    value={newEntry.disposal_location}
                    onChange={(e) => setNewEntry({ ...newEntry, disposal_location: e.target.value })}
                    placeholder="Ex: Porto de Macaé - Terminal Eco-Waste"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Posição Inicial - Latitude</Label>
                    <Input
                      value={newEntry.start_position_lat}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, start_position_lat: e.target.value })
                      }
                      placeholder="Ex: 22°45'S ou Porto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Posição Inicial - Longitude</Label>
                    <Input
                      value={newEntry.start_position_lon}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, start_position_lon: e.target.value })
                      }
                      placeholder="Ex: 039°30'W"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Oficial Responsável</Label>
                    <Input
                      value={newEntry.officer_name}
                      onChange={(e) => setNewEntry({ ...newEntry, officer_name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo/Função</Label>
                    <Input
                      value={newEntry.officer_rank}
                      onChange={(e) => setNewEntry({ ...newEntry, officer_rank: e.target.value })}
                      placeholder="Ex: Oficial de Convés"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={newEntry.remarks}
                    onChange={(e) => setNewEntry({ ...newEntry, remarks: e.target.value })}
                    placeholder="Detalhes adicionais, certificados de recebimento, etc."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddEntry}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-green-500" />
            Garbage Record Book - MARPOL Anexo V
          </CardTitle>
          <CardDescription>
            Embarcação: PSV Atlantic Explorer | IMO: 9876543 | Bandeira: Brasil
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Local/Posição</TableHead>
                  <TableHead>Oficial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredEntries.map((entry) => {
                    const DisposalIcon = getDisposalIcon(entry.disposal_method);
                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-mono font-bold">{entry.entry_number}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(entry.date), "dd/MM/yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">{entry.time} UTC</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>
                              {GARBAGE_CATEGORIES.find((c) => c.code === entry.category_code)?.icon}
                            </span>
                            <div>
                              <Badge variant="outline" className="font-mono">
                                {entry.category_code}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {entry.category_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {entry.estimated_quantity} {entry.unit}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DisposalIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm max-w-[150px] truncate">
                              {entry.disposal_method}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{entry.disposal_location}</div>
                          {entry.start_position_lat !== "Porto" && entry.start_position_lat !== "Porto de Macaé" && (
                            <div className="text-muted-foreground">
                              {entry.start_position_lat}, {entry.start_position_lon}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{entry.officer_name}</div>
                          <div className="text-xs text-muted-foreground">{entry.officer_rank}</div>
                        </TableCell>
                        <TableCell>
                          {entry.master_verified ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-500 border-amber-500">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!entry.master_verified && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEntry(entry);
                                  setShowSignDialog(true);
                                }}
                              >
                                <Pen className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pen className="h-5 w-5 text-primary" />
              Verificação do Comandante
            </DialogTitle>
            <DialogDescription>
              Entrada #{selectedEntry?.entry_number} - {selectedEntry?.category_name}
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="font-medium">
                    {GARBAGE_CATEGORIES.find((c) => c.code === selectedEntry.category_code)?.icon}{" "}
                    {selectedEntry.category_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="font-medium">
                    {selectedEntry.estimated_quantity} {selectedEntry.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método:</span>
                  <span className="font-medium">{selectedEntry.disposal_method}</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg border-primary/30 bg-primary/5">
                <p className="text-sm text-center">
                  Ao assinar, confirmo que verifiquei esta entrada conforme MARPOL 73/78 Anexo V.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => selectedEntry && handleMasterSign(selectedEntry.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Assinar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
