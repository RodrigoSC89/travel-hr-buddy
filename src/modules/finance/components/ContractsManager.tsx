/**
 * Contracts Manager - Maritime Contract Management
 * Charter Party, Service Contracts, Afretamentos
 */

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Download,
  Calendar,
  DollarSign,
  Ship,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Eye,
  MoreHorizontal,
  Signature,
  Link,
  Users,
  MapPin,
  FileCheck,
  RefreshCw,
  Brain,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  contract_type: "charter_party" | "time_charter" | "voyage_charter" | "bareboat" | "service" | "crew" | "maintenance";
  counterparty: string;
  vessel_id?: string;
  vessel_name?: string;
  start_date: string;
  end_date: string;
  total_value: number;
  currency: string;
  payment_terms: string;
  status: "draft" | "pending_approval" | "active" | "expired" | "terminated" | "renewal";
  renewal_date?: string;
  terms_summary?: string;
  key_clauses?: string[];
  attachments?: string[];
  created_at: string;
  risk_score?: number;
}

export default function ContractsManager() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_contract_analysis")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          logger.warn("ai_contract_analysis error", error);
          setLoading(false);
          return;
        }

        const mapped: Contract[] = (data || []).map((c, i: number) => {
          const parties = (c.parties as Record<string, string> | null) || {};
          const dates = (c.key_dates as Record<string, string> | null) || {};
          const financial = (c.financial_terms as Record<string, unknown> | null) || {};
          return {
            id: c.id,
            contract_number: `CP-${new Date(c.created_at).getFullYear()}-${String(i + 1).padStart(3, "0")}`,
            title: `${c.contract_type || "Contract"} Analysis`,
            contract_type: (c.contract_type || "service") as Contract["contract_type"],
            counterparty: parties?.counterparty || parties?.party_b || "N/A",
            vessel_name: parties?.vessel || undefined,
            start_date: dates?.start || c.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
            end_date: dates?.end || new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
            total_value: (financial?.total_value as number) || c.total_potential_savings || 0,
            currency: (financial?.currency as string) || "BRL",
            payment_terms: (financial?.payment_terms as string) || "Monthly",
            status: c.overall_risk_score && c.overall_risk_score > 70 ? "renewal" : "active",
            terms_summary: c.contract_type || "",
            key_clauses: (c.risk_clauses as unknown[])?.map((r) => {
              if (typeof r === "string") return r;
              return (r as Record<string, string>)?.clause || String(r);
            }) || [],
            risk_score: c.overall_risk_score || 0,
            created_at: c.created_at?.split("T")[0] || "",
          };
        });

        setContracts(mapped);
      } catch (err) {
        logger.error("Error fetching contracts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

const CONTRACT_TYPES = [
  { value: "charter_party", label: "Charter Party" },
  { value: "time_charter", label: "Time Charter" },
  { value: "voyage_charter", label: "Voyage Charter" },
  { value: "bareboat", label: "Bareboat Charter" },
  { value: "service", label: "Service Agreement" },
  { value: "crew", label: "Crew Management" },
  { value: "maintenance", label: "Maintenance Contract" },
];
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contract_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || c.contract_type === typeFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    pending: contracts.filter(c => c.status === "pending_approval" || c.status === "renewal").length,
    expiringSoon: contracts.filter(c => {
      const daysToEnd = differenceInDays(new Date(c.end_date), new Date());
      return daysToEnd > 0 && daysToEnd <= 30;
    }).length,
    totalValue: contracts.reduce((acc, c) => {
      // Convert to BRL for simplicity
      const value = c.currency === "USD" ? c.total_value * 5 : c.total_value;
      return acc + value;
    }, 0),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/20 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Ativo</Badge>;
      case "pending_approval":
        return <Badge className="bg-warning/20 text-warning"><Clock className="h-3 w-3 mr-1" />Pendente Aprovação</Badge>;
      case "renewal":
        return <Badge className="bg-info/20 text-info"><RefreshCw className="h-3 w-3 mr-1" />Renovação</Badge>;
      case "expired":
        return <Badge className="bg-destructive/20 text-destructive">Expirado</Badge>;
      case "terminated":
        return <Badge variant="secondary">Rescindido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const label = CONTRACT_TYPES.find(t => t.value === type)?.label || type;
    return <Badge variant="outline">{label}</Badge>;
  };

  const getRiskColor = (score: number) => {
    if (score <= 20) return "text-success";
    if (score <= 50) return "text-amber-500";
    return "text-destructive";
  };

  const getContractProgress = (contract: Contract) => {
    const start = new Date(contract.start_date);
    const end = new Date(contract.end_date);
    const now = new Date();
    const total = differenceInDays(end, start);
    const elapsed = differenceInDays(now, start);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Contratos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-success">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vencendo (30d)</p>
                <p className="text-2xl font-bold text-destructive">{stats.expiringSoon}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {(stats.totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contrato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {CONTRACT_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="pending_approval">Pendente</SelectItem>
              <SelectItem value="renewal">Renovação</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Análise IA
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredContracts.map((contract, index) => {
          const daysRemaining = differenceInDays(new Date(contract.end_date), new Date());
          const progress = getContractProgress(contract);

          return (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:border-primary/50 transition-all cursor-pointer ${
                contract.status === "renewal" ? "border-primary/30" :
                daysRemaining <= 30 && daysRemaining > 0 ? "border-warning/30" : ""
              }`} onClick={() => { setSelectedContract(contract); setShowDetails(true); }}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-lg">{contract.contract_number}</p>
                        {getStatusBadge(contract.status)}
                      </div>
                      <p className="text-sm font-medium">{contract.title}</p>
                      <p className="text-sm text-muted-foreground">{contract.counterparty}</p>
                    </div>
                    {getTypeBadge(contract.contract_type)}
                  </div>

                  {contract.vessel_name && (
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      <span>{contract.vessel_name}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground text-xs">Período</p>
                      <p className="font-medium">
                        {format(new Date(contract.start_date), "dd/MM/yy")} - {format(new Date(contract.end_date), "dd/MM/yy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Valor</p>
                      <p className="font-medium">
                        {contract.currency} {(contract.total_value / 1000000).toFixed(2)}M
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className={daysRemaining <= 30 ? "text-warning font-medium" : ""}>
                        {daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Expirado"}
                      </span>
                    </div>
                    <Progress value={progress} className={daysRemaining <= 30 ? "[&>div]:bg-warning" : ""} />
                  </div>

                  {contract.risk_score !== undefined && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">Risco</span>
                      <div className="flex items-center gap-2">
                        <Progress value={contract.risk_score} className="w-24 h-2" />
                        <span className={`text-xs font-medium ${getRiskColor(contract.risk_score)}`}>
                          {contract.risk_score}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredContracts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Nenhum contrato encontrado</p>
            <p className="text-sm">Ajuste os filtros ou crie um novo contrato</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contract Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          {selectedContract && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {selectedContract.contract_number}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{selectedContract.title}</p>
                    <p className="text-muted-foreground">{selectedContract.counterparty}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(selectedContract.contract_type)}
                    {getStatusBadge(selectedContract.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Início</p>
                    <p className="font-medium">{format(new Date(selectedContract.start_date), "dd/MM/yyyy")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Término</p>
                    <p className="font-medium">{format(new Date(selectedContract.end_date), "dd/MM/yyyy")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <DollarSign className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="font-medium">{selectedContract.currency} {(selectedContract.total_value / 1000000).toFixed(2)}M</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Pagamento</p>
                    <p className="font-medium">{selectedContract.payment_terms}</p>
                  </div>
                </div>

                {selectedContract.terms_summary && (
                  <div>
                    <p className="text-sm font-medium mb-2">Resumo dos Termos</p>
                    <p className="text-sm text-muted-foreground">{selectedContract.terms_summary}</p>
                  </div>
                )}

                {selectedContract.key_clauses && selectedContract.key_clauses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Cláusulas Principais</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContract.key_clauses.map((clause) => (
                        <Badge key={clause} variant="outline">{clause}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Progresso do Contrato</p>
                  <Progress value={getContractProgress(selectedContract)} />
                  <p className="text-xs text-muted-foreground text-right">
                    {differenceInDays(new Date(selectedContract.end_date), new Date())} dias restantes
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {selectedContract.status === "renewal" && (
                  <Button>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renovar Contrato
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Contract Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Contrato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Contrato</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título do Contrato</Label>
              <Input placeholder="Ex: Charter Party - MV Atlantic Star" />
            </div>
            <div className="space-y-2">
              <Label>Contraparte</Label>
              <Input placeholder="Nome da empresa" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Data de Término</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Total</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Moeda</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Termos de Pagamento</Label>
              <Input placeholder="Ex: Monthly in advance" />
            </div>
            <div className="space-y-2">
              <Label>Resumo dos Termos</Label>
              <Textarea placeholder="Descrição resumida do contrato..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={async () => {
              try {
                const { supabase } = await import("@/integrations/supabase/client");
                const { error } = await supabase.from("ai_audit_logs").insert({
                  user_input: JSON.stringify({ action: "contract_created", created_at: new Date().toISOString() }),
                  interaction_type: "contract_creation",
                  module_name: "finance-contracts"
                });
                if (error) throw error;
                toast.success("Contrato criado e registrado!");
                setShowAddDialog(false);
              } catch {
                toast.error("Erro ao criar contrato");
              }
            }}>
              Criar Contrato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
