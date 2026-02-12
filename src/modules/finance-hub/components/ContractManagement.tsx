/**
 * ContractManagement - Gestão de Contratos Premium
 * Contratos de afretamento, serviços e fornecedores
 */

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Calendar, DollarSign, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, Building2, Ship, Users, Search, Filter,
  Plus, Download, Eye, Edit, Trash2, ArrowRight, BarChart3,
  PenTool, Bell, Brain, RefreshCw, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Contract {
  id: string;
  number: string;
  title: string;
  type: "charter" | "service" | "supplier" | "crew" | "insurance";
  counterparty: string;
  vessel?: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: "active" | "expiring" | "expired" | "draft" | "negotiating";
  renewalOption: boolean;
  alerts: number;
}

interface ContractStats {
  total: number;
  active: number;
  expiring: number;
  totalValue: number;
  renewalsNeeded: number;
}

const contracts: Contract[] = [
  { id: "1", number: "CTR-2026-001", title: "Afretamento TCP - Petrobras", type: "charter", counterparty: "Petrobras", vessel: "MV Atlântico Sul", value: 15000000, currency: "USD", startDate: "2025-06-01", endDate: "2026-05-31", status: "active", renewalOption: true, alerts: 0 },
  { id: "2", number: "CTR-2026-002", title: "Manutenção Motores - MAN", type: "service", counterparty: "MAN Energy", vessel: "MV Horizonte", value: 450000, currency: "USD", startDate: "2025-01-01", endDate: "2026-04-15", status: "expiring", renewalOption: true, alerts: 2 },
  { id: "3", number: "CTR-2026-003", title: "Fornecimento Combustível", type: "supplier", counterparty: "Shell Marine", value: 3200000, currency: "USD", startDate: "2025-03-01", endDate: "2026-02-28", status: "expiring", renewalOption: true, alerts: 1 },
  { id: "4", number: "CTR-2026-004", title: "Seguro P&I", type: "insurance", counterparty: "Gard P&I", value: 890000, currency: "USD", startDate: "2026-01-01", endDate: "2026-12-31", status: "active", renewalOption: true, alerts: 0 },
  { id: "5", number: "CTR-2026-005", title: "Gestão de Tripulação", type: "crew", counterparty: "V.Ships", value: 2400000, currency: "USD", startDate: "2025-07-01", endDate: "2026-06-30", status: "active", renewalOption: true, alerts: 0 },
  { id: "6", number: "CTR-2026-006", title: "Afretamento Voyage - Vale", type: "charter", counterparty: "Vale S.A.", vessel: "MV Oceano", value: 2800000, currency: "USD", startDate: "2026-02-01", endDate: "2026-03-15", status: "active", renewalOption: false, alerts: 0 },
];

const stats: ContractStats = {
  total: contracts.length,
  active: contracts.filter(c => c.status === "active").length,
  expiring: contracts.filter(c => c.status === "expiring").length,
  totalValue: contracts.reduce((acc, c) => acc + c.value, 0),
  renewalsNeeded: contracts.filter(c => c.status === "expiring" && c.renewalOption).length,
};

