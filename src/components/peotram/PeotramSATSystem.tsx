import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Activity, AlertTriangle, Thermometer, Wind, Droplets, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  operational: { label: "Operacional", color: "bg-success" },
  maintenance: { label: "Manutenção", color: "bg-muted-foreground" },
  decommissioned: { label: "Descomissionado", color: "bg-muted" },
};

const LIMITS = { o2_min: 19.5, o2_max: 23.5, co2_max: 500, temp_min: 26, temp_max: 32, humidity_min: 40, humidity_max: 60 };

export function PeotramSATSystem() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [newChamber, setNewChamber] = useState({ chamber_name: "", chamber_type: "living" as string, max_occupants: 4, max_depth_meters: 300 });

  const { data: chambers = [], isLoading } = useQuery({
    queryKey: ["peotram-sat-chambers"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("peotram_sat_chambers")
        .select("*").order("chamber_name");
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic table not in generated types
      return data as Record<string, unknown>[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (chamber: typeof newChamber) => {
      const { error } = await fromUntyped("peotram_sat_chambers").insert({
        chamber_name: chamber.chamber_name,
        chamber_type: chamber.chamber_type,
        max_occupants: chamber.max_occupants,
        max_depth_meters: chamber.max_depth_meters,
        status: "operational",
        certification_status: "valid",
        specifications: { o2_percent: 21.0, co2_ppm: 400, temperature_c: 28, humidity_percent: 50, pressure_bar: 1.0 },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peotram-sat-chambers"] });
      toast.success("Câmara adicionada!");
      setAddOpen(false);
    },
    onError: () => toast.error("Erro ao adicionar câmara"),
  });

  const activeChambers = chambers.filter((c: any) => c.status === "operational").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-3xl font-bold text-primary">{activeChambers}</p>
            <p className="text-xs text-muted-foreground">Câmaras Ativas</p>
          </CardContent>
        </Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">{chambers.length}</p><p className="text-xs text-muted-foreground">Total Câmaras</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">{chambers.filter((c: any) => c.certification_status === "valid").length}</p><p className="text-xs text-muted-foreground">Certificadas</p></CardContent></Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Adicionar</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova Câmara SAT</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Nome da câmara" value={newChamber.chamber_name} onChange={e => setNewChamber(p => ({ ...p, chamber_name: e.target.value }))} />
                  <Select value={newChamber.chamber_type} onValueChange={v => setNewChamber(p => ({ ...p, chamber_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living">Living</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="bell">Bell</SelectItem>
                      <SelectItem value="trunk">Trunk</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Max ocupantes" value={newChamber.max_occupants} onChange={e => setNewChamber(p => ({ ...p, max_occupants: +e.target.value }))} />
                  <Input type="number" placeholder="Prof. máxima (m)" value={newChamber.max_depth_meters} onChange={e => setNewChamber(p => ({ ...p, max_depth_meters: +e.target.value }))} />
                  <Button className="w-full" onClick={() => createMutation.mutate(newChamber)} disabled={!newChamber.chamber_name || createMutation.isPending}>
                    {createMutation.isPending ? "Salvando..." : "Adicionar Câmara"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando câmaras...</CardContent></Card>
      ) : chambers.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma câmara registrada. Clique em "Adicionar" para começar.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {chambers.map((chamber: any) => {
            const specs = chamber.specifications || {};
            const statusCfg = STATUS_CONFIG[chamber.status] || STATUS_CONFIG.operational;
            const certColor = chamber.certification_status === "valid" ? "text-success" : chamber.certification_status === "expiring" ? "text-warning" : "text-destructive";

            return (
              <Card key={chamber.id} className="transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{chamber.chamber_name}</CardTitle>
                    <Badge className={`text-xs text-white ${statusCfg.color}`}>{statusCfg.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium capitalize">{chamber.chamber_type || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Prof. Máxima:</span>
                    <span className="font-mono font-bold">{chamber.max_depth_meters || 0}m</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Max Ocupantes:</span>
                    <span className="font-medium">{chamber.max_occupants || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Certificação:</span>
                    <span className={`font-medium ${certColor}`}>{chamber.certification_status === "valid" ? "✅ Válida" : chamber.certification_status === "expiring" ? "⚠️ Vencendo" : "❌ Vencida"}</span>
                  </div>
                  {specs.o2_percent && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded text-center bg-success/10">
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Wind className="h-3 w-3" /> O₂</p>
                        <p className="font-mono font-bold">{specs.o2_percent}%</p>
                      </div>
                      <div className="p-2 rounded text-center bg-success/10">
                        <p className="text-xs text-muted-foreground">CO₂</p>
                        <p className="font-mono font-bold">{specs.co2_ppm} ppm</p>
                      </div>
                    </div>
                  )}
                  {chamber.classification_society && (
                    <Badge variant="outline" className="text-xs">{chamber.classification_society}</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
