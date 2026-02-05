 /**
  * Budget Alert System
  * Alertas de budget excedido com ações
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { 
   AlertTriangle, DollarSign, TrendingUp, Bell, 
   CheckCircle, XCircle, ArrowUpRight, Settings,
   Eye, Mail, MessageSquare, Zap
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { toast } from "sonner";
 
 interface BudgetAlert {
   id: string;
   category: string;
   department: string;
   budgetAmount: number;
   spentAmount: number;
   currency: string;
   threshold: number; // percentage
   severity: "warning" | "critical" | "exceeded";
   triggeredAt: string;
   acknowledged: boolean;
   trend: "increasing" | "stable" | "decreasing";
   forecastExceed?: string; // date when it will exceed
 }
 
 interface BudgetAlertSystemProps {
   alerts?: BudgetAlert[];
   onAcknowledge?: (id: string) => void;
   onViewDetails?: (id: string) => void;
 }
 
 const defaultAlerts: BudgetAlert[] = [
   {
     id: "BA-001",
     category: "Manutenção",
     department: "Operações",
     budgetAmount: 400000,
     spentAmount: 420000,
     currency: "USD",
     threshold: 100,
     severity: "exceeded",
     triggeredAt: "2026-02-05T08:30:00",
     acknowledged: false,
     trend: "increasing",
   },
   {
     id: "BA-002",
     category: "Combustível",
     department: "Frota",
     budgetAmount: 900000,
     spentAmount: 855000,
     currency: "USD",
     threshold: 95,
     severity: "critical",
     triggeredAt: "2026-02-04T14:15:00",
     acknowledged: false,
     trend: "increasing",
     forecastExceed: "2026-02-12"
   },
   {
     id: "BA-003",
     category: "Suprimentos",
     department: "Catering",
     budgetAmount: 160000,
     spentAmount: 136000,
     currency: "USD",
     threshold: 85,
     severity: "warning",
     triggeredAt: "2026-02-03T10:00:00",
     acknowledged: true,
     trend: "stable"
   }
 ];
 
 export function BudgetAlertSystem({ 
   alerts = defaultAlerts,
   onAcknowledge,
   onViewDetails 
 }: BudgetAlertSystemProps) {
   const [localAlerts, setLocalAlerts] = useState(alerts);
 
   const getSeverityConfig = (severity: string) => {
     const config = {
       warning: {
         bg: "bg-warning/10 border-warning/30",
         icon: "text-warning",
         badge: "bg-warning/20 text-warning",
         label: "Atenção"
       },
       critical: {
         bg: "bg-orange-500/10 border-orange-500/30",
         icon: "text-orange-500",
         badge: "bg-orange-500/20 text-orange-500",
         label: "Crítico"
       },
       exceeded: {
         bg: "bg-destructive/10 border-destructive/30",
         icon: "text-destructive",
         badge: "bg-destructive/20 text-destructive",
         label: "Excedido"
       }
     };
     return config[severity as keyof typeof config] || config.warning;
   };
 
   const handleAcknowledge = (id: string) => {
     setLocalAlerts(prev => prev.map(a => 
       a.id === id ? { ...a, acknowledged: true } : a
     ));
     onAcknowledge?.(id);
     toast.success("Alerta reconhecido");
   };
 
   const handleNotify = (alert: BudgetAlert) => {
     toast.info(`Notificação enviada para gestores de ${alert.department}`);
   };
 
   const unacknowledgedCount = localAlerts.filter(a => !a.acknowledged).length;
   const exceededCount = localAlerts.filter(a => a.severity === "exceeded").length;
 
   return (
     <div className="space-y-4">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Bell className="h-5 w-5 text-primary" />
           <h3 className="font-semibold">Alertas de Orçamento</h3>
           {unacknowledgedCount > 0 && (
             <Badge variant="destructive" className="rounded-full">
               {unacknowledgedCount}
             </Badge>
           )}
         </div>
         <Button variant="ghost" size="sm">
           <Settings className="h-4 w-4 mr-2" />
           Configurar
         </Button>
       </div>
 
       {/* Stats Mini */}
       <div className="grid grid-cols-3 gap-3">
         <Card className="bg-muted/30">
           <CardContent className="p-3 text-center">
             <p className="text-2xl font-bold">{localAlerts.length}</p>
             <p className="text-xs text-muted-foreground">Alertas Ativos</p>
           </CardContent>
         </Card>
         <Card className="bg-destructive/10">
           <CardContent className="p-3 text-center">
             <p className="text-2xl font-bold text-destructive">{exceededCount}</p>
             <p className="text-xs text-muted-foreground">Excedidos</p>
           </CardContent>
         </Card>
         <Card className="bg-warning/10">
           <CardContent className="p-3 text-center">
             <p className="text-2xl font-bold text-warning">{unacknowledgedCount}</p>
             <p className="text-xs text-muted-foreground">Não Lidos</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Alerts List */}
       <div className="space-y-3">
         {localAlerts.map((alert) => {
           const config = getSeverityConfig(alert.severity);
           const percentage = (alert.spentAmount / alert.budgetAmount) * 100;
           const variance = alert.spentAmount - alert.budgetAmount;
 
           return (
             <Card 
               key={alert.id}
               className={cn(
                 "border transition-all",
                 config.bg,
                 !alert.acknowledged && "ring-1 ring-offset-1"
               )}
             >
               <CardContent className="p-4">
                 <div className="flex items-start justify-between gap-4">
                   {/* Left - Icon & Info */}
                   <div className="flex gap-3">
                     <div className={cn("p-2 rounded-lg bg-background", config.icon)}>
                       <AlertTriangle className="h-5 w-5" />
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <h4 className="font-semibold">{alert.category}</h4>
                         <Badge className={cn("text-xs", config.badge)}>
                           {config.label}
                         </Badge>
                         {!alert.acknowledged && (
                           <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                         )}
                       </div>
                       <p className="text-sm text-muted-foreground">{alert.department}</p>
                       
                       {/* Progress */}
                       <div className="mt-2 w-48">
                         <div className="flex justify-between text-xs mb-1">
                           <span>{percentage.toFixed(0)}% utilizado</span>
                           <span className={variance > 0 ? "text-destructive" : "text-muted-foreground"}>
                             {variance > 0 ? `+$${(variance/1000).toFixed(0)}K` : `$${Math.abs(variance/1000).toFixed(0)}K disponível`}
                           </span>
                         </div>
                         <Progress 
                           value={Math.min(percentage, 100)} 
                           className={cn(
                             "h-2",
                             percentage >= 100 && "[&>div]:bg-destructive",
                             percentage >= 95 && percentage < 100 && "[&>div]:bg-orange-500",
                             percentage >= 85 && percentage < 95 && "[&>div]:bg-warning"
                           )}
                         />
                       </div>
 
                       {/* Forecast */}
                       {alert.forecastExceed && (
                         <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                           <TrendingUp className="h-3 w-3" />
                           Previsão de exceder em {alert.forecastExceed}
                         </p>
                       )}
                     </div>
                   </div>
 
                   {/* Right - Values & Actions */}
                   <div className="text-right">
                     <p className="text-lg font-bold">
                       ${(alert.spentAmount / 1000).toFixed(0)}K
                       <span className="text-sm text-muted-foreground font-normal">
                         /{(alert.budgetAmount / 1000).toFixed(0)}K
                       </span>
                     </p>
                     <div className="flex gap-1 mt-2 justify-end">
                       {!alert.acknowledged && (
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => handleAcknowledge(alert.id)}
                         >
                           <CheckCircle className="h-3 w-3 mr-1" />
                           Reconhecer
                         </Button>
                       )}
                       <Button 
                         size="sm" 
                         variant="ghost"
                         onClick={() => handleNotify(alert)}
                       >
                         <Mail className="h-3 w-3" />
                       </Button>
                       <Button 
                         size="sm" 
                         variant="ghost"
                         onClick={() => onViewDetails?.(alert.id)}
                       >
                         <Eye className="h-3 w-3" />
                       </Button>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           );
         })}
       </div>
     </div>
   );
 }
 
 export default BudgetAlertSystem;