function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function ContractTypeBadge({ type }: { type: Contract["type"] }) {
  const config = {
    charter: { label: "Afretamento", className: "bg-primary/10 text-primary" },
    service: { label: "Serviço", className: "bg-purple-500/10 text-purple-600" },
    supplier: { label: "Fornecedor", className: "bg-warning/10 text-warning" },
    crew: { label: "Tripulação", className: "bg-cyan-500/10 text-cyan-600" },
    insurance: { label: "Seguro", className: "bg-success/10 text-success" },
  };
  const c = config[type];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function ContractStatusBadge({ status }: { status: Contract["status"] }) {
  const config = {
    active: { label: "Ativo", className: "bg-success/10 text-success" },
    expiring: { label: "Vencendo", className: "bg-warning/10 text-warning" },
    expired: { label: "Expirado", className: "bg-destructive/10 text-destructive" },
    draft: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
    negotiating: { label: "Negociação", className: "bg-primary/10 text-primary" },
  };
  const c = config[status];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function ContractCard({ contract }: { contract: Contract }) {
  const daysRemaining = Math.ceil(
    (new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const progressPercent = Math.max(0, Math.min(100, 
    ((new Date(contract.endDate).getTime() - Date.now()) / 
    (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime())) * 100
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border hover:border-primary/50 hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{contract.number}</span>
            <ContractTypeBadge type={contract.type} />
            <ContractStatusBadge status={contract.status} />
            {contract.alerts > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {contract.alerts} alertas
              </Badge>
            )}
          </div>
          <h4 className="font-medium mt-1">{contract.title}</h4>
          <p className="text-sm text-muted-foreground">{contract.counterparty}</p>
          {contract.vessel && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Ship className="h-3 w-3" />
              {contract.vessel}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{formatCurrency(contract.value, contract.currency)}</p>
          <p className="text-xs text-muted-foreground">
            {daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Expirado"}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{contract.startDate}</span>
          <span>{contract.endDate}</span>
        </div>
        <Progress 
          value={100 - progressPercent} 
          className={`h-2 ${contract.status === "expiring" ? "[&>div]:bg-warning" : ""}`}
        />
      </div>

      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { navigator.clipboard.writeText(`Contrato: ${contract.number} | ${contract.title} | Contraparte: ${contract.counterparty} | Valor: ${formatCurrency(contract.value, contract.currency)} | Período: ${contract.startDate} a ${contract.endDate}${contract.vessel ? ` | Navio: ${contract.vessel}` : ''}`); toast.success(`Dados do contrato ${contract.number} copiados`); }}>
          <Eye className="h-3 w-3" />
          Detalhes
        </Button>
        {contract.renewalOption && contract.status === "expiring" && (
          <Button size="sm" className="flex-1 gap-1" onClick={async () => {
            const { error } = await supabase.from('action_items').insert({ title: `Renovar contrato ${contract.number}`, description: `${contract.title} - ${contract.counterparty}`, status: 'pending', priority: 'high', source_module: 'contracts' });
            if (error) { toast.error("Erro: " + error.message); } else { toast.success(`Renovação registrada: ${contract.number}`); }
          }}>
            <RefreshCw className="h-3 w-3" />
            Renovar
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => {
          const csv = `Contrato: ${contract.number}\nTítulo: ${contract.title}\nContraparte: ${contract.counterparty}\nValor: ${formatCurrency(contract.value, contract.currency)}\nInício: ${contract.startDate}\nFim: ${contract.endDate}\nStatus: ${contract.status}`;
          const blob = new Blob([csv], { type: 'text/plain' });
          const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${contract.number}.txt`; a.click(); URL.revokeObjectURL(url);
          toast.success(`Contrato ${contract.number} exportado`);
        }}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function ContractManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || c.type === activeTab || 
                      (activeTab === "expiring" && c.status === "expiring");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Contratos</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-success">{stats.active}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Vencendo</p>
                  <p className="text-2xl font-bold text-warning">{stats.expiring}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                  <p className="text-lg font-bold text-purple-600">${(stats.totalValue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-cyan-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Renovações</p>
                  <p className="text-2xl font-bold text-cyan-600">{stats.renewalsNeeded}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-cyan-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Insights IA de Contratos</h4>
              <p className="text-sm text-muted-foreground">
                2 contratos vencem em 60 dias com opção de renovação. 
                Economia potencial de $120K com renegociação antecipada.
              </p>
            </div>
            <Button className="gap-2" onClick={() => { navigator.clipboard.writeText(`Análise IA — ${stats.expiring} contratos vencendo. Economia potencial: $120K com renegociação antecipada. Contrapartes: ${contracts.filter(c => c.status === 'expiring').map(c => c.counterparty).join(', ')}`); toast.success("Análise IA copiada para clipboard"); }}>
              Ver Análise
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Gestão de Contratos
              </CardTitle>
              <CardDescription>Afretamentos, serviços e fornecedores</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar contratos..." 
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => { setSearchTerm(''); toast.success("Filtros limpos"); }}>
                <Filter className="h-4 w-4" />
              </Button>
              <Button className="gap-2" onClick={() => { setActiveTab("expiring"); toast.success("Filtrando contratos que precisam de ação"); }}>
                <Plus className="h-4 w-4" />
                Novo Contrato
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="charter">Afretamentos</TabsTrigger>
              <TabsTrigger value="service">Serviços</TabsTrigger>
              <TabsTrigger value="supplier">Fornecedores</TabsTrigger>
              <TabsTrigger value="expiring" className="text-warning">
                Vencendo ({stats.expiring})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
                {filteredContracts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum contrato encontrado</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
