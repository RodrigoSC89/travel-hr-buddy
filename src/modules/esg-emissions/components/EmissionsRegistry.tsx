/**
 * Registro Detalhado de Emissões - ESG Module
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
  Factory,
  Plus,
  Download,
  Search,
  Calendar,
  Ship,
  Fuel,
  TrendingDown,
  TrendingUp,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface EmissionRecord {
  id: string;
  date: string;
  vessel: string;
  fuelType: string;
  fuelConsumed: number;
  co2Emissions: number;
  soxEmissions: number;
  noxEmissions: number;
  pmEmissions: number;
  scope: "1" | "2" | "3";
  source: string;
  verified: boolean;
}

const emissionFactors = {
  hfo: { co2: 3.114, sox: 0.02, nox: 0.087, pm: 0.0015, name: "HFO (Heavy Fuel Oil)" },
  mgo: { co2: 3.206, sox: 0.001, nox: 0.087, pm: 0.0003, name: "MGO (Marine Gas Oil)" },
  vlsfo: { co2: 3.151, sox: 0.005, nox: 0.087, pm: 0.0008, name: "VLSFO (0.5% S)" },
  lng: { co2: 2.750, sox: 0.0, nox: 0.015, pm: 0.0001, name: "LNG (Gás Natural)" },
  methanol: { co2: 1.375, sox: 0.0, nox: 0.02, pm: 0.0001, name: "Metanol" },
};

const initialRecords: EmissionRecord[] = [
  { id: "1", date: "2024-01-14", vessel: "PSV Atlantic Explorer", fuelType: "mgo", fuelConsumed: 45, co2Emissions: 144.27, soxEmissions: 0.045, noxEmissions: 3.915, pmEmissions: 0.0135, scope: "1", source: "Operação", verified: true },
  { id: "2", date: "2024-01-13", vessel: "AHTS Pacific Star", fuelType: "vlsfo", fuelConsumed: 68, co2Emissions: 214.27, soxEmissions: 0.34, noxEmissions: 5.916, pmEmissions: 0.0544, scope: "1", source: "Operação", verified: true },
  { id: "3", date: "2024-01-12", vessel: "OSV Caribbean Wind", fuelType: "mgo", fuelConsumed: 32, co2Emissions: 102.59, soxEmissions: 0.032, noxEmissions: 2.784, pmEmissions: 0.0096, scope: "1", source: "Operação", verified: true },
  { id: "4", date: "2024-01-11", vessel: "PSV Gulf Stream", fuelType: "lng", fuelConsumed: 28, co2Emissions: 77.0, soxEmissions: 0.0, noxEmissions: 0.42, pmEmissions: 0.0028, scope: "1", source: "Operação", verified: false },
  { id: "5", date: "2024-01-10", vessel: "PSV Atlantic Explorer", fuelType: "mgo", fuelConsumed: 52, co2Emissions: 166.71, soxEmissions: 0.052, noxEmissions: 4.524, pmEmissions: 0.0156, scope: "1", source: "Operação", verified: true },
];

export function EmissionsRegistry() {
  const [records, setRecords] = useState<EmissionRecord[]>(initialRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVessel, setFilterVessel] = useState("all");
  const [filterFuel, setFilterFuel] = useState("all");

  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    vessel: "",
    fuelType: "",
    fuelConsumed: 0,
    scope: "1" as "1" | "2" | "3",
    source: "",
  });

  const calculateEmissions = (fuelType: string, quantity: number) => {
    const factors = emissionFactors[fuelType as keyof typeof emissionFactors];
    if (!factors) return { co2: 0, sox: 0, nox: 0, pm: 0 };
    return {
      co2: quantity * factors.co2,
      sox: quantity * factors.sox,
      nox: quantity * factors.nox,
      pm: quantity * factors.pm,
    };
  };

  const handleAddRecord = () => {
    const emissions = calculateEmissions(newRecord.fuelType, newRecord.fuelConsumed);
    const record: EmissionRecord = {
      id: Date.now().toString(),
      date: newRecord.date,
      vessel: newRecord.vessel,
      fuelType: newRecord.fuelType,
      fuelConsumed: newRecord.fuelConsumed,
      co2Emissions: Number(emissions.co2.toFixed(2)),
      soxEmissions: Number(emissions.sox.toFixed(3)),
      noxEmissions: Number(emissions.nox.toFixed(3)),
      pmEmissions: Number(emissions.pm.toFixed(4)),
      scope: newRecord.scope,
      source: newRecord.source,
      verified: false,
    };
    setRecords([record, ...records]);
    setIsDialogOpen(false);
    setNewRecord({
      date: new Date().toISOString().split("T")[0],
      vessel: "",
      fuelType: "",
      fuelConsumed: 0,
      scope: "1",
      source: "",
    });
    toast.success("Registro de emissão adicionado!");
  };

  const handleVerify = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, verified: true } : r));
    toast.success("Registro verificado!");
  };

  const filteredRecords = records.filter(record => {
    if (filterVessel !== "all" && record.vessel !== filterVessel) return false;
    if (filterFuel !== "all" && record.fuelType !== filterFuel) return false;
    if (searchTerm && !record.vessel.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const vessels = [...new Set(records.map(r => r.vessel))];
  const totalCO2 = records.reduce((sum, r) => sum + r.co2Emissions, 0);
  const totalSOx = records.reduce((sum, r) => sum + r.soxEmissions, 0);
  const totalNOx = records.reduce((sum, r) => sum + r.noxEmissions, 0);

  const previewEmissions = newRecord.fuelType && newRecord.fuelConsumed > 0 
    ? calculateEmissions(newRecord.fuelType, newRecord.fuelConsumed)
    : null;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Total (ton)</p>
                <p className="text-2xl font-bold">{totalCO2.toFixed(1)}</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> -8.2% vs mês anterior
                </p>
              </div>
              <Factory className="h-8 w-8 text-success opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SOx Total (ton)</p>
                <p className="text-2xl font-bold">{totalSOx.toFixed(2)}</p>
                <p className="text-xs text-info">Limite IMO: 0.5% S</p>
              </div>
              <Fuel className="h-8 w-8 text-info opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NOx Total (ton)</p>
                <p className="text-2xl font-bold">{totalNOx.toFixed(2)}</p>
                <p className="text-xs text-accent-foreground">Tier II Compliant</p>
              </div>
              <Factory className="h-8 w-8 text-accent-foreground opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registros</p>
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-xs text-warning">{records.filter(r => !r.verified).length} pendentes</p>
              </div>
              <Calendar className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emission Factors Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fatores de Emissão (kg/ton de combustível)
          </CardTitle>
          <CardDescription>Fatores GHG Protocol / IMO para cálculo automático</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(emissionFactors).map(([key, val]) => (
              <div key={key} className="p-3 border rounded-lg text-center">
                <p className="font-medium text-sm">{val.name}</p>
                <p className="text-xs text-muted-foreground mt-1">CO₂: {val.co2}</p>
                <p className="text-xs text-muted-foreground">SOx: {val.sox}</p>
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
              placeholder="Buscar embarcação..."
              className="pl-9 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={filterVessel} onValueChange={setFilterVessel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Embarcações</SelectItem>
              {vessels.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterFuel} onValueChange={setFilterFuel}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Combustível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(emissionFactors).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Consumo de Combustível</DialogTitle>
                <DialogDescription>
                  As emissões serão calculadas automaticamente com base nos fatores GHG Protocol.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                        {vessels.map(v => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Combustível</Label>
                    <Select 
                      value={newRecord.fuelType} 
                      onValueChange={(v) => setNewRecord({ ...newRecord, fuelType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(emissionFactors).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Quantidade (toneladas)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newRecord.fuelConsumed}
                      onChange={(e) => setNewRecord({ ...newRecord, fuelConsumed: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Escopo GHG</Label>
                    <Select 
                      value={newRecord.scope} 
                      onValueChange={(v: "1" | "2" | "3") => setNewRecord({ ...newRecord, scope: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Escopo 1 - Diretas</SelectItem>
                        <SelectItem value="2">Escopo 2 - Indiretas (Energia)</SelectItem>
                        <SelectItem value="3">Escopo 3 - Cadeia de Valor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Fonte</Label>
                    <Input
                      value={newRecord.source}
                      onChange={(e) => setNewRecord({ ...newRecord, source: e.target.value })}
                      placeholder="Ex: Operação, Porto"
                    />
                  </div>
                </div>

                {/* Preview de Emissões Calculadas */}
                {previewEmissions && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium mb-2">Emissões Calculadas (preview):</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-success">{previewEmissions.co2.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">ton CO₂</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-info">{previewEmissions.sox.toFixed(3)}</p>
                          <p className="text-xs text-muted-foreground">ton SOx</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-accent-foreground">{previewEmissions.nox.toFixed(3)}</p>
                          <p className="text-xs text-muted-foreground">ton NOx</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-warning">{previewEmissions.pm.toFixed(4)}</p>
                          <p className="text-xs text-muted-foreground">ton PM</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddRecord} disabled={!newRecord.vessel || !newRecord.fuelType || newRecord.fuelConsumed <= 0}>
                  Registrar
                </Button>
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
                <TableHead>Embarcação</TableHead>
                <TableHead>Combustível</TableHead>
                <TableHead>Consumo</TableHead>
                <TableHead>CO₂ (ton)</TableHead>
                <TableHead>SOx (ton)</TableHead>
                <TableHead>NOx (ton)</TableHead>
                <TableHead>Escopo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      {record.vessel}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {emissionFactors[record.fuelType as keyof typeof emissionFactors]?.name || record.fuelType}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.fuelConsumed} ton</TableCell>
                  <TableCell className="font-medium text-success">{record.co2Emissions}</TableCell>
                  <TableCell>{record.soxEmissions}</TableCell>
                  <TableCell>{record.noxEmissions}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Escopo {record.scope}</Badge>
                  </TableCell>
                  <TableCell>
                    {record.verified ? (
                      <Badge className="bg-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!record.verified && (
                      <Button variant="ghost" size="sm" onClick={() => handleVerify(record.id)}>
                        <CheckCircle className="h-4 w-4 text-success" />
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
