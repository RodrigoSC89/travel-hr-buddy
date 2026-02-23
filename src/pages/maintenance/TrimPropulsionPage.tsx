import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gauge, Waves, Fuel, TrendingDown, Ship, BarChart3, Zap, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MOCK_VESSELS_TRIM = [
  { name: "MV Atlantic Star", currentTrim: -0.5, optimalTrim: -0.8, fuelSaving: "2.3%", hullCondition: 87, propellerCondition: 92, engineEfficiency: 94, speed: 14.2, fuelRate: 32.5 },
  { name: "MV Pacific Voyager", currentTrim: 0.2, optimalTrim: -0.3, fuelSaving: "3.8%", hullCondition: 72, propellerCondition: 85, engineEfficiency: 91, speed: 12.8, fuelRate: 28.1 },
  { name: "MV Nordic Spirit", currentTrim: -0.9, optimalTrim: -0.7, fuelSaving: "0.8%", hullCondition: 95, propellerCondition: 96, engineEfficiency: 97, speed: 15.5, fuelRate: 35.2 },
];

const MOCK_HULL_FOULING = [
  { vessel: "MV Atlantic Star", lastCleaning: "2025-11-15", foulingRate: "moderate", addedResistance: "+8%", estimatedLoss: "$12,500/month", nextDrydock: "2026-08-01" },
  { vessel: "MV Pacific Voyager", lastCleaning: "2025-08-20", foulingRate: "high", addedResistance: "+15%", estimatedLoss: "$24,000/month", nextDrydock: "2026-04-15" },
  { vessel: "MV Nordic Spirit", lastCleaning: "2026-01-10", foulingRate: "low", addedResistance: "+3%", estimatedLoss: "$4,200/month", nextDrydock: "2027-01-01" },
];

const conditionColor = (val: number) => val >= 90 ? "text-green-400" : val >= 75 ? "text-yellow-400" : "text-red-400";

export default function TrimPropulsionPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gauge className="h-6 w-6 text-primary" />
          Trim & Propulsion Assistant
        </h1>
        <p className="text-muted-foreground">Otimização de trim, eficiência do casco e propulsão</p>
      </div>

      {/* Fleet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Fuel className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Economia Potencial</p><p className="text-2xl font-bold text-green-400">2.3%</p><p className="text-xs text-muted-foreground">avg fleet fuel savings</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Waves className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Hull Performance</p><p className="text-2xl font-bold">84.7%</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Zap className="h-8 w-8 text-purple-400" /><div><p className="text-sm text-muted-foreground">Propeller Efficiency</p><p className="text-2xl font-bold">91%</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingDown className="h-8 w-8 text-orange-400" /><div><p className="text-sm text-muted-foreground">CO₂ Reduction</p><p className="text-2xl font-bold">-145 MT/yr</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="trim">
        <TabsList>
          <TabsTrigger value="trim">Trim Optimization</TabsTrigger>
          <TabsTrigger value="hull">Hull & Propeller</TabsTrigger>
          <TabsTrigger value="fouling">Fouling Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trim">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {MOCK_VESSELS_TRIM.map((v, i) => (
              <Card key={i} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2"><Ship className="h-4 w-4" /> {v.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/30 p-3 rounded">
                      <p className="text-muted-foreground text-xs">Trim Atual</p>
                      <p className="text-xl font-bold">{v.currentTrim > 0 ? "+" : ""}{v.currentTrim}m</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded border border-primary/20">
                      <p className="text-muted-foreground text-xs">Trim Ótimo</p>
                      <p className="text-xl font-bold text-primary">{v.optimalTrim}m</p>
                    </div>
                  </div>
                  <div className="bg-green-500/10 rounded p-3 text-center border border-green-500/20">
                    <p className="text-xs text-muted-foreground">Economia de Combustível</p>
                    <p className="text-2xl font-bold text-green-400">{v.fuelSaving}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Velocidade:</span> {v.speed} kn</div>
                    <div><span className="text-muted-foreground">Consumo:</span> {v.fuelRate} MT/day</div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Hull Condition", value: v.hullCondition },
                      { label: "Propeller", value: v.propellerCondition },
                      { label: "Engine Eff.", value: v.engineEfficiency },
                    ].map((item, j) => (
                      <div key={j}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className={conditionColor(item.value)}>{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hull">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-semibold">Hull & Propeller Performance Monitor</h3>
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                  Monitoramento contínuo da eficiência do casco e hélice baseado em dados de sensores IoT, 
                  modelos hidrodinâmicos e comparação com baseline de entrega.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl mx-auto">
                  <div className="bg-muted/30 rounded p-4"><p className="text-xs text-muted-foreground">Speed Loss</p><p className="text-xl font-bold">-0.3 kn</p></div>
                  <div className="bg-muted/30 rounded p-4"><p className="text-xs text-muted-foreground">Added Power</p><p className="text-xl font-bold">+5.2%</p></div>
                  <div className="bg-muted/30 rounded p-4"><p className="text-xs text-muted-foreground">Fuel Penalty</p><p className="text-xl font-bold">$8.4K/mo</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fouling">
          <div className="space-y-4">
            {MOCK_HULL_FOULING.map((h, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{h.vessel}</h3>
                      <p className="text-sm text-muted-foreground">Última limpeza: {h.lastCleaning}</p>
                    </div>
                    <Badge className={
                      h.foulingRate === "low" ? "bg-green-500/20 text-green-400" :
                      h.foulingRate === "moderate" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }>{h.foulingRate} fouling</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                    <div><span className="text-muted-foreground block text-xs">Resistência Adicional</span>{h.addedResistance}</div>
                    <div><span className="text-muted-foreground block text-xs">Perda Estimada</span><span className="text-red-400">{h.estimatedLoss}</span></div>
                    <div><span className="text-muted-foreground block text-xs">Próx. Drydock</span>{h.nextDrydock}</div>
                    <div><span className="text-muted-foreground block text-xs">ROI Limpeza</span><span className="text-green-400">3.2x</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
