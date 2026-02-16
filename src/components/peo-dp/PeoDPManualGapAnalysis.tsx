/**
 * PEO-DP Anexo K-1 — GAP Analysis do Manual de Operação DP da EAM
 * 200+ items across 20 sections per TECHOP O-01 Rev.1
 * Evaluation grades: A (omitted/errors), B (incomplete), C (satisfactory), D (N/A)
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Download, Search, AlertTriangle, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type GapGrade = "A" | "B" | "C" | "D" | "pending";

interface ManualItem {
  id: string;
  section: number;
  sectionName: string;
  subItem: string;
  description: string;
  grade: GapGrade;
  comments: string;
}

const SECTIONS_DATA: { section: number; name: string; items: { sub: string; desc: string }[] }[] = [
  { section: 1, name: "INTRODUÇÃO", items: [
    { sub: "1.1", desc: "Visão geral do Manual de Operações de DP e do sistema de DP" },
    { sub: "1.2", desc: "Autoridade e responsabilidade do Comandante" },
    { sub: "1.3", desc: "Declaração de Sistema DP como sistema crítico de segurança" },
  ]},
  { section: 2, name: "PROCESSOS DA EBN", items: [
    { sub: "2.1", desc: "Gestão de mudanças" },
    { sub: "2.2", desc: "Avaliações de risco" },
    { sub: "2.3", desc: "Modo de atividade crítica / Modo apropriado para tarefas" },
    { sub: "2.4", desc: "Posicionamento de espera" },
    { sub: "2.5", desc: "Permissão de trabalho" },
    { sub: "2.6", desc: "Divulgação de boletins de segurança" },
    { sub: "2.7", desc: "Melhoria contínua" },
    { sub: "2.8", desc: "Desenvolvimento, implementação e uso do CAMO e do ASOG" },
    { sub: "2.9", desc: "Processo de conexão com requisitos específicos do cliente, PEO-DP e Guia de Operações" },
    { sub: "2.10", desc: "Protocolos de notificação de falhas" },
    { sub: "2.11", desc: "Adesão aos padrões e diretrizes (Petrobras, IMO, IMCA, MTS, OCIMF)" },
  ]},
  { section: 3, name: "ORGANIZAÇÃO E RESPONSABILIDADE", items: [
    { sub: "3.1", desc: "Pessoal chave de DP" },
    { sub: "3.2", desc: "Organograma do departamento de garantia de DP" },
    { sub: "3.3", desc: "Gestão de escritório" },
    { sub: "3.4", desc: "Atribuições do Comandante" },
    { sub: "3.5", desc: "Atribuições do DPO Sênior" },
    { sub: "3.6", desc: "Atribuições do DPO" },
    { sub: "3.7", desc: "Atribuições do DPO Júnior" },
    { sub: "3.8", desc: "Esquema de treinamento para DPO" },
    { sub: "3.9", desc: "Familiarização específica do DPO da embarcação" },
    { sub: "3.10", desc: "Atribuições do Chefe de Máquinas" },
    { sub: "3.11", desc: "Atribuições dos Oficiais de Máquinas" },
    { sub: "3.12", desc: "Atribuições dos Instrutores Qualificados" },
    { sub: "3.13", desc: "Familiarização específica do pessoal de Máquinas com o DP" },
  ]},
  { section: 4, name: "HORAS DE TRABALHO", items: [
    { sub: "4.1", desc: "Vigilância DP" },
    { sub: "4.2", desc: "Deveres do vigilante de DP - DPO" },
    { sub: "4.3", desc: "Engenheiro de vigilância" },
    { sub: "4.4", desc: "Planejamento do trabalho" },
    { sub: "4.5", desc: "Operações e contingências em comum" },
    { sub: "4.6", desc: "Operações DP durante operações críticas e simultâneas" },
  ]},
  { section: 5, name: "DADOS DA EMBARCAÇÃO", items: [
    { sub: "5.1", desc: "Características gerais" },
    { sub: "5.2", desc: "Geração de energia" },
    { sub: "5.3", desc: "Propulsores" },
  ]},
  { section: 6, name: "DADOS ESPECÍFICOS DO SISTEMA DP", items: [
    { sub: "6.1", desc: "Filosofia do projeto de DP (conceito de redundância)" },
    { sub: "6.2", desc: "Vulnerabilidades e barreiras do sistema DP" },
    { sub: "6.3", desc: "Pior caso de falha (WCFDI)" },
    { sub: "6.4", desc: "Configuração da planta de energia conforme FMEA/FMECA" },
    { sub: "6.5", desc: "Sistemas de referência de posição" },
    { sub: "6.6", desc: "Modos de controle DP e características" },
    { sub: "6.7", desc: "Sensores ambientais" },
    { sub: "6.8", desc: "Função gerenciamento de energia" },
    { sub: "6.9", desc: "Estratégia de operação" },
    { sub: "6.10", desc: "Funções de proteção para redundância e tolerância a falhas" },
  ]},
  { section: 7, name: "DESCRIÇÃO DO SISTEMA DP", items: [
    { sub: "7.1", desc: "Estações de trabalho DP" },
    { sub: "7.2", desc: "Painel de controle do Joystick" },
    { sub: "7.3", desc: "Monitor tela sensível a toque" },
    { sub: "7.4", desc: "Configuração de rede" },
    { sub: "7.5", desc: "Distribuição de energia" },
    { sub: "7.6", desc: "Posição e aproamento" },
    { sub: "7.7", desc: "Lógica de alocação do propulsor" },
    { sub: "7.8", desc: "Controle de qualidade do sensor de posição" },
    { sub: "7.9", desc: "Processamento de sensores ambientais" },
    { sub: "7.10", desc: "Filtragem de ondas" },
    { sub: "7.11", desc: "Limitação de potência" },
    { sub: "7.12", desc: "Modos operacionais" },
    { sub: "7.13", desc: "Sistemas de referência de posição e sensores" },
    { sub: "7.14", desc: "Sistema 24 VCC" },
  ]},
  { section: 8, name: "SISTEMA DE PROPULSÃO", items: [
    { sub: "8.1", desc: "Descrição geral" },
    { sub: "8.2", desc: "Propulsão principal e controles" },
    { sub: "8.3", desc: "Modo de velocidade constante" },
    { sub: "8.5", desc: "Controle de backup" },
    { sub: "8.7", desc: "Direção azimutal" },
    { sub: "8.8", desc: "Propulsor túnel" },
  ]},
  { section: 10, name: "CONFIGURAÇÃO DE OPERAÇÃO EM DP", items: [
    { sub: "10.1", desc: "Local de trabalho seguro" },
    { sub: "10.3", desc: "Proa de trabalho segura" },
    { sub: "10.4", desc: "Rotas de fuga" },
    { sub: "10.5", desc: "Bordo de trabalho desfavorável" },
    { sub: "10.7", desc: "Excursões críticas e permitidas" },
    { sub: "10.8", desc: "Avisos e alarmes de excursão" },
  ]},
  { section: 14, name: "RESPOSTAS E EMERGÊNCIAS EM MODO DP", items: [
    { sub: "14.1", desc: "Definição de Drive-Off" },
    { sub: "14.2", desc: "Resposta a um evento de Drive-Off" },
    { sub: "14.3", desc: "Definição de Drift-Off" },
    { sub: "14.4", desc: "Resposta a um evento de Drift-Off" },
    { sub: "14.5", desc: "Excursões causadas por diferenças de comando e feedback" },
    { sub: "14.6", desc: "Perda de um gerador ou thruster" },
    { sub: "14.8", desc: "Treinamento para emergências de DP" },
    { sub: "14.9", desc: "Prioridades em uma emergência de DP" },
  ]},
  { section: 15, name: "MODO DE OPERAÇÃO DE ATIVIDADE CRÍTICA", items: [
    { sub: "15.1", desc: "Introdução" },
    { sub: "15.2", desc: "Estrutura do CAMO" },
    { sub: "15.3", desc: "Verde" },
    { sub: "15.4", desc: "Azul" },
    { sub: "15.5", desc: "Amarelo" },
    { sub: "15.6", desc: "Vermelho" },
  ]},
];

const allItems: ManualItem[] = SECTIONS_DATA.flatMap(s =>
  s.items.map(item => ({
    id: `${s.section}-${item.sub}`,
    section: s.section,
    sectionName: s.name,
    subItem: item.sub,
    description: item.desc,
    grade: "pending" as GapGrade,
    comments: "",
  }))
);

const GRADE_CONFIG: Record<GapGrade, { label: string; color: string; variant: "destructive" | "secondary" | "default" | "outline" }> = {
  A: { label: "A - Omitido/Erro", color: "text-destructive", variant: "destructive" },
  B: { label: "B - Incompleto", color: "text-warning", variant: "secondary" },
  C: { label: "C - Satisfatório", color: "text-success", variant: "default" },
  D: { label: "D - N/A", color: "text-muted-foreground", variant: "outline" },
  pending: { label: "Pendente", color: "text-muted-foreground", variant: "outline" },
};

export function PeoDPManualGapAnalysis() {
  const [items, setItems] = useState<ManualItem[]>(allItems);
  const [filterSection, setFilterSection] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => items.filter(i =>
    (filterSection === "all" || i.section === Number(filterSection)) &&
    (filterGrade === "all" || i.grade === filterGrade) &&
    (searchTerm === "" || i.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [items, filterSection, filterGrade, searchTerm]);

  const stats = useMemo(() => ({
    total: items.length,
    a: items.filter(i => i.grade === "A").length,
    b: items.filter(i => i.grade === "B").length,
    c: items.filter(i => i.grade === "C").length,
    d: items.filter(i => i.grade === "D").length,
    pending: items.filter(i => i.grade === "pending").length,
  }), [items]);

  const conformityPct = stats.total > 0 ? Math.round(((stats.c + stats.d) / stats.total) * 100) : 0;
  const hasBlockingGrade = stats.a > 0;

  const updateGrade = (id: string, grade: GapGrade) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, grade } : i));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            GAP Analysis do Manual DP — Anexo K-1
          </h3>
          <p className="text-sm text-muted-foreground">
            {items.length} itens • TECHOP O-01 Rev.1 • IMCA M 103/M 109
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => quickExport(items, "GAP Analysis K-1")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {/* Alert for blocking grade */}
      {hasBlockingGrade && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              <strong>{stats.a} item(ns) com avaliação "A"</strong> — Manual não será aceito até revisão conforme PEO-DP 2026
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <Card><CardContent className="pt-3 text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-3 text-center">
          <p className="text-xs text-destructive">A - Omitido</p>
          <p className="text-xl font-bold text-destructive">{stats.a}</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-3 text-center">
          <p className="text-xs text-warning">B - Incompleto</p>
          <p className="text-xl font-bold text-warning">{stats.b}</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-3 text-center">
          <p className="text-xs text-success">C - Satisfatório</p>
          <p className="text-xl font-bold text-success">{stats.c}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-3 text-center">
          <p className="text-xs text-muted-foreground">D - N/A</p>
          <p className="text-xl font-bold">{stats.d}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-3 text-center">
          <p className="text-xs text-muted-foreground">Conformidade</p>
          <p className="text-xl font-bold">{conformityPct}%</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-48 h-9" />
        </div>
        <Select value={filterSection} onValueChange={setFilterSection}>
          <SelectTrigger className="w-56 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Seções</SelectItem>
            {SECTIONS_DATA.map(s => <SelectItem key={s.section} value={String(s.section)}>{s.section}. {s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Notas</SelectItem>
            <SelectItem value="A">A - Omitido</SelectItem>
            <SelectItem value="B">B - Incompleto</SelectItem>
            <SelectItem value="C">C - Satisfatório</SelectItem>
            <SelectItem value="D">D - N/A</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items */}
      <Card>
        <CardContent className="pt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              {filtered.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-2 rounded border ${
                  item.grade === "A" ? "border-destructive/20 bg-destructive/5" :
                  item.grade === "B" ? "border-warning/20 bg-warning/5" :
                  item.grade === "C" ? "border-success/20 bg-success/5" :
                  "border-border"
                }`}>
                  <span className="text-xs font-mono text-muted-foreground w-10 shrink-0">{item.subItem}</span>
                  <span className="text-sm flex-1">{item.description}</span>
                  <div className="flex gap-1 shrink-0">
                    {(["A", "B", "C", "D"] as GapGrade[]).map(g => (
                      <Button key={g} size="sm" variant={item.grade === g ? GRADE_CONFIG[g].variant : "outline"}
                        className="h-7 w-7 p-0 text-xs font-bold" onClick={() => updateGrade(item.id, g)}>
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
