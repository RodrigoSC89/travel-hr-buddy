/**
 * Oil Record Book - Complete MARPOL Annex I Compliance
 * Digital record keeping with master signature verification
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
  Droplets,
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
  User,
  Shield,
  Pen,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OilRecordEntry {
  id: string;
  entry_number: number;
  date: string;
  time: string;
  operation_code: string;
  operation_description: string;
  tank_id: string;
  tank_name: string;
  quantity_m3: number;
  unit: string;
  position_lat: string;
  position_lon: string;
  officer_name: string;
  officer_rank: string;
  remarks: string;
  master_verified: boolean;
  master_signature_date?: string;
  oil_content_ppm?: number;
  equipment_used?: string;
  port_facility?: string;
}

const OPERATION_CODES = [
  { code: "A", description: "Lastro ou lavagem de tanques de carga", category: "Cargo" },
  { code: "B", description: "Descarga de lastro sujo ou água de lavagem", category: "Cargo" },
  { code: "C", description: "Coleta e descarte de resíduos oleosos (slop)", category: "Slop" },
  { code: "D", description: "Descarga de água de porão (bilge water)", category: "Machinery" },
  { code: "E", description: "Descarga de água oleosa por equipamento separador", category: "Machinery" },
  { code: "F", description: "Condição do sistema de monitoramento de óleo", category: "Equipment" },
  { code: "G", description: "Descarga acidental ou excepcional de óleo", category: "Emergency" },
  { code: "H", description: "Operação de bunkering de combustível/óleo", category: "Bunkering" },
  { code: "I", description: "Operações adicionais e observações gerais", category: "General" },
];

const mockEntries: OilRecordEntry[] = [
  {
    id: "1",
    entry_number: 47,
    date: "2024-01-15",
    time: "08:30",
    operation_code: "D",
    operation_description: "Descarga de água de porão via OWS",
    tank_id: "bilge-1",
    tank_name: "Porão de Máquinas #1",
    quantity_m3: 0.85,
    unit: "m³",
    position_lat: "22°56'32\"S",
    position_lon: "040°12'15\"W",
    officer_name: "Carlos Eduardo Silva",
    officer_rank: "1º Oficial de Máquinas",
    remarks: "Descarte via OWS em conformidade - 12ppm registrado no monitor. Equipamento funcionando normalmente.",
    master_verified: true,
    master_signature_date: "2024-01-15",
    oil_content_ppm: 12,
    equipment_used: "Oil Water Separator Model XYZ-500",
  },
  {
    id: "2",
    entry_number: 46,
    date: "2024-01-14",
    time: "14:00",
    operation_code: "H",
    operation_description: "Bunkering de combustível MGO",
    tank_id: "fuel-main",
    tank_name: "Tanque Principal de Combustível",
    quantity_m3: 150,
    unit: "m³",
    position_lat: "Porto de Macaé",
    position_lon: "-",
    officer_name: "João Pedro Santos",
    officer_rank: "Chefe de Máquinas",
    remarks: "Recebimento de MGO 0.1%S da empresa Petrobras Distribuidora. BDN nº 12345.",
    master_verified: true,
    master_signature_date: "2024-01-14",
    port_facility: "Terminal Portuário de Macaé",
  },
  {
    id: "3",
    entry_number: 45,
    date: "2024-01-13",
    time: "16:45",
    operation_code: "C",
    operation_description: "Descarte de lodo oleoso em terra",
    tank_id: "sludge-1",
    tank_name: "Tanque de Lodo",
    quantity_m3: 3.2,
    unit: "m³",
    position_lat: "Porto de Macaé",
    position_lon: "-",
    officer_name: "Carlos Eduardo Silva",
    officer_rank: "1º Oficial de Máquinas",
    remarks: "Entrega para empresa credenciada Eco-Waste Ltda. Certificado de recebimento nº 2024-0123.",
    master_verified: true,
    master_signature_date: "2024-01-13",
    port_facility: "Eco-Waste Terminal",
  },
  {
    id: "4",
    entry_number: 44,
    date: "2024-01-12",
    time: "10:20",
    operation_code: "E",
    operation_description: "Descarga de água oleosa via separador 15ppm",
    tank_id: "bilge-2",
    tank_name: "Porão de Máquinas #2",
    quantity_m3: 0.45,
    unit: "m³",
    position_lat: "23°01'18\"S",
    position_lon: "040°08'42\"W",
    officer_name: "Maria Fernanda Costa",
    officer_rank: "2º Oficial de Máquinas",
    remarks: "Operação dentro dos limites MARPOL. Monitor indicou 8ppm.",
    master_verified: false,
    oil_content_ppm: 8,
    equipment_used: "Oil Water Separator Model XYZ-500",
  },
];

export function OilRecordBookComplete() {
  const [entries, setEntries] = useState<OilRecordEntry[]>(mockEntries);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<OilRecordEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [operationFilter, setOperationFilter] = useState<string>("all");

  const [newEntry, setNewEntry] = useState<Partial<OilRecordEntry>>({
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    operation_code: "",
    tank_name: "",
    quantity_m3: 0,
    unit: "m³",
    position_lat: "",
    position_lon: "",
    officer_name: "",
    officer_rank: "",
    remarks: "",
  });

  const nextEntryNumber = Math.max(...entries.map((e) => e.entry_number)) + 1;

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.operation_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.officer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOperation = operationFilter === "all" || e.operation_code === operationFilter;
    return matchesSearch && matchesOperation;
  });

  const pendingVerification = entries.filter((e) => !e.master_verified).length;

  const handleAddEntry = () => {
    const entry: OilRecordEntry = {
      id: Date.now().toString(),
      entry_number: nextEntryNumber,
      ...newEntry,
      operation_description: OPERATION_CODES.find((o) => o.code === newEntry.operation_code)?.description || "",
      tank_id: newEntry.tank_name?.toLowerCase().replace(/\s/g, "-") || "",
      master_verified: false,
    } as OilRecordEntry;

    setEntries([entry, ...entries]);
    setShowAddDialog(false);
    setNewEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      operation_code: "",
      tank_name: "",
      quantity_m3: 0,
      unit: "m³",
      position_lat: "",
      position_lon: "",
      officer_name: "",
      officer_rank: "",
      remarks: "",
    });
    toast.success(`Entrada #${nextEntryNumber} adicionada ao Oil Record Book!`);
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
    const rows = [
      "Nº;Data;Hora;Código;Descrição;Tanque;Qtd (m³);Posição;Verificado",
      ...entries.map(e => `${e.entry_number};${e.date};${e.time};${e.operation_code};${e.operation_description};${e.tank_name};${e.quantity_m3};${e.position_lat} ${e.position_lon};${e.master_verified ? "Sim" : "Não"}`)
    ];
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oil-record-book-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Oil Record Book exportado!");
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
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
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{entries.length - pendingVerification}</p>
                <p className="text-xs text-muted-foreground">Verificadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Conformidade MARPOL</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Verification Alert */}
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
                    As entradas devem ser verificadas e assinadas dentro de 24 horas
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
                Assinar Agora
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
              placeholder="Buscar entrada..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={operationFilter} onValueChange={setOperationFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Operação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Operações</SelectItem>
              {OPERATION_CODES.map((op) => (
                <SelectItem key={op.code} value={op.code}>
                  {op.code} - {op.description.substring(0, 30)}...
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
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
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
                  <Droplets className="h-5 w-5 text-primary" />
                  Nova Entrada - Oil Record Book
                </DialogTitle>
                <DialogDescription>
                  Entrada #{nextEntryNumber} - MARPOL Anexo I
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
                    <Label>Código da Operação</Label>
                    <Select
                      value={newEntry.operation_code}
                      onValueChange={(v) => setNewEntry({ ...newEntry, operation_code: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATION_CODES.map((op) => (
                          <SelectItem key={op.code} value={op.code}>
                            {op.code} - {op.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tanque/Equipamento</Label>
                    <Input
                      value={newEntry.tank_name}
                      onChange={(e) => setNewEntry({ ...newEntry, tank_name: e.target.value })}
                      placeholder="Ex: Porão de Máquinas #1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newEntry.quantity_m3}
                      onChange={(e) => setNewEntry({ ...newEntry, quantity_m3: Number(e.target.value) })}
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
                        <SelectItem value="m³">m³</SelectItem>
                        <SelectItem value="L">Litros</SelectItem>
                        <SelectItem value="ton">Toneladas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Posição - Latitude</Label>
                    <Input
                      value={newEntry.position_lat}
                      onChange={(e) => setNewEntry({ ...newEntry, position_lat: e.target.value })}
                      placeholder="Ex: 22°56'32&quot;S ou Porto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Posição - Longitude</Label>
                    <Input
                      value={newEntry.position_lon}
                      onChange={(e) => setNewEntry({ ...newEntry, position_lon: e.target.value })}
                      placeholder="Ex: 040°12'15&quot;W"
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
                      placeholder="Ex: 1º Oficial de Máquinas"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações / Detalhes da Operação</Label>
                  <Textarea
                    value={newEntry.remarks}
                    onChange={(e) => setNewEntry({ ...newEntry, remarks: e.target.value })}
                    placeholder="Descreva detalhes da operação, equipamentos utilizados, leituras de monitores, etc."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddEntry}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Entrada
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
            <Droplets className="h-5 w-5 text-amber-500" />
            Oil Record Book - Part I (Machinery Space Operations)
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
                  <TableHead>Operação</TableHead>
                  <TableHead>Tanque</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead>Oficial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredEntries.map((entry) => (
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
                        <Badge variant="outline" className="font-mono">
                          {entry.operation_code}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                          {entry.operation_description}
                        </p>
                      </TableCell>
                      <TableCell>{entry.tank_name}</TableCell>
                      <TableCell className="font-mono">
                        {entry.quantity_m3} {entry.unit}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{entry.position_lat}</div>
                        <div className="text-muted-foreground">{entry.position_lon}</div>
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
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Master Signature Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pen className="h-5 w-5 text-primary" />
              Verificação do Comandante
            </DialogTitle>
            <DialogDescription>
              Confirme a verificação e assinatura da entrada #{selectedEntry?.entry_number}
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">
                    {format(new Date(selectedEntry.date), "dd/MM/yyyy")} - {selectedEntry.time} UTC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operação:</span>
                  <span className="font-medium">
                    {selectedEntry.operation_code} - {selectedEntry.operation_description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="font-medium">
                    {selectedEntry.quantity_m3} {selectedEntry.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Oficial:</span>
                  <span className="font-medium">{selectedEntry.officer_name}</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg border-primary/30 bg-primary/5">
                <p className="text-sm text-center">
                  Ao assinar, confirmo que verifiquei esta entrada e que as informações estão corretas
                  conforme MARPOL 73/78 Anexo I.
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
              Verificar e Assinar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
