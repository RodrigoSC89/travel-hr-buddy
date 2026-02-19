/**
 * LVS Bulk Actions + Real-time Progress
 * Aprovação em massa, atribuição de responsáveis, countdown para aceitação
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, Clock, Users, Calendar, Target,
  ChevronDown, ChevronUp, Zap, Download, BarChart3, Timer,
  AlertTriangle, Eye, UserPlus, ArrowUpDown
} from "lucide-react";
import { ALL_LVS_SECTIONS, type Section, type ItemStatus } from "./lvs-data";

const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; icon: React.ElementType }> = {
  approved: { label: "Aprovado", color: "bg-success/20 text-success border-success/30", icon: CheckCircle2 },
  pending: { label: "Pendente", color: "bg-warning/20 text-warning border-warning/30", icon: Clock },
  rejected: { label: "Rejeitado", color: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle },
  not_applicable: { label: "N/A", color: "bg-muted text-muted-foreground", icon: AlertTriangle },
  not_verified: { label: "Não Verificado", color: "bg-muted text-muted-foreground", icon: Eye },
};

const RESPONSIBLES = [
  "Supervisor ROV", "Ch. Máquinas", "Oficial de Náutica", "Gerente de Projeto",
  "Coord. Segurança", "Técnico TI", "Eletricista", "Supervisor Convés",
  "Coord. Habitabilidade", "Encarregado de Manutenção",
];

interface BulkItem {
  id: string;
  ref: string;
  question: string;
  status: ItemStatus;
  sectionCode: string;
  etRef: string;
  pendency: string;
  responsible?: string;
  deadline?: string;
  selected: boolean;
}

export function LVSBulkActionsProgress() {
  const [items, setItems] = useState<BulkItem[]>(() =>
    ALL_LVS_SECTIONS.flatMap(s =>
      s.subsections.flatMap(ss =>
        ss.items.map(item => ({
          id: item.id, ref: item.ref, question: item.question,
          status: item.status, sectionCode: s.code, etRef: s.etRef,
          pendency: item.pendency, selected: false,
        }))
      )
    )
  );

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterET, setFilterET] = useState<string>("all");
  const [filterResponsible, setFilterResponsible] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"ref" | "status" | "section">("section");
  const [bulkStatus, setBulkStatus] = useState<ItemStatus>("approved");
  const [bulkResponsible, setBulkResponsible] = useState<string>("");
  const [bulkDeadline, setBulkDeadline] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>("");
  const [showBulkBar, setShowBulkBar] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const approved = items.filter(i => i.status === "approved").length;
    const pending = items.filter(i => i.status === "pending").length;
    const rejected = items.filter(i => i.status === "rejected").length;
    const notVerified = items.filter(i => i.status === "not_verified").length;
    const na = items.filter(i => i.status === "not_applicable").length;
    const applicable = total - na;
    const score = applicable > 0 ? Math.round((approved / applicable) * 100) : 0;
    const withResponsible = items.filter(i => i.responsible).length;
    const withDeadline = items.filter(i => i.deadline).length;
    const selected = items.filter(i => i.selected).length;

    // Days remaining
    const daysRemaining = targetDate
      ? Math.max(0, Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000))
      : null;

    // Items per day needed
    const itemsPerDay = daysRemaining && daysRemaining > 0
      ? Math.ceil((total - approved - na) / daysRemaining)
      : null;

    // By section
    const bySectionMap = new Map<string, { total: number; approved: number; code: string }>();
    items.forEach(item => {
      const existing = bySectionMap.get(item.sectionCode) || { total: 0, approved: 0, code: item.sectionCode };
      existing.total++;
      if (item.status === "approved") existing.approved++;
      bySectionMap.set(item.sectionCode, existing);
    });
    const bySection = Array.from(bySectionMap.values()).sort((a, b) => {
      const aScore = a.total > 0 ? a.approved / a.total : 1;
      const bScore = b.total > 0 ? b.approved / b.total : 1;
      return aScore - bScore;
    });

    // By responsible
    const byResponsible = new Map<string, number>();
    items.filter(i => i.responsible && i.status !== "approved").forEach(i => {
      byResponsible.set(i.responsible!, (byResponsible.get(i.responsible!) || 0) + 1);
    });

    return { total, approved, pending, rejected, notVerified, na, applicable, score,
      withResponsible, withDeadline, selected, daysRemaining, itemsPerDay, bySection,
      byResponsible: Array.from(byResponsible.entries()).sort((a, b) => b[1] - a[1]) };
  }, [items, targetDate]);

  // Filter + sort
  const filteredItems = useMemo(() => {
    let result = items;
    if (filterStatus !== "all") result = result.filter(i => i.status === filterStatus);
    if (filterET !== "all") result = result.filter(i => i.etRef === filterET);
    if (filterResponsible !== "all") {
      result = filterResponsible === "unassigned"
        ? result.filter(i => !i.responsible)
        : result.filter(i => i.responsible === filterResponsible);
    }
    return result.sort((a, b) => {
      if (sortBy === "ref") return a.ref.localeCompare(b.ref);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return a.sectionCode.localeCompare(b.sectionCode);
    });
  }, [items, filterStatus, filterET, filterResponsible, sortBy]);

  // Select all visible
  const toggleSelectAll = () => {
    const visibleIds = new Set(filteredItems.map(i => i.id));
    const allSelected = filteredItems.every(i => i.selected);
    setItems(prev => prev.map(i => visibleIds.has(i.id) ? { ...i, selected: !allSelected } : i));
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  };

  // Bulk apply
  const applyBulkStatus = () => {
    const selectedIds = new Set(items.filter(i => i.selected).map(i => i.id));
    if (selectedIds.size === 0) { toast.error("Selecione itens primeiro"); return; }
    setItems(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, status: bulkStatus, selected: false } : i));
    toast.success(`${selectedIds.size} itens atualizados para ${STATUS_CONFIG[bulkStatus].label}`);
  };

  const applyBulkResponsible = () => {
    const selectedIds = new Set(items.filter(i => i.selected).map(i => i.id));
    if (selectedIds.size === 0 || !bulkResponsible) { toast.error("Selecione itens e responsável"); return; }
    setItems(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, responsible: bulkResponsible, selected: false } : i));
    toast.success(`${selectedIds.size} itens atribuídos a ${bulkResponsible}`);
  };

  const applyBulkDeadline = () => {
    const selectedIds = new Set(items.filter(i => i.selected).map(i => i.id));
    if (selectedIds.size === 0 || !bulkDeadline) { toast.error("Selecione itens e prazo"); return; }
    setItems(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, deadline: bulkDeadline, selected: false } : i));
    toast.success(`Prazo definido para ${selectedIds.size} itens`);
  };

  // Export
  const exportCSV = () => {
    const headers = ["REF", "Seção", "ET", "Status", "Responsável", "Prazo", "Pendência", "Questão"];
    const rows = items.map(i => [i.ref, i.sectionCode, i.etRef, STATUS_CONFIG[i.status].label, i.responsible || "", i.deadline || "", `"${i.pendency}"`, `"${i.question}"`].join(","));
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lvs-bulk-actions.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  return (
    <div className="space-y-4">
      {/* Countdown + Score */}
      <div className="grid md:grid-cols-4 gap-3">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Timer className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">Countdown para Aceitação</span>
            </div>
            <div className="flex items-center gap-3">
              <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="max-w-[200px]" />
              {stats.daysRemaining !== null && (
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${stats.daysRemaining <= 7 ? "text-destructive" : stats.daysRemaining <= 30 ? "text-warning" : "text-success"}`}>
                    {stats.daysRemaining}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    <div>dias restantes</div>
                    {stats.itemsPerDay && <div className="text-warning">{stats.itemsPerDay} itens/dia necessários</div>}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className={`text-3xl font-bold ${stats.score >= 80 ? "text-success" : stats.score >= 50 ? "text-warning" : "text-destructive"}`}>
              {stats.score}%
            </div>
            <div className="text-xs text-muted-foreground">Score Geral</div>
            <Progress value={stats.score} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-3xl font-bold text-primary">{stats.withResponsible}</div>
            <div className="text-xs text-muted-foreground">Com responsável</div>
            <div className="text-[10px] text-warning mt-1">{stats.total - stats.withResponsible} sem atribuição</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress by Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Progresso por Seção</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {stats.bySection.map(sec => {
              const pct = sec.total > 0 ? Math.round((sec.approved / sec.total) * 100) : 0;
              return (
                <div key={sec.code} className="text-center">
                  <div className="text-xs font-medium">{sec.code}</div>
                  <Progress value={pct} className={`h-1.5 mt-1 ${pct === 100 ? "[&>div]:bg-success" : pct >= 50 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"}`} />
                  <div className="text-[10px] text-muted-foreground mt-0.5">{sec.approved}/{sec.total}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workload by Responsible */}
      {stats.byResponsible.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Carga de Trabalho por Responsável</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.byResponsible.map(([name, count]) => (
                <Badge key={name} variant="outline" className="gap-1">
                  {name}: <span className="font-bold text-warning">{count} pendentes</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterET} onValueChange={setFilterET}>
              <SelectTrigger className="w-36"><SelectValue placeholder="ET" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas ETs</SelectItem>
                <SelectItem value="ET-PLL-017">ET-PLL-017</SelectItem>
                <SelectItem value="ET-ROV-001">ET-ROV-001</SelectItem>
                <SelectItem value="ET-RSV-028">ET-RSV-028</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResponsible} onValueChange={setFilterResponsible}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Responsável" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unassigned">Sem responsável</SelectItem>
                {RESPONSIBLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "section" ? "status" : sortBy === "status" ? "ref" : "section")}>
              <ArrowUpDown className="h-3.5 w-3.5 mr-1" /> {sortBy === "section" ? "Seção" : sortBy === "status" ? "Status" : "REF"}
            </Button>

            <div className="flex-1" />

            <Badge variant="secondary">{stats.selected} selecionados</Badge>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-3.5 w-3.5 mr-1" /> CSV</Button>
            <Button size="sm" onClick={() => setShowBulkBar(!showBulkBar)}>
              <Zap className="h-3.5 w-3.5 mr-1" /> Ações em Massa {showBulkBar ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {showBulkBar && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Alterar Status ({stats.selected})</label>
                <div className="flex gap-1.5">
                  <Select value={bulkStatus} onValueChange={v => setBulkStatus(v as ItemStatus)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-8" onClick={applyBulkStatus}><CheckCircle2 className="h-3 w-3 mr-1" /> Aplicar</Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Atribuir Responsável</label>
                <div className="flex gap-1.5">
                  <Select value={bulkResponsible} onValueChange={setBulkResponsible}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {RESPONSIBLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-8" onClick={applyBulkResponsible}><UserPlus className="h-3 w-3 mr-1" /> Aplicar</Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Definir Prazo</label>
                <div className="flex gap-1.5">
                  <Input type="date" className="h-8" value={bulkDeadline} onChange={e => setBulkDeadline(e.target.value)} />
                  <Button size="sm" className="h-8" onClick={applyBulkDeadline}><Calendar className="h-3 w-3 mr-1" /> Aplicar</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 p-3 border-b">
            <Checkbox checked={filteredItems.length > 0 && filteredItems.every(i => i.selected)} onCheckedChange={toggleSelectAll} />
            <span className="text-xs text-muted-foreground">Selecionar todos ({filteredItems.length})</span>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="divide-y">
              {filteredItems.map(item => {
                const cfg = STATUS_CONFIG[item.status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                    <Checkbox checked={item.selected} onCheckedChange={() => toggleItem(item.id)} />
                    <StatusIcon className={`h-4 w-4 shrink-0 ${cfg.color.split(" ")[1]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] shrink-0">{item.ref}</Badge>
                        <span className="text-xs truncate">{item.question}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-muted-foreground">{item.sectionCode}</span>
                        <span className="text-[9px] text-muted-foreground">{item.etRef}</span>
                        {item.responsible && <Badge variant="secondary" className="text-[8px] h-3.5">{item.responsible}</Badge>}
                        {item.deadline && <span className="text-[9px] text-warning">{new Date(item.deadline).toLocaleDateString("pt-BR")}</span>}
                      </div>
                    </div>
                    <Badge className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">Nenhum item encontrado com os filtros atuais</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
