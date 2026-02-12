/**
 * VESSEL CONTRACTS INTELLIGENCE
 * Calculadora BIMCO, termos contratuais com alertas de vencimento
 * Benchmark: Veson IMOS, Q88, Shipnet
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  FileText, Scale, Clock, DollarSign, AlertTriangle, CheckCircle2,
  Calculator, Calendar as CalendarIcon, Ship, Anchor, TrendingUp,
  Brain, Sparkles, Target, ArrowRight, Download, Plus, Search,
  Filter, Bell, RefreshCw, BarChart3, PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interfaces
interface CharterParty {
  id: string;
  contractNumber: string;
  type: "time_charter" | "voyage_charter" | "bareboat" | "coa";
  vesselName: string;
  charterer: string;
  owner: string;
  commencementDate: Date;
  expiryDate: Date;
  status: "active" | "expiring" | "expired" | "pending" | "terminated";
  dailyRate?: number;
  freightRate?: number;
  currency: string;
  clauses: string[];
  laytimeAllowed?: number; // hours
  demurrageRate?: number;
  despatchRate?: number;
  options: {
    type: "extension" | "purchase" | "termination";
    deadline: Date;
    exercised: boolean;
  }[];
}

interface LaytimeCalculation {
  id: string;
  voyageRef: string;
  port: string;
  operation: "loading" | "discharging";
  laytimeAllowed: number; // hours
  laytimeUsed: number;
  demurrageHours?: number;
  despatchHours?: number;
  demurrageAmount?: number;
  despatchAmount?: number;
  status: "in_progress" | "completed" | "disputed";
  statementOfFacts: {
    event: string;
    startTime: Date;
    endTime: Date;
    laytimeCounts: boolean;
    remarks?: string;
  }[];
}

// BIMCO Standard Terms
const bimcoTerms = [
  { code: "BALTIME", name: "BALTIME 1939/2001", type: "Time Charter" },
  { code: "GENCON", name: "GENCON 1994/2022", type: "Voyage Charter" },
  { code: "NYPE", name: "NYPE 2015", type: "Time Charter" },
  { code: "SHELLTIME", name: "SHELLTIME 4", type: "Time Charter" },
  { code: "ASBATANKVOY", name: "ASBATANKVOY", type: "Tanker Voyage" },
  { code: "BARECON", name: "BARECON 2017", type: "Bareboat" },
];

// Status configs
const statusConfig = {
  active: { label: "Ativo", color: "bg-success/20 text-success" },
  expiring: { label: "Expirando", color: "bg-warning/20 text-warning" },
  expired: { label: "Expirado", color: "bg-destructive/20 text-destructive" },
  pending: { label: "Pendente", color: "bg-muted text-muted-foreground" },
  terminated: { label: "Encerrado", color: "bg-muted text-muted-foreground" },
};

const typeConfig = {
  time_charter: { label: "Time Charter", icon: Clock },
  voyage_charter: { label: "Voyage Charter", icon: Ship },
  bareboat: { label: "Bareboat", icon: Anchor },
  coa: { label: "COA", icon: FileText },
};

// Fallback data
const fallbackContracts: CharterParty[] = [
  {
    id: "1",
    contractNumber: "TC-2025-0042",
    type: "time_charter",
    vesselName: "MV Nautilus Star",
    charterer: "Global Shipping Corp",
    owner: "Nautilus Maritime Ltd",
    commencementDate: new Date(2025, 0, 15),
    expiryDate: new Date(2026, 6, 14),
    status: "active",
    dailyRate: 18500,
    currency: "USD",
    clauses: ["BIMCO Sanctions Clause", "BIMCO Bunker Clause", "War Risks"],
    options: [
      { type: "extension", deadline: new Date(2026, 4, 14), exercised: false },
    ],
  },
  {
    id: "2",
    contractNumber: "VC-2026-0018",
    type: "voyage_charter",
    vesselName: "MV Atlantic Explorer",
    charterer: "Petrobras S.A.",
    owner: "Ocean Transport Inc",
    commencementDate: new Date(2026, 1, 1),
    expiryDate: new Date(2026, 2, 15),
    status: "expiring",
    freightRate: 45.50,
    currency: "USD",
    clauses: ["GENCON 2022", "BIMCO Emissions Trading Scheme Clause"],
    laytimeAllowed: 96,
    demurrageRate: 35000,
    despatchRate: 17500,
    options: [],
  },
  {
    id: "3",
    contractNumber: "BB-2024-0008",
    type: "bareboat",
    vesselName: "MV Pacific Pioneer",
    charterer: "Pacific Bulk Carriers",
    owner: "Maritime Leasing Corp",
    commencementDate: new Date(2024, 5, 1),
    expiryDate: new Date(2029, 4, 31),
    status: "active",
    dailyRate: 12000,
    currency: "USD",
    clauses: ["BARECON 2017", "Purchase Option Clause"],
    options: [
      { type: "purchase", deadline: new Date(2027, 4, 31), exercised: false },
      { type: "extension", deadline: new Date(2029, 2, 31), exercised: false },
    ],
  },
];

const fallbackLaytime: LaytimeCalculation[] = [
  {
    id: "1",
    voyageRef: "VOY-2026-0042",
    port: "Santos",
    operation: "loading",
    laytimeAllowed: 72,
    laytimeUsed: 84,
    demurrageHours: 12,
    demurrageAmount: 17500,
    status: "completed",
    statementOfFacts: [
      { event: "NOR Tendered", startTime: new Date(2026, 1, 1, 8, 0), endTime: new Date(2026, 1, 1, 8, 0), laytimeCounts: false },
      { event: "Berthed", startTime: new Date(2026, 1, 1, 14, 0), endTime: new Date(2026, 1, 1, 14, 0), laytimeCounts: false },
      { event: "Commenced Loading", startTime: new Date(2026, 1, 1, 16, 0), endTime: new Date(2026, 1, 4, 4, 0), laytimeCounts: true },
      { event: "Rain Stoppage", startTime: new Date(2026, 1, 2, 10, 0), endTime: new Date(2026, 1, 2, 18, 0), laytimeCounts: false, remarks: "Heavy rain" },
      { event: "Completed Loading", startTime: new Date(2026, 1, 4, 4, 0), endTime: new Date(2026, 1, 4, 4, 0), laytimeCounts: true },
    ],
  },
];

export function VesselContractsIntelligence() {
  const [activeTab, setActiveTab] = useState("contracts");
  const [selectedContract, setSelectedContract] = useState<CharterParty | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Laytime Calculator State
  const [laytimeCalc, setLaytimeCalc] = useState({
    laytimeAllowed: 72,
    laytimeUsed: 0,
    demurrageRate: 35000,
    despatchRate: 17500,
  });

  const laytimeResult = useMemo(() => {
    const diff = laytimeCalc.laytimeUsed - laytimeCalc.laytimeAllowed;
    if (diff > 0) {
      return {
        type: "demurrage" as const,
        hours: diff,
        amount: (diff / 24) * laytimeCalc.demurrageRate,
      };
    } else if (diff < 0) {
      return {
        type: "despatch" as const,
        hours: Math.abs(diff),
        amount: (Math.abs(diff) / 24) * laytimeCalc.despatchRate,
      };
    }
    return { type: "even" as const, hours: 0, amount: 0 };
  }, [laytimeCalc]);

  // KPIs
  const kpis = useMemo(() => {
    const expiringIn30Days = fallbackContracts.filter(c => {
      const daysToExpiry = differenceInDays(c.expiryDate, new Date());
      return daysToExpiry > 0 && daysToExpiry <= 30;
    }).length;

    const optionsToExercise = fallbackContracts.flatMap(c => c.options).filter(o => {
      const daysToDeadline = differenceInDays(o.deadline, new Date());
      return !o.exercised && daysToDeadline > 0 && daysToDeadline <= 60;
    }).length;

    const totalDailyRevenue = fallbackContracts
      .filter(c => c.status === "active" && c.dailyRate)
      .reduce((acc, c) => acc + (c.dailyRate || 0), 0);

    return {
      activeContracts: fallbackContracts.filter(c => c.status === "active").length,
      expiringIn30Days,
      optionsToExercise,
      totalDailyRevenue,
      pendingDemurrage: fallbackLaytime.reduce((acc, l) => acc + (l.demurrageAmount || 0), 0),
    };
  }, []);

  const filteredContracts = fallbackContracts.filter(c =>
    c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.charterer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Vessel Contracts Intelligence
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              BIMCO Standard
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Charter Party, Laytime/Demurrage e gestão contratual
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary opacity-70" />
              <div>
                <p className="text-2xl font-bold">{kpis.activeContracts}</p>
                <p className="text-xs text-muted-foreground">Contratos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(kpis.expiringIn30Days > 0 && "border-warning/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn("h-8 w-8 opacity-70", kpis.expiringIn30Days > 0 ? "text-warning" : "text-muted-foreground")} />
              <div>
                <p className="text-2xl font-bold">{kpis.expiringIn30Days}</p>
                <p className="text-xs text-muted-foreground">Expirando 30d</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(kpis.optionsToExercise > 0 && "border-primary/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className={cn("h-8 w-8 opacity-70", kpis.optionsToExercise > 0 ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="text-2xl font-bold">{kpis.optionsToExercise}</p>
                <p className="text-xs text-muted-foreground">Opções Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-success opacity-70" />
              <div>
                <p className="text-2xl font-bold">${(kpis.totalDailyRevenue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Receita/Dia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(kpis.pendingDemurrage > 0 && "border-destructive/50")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className={cn("h-8 w-8 opacity-70", kpis.pendingDemurrage > 0 ? "text-destructive" : "text-muted-foreground")} />
              <div>
                <p className="text-2xl font-bold">${(kpis.pendingDemurrage / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Demurrage Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="contracts" className="gap-2">
              <FileText className="h-4 w-4" />
              Contratos
            </TabsTrigger>
            <TabsTrigger value="laytime" className="gap-2">
              <Clock className="h-4 w-4" />
              Laytime/Demurrage
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculadora BIMCO
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contrato, navio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          {filteredContracts.map((contract) => {
            const daysToExpiry = differenceInDays(contract.expiryDate, new Date());
            const TypeIcon = typeConfig[contract.type].icon;
            
            return (
              <Card 
                key={contract.id}
                className={cn(
                  "hover:shadow-md transition-all cursor-pointer",
                  daysToExpiry <= 30 && daysToExpiry > 0 && "border-warning/50",
                  daysToExpiry <= 0 && "border-destructive/50 opacity-75"
                )}
                onClick={() => setSelectedContract(contract)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {contract.contractNumber}
                        </Badge>
                        <Badge className="gap-1">
                          <TypeIcon className="h-3 w-3" />
                          {typeConfig[contract.type].label}
                        </Badge>
                        <Badge className={statusConfig[contract.status].color}>
                          {statusConfig[contract.status].label}
                        </Badge>
                        {daysToExpiry <= 30 && daysToExpiry > 0 && (
                          <Badge className="bg-warning/20 text-warning">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expira em {daysToExpiry} dias
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Ship className="h-5 w-5 text-primary" />
                        {contract.vesselName}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Afretador</p>
                          <p className="font-medium">{contract.charterer}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Armador</p>
                          <p className="font-medium">{contract.owner}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Início</p>
                          <p className="font-medium">{format(contract.commencementDate, "dd/MM/yyyy")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Término</p>
                          <p className="font-medium">{format(contract.expiryDate, "dd/MM/yyyy")}</p>
                        </div>
                      </div>

                      {/* Clauses */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {contract.clauses.map((clause) => (
                          <Badge key={clause} variant="outline" className="text-xs">
                            {clause}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      {contract.dailyRate && (
                        <div>
                          <p className="text-2xl font-bold">${contract.dailyRate.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">/ dia</p>
                        </div>
                      )}
                      {contract.freightRate && (
                        <div>
                          <p className="text-2xl font-bold">${contract.freightRate}</p>
                          <p className="text-sm text-muted-foreground">/ MT</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options alerts */}
                  {contract.options.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Opções Contratuais:</p>
                      <div className="flex flex-wrap gap-2">
                        {contract.options.map((option, idx) => {
                          const daysToDeadline = differenceInDays(option.deadline, new Date());
                          return (
                            <Badge 
                              key={`${option.type}-${option.deadline}`}
                              className={cn(
                                option.exercised ? "bg-muted" :
                                daysToDeadline <= 30 ? "bg-warning/20 text-warning" :
                                "bg-primary/20 text-primary"
                              )}
                            >
                              {option.type === "extension" && "Extensão"}
                              {option.type === "purchase" && "Compra"}
                              {option.type === "termination" && "Rescisão"}
                              {" - "}
                              {format(option.deadline, "dd/MM/yyyy")}
                              {option.exercised && " (Exercida)"}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Laytime Tab */}
        <TabsContent value="laytime" className="space-y-4">
          {fallbackLaytime.map((laytime) => (
            <Card key={laytime.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{laytime.voyageRef} - {laytime.port}</CardTitle>
                    <CardDescription>Operação: {laytime.operation === "loading" ? "Carregamento" : "Descarga"}</CardDescription>
                  </div>
                  <Badge className={cn(
                    laytime.demurrageHours ? "bg-destructive/20 text-destructive" :
                    laytime.despatchHours ? "bg-success/20 text-success" :
                    "bg-muted"
                  )}>
                    {laytime.demurrageHours && `Demurrage: ${laytime.demurrageHours}h`}
                    {laytime.despatchHours && `Despatch: ${laytime.despatchHours}h`}
                    {!laytime.demurrageHours && !laytime.despatchHours && "Even"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Laytime Permitido</p>
                    <p className="text-xl font-bold">{laytime.laytimeAllowed}h</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Laytime Usado</p>
                    <p className="text-xl font-bold">{laytime.laytimeUsed}h</p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg",
                    laytime.demurrageAmount ? "bg-destructive/10" : "bg-muted/50"
                  )}>
                    <p className="text-sm text-muted-foreground">Demurrage</p>
                    <p className="text-xl font-bold">${laytime.demurrageAmount?.toLocaleString() || 0}</p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg",
                    laytime.despatchHours ? "bg-success/10" : "bg-muted/50"
                  )}>
                    <p className="text-sm text-muted-foreground">Despatch</p>
                    <p className="text-xl font-bold">${(laytime.despatchHours || 0) * 17500 / 24}</p>
                  </div>
                </div>

                {/* Statement of Facts */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 font-medium text-sm">
                    Statement of Facts
                  </div>
                  <ScrollArea className="h-48">
                    <div className="divide-y">
                      {laytime.statementOfFacts.map((sof, idx) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-2 text-sm">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              sof.laytimeCounts ? "bg-primary" : "bg-muted"
                            )} />
                            <span className="font-medium">{sof.event}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {format(sof.startTime, "dd/MM HH:mm")}
                            {sof.remarks && <span className="ml-2 text-xs">({sof.remarks})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculadora Laytime/Demurrage
                </CardTitle>
                <CardDescription>
                  Conforme termos BIMCO padrão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Laytime Permitido (horas)</Label>
                    <Input
                      type="number"
                      value={laytimeCalc.laytimeAllowed}
                      onChange={(e) => setLaytimeCalc(prev => ({ ...prev, laytimeAllowed: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Laytime Usado (horas)</Label>
                    <Input
                      type="number"
                      value={laytimeCalc.laytimeUsed}
                      onChange={(e) => setLaytimeCalc(prev => ({ ...prev, laytimeUsed: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxa Demurrage (USD/dia)</Label>
                    <Input
                      type="number"
                      value={laytimeCalc.demurrageRate}
                      onChange={(e) => setLaytimeCalc(prev => ({ ...prev, demurrageRate: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxa Despatch (USD/dia)</Label>
                    <Input
                      type="number"
                      value={laytimeCalc.despatchRate}
                      onChange={(e) => setLaytimeCalc(prev => ({ ...prev, despatchRate: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Result */}
                <div className={cn(
                  "p-6 rounded-lg text-center",
                  laytimeResult.type === "demurrage" && "bg-destructive/10 border border-destructive/20",
                  laytimeResult.type === "despatch" && "bg-success/10 border border-success/20",
                  laytimeResult.type === "even" && "bg-muted"
                )}>
                  <p className="text-lg font-medium mb-2">
                    {laytimeResult.type === "demurrage" && "Demurrage a Pagar"}
                    {laytimeResult.type === "despatch" && "Despatch a Receber"}
                    {laytimeResult.type === "even" && "Laytime Equalizado"}
                  </p>
                  <p className="text-4xl font-bold">
                    ${laytimeResult.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {laytimeResult.hours} horas {laytimeResult.type === "demurrage" ? "excedentes" : laytimeResult.type === "despatch" ? "economizadas" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Termos BIMCO
                </CardTitle>
                <CardDescription>
                  Formulários padrão reconhecidos internacionalmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bimcoTerms.map((term) => (
                    <div 
                      key={term.code}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-medium">{term.name}</p>
                        <p className="text-sm text-muted-foreground">{term.type}</p>
                      </div>
                      <Badge variant="outline">{term.code}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(typeConfig).map(([type, config]) => {
                    const count = fallbackContracts.filter(c => c.type === type).length;
                    const percentage = (count / fallbackContracts.length) * 100;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </span>
                          <span>{count} contratos</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal Projetada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fallbackContracts.filter(c => c.dailyRate && c.status === "active").map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-primary" />
                        <span className="font-medium">{contract.vesselName}</span>
                      </div>
                      <span className="font-bold">${((contract.dailyRate || 0) * 30).toLocaleString()}/mês</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t flex justify-between font-bold">
                    <span>Total Mensal</span>
                    <span>${(kpis.totalDailyRevenue * 30).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default VesselContractsIntelligence;
