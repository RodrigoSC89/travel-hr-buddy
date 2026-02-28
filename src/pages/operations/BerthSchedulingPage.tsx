/**
 * BerthSchedulingPage - Berth allocation from port_calls + vessels
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Anchor, Ship, MapPin, Plus, AlertTriangle, CheckCircle2, BarChart3, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Berth {
  id: string;
  name: string;
  terminal: string;
  status: string;
  vessel: string | null;
  eta: string | null;
  etd: string | null;
  cargo: string | null;
}

const statusColors: Record<string, string> = {
  occupied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  available: "bg-green-500/20 text-green-400 border-green-500/30",
  maintenance: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  reserved: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function BerthSchedulingPage() {
  const [selectedTerminal, setSelectedTerminal] = useState("all");

  const { data: portCalls = [], isLoading } = useQuery({
    queryKey: ["berth-port-calls"],
    queryFn: async () => {
      const { data } = await supabase
        .from("port_calls")
        .select("*, vessels(name)")
        .order("eta", { ascending: true })
        .limit(30);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const berths: Berth[] = useMemo(() => {
    if (portCalls.length === 0) return [];
    const terminals = ["Terminal Norte", "Terminal Sul", "Terminal Leste"];
    return portCalls.map((pc, i) => ({
      id: `B-${String(i + 1).padStart(2, "0")}`,
      name: `Berth ${String.fromCharCode(65 + (i % 8))}`,
      terminal: terminals[i % terminals.length],
      status: pc.status === "completed" ? "available" : pc.status === "in_progress" ? "occupied" : "reserved",
      vessel: ((pc.vessels as Record<string, unknown> | null)?.name as string) || null,
      eta: pc.eta ? new Date(pc.eta).toLocaleString("pt-BR") : null,
      etd: pc.etd ? new Date(pc.etd).toLocaleString("pt-BR") : null,
      cargo: String((pc as Record<string, unknown>).cargo_type || (pc as Record<string, unknown>).purpose || "General"),
    }));
  }, [portCalls]);

  const filteredBerths = selectedTerminal === "all"
    ? berths
    : berths.filter(b => b.terminal === selectedTerminal);

  const totalBerths = berths.length || 0;
  const occupiedBerths = berths.filter(b => b.status === "occupied").length;
  const avgUtilization = totalBerths > 0 ? Math.round((occupiedBerths / totalBerths) * 100) : 0;
  const queueCount = berths.filter(b => b.status === "reserved").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Anchor className="h-6 w-6 text-primary" />
            Berth Scheduling
          </h1>
          <p className="text-muted-foreground">Planejamento e alocação de berços portuários</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Reserva</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Anchor className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Total Berços</p><p className="text-2xl font-bold">{isLoading ? "..." : totalBerths}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Ship className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Ocupados</p><p className="text-2xl font-bold">{isLoading ? "..." : `${occupiedBerths}/${totalBerths}`}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><BarChart3 className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Utilização Média</p><p className="text-2xl font-bold">{isLoading ? "..." : `${avgUtilization}%`}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-orange-400" /><div><p className="text-sm text-muted-foreground">Fila de Espera</p><p className="text-2xl font-bold">{isLoading ? "..." : queueCount}</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="berths">
        <TabsList>
          <TabsTrigger value="berths">Berços</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="berths" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Terminal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Terminais</SelectItem>
                <SelectItem value="Terminal Norte">Terminal Norte</SelectItem>
                <SelectItem value="Terminal Sul">Terminal Sul</SelectItem>
                <SelectItem value="Terminal Leste">Terminal Leste</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Buscar berço..." className="max-w-xs" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredBerths.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma alocação de berço encontrada. Cadastre port calls para visualizar a programação.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBerths.map(berth => (
                <Card key={berth.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{berth.name}</CardTitle>
                      <Badge className={statusColors[berth.status] || statusColors.available}>{berth.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {berth.terminal}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {berth.vessel && (
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <p className="font-medium flex items-center gap-1"><Ship className="h-3 w-3" /> {berth.vessel}</p>
                        {berth.cargo && <p className="text-xs text-muted-foreground">Cargo: {berth.cargo}</p>}
                        {berth.eta && <p className="text-xs text-muted-foreground">ETA: {berth.eta}</p>}
                        {berth.etd && <p className="text-xs text-muted-foreground">ETD: {berth.etd}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Gantt visual dos berços nas próximas 72h</p>
                {berths.map(berth => (
                  <div key={berth.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">{berth.name}</div>
                    <div className="flex-1 h-8 bg-muted/30 rounded relative overflow-hidden">
                      {berth.status === "occupied" && (
                        <div className="absolute left-[10%] w-[40%] h-full bg-blue-500/40 rounded flex items-center justify-center text-xs text-blue-200">
                          {berth.vessel}
                        </div>
                      )}
                      {berth.status === "reserved" && (
                        <div className="absolute left-[50%] w-[30%] h-full bg-purple-500/40 rounded flex items-center justify-center text-xs text-purple-200">
                          {berth.vessel}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex gap-6 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500/40 rounded" /> Ocupado</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500/40 rounded" /> Reservado</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500/20 rounded" /> Disponível</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
