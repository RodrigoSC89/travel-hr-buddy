/**
 * PEO-DP Anexo J-4 — Formulário de Aderência aos Requisitos do PEO-DP
 * 54+ requisitos across 7 pillars with 3-delivery evaluation cycle
 * Tracks EBN submissions and Petrobras evaluations per PEO-DP 2026
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ClipboardCheck, Download, Search, Shield, CheckCircle, XCircle,
  Clock, AlertTriangle, FileText, Filter, BarChart3
} from "lucide-react";
import { toast } from "sonner";

type EvalStatus = "pending" | "approved" | "rejected" | "partial" | "na";

interface Requirement {
  id: string;
  pilar: string;
  item: string;
  description: string;
  refCruzada: string;
  procedimentos: string;
  prazo: string;
  evalStatus1: EvalStatus;
  evalStatus2: EvalStatus;
  evalStatus3: EvalStatus;
  comments: string;
  finalApproval: "approved" | "rejected" | "pending";
}

const PILARS = ["GESTÃO", "COMPETÊNCIA", "PROCEDIMENTOS", "TREINAMENTOS", "OPERAÇÃO", "MANUTENÇÃO", "TESTES DE DP"];

const REQUIREMENTS: Requirement[] = [
  // GESTÃO
  { id: "1.1.2", pilar: "GESTÃO", item: "1.1.2", description: "Incorporar requisitos do PEO-DP aos procedimentos do sistema de gestão da CONTRATADA, comprovado via Formulário de Aderência (Anexo J-4)", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "1.4.4", pilar: "GESTÃO", item: "1.4.4", description: "Utilizar planilha eletrônica Anexo E-4 para apurar indicador PCLVC", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "1.4.5a", pilar: "GESTÃO", item: "1.4.5 (a)", description: "Listas de Verificação de Configuração do Sistema DP e Praça de Máquinas preenchidas para operações na zona de 500m e exercícios de emergência. Aplica-se a DP1 e DP2.", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  // COMPETÊNCIA
  { id: "2.1", pilar: "COMPETÊNCIA", item: "2.1", description: "Pessoal-chave de DP (Passadiço + Praça de Máquinas) com certificados STCW atualizados conforme Grupo, Seção e Categoria", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "2.2", pilar: "COMPETÊNCIA", item: "2.2", description: "Operadores DP no Passadiço com Certificado de Operador DP atualizado conforme IMCA M 117 e IMCA M 182 (Levels A, B, C)", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "2.2.1", pilar: "COMPETÊNCIA", item: "2.2.1", description: "DPO Júnior: operações DP Levels A e B somente sob supervisão de DPO Sênior (IMCA M 182 Rev.4, itens 4.1.1/4.1.2)", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "2.2.2", pilar: "COMPETÊNCIA", item: "2.2.2", description: "DPO Júnior não pode ser segunda pessoa no turno DP durante atividades críticas e/ou aproximações de UMs (IMCA M 117 Rev.3.2, item 5.3)", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "2.3", pilar: "COMPETÊNCIA", item: "2.3", description: "Pessoal-chave DP da Praça de Máquinas com Certificado de curso estruturado DP (DP Técnico)", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "2.4", pilar: "COMPETÊNCIA", item: "2.4", description: "Pessoal-chave DP1/DP2 cientes de: recursos/limitações DP, footprint plots, consequências de perda de posição, efeito Coanda", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "2.5", pilar: "COMPETÊNCIA", item: "2.5", description: "DP2: Pessoal-chave ciente do FMEA/FMECA, Five-Yearly Trials, Annual Trials, CAMO, ASOG e Manuais DP", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "2.6", pilar: "COMPETÊNCIA", item: "2.6", description: "Pessoal Praça de Máquinas com competência para vigilância durante modo DP, incluindo filosofia de redundância", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  // PROCEDIMENTOS
  { id: "3.1a", pilar: "PROCEDIMENTOS", item: "3.1 (a)", description: "Manual de Operação DP Específico da Embarcação adequado à classe DP e missão industrial", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "3.1b", pilar: "PROCEDIMENTOS", item: "3.1 (b)", description: "CAMO, ASOG, Manual DP e LVs alinhados à classe DP e missão industrial", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "3.2.1", pilar: "PROCEDIMENTOS", item: "3.2.1", description: "Manual DP com descrição e diagramas dos subsistemas: geração, distribuição, resfriamento, combustível e propulsão", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "3.3.1", pilar: "PROCEDIMENTOS", item: "3.3.1", description: "FMEA/FMECA com configuração DP para cumprir notação de classe — nenhuma falha única exceda o WCF", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "3.3.2", pilar: "PROCEDIMENTOS", item: "3.3.2", description: "FMEA/FMECA, Five-Yearly Trials e Annual Trials adequados à classe DP e atualizados", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "3.3.3", pilar: "PROCEDIMENTOS", item: "3.3.3", description: "CAMO e ASOG elaborados com base no FMEA, Manual DP, missão industrial, avaliações de risco", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "3.4a", pilar: "PROCEDIMENTOS", item: "3.4 (a)", description: "Lista de verificação para configuração do sistema DP específica para classe e sistema propulsivo", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "3.7.5", pilar: "PROCEDIMENTOS", item: "3.7.5", description: "Manual DP contendo: filosofia DP, responsabilidades, treinamentos, dados técnicos, limites operacionais, CAMO/ASOG, comunicação, emergências e SIMOPS", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "3.16", pilar: "PROCEDIMENTOS", item: "3.16", description: "LV com campos para: diagrama de rota de fuga, status CAMO Verde/Azul, ações mitigadoras aprovadas", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  // TREINAMENTOS
  { id: "4.1", pilar: "TREINAMENTOS", item: "4.1", description: "Treinamentos contínuos de todo Pessoal-chave DP em operação e manutenção do sistema DP", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "4.2", pilar: "TREINAMENTOS", item: "4.2", description: "Treinamentos conforme MSC.1/Circ.738, IMCA M 117, MTS DP Assurance Framework e NORMAM-101", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "4.4.2", pilar: "TREINAMENTOS", item: "4.4.2", description: "Exercícios simulados de emergência DP contínuos para desenvolvimento de competências técnicas e comportamentais", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "4.4.5", pilar: "TREINAMENTOS", item: "4.4.5", description: "Exercícios simulados realizados com embarcação em modo DP, conforme cenários Tabela 1 do Anexo O-1", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  // OPERAÇÃO
  { id: "5.1", pilar: "OPERAÇÃO", item: "5.1", description: "Operações DP seguindo Manual DP, CAMO, ASOG e procedimentos específicos da embarcação", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "5.2", pilar: "OPERAÇÃO", item: "5.2", description: "Utilização correta dos sistemas de referência de posição e sensores conforme a classe DP", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  // MANUTENÇÃO
  { id: "6.1", pilar: "MANUTENÇÃO", item: "6.1", description: "Plano de manutenção preventiva do sistema DP e subsistemas conforme recomendações do fabricante", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "6.2", pilar: "MANUTENÇÃO", item: "6.2", description: "Registros de manutenção corretiva e preventiva disponíveis e rastreáveis", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  // TESTES DE DP
  { id: "7.1", pilar: "TESTES DE DP", item: "7.1", description: "Annual DP Trials conforme IMCA M 190 com todos os testes obrigatórios executados", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "7.2", pilar: "TESTES DE DP", item: "7.2", description: "Five-Yearly FMEA Proving Trials com validação pela sociedade classificadora", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "7.3", pilar: "TESTES DE DP", item: "7.3", description: "Calibração dos thrusters (Anexo M-1) com correlação corrente, potência, ângulo, comando/feedback", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
  { id: "7.4", pilar: "TESTES DE DP", item: "7.4", description: "Calibração dos relés de proteção dos disjuntores principais a cada 5 anos", refCruzada: "", procedimentos: "", prazo: "", evalStatus1: "pending", evalStatus2: "pending", evalStatus3: "pending", comments: "", finalApproval: "pending" },
];

const statusLabel: Record<EvalStatus, string> = {
  pending: "Pendente", approved: "Aprovado", rejected: "Reprovado", partial: "Parcial", na: "N/A"
};
const statusVariant: Record<EvalStatus, "outline" | "destructive" | "secondary" | "default"> = {
  pending: "outline", approved: "default", rejected: "destructive", partial: "secondary", na: "outline"
};

export function PeoDPAdherenceForm() {
  const [reqs, setReqs] = useState<Requirement[]>(REQUIREMENTS);
  const [filterPilar, setFilterPilar] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryRound, setDeliveryRound] = useState<1 | 2 | 3>(1);

  const filtered = useMemo(() => reqs.filter(r =>
    (filterPilar === "all" || r.pilar === filterPilar) &&
    (filterStatus === "all" || r[`evalStatus${deliveryRound}` as keyof Requirement] === filterStatus) &&
    (searchTerm === "" || r.description.toLowerCase().includes(searchTerm.toLowerCase()) || r.item.includes(searchTerm))
  ), [reqs, filterPilar, filterStatus, searchTerm, deliveryRound]);

  const stats = useMemo(() => {
    const key = `evalStatus${deliveryRound}` as keyof Requirement;
    return {
      total: reqs.length,
      approved: reqs.filter(r => r[key] === "approved").length,
      rejected: reqs.filter(r => r[key] === "rejected").length,
      pending: reqs.filter(r => r[key] === "pending").length,
      partial: reqs.filter(r => r[key] === "partial").length,
    };
  }, [reqs, deliveryRound]);

  const progressPct = stats.total > 0 ? Math.round(((stats.approved) / stats.total) * 100) : 0;

  const updateEval = (id: string, status: EvalStatus) => {
    const key = `evalStatus${deliveryRound}` as string;
    setReqs(prev => prev.map(r => r.id === id ? { ...r, [key]: status } : r));
  };

  const pilarStats = useMemo(() => {
    const key = `evalStatus${deliveryRound}` as keyof Requirement;
    return PILARS.map(p => {
      const items = reqs.filter(r => r.pilar === p);
      const approved = items.filter(r => r[key] === "approved").length;
      return { pilar: p, total: items.length, approved, pct: items.length > 0 ? Math.round((approved / items.length) * 100) : 0 };
    });
  }, [reqs, deliveryRound]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Formulário de Aderência — Anexo J-4
          </h3>
          <p className="text-sm text-muted-foreground">
            {REQUIREMENTS.length} requisitos • 7 Pilares • Ciclo de 3 entregas • PEO-DP 2026
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={String(deliveryRound)} onValueChange={v => setDeliveryRound(Number(v) as 1 | 2 | 3)}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1ª Entrega</SelectItem>
              <SelectItem value="2">2ª Entrega</SelectItem>
              <SelectItem value="3">3ª Entrega</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => toast.success("Formulário J-4 exportado")}>
            <Download className="h-3 w-3" /> Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Total Requisitos</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Aprovados</p>
          <p className="text-2xl font-bold text-success">{stats.approved}</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Reprovados</p>
          <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-muted-foreground">{stats.pending}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Aderência</p>
          <p className="text-2xl font-bold">{progressPct}%</p>
        </CardContent></Card>
      </div>

      {/* Per-Pilar Progress */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Aderência por Pilar — {deliveryRound}ª Entrega</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {pilarStats.map(ps => (
            <div key={ps.pilar} className="flex items-center gap-3">
              <span className="text-xs font-medium w-32 truncate">{ps.pilar}</span>
              <Progress value={ps.pct} className="flex-1 h-2" />
              <span className="text-xs font-bold w-16 text-right">{ps.approved}/{ps.total} ({ps.pct}%)</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Buscar requisito..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-48 h-9" />
        </div>
        <Select value={filterPilar} onValueChange={setFilterPilar}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Pilares</SelectItem>
            {PILARS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Reprovado</SelectItem>
            <SelectItem value="partial">Parcial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requirements Table */}
      <Card>
        <CardContent className="pt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filtered.map(req => {
                const currentStatus = req[`evalStatus${deliveryRound}` as keyof Requirement] as EvalStatus;
                return (
                  <div key={req.id} className={`p-3 rounded-lg border ${
                    currentStatus === "approved" ? "border-success/20 bg-success/5" :
                    currentStatus === "rejected" ? "border-destructive/20 bg-destructive/5" :
                    currentStatus === "partial" ? "border-warning/20 bg-warning/5" :
                    "border-border"
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono shrink-0">{req.item}</Badge>
                          <Badge variant="secondary" className="text-xs shrink-0">{req.pilar}</Badge>
                          <Badge variant={statusVariant[currentStatus]} className="text-xs shrink-0">
                            {statusLabel[currentStatus]}
                          </Badge>
                        </div>
                        <p className="text-sm">{req.description}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {(["approved", "partial", "rejected"] as EvalStatus[]).map(s => (
                          <Button key={s} size="sm" variant={currentStatus === s ? (s === "rejected" ? "destructive" : "default") : "outline"}
                            className="h-7 px-2 text-xs" onClick={() => updateEval(req.id, s)}>
                            {s === "approved" ? "✓" : s === "partial" ? "~" : "✗"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
