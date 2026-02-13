 /**
  * Operations Gantt Timeline
  * Timeline de operações com Gantt interativo
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { 
   ChevronLeft, ChevronRight, Ship, Anchor, Fuel, 
   Wrench, Users, Calendar, ZoomIn, ZoomOut, Download
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface Operation {
   id: string;
   name: string;
   type: "voyage" | "maintenance" | "inspection" | "crew_change" | "bunkering" | "cargo";
   vessel: string;
   startDate: Date;
   endDate: Date;
   progress: number;
   status: "planned" | "active" | "completed" | "delayed";
   assignee?: string;
 }
 
 interface OperationsGanttTimelineProps {
   operations?: Operation[];
   onOperationClick?: (operation: Operation) => void;
 }
 
 const defaultOperations: Operation[] = [
   {
     id: "OP-001",
     name: "Viagem Santos → Rotterdam",
     type: "voyage",
     vessel: "MV Nautilus Star",
     startDate: new Date("2026-02-01"),
     endDate: new Date("2026-02-18"),
     progress: 65,
     status: "active"
   },
   {
     id: "OP-002",
     name: "Manutenção Preventiva Motor",
     type: "maintenance",
     vessel: "MV Nautilus Star",
     startDate: new Date("2026-02-19"),
     endDate: new Date("2026-02-22"),
     progress: 0,
     status: "planned"
   },
   {
     id: "OP-003",
     name: "Viagem Paranaguá → Cingapura",
     type: "voyage",
     vessel: "MV Nautilus Explorer",
     startDate: new Date("2026-02-03"),
     endDate: new Date("2026-02-28"),
     progress: 35,
     status: "active"
   },
   {
     id: "OP-004",
     name: "Troca de Tripulação",
     type: "crew_change",
     vessel: "MV Nautilus Explorer",
     startDate: new Date("2026-02-10"),
     endDate: new Date("2026-02-11"),
     progress: 100,
     status: "completed"
   },
   {
     id: "OP-005",
     name: "Bunkering Dubai",
     type: "bunkering",
     vessel: "MV Nautilus Explorer",
     startDate: new Date("2026-02-15"),
     endDate: new Date("2026-02-15"),
     progress: 0,
     status: "planned"
   },
   {
     id: "OP-006",
     name: "Inspeção PSC",
     type: "inspection",
     vessel: "MV Nautilus Voyager",
     startDate: new Date("2026-02-08"),
     endDate: new Date("2026-02-09"),
     progress: 100,
     status: "completed"
   },
   {
     id: "OP-007",
     name: "Viagem Houston → Santos",
     type: "voyage",
     vessel: "MV Nautilus Voyager",
     startDate: new Date("2026-02-05"),
     endDate: new Date("2026-02-20"),
     progress: 45,
     status: "delayed"
   },
   {
     id: "OP-008",
     name: "Descarga de Containers",
     type: "cargo",
     vessel: "MV Nautilus Voyager",
     startDate: new Date("2026-02-20"),
     endDate: new Date("2026-02-22"),
     progress: 0,
     status: "planned"
   }
 ];
 
 export function OperationsGanttTimeline({ 
   operations = defaultOperations,
   onOperationClick 
 }: OperationsGanttTimelineProps) {
   const [viewMode, setViewMode] = useState<"week" | "month">("month");
   const [currentDate, setCurrentDate] = useState(new Date("2026-02-01"));
 
   const getTypeConfig = (type: string) => {
      const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
       voyage: { color: "bg-info", icon: <Ship className="h-3 w-3" />, label: "Viagem" },
       maintenance: { color: "bg-warning", icon: <Wrench className="h-3 w-3" />, label: "Manutenção" },
       inspection: { color: "bg-accent", icon: <Anchor className="h-3 w-3" />, label: "Inspeção" },
       crew_change: { color: "bg-success", icon: <Users className="h-3 w-3" />, label: "Tripulação" },
       bunkering: { color: "bg-warning", icon: <Fuel className="h-3 w-3" />, label: "Bunkering" },
       cargo: { color: "bg-info", icon: <Ship className="h-3 w-3" />, label: "Carga" }
     };
     return config[type] || config.voyage;
   };
 
   const getStatusConfig = (status: string) => {
     const config: Record<string, string> = {
       planned: "border-muted-foreground/30",
       active: "border-primary ring-1 ring-primary/30",
       completed: "border-success opacity-70",
       delayed: "border-destructive ring-1 ring-destructive/30"
     };
     return config[status] || config.planned;
   };
 
   // Generate days for timeline
   const getDaysInView = () => {
     const days = viewMode === "week" ? 7 : 28;
     const result = [];
     for (let i = 0; i < days; i++) {
       const date = new Date(currentDate);
       date.setDate(date.getDate() + i);
       result.push(date);
     }
     return result;
   };
 
   const days = getDaysInView();
   const dayWidth = viewMode === "week" ? 100 : 40;
 
   // Group operations by vessel
   const vessels = [...new Set(operations.map(op => op.vessel))];
 
   const getOperationPosition = (op: Operation) => {
     const startOffset = Math.max(0, Math.floor((op.startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
     const duration = Math.ceil((op.endDate.getTime() - op.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
     return { startOffset, duration };
   };
 
   const navigateTimeline = (direction: "prev" | "next") => {
     const newDate = new Date(currentDate);
     const days = viewMode === "week" ? 7 : 14;
     newDate.setDate(newDate.getDate() + (direction === "next" ? days : -days));
     setCurrentDate(newDate);
   };
 
   return (
     <Card>
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <CardTitle className="flex items-center gap-2">
             <Calendar className="h-5 w-5 text-primary" />
             Timeline de Operações
           </CardTitle>
           <div className="flex items-center gap-2">
             <Select value={viewMode} onValueChange={(v) => setViewMode(v as "week" | "month")}>
               <SelectTrigger className="w-32">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="week">Semana</SelectItem>
                 <SelectItem value="month">Mês</SelectItem>
               </SelectContent>
             </Select>
             <Button variant="outline" size="icon" onClick={() => navigateTimeline("prev")} aria-label="Período anterior" title="Período anterior">
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <Button variant="outline" size="icon" onClick={() => navigateTimeline("next")} aria-label="Próximo período" title="Próximo período">
               <ChevronRight className="h-4 w-4" />
             </Button>
             <Button variant="outline" size="sm">
               <Download className="h-4 w-4 mr-2" />
               Exportar
             </Button>
           </div>
         </div>
       </CardHeader>
       <CardContent>
         {/* Legend */}
         <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b">
           {["voyage", "maintenance", "inspection", "crew_change", "bunkering", "cargo"].map((type) => {
             const config = getTypeConfig(type);
             return (
               <div key={type} className="flex items-center gap-1.5 text-xs">
                 <div className={cn("w-3 h-3 rounded", config.color)} />
                 <span className="text-muted-foreground">{config.label}</span>
               </div>
             );
           })}
         </div>
 
         {/* Gantt Chart */}
         <div className="overflow-x-auto">
           <div style={{ minWidth: days.length * dayWidth + 150 }}>
             {/* Header - Days */}
             <div className="flex border-b">
               <div className="w-36 shrink-0 p-2 font-medium text-sm bg-muted/30">
                 Embarcação
               </div>
               <div className="flex flex-1">
                {days.map((day) => (
                   <div 
                     key={`header-${day.getTime()}`}
                     className={cn(
                       "text-center text-xs p-1 border-l",
                       day.getDay() === 0 || day.getDay() === 6 ? "bg-muted/30" : ""
                     )}
                     style={{ width: dayWidth }}
                   >
                     <div className="font-medium">
                       {day.toLocaleDateString("pt-BR", { weekday: "short" })}
                     </div>
                     <div className="text-muted-foreground">
                       {day.getDate()}/{day.getMonth() + 1}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
 
             {/* Rows - Vessels */}
             {vessels.map((vessel) => {
               const vesselOps = operations.filter(op => op.vessel === vessel);
 
               return (
                 <div key={vessel} className="flex border-b hover:bg-muted/20">
                   <div className="w-36 shrink-0 p-2 text-sm font-medium flex items-center gap-2">
                     <Ship className="h-4 w-4 text-primary" />
                     <span className="truncate">{vessel.replace("MV ", "")}</span>
                   </div>
                   <div className="flex-1 relative h-16">
                     {/* Grid lines */}
                     <div className="absolute inset-0 flex">
                       {days.map((day) => (
                         <div 
                           key={`grid-${day.getTime()}`}
                           className={cn(
                             "border-l h-full",
                             day.getDay() === 0 || day.getDay() === 6 ? "bg-muted/20" : ""
                           )}
                           style={{ width: dayWidth }}
                         />
                       ))}
                     </div>
 
                     {/* Operations */}
                     {vesselOps.map((op) => {
                       const { startOffset, duration } = getOperationPosition(op);
                       const typeConfig = getTypeConfig(op.type);
 
                       // Skip if operation is outside view
                       if (startOffset >= days.length || startOffset + duration < 0) return null;
 
                       return (
                         <div
                           key={op.id}
                           className={cn(
                             "absolute top-2 h-12 rounded-md border-2 cursor-pointer transition-all hover:scale-[1.02] hover:z-10",
                             typeConfig.color,
                             getStatusConfig(op.status)
                           )}
                           style={{
                             left: Math.max(0, startOffset) * dayWidth,
                             width: Math.min(duration, days.length - startOffset) * dayWidth - 4
                           }}
                           onClick={() => onOperationClick?.(op)}
                         >
                           <div className="flex items-center gap-1.5 px-2 py-1 h-full text-white">
                             {typeConfig.icon}
                             <div className="flex-1 min-w-0">
                               <p className="text-xs font-medium truncate">{op.name}</p>
                               {op.progress > 0 && (
                                 <div className="w-full bg-white/30 rounded-full h-1 mt-1">
                                   <div 
                                     className="bg-white rounded-full h-1" 
                                     style={{ width: `${op.progress}%` }}
                                   />
                                 </div>
                               )}
                             </div>
                             {op.status === "delayed" && (
                               <Badge className="bg-white/20 text-white text-[10px] px-1">
                                 Atrasado
                               </Badge>
                             )}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               );
             })}
           </div>
         </div>
 
         {/* Today indicator info */}
         <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-primary" />
             <span>Em andamento</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-success" />
             <span>Concluído</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-destructive" />
             <span>Atrasado</span>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }
 
 export default OperationsGanttTimeline;