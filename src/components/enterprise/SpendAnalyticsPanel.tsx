 /**
  * Spend Analytics Panel - Enterprise Grade
  * Drill-down analytics por categoria com visualizações avançadas
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
   Tooltip, Legend, ResponsiveContainer, Treemap, AreaChart, Area 
 } from "recharts";
 import { 
   DollarSign, TrendingUp, TrendingDown, PieChart as PieIcon,
   BarChart3, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
   Filter, Download, RefreshCw, Layers, Target, Zap
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface SpendCategory {
   name: string;
   value: number;
   budget: number;
   change: number;
   subcategories: { name: string; value: number }[];
 }
 
 interface SpendAnalyticsPanelProps {
   data?: SpendCategory[];
   period?: string;
   onDrillDown?: (category: string) => void;
 }
 
 const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
 
 const defaultCategories: SpendCategory[] = [
   { name: "Combustível", value: 850000, budget: 900000, change: -5.2, subcategories: [
     { name: "HFO", value: 520000 }, { name: "MGO", value: 280000 }, { name: "LNG", value: 50000 }
   ]},
   { name: "Manutenção", value: 420000, budget: 400000, change: 8.3, subcategories: [
     { name: "Preventiva", value: 180000 }, { name: "Corretiva", value: 150000 }, { name: "Peças", value: 90000 }
   ]},
   { name: "Tripulação", value: 380000, budget: 380000, change: 0, subcategories: [
     { name: "Salários", value: 280000 }, { name: "Benefícios", value: 60000 }, { name: "Treinamento", value: 40000 }
   ]},
   { name: "Porto", value: 290000, budget: 320000, change: -9.4, subcategories: [
     { name: "Taxas", value: 180000 }, { name: "Serviços", value: 80000 }, { name: "Armazenagem", value: 30000 }
   ]},
   { name: "Seguros", value: 180000, budget: 180000, change: 2.1, subcategories: [
     { name: "P&I", value: 100000 }, { name: "Hull", value: 60000 }, { name: "Cargo", value: 20000 }
   ]},
   { name: "Suprimentos", value: 150000, budget: 160000, change: -6.2, subcategories: [
     { name: "Provisões", value: 80000 }, { name: "Materiais", value: 50000 }, { name: "EPI", value: 20000 }
   ]},
 ];
 
 const trendData = [
   { month: "Jan", spend: 2100000, budget: 2200000 },
   { month: "Fev", spend: 2050000, budget: 2200000 },
   { month: "Mar", spend: 2180000, budget: 2200000 },
   { month: "Abr", spend: 2020000, budget: 2200000 },
   { month: "Mai", spend: 1980000, budget: 2200000 },
   { month: "Jun", spend: 2270000, budget: 2200000 },
 ];
 
 export function SpendAnalyticsPanel({ 
   data = defaultCategories, 
   period = "YTD",
   onDrillDown 
 }: SpendAnalyticsPanelProps) {
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
   const [viewMode, setViewMode] = useState<"pie" | "bar" | "treemap">("pie");
 
   const totalSpend = data.reduce((sum, cat) => sum + cat.value, 0);
   const totalBudget = data.reduce((sum, cat) => sum + cat.budget, 0);
   const budgetVariance = ((totalSpend - totalBudget) / totalBudget) * 100;
   const overBudgetCount = data.filter(cat => cat.value > cat.budget).length;
 
   const pieData = data.map(cat => ({ name: cat.name, value: cat.value }));
   const barData = data.map(cat => ({
     name: cat.name,
     gasto: cat.value / 1000,
     orçamento: cat.budget / 1000,
   }));
 
   const selectedCat = data.find(c => c.name === selectedCategory);
 
   return (
     <div className="space-y-6">
       {/* KPI Summary */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Spend Total ({period})</p>
                 <p className="text-2xl font-bold">R$ {(totalSpend / 1000000).toFixed(2)}M</p>
               </div>
               <DollarSign className="h-8 w-8 text-primary opacity-50" />
             </div>
           </CardContent>
         </Card>
 
         <Card className={cn("bg-gradient-to-br", budgetVariance > 0 ? "from-destructive/10 to-destructive/5" : "from-success/10 to-success/5")}>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Variação Orçamento</p>
                 <p className={cn("text-2xl font-bold", budgetVariance > 0 ? "text-destructive" : "text-success")}>
                   {budgetVariance > 0 ? "+" : ""}{budgetVariance.toFixed(1)}%
                 </p>
               </div>
               {budgetVariance > 0 ? (
                 <ArrowUpRight className="h-8 w-8 text-destructive opacity-50" />
               ) : (
                 <ArrowDownRight className="h-8 w-8 text-success opacity-50" />
               )}
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Categorias</p>
                 <p className="text-2xl font-bold">{data.length}</p>
               </div>
               <Layers className="h-8 w-8 text-muted-foreground opacity-50" />
             </div>
           </CardContent>
         </Card>
 
         <Card className={cn("bg-gradient-to-br", overBudgetCount > 0 ? "from-warning/10 to-warning/5" : "from-success/10 to-success/5")}>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Acima do Orçamento</p>
                 <p className="text-2xl font-bold">{overBudgetCount}</p>
               </div>
               {overBudgetCount > 0 ? (
                 <AlertTriangle className="h-8 w-8 text-warning opacity-50" />
               ) : (
                 <CheckCircle className="h-8 w-8 text-success opacity-50" />
               )}
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Content */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart Section */}
         <Card className="lg:col-span-2">
           <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
               <CardTitle className="flex items-center gap-2">
                 <PieIcon className="h-5 w-5 text-primary" />
                 Distribuição de Gastos
               </CardTitle>
               <div className="flex gap-1">
                 <Button 
                   variant={viewMode === "pie" ? "default" : "ghost"} 
                   size="sm"
                   onClick={() => setViewMode("pie")}
                 >
                   <PieIcon className="h-4 w-4" />
                 </Button>
                 <Button 
                   variant={viewMode === "bar" ? "default" : "ghost"} 
                   size="sm"
                   onClick={() => setViewMode("bar")}
                 >
                   <BarChart3 className="h-4 w-4" />
                 </Button>
               </div>
             </div>
           </CardHeader>
           <CardContent>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 {viewMode === "pie" ? (
                   <PieChart>
                     <Pie
                       data={pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={100}
                       paddingAngle={2}
                       dataKey="value"
                       onClick={(entry) => {
                         setSelectedCategory(entry.name);
                         onDrillDown?.(entry.name);
                       }}
                       style={{ cursor: 'pointer' }}
                     >
                       {pieData.map((entry, index) => (
                         <Cell 
                           key={`cell-${entry.name}`} 
                           fill={COLORS[index % COLORS.length]}
                           stroke="transparent"
                         />
                       ))}
                     </Pie>
                     <Tooltip 
                       formatter={(value: number) => `R$ ${(value / 1000).toFixed(0)}K`}
                     />
                     <Legend />
                   </PieChart>
                 ) : (
                   <BarChart data={barData}>
                     <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                     <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                     <YAxis tick={{ fontSize: 12 }} />
                     <Tooltip formatter={(value: number) => `R$ ${value.toFixed(0)}K`} />
                     <Legend />
                     <Bar dataKey="gasto" fill="hsl(var(--primary))" name="Gasto" radius={[4, 4, 0, 0]} />
                     <Bar dataKey="orçamento" fill="hsl(var(--muted))" name="Orçamento" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 )}
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
 
         {/* Category Details */}
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">
               {selectedCategory ? `Detalhes: ${selectedCategory}` : "Selecione uma categoria"}
             </CardTitle>
           </CardHeader>
           <CardContent>
             {selectedCat ? (
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Total</span>
                   <span className="font-bold">R$ {(selectedCat.value / 1000).toFixed(0)}K</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Orçamento</span>
                   <span className="font-medium">R$ {(selectedCat.budget / 1000).toFixed(0)}K</span>
                 </div>
                 <Progress 
                   value={(selectedCat.value / selectedCat.budget) * 100} 
                   className={cn("h-2", selectedCat.value > selectedCat.budget && "[&>div]:bg-destructive")}
                 />
                 <div className="pt-4 border-t space-y-2">
                   <p className="text-xs font-medium text-muted-foreground">Subcategorias</p>
                   {selectedCat.subcategories.map((sub) => (
                     <div key={sub.name} className="flex items-center justify-between text-sm">
                       <span>{sub.name}</span>
                       <span className="font-mono">R$ {(sub.value / 1000).toFixed(0)}K</span>
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
               <div className="text-center py-8 text-muted-foreground">
                 <Target className="h-12 w-12 mx-auto mb-2 opacity-30" />
                 <p className="text-sm">Clique em uma categoria no gráfico para ver detalhes</p>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
 
       {/* Trend Chart */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <TrendingUp className="h-5 w-5 text-primary" />
             Evolução Mensal
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData}>
                 <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                 <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                 <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                 <Tooltip formatter={(v: number) => `R$ ${(v / 1000000).toFixed(2)}M`} />
                 <Legend />
                 <Area 
                   type="monotone" 
                   dataKey="spend" 
                   stroke="hsl(var(--primary))" 
                   fill="hsl(var(--primary))" 
                   fillOpacity={0.2}
                   name="Gasto Real"
                 />
                 <Area 
                   type="monotone" 
                   dataKey="budget" 
                   stroke="hsl(var(--muted-foreground))" 
                   fill="transparent"
                   strokeDasharray="5 5"
                   name="Orçamento"
                 />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </CardContent>
       </Card>
 
       {/* Category Table */}
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <CardTitle>Categorias de Gastos</CardTitle>
             <Button variant="outline" size="sm">
               <Download className="h-4 w-4 mr-2" />
               Exportar
             </Button>
           </div>
         </CardHeader>
         <CardContent>
           <div className="space-y-2">
             {data.map((cat, idx) => {
               const pctOfTotal = (cat.value / totalSpend) * 100;
               const budgetPct = (cat.value / cat.budget) * 100;
               const isOverBudget = cat.value > cat.budget;
 
               return (
                 <div 
                   key={cat.name}
                   className={cn(
                     "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                     selectedCategory === cat.name && "ring-2 ring-primary"
                   )}
                   onClick={() => setSelectedCategory(cat.name)}
                 >
                   <div className="flex items-center gap-3">
                     <div 
                       className="w-3 h-3 rounded-full" 
                       style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                     />
                     <div>
                       <p className="font-medium">{cat.name}</p>
                       <p className="text-xs text-muted-foreground">{pctOfTotal.toFixed(1)}% do total</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="text-right">
                       <p className="font-mono font-medium">R$ {(cat.value / 1000).toFixed(0)}K</p>
                       <div className="flex items-center gap-1 text-xs">
                         {cat.change !== 0 && (
                           <>
                             {cat.change > 0 ? (
                               <TrendingUp className="h-3 w-3 text-destructive" />
                             ) : (
                               <TrendingDown className="h-3 w-3 text-success" />
                             )}
                             <span className={cat.change > 0 ? "text-destructive" : "text-success"}>
                               {cat.change > 0 ? "+" : ""}{cat.change.toFixed(1)}%
                             </span>
                           </>
                         )}
                       </div>
                     </div>
                     <div className="w-24">
                       <Progress 
                         value={Math.min(budgetPct, 100)} 
                         className={cn("h-2", isOverBudget && "[&>div]:bg-destructive")}
                       />
                       <p className="text-xs text-muted-foreground mt-1 text-right">
                         {budgetPct.toFixed(0)}% do orçamento
                       </p>
                     </div>
                     <Badge variant={isOverBudget ? "destructive" : "secondary"} className="w-20 justify-center">
                       {isOverBudget ? "Excedido" : "OK"}
                     </Badge>
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
 
 export default SpendAnalyticsPanel;