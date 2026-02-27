import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

const GAS_ICONS: Record<string, string> = { helium: "🫧", oxygen: "💨", nitrogen: "🌬️", heliox: "🔬", trimix: "⚗️", air: "🌀", co2_absorbent: "🧪", other: "⛽" };
const GAS_LABELS: Record<string, string> = { helium: "Hélio", oxygen: "Oxigênio", nitrogen: "Nitrogênio", heliox: "Heliox", trimix: "Trimix", air: "Ar Comprimido", co2_absorbent: "Absorvente CO₂", other: "Outro" };

export function PeotramGasManagement() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [newGas, setNewGas] = useState({ gas_type: "helium", quantity_liters: 500, pressure_bar: 200, cylinder_count: 10, min_stock_level: 100, storage_location: "" });

  const { data: gases = [], isLoading } = useQuery({
    queryKey: ["peotram-gas-inventory"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("peotram_gas_inventory")
        .select("*").order("gas_type");
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase dynamic table with untyped columns
      return data as Array<Record<string, any>>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (gas: typeof newGas) => {
      const { error } = await fromUntyped("peotram_gas_inventory").insert({
        gas_type: gas.gas_type,
        quantity_liters: gas.quantity_liters,
        pressure_bar: gas.pressure_bar,
        cylinder_count: gas.cylinder_count,
        min_stock_level: gas.min_stock_level,
        storage_location: gas.storage_location,
        status: "available",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peotram-gas-inventory"] });
      toast.success("Gás adicionado ao inventário!");
      setAddOpen(false);
    },
    onError: () => toast.error("Erro ao adicionar gás"),
  });

  const criticalCount = gases.filter((g: any) => g.min_stock_level && g.quantity_liters <= g.min_stock_level).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">{gases.length}</p><p className="text-xs text-muted-foreground">Tipos de Gás</p></CardContent></Card>
        <Card className={criticalCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className={`text-2xl font-bold ${criticalCount > 0 ? "text-destructive" : "text-success"}`}>{criticalCount > 0 ? `⚠️ ${criticalCount}` : "✅ 0"}</p>
            <p className="text-xs text-muted-foreground">Nível Crítico</p>
          </CardContent>
        </Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold">{gases.reduce((a: number, g: any) => a + (g.cylinder_count || 0), 0)}</p><p className="text-xs text-muted-foreground">Cilindros Total</p></CardContent></Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Adicionar</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Adicionar Gás ao Inventário</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Select value={newGas.gas_type} onValueChange={v => setNewGas(p => ({ ...p, gas_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(GAS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Quantidade (litros)" value={newGas.quantity_liters} onChange={e => setNewGas(p => ({ ...p, quantity_liters: +e.target.value }))} />
                  <Input type="number" placeholder="Pressão (bar)" value={newGas.pressure_bar} onChange={e => setNewGas(p => ({ ...p, pressure_bar: +e.target.value }))} />
                  <Input type="number" placeholder="Nº cilindros" value={newGas.cylinder_count} onChange={e => setNewGas(p => ({ ...p, cylinder_count: +e.target.value }))} />
                  <Input type="number" placeholder="Nível mínimo (litros)" value={newGas.min_stock_level} onChange={e => setNewGas(p => ({ ...p, min_stock_level: +e.target.value }))} />
                  <Input placeholder="Local de armazenamento" value={newGas.storage_location} onChange={e => setNewGas(p => ({ ...p, storage_location: e.target.value }))} />
                  <Button className="w-full" onClick={() => createMutation.mutate(newGas)} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Salvando..." : "Adicionar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando inventário...</CardContent></Card>
      ) : gases.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Inventário vazio. Clique em "Adicionar" para registrar gases.</CardContent></Card>
      ) : (
        gases.map((gas: any) => {
          const level = gas.min_stock_level ? Math.round((gas.quantity_liters / (gas.min_stock_level * 5)) * 100) : 100;
          const critical = gas.min_stock_level && gas.quantity_liters <= gas.min_stock_level;
          const warning = gas.min_stock_level && gas.quantity_liters <= gas.min_stock_level * 1.5 && !critical;
          const icon = GAS_ICONS[gas.gas_type] || "⛽";
          const label = GAS_LABELS[gas.gas_type] || gas.gas_type;

          return (
            <Card key={gas.id} className={critical ? "border-destructive/50 bg-destructive/5" : warning ? "border-warning/50 bg-warning/5" : ""}>
              <CardContent className="pt-4 pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{icon}</span>
                    <div>
                      <h4 className="font-semibold">{label}</h4>
                      <p className="text-xs text-muted-foreground">Pressão: {gas.pressure_bar || 0} bar • Cilindros: {gas.cylinder_count || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${critical ? "text-destructive" : warning ? "text-warning" : "text-success"}`}>
                      {Math.min(level, 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{gas.quantity_liters?.toLocaleString()} L</p>
                  </div>
                </div>
                <Progress value={Math.min(level, 100)} className={`h-3 ${critical ? "[&>div]:bg-destructive" : warning ? "[&>div]:bg-warning" : "[&>div]:bg-success"}`} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Nível mínimo: {gas.min_stock_level?.toLocaleString() || "N/A"} L</span>
                  {gas.storage_location && <span>📍 {gas.storage_location}</span>}
                </div>
                {critical && (
                  <div className="flex items-center gap-2 p-2 bg-destructive/20 rounded text-xs text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">NÍVEL CRÍTICO — Solicitar reabastecimento!</span>
                    <Button size="sm" variant="destructive" className="ml-auto text-xs h-6" onClick={async () => { 
                      const { error } = await fromUntyped("peotram_gas_inventory").update({ status: "reorder_requested" }).eq("id", gas.id);
                      if (!error) { queryClient.invalidateQueries({ queryKey: ["peotram-gas-inventory"] }); toast.success("Solicitação de reabastecimento registrada para " + GAS_LABELS[gas.gas_type]); }
                      else toast.error("Erro ao solicitar reabastecimento");
                    }}>Solicitar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
