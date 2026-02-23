import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ship, ArrowLeftRight, Droplets, AlertTriangle, CheckCircle2, Clock, MapPin, Plus, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MOCK_STS_OPERATIONS = [
  { id: "STS-001", type: "Lightering", motherVessel: "VLCC Titan", serviceVessel: "Aframax Spirit", location: "Gulf of Mexico OPL", cargo: "Crude Oil", quantity: "500,000 bbl", status: "in_progress", progress: 65, startDate: "2026-02-22 14:00", fender: "Yokohama 3.3x6.5", mooring: "OCIMF Std" },
  { id: "STS-002", type: "Ship-to-Ship", motherVessel: "LNG Carrier Pearl", serviceVessel: "FSRU Horizon", location: "Singapore Strait", cargo: "LNG", quantity: "125,000 m³", status: "planned", progress: 0, startDate: "2026-02-25 06:00", fender: "Pneumatic 4.5x9", mooring: "Tandem" },
  { id: "STS-003", type: "Barging", motherVessel: "Bulk Carrier Atlas", serviceVessel: "Barge BG-112", location: "Mississippi River", cargo: "Grain", quantity: "15,000 MT", status: "completed", progress: 100, startDate: "2026-02-20 08:00", fender: "Cell Type", mooring: "Alongside" },
  { id: "STS-004", type: "Lightering", motherVessel: "Suezmax Voyager", serviceVessel: "Panamax Runner", location: "Galveston OPL", cargo: "Fuel Oil", quantity: "350,000 bbl", status: "weather_hold", progress: 30, startDate: "2026-02-23 10:00", fender: "Yokohama 2.5x5.5", mooring: "OCIMF Std" },
];

const MOCK_CHECKLIST = [
  { item: "Mooring Equipment Inspection", status: "done" },
  { item: "Fender System Deployment", status: "done" },
  { item: "Oil Spill Response Equipment Ready", status: "done" },
  { item: "Communication Plan Agreed", status: "done" },
  { item: "Weather Window Confirmed", status: "pending" },
  { item: "Cargo Transfer Plan Approved", status: "done" },
  { item: "Emergency Disconnection Procedure Reviewed", status: "pending" },
  { item: "SOPEP Equipment Verified", status: "done" },
];

const statusMap: Record<string, { label: string; color: string }> = {
  in_progress: { label: "Em Progresso", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  planned: { label: "Planejado", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  completed: { label: "Concluído", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  weather_hold: { label: "Weather Hold", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
};

export default function BargingLighteringPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            Barging & Lightering (STS)
          </h1>
          <p className="text-muted-foreground">Ship-to-Ship Transfers & Short-Sea Barging Operations</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Operação STS</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><ArrowLeftRight className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Operações Ativas</p><p className="text-2xl font-bold">2</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Droplets className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Volume Total (mês)</p><p className="text-2xl font-bold">990K bbl</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Taxa de Sucesso</p><p className="text-2xl font-bold">98.5%</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-orange-400" /><div><p className="text-sm text-muted-foreground">Weather Holds</p><p className="text-2xl font-bold">1</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="operations">
        <TabsList>
          <TabsTrigger value="operations">Operações STS</TabsTrigger>
          <TabsTrigger value="checklist">Checklist OCIMF</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MOCK_STS_OPERATIONS.map(op => (
              <Card key={op.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ship className="h-4 w-4" /> {op.id}
                    </CardTitle>
                    <Badge className={statusMap[op.status].color}>{statusMap[op.status].label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Tipo:</span> {op.type}</div>
                    <div><span className="text-muted-foreground">Carga:</span> {op.cargo}</div>
                    <div><span className="text-muted-foreground">Mother Vessel:</span> {op.motherVessel}</div>
                    <div><span className="text-muted-foreground">Service Vessel:</span> {op.serviceVessel}</div>
                    <div><span className="text-muted-foreground">Quantidade:</span> {op.quantity}</div>
                    <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" /> {op.location}</div>
                  </div>
                  <div className="bg-muted/30 rounded p-2 text-xs grid grid-cols-2 gap-1">
                    <span>Fender: {op.fender}</span>
                    <span>Mooring: {op.mooring}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progresso da Transferência</span>
                      <span>{op.progress}%</span>
                    </div>
                    <Progress value={op.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> OCIMF STS Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_CHECKLIST.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    {item.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-orange-400 shrink-0" />
                    )}
                    <span className="flex-1">{item.item}</span>
                    <Badge variant={item.status === "done" ? "default" : "outline"}>
                      {item.status === "done" ? "Concluído" : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {MOCK_CHECKLIST.filter(c => c.status === "done").length}/{MOCK_CHECKLIST.length} itens concluídos
                </span>
                <Progress value={(MOCK_CHECKLIST.filter(c => c.status === "done").length / MOCK_CHECKLIST.length) * 100} className="w-48 h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Normas & Regulamentos Aplicáveis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "OCIMF STS Transfer Guide", desc: "Ship-to-Ship Transfer Guide for Petroleum, Chemicals and Liquefied Gases", status: "compliant" },
                  { title: "ISGOTT", desc: "International Safety Guide for Oil Tankers & Terminals", status: "compliant" },
                  { title: "MARPOL Annex I", desc: "Prevention of Pollution by Oil - STS notification requirements", status: "compliant" },
                  { title: "ICS/OCIMF ISGINTT", desc: "International Safety Guide for Inland Navigation Tank-barges and Terminals", status: "review" },
                ].map((reg, i) => (
                  <div key={i} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{reg.title}</h4>
                      <Badge className={reg.status === "compliant" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}>
                        {reg.status === "compliant" ? "Conforme" : "Em Revisão"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{reg.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
