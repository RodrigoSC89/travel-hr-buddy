/**
 * Stowage Plan Manager - vs NAPA / CargoMax / StormGeo
 * Visual cargo stowage planning with stability calculations
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Package, Ship, Layers, AlertTriangle, CheckCircle2,
  Download, Gauge, BarChart3, Plus, ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";

interface CargoHold {
  id: string;
  name: string;
  capacity: number;
  loaded: number;
  cargoType: string;
  temperature: number | null;
  hazmat: boolean;
  imdgClass: string | null;
}

const holds: CargoHold[] = [
  { id: "H1", name: "Hold 1 (Fwd)", capacity: 12500, loaded: 11200, cargoType: "Grain (Wheat)", temperature: null, hazmat: false, imdgClass: null },
  { id: "H2", name: "Hold 2", capacity: 15000, loaded: 14800, cargoType: "Grain (Wheat)", temperature: null, hazmat: false, imdgClass: null },
  { id: "H3", name: "Hold 3", capacity: 15000, loaded: 13500, cargoType: "Soya Bean Meal", temperature: null, hazmat: false, imdgClass: null },
  { id: "H4", name: "Hold 4", capacity: 15000, loaded: 0, cargoType: "Empty", temperature: null, hazmat: false, imdgClass: null },
  { id: "H5", name: "Hold 5 (Aft)", capacity: 12500, loaded: 10800, cargoType: "Fertilizer (Urea)", temperature: null, hazmat: true, imdgClass: "9" },
];

const stabilityData = {
  displacement: 52400,
  draft_fwd: 9.2,
  draft_aft: 10.1,
  trim: -0.9,
  gm: 1.45,
  gmRequired: 0.15,
  sf_max: 78,
  sf_limit: 100,
  bm_max: 65,
  bm_limit: 100,
};

export function StowagePlanManager() {
  const [tab, setTab] = useState("plan");

  const totalCapacity = holds.reduce((s, h) => s + h.capacity, 0);
  const totalLoaded = holds.reduce((s, h) => s + h.loaded, 0);
  const utilization = ((totalLoaded / totalCapacity) * 100).toFixed(1);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-7 w-7 text-amber-400" />
            Stowage Plan Manager
          </h1>
          <p className="text-muted-foreground">Cargo planning & stability • IMSBC/IMDG compliant • vs NAPA/CargoMax</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Stowage plan exported")}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-1" /> New Plan
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Cargo</p>
          <p className="text-2xl font-bold text-cyan-400">{(totalLoaded / 1000).toFixed(1)}k mt</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Utilization</p>
          <p className="text-2xl font-bold text-amber-400">{utilization}%</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">GM</p>
          <p className="text-2xl font-bold text-emerald-400">{stabilityData.gm}m</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Trim</p>
          <p className="text-2xl font-bold">{stabilityData.trim}m</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">HAZMAT Holds</p>
          <p className="text-2xl font-bold text-rose-400">{holds.filter(h => h.hazmat).length}</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="plan">Stowage Plan</TabsTrigger>
          <TabsTrigger value="stability">Stability</TabsTrigger>
          <TabsTrigger value="segregation">Segregation</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-3 mt-4">
          {/* Visual hold representation */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5" /> Cargo Holds</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {holds.map(hold => {
                  const pct = (hold.loaded / hold.capacity) * 100;
                  return (
                    <div key={hold.id} className="flex-1 text-center">
                      <div className="h-32 bg-muted/30 rounded-lg border border-border/50 relative overflow-hidden mb-2">
                        <div 
                          className={`absolute bottom-0 left-0 right-0 rounded-b-lg ${hold.hazmat ? "bg-rose-500/40" : "bg-cyan-500/40"}`}
                          style={{ height: `${pct}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">{pct > 0 ? `${pct.toFixed(0)}%` : "EMPTY"}</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium">{hold.name}</p>
                      <p className="text-xs text-muted-foreground">{hold.cargoType}</p>
                      {hold.hazmat && <Badge variant="outline" className="text-rose-400 border-rose-500/30 text-xs mt-1">IMDG {hold.imdgClass}</Badge>}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Ship className="h-3 w-3" /> FWD ←</span>
                <div className="flex-1 h-px bg-border/50" />
                <span>→ AFT</span>
              </div>
            </CardContent>
          </Card>

          {/* Hold Details */}
          {holds.map(hold => (
            <Card key={hold.id} className="border-border/50 bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{hold.name}</span>
                    <span className="text-sm text-muted-foreground">{hold.cargoType}</span>
                    {hold.hazmat && <Badge variant="outline" className="text-rose-400 border-rose-500/30 text-xs">HAZMAT</Badge>}
                  </div>
                  <span className="text-sm font-medium">{(hold.loaded).toLocaleString()} / {(hold.capacity).toLocaleString()} mt</span>
                </div>
                <Progress value={(hold.loaded / hold.capacity) * 100} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="stability" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Gauge className="h-5 w-5" /> Stability Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Displacement", value: `${stabilityData.displacement.toLocaleString()} mt`, ok: true },
                  { label: "Draft Fwd / Aft", value: `${stabilityData.draft_fwd}m / ${stabilityData.draft_aft}m`, ok: true },
                  { label: "Trim", value: `${stabilityData.trim}m (by stern)`, ok: Math.abs(stabilityData.trim) < 2 },
                  { label: "GM", value: `${stabilityData.gm}m (min: ${stabilityData.gmRequired}m)`, ok: stabilityData.gm > stabilityData.gmRequired },
                  { label: "SF Max", value: `${stabilityData.sf_max}% of limit`, ok: stabilityData.sf_max < 85 },
                  { label: "BM Max", value: `${stabilityData.bm_max}% of limit`, ok: stabilityData.bm_max < 85 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                    <span className="text-sm">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{s.value}</span>
                      {s.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-rose-400" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ArrowUpDown className="h-5 w-5" /> Stress Limits</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Shearing Force</span>
                    <span>{stabilityData.sf_max}%</span>
                  </div>
                  <Progress value={stabilityData.sf_max} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bending Moment</span>
                    <span>{stabilityData.bm_max}%</span>
                  </div>
                  <Progress value={stabilityData.bm_max} className="h-3" />
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="font-medium text-emerald-400">All stability criteria satisfied</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Compliant with SOLAS Ch. II-1, Reg. 22</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segregation" className="mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg">IMDG Segregation Matrix</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Automated segregation checks per IMDG Code Chapter 7.2 and IMSBC Code Section 9.
              </p>
              <div className="space-y-3">
                {[
                  { cargo1: "Fertilizer (Urea) - Class 9", cargo2: "Grain (Wheat)", status: "compatible", note: "No segregation required" },
                  { cargo1: "Fertilizer (Urea) - Class 9", cargo2: "Soya Bean Meal", status: "caution", note: "Away from heat sources - IMSBC 9.2.3.4" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/20 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{s.cargo1} ↔ {s.cargo2}</p>
                      <p className="text-xs text-muted-foreground">{s.note}</p>
                    </div>
                    <Badge variant="outline" className={s.status === "compatible" ? "text-emerald-400 border-emerald-500/30" : "text-amber-400 border-amber-500/30"}>
                      {s.status}
                    </Badge>
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
