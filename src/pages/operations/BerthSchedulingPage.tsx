import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Anchor, Ship, MapPin, Plus, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MOCK_BERTHS = [
  { id: "B-01", name: "Berth Alpha", terminal: "Terminal Norte", maxLOA: 300, maxDraft: 16, status: "occupied", vessel: "MV Atlantic Star", eta: "2026-02-24 08:00", etd: "2026-02-25 14:00", cargo: "Crude Oil", utilization: 85 },
  { id: "B-02", name: "Berth Bravo", terminal: "Terminal Norte", maxLOA: 250, maxDraft: 14, status: "available", vessel: null, eta: null, etd: null, cargo: null, utilization: 62 },
  { id: "B-03", name: "Berth Charlie", terminal: "Terminal Sul", maxLOA: 350, maxDraft: 18, status: "maintenance", vessel: null, eta: null, etd: null, cargo: null, utilization: 0 },
  { id: "B-04", name: "Berth Delta", terminal: "Terminal Sul", maxLOA: 280, maxDraft: 15, status: "occupied", vessel: "MV Pacific Voyager", eta: "2026-02-23 06:00", etd: "2026-02-24 20:00", cargo: "LNG", utilization: 91 },
  { id: "B-05", name: "Berth Echo", terminal: "Terminal Leste", maxLOA: 200, maxDraft: 12, status: "reserved", vessel: "MV Nordic Spirit", eta: "2026-02-25 10:00", etd: "2026-02-26 18:00", cargo: "Containers", utilization: 45 },
];

const MOCK_QUEUE = [
  { vessel: "MV Ocean Pride", eta: "2026-02-24 14:00", loa: 245, draft: 13.5, cargo: "Dry Bulk", priority: "high", requestedBerth: "B-02" },
  { vessel: "MV Sea Dragon", eta: "2026-02-25 06:00", loa: 190, draft: 11.2, cargo: "General", priority: "normal", requestedBerth: "B-05" },
  { vessel: "MV Coral Reef", eta: "2026-02-26 08:00", loa: 310, draft: 15.8, cargo: "Crude Oil", priority: "urgent", requestedBerth: "B-01" },
];

const statusColors: Record<string, string> = {
  occupied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  available: "bg-green-500/20 text-green-400 border-green-500/30",
  maintenance: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  reserved: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  normal: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function BerthSchedulingPage() {
  const [selectedTerminal, setSelectedTerminal] = useState("all");

  const filteredBerths = selectedTerminal === "all" 
    ? MOCK_BERTHS 
    : MOCK_BERTHS.filter(b => b.terminal === selectedTerminal);

  const totalBerths = MOCK_BERTHS.length;
  const occupiedBerths = MOCK_BERTHS.filter(b => b.status === "occupied").length;
  const avgUtilization = Math.round(MOCK_BERTHS.reduce((a, b) => a + b.utilization, 0) / totalBerths);

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Anchor className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Berços</p>
                <p className="text-2xl font-bold">{totalBerths}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Ship className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Ocupados</p>
                <p className="text-2xl font-bold">{occupiedBerths}/{totalBerths}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Utilização Média</p>
                <p className="text-2xl font-bold">{avgUtilization}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-sm text-muted-foreground">Fila de Espera</p>
                <p className="text-2xl font-bold">{MOCK_QUEUE.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="berths">
        <TabsList>
          <TabsTrigger value="berths">Berços</TabsTrigger>
          <TabsTrigger value="queue">Fila de Espera</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="berths" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Terminal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Terminais</SelectItem>
                <SelectItem value="Terminal Norte">Terminal Norte</SelectItem>
                <SelectItem value="Terminal Sul">Terminal Sul</SelectItem>
                <SelectItem value="Terminal Leste">Terminal Leste</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Buscar berço..." className="max-w-xs" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBerths.map(berth => (
              <Card key={berth.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{berth.name}</CardTitle>
                    <Badge className={statusColors[berth.status]}>{berth.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {berth.terminal}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Max LOA:</span> {berth.maxLOA}m</div>
                    <div><span className="text-muted-foreground">Max Draft:</span> {berth.maxDraft}m</div>
                  </div>
                  {berth.vessel && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                      <p className="font-medium flex items-center gap-1"><Ship className="h-3 w-3" /> {berth.vessel}</p>
                      <p className="text-xs text-muted-foreground">Cargo: {berth.cargo}</p>
                      <p className="text-xs text-muted-foreground">ETA: {berth.eta}</p>
                      <p className="text-xs text-muted-foreground">ETD: {berth.etd}</p>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Utilização</span>
                      <span>{berth.utilization}%</span>
                    </div>
                    <Progress value={berth.utilization} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Embarcação</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>LOA / Draft</TableHead>
                    <TableHead>Carga</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Berço Solicitado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_QUEUE.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.vessel}</TableCell>
                      <TableCell>{item.eta}</TableCell>
                      <TableCell>{item.loa}m / {item.draft}m</TableCell>
                      <TableCell>{item.cargo}</TableCell>
                      <TableCell><Badge className={priorityColors[item.priority]}>{item.priority}</Badge></TableCell>
                      <TableCell>{item.requestedBerth}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"><CheckCircle2 className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline"><AlertTriangle className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Gantt visual dos berços nas próximas 72h</p>
                {MOCK_BERTHS.map(berth => (
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
                      {berth.status === "maintenance" && (
                        <div className="absolute left-0 w-full h-full bg-orange-500/20 rounded flex items-center justify-center text-xs text-orange-300">
                          🔧 Manutenção
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex gap-6 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500/40 rounded" /> Ocupado</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500/40 rounded" /> Reservado</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500/20 rounded" /> Manutenção</span>
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
