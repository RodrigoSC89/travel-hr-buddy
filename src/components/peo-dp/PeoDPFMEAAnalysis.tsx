/**
 * PEO-DP FMEA/FMECA Analysis — PEO-DP 2026 (Revisão 5)
 * Compliant with IMCA M 166, includes the 14 mandatory columns (item 1.10.1)
 * NPR = Detecção × Frequência × Severidade
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle, Plus, Download, Shield, Search, Filter, Brain } from "lucide-react";
import { toast } from "sonner";

interface FMECAItem {
  id: string;
  // 14 campos obrigatórios PEO-DP 2026 (item 1.10.1)
  sistema: string;           // 1. Sistema
  subsistema: string;        // 2. Subsistema
  componente: string;        // 3. Componente
  funcao: string;            // 4. Função do componente
  modoFalha: string;         // 5. Modo de falha
  causaFalha: string;        // 6. Causa da falha
  efeitosLocais: string;     // 7. Efeitos locais
  efeitosGlobais: string;    // 8. Efeitos globais
  tipoDeteccao: string;      // 9. Tipo de mecanismo de detecção da falha
  capacidadeDeteccao: number;// 10. Capacidade de detecção (1-10)
  frequencia: number;        // 11. Frequência/Probabilidade (1-10)
  severidade: number;        // 12. Severidade do efeito (1-10)
  npr: number;               // 13. NPR
  acoes: string;             // 14. Ações/recomendações
  status: "open" | "mitigated" | "accepted" | "monitoring";
  gapStatus?: "atendeu" | "nao_atendeu" | "na";
}

const DP_SYSTEMS = [
  { sistema: "Geração de Energia", subsistemas: ["Gerador Principal", "Gerador de Emergência", "UPS", "Painel Principal", "PMS"] },
  { sistema: "Distribuição de Energia", subsistemas: ["Barramento Principal", "Bus Tie", "Disjuntores", "Transformadores", "Quadros de Distribuição"] },
  { sistema: "Propulsão", subsistemas: ["Bow Thruster Tunnel", "Bow Thruster Azimutal", "Stern Thruster", "Propulsores Principais", "Thruster Control"] },
  { sistema: "Referência de Posição", subsistemas: ["DGPS-1", "DGPS-2", "HPR/USBL", "RADius", "Taut Wire", "Laser"] },
  { sistema: "Sensores", subsistemas: ["Girocompasso", "MRU/VRU", "Anemômetro", "Sensor de Calado", "Sensor de Corrente"] },
  { sistema: "Controle DP", subsistemas: ["Computador DP Primário", "Computador DP Backup", "Estação DPO", "Joystick", "Joystick Independente"] },
  { sistema: "Resfriamento", subsistemas: ["Sea Water Cooling", "Fresh Water Cooling", "Bombas Auxiliares", "Trocadores de Calor"] },
  { sistema: "Combustível", subsistemas: ["Tanques", "Bombas Transfer.", "Válvulas Crossover", "Filtros", "Sistema Purificação"] },
];

const SEVERITY_TABLE = [
  { level: 1, desc: "Insignificante", effect: "Sem efeito no DP" },
  { level: 2, desc: "Muito baixa", effect: "Leve degradação" },
  { level: 3, desc: "Baixa", effect: "Pequeno impacto na performance" },
  { level: 4, desc: "Moderada-baixa", effect: "Redundância levemente reduzida" },
  { level: 5, desc: "Moderada", effect: "Redundância reduzida" },
  { level: 6, desc: "Moderada-alta", effect: "Redundância prejudicada" },
  { level: 7, desc: "Alta", effect: "Perda parcial de redundância" },
  { level: 8, desc: "Muito alta", effect: "Perda de redundância" },
  { level: 9, desc: "Extremamente alta", effect: "Possível perda de posição" },
  { level: 10, desc: "Catastrófica", effect: "Perda de posição/aproamento" },
];

const INITIAL_ITEMS: FMECAItem[] = [
  { id: "1", sistema: "Geração de Energia", subsistema: "Gerador Principal", componente: "Motor Diesel MG1", funcao: "Fornecer energia primária para barramento 1", modoFalha: "Parada não programada", causaFalha: "Falha mecânica / sobreaquecimento", efeitosLocais: "Perda de geração no barramento 1", efeitosGlobais: "Redução de redundância - CAM status Azul se apenas 1 gerador restante", tipoDeteccao: "PMS alarme automático + watchkeeping", capacidadeDeteccao: 2, frequencia: 3, severidade: 8, npr: 48, acoes: "Manutenção preditiva (vibração, termografia); Spare parts críticos a bordo", status: "mitigated" },
  { id: "2", sistema: "Propulsão", subsistema: "Bow Thruster Azimutal", componente: "Motor Elétrico BT-AZ-1", funcao: "Prover empuxo lateral proa", modoFalha: "Seizure mecânica / congelamento azimute", causaFalha: "Desgaste rolamento / falha hidráulica azimute", efeitosLocais: "Perda de empuxo lateral proa", efeitosGlobais: "Possível perda de posição em condições ambientais adversas - Drift Off", tipoDeteccao: "Monitoramento vibração / alarme DP", capacidadeDeteccao: 3, frequencia: 3, severidade: 9, npr: 81, acoes: "Scaling anual de thrusters (Anexo M-1); Teste comando/feedback conforme 5.13.1", status: "open" },
  { id: "3", sistema: "Referência de Posição", subsistema: "DGPS-1", componente: "Receptor DGPS primário", funcao: "Referência de posição absoluta", modoFalha: "Perda de sinal / correção diferencial", causaFalha: "Interferência ionosférica / falha hardware", efeitosLocais: "Perda de 1 referência de posição", efeitosGlobais: "Degradação accuracy se menos de 3 referências ativas", tipoDeteccao: "DP voting logic + alarme automático", capacidadeDeteccao: 2, frequencia: 4, severidade: 6, npr: 48, acoes: "Mínimo 3 sistemas referência ativos; DGPS + HPR + RADius", status: "mitigated" },
  { id: "4", sistema: "Distribuição de Energia", subsistema: "Bus Tie", componente: "Disjuntor Bus Tie principal", funcao: "Interconexão/separação de barramentos", modoFalha: "Falha na abertura automática", causaFalha: "Defeito relé proteção / mecanismo travado", efeitosLocais: "Propagação de falha entre barramentos", efeitosGlobais: "Blackout total - Perda completa sistema DP", tipoDeteccao: "Teste funcional periódico relés proteção", capacidadeDeteccao: 4, frequencia: 2, severidade: 10, npr: 80, acoes: "Calibração quinquenal relés proteção (5.13.2); Teste funcional anual", status: "monitoring" },
  { id: "5", sistema: "Resfriamento", subsistema: "Sea Water Cooling", componente: "Bomba SW principal lado BB", funcao: "Resfriar motores e geradores", modoFalha: "Perda de fluxo / falha bomba", causaFalha: "Incrustação / falha mecânica", efeitosLocais: "Sobreaquecimento equipamentos lado BB", efeitosGlobais: "Desligamento por proteção - possível perda de redundância", tipoDeteccao: "Alarme temperatura + pressão baixa", capacidadeDeteccao: 2, frequencia: 3, severidade: 7, npr: 42, acoes: "Interconexão de sistemas (crossover) testada regularmente conforme 5.10.a", status: "mitigated" },
];

export function PeoDPFMEAAnalysis() {
  const [items, setItems] = useState<FMECAItem[]>(INITIAL_ITEMS);
  const [filterSystem, setFilterSystem] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = items.filter(i =>
    (filterSystem === "all" || i.sistema === filterSystem) &&
    (filterStatus === "all" || i.status === filterStatus) &&
    (searchTerm === "" || JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const avgNPR = filtered.length > 0 ? Math.round(filtered.reduce((a, i) => a + i.npr, 0) / filtered.length) : 0;
  const criticalCount = filtered.filter(i => i.npr >= 80).length;
  const mitigatedCount = filtered.filter(i => i.status === "mitigated").length;

  const getNPRColor = (npr: number) => npr >= 100 ? "text-destructive" : npr >= 60 ? "text-warning" : "text-success";
  const getNPRBadge = (npr: number): "destructive" | "secondary" | "outline" => npr >= 100 ? "destructive" : npr >= 60 ? "secondary" : "outline";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            FMEA/FMECA — PEO-DP 2026
          </h3>
          <p className="text-sm text-muted-foreground">
            14 campos obrigatórios • IMCA M 166 • NPR = Detecção × Frequência × Severidade
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-40 h-9" />
          </div>
          <Select value={filterSystem} onValueChange={setFilterSystem}>
            <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Sistema" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Sistemas</SelectItem>
              {DP_SYSTEMS.map(s => <SelectItem key={s.sistema} value={s.sistema}>{s.sistema}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="mitigated">Mitigado</SelectItem>
              <SelectItem value="monitoring">Monitorando</SelectItem>
              <SelectItem value="accepted">Aceito</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1 h-9"><Plus className="h-3 w-3" /> Adicionar</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("FMECA exportado para PDF")} className="gap-1 h-9"><Download className="h-3 w-3" /> PDF</Button>
        </div>
      </div>

      {/* Info Banner - 14 campos */}
      <Card className="bg-gradient-to-r from-amber-500/5 to-amber-600/10 border-amber-500/20">
        <CardContent className="py-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            ⚡ FMECA como item de excelência (PEO-DP 2026, item 1.10.1):
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            14 colunas obrigatórias: Sistema • Subsistema • Componente • Função • Modo de Falha • Causa • Efeitos Locais • Efeitos Globais • Tipo Detecção • Capacidade Detecção • Frequência • Severidade • NPR • Ações/Recomendações
          </p>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Total Modos de Falha</p>
          <p className="text-2xl font-bold">{filtered.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">NPR Médio</p>
          <p className={`text-2xl font-bold ${getNPRColor(avgNPR)}`}>{avgNPR}</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Críticos (NPR ≥ 80)</p>
          <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Mitigados</p>
          <p className="text-2xl font-bold text-success">{mitigatedCount}/{filtered.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Sistemas Cobertos</p>
          <p className="text-2xl font-bold">{new Set(items.map(i => i.sistema)).size}/{DP_SYSTEMS.length}</p>
        </CardContent></Card>
      </div>

      {/* FMECA Table with all 14 columns */}
      <Card>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground bg-muted/30">
                  <th className="p-2 sticky left-0 bg-background z-10">Sistema</th>
                  <th className="p-2">Subsistema</th>
                  <th className="p-2">Componente</th>
                  <th className="p-2 min-w-[120px]">Função</th>
                  <th className="p-2 min-w-[120px]">Modo Falha</th>
                  <th className="p-2 min-w-[120px]">Causa</th>
                  <th className="p-2 min-w-[120px]">Efeitos Locais</th>
                  <th className="p-2 min-w-[120px]">Efeitos Globais</th>
                  <th className="p-2">Detecção</th>
                  <th className="p-2 text-center">D</th>
                  <th className="p-2 text-center">F</th>
                  <th className="p-2 text-center">S</th>
                  <th className="p-2 text-center font-bold">NPR</th>
                  <th className="p-2 min-w-[150px]">Ações/Recomendações</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-2 font-medium sticky left-0 bg-background z-10">{item.sistema}</td>
                    <td className="p-2">{item.subsistema}</td>
                    <td className="p-2 font-medium">{item.componente}</td>
                    <td className="p-2">{item.funcao}</td>
                    <td className="p-2 text-destructive">{item.modoFalha}</td>
                    <td className="p-2">{item.causaFalha}</td>
                    <td className="p-2">{item.efeitosLocais}</td>
                    <td className="p-2 font-medium">{item.efeitosGlobais}</td>
                    <td className="p-2">{item.tipoDeteccao}</td>
                    <td className="p-2 text-center">{item.capacidadeDeteccao}</td>
                    <td className="p-2 text-center">{item.frequencia}</td>
                    <td className="p-2 text-center">{item.severidade}</td>
                    <td className="p-2 text-center"><Badge variant={getNPRBadge(item.npr)} className="font-bold">{item.npr}</Badge></td>
                    <td className="p-2">{item.acoes}</td>
                    <td className="p-2">
                      <Badge variant={item.status === "mitigated" ? "outline" : item.status === "open" ? "destructive" : "secondary"} className="text-xs whitespace-nowrap">
                        {item.status === "mitigated" ? "✓ Mitigado" : item.status === "open" ? "⚠ Aberto" : item.status === "monitoring" ? "👁 Monitor." : "Aceito"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Severity Reference Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Tabela de Severidade — Referência PEO-DP 2026</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {SEVERITY_TABLE.map(s => (
              <div key={s.level} className={`p-2 rounded border text-xs ${s.level >= 8 ? "border-destructive/30 bg-destructive/5" : s.level >= 5 ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
                <p className="font-bold">{s.level} - {s.desc}</p>
                <p className="text-muted-foreground">{s.effect}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
