 /**
  * Tracking Intelligence Component
  * Based on best practices from MarineTraffic, VesselFinder, StratumFive
  * Features: Real-time AIS, weather overlay, predictive analytics
  */
 
 import { useState } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { 
   Ship, MapPin, Navigation, Clock, Fuel, Wind, Waves,
   Thermometer, AlertTriangle, Target, Satellite, Radio,
   TrendingUp, Brain, Eye, BarChart3, Anchor, Compass
 } from "lucide-react";
 
 interface VesselPosition {
   id: string;
   name: string;
   imo: string;
   type: string;
   position: { lat: number; lon: number };
   course: number;
   speed: number;
   status: "underway" | "anchored" | "moored" | "not_available";
   destination: string;
   eta: string;
   lastUpdate: string;
   weather: { wind: number; waves: number; temp: number };
   fuel: { consumption: number; remaining: number; efficiency: number };
   connectivity: "vsat" | "lte" | "offline";
 }
 
 const mockVessels: VesselPosition[] = [
   {
     id: "1", name: "MV Atlantic Explorer", imo: "9876543", type: "OSV",
     position: { lat: -23.9618, lon: -46.3322 }, course: 145, speed: 12.5,
     status: "underway", destination: "Santos, BR", eta: "2024-02-15T14:30:00",
     lastUpdate: "2024-02-14T10:25:00",
     weather: { wind: 18, waves: 1.8, temp: 28 },
     fuel: { consumption: 4.2, remaining: 78, efficiency: 94 },
     connectivity: "vsat"
   },
   {
     id: "2", name: "MV Pacific Voyager", imo: "9876544", type: "PSV",
     position: { lat: -22.8967, lon: -43.1729 }, course: 0, speed: 0,
     status: "anchored", destination: "Rio de Janeiro, BR", eta: "2024-02-14T18:00:00",
     lastUpdate: "2024-02-14T10:20:00",
     weather: { wind: 12, waves: 0.8, temp: 30 },
     fuel: { consumption: 0.5, remaining: 92, efficiency: 98 },
     connectivity: "lte"
   },
   {
     id: "3", name: "MV Nordic Queen", imo: "9876545", type: "AHTS",
     position: { lat: -25.4289, lon: -49.2671 }, course: 270, speed: 8.2,
     status: "underway", destination: "Paranaguá, BR", eta: "2024-02-16T08:00:00",
     lastUpdate: "2024-02-14T10:15:00",
     weather: { wind: 25, waves: 2.5, temp: 24 },
     fuel: { consumption: 5.8, remaining: 65, efficiency: 87 },
     connectivity: "vsat"
   },
 ];
 
 export default function TrackingIntelligence() {
   const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
 
   const underwayCount = mockVessels.filter(v => v.status === "underway").length;
   const avgSpeed = mockVessels.filter(v => v.status === "underway").reduce((sum, v) => sum + v.speed, 0) / (underwayCount || 1);
   const avgEfficiency = mockVessels.reduce((sum, v) => sum + v.fuel.efficiency, 0) / mockVessels.length;
   const weatherAlerts = mockVessels.filter(v => v.weather.wind > 20 || v.weather.waves > 2).length;
 
   const getStatusConfig = (status: string) => {
     const config: Record<string, { color: string; label: string; icon: typeof Ship }> = {
       underway: { color: "text-success", label: "Em Navegação", icon: Navigation },
       anchored: { color: "text-warning", label: "Fundeado", icon: Anchor },
       moored: { color: "text-info", label: "Atracado", icon: MapPin },
       not_available: { color: "text-muted-foreground", label: "Indisponível", icon: Ship },
     };
     return config[status] || config.not_available;
   };
 
   const getConnectivityConfig = (conn: string) => {
     const config: Record<string, { color: string; label: string }> = {
       vsat: { color: "text-success", label: "VSAT" },
       lte: { color: "text-info", label: "LTE/4G" },
       offline: { color: "text-destructive", label: "Offline" },
     };
     return config[conn] || config.offline;
   };
 
   return (
     <div className="space-y-6">
       {/* KPI Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="p-4 text-center">
             <Ship className="h-5 w-5 text-primary mx-auto mb-2" />
             <p className="text-2xl font-bold">{vessels.length}</p>
             <p className="text-xs text-muted-foreground">Total Frota</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="p-4 text-center">
             <Navigation className="h-5 w-5 text-success mx-auto mb-2" />
             <p className="text-2xl font-bold">{underwayCount}</p>
             <p className="text-xs text-muted-foreground">Em Navegação</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-info/10 to-info/5">
           <CardContent className="p-4 text-center">
             <Compass className="h-5 w-5 text-info mx-auto mb-2" />
             <p className="text-2xl font-bold">{avgSpeed.toFixed(1)} kn</p>
             <p className="text-xs text-muted-foreground">Velocidade Média</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
           <CardContent className="p-4 text-center">
             <Fuel className="h-5 w-5 text-secondary-foreground mx-auto mb-2" />
             <p className="text-2xl font-bold">{avgEfficiency.toFixed(0)}%</p>
             <p className="text-xs text-muted-foreground">Eficiência Média</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
           <CardContent className="p-4 text-center">
             <Wind className="h-5 w-5 text-warning mx-auto mb-2" />
             <p className="text-2xl font-bold">{weatherAlerts}</p>
             <p className="text-xs text-muted-foreground">Alertas Meteo</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
           <CardContent className="p-4 text-center">
             <Satellite className="h-5 w-5 text-accent-foreground mx-auto mb-2" />
             <p className="text-2xl font-bold">{vessels.filter(v => v.connectivity !== "offline").length}</p>
             <p className="text-xs text-muted-foreground">Conectados</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Weather Alert */}
       {weatherAlerts > 0 && (
         <Card className="border-warning/50 bg-gradient-to-r from-warning/5 to-transparent">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-warning/10">
                   <Wind className="h-5 w-5 text-warning" />
                 </div>
                 <div>
                   <p className="font-semibold text-warning">⚠️ Alerta Meteorológico</p>
                   <p className="text-sm text-muted-foreground">
                     {weatherAlerts} embarcação(ões) em área com condições adversas (vento {">"} 20 kn ou ondas {">"} 2m)
                   </p>
                 </div>
               </div>
               <Button size="sm" variant="outline" className="gap-2">
                 <Eye className="h-4 w-4" />
                 Ver Previsão
               </Button>
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Fleet Tracking */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <MapPin className="h-5 w-5 text-primary" />
                 Rastreamento de Frota
               </CardTitle>
               <CardDescription>Posições AIS em tempo real com telemetria</CardDescription>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[450px]">
                 <div className="space-y-4">
                   {vessels.map((vessel) => {
                     const statusConfig = getStatusConfig(vessel.status);
                     const StatusIcon = statusConfig.icon;
                     const connConfig = getConnectivityConfig(vessel.connectivity);
                     
                     return (
                       <div 
                         key={vessel.id} 
                         className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                           selectedVessel?.id === vessel.id ? "ring-2 ring-primary" : ""
                         } ${vessel.weather.wind > 20 ? "border-warning/50" : ""}`}
                         onClick={() => setSelectedVessel(vessel)}
                       >
                         <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-primary/10">
                               <Ship className="h-5 w-5 text-primary" />
                             </div>
                             <div>
                               <p className="font-semibold">{vessel.name}</p>
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <span>IMO: {vessel.imo}</span>
                                 <Badge variant="outline" className="text-xs">{vessel.type}</Badge>
                               </div>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <Badge className={`${statusConfig.color} bg-transparent border`}>
                               <StatusIcon className="h-3 w-3 mr-1" />
                               {statusConfig.label}
                             </Badge>
                             <Badge variant="outline" className={connConfig.color}>
                               <Radio className="h-3 w-3 mr-1" />
                               {connConfig.label}
                             </Badge>
                           </div>
                         </div>
 
                         {/* Position & Navigation */}
                         <div className="grid grid-cols-4 gap-4 mt-3">
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className="text-lg font-bold">{vessel.speed.toFixed(1)} kn</p>
                             <p className="text-xs text-muted-foreground">Velocidade</p>
                           </div>
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className="text-lg font-bold">{vessel.course}°</p>
                             <p className="text-xs text-muted-foreground">Rumo</p>
                           </div>
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className="text-lg font-bold">{vessel.fuel.remaining}%</p>
                             <p className="text-xs text-muted-foreground">Combustível</p>
                           </div>
                           <div className="text-center p-2 bg-muted/50 rounded">
                             <p className={`text-lg font-bold ${vessel.fuel.efficiency < 90 ? "text-warning" : "text-success"}`}>
                               {vessel.fuel.efficiency}%
                             </p>
                             <p className="text-xs text-muted-foreground">Eficiência</p>
                           </div>
                         </div>
 
                         {/* Weather & Destination */}
                         <div className="flex items-center justify-between mt-3 text-sm">
                           <div className="flex items-center gap-4 text-muted-foreground">
                             <span className={`flex items-center gap-1 ${vessel.weather.wind > 20 ? "text-warning" : ""}`}>
                               <Wind className="h-3 w-3" />
                               {vessel.weather.wind} kn
                             </span>
                             <span className={`flex items-center gap-1 ${vessel.weather.waves > 2 ? "text-warning" : ""}`}>
                               <Waves className="h-3 w-3" />
                               {vessel.weather.waves}m
                             </span>
                             <span className="flex items-center gap-1">
                               <Thermometer className="h-3 w-3" />
                               {vessel.weather.temp}°C
                             </span>
                           </div>
                           <span className="flex items-center gap-1">
                             <Target className="h-3 w-3" />
                             {vessel.destination}
                           </span>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </div>
 
         {/* Vessel Details */}
         <div>
           {selectedVessel ? (
             <Card>
               <CardHeader>
                 <CardTitle className="text-base">{selectedVessel.name}</CardTitle>
                 <CardDescription>IMO: {selectedVessel.imo}</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* Position */}
                 <div className="p-3 bg-muted/50 rounded-lg">
                   <p className="text-xs text-muted-foreground mb-1">Posição Atual</p>
                   <p className="font-mono text-sm">
                     {selectedVessel.position.lat.toFixed(4)}°, {selectedVessel.position.lon.toFixed(4)}°
                   </p>
                   <p className="text-xs text-muted-foreground mt-1">
                     Atualizado: {new Date(selectedVessel.lastUpdate).toLocaleString("pt-BR")}
                   </p>
                 </div>
 
                 {/* Navigation */}
                 <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Navigation className="h-5 w-5 mx-auto mb-1 text-primary" />
                     <p className="text-xl font-bold">{selectedVessel.speed.toFixed(1)} kn</p>
                     <p className="text-xs text-muted-foreground">Velocidade</p>
                   </div>
                   <div className="p-3 bg-muted/50 rounded-lg text-center">
                     <Compass className="h-5 w-5 mx-auto mb-1 text-info" />
                     <p className="text-xl font-bold">{selectedVessel.course}°</p>
                     <p className="text-xs text-muted-foreground">Rumo</p>
                   </div>
                 </div>
 
                 {/* Destination & ETA */}
                 <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                   <div className="flex items-center justify-between mb-2">
                     <span className="flex items-center gap-2 text-sm">
                       <Target className="h-4 w-4" />
                       Destino
                     </span>
                     <span className="font-bold">{selectedVessel.destination}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="flex items-center gap-2 text-sm">
                       <Clock className="h-4 w-4" />
                       ETA
                     </span>
                     <span className="font-bold">{new Date(selectedVessel.eta).toLocaleString("pt-BR")}</span>
                   </div>
                 </div>
 
                 {/* Fuel */}
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <span className="text-sm">Combustível</span>
                     <span className="font-bold">{selectedVessel.fuel.remaining}%</span>
                   </div>
                   <Progress value={selectedVessel.fuel.remaining} className="h-2" />
                   <div className="flex justify-between text-xs text-muted-foreground">
                     <span>Consumo: {selectedVessel.fuel.consumption} t/dia</span>
                     <span>Eficiência: {selectedVessel.fuel.efficiency}%</span>
                   </div>
                 </div>
 
                 {/* Weather */}
                 <div className="grid grid-cols-3 gap-2">
                   <div className="p-2 bg-muted/50 rounded text-center">
                     <Wind className={`h-4 w-4 mx-auto ${selectedVessel.weather.wind > 20 ? "text-warning" : "text-muted-foreground"}`} />
                     <p className="font-bold">{selectedVessel.weather.wind} kn</p>
                   </div>
                   <div className="p-2 bg-muted/50 rounded text-center">
                     <Waves className={`h-4 w-4 mx-auto ${selectedVessel.weather.waves > 2 ? "text-warning" : "text-muted-foreground"}`} />
                     <p className="font-bold">{selectedVessel.weather.waves}m</p>
                   </div>
                   <div className="p-2 bg-muted/50 rounded text-center">
                     <Thermometer className="h-4 w-4 mx-auto text-muted-foreground" />
                     <p className="font-bold">{selectedVessel.weather.temp}°C</p>
                   </div>
                 </div>
 
                 <div className="flex gap-2">
                   <Button className="flex-1" size="sm">
                     <Eye className="h-4 w-4 mr-2" />
                     Ver no Mapa
                   </Button>
                   <Button variant="outline" size="sm">
                     <BarChart3 className="h-4 w-4" />
                   </Button>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <Card>
               <CardContent className="p-8 text-center text-muted-foreground">
                 <Ship className="h-12 w-12 mx-auto mb-3 opacity-50" />
                 <p>Selecione uma embarcação para ver detalhes</p>
               </CardContent>
             </Card>
           )}
         </div>
       </div>
     </div>
   );
 }