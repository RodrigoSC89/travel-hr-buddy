/**
 * Cargo Planning AI Page
 * Planejamento inteligente de carga com estabilidade
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Package, Ship, Calculator, AlertTriangle, 
  CheckCircle, Brain, Activity, Anchor, Scale
} from "lucide-react";

const CargoPlanningPage = () => {
  const [calculating, setCalculating] = useState(false);

  const vesselStats = {
    deadweight: 75000,
    currentCargo: 62500,
    remainingCapacity: 12500,
    draft: 12.4,
    maxDraft: 14.5,
    trim: 0.8,
    gm: 2.4,
    stability: "stable"
  };

  const cargoHolds = [
    { name: "Hold 1 (Fwd)", capacity: 15000, loaded: 14200, commodity: "Iron Ore", status: "loaded" },
    { name: "Hold 2", capacity: 18000, loaded: 17500, commodity: "Iron Ore", status: "loaded" },
    { name: "Hold 3", capacity: 20000, loaded: 18800, commodity: "Iron Ore", status: "loaded" },
    { name: "Hold 4", capacity: 15000, loaded: 12000, commodity: "Iron Ore", status: "loading" },
    { name: "Hold 5 (Aft)", capacity: 7000, loaded: 0, commodity: "-", status: "empty" }
  ];

  const optimizations = [
    {
      type: "Trim Otimizado",
      current: "0.8m popa",
      recommended: "1.2m popa",
      benefit: "2.1% menos consumo",
      confidence: 94
    },
    {
      type: "Distribuição de Carga",
      current: "Concentrado centro",
      recommended: "Distribuir para Hold 5",
      benefit: "Melhor estabilidade",
      confidence: 89
    },
    {
      type: "Sequência de Descarga",
      current: "5-4-3-2-1",
      recommended: "4-3-5-2-1",
      benefit: "20min mais rápido",
      confidence: 85
    }
  ];

  const stressPoints = [
    { location: "Frame 45-50", stress: 78, limit: 100, status: "ok" },
    { location: "Frame 85-90", stress: 92, limit: 100, status: "warning" },
    { location: "Frame 120-125", stress: 65, limit: 100, status: "ok" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Cargo Planning AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Planejamento inteligente de carga com análise de estabilidade
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Brain className="h-4 w-4 text-green-500" />
            IA Ativa
          </Badge>
          <Button onClick={() => setCalculating(true)} disabled={calculating}>
            <Calculator className="h-4 w-4 mr-2" />
            {calculating ? "Calculando..." : "Recalcular"}
          </Button>
        </div>
      </div>

      {/* Vessel Overview */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Deadweight</p>
              <p className="text-xl font-bold">{vesselStats.deadweight.toLocaleString()} t</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carga Atual</p>
              <p className="text-xl font-bold">{vesselStats.currentCargo.toLocaleString()} t</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponível</p>
              <p className="text-xl font-bold text-green-500">{vesselStats.remainingCapacity.toLocaleString()} t</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Draft Atual</p>
              <p className="text-xl font-bold">{vesselStats.draft}m</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Draft Máx</p>
              <p className="text-xl font-bold">{vesselStats.maxDraft}m</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trim</p>
              <p className="text-xl font-bold">{vesselStats.trim}m popa</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GM</p>
              <p className="text-xl font-bold">{vesselStats.gm}m</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-green-500 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Estável
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cargo Holds Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Visualização dos Porões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-2 h-40 mb-4">
            {cargoHolds.map((hold) => (
              <div key={hold.name} className="flex flex-col items-center">
                <div 
                  className="w-16 bg-muted rounded-t relative overflow-hidden"
                  style={{ height: "120px" }}
                >
                  <div 
                    className={`absolute bottom-0 w-full transition-all ${
                      hold.status === "loaded" ? "bg-green-500" :
                      hold.status === "loading" ? "bg-yellow-500 animate-pulse" :
                      "bg-muted"
                    }`}
                    style={{ height: `${(hold.loaded / hold.capacity) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-2 text-center">{hold.name.split(" ")[0]} {hold.name.split(" ")[1]}</p>
                <p className="text-xs text-muted-foreground">{Math.round(hold.loaded/hold.capacity*100)}%</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-4">
            {cargoHolds.map((hold) => (
              <div key={hold.name} className="p-3 border rounded-lg text-center">
                <p className="text-sm font-medium">{hold.name}</p>
                <p className="text-xs text-muted-foreground">
                  {hold.loaded.toLocaleString()} / {hold.capacity.toLocaleString()} t
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {hold.commodity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="optimization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="optimization">Otimização IA</TabsTrigger>
          <TabsTrigger value="stability">Estabilidade</TabsTrigger>
          <TabsTrigger value="stress">Análise de Stress</TabsTrigger>
          <TabsTrigger value="planning">Plano de Carga</TabsTrigger>
        </TabsList>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Recomendações de Otimização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map((opt, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{opt.type}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Atual: </span>
                            <span>{opt.current}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Recomendado: </span>
                            <span className="text-green-500 font-medium">{opt.recommended}</span>
                          </div>
                        </div>
                        <p className="text-sm text-green-600">Benefício: {opt.benefit}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{opt.confidence}% confiança</Badge>
                        <Button size="sm" className="mt-2">
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stability">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Cálculos de Estabilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">GM (Altura Metacêntrica)</p>
                  <p className="text-3xl font-bold text-green-500">{vesselStats.gm}m</p>
                  <p className="text-xs text-muted-foreground">Mínimo: 0.15m</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">GZ Máximo</p>
                  <p className="text-3xl font-bold text-blue-500">1.8m @ 35°</p>
                  <p className="text-xs text-muted-foreground">Critério IMO: OK</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Ângulo de Alagamento</p>
                  <p className="text-3xl font-bold text-purple-500">42°</p>
                  <p className="text-xs text-muted-foreground">Mínimo: 25°</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Todos os critérios de estabilidade atendidos</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Verificação conforme SOLAS, IMO Grain Code e requisitos de classe.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Análise de Stress Estrutural
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stressPoints.map((point, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{point.location}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          point.stress >= 90 ? "text-red-500" :
                          point.stress >= 80 ? "text-yellow-500" : "text-green-500"
                        }`}>{point.stress}%</span>
                        {point.status === "warning" && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={point.stress} 
                      className={`h-3 ${
                        point.stress >= 90 ? "[&>div]:bg-red-500" :
                        point.stress >= 80 ? "[&>div]:bg-yellow-500" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
              
              {stressPoints.some(p => p.status === "warning") && (
                <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Atenção: Stress elevado em Frame 85-90</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Considere redistribuir carga para reduzir stress nesta região.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning">
          <Card>
            <CardHeader>
              <CardTitle>Plano de Carregamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Anchor className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gerador de Plano de Carga</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Gere planos de carregamento/descarregamento otimizados 
                  considerando sequência, trim e limites de stress.
                </p>
                <Button className="mt-4">
                  Gerar Novo Plano
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CargoPlanningPage;
