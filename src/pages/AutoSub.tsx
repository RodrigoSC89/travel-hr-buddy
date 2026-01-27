import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, Navigation, Battery, Gauge, MapPin, Play, Pause, RotateCcw } from "lucide-react";

export default function AutoSub() {
  const [missionStatus, setMissionStatus] = useState<"idle" | "active" | "paused">("idle");

  const subData = {
    depth: 245,
    maxDepth: 500,
    battery: 78,
    speed: 4.2,
    heading: 127,
    distanceTraveled: 12.4
  };

  const activeMissions = [
    { id: 1, name: "Inspeção Pipeline A7", progress: 67, status: "active" },
    { id: 2, name: "Mapeamento Zona B", progress: 100, status: "completed" },
    { id: 3, name: "Coleta de Amostras", progress: 0, status: "scheduled" }
  ];

  const waypoints = [
    { id: 1, name: "Ponto Inicial", lat: -23.0123, lng: -43.2456, reached: true },
    { id: 2, name: "Checkpoint Alpha", lat: -23.0145, lng: -43.2478, reached: true },
    { id: 3, name: "Área de Inspeção", lat: -23.0167, lng: -43.2501, reached: false },
    { id: 4, name: "Retorno", lat: -23.0123, lng: -43.2456, reached: false }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ship className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AutoSub Mission</h1>
            <p className="text-muted-foreground">Controle de submersíveis autônomos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {missionStatus === "active" ? (
            <Button variant="outline" onClick={() => setMissionStatus("paused")}>
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          ) : (
            <Button onClick={() => setMissionStatus("active")}>
              <Play className="h-4 w-4 mr-2" />
              {missionStatus === "paused" ? "Retomar" : "Iniciar Missão"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profundidade</p>
                <p className="text-2xl font-bold text-primary">{subData.depth}m</p>
                <p className="text-xs text-muted-foreground">Max: {subData.maxDepth}m</p>
              </div>
              <Gauge className="h-8 w-8 text-primary opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bateria</p>
                <p className="text-2xl font-bold text-success">{subData.battery}%</p>
                <Progress value={subData.battery} className="w-24 h-1 mt-1" />
              </div>
              <Battery className="h-8 w-8 text-success opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Velocidade</p>
                <p className="text-2xl font-bold">{subData.speed} nós</p>
              </div>
              <Navigation className="h-8 w-8 text-muted-foreground opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heading</p>
                <p className="text-2xl font-bold">{subData.heading}°</p>
              </div>
              <RotateCcw className="h-8 w-8 text-muted-foreground opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="missions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="missions">Missões</TabsTrigger>
          <TabsTrigger value="waypoints">Waypoints</TabsTrigger>
          <TabsTrigger value="telemetry">Telemetria</TabsTrigger>
        </TabsList>

        <TabsContent value="missions">
          <Card>
            <CardHeader>
              <CardTitle>Missões Ativas</CardTitle>
              <CardDescription>Gerenciamento de missões autônomas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeMissions.map(mission => (
                <div key={mission.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{mission.name}</p>
                    <Badge 
                      className={
                        mission.status === "active" ? "bg-success/10 text-success" :
                        mission.status === "completed" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }
                    >
                      {mission.status === "active" ? "Em Progresso" :
                       mission.status === "completed" ? "Concluída" : "Agendada"}
                    </Badge>
                  </div>
                  <Progress value={mission.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">{mission.progress}% concluído</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waypoints">
          <Card>
            <CardHeader>
              <CardTitle>Rota de Navegação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waypoints.map((wp, index) => (
                  <div key={wp.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wp.reached ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{wp.name}</p>
                      <p className="text-sm text-muted-foreground">{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</p>
                    </div>
                    <Badge variant={wp.reached ? "default" : "outline"}>
                      {wp.reached ? "Alcançado" : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telemetry">
          <Card>
            <CardHeader>
              <CardTitle>Telemetria em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pressão Externa</p>
                  <p className="text-xl font-bold">25.4 bar</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Temperatura</p>
                  <p className="text-xl font-bold">8.2°C</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Visibilidade</p>
                  <p className="text-xl font-bold">12m</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Distância Percorrida</p>
                  <p className="text-xl font-bold">{subData.distanceTraveled} km</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
