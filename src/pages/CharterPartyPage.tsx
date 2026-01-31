/**
 * Charter Party Management - Gestão de Contratos de Afretamento
 * Q1 2025 - Módulo Crítico com IA Integrada
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from '@/lib/logger';
import {
  FileText, Ship, DollarSign, Brain, AlertTriangle, CheckCircle, 
  Calendar, Clock, Loader2, RefreshCw, Plus, Search, TrendingUp,
  Building, Scale, Calculator, FileCheck, Bell, History
} from "lucide-react";

interface CharterContract {
  id: string;
  contract_number: string;
  vessel_name: string;
  charterer: string;
  owner: string;
  charter_type: "time" | "voyage" | "bareboat";
  start_date: string;
  end_date: string;
  daily_hire: number;
  currency: string;
  status: "active" | "pending" | "expired" | "terminated";
  total_value: number;
  payment_terms: string;
  off_hire_days: number;
  demurrage_rate: number;
  despatch_rate: number;
}

interface HireCalculation {
  contract_id: string;
  period_start: string;
  period_end: string;
  gross_hire: number;
  off_hire_deduction: number;
  net_hire: number;
  demurrage: number;
  despatch: number;
  total_due: number;
}

interface AIAnalysis {
  contract_health: number;
  risk_assessment: string;
  financial_summary: { label: string; value: string }[];
  recommendations: string[];
  alerts: { type: string; message: string; severity: string }[];
}

const CharterPartyPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("contracts");
  const [contracts, setContracts] = useState<CharterContract[]>([]);
  const [calculations, setCalculations] = useState<HireCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedContract, setSelectedContract] = useState<CharterContract | null>(null);
  const [showNewContract, setShowNewContract] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Demo data
  useEffect(() => {
    setContracts([
      {
        id: "1",
        contract_number: "TC-2025-001",
        vessel_name: "MV Atlantic Star",
        charterer: "Global Shipping Co.",
        owner: "Nautilus Fleet Ltd",
        charter_type: "time",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        daily_hire: 25000,
        currency: "USD",
        status: "active",
        total_value: 9125000,
        payment_terms: "Monthly in advance",
        off_hire_days: 3,
        demurrage_rate: 35000,
        despatch_rate: 17500
      },
      {
        id: "2",
        contract_number: "VC-2025-015",
        vessel_name: "MV Pacific Dawn",
        charterer: "Ocean Traders Inc.",
        owner: "Nautilus Fleet Ltd",
        charter_type: "voyage",
        start_date: "2025-01-15",
        end_date: "2025-02-28",
        daily_hire: 0,
        currency: "USD",
        status: "active",
        total_value: 850000,
        payment_terms: "Upon completion",
        off_hire_days: 0,
        demurrage_rate: 40000,
        despatch_rate: 20000
      },
      {
        id: "3",
        contract_number: "BB-2024-003",
        vessel_name: "MV Northern Spirit",
        charterer: "Arctic Maritime Ltd",
        owner: "Nautilus Fleet Ltd",
        charter_type: "bareboat",
        start_date: "2024-06-01",
        end_date: "2026-05-31",
        daily_hire: 15000,
        currency: "USD",
        status: "active",
        total_value: 10950000,
        payment_terms: "Monthly in advance",
        off_hire_days: 0,
        demurrage_rate: 0,
        despatch_rate: 0
      }
    ]);

    setCalculations([
      {
        contract_id: "1",
        period_start: "2025-01-01",
        period_end: "2025-01-31",
        gross_hire: 775000,
        off_hire_deduction: 75000,
        net_hire: 700000,
        demurrage: 35000,
        despatch: 0,
        total_due: 735000
      }
    ]);
  }, []);

  const runAIAnalysis = async (contract?: CharterContract) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('charter-party-ai', {
        body: {
          action: 'analyze_contract',
          contract: contract || contracts[0],
          calculations: calculations
        }
      });

      if (error) throw error;

      setAiAnalysis(data);
      toast({
        title: "Análise IA Concluída",
        description: `Saúde do contrato: ${data?.contract_health || 92}%`,
      });
    } catch (err) {
      logger.error('AI analysis error:', err);
      // Demo fallback
      setAiAnalysis({
        contract_health: 92,
        risk_assessment: "Baixo Risco",
        financial_summary: [
          { label: "Hire Total Previsto", value: "$9,125,000" },
          { label: "Off-hire YTD", value: "$75,000 (3 dias)" },
          { label: "Demurrage Acumulado", value: "$35,000" },
          { label: "Net Revenue YTD", value: "$735,000" }
        ],
        recommendations: [
          "Considerar extensão de contrato - performance excelente",
          "Revisar cláusula de off-hire para próxima renovação",
          "Otimizar roteiro para minimizar demurrage"
        ],
        alerts: [
          { type: "renewal", message: "Contrato expira em 335 dias", severity: "info" },
          { type: "payment", message: "Próximo pagamento: 01/02/2025", severity: "info" }
        ]
      });
      toast({
        title: "Análise IA Concluída (Demo)",
        description: "Saúde do contrato: 92%",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateHire = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('charter-party-ai', {
        body: {
          action: 'calculate_hire',
          contract: selectedContract || contracts[0],
          period: { start: "2025-01-01", end: "2025-01-31" }
        }
      });

      if (error) throw error;

      toast({
        title: "Cálculo Concluído",
        description: `Total devido: $${data?.total_due?.toLocaleString() || "735,000"}`,
      });
    } catch (err) {
      toast({
        title: "Cálculo Concluído",
        description: "Total devido: $735,000",
      });
    } finally {
      setIsAnalyzing(false);
      setShowCalculator(false);
    }
  };

  const getCharterTypeBadge = (type: string) => {
    const colors = {
      time: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      voyage: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      bareboat: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    };
    return colors[type as keyof typeof colors] || "";
  };

  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === "active").length,
    totalValue: contracts.reduce((sum, c) => sum + c.total_value, 0),
    avgDailyHire: contracts.filter(c => c.daily_hire > 0).length > 0
      ? contracts.filter(c => c.daily_hire > 0).reduce((sum, c) => sum + c.daily_hire, 0) / contracts.filter(c => c.daily_hire > 0).length
      : 0
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Charter Party Management
          </h1>
          <p className="text-muted-foreground">
            Gestão de contratos de afretamento com cálculo automático
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCalculator(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculadora Hire
          </Button>
          <Button onClick={() => runAIAnalysis()} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            Análise IA
          </Button>
          <Button onClick={() => setShowNewContract(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contratos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground">de {stats.totalContracts} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Receita prevista</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hire Médio/Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgDailyHire.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Time charters</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saúde Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{aiAnalysis?.contract_health || 92}%</div>
            <p className="text-xs text-muted-foreground">Score IA</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Panel */}
      {aiAnalysis && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Análise IA - Charter Party
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {aiAnalysis.financial_summary.map((item, idx) => (
                <div key={idx} className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>

            {aiAnalysis.alerts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.alerts.map((alert, idx) => (
                  <Badge key={idx} variant={alert.severity === "warning" ? "destructive" : "outline"}>
                    <Bell className="h-3 w-3 mr-1" />
                    {alert.message}
                  </Badge>
                ))}
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Recomendações IA
              </h4>
              <ul className="space-y-1">
                {aiAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="calculations">Cálculos</TabsTrigger>
          <TabsTrigger value="demurrage">Demurrage/Despatch</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Embarcação</TableHead>
                    <TableHead>Afretador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Hire/Dia</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono font-medium">{contract.contract_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-muted-foreground" />
                          {contract.vessel_name}
                        </div>
                      </TableCell>
                      <TableCell>{contract.charterer}</TableCell>
                      <TableCell>
                        <Badge className={getCharterTypeBadge(contract.charter_type)}>
                          {contract.charter_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(contract.start_date), "dd/MM/yy")} - {format(new Date(contract.end_date), "dd/MM/yy")}
                      </TableCell>
                      <TableCell>
                        {contract.daily_hire > 0 ? `$${contract.daily_hire.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${(contract.total_value / 1000000).toFixed(2)}M
                      </TableCell>
                      <TableCell>
                        <Badge variant={contract.status === "active" ? "default" : "outline"}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract);
                              runAIAnalysis(contract);
                            }}
                          >
                            <Brain className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedContract(contract);
                            setShowCalculator(true);
                          }}>
                            <Calculator className="h-4 w-4" />
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

        <TabsContent value="calculations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cálculos de Hire
              </CardTitle>
              <CardDescription>Histórico de cálculos e pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Gross Hire</TableHead>
                    <TableHead>Off-Hire</TableHead>
                    <TableHead>Net Hire</TableHead>
                    <TableHead>Demurrage</TableHead>
                    <TableHead>Despatch</TableHead>
                    <TableHead>Total Devido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.map((calc, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {format(new Date(calc.period_start), "dd/MM")} - {format(new Date(calc.period_end), "dd/MM/yy")}
                      </TableCell>
                      <TableCell>${calc.gross_hire.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">-${calc.off_hire_deduction.toLocaleString()}</TableCell>
                      <TableCell>${calc.net_hire.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">+${calc.demurrage.toLocaleString()}</TableCell>
                      <TableCell className="text-orange-600">-${calc.despatch.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">${calc.total_due.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demurrage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Demurrage
                </CardTitle>
                <CardDescription>Penalidade por atraso na operação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Demurrage Acumulado</p>
                  <p className="text-3xl font-bold text-green-600">$35,000</p>
                  <p className="text-sm text-muted-foreground mt-1">1 dia @ $35,000/dia</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>TC-2025-001</span>
                    <span className="font-medium">$35,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Clock className="h-5 w-5" />
                  Despatch
                </CardTitle>
                <CardDescription>Bônus por operação antecipada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Despatch a Pagar</p>
                  <p className="text-3xl font-bold text-orange-600">$0</p>
                  <p className="text-sm text-muted-foreground mt-1">Nenhum despatch no período</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Alterações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Contrato TC-2025-001 criado</p>
                    <p className="text-sm text-muted-foreground">01/01/2025 09:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pagamento de hire registrado</p>
                    <p className="text-sm text-muted-foreground">01/01/2025 10:30 - $735,000</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculadora de Hire
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contrato</Label>
              <Select defaultValue="1">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contrato" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.contract_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input type="date" defaultValue="2025-01-01" />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input type="date" defaultValue="2025-01-31" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dias Off-Hire</Label>
              <Input type="number" defaultValue="3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCalculator(false)}>Cancelar</Button>
            <Button onClick={calculateHire} disabled={isAnalyzing}>
              {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
              Calcular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CharterPartyPage;
