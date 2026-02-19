/**
 * Demurrage Calculator - BIMCO-standard demurrage/despatch calculation
 * Integrates with CommercialOperationsHub as a new tab
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Calculator, Download, Clock, DollarSign, AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";

interface TimeEntry {
  id: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  excluded: boolean;
  reason: string;
}

export function DemurrageCalculatorTab() {
  const [laytimeAllowed, setLaytimeAllowed] = useState("72");
  const [demurrageRate, setDemurrageRate] = useState("25000");
  const [despatchRate, setDespatchRate] = useState("12500");
  const [despatchType, setDespatchType] = useState<"half" | "full" | "custom">("half");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    { id: "1", description: "NOR Tendered", startDate: "2025-03-01", startTime: "06:00", endDate: "2025-03-01", endTime: "18:00", excluded: false, reason: "" },
    { id: "2", description: "Loading commenced", startDate: "2025-03-01", startTime: "18:00", endDate: "2025-03-03", endTime: "06:00", excluded: false, reason: "" },
    { id: "3", description: "Rain stoppage", startDate: "2025-03-02", startTime: "10:00", endDate: "2025-03-02", endTime: "14:00", excluded: true, reason: "Weather" },
    { id: "4", description: "Loading completed", startDate: "2025-03-03", startTime: "06:00", endDate: "2025-03-04", endTime: "12:00", excluded: false, reason: "" },
  ]);

  const addEntry = () => {
    setTimeEntries([...timeEntries, {
      id: Date.now().toString(), description: "", startDate: "", startTime: "00:00",
      endDate: "", endTime: "00:00", excluded: false, reason: "",
    }]);
  };

  const removeEntry = (id: string) => setTimeEntries(timeEntries.filter(e => e.id !== id));

  const updateEntry = (id: string, field: keyof TimeEntry, value: string | boolean) => {
    setTimeEntries(timeEntries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // Calculate laytime used
  const calcHours = (entry: TimeEntry): number => {
    if (!entry.startDate || !entry.endDate) return 0;
    const start = new Date(`${entry.startDate}T${entry.startTime}`);
    const end = new Date(`${entry.endDate}T${entry.endTime}`);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  const totalHours = timeEntries.filter(e => !e.excluded).reduce((s, e) => s + calcHours(e), 0);
  const excludedHours = timeEntries.filter(e => e.excluded).reduce((s, e) => s + calcHours(e), 0);
  const laytimeHrs = parseFloat(laytimeAllowed) || 0;
  const demRate = parseFloat(demurrageRate) || 0;
  const desRate = despatchType === "half" ? demRate / 2 : despatchType === "full" ? demRate : (parseFloat(despatchRate) || 0);

  const difference = totalHours - laytimeHrs;
  const isDemurrage = difference > 0;
  const amount = Math.abs(difference / 24) * (isDemurrage ? demRate : desRate);

  const exportCSV = () => {
    const header = "Description,Start,End,Hours,Excluded,Reason\n";
    const rows = timeEntries.map(e =>
      `"${e.description}",${e.startDate} ${e.startTime},${e.endDate} ${e.endTime},${calcHours(e).toFixed(1)},${e.excluded},${e.reason}`
    ).join("\n");
    const summary = `\n\nLaytime Allowed (hrs),${laytimeHrs}\nTime Used (hrs),${totalHours.toFixed(1)}\nExcluded (hrs),${excludedHours.toFixed(1)}\nDifference (hrs),${difference.toFixed(1)}\n${isDemurrage ? 'Demurrage' : 'Despatch'} (USD),${amount.toFixed(2)}`;
    const blob = new Blob([header + rows + summary], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "demurrage_calculation.csv"; a.click();
    toast.success("Cálculo exportado!");
  };

  return (
    <div className="space-y-4">
      {/* Setup */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 space-y-1">
          <Label className="text-xs">Laytime Allowed (hrs)</Label>
          <Input type="number" value={laytimeAllowed} onChange={e => setLaytimeAllowed(e.target.value)} />
        </CardContent></Card>
        <Card><CardContent className="p-3 space-y-1">
          <Label className="text-xs">Demurrage Rate (USD/day)</Label>
          <Input type="number" value={demurrageRate} onChange={e => setDemurrageRate(e.target.value)} />
        </CardContent></Card>
        <Card><CardContent className="p-3 space-y-1">
          <Label className="text-xs">Despatch Type</Label>
          <Select value={despatchType} onValueChange={(v: any) => setDespatchType(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="half">Half Demurrage</SelectItem>
              <SelectItem value="full">Full Demurrage</SelectItem>
              <SelectItem value="custom">Custom Rate</SelectItem>
            </SelectContent>
          </Select>
        </CardContent></Card>
        {despatchType === "custom" && (
          <Card><CardContent className="p-3 space-y-1">
            <Label className="text-xs">Despatch Rate (USD/day)</Label>
            <Input type="number" value={despatchRate} onChange={e => setDespatchRate(e.target.value)} />
          </CardContent></Card>
        )}
      </div>

      {/* Time entries */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Statement of Facts</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={addEntry}><Plus className="h-3 w-3 mr-1" />Adicionar</Button>
              <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3 w-3 mr-1" />CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">Descrição</th>
                  <th className="text-left p-2 font-medium">Início</th>
                  <th className="text-left p-2 font-medium">Fim</th>
                  <th className="text-right p-2 font-medium">Horas</th>
                  <th className="text-center p-2 font-medium">Excluído</th>
                  <th className="text-left p-2 font-medium">Motivo</th>
                  <th className="p-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {timeEntries.map(entry => (
                  <tr key={entry.id} className={entry.excluded ? "bg-muted/30 opacity-70" : ""}>
                    <td className="p-2"><Input className="h-7 text-xs" value={entry.description} onChange={e => updateEntry(entry.id, "description", e.target.value)} /></td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Input type="date" className="h-7 text-xs w-28" value={entry.startDate} onChange={e => updateEntry(entry.id, "startDate", e.target.value)} />
                        <Input type="time" className="h-7 text-xs w-20" value={entry.startTime} onChange={e => updateEntry(entry.id, "startTime", e.target.value)} />
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Input type="date" className="h-7 text-xs w-28" value={entry.endDate} onChange={e => updateEntry(entry.id, "endDate", e.target.value)} />
                        <Input type="time" className="h-7 text-xs w-20" value={entry.endTime} onChange={e => updateEntry(entry.id, "endTime", e.target.value)} />
                      </div>
                    </td>
                    <td className="p-2 text-right font-mono">{calcHours(entry).toFixed(1)}</td>
                    <td className="p-2 text-center">
                      <input type="checkbox" checked={entry.excluded} onChange={e => updateEntry(entry.id, "excluded", e.target.checked)} />
                    </td>
                    <td className="p-2"><Input className="h-7 text-xs" placeholder="Motivo..." value={entry.reason} onChange={e => updateEntry(entry.id, "reason", e.target.value)} disabled={!entry.excluded} /></td>
                    <td className="p-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeEntry(entry.id)}><Trash2 className="h-3 w-3" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      <Card className={isDemurrage ? "border-destructive/30 bg-destructive/5" : "border-success/30 bg-success/5"}>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Laytime Allowed</div>
              <div className="text-lg font-bold">{laytimeHrs}h</div>
              <div className="text-[10px] text-muted-foreground">{(laytimeHrs / 24).toFixed(1)} days</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Time Used</div>
              <div className="text-lg font-bold">{totalHours.toFixed(1)}h</div>
              <div className="text-[10px] text-muted-foreground">{(totalHours / 24).toFixed(1)} days</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Excluded</div>
              <div className="text-lg font-bold text-muted-foreground">{excludedHours.toFixed(1)}h</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Difference</div>
              <div className={`text-lg font-bold ${isDemurrage ? "text-destructive" : "text-success"}`}>
                {isDemurrage ? "+" : "-"}{Math.abs(difference).toFixed(1)}h
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                {isDemurrage ? <AlertTriangle className="h-3 w-3 text-destructive" /> : <CheckCircle2 className="h-3 w-3 text-success" />}
                {isDemurrage ? "DEMURRAGE" : "DESPATCH"}
              </div>
              <div className={`text-xl font-bold ${isDemurrage ? "text-destructive" : "text-success"}`}>
                ${amount.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-muted-foreground">@ ${isDemurrage ? demRate.toLocaleString() : desRate.toLocaleString()}/day</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
