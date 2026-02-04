/**
 * Carbon Tracking Panel - Rastreamento de Emissões de Carbono
 * Monitoramento detalhado de emissões por embarcação, viagem e combustível
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Factory,
  Ship,
  Fuel,
  Gauge,
  TrendingDown,
  TrendingUp,
  Calculator,
  FileText,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Anchor,
  Navigation,
  Waves,
  Wind,
  Thermometer,
  BarChart3,
  PieChart,
  Activity,
  Target,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCcw,
  Eye
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell
} from "recharts";

// Mock emission records
const emissionRecords = [
  {
    id: "EM001",
    vessel: "MV Atlantic Explorer",
    voyage: "VOY-2026-0142",
    route: "Rio de Janeiro → Macaé",
    period: "01/06 - 03/06/2026",
    fuelType: "LSFO",
    fuelConsumed: 45.2,
    co2: 142.5,
    ch4: 0.8,
    n2o: 0.02,
    distance: 180,
    cargo: 5200,
    eeoi: 8.52,
    cii: "B",
    verified: true
  },
  {
    id: "EM002",
    vessel: "MV Pacific Pioneer",
    voyage: "VOY-2026-0143",
    route: "Santos → Paranaguá",
    period: "02/06 - 04/06/2026",
    fuelType: "LNG",
    fuelConsumed: 38.5,
    co2: 98.4,
    ch4: 2.1,
    n2o: 0.01,
    distance: 220,
    cargo: 4800,
    eeoi: 6.25,
    cii: "A",
    verified: true
  },
  {
    id: "EM003",
    vessel: "MV Gulf Voyager",
    voyage: "VOY-2026-0144",
    route: "Vitória → Rio de Janeiro",
    period: "03/06 - 05/06/2026",
    fuelType: "HFO",
    fuelConsumed: 62.8,
    co2: 195.2,
    ch4: 0.6,
    n2o: 0.03,
    distance: 280,
    cargo: 6100,
    eeoi: 12.85,
    cii: "C",
    verified: false
  }
];

const fuelEmissionFactors = [
  { fuel: "HFO (Heavy Fuel Oil)", factor: 3.114, sulfur: "3.50%", tier: "Tier II" },
  { fuel: "LSFO (Low Sulfur FO)", factor: 3.151, sulfur: "0.50%", tier: "Tier II" },
  { fuel: "MGO (Marine Gas Oil)", factor: 3.206, sulfur: "0.10%", tier: "Tier II" },
  { fuel: "LNG (Liquefied Natural Gas)", factor: 2.750, sulfur: "0.00%", tier: "Tier III" },
  { fuel: "Methanol", factor: 1.375, sulfur: "0.00%", tier: "Tier III" },
  { fuel: "Biofuel (FAME)", factor: 0.000, sulfur: "0.00%", tier: "Tier III" }
];

const monthlyEmissions = [
  { month: "Jan", scope1: 3800, scope2: 300, scope3: 100 },
  { month: "Fev", scope1: 3550, scope2: 280, scope3: 120 },
  { month: "Mar", scope1: 3700, scope2: 290, scope3: 110 },
  { month: "Abr", scope1: 3420, scope2: 270, scope3: 110 },
  { month: "Mai", scope1: 3285, scope2: 260, scope3: 105 },
  { month: "Jun", scope1: 3150, scope2: 250, scope3: 100 }
];

const emissionsBySource = [
  { name: "Main Engine", value: 78, color: "#3b82f6" },
  { name: "Auxiliary Engine", value: 12, color: "#22c55e" },
  { name: "Boilers", value: 6, color: "#f59e0b" },
  { name: "Incinerator", value: 2, color: "#ef4444" },
  { name: "Other", value: 2, color: "#6b7280" }
];

export const CarbonTrackingPanel: React.FC = () => {
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const formatNumber = (num: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(num);

  const getCIIBadge = (rating: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500",
      B: "bg-lime-500",
      C: "bg-yellow-500",
      D: "bg-orange-500",
      E: "bg-red-500"
    };
    return <Badge className={`${colors[rating]} text-white`}>{rating}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por embarcação, viagem..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar Dados
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={showNewRecord} onOpenChange={setShowNewRecord}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Emissões de Viagem</DialogTitle>
                <DialogDescription>
                  Adicione dados de consumo de combustível e emissões para uma viagem
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Embarcação</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atlantic">MV Atlantic Explorer</SelectItem>
                      <SelectItem value="pacific">MV Pacific Pioneer</SelectItem>
                      <SelectItem value="gulf">MV Gulf Voyager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Viagem</Label>
                  <Input placeholder="VOY-2026-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Período Início</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Período Fim</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Combustível</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hfo">HFO</SelectItem>
                      <SelectItem value="lsfo">LSFO</SelectItem>
                      <SelectItem value="mgo">MGO</SelectItem>
                      <SelectItem value="lng">LNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Consumo (ton)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Distância (nm)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Carga Transportada (ton)</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewRecord(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowNewRecord(false)}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular e Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total CO₂ (Junho)</p>
                <p className="text-2xl font-bold">3,500 ton</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span>-4.2% vs Maio</span>
                </div>
              </div>
              <Factory className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Combustível Total</p>
                <p className="text-2xl font-bold">1,125 ton</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span>-2.8% eficiência</span>
                </div>
              </div>
              <Fuel className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">EEOI Médio</p>
                <p className="text-2xl font-bold">9.21</p>
                <p className="text-xs text-muted-foreground">gCO₂/ton-nm</p>
              </div>
              <Gauge className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viagens Registradas</p>
                <p className="text-2xl font-bold">47</p>
                <p className="text-xs text-muted-foreground">42 verificadas</p>
              </div>
              <Navigation className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="factors" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Fatores de Emissão
          </TabsTrigger>
          <TabsTrigger value="methodology" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Metodologia
          </TabsTrigger>
        </TabsList>

        {/* Records Tab */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Emissões por Viagem</CardTitle>
              <CardDescription>Dados detalhados de consumo e emissões</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Embarcação</TableHead>
                    <TableHead>Viagem / Rota</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Combustível</TableHead>
                    <TableHead className="text-right">Consumo</TableHead>
                    <TableHead className="text-right">CO₂ (ton)</TableHead>
                    <TableHead className="text-right">EEOI</TableHead>
                    <TableHead className="text-center">CII</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emissionRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{record.vessel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.voyage}</p>
                          <p className="text-sm text-muted-foreground">{record.route}</p>
                        </div>
                      </TableCell>
                      <TableCell>{record.period}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.fuelType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(record.fuelConsumed)} ton</TableCell>
                      <TableCell className="text-right font-medium">{formatNumber(record.co2)}</TableCell>
                      <TableCell className="text-right">{formatNumber(record.eeoi)}</TableCell>
                      <TableCell className="text-center">{getCIIBadge(record.cii)}</TableCell>
                      <TableCell className="text-center">
                        {record.verified ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Emissões por Escopo (GHG Protocol)</CardTitle>
                <CardDescription>Distribuição mensal Scope 1, 2 e 3</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyEmissions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(v) => `${formatNumber(Number(v))} ton`} />
                    <Legend />
                    <Bar dataKey="scope1" stackId="a" fill="#3b82f6" name="Scope 1" />
                    <Bar dataKey="scope2" stackId="a" fill="#22c55e" name="Scope 2" />
                    <Bar dataKey="scope3" stackId="a" fill="#f59e0b" name="Scope 3" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emissões por Fonte</CardTitle>
                <CardDescription>Distribuição por equipamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={emissionsBySource}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {emissionsBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emission Factors Tab */}
        <TabsContent value="factors">
          <Card>
            <CardHeader>
              <CardTitle>Fatores de Emissão por Combustível</CardTitle>
              <CardDescription>Conforme IMO Guidelines e IPCC</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Combustível</TableHead>
                    <TableHead className="text-right">Fator CO₂ (kg CO₂/kg fuel)</TableHead>
                    <TableHead className="text-center">Teor de Enxofre</TableHead>
                    <TableHead className="text-center">NOx Tier</TableHead>
                    <TableHead className="text-center">ECA Compliant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelEmissionFactors.map((fuel) => (
                    <TableRow key={fuel.fuel}>
                      <TableCell className="font-medium">{fuel.fuel}</TableCell>
                      <TableCell className="text-right">{fuel.factor}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={parseFloat(fuel.sulfur) <= 0.5 ? "default" : "secondary"}>
                          {fuel.sulfur}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{fuel.tier}</TableCell>
                      <TableCell className="text-center">
                        {parseFloat(fuel.sulfur) <= 0.1 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Methodology Tab */}
        <TabsContent value="methodology">
          <Card>
            <CardHeader>
              <CardTitle>Metodologia de Cálculo</CardTitle>
              <CardDescription>Padrões e frameworks utilizados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-500">IMO DCS</Badge>
                      <span className="font-medium">IMO Data Collection System</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Coleta de dados de consumo de combustível conforme MEPC.278(70) para navios acima de 5.000 GT.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-500">EU MRV</Badge>
                      <span className="font-medium">EU Monitoring, Reporting & Verification</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Regulamento (UE) 2015/757 para monitoramento de emissões em viagens de/para portos europeus.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-500">GHG Protocol</Badge>
                      <span className="font-medium">Corporate Standard</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Classificação de emissões em Scope 1 (diretas), Scope 2 (energia) e Scope 3 (cadeia de valor).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-500">CII Rating</Badge>
                      <span className="font-medium">Carbon Intensity Indicator</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      MEPC.339(76) - Rating A-E baseado em AER (gCO₂/DWT-nm) com redução progressiva até 2030.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Fórmulas de Cálculo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
                    <p className="text-muted-foreground mb-1">// CO₂ Emissions</p>
                    <p>CO₂ = Σ (FCj × CFj)</p>
                    <p className="text-xs text-muted-foreground mt-2">FC = Fuel Consumption, CF = Carbon Factor</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
                    <p className="text-muted-foreground mb-1">// EEOI</p>
                    <p>EEOI = CO₂ / (Cargo × Distance)</p>
                    <p className="text-xs text-muted-foreground mt-2">gCO₂ / (ton × nm)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarbonTrackingPanel;
