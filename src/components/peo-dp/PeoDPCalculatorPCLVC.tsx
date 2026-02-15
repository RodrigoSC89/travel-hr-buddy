/**
 * Calculadora PCLVC — Preenchimento Correto das Listas de Verificação de Configuração
 * Conforme Anexo D-4 e Anexo E-4 do PEO-DP 2026
 */
import React, { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Plus, Trash2, Download, Info, Ship } from "lucide-react";
import { toast } from "sonner";

const PCLVC_TABLE: Record<number, number> = { 0: 100, 1: 85, 2: 75, 3: 55, 4: 35 };
const getScore = (errors: number) => errors >= 5 ? 0 : PCLVC_TABLE[errors] ?? 0;

interface VesselEntry {
  id: string;
  vesselName: string;
  bridgeErrors: number;
  engineRoomErrors: number;
  bridgeScore: number;
  engineScore: number;
  monthlyScore: number;
}

export function PeoDPCalculatorPCLVC() {
  const [entries, setEntries] = useState<VesselEntry[]>([
    { id: "1", vesselName: "EMBARCAÇÃO 1", bridgeErrors: 0, engineRoomErrors: 2, bridgeScore: 100, engineScore: 75, monthlyScore: 87.5 },
    { id: "2", vesselName: "EMBARCAÇÃO 2", bridgeErrors: 1, engineRoomErrors: 0, bridgeScore: 85, engineScore: 100, monthlyScore: 92.5 },
  ]);
  const [period, setPeriod] = useState("Jan/2026");

  const addEntry = () => {
    setEntries([...entries, {
      id: String(entries.length + 1),
      vesselName: `EMBARCAÇÃO ${entries.length + 1}`,
      bridgeErrors: 0, engineRoomErrors: 0,
      bridgeScore: 100, engineScore: 100, monthlyScore: 100,
    }]);
  };

  const updateEntry = (id: string, field: "vesselName" | "bridgeErrors" | "engineRoomErrors", value: string | number) => {
    setEntries(entries.map(e => {
      if (e.id !== id) return e;
      const updated = { ...e, [field]: value };
      if (field === "bridgeErrors" || field === "engineRoomErrors") {
        updated.bridgeScore = getScore(updated.bridgeErrors);
        updated.engineScore = getScore(updated.engineRoomErrors);
        updated.monthlyScore = Math.round((updated.bridgeScore + updated.engineScore) / 2 * 10) / 10;
      }
      return updated;
    }));
  };

  const removeEntry = (id: string) => setEntries(entries.filter(e => e.id !== id));

  const avgScore = entries.length > 0
    ? Math.round(entries.reduce((a, e) => a + e.monthlyScore, 0) / entries.length * 10) / 10
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Calculadora PCLVC — Anexo E-4
          </h3>
          <p className="text-sm text-muted-foreground">
            Cálculo do Indicador PCLVC • Passadiço & Praça de Máquinas
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(m =>
                <SelectItem key={m} value={`${m}/2026`}>{m}/2026</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1 h-9" onClick={addEntry}><Plus className="h-3 w-3" /> Embarcação</Button>
          <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => quickExport(entries, "PEO-DP PCLVC", "pdf")}><Download className="h-3 w-3" /> PDF</Button>
        </div>
      </div>

      {/* Score Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">PCLVC Médio — {period}</p>
            <p className={`text-3xl font-bold ${avgScore >= 85 ? "text-success" : avgScore >= 55 ? "text-warning" : "text-destructive"}`}>
              {avgScore}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Embarcações avaliadas</p>
            <p className="text-2xl font-bold">{entries.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Calculator Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">LVs CONFIGURAÇÃO — PASSADIÇO E MÁQUINAS</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-2 text-left">Embarcação</th>
                <th className="border p-2 text-center" colSpan={2}>Passadiço</th>
                <th className="border p-2 text-center" colSpan={2}>Máquinas</th>
                <th className="border p-2 text-center">Nota do Mês</th>
                <th className="border p-2 text-center w-10"></th>
              </tr>
              <tr className="bg-muted/30 text-xs">
                <th className="border p-1"></th>
                <th className="border p-1 text-center">Qtd. Erros</th>
                <th className="border p-1 text-center">Nota</th>
                <th className="border p-1 text-center">Qtd. Erros</th>
                <th className="border p-1 text-center">Nota</th>
                <th className="border p-1 text-center">Indicador</th>
                <th className="border p-1"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td className="border p-2">
                    <Input value={e.vesselName} onChange={ev => updateEntry(e.id, "vesselName", ev.target.value)} className="h-8 text-xs" />
                  </td>
                  <td className="border p-2 text-center">
                    <Input type="number" min={0} max={10} value={e.bridgeErrors} onChange={ev => updateEntry(e.id, "bridgeErrors", Number(ev.target.value))} className="h-8 w-16 mx-auto text-center text-xs" />
                  </td>
                  <td className="border p-2 text-center">
                    <Badge variant={e.bridgeScore >= 75 ? "outline" : "destructive"} className="font-bold">{e.bridgeScore}%</Badge>
                  </td>
                  <td className="border p-2 text-center">
                    <Input type="number" min={0} max={10} value={e.engineRoomErrors} onChange={ev => updateEntry(e.id, "engineRoomErrors", Number(ev.target.value))} className="h-8 w-16 mx-auto text-center text-xs" />
                  </td>
                  <td className="border p-2 text-center">
                    <Badge variant={e.engineScore >= 75 ? "outline" : "destructive"} className="font-bold">{e.engineScore}%</Badge>
                  </td>
                  <td className="border p-2 text-center">
                    <span className={`text-lg font-bold ${e.monthlyScore >= 85 ? "text-success" : e.monthlyScore >= 55 ? "text-warning" : "text-destructive"}`}>
                      {e.monthlyScore}%
                    </span>
                  </td>
                  <td className="border p-2 text-center">
                    <Button size="sm" variant="ghost" onClick={() => removeEntry(e.id)} className="h-7 w-7 p-0"><Trash2 className="h-3 w-3" /></Button>
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/50 font-bold">
                <td className="border p-2" colSpan={5}>MÉDIA PCLVC</td>
                <td className="border p-2 text-center text-lg">{avgScore}%</td>
                <td className="border p-2"></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Reference Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Info className="h-4 w-4" /> Tabela de Referência — Erros por Lista</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {[0, 1, 2, 3, 4].map(n => (
              <div key={n} className={`p-2 rounded border ${n === 0 ? "bg-success/10 border-success/30" : n <= 2 ? "bg-warning/10 border-warning/30" : "bg-destructive/10 border-destructive/30"}`}>
                <p className="font-bold text-lg">{n}</p>
                <p>erros</p>
                <p className="font-bold mt-1">{getScore(n)}%</p>
              </div>
            ))}
            <div className="p-2 rounded border bg-destructive/10 border-destructive/30">
              <p className="font-bold text-lg">≥5</p>
              <p>erros</p>
              <p className="font-bold mt-1 text-destructive">0%</p>
            </div>
            <div className="p-2 rounded border bg-destructive/10 border-destructive/30">
              <p className="font-bold text-sm">Não entrega</p>
              <p className="font-bold mt-1 text-destructive">0%</p>
              <p className="text-destructive">+ exclusão</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
