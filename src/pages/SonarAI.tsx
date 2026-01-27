import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Activity, Waves, Target, ZoomIn, Settings } from "lucide-react";

export default function SonarAI() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementLevel, setEnhancementLevel] = useState(75);

  const sonarData = {
    signalQuality: 87,
    noiseReduction: 92,
    objectsDetected: 14,
    depthRange: "0-500m",
    lastScan: "2 min atrás"
  };

  const detectedObjects = [
    { id: 1, type: "Estrutura Subaquática", distance: "120m", confidence: 94 },
    { id: 2, type: "Cardume", distance: "85m", confidence: 88 },
    { id: 3, type: "Debris", distance: "200m", confidence: 76 },
    { id: 4, type: "Formação Rochosa", distance: "340m", confidence: 91 }
  ];

  const handleEnhance = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setEnhancementLevel(prev => Math.min(prev + 5, 100));
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sonar AI Enhancement</h1>
            <p className="text-muted-foreground">Processamento inteligente de sinais acústicos</p>
          </div>
        </div>
        <Badge className="bg-success/10 text-success">Sistema Ativo</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualidade do Sinal</p>
                <p className="text-2xl font-bold text-success">{sonarData.signalQuality}%</p>
              </div>
              <Activity className="h-8 w-8 text-success opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Redução de Ruído</p>
                <p className="text-2xl font-bold text-primary">{sonarData.noiseReduction}%</p>
              </div>
              <Waves className="h-8 w-8 text-primary opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Objetos Detectados</p>
                <p className="text-2xl font-bold">{sonarData.objectsDetected}</p>
              </div>
              <Target className="h-8 w-8 text-warning opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alcance</p>
                <p className="text-2xl font-bold">{sonarData.depthRange}</p>
              </div>
              <ZoomIn className="h-8 w-8 text-muted-foreground opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
          <TabsTrigger value="objects">Objetos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime">
          <Card>
            <CardHeader>
              <CardTitle>Visualização em Tempo Real</CardTitle>
              <CardDescription>Processamento AI aplicado ao sinal sonar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-b from-primary/10 to-primary/5 rounded-lg flex items-center justify-center border border-primary/20 mb-4">
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                    <div className="absolute inset-4 rounded-full border-2 border-primary/40 animate-ping" style={{ animationDelay: "0.5s" }} />
                    <div className="absolute inset-8 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDelay: "1s" }} />
                    <Radio className="absolute inset-0 m-auto h-12 w-12 text-primary" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">Varredura ativa - {sonarData.lastScan}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Nível de Enhancement AI</p>
                  <Progress value={enhancementLevel} className="w-64 h-2 mt-2" />
                </div>
                <Button onClick={handleEnhance} disabled={isProcessing}>
                  {isProcessing ? "Processando..." : "Otimizar Sinal"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objects">
          <Card>
            <CardHeader>
              <CardTitle>Objetos Detectados</CardTitle>
              <CardDescription>Classificação automática por IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {detectedObjects.map(obj => (
                  <div key={obj.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{obj.type}</p>
                        <p className="text-sm text-muted-foreground">Distância: {obj.distance}</p>
                      </div>
                    </div>
                    <Badge variant={obj.confidence >= 90 ? "default" : "secondary"}>
                      {obj.confidence}% confiança
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span>Detecção automática de objetos</span>
                </div>
                <Badge className="bg-success/10 text-success">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span>Filtragem de ruído adaptativa</span>
                </div>
                <Badge className="bg-success/10 text-success">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span>Classificação por deep learning</span>
                </div>
                <Badge className="bg-success/10 text-success">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
