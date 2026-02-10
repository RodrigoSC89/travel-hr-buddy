/**
 * Oil Record Book & Garbage Record Book - MARPOL Compliance
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FileText,
  Plus,
  Download,
  Search,
  Calendar,
  Ship,
  Fuel,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  Printer,
  AlertTriangle,
  Droplets,
} from "lucide-react";
import { toast } from "sonner";

interface OilRecordEntry {
  id: string;
  date: string;
  operationType: string;
  tankInvolved: string;
  quantity: number;
  unit: string;
  position: { lat: string; lon: string };
  officerName: string;
  remarks: string;
  verified: boolean;
}

interface GarbageRecordEntry {
  id: string;
  date: string;
  category: string;
  estimatedQuantity: number;
  unit: string;
  disposalMethod: string;
  startPosition: { lat: string; lon: string };
  endPosition: { lat: string; lon: string };
  officerName: string;
  remarks: string;
  verified: boolean;
}

const oilOperationTypes = [
  { code: "A", label: "Lastro ou lavagem de tanques de carga" },
  { code: "B", label: "Descarga de lastro sujo ou água de lavagem" },
  { code: "C", label: "Coleta e descarte de resíduos oleosos" },
  { code: "D", label: "Descarga de água de porão (bilge)" },
  { code: "E", label: "Descarga de água oleosa por equipamento" },
  { code: "F", label: "Condição do sistema de monitoramento" },
  { code: "G", label: "Descarga acidental/excepcional" },
  { code: "H", label: "Bunkering de combustível ou óleo lubrificante" },
  { code: "I", label: "Operações adicionais/observações" },
];

const initialOilRecords: OilRecordEntry[] = [
  { id: "1", date: "2024-01-14", operationType: "D", tankInvolved: "Porão #1", quantity: 0.8, unit: "m³", position: { lat: "22°56'S", lon: "040°12'W" }, officerName: "Cap. Silva", remarks: "Descarte via OWS - 15ppm OK", verified: true },
  { id: "2", date: "2024-01-13", operationType: "H", tankInvolved: "Tanque Combustível", quantity: 150, unit: "m³", position: { lat: "Porto de Macaé", lon: "-" }, officerName: "Eng. Santos", remarks: "Bunkering MGO 0.1%S", verified: true },
  { id: "3", date: "2024-01-12", operationType: "C", tankInvolved: "Tanque de Lodo", quantity: 2.5, unit: "m³", position: { lat: "Porto de Macaé", lon: "-" }, officerName: "Cap. Silva", remarks: "Descarte em terra - empresa credenciada", verified: true },
  { id: "4", date: "2024-01-10", operationType: "D", tankInvolved: "Porão #2", quantity: 0.5, unit: "m³", position: { lat: "23°01'S", lon: "040°08'W" }, officerName: "Of. Costa", remarks: "Descarte via OWS - 12ppm registrado", verified: false },
];

const initialGarbageRecords: GarbageRecordEntry[] = [
  { id: "1", date: "2024-01-14", category: "A - Plásticos", estimatedQuantity: 15, unit: "kg", disposalMethod: "Descarga em porto", startPosition: { lat: "Porto", lon: "Macaé" }, endPosition: { lat: "-", lon: "-" }, officerName: "Cap. Silva", remarks: "Entregue à empresa credenciada", verified: true },
  { id: "2", date: "2024-01-13", category: "B - Resíduos alimentares", estimatedQuantity: 25, unit: "kg", disposalMethod: "Descarga no mar (>12mn)", startPosition: { lat: "22°50'S", lon: "039°45'W" }, endPosition: { lat: "22°52'S", lon: "039°44'W" }, officerName: "Coz. Pereira", remarks: "Resíduos triturados <25mm", verified: true },
  { id: "3", date: "2024-01-12", category: "C - Resíduos domésticos", estimatedQuantity: 8, unit: "kg", disposalMethod: "Descarga em porto", startPosition: { lat: "Porto", lon: "Macaé" }, endPosition: { lat: "-", lon: "-" }, officerName: "Of. Costa", remarks: "Papel e papelão para reciclagem", verified: true },
  { id: "4", date: "2024-01-10", category: "F - Resíduos operacionais", estimatedQuantity: 5, unit: "kg", disposalMethod: "Incineração a bordo", startPosition: { lat: "23°10'S", lon: "040°30'W" }, endPosition: { lat: "-", lon: "-" }, officerName: "Eng. Santos", remarks: "Trapos oleosos incinerados", verified: false },
];

export function RecordBooks() {
  const [oilRecords, setOilRecords] = useState<OilRecordEntry[]>(initialOilRecords);
  const [garbageRecords, setGarbageRecords] = useState<GarbageRecordEntry[]>(initialGarbageRecords);
  const [isOilDialogOpen, setIsOilDialogOpen] = useState(false);
  const [isGarbageDialogOpen, setIsGarbageDialogOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState("PSV Atlantic Explorer");

  const [newOilRecord, setNewOilRecord] = useState<Partial<OilRecordEntry>>({
    date: new Date().toISOString().split("T")[0],
    operationType: "",
    tankInvolved: "",
    quantity: 0,
    unit: "m³",
    position: { lat: "", lon: "" },
    officerName: "",
    remarks: "",
  });

  const handleAddOilRecord = () => {
    const record: OilRecordEntry = {
      id: Date.now().toString(),
      ...newOilRecord as Omit<OilRecordEntry, "id" | "verified">,
      verified: false,
    };
    setOilRecords([record, ...oilRecords]);
    setIsOilDialogOpen(false);
    toast.success("Entrada adicionada ao Oil Record Book!");
  };

  const handleVerifyOil = (id: string) => {
    setOilRecords(oilRecords.map(r => r.id === id ? { ...r, verified: true } : r));
    toast.success("Entrada verificada!");
  };

  const handleVerifyGarbage = (id: string) => {
    setGarbageRecords(garbageRecords.map(r => r.id === id ? { ...r, verified: true } : r));
    toast.success("Entrada verificada!");
  };

  const handleExport = (type: string) => {
    try {
      const csvContent = type === 'Oil Record Book' 
        ? oilRecords.map(r => `${r.date},${r.operationType},${r.quantity},${r.unit},${r.verified}`).join('\n')
        : garbageRecords.map(r => `${r.date},${r.category},${r.estimatedQuantity},${r.disposalMethod},${r.verified}`).join('\n');
      const header = type === 'Oil Record Book' 
        ? 'Date,Operation,Volume,Unit,Verified\n' 
        : 'Date,WasteType,Quantity,DisposalMethod,Verified\n';
      const blob = new Blob([header + csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} exportado com sucesso`);
    } catch {
      toast.error(`Erro ao exportar ${type}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Record Books - MARPOL
          </h2>
          <p className="text-sm text-muted-foreground">
            Oil Record Book (Parte I) e Garbage Record Book conforme IMO
          </p>
        </div>
        <Select value={selectedVessel} onValueChange={setSelectedVessel}>
          <SelectTrigger className="w-56">
            <Ship className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PSV Atlantic Explorer">PSV Atlantic Explorer</SelectItem>
            <SelectItem value="AHTS Pacific Star">AHTS Pacific Star</SelectItem>
            <SelectItem value="OSV Caribbean Wind">OSV Caribbean Wind</SelectItem>
            <SelectItem value="PSV Gulf Stream">PSV Gulf Stream</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="oil" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="oil" className="gap-2">
            <Fuel className="h-4 w-4" />
            Oil Record Book
          </TabsTrigger>
          <TabsTrigger value="garbage" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Garbage Record Book
          </TabsTrigger>
        </TabsList>

        {/* Oil Record Book */}
        <TabsContent value="oil" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-amber-500" />
                  Oil Record Book - Parte I
                </CardTitle>
                <CardDescription>
                  Operações com combustível e águas oleosas conforme MARPOL Anexo I
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("Oil Record Book")}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar PDF
                </Button>
                <Dialog open={isOilDialogOpen} onOpenChange={setIsOilDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Nova Entrada
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Nova Entrada - Oil Record Book</DialogTitle>
                      <DialogDescription>
                        Registre uma operação conforme MARPOL Anexo I
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Data</Label>
                          <Input
                            type="date"
                            value={newOilRecord.date}
                            onChange={(e) => setNewOilRecord({ ...newOilRecord, date: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Oficial Responsável</Label>
                          <Input
                            value={newOilRecord.officerName}
                            onChange={(e) => setNewOilRecord({ ...newOilRecord, officerName: e.target.value })}
                            placeholder="Nome do oficial"
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Tipo de Operação</Label>
                        <Select 
                          value={newOilRecord.operationType} 
                          onValueChange={(v) => setNewOilRecord({ ...newOilRecord, operationType: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a operação" />
                          </SelectTrigger>
                          <SelectContent>
                            {oilOperationTypes.map(op => (
                              <SelectItem key={op.code} value={op.code}>
                                {op.code} - {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label>Tanque/Equipamento</Label>
                          <Input
                            value={newOilRecord.tankInvolved}
                            onChange={(e) => setNewOilRecord({ ...newOilRecord, tankInvolved: e.target.value })}
                            placeholder="Ex: Porão #1"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newOilRecord.quantity}
                            onChange={(e) => setNewOilRecord({ ...newOilRecord, quantity: Number(e.target.value) })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Unidade</Label>
                          <Select 
                            value={newOilRecord.unit} 
                            onValueChange={(v) => setNewOilRecord({ ...newOilRecord, unit: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="m³">m³</SelectItem>
                              <SelectItem value="L">L</SelectItem>
                              <SelectItem value="ton">ton</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Latitude</Label>
                          <Input
                            value={newOilRecord.position?.lat}
                            onChange={(e) => setNewOilRecord({ 
                              ...newOilRecord, 
                              position: { ...newOilRecord.position!, lat: e.target.value } 
                            })}
                            placeholder="Ex: 22°56'S ou Porto"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Longitude</Label>
                          <Input
                            value={newOilRecord.position?.lon}
                            onChange={(e) => setNewOilRecord({ 
                              ...newOilRecord, 
                              position: { ...newOilRecord.position!, lon: e.target.value } 
                            })}
                            placeholder="Ex: 040°12'W"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Observações</Label>
                        <Textarea
                          value={newOilRecord.remarks}
                          onChange={(e) => setNewOilRecord({ ...newOilRecord, remarks: e.target.value })}
                          placeholder="Detalhes da operação..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsOilDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddOilRecord}>Registrar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Operação</TableHead>
                    <TableHead>Tanque</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Oficial</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {oilRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.operationType}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {oilOperationTypes.find(o => o.code === record.operationType)?.label}
                        </p>
                      </TableCell>
                      <TableCell>{record.tankInvolved}</TableCell>
                      <TableCell>{record.quantity} {record.unit}</TableCell>
                      <TableCell className="text-sm">
                        {record.position.lat}<br />
                        {record.position.lon}
                      </TableCell>
                      <TableCell>{record.officerName}</TableCell>
                      <TableCell>
                        {record.verified ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge variant="outline">
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
                          {!record.verified && (
                            <Button variant="ghost" size="sm" onClick={() => handleVerifyOil(record.id)}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Garbage Record Book */}
        <TabsContent value="garbage" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-green-500" />
                  Garbage Record Book
                </CardTitle>
                <CardDescription>
                  Registro de descarte de resíduos conforme MARPOL Anexo V
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("Garbage Record Book")}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar PDF
                </Button>
                <Button size="sm" onClick={() => setIsGarbageDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Entrada
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Oficial</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {garbageRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{record.category}</Badge>
                      </TableCell>
                      <TableCell>{record.estimatedQuantity} {record.unit}</TableCell>
                      <TableCell className="text-sm">{record.disposalMethod}</TableCell>
                      <TableCell className="text-sm">
                        {record.startPosition.lat}, {record.startPosition.lon}
                      </TableCell>
                      <TableCell>{record.officerName}</TableCell>
                      <TableCell>
                        {record.verified ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge variant="outline">
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
                          {!record.verified && (
                            <Button variant="ghost" size="sm" onClick={() => handleVerifyGarbage(record.id)}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Summary */}
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Status de Conformidade - Record Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm">Oil Record Book</span>
                <Badge className="bg-green-600">Atualizado</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Última entrada: {oilRecords[0]?.date || "-"}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm">Garbage Record Book</span>
                <Badge className="bg-green-600">Atualizado</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Última entrada: {garbageRecords[0]?.date || "-"}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm">Próxima Auditoria</span>
                <Badge variant="secondary">15/02/2024</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Auditoria MARPOL programada
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
