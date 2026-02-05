 /**
  * Operations Intelligence Hub
  * Advanced voyage planning, fleet optimization, and real-time operations
  * Based on Veson IMOS, Danaos, and NAPA patterns
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Ship, Navigation, Anchor, Fuel, Clock, TrendingUp,
   MapPin, AlertTriangle, CheckCircle, Target, Gauge,
   Wind, Waves, Thermometer, Calendar, DollarSign,
   BarChart3, Route, Compass, Globe, Activity, Brain,
   ArrowRight, Zap, RefreshCw, Eye, Timer, Truck
 } from "lucide-react";
 import { toast } from "sonner";
 
 // Voyage Estimate Interface (IMOS Pattern)
 interface VoyageEstimate {
   id: string;
   voyageNo: string;
   vessel: string;
   route: string;
   loadPort: string;
   dischargePort: string;
   cargoType: string;
   quantity: number;
   freightRate: number;
   currency: string;
   laycanStart: string;
   laycanEnd: string;
   estimatedDays: number;
   tceResult: number;
   bunkerCost: number;
   portCost: number;
   status: "draft" | "pending" | "approved" | "executed";
 }
 
 // Fleet Position Interface
 interface FleetPosition {
   id: string;
   vessel: string;
   imo: string;
   position: { lat: number; lng: number };
   destination: string;
   eta: string;
   speed: number;
   course: number;
   status: "sailing" | "port" | "anchor" | "drifting";
   lastPort: string;
   nextPort: string;
   fuelROB: { hfo: number; mgo: number };
   weather: { wind: number; waves: number; temp: number };
 }
 
 // Charter Party Terms
 interface CharterTerms {
   id: string;
   vessel: string;
   charterer: string;
   type: "voyage" | "time" | "bareboat";
   cpDate: string;
   laycan: string;
   loadPort: string;
   dischargePort: string;
   cargoDescription: string;
   freightRate: number;
   demurrageRate: number;
   despatchRate: number;
   laytimeHours: number;
   laytimeUsed: number;
   status: "active" | "completed" | "dispute";
 }
 
 // Mock data
 const voyageEstimates: VoyageEstimate[] = [
   {
     id: "1", voyageNo: "V-2026-001", vessel: "Nautilus Star", route: "Santos - Rotterdam",
     loadPort: "Santos", dischargePort: "Rotterdam", cargoType: "Soybean", quantity: 52000,
     freightRate: 42.50, currency: "USD", laycanStart: "2026-02-15", laycanEnd: "2026-02-20",
     estimatedDays: 28, tceResult: 18500, bunkerCost: 185000, portCost: 45000, status: "approved"
   },
   {
     id: "2", voyageNo: "V-2026-002", vessel: "Nautilus Explorer", route: "Paranaguá - Shanghai",
     loadPort: "Paranaguá", dischargePort: "Shanghai", cargoType: "Corn", quantity: 48000,
     freightRate: 55.00, currency: "USD", laycanStart: "2026-02-25", laycanEnd: "2026-03-02",
     estimatedDays: 45, tceResult: 22300, bunkerCost: 295000, portCost: 52000, status: "pending"
   },
   {
     id: "3", voyageNo: "V-2026-003", vessel: "Nautilus Pioneer", route: "Rio Grande - Antwerp",
     loadPort: "Rio Grande", dischargePort: "Antwerp", cargoType: "Soybean Meal", quantity: 35000,
     freightRate: 48.00, currency: "USD", laycanStart: "2026-03-01", laycanEnd: "2026-03-05",
     estimatedDays: 24, tceResult: 15800, bunkerCost: 142000, portCost: 38000, status: "draft"
   }
 ];
 
 const fleetPositions: FleetPosition[] = [
   {
     id: "1", vessel: "Nautilus Star", imo: "9876543", 
     position: { lat: -23.9618, lng: -46.3322 }, destination: "Rotterdam", 
     eta: "2026-02-18T14:00:00Z", speed: 12.5, course: 45,
     status: "port", lastPort: "Santos", nextPort: "Rotterdam",
     fuelROB: { hfo: 850, mgo: 120 },
     weather: { wind: 15, waves: 1.2, temp: 28 }
   },
   {
     id: "2", vessel: "Nautilus Explorer", imo: "9876544",
     position: { lat: -8.0476, lng: -34.8770 }, destination: "Shanghai",
     eta: "2026-03-15T08:00:00Z", speed: 14.2, course: 78,
     status: "sailing", lastPort: "Paranaguá", nextPort: "Cape Town",
     fuelROB: { hfo: 1200, mgo: 180 },
     weather: { wind: 22, waves: 2.5, temp: 26 }
   },
   {
     id: "3", vessel: "Nautilus Pioneer", imo: "9876545",
     position: { lat: -32.0350, lng: -52.0986 }, destination: "Antwerp",
     eta: "2026-02-28T10:00:00Z", speed: 0, course: 0,
     status: "anchor", lastPort: "Buenos Aires", nextPort: "Rio Grande",
     fuelROB: { hfo: 650, mgo: 95 },
     weather: { wind: 8, waves: 0.5, temp: 24 }
   }
 ];
 
 const charterTerms: CharterTerms[] = [
   {
     id: "1", vessel: "Nautilus Star", charterer: "Cargill SA", type: "voyage",
     cpDate: "2026-01-20", laycan: "15-20 Feb 2026", loadPort: "Santos",
     dischargePort: "Rotterdam", cargoDescription: "52,000 MT Soybean in bulk",
     freightRate: 42.50, demurrageRate: 45000, despatchRate: 22500,
     laytimeHours: 96, laytimeUsed: 72, status: "active"
   },
   {
     id: "2", vessel: "Nautilus Explorer", charterer: "Bunge Global", type: "voyage",
     cpDate: "2026-01-28", laycan: "25 Feb - 02 Mar 2026", loadPort: "Paranaguá",
     dischargePort: "Shanghai", cargoDescription: "48,000 MT Corn in bulk",
     freightRate: 55.00, demurrageRate: 48000, despatchRate: 24000,
     laytimeHours: 120, laytimeUsed: 0, status: "active"
   }
 ];
 
 export default function OperationsIntelligenceHub() {
   const [selectedVoyage, setSelectedVoyage] = useState<VoyageEstimate | null>(voyageEstimates[0]);
   const [selectedVessel, setSelectedVessel] = useState<FleetPosition | null>(fleetPositions[0]);
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case "approved": case "active": case "sailing": return "bg-success/10 text-success";
       case "pending": case "anchor": return "bg-warning/10 text-warning";
       case "draft": case "drifting": return "bg-muted text-muted-foreground";
       case "port": return "bg-primary/10 text-primary";
       case "dispute": return "bg-destructive/10 text-destructive";
       default: return "bg-muted";
     }
   };
 
   const totalTCE = voyageEstimates.reduce((sum, v) => sum + v.tceResult, 0);
   const avgTCE = totalTCE / voyageEstimates.length;
   const sailingVessels = fleetPositions.filter(f => f.status === "sailing").length;
   const activeCharters = charterTerms.filter(c => c.status === "active").length;
 
   return (
     <div className="space-y-6">
       {/* Header KPIs */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         <Card className="border-l-4 border-l-primary">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Ship className="h-4 w-4 text-primary" />
               <span className="text-xs text-muted-foreground">Frota Ativa</span>
             </div>
             <p className="text-2xl font-bold">{fleetPositions.length}</p>
             <p className="text-xs text-success">+2 vs mês anterior</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-success">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Navigation className="h-4 w-4 text-success" />
               <span className="text-xs text-muted-foreground">Navegando</span>
             </div>
             <p className="text-2xl font-bold">{sailingVessels}</p>
             <p className="text-xs text-muted-foreground">de {fleetPositions.length} embarcações</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-warning">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <DollarSign className="h-4 w-4 text-warning" />
               <span className="text-xs text-muted-foreground">TCE Médio</span>
             </div>
             <p className="text-2xl font-bold">${avgTCE.toFixed(0)}</p>
             <p className="text-xs text-success">+12% vs mercado</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-info">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Route className="h-4 w-4 text-info" />
               <span className="text-xs text-muted-foreground">Viagens Planejadas</span>
             </div>
             <p className="text-2xl font-bold">{voyageEstimates.length}</p>
             <p className="text-xs text-muted-foreground">{voyageEstimates.filter(v => v.status === "approved").length} aprovadas</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-purple-500">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Target className="h-4 w-4 text-purple-500" />
               <span className="text-xs text-muted-foreground">Charters Ativos</span>
             </div>
             <p className="text-2xl font-bold">{activeCharters}</p>
             <p className="text-xs text-muted-foreground">{charterTerms.length} total</p>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-cyan-500">
           <CardContent className="p-4">
             <div className="flex items-center gap-2 mb-1">
               <Fuel className="h-4 w-4 text-cyan-500" />
               <span className="text-xs text-muted-foreground">Consumo Médio</span>
             </div>
             <p className="text-2xl font-bold">28.5 MT</p>
             <p className="text-xs text-success">-5% otimizado</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs defaultValue="voyage-estimates" className="space-y-4">
         <TabsList className="grid w-full grid-cols-5">
           <TabsTrigger value="voyage-estimates" className="gap-2">
             <BarChart3 className="h-4 w-4" />
             Voyage Estimates
           </TabsTrigger>
           <TabsTrigger value="fleet-position" className="gap-2">
             <Globe className="h-4 w-4" />
             Fleet Position
           </TabsTrigger>
           <TabsTrigger value="charter-party" className="gap-2">
             <Target className="h-4 w-4" />
             Charter Party
           </TabsTrigger>
           <TabsTrigger value="bunker-planning" className="gap-2">
             <Fuel className="h-4 w-4" />
             Bunker Planning
           </TabsTrigger>
           <TabsTrigger value="ai-optimization" className="gap-2">
             <Brain className="h-4 w-4" />
             AI Optimization
           </TabsTrigger>
         </TabsList>
 
         {/* Voyage Estimates Tab */}
         <TabsContent value="voyage-estimates" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Voyage List */}
             <Card className="lg:col-span-1">
               <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                   <span className="flex items-center gap-2">
                     <Route className="h-5 w-5" />
                     Estimativas
                   </span>
                   <Button size="sm" variant="outline">+ Nova</Button>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ScrollArea className="h-[400px]">
                   <div className="space-y-3">
                     {voyageEstimates.map((voyage) => (
                       <div
                         key={voyage.id}
                         onClick={() => setSelectedVoyage(voyage)}
                         className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                           selectedVoyage?.id === voyage.id ? "border-primary bg-primary/5" : ""
                         }`}
                       >
                         <div className="flex items-center justify-between mb-2">
                           <span className="font-medium">{voyage.voyageNo}</span>
                           <Badge className={getStatusColor(voyage.status)}>
                             {voyage.status.toUpperCase()}
                           </Badge>
                         </div>
                         <p className="text-sm text-muted-foreground">{voyage.vessel}</p>
                         <p className="text-xs text-muted-foreground">{voyage.route}</p>
                         <div className="flex items-center justify-between mt-2">
                           <span className="text-xs">TCE:</span>
                           <span className="font-bold text-success">${voyage.tceResult.toLocaleString()}/day</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               </CardContent>
             </Card>
 
             {/* Voyage Details */}
             <Card className="lg:col-span-2">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <BarChart3 className="h-5 w-5" />
                   Voyage Estimate Calculator
                   <Badge variant="outline">IMOS Pattern</Badge>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {selectedVoyage ? (
                   <div className="space-y-6">
                     {/* Voyage Header */}
                     <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                       <div>
                         <p className="text-xs text-muted-foreground">Voyage</p>
                         <p className="font-bold">{selectedVoyage.voyageNo}</p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground">Vessel</p>
                         <p className="font-bold">{selectedVoyage.vessel}</p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground">Laycan</p>
                         <p className="font-bold">{selectedVoyage.laycanStart} to {selectedVoyage.laycanEnd}</p>
                       </div>
                     </div>
 
                     {/* Route & Cargo */}
                     <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 border rounded-lg">
                         <p className="text-xs text-muted-foreground mb-2">Route</p>
                         <div className="flex items-center gap-2">
                           <MapPin className="h-4 w-4 text-primary" />
                           <span className="font-medium">{selectedVoyage.loadPort}</span>
                           <ArrowRight className="h-4 w-4 text-muted-foreground" />
                           <span className="font-medium">{selectedVoyage.dischargePort}</span>
                         </div>
                       </div>
                       <div className="p-4 border rounded-lg">
                         <p className="text-xs text-muted-foreground mb-2">Cargo</p>
                         <div className="flex items-center gap-2">
                           <Truck className="h-4 w-4 text-warning" />
                           <span className="font-medium">{selectedVoyage.quantity.toLocaleString()} MT {selectedVoyage.cargoType}</span>
                         </div>
                       </div>
                     </div>
 
                     {/* P&L Breakdown */}
                     <div className="space-y-3">
                       <h4 className="font-semibold">P&L Breakdown</h4>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <div className="flex justify-between p-2 bg-success/10 rounded">
                             <span>Freight Revenue</span>
                             <span className="font-bold text-success">
                               ${(selectedVoyage.quantity * selectedVoyage.freightRate).toLocaleString()}
                             </span>
                           </div>
                           <div className="flex justify-between p-2 bg-muted rounded">
                             <span>Rate</span>
                             <span className="font-medium">${selectedVoyage.freightRate}/MT</span>
                           </div>
                         </div>
                         <div className="space-y-2">
                           <div className="flex justify-between p-2 bg-destructive/10 rounded">
                             <span>Bunker Cost</span>
                             <span className="font-bold text-destructive">-${selectedVoyage.bunkerCost.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between p-2 bg-destructive/10 rounded">
                             <span>Port Cost</span>
                             <span className="font-bold text-destructive">-${selectedVoyage.portCost.toLocaleString()}</span>
                           </div>
                         </div>
                       </div>
                     </div>
 
                     {/* TCE Result */}
                     <div className="p-4 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg">
                       <div className="flex items-center justify-between">
                         <div>
                           <p className="text-sm text-muted-foreground">Time Charter Equivalent (TCE)</p>
                           <p className="text-3xl font-bold text-primary">${selectedVoyage.tceResult.toLocaleString()}/day</p>
                         </div>
                         <div className="text-right">
                           <p className="text-sm text-muted-foreground">Duration</p>
                           <p className="text-xl font-bold">{selectedVoyage.estimatedDays} days</p>
                         </div>
                       </div>
                     </div>
 
                     <div className="flex gap-2">
                       <Button className="flex-1" onClick={() => toast.success("Viagem aprovada!")}>
                         <CheckCircle className="h-4 w-4 mr-2" />
                         Aprovar Viagem
                       </Button>
                       <Button variant="outline" onClick={() => toast.info("Recalculando...")}>
                         <RefreshCw className="h-4 w-4 mr-2" />
                         Recalcular
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-12 text-muted-foreground">
                     Selecione uma viagem para ver detalhes
                   </div>
                 )}
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Fleet Position Tab */}
         <TabsContent value="fleet-position" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {fleetPositions.map((vessel) => (
               <Card key={vessel.id} className={`${selectedVessel?.id === vessel.id ? "border-primary" : ""}`}>
                 <CardHeader className="pb-2">
                   <CardTitle className="flex items-center justify-between">
                     <span className="flex items-center gap-2">
                       <Ship className="h-5 w-5" />
                       {vessel.vessel}
                     </span>
                     <Badge className={getStatusColor(vessel.status)}>
                       {vessel.status.toUpperCase()}
                     </Badge>
                   </CardTitle>
                   <CardDescription>IMO: {vessel.imo}</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {/* Position & Navigation */}
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-muted/50 rounded-lg">
                       <div className="flex items-center gap-2 mb-1">
                         <MapPin className="h-4 w-4 text-primary" />
                         <span className="text-xs text-muted-foreground">Position</span>
                       </div>
                       <p className="text-sm font-mono">
                         {vessel.position.lat.toFixed(4)}°, {vessel.position.lng.toFixed(4)}°
                       </p>
                     </div>
                     <div className="p-3 bg-muted/50 rounded-lg">
                       <div className="flex items-center gap-2 mb-1">
                         <Compass className="h-4 w-4 text-warning" />
                         <span className="text-xs text-muted-foreground">Course / Speed</span>
                       </div>
                       <p className="text-sm font-medium">{vessel.course}° / {vessel.speed} kts</p>
                     </div>
                   </div>
 
                   {/* Route Info */}
                   <div className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="text-center">
                       <p className="text-xs text-muted-foreground">Last Port</p>
                       <p className="font-medium">{vessel.lastPort}</p>
                     </div>
                     <ArrowRight className="h-5 w-5 text-muted-foreground" />
                     <div className="text-center">
                       <p className="text-xs text-muted-foreground">Next Port</p>
                       <p className="font-medium">{vessel.nextPort}</p>
                     </div>
                     <div className="text-center">
                       <p className="text-xs text-muted-foreground">ETA</p>
                       <p className="font-medium">{new Date(vessel.eta).toLocaleDateString()}</p>
                     </div>
                   </div>
 
                   {/* Bunker ROB */}
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <div className="flex justify-between text-sm mb-1">
                         <span>HFO</span>
                         <span>{vessel.fuelROB.hfo} MT</span>
                       </div>
                       <Progress value={(vessel.fuelROB.hfo / 1500) * 100} className="h-2" />
                     </div>
                     <div>
                       <div className="flex justify-between text-sm mb-1">
                         <span>MGO</span>
                         <span>{vessel.fuelROB.mgo} MT</span>
                       </div>
                       <Progress value={(vessel.fuelROB.mgo / 200) * 100} className="h-2" />
                     </div>
                   </div>
 
                   {/* Weather */}
                   <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg">
                     <div className="flex items-center gap-2">
                       <Wind className="h-4 w-4 text-blue-500" />
                       <span>{vessel.weather.wind} kts</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Waves className="h-4 w-4 text-cyan-500" />
                       <span>{vessel.weather.waves}m</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Thermometer className="h-4 w-4 text-orange-500" />
                       <span>{vessel.weather.temp}°C</span>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         </TabsContent>
 
         {/* Charter Party Tab */}
         <TabsContent value="charter-party" className="space-y-4">
           <div className="space-y-4">
             {charterTerms.map((charter) => (
               <Card key={charter.id}>
                 <CardHeader>
                   <div className="flex items-center justify-between">
                     <CardTitle className="flex items-center gap-2">
                       <Target className="h-5 w-5" />
                       {charter.vessel} - {charter.type.toUpperCase()} Charter
                     </CardTitle>
                     <Badge className={getStatusColor(charter.status)}>
                       {charter.status.toUpperCase()}
                     </Badge>
                   </div>
                   <CardDescription>Charterer: {charter.charterer} | CP Date: {charter.cpDate}</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {/* Route & Cargo */}
                   <div className="grid grid-cols-4 gap-4">
                     <div className="p-3 border rounded-lg">
                       <p className="text-xs text-muted-foreground">Load Port</p>
                       <p className="font-medium">{charter.loadPort}</p>
                     </div>
                     <div className="p-3 border rounded-lg">
                       <p className="text-xs text-muted-foreground">Discharge Port</p>
                       <p className="font-medium">{charter.dischargePort}</p>
                     </div>
                     <div className="p-3 border rounded-lg">
                       <p className="text-xs text-muted-foreground">Laycan</p>
                       <p className="font-medium">{charter.laycan}</p>
                     </div>
                     <div className="p-3 border rounded-lg">
                       <p className="text-xs text-muted-foreground">Freight Rate</p>
                       <p className="font-medium">${charter.freightRate}/MT</p>
                     </div>
                   </div>
 
                   {/* Laytime Calculator */}
                   <div className="p-4 bg-gradient-to-r from-warning/10 to-orange-500/10 rounded-lg">
                     <h4 className="font-semibold mb-3 flex items-center gap-2">
                       <Timer className="h-4 w-4" />
                       Laytime Calculator
                     </h4>
                     <div className="grid grid-cols-4 gap-4">
                       <div>
                         <p className="text-xs text-muted-foreground">Allowed</p>
                         <p className="text-xl font-bold">{charter.laytimeHours}h</p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground">Used</p>
                         <p className="text-xl font-bold">{charter.laytimeUsed}h</p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground">Balance</p>
                         <p className={`text-xl font-bold ${charter.laytimeUsed > charter.laytimeHours ? "text-destructive" : "text-success"}`}>
                           {charter.laytimeHours - charter.laytimeUsed}h
                         </p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground">
                           {charter.laytimeUsed > charter.laytimeHours ? "Demurrage" : "Despatch"}
                         </p>
                         <p className={`text-xl font-bold ${charter.laytimeUsed > charter.laytimeHours ? "text-destructive" : "text-success"}`}>
                           ${Math.abs((charter.laytimeHours - charter.laytimeUsed) * (charter.laytimeUsed > charter.laytimeHours ? charter.demurrageRate : charter.despatchRate) / 24).toLocaleString()}
                         </p>
                       </div>
                     </div>
                     <Progress 
                       value={(charter.laytimeUsed / charter.laytimeHours) * 100} 
                       className={`mt-3 h-3 ${charter.laytimeUsed > charter.laytimeHours ? "[&>div]:bg-destructive" : ""}`}
                     />
                   </div>
 
                   {/* Rates */}
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-destructive/10 rounded-lg">
                       <p className="text-xs text-muted-foreground">Demurrage Rate</p>
                       <p className="text-lg font-bold text-destructive">${charter.demurrageRate.toLocaleString()}/day</p>
                     </div>
                     <div className="p-3 bg-success/10 rounded-lg">
                       <p className="text-xs text-muted-foreground">Despatch Rate</p>
                       <p className="text-lg font-bold text-success">${charter.despatchRate.toLocaleString()}/day</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         </TabsContent>
 
         {/* Bunker Planning Tab */}
         <TabsContent value="bunker-planning" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Fuel className="h-5 w-5" />
                 Bunker Planning & Optimization
                 <Badge variant="outline">AI-Powered</Badge>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-center py-12">
                 <Fuel className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                 <h3 className="text-lg font-semibold mb-2">Bunker Optimization Engine</h3>
                 <p className="text-muted-foreground max-w-md mx-auto">
                   Otimização de abastecimento com análise de preços portuários, 
                   consumo previsto e rotas alternativas.
                 </p>
                 <Button className="mt-4" onClick={() => toast.info("Abrindo planejador de bunker...")}>
                   <Zap className="h-4 w-4 mr-2" />
                   Iniciar Planejamento
                 </Button>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* AI Optimization Tab */}
         <TabsContent value="ai-optimization" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="border-primary/20">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Brain className="h-5 w-5 text-primary" />
                   Route Optimization AI
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="p-4 bg-primary/5 rounded-lg">
                   <h4 className="font-semibold mb-2">Recomendação de Rota</h4>
                   <p className="text-sm text-muted-foreground mb-3">
                     Rota alternativa via Cape of Good Hope pode economizar 2 dias e $18,000 em bunker.
                   </p>
                   <Button size="sm" onClick={() => toast.success("Rota aplicada!")}>
                     Aplicar Sugestão
                   </Button>
                 </div>
                 <div className="p-4 bg-success/5 rounded-lg">
                   <h4 className="font-semibold mb-2">Speed Optimization</h4>
                   <p className="text-sm text-muted-foreground mb-3">
                     Reduzir velocidade para 11.5 kts pode melhorar TCE em $1,200/dia.
                   </p>
                   <Button size="sm" variant="outline" onClick={() => toast.info("Simulando...")}>
                     Simular Cenário
                   </Button>
                 </div>
               </CardContent>
             </Card>
 
             <Card className="border-warning/20">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <AlertTriangle className="h-5 w-5 text-warning" />
                   Market Intelligence
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="p-4 bg-warning/5 rounded-lg">
                   <h4 className="font-semibold mb-2">Baltic Index Alert</h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     BDI subiu 5% hoje. Oportunidade para novos fixtures.
                   </p>
                   <div className="flex gap-2">
                     <Badge>BDI: 1,847</Badge>
                     <Badge variant="outline" className="text-success">+5%</Badge>
                   </div>
                 </div>
                 <div className="p-4 bg-info/5 rounded-lg">
                   <h4 className="font-semibold mb-2">Bunker Price Trend</h4>
                   <p className="text-sm text-muted-foreground mb-2">
                     Preços em Singapore caíram 3%. Considere bunkering antecipado.
                   </p>
                   <div className="flex gap-2">
                     <Badge>VLSFO: $485/MT</Badge>
                     <Badge variant="outline" className="text-success">-3%</Badge>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
       </Tabs>
     </div>
   );
 }