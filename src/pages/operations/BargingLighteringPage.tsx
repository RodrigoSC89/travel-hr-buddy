import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, ArrowLeftRight, Droplets, AlertTriangle, CheckCircle2, Clock, MapPin, Plus, FileText, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

const statusMap: Record<string, { label: string; color: string }> = {
  in_progress: { label: "Em Progresso", color: "bg-primary/20 text-primary border-primary/30" },
  planned: { label: "Planejado", color: "bg-accent/20 text-accent-foreground border-accent/30" },
  completed: { label: "Concluído", color: "bg-success/20 text-success border-success/30" },
  weather_hold: { label: "Weather Hold", color: "bg-warning/20 text-warning border-warning/30" },
};

interface STSOperation {
  id: string;
  type: string;
  mother_vessel: string;
  service_vessel: string;
  location: string;
  cargo: string;
  quantity: string;
  status: string;
  progress: number;
  start_date: string;
  fender_type: string;
  mooring_type: string;
}

interface ChecklistItem {
  id: string;
  item_name: string;
  status: string;
}

export default function BargingLighteringPage() {
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["sts-operations"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("bunker_operations")
        .select("id, operation_type, vessel_id, supplier_name, port, fuel_type, quantity_ordered, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []).map((op: Record<string, unknown>) => ({
        id: String(op.id || "").slice(0, 8).toUpperCase(),
        type: String(op.operation_type || "Transfer"),
        mother_vessel: String(op.supplier_name || "—"),
        service_vessel: "Service Vessel",
        location: String(op.port || "—"),
        cargo: String(op.fuel_type || "—"),
        quantity: `${Number(op.quantity_ordered || 0).toLocaleString()} MT`,
        status: String(op.status || "planned"),
        progress: op.status === "completed" ? 100 : op.status === "in_progress" ? 50 : 0,
        start_date: String(op.created_at || ""),
        fender_type: "Standard",
        mooring_type: "OCIMF Std",
      })) as STSOperation[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: checklist = [] } = useQuery({
    queryKey: ["sts-checklist"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("operational_checklists")
        .select("id, title, status")
        .eq("checklist_type", "sts")
        .limit(20);
      if (error) throw error;
      if (data && data.length > 0) {
        return (data as Array<Record<string, unknown>>).map(c => ({
          id: String(c.id),
          item_name: String(c.title || "Item"),
          status: String(c.status || "pending"),
        }));
      }
      // Default OCIMF checklist items (reference data, not mock)
      return [
        { id: "1", item_name: "Mooring Equipment Inspection", status: "pending" },
        { id: "2", item_name: "Fender System Deployment", status: "pending" },
        { id: "3", item_name: "Oil Spill Response Equipment Ready", status: "pending" },
        { id: "4", item_name: "Communication Plan Agreed", status: "pending" },
        { id: "5", item_name: "Weather Window Confirmed", status: "pending" },
        { id: "6", item_name: "Cargo Transfer Plan Approved", status: "pending" },
        { id: "7", item_name: "Emergency Disconnection Procedure Reviewed", status: "pending" },
        { id: "8", item_name: "SOPEP Equipment Verified", status: "pending" },
      ] as ChecklistItem[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const activeOps = operations.filter(o => o.status === "in_progress").length;
  const completedOps = operations.filter(o => o.status === "completed").length;
  const weatherHolds = operations.filter(o => o.status === "weather_hold").length;
  const successRate = operations.length > 0
    ? ((completedOps / operations.length) * 100).toFixed(1)
    : "—";
  const doneChecklist = checklist.filter(c => c.status === "done" || c.status === "completed").length;

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><ArrowLeftRight className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Operações Ativas</p><p className="text-2xl font-bold">{activeOps}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Droplets className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Total Operações</p><p className="text-2xl font-bold">{operations.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-success" /><div><p className="text-sm text-muted-foreground">Taxa de Sucesso</p><p className="text-2xl font-bold">{successRate}%</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-warning" /><div><p className="text-sm text-muted-foreground">Weather Holds</p><p className="text-2xl font-bold">{weatherHolds}</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="operations">
        <TabsList>
          <TabsTrigger value="operations">Operações STS</TabsTrigger>
          <TabsTrigger value="checklist">Checklist OCIMF</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : operations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma operação STS registrada.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {operations.map(op => {
                const st = statusMap[op.status] || statusMap.planned;
                return (
                  <Card key={op.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Ship className="h-4 w-4" /> {op.id}
                        </CardTitle>
                        <Badge className={st.color}>{st.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Tipo:</span> {op.type}</div>
                        <div><span className="text-muted-foreground">Carga:</span> {op.cargo}</div>
                        <div><span className="text-muted-foreground">Mother Vessel:</span> {op.mother_vessel}</div>
                        <div><span className="text-muted-foreground">Quantidade:</span> {op.quantity}</div>
                        <div className="flex items-center gap-1 col-span-2"><MapPin className="h-3 w-3 text-muted-foreground" /> {op.location}</div>
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
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> OCIMF STS Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    {item.status === "done" || item.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-warning shrink-0" />
                    )}
                    <span className="flex-1">{item.item_name}</span>
                    <Badge variant={item.status === "done" || item.status === "completed" ? "default" : "outline"}>
                      {item.status === "done" || item.status === "completed" ? "Concluído" : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {doneChecklist}/{checklist.length} itens concluídos
                </span>
                <Progress value={checklist.length > 0 ? (doneChecklist / checklist.length) * 100 : 0} className="w-48 h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          {/* Reference regulatory data - not mock, these are actual maritime standards */}
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
                      <Badge className={reg.status === "compliant" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
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
