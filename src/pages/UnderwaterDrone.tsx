import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Camera, Video, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, Wifi } from "lucide-react";

export default function UnderwaterDrone() {
  const [lightIntensity, setLightIntensity] = useState([75]);
  const [isRecording, setIsRecording] = useState(false);

  const droneStatus = {
    connected: true,
    depth: 45,
    battery: 82,
    signalStrength: 94,
    cameraActive: true,
    lightsOn: true
  };

  const recentCaptures = [
    { id: 1, type: "photo", timestamp: "14:32:15", thumbnail: "Inspeção casco" },
    { id: 2, type: "video", timestamp: "14:28:00", thumbnail: "Pipeline seção 3" },
    { id: 3, type: "photo", timestamp: "14:25:42", thumbnail: "Corrosão detectada" }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Underwater Drone</h1>
            <p className="text-muted-foreground">Controle de ROV para inspeção subaquática</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={droneStatus.connected ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
            <Wifi className="h-3 w-3 mr-1" />
            {droneStatus.connected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Feed ao Vivo</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={isRecording ? "destructive" : "outline"} 
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <Video className="h-4 w-4" />
                    {isRecording && <span className="ml-1 animate-pulse">●</span>}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-b from-primary/20 to-primary/5 rounded-lg flex items-center justify-center border border-primary/20 relative">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-primary/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">Camera HD - {droneStatus.depth}m profundidade</p>
                </div>
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm">
                    <span className="animate-pulse">●</span> REC
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur px-3 py-1 rounded text-sm">
                  Bateria: {droneStatus.battery}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Controles de Movimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div />
                <Button variant="outline" size="sm"><ArrowUp className="h-4 w-4" /></Button>
                <div />
                <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><RotateCw className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><ArrowRight className="h-4 w-4" /></Button>
                <div />
                <Button variant="outline" size="sm"><ArrowDown className="h-4 w-4" /></Button>
                <div />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <ArrowUp className="h-4 w-4 rotate-45" />
                  Subir
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ArrowDown className="h-4 w-4 rotate-45" />
                  Descer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Iluminação</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={lightIntensity}
                onValueChange={setLightIntensity}
                max={100}
                step={1}
              />
              <p className="text-sm text-muted-foreground mt-2">Intensidade: {lightIntensity}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sinal</span>
                <span className="font-medium text-success">{droneStatus.signalStrength}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profundidade</span>
                <span className="font-medium">{droneStatus.depth}m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bateria</span>
                <span className="font-medium text-success">{droneStatus.battery}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Captures */}
      <Card>
        <CardHeader>
          <CardTitle>Capturas Recentes</CardTitle>
          <CardDescription>Fotos e vídeos da sessão atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentCaptures.map(capture => (
              <div key={capture.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  {capture.type === "photo" ? (
                    <Camera className="h-4 w-4 text-primary" />
                  ) : (
                    <Video className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-xs text-muted-foreground">{capture.timestamp}</span>
                </div>
                <p className="font-medium">{capture.thumbnail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
