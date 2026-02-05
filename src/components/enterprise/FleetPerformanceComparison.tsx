 /**
  * Fleet Performance Comparison
  * Comparativo de performance entre navios
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { 
   RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
 } from "recharts";
 import { Ship, Trophy, TrendingUp, Fuel, Clock, Shield, Users, Award } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface VesselMetrics {
   id: string;
   name: string;
   type: string;
   metrics: {
     efficiency: number;
     onTime: number;
     fuelEconomy: number;
     safety: number;
     maintenance: number;
     crew: number;
   };
   voyages: number;
   totalDistance: number;
   avgSpeed: number;
   rank: number;
 }
 
 interface FleetPerformanceComparisonProps {
   vessels?: VesselMetrics[];
 }
 
 const defaultVessels: VesselMetrics[] = [
   {
     id: "v1",
     name: "MV Nautilus Star",
     type: "Container",
     metrics: { efficiency: 94, onTime: 96, fuelEconomy: 88, safety: 98, maintenance: 92, crew: 95 },
     voyages: 12,
     totalDistance: 45000,
     avgSpeed: 14.5,
     rank: 1
   },
   {
     id: "v2",
     name: "MV Nautilus Explorer",
     type: "Bulk Carrier",
     metrics: { efficiency: 89, onTime: 92, fuelEconomy: 91, safety: 95, maintenance: 88, crew: 90 },
     voyages: 10,
     totalDistance: 38000,
     avgSpeed: 13.2,
     rank: 2
   },
   {
     id: "v3",
     name: "MV Nautilus Voyager",
     type: "Tanker",
     metrics: { efficiency: 86, onTime: 88, fuelEconomy: 85, safety: 97, maintenance: 90, crew: 88 },
     voyages: 8,
     totalDistance: 32000,
     avgSpeed: 12.8,
     rank: 3
   },
   {
     id: "v4",
     name: "MV Nautilus Pioneer",
     type: "RoRo",
     metrics: { efficiency: 82, onTime: 85, fuelEconomy: 80, safety: 94, maintenance: 85, crew: 86 },
     voyages: 6,
     totalDistance: 24000,
     avgSpeed: 11.5,
     rank: 4
   }
 ];
 
 export function FleetPerformanceComparison({ vessels = defaultVessels }: FleetPerformanceComparisonProps) {
   const [selectedVessels, setSelectedVessels] = useState<string[]>(
     vessels.slice(0, 3).map(v => v.id)
   );
   const [chartType, setChartType] = useState<"radar" | "bar">("radar");
 
   const selectedData = vessels.filter(v => selectedVessels.includes(v.id));
 
   // Prepare data for charts
   const radarData = [
     { metric: "Eficiência", ...Object.fromEntries(selectedData.map(v => [v.name, v.metrics.efficiency])) },
     { metric: "Pontualidade", ...Object.fromEntries(selectedData.map(v => [v.name, v.metrics.onTime])) },
     { metric: "Economia Combustível", ...Object.fromEntries(selectedData.map(v => [v.name, v.metrics.fuelEconomy])) },
     { metric: "Segurança", ...Object.fromEntries(selectedData.map(v => [v.name, v.metrics.safety])) },
     { metric: "Manutenção", ...Object.fromEntries(selectedData.map(v => [v.name, v.metrics.maintenance])) },
     { metric: "Tripulação", ...Object.fromEntries(selectedData.map(v => [v.name, v.metrics.crew])) },
   ];
 
   const barData = selectedData.map(v => ({
     name: v.name.replace("MV Nautilus ", ""),
     eficiência: v.metrics.efficiency,
     pontualidade: v.metrics.onTime,
     combustível: v.metrics.fuelEconomy,
     segurança: v.metrics.safety,
   }));
 
   const COLORS = ["hsl(var(--primary))", "hsl(220, 70%, 50%)", "hsl(150, 70%, 40%)", "hsl(280, 70%, 50%)"];
 
   const toggleVessel = (id: string) => {
     setSelectedVessels(prev => 
       prev.includes(id) 
         ? prev.filter(v => v !== id) 
         : [...prev, id]
     );
   };
 
   const getOverallScore = (v: VesselMetrics) => {
     const metrics = Object.values(v.metrics);
     return Math.round(metrics.reduce((a, b) => a + b, 0) / metrics.length);
   };
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Trophy className="h-5 w-5 text-primary" />
           <h3 className="font-semibold">Comparativo de Performance da Frota</h3>
         </div>
         <Select value={chartType} onValueChange={(v) => setChartType(v as "radar" | "bar")}>
           <SelectTrigger className="w-32">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="radar">Radar</SelectItem>
             <SelectItem value="bar">Barras</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       {/* Vessel Selection */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         {vessels.map((vessel, idx) => {
           const isSelected = selectedVessels.includes(vessel.id);
           const score = getOverallScore(vessel);
 
           return (
             <Card 
               key={vessel.id}
               className={cn(
                 "cursor-pointer transition-all hover:shadow-md",
                 isSelected && "ring-2 ring-primary"
               )}
               onClick={() => toggleVessel(vessel.id)}
             >
               <CardContent className="p-3">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                     <Ship className="h-4 w-4 text-muted-foreground" />
                     <span className="text-sm font-medium truncate">
                       {vessel.name.replace("MV ", "")}
                     </span>
                   </div>
                   {vessel.rank === 1 && (
                     <Trophy className="h-4 w-4 text-amber-500" />
                   )}
                 </div>
                 <div className="flex items-center justify-between">
                   <Badge variant="outline" className="text-xs">{vessel.type}</Badge>
                   <span className={cn(
                     "font-bold",
                     score >= 90 ? "text-success" : score >= 80 ? "text-primary" : "text-warning"
                   )}>
                     {score}%
                   </span>
                 </div>
               </CardContent>
             </Card>
           );
         })}
       </div>
 
       {/* Charts */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Main Chart */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm">Comparativo Multi-dimensional</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 {chartType === "radar" ? (
                   <RadarChart data={radarData}>
                     <PolarGrid />
                     <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 100]} />
                     {selectedData.map((vessel, idx) => (
                       <Radar
                         key={vessel.id}
                         name={vessel.name}
                         dataKey={vessel.name}
                         stroke={COLORS[idx]}
                         fill={COLORS[idx]}
                         fillOpacity={0.2}
                       />
                     ))}
                     <Tooltip />
                     <Legend />
                   </RadarChart>
                 ) : (
                   <BarChart data={barData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                     <YAxis domain={[0, 100]} />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey="eficiência" fill={COLORS[0]} />
                     <Bar dataKey="pontualidade" fill={COLORS[1]} />
                     <Bar dataKey="combustível" fill={COLORS[2]} />
                     <Bar dataKey="segurança" fill={COLORS[3]} />
                   </BarChart>
                 )}
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
 
         {/* Ranking & Details */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm flex items-center gap-2">
               <Award className="h-4 w-4 text-primary" />
               Ranking de Performance
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
             {vessels.sort((a, b) => a.rank - b.rank).map((vessel, idx) => {
               const score = getOverallScore(vessel);
               
               return (
                 <div key={vessel.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                   <div className={cn(
                     "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                     idx === 0 && "bg-amber-500 text-white",
                     idx === 1 && "bg-gray-400 text-white",
                     idx === 2 && "bg-amber-700 text-white",
                     idx > 2 && "bg-muted text-muted-foreground"
                   )}>
                     #{idx + 1}
                   </div>
                   <div className="flex-1">
                     <p className="font-medium text-sm">{vessel.name}</p>
                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
                       <span>{vessel.voyages} viagens</span>
                       <span>{(vessel.totalDistance / 1000).toFixed(0)}K nm</span>
                       <span>{vessel.avgSpeed} kn</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className={cn(
                       "text-xl font-bold",
                       score >= 90 ? "text-success" : score >= 80 ? "text-primary" : "text-warning"
                     )}>
                       {score}%
                     </p>
                     <Progress value={score} className="h-1 w-20" />
                   </div>
                 </div>
               );
             })}
           </CardContent>
         </Card>
       </div>
 
       {/* Metrics Breakdown */}
       <Card>
         <CardHeader className="pb-2">
           <CardTitle className="text-sm">Métricas Detalhadas</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
             {[
               { key: "efficiency", label: "Eficiência", icon: TrendingUp },
               { key: "onTime", label: "Pontualidade", icon: Clock },
               { key: "fuelEconomy", label: "Combustível", icon: Fuel },
               { key: "safety", label: "Segurança", icon: Shield },
               { key: "maintenance", label: "Manutenção", icon: Ship },
               { key: "crew", label: "Tripulação", icon: Users },
             ].map(({ key, label, icon: Icon }) => {
               const values = selectedData.map(v => v.metrics[key as keyof typeof v.metrics]);
               const avg = values.reduce((a, b) => a + b, 0) / values.length;
               const best = vessels.reduce((best, v) => 
                 v.metrics[key as keyof typeof v.metrics] > (best?.metrics[key as keyof typeof best.metrics] || 0) ? v : best
               , vessels[0]);
 
               return (
                 <div key={key} className="text-center p-3 rounded-lg bg-muted/30">
                   <Icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                   <p className="text-xs text-muted-foreground">{label}</p>
                   <p className="text-lg font-bold">{avg.toFixed(0)}%</p>
                   <p className="text-xs text-muted-foreground">
                     Líder: {best?.name.replace("MV Nautilus ", "")}
                   </p>
                 </div>
               );
             })}
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }
 
 export default FleetPerformanceComparison;