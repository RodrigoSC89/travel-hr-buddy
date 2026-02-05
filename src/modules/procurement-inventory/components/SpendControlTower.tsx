 /**
  * Spend Control Tower - Dashboard de Controle de Gastos
  * Analytics avançado de spend com detecção de anomalias
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { 
   DollarSign, TrendingUp, TrendingDown, AlertTriangle, 
   PieChart, Target, Sparkles, ArrowUpRight,
   ArrowDownRight, Ship, Calendar, Download, Eye, Brain
 } from "lucide-react";
 
 interface SpendCategory {
   name: string;
   amount: number;
   budget: number;
   change: number;
   color: string;
 }
 
 interface SpendAnomaly {
   id: string;
   description: string;
   amount: number;
   expectedAmount: number;
   deviation: number;
   category: string;
   severity: "high" | "medium" | "low";
   aiRecommendation: string;
 }
 
 const spendCategories: SpendCategory[] = [
   { name: "Combustível", amount: 2450000, budget: 2800000, change: -5.2, color: "bg-blue-500" },
   { name: "Manutenção", amount: 890000, budget: 1000000, change: 12.3, color: "bg-orange-500" },
   { name: "Tripulação", amount: 1200000, budget: 1200000, change: 0, color: "bg-green-500" },
   { name: "Provisões", amount: 180000, budget: 200000, change: -8.1, color: "bg-purple-500" },
   { name: "Peças/Spare Parts", amount: 450000, budget: 400000, change: 15.7, color: "bg-red-500" },
   { name: "Serviços", amount: 320000, budget: 350000, change: -2.4, color: "bg-cyan-500" },
 ];
 
 const anomalies: SpendAnomaly[] = [
   {
     id: "1",
     description: "Compra de peças fora do contrato preferencial",
     amount: 45000,
     expectedAmount: 28000,
     deviation: 60.7,
     category: "Peças/Spare Parts",
     severity: "high",
     aiRecommendation: "Consolidar compra com fornecedor contratado para economia de 38%"
   },
   {
     id: "2",
     description: "Abastecimento em porto com preço acima da média",
     amount: 89000,
     expectedAmount: 75000,
     deviation: 18.6,
     category: "Combustível",
     severity: "medium",
     aiRecommendation: "Porto alternativo a 12nm oferece preço 15% menor"
   },
 ];
 
 const vessels = [
   { id: "1", name: "MV Atlantic Explorer", spend: 1850000, budget: 2000000 },
   { id: "2", name: "MV Pacific Voyager", spend: 1420000, budget: 1500000 },
   { id: "3", name: "MV Nordic Queen", spend: 980000, budget: 1000000 },
 ];
 
 export default function SpendControlTower() {
   const [period, setPeriod] = useState("month");
 
   const totalSpend = spendCategories.reduce((sum, c) => sum + c.amount, 0);
   const totalBudget = spendCategories.reduce((sum, c) => sum + c.budget, 0);
   const budgetUtilization = (totalSpend / totalBudget) * 100;
   const potentialSavings = anomalies.reduce((sum, a) => sum + (a.amount - a.expectedAmount), 0);
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <DollarSign className="h-6 w-6 text-success" />
             Spend Control Tower
           </h2>
           <p className="text-muted-foreground">Analytics de gastos com detecção de anomalias por IA</p>
         </div>
         <div className="flex items-center gap-2">
           <Select value={period} onValueChange={setPeriod}>
             <SelectTrigger className="w-[140px]">
               <Calendar className="h-4 w-4 mr-2" />
               <SelectValue />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="week">Esta Semana</SelectItem>
               <SelectItem value="month">Este Mês</SelectItem>
               <SelectItem value="quarter">Trimestre</SelectItem>
               <SelectItem value="year">Este Ano</SelectItem>
             </SelectContent>
           </Select>
           <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar</Button>
         </div>
       </div>
 
       <div className="grid grid-cols-4 gap-4">
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Gasto Total</p>
                 <p className="text-2xl font-bold">R$ {(totalSpend / 1000000).toFixed(2)}M</p>
               </div>
               <DollarSign className="h-8 w-8 text-primary opacity-50" />
             </div>
             <div className="flex items-center gap-1 mt-2 text-sm">
               <TrendingDown className="h-4 w-4 text-success" />
               <span className="text-success">-3.2%</span>
               <span className="text-muted-foreground">vs. mês anterior</span>
             </div>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Orçamento</p>
                 <p className="text-2xl font-bold">R$ {(totalBudget / 1000000).toFixed(2)}M</p>
               </div>
               <Target className="h-8 w-8 text-success opacity-50" />
             </div>
             <div className="mt-2">
               <Progress value={budgetUtilization} className="h-2" />
               <p className="text-xs text-muted-foreground mt-1">{budgetUtilization.toFixed(1)}% utilizado</p>
             </div>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Anomalias</p>
                 <p className="text-2xl font-bold text-warning">{anomalies.length}</p>
               </div>
               <AlertTriangle className="h-8 w-8 text-warning opacity-50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">
               {anomalies.filter(a => a.severity === "high").length} alta prioridade
             </p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Economia Potencial</p>
                 <p className="text-2xl font-bold text-purple-600">R$ {potentialSavings.toLocaleString()}</p>
               </div>
               <Sparkles className="h-8 w-8 text-purple-500 opacity-50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">Identificada por IA</p>
           </CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <PieChart className="h-5 w-5 text-primary" />
             Gastos por Categoria
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {spendCategories.map((category) => {
               const utilization = (category.amount / category.budget) * 100;
               const isOverBudget = category.amount > category.budget;
               return (
                 <div key={category.name} className="space-y-2">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${category.color}`} />
                       <span className="font-medium">{category.name}</span>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="text-sm text-muted-foreground">
                         R$ {(category.amount / 1000).toFixed(0)}K / R$ {(category.budget / 1000).toFixed(0)}K
                       </span>
                       <Badge variant={category.change > 0 ? "destructive" : "default"} className="min-w-[60px] justify-center">
                         {category.change > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                         {Math.abs(category.change)}%
                       </Badge>
                     </div>
                   </div>
                   <Progress value={Math.min(utilization, 100)} className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`} />
                 </div>
               );
             })}
           </div>
         </CardContent>
       </Card>
 
       <Card className="border-warning/50">
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <Brain className="h-5 w-5 text-warning" />
                 Anomalias Detectadas por IA
               </CardTitle>
               <CardDescription>Gastos fora do padrão identificados automaticamente</CardDescription>
             </div>
             <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />Ver Todas</Button>
           </div>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {anomalies.map((anomaly) => (
               <div key={anomaly.id} className={`p-4 rounded-lg border ${
                 anomaly.severity === "high" ? "border-destructive/50 bg-destructive/5" :
                 anomaly.severity === "medium" ? "border-warning/50 bg-warning/5" : "border-muted"
               }`}>
                 <div className="flex items-start justify-between mb-3">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <Badge variant={anomaly.severity === "high" ? "destructive" : anomaly.severity === "medium" ? "secondary" : "outline"}>
                         {anomaly.severity === "high" ? "Alta" : anomaly.severity === "medium" ? "Média" : "Baixa"}
                       </Badge>
                       <span className="text-sm text-muted-foreground">{anomaly.category}</span>
                     </div>
                     <p className="font-medium">{anomaly.description}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-destructive">R$ {anomaly.amount.toLocaleString()}</p>
                     <p className="text-xs text-muted-foreground">Esperado: R$ {anomaly.expectedAmount.toLocaleString()}</p>
                     <Badge variant="destructive" className="mt-1">+{anomaly.deviation.toFixed(1)}%</Badge>
                   </div>
                 </div>
                 <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                   <div className="flex items-center gap-2 mb-1">
                     <Sparkles className="h-4 w-4 text-purple-500" />
                     <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Recomendação IA</span>
                   </div>
                   <p className="text-sm">{anomaly.aiRecommendation}</p>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Ship className="h-5 w-5 text-primary" />
             Gastos por Embarcação
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {vessels.map((vessel) => {
               const utilization = (vessel.spend / vessel.budget) * 100;
               return (
                 <div key={vessel.id} className="flex items-center gap-4 p-3 rounded-lg border">
                   <Ship className="h-6 w-6 text-muted-foreground" />
                   <div className="flex-1">
                     <p className="font-medium">{vessel.name}</p>
                     <div className="flex items-center gap-2 mt-1">
                       <Progress value={utilization} className="flex-1 h-2" />
                       <span className="text-sm text-muted-foreground w-[100px] text-right">{utilization.toFixed(1)}% usado</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-bold">R$ {(vessel.spend / 1000).toFixed(0)}K</p>
                     <p className="text-xs text-muted-foreground">de R$ {(vessel.budget / 1000).toFixed(0)}K</p>
                   </div>
                 </div>
               );
             })}
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }