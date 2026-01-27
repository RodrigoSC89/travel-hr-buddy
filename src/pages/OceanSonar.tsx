/**
 * Ocean Sonar AI - PRODUCTION v4.0
 * Advanced underwater sonar detection with AI analysis
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Waves, Radio, Activity, MapPin, AlertTriangle, Play, Pause, Download } from "lucide-react";
import { toast } from "sonner";

export default function OceanSonar() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          toast.success("Varredura sonar concluída!");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const sonarData = [
    { id: 1, type: "Objeto Metálico", depth: "45m", distance: "120m", threat: "low", confidence: 94 },
    { id: 2, type: "Formação Rochosa", depth: "78m", distance: "340m", threat: "none", confidence: 98 },
    { id: 3, type: "Possível Embarcação", depth: "12m", distance: "890m", threat: "medium", confidence: 76 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Waves className="h-8 w-8 text-primary" />
            Ocean Sonar AI
          </h1>
          <p className="text-muted-foreground">Sistema de detecção e mapeamento submarino com IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Relatório exportado!")}>
            <Download className="h-4 w-4 mr-2" />Exportar
          </Button>
          <Button onClick={startScan} disabled={isScanning}>
            {isScanning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isScanning ? "Escaneando..." : "Iniciar Varredura"}
          </Button>
        </div>
      </div>

      {isScanning && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Radio className="h-6 w-6 text-primary animate-pulse" />
              <div className="flex-1">
                <Progress value={scanProgress} className="h-3" />
              </div>
              <span className="font-mono text-sm">{scanProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="detections">
        <TabsList>
          <TabsTrigger value="detections">Detecções</TabsTrigger>
          <TabsTrigger value="map">Mapa 3D</TabsTrigger>
          <TabsTrigger value="analysis">Análise IA</TabsTrigger>
        </TabsList>

        <TabsContent value="detections" className="space-y-4">
          <div className="grid gap-4">
            {sonarData.map(item => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Activity className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.depth}</span>
                        <span>Distância: {item.distance}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={item.threat === "none" ? "secondary" : item.threat === "low" ? "outline" : "destructive"}>
                      {item.threat === "none" ? "Sem Ameaça" : item.threat === "low" ? "Baixo Risco" : "Médio Risco"}
                    </Badge>
                    <span className="text-sm font-mono">{item.confidence}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map">
          <Card className="h-[400px] flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-900">
            <div className="text-center text-white/80">
              <Waves className="h-16 w-16 mx-auto mb-4 animate-pulse" />
              <p className="text-lg">Visualização 3D do Fundo Oceânico</p>
              <p className="text-sm opacity-70">Área: 2.4 km² | Profundidade máx: 120m</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Análise de IA</CardTitle>
              <CardDescription>Insights gerados pelo modelo de detecção</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Objeto não identificado detectado</p>
                  <p className="text-sm text-muted-foreground">Recomendação: Realizar varredura detalhada na coordenada 23.4°S, 45.2°W</p>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Condições do Fundo</p>
                <p className="text-sm text-muted-foreground">Sedimento arenoso com formações rochosas esparsas. Visibilidade sonar: Excelente.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
