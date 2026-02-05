 /**
  * Laytime & Demurrage Calculator
  * Calculadora BIMCO para Laytime/Demurrage/Despatch
  */
 
 import React, { useState, useMemo } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { Separator } from "@/components/ui/separator";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { 
   Calculator, Clock, DollarSign, Ship, Anchor,
   Calendar, TrendingUp, TrendingDown, FileText, Download
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface LaytimeCalculation {
   allowedLaytime: number; // hours
   timeUsed: number; // hours
   demurrageRate: number; // USD per day
   despatchRate: number; // USD per day (usually 50% of demurrage)
   result: "demurrage" | "despatch" | "neutral";
   amount: number;
 }
 
 export function LaytimeDemurrageCalculator() {
   const [vesselName, setVesselName] = useState("MV Nautilus Star");
   const [charterParty, setCharterParty] = useState("GENCON 2022");
   const [cargoType, setCargoType] = useState("Grain");
   const [cargoQuantity, setCargoQuantity] = useState(50000);
   const [loadingRate, setLoadingRate] = useState(8000); // MT per day
   const [dischargingRate, setDischargingRate] = useState(6000);
   const [demurrageRate, setDemurrageRate] = useState(25000); // USD per day
   const [despatchPercentage, setDespatchPercentage] = useState(50);
 
   // Time entries
   const [norTendered, setNorTendered] = useState("2026-02-01T08:00");
   const [loadingStarted, setLoadingStarted] = useState("2026-02-01T14:00");
   const [loadingCompleted, setLoadingCompleted] = useState("2026-02-07T22:00");
   const [dischargingStarted, setDischargingStarted] = useState("2026-02-15T08:00");
   const [dischargingCompleted, setDischargingCompleted] = useState("2026-02-23T18:00");
 
   // Deductions
   const [weatherDeductions, setWeatherDeductions] = useState(12); // hours
   const [holidayDeductions, setHolidayDeductions] = useState(24); // hours
   const [otherDeductions, setOtherDeductions] = useState(0);
 
   // Calculate laytime
   const calculation = useMemo((): LaytimeCalculation => {
     // Allowed laytime based on rates
     const loadingLaytime = (cargoQuantity / loadingRate) * 24; // hours
     const dischargingLaytime = (cargoQuantity / dischargingRate) * 24; // hours
     const totalAllowedLaytime = loadingLaytime + dischargingLaytime;
 
     // Actual time used
     const loadingStart = new Date(loadingStarted);
     const loadingEnd = new Date(loadingCompleted);
     const dischargingStart = new Date(dischargingStarted);
     const dischargingEnd = new Date(dischargingCompleted);
 
     const loadingTimeUsed = (loadingEnd.getTime() - loadingStart.getTime()) / (1000 * 60 * 60);
     const dischargingTimeUsed = (dischargingEnd.getTime() - dischargingStart.getTime()) / (1000 * 60 * 60);
     const totalTimeUsed = loadingTimeUsed + dischargingTimeUsed;
 
     // Apply deductions
     const totalDeductions = weatherDeductions + holidayDeductions + otherDeductions;
     const netTimeUsed = totalTimeUsed - totalDeductions;
 
     // Calculate result
     const difference = netTimeUsed - totalAllowedLaytime;
     const despatchRate = (demurrageRate * despatchPercentage) / 100;
 
     if (difference > 0) {
       // Demurrage - vessel exceeded laytime
       const demurrageDays = difference / 24;
       return {
         allowedLaytime: totalAllowedLaytime,
         timeUsed: netTimeUsed,
         demurrageRate,
         despatchRate,
         result: "demurrage",
         amount: demurrageDays * demurrageRate
       };
     } else if (difference < 0) {
       // Despatch - vessel saved time
       const despatchDays = Math.abs(difference) / 24;
       return {
         allowedLaytime: totalAllowedLaytime,
         timeUsed: netTimeUsed,
         demurrageRate,
         despatchRate,
         result: "despatch",
         amount: despatchDays * despatchRate
       };
     } else {
       return {
         allowedLaytime: totalAllowedLaytime,
         timeUsed: netTimeUsed,
         demurrageRate,
         despatchRate,
         result: "neutral",
         amount: 0
       };
     }
   }, [
     cargoQuantity, loadingRate, dischargingRate, demurrageRate, despatchPercentage,
     loadingStarted, loadingCompleted, dischargingStarted, dischargingCompleted,
     weatherDeductions, holidayDeductions, otherDeductions
   ]);
 
   const formatHours = (hours: number) => {
     const days = Math.floor(hours / 24);
     const remainingHours = Math.round(hours % 24);
     return `${days}d ${remainingHours}h`;
   };
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Calculator className="h-5 w-5 text-primary" />
           <h3 className="font-semibold">Calculadora Laytime/Demurrage</h3>
           <Badge variant="outline">BIMCO Standard</Badge>
         </div>
         <Button variant="outline" size="sm">
           <Download className="h-4 w-4 mr-2" />
           Exportar SOF
         </Button>
       </div>
 
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Input Section */}
         <div className="lg:col-span-2 space-y-6">
           {/* Charter Party Details */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-sm flex items-center gap-2">
                 <FileText className="h-4 w-4" />
                 Detalhes do Charter Party
               </CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                 <Label className="text-xs">Embarcação</Label>
                 <Input value={vesselName} onChange={(e) => setVesselName(e.target.value)} />
               </div>
               <div>
                 <Label className="text-xs">Charter Party</Label>
                 <Select value={charterParty} onValueChange={setCharterParty}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="GENCON 2022">GENCON 2022</SelectItem>
                     <SelectItem value="ASBATANKVOY">ASBATANKVOY</SelectItem>
                     <SelectItem value="NYPE 2015">NYPE 2015</SelectItem>
                     <SelectItem value="BALTIME 1939">BALTIME 1939</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label className="text-xs">Tipo de Carga</Label>
                 <Input value={cargoType} onChange={(e) => setCargoType(e.target.value)} />
               </div>
               <div>
                 <Label className="text-xs">Quantidade (MT)</Label>
                 <Input 
                   type="number" 
                   value={cargoQuantity} 
                   onChange={(e) => setCargoQuantity(Number(e.target.value))} 
                 />
               </div>
             </CardContent>
           </Card>
 
           {/* Rates */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-sm flex items-center gap-2">
                 <DollarSign className="h-4 w-4" />
                 Taxas Contratuais
               </CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                 <Label className="text-xs">Taxa Carga (MT/dia)</Label>
                 <Input 
                   type="number" 
                   value={loadingRate} 
                   onChange={(e) => setLoadingRate(Number(e.target.value))} 
                 />
               </div>
               <div>
                 <Label className="text-xs">Taxa Descarga (MT/dia)</Label>
                 <Input 
                   type="number" 
                   value={dischargingRate} 
                   onChange={(e) => setDischargingRate(Number(e.target.value))} 
                 />
               </div>
               <div>
                 <Label className="text-xs">Demurrage (USD/dia)</Label>
                 <Input 
                   type="number" 
                   value={demurrageRate} 
                   onChange={(e) => setDemurrageRate(Number(e.target.value))} 
                 />
               </div>
               <div>
                 <Label className="text-xs">Despatch (% do Demurrage)</Label>
                 <Input 
                   type="number" 
                   value={despatchPercentage} 
                   onChange={(e) => setDespatchPercentage(Number(e.target.value))} 
                 />
               </div>
             </CardContent>
           </Card>
 
           {/* Time Events */}
           <Card>
             <CardHeader className="pb-3">
               <CardTitle className="text-sm flex items-center gap-2">
                 <Clock className="h-4 w-4" />
                 Eventos de Tempo (SOF)
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div>
                   <Label className="text-xs">NOR Tendered</Label>
                   <Input 
                     type="datetime-local" 
                     value={norTendered} 
                     onChange={(e) => setNorTendered(e.target.value)} 
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Início Carga</Label>
                   <Input 
                     type="datetime-local" 
                     value={loadingStarted} 
                     onChange={(e) => setLoadingStarted(e.target.value)} 
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Fim Carga</Label>
                   <Input 
                     type="datetime-local" 
                     value={loadingCompleted} 
                     onChange={(e) => setLoadingCompleted(e.target.value)} 
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Início Descarga</Label>
                   <Input 
                     type="datetime-local" 
                     value={dischargingStarted} 
                     onChange={(e) => setDischargingStarted(e.target.value)} 
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Fim Descarga</Label>
                   <Input 
                     type="datetime-local" 
                     value={dischargingCompleted} 
                     onChange={(e) => setDischargingCompleted(e.target.value)} 
                   />
                 </div>
               </div>
 
               <Separator />
 
               <div className="grid grid-cols-3 gap-4">
                 <div>
                   <Label className="text-xs">Deduções Clima (horas)</Label>
                   <Input 
                     type="number" 
                     value={weatherDeductions} 
                     onChange={(e) => setWeatherDeductions(Number(e.target.value))} 
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Deduções Feriados (horas)</Label>
                   <Input 
                     type="number" 
                     value={holidayDeductions} 
                     onChange={(e) => setHolidayDeductions(Number(e.target.value))} 
                   />
                 </div>
                 <div>
                   <Label className="text-xs">Outras Deduções (horas)</Label>
                   <Input 
                     type="number" 
                     value={otherDeductions} 
                     onChange={(e) => setOtherDeductions(Number(e.target.value))} 
                   />
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Results Section */}
         <div className="space-y-4">
           {/* Main Result */}
           <Card className={cn(
             "border-2",
             calculation.result === "demurrage" && "border-destructive bg-destructive/5",
             calculation.result === "despatch" && "border-success bg-success/5",
             calculation.result === "neutral" && "border-muted"
           )}>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm text-center">Resultado</CardTitle>
             </CardHeader>
             <CardContent className="text-center space-y-4">
               {calculation.result === "demurrage" ? (
                 <>
                   <TrendingUp className="h-12 w-12 mx-auto text-destructive" />
                   <Badge className="bg-destructive text-white text-lg px-4 py-1">
                     DEMURRAGE
                   </Badge>
                   <p className="text-3xl font-bold text-destructive">
                     ${calculation.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                   </p>
                   <p className="text-sm text-muted-foreground">
                     A pagar ao Armador
                   </p>
                 </>
               ) : calculation.result === "despatch" ? (
                 <>
                   <TrendingDown className="h-12 w-12 mx-auto text-success" />
                   <Badge className="bg-success text-white text-lg px-4 py-1">
                     DESPATCH
                   </Badge>
                   <p className="text-3xl font-bold text-success">
                     ${calculation.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                   </p>
                   <p className="text-sm text-muted-foreground">
                     A receber do Armador
                   </p>
                 </>
               ) : (
                 <>
                   <Anchor className="h-12 w-12 mx-auto text-muted-foreground" />
                   <Badge variant="secondary" className="text-lg px-4 py-1">
                     NEUTRAL
                   </Badge>
                   <p className="text-xl font-medium text-muted-foreground">
                     Sem valor a pagar/receber
                   </p>
                 </>
               )}
             </CardContent>
           </Card>
 
           {/* Breakdown */}
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm">Detalhamento</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3 text-sm">
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Laytime Permitido</span>
                 <span className="font-mono font-medium">
                   {formatHours(calculation.allowedLaytime)}
                 </span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Tempo Utilizado</span>
                 <span className="font-mono font-medium">
                   {formatHours(calculation.timeUsed)}
                 </span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Deduções</span>
                 <span className="font-mono font-medium text-success">
                   -{formatHours(weatherDeductions + holidayDeductions + otherDeductions)}
                 </span>
               </div>
               <Separator />
               <div className="flex justify-between font-medium">
                 <span>Diferença</span>
                 <span className={cn(
                   "font-mono",
                   calculation.result === "demurrage" && "text-destructive",
                   calculation.result === "despatch" && "text-success"
                 )}>
                   {calculation.result === "demurrage" ? "+" : "-"}
                   {formatHours(Math.abs(calculation.timeUsed - calculation.allowedLaytime))}
                 </span>
               </div>
               <Separator />
               <div className="flex justify-between text-xs text-muted-foreground">
                 <span>Taxa Demurrage</span>
                 <span>${calculation.demurrageRate.toLocaleString()}/dia</span>
               </div>
               <div className="flex justify-between text-xs text-muted-foreground">
                 <span>Taxa Despatch</span>
                 <span>${calculation.despatchRate.toLocaleString()}/dia</span>
               </div>
             </CardContent>
           </Card>
 
           {/* Quick Stats */}
           <Card>
             <CardContent className="p-4 space-y-2">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-muted-foreground">Carga</span>
                 <span className="font-medium">{cargoQuantity.toLocaleString()} MT</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className="text-muted-foreground">Embarcação</span>
                 <span className="font-medium">{vesselName}</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className="text-muted-foreground">Charter Party</span>
                 <span className="font-medium">{charterParty}</span>
               </div>
             </CardContent>
           </Card>
         </div>
       </div>
     </div>
   );
 }
 
 export default LaytimeDemurrageCalculator;