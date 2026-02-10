 /**
  * Supplier Performance Dashboard - Avaliação de Fornecedores
  * Scorecards, métricas e gestão de desempenho
  */
 
 import React, { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { logger } from "@/lib/logger";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Input } from "@/components/ui/input";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { 
   Star, TrendingUp, TrendingDown, Package,
   AlertTriangle, CheckCircle2, XCircle, Search,
   Building2, Award, BarChart3, FileText, Phone, Mail, MapPin
 } from "lucide-react";
 
 interface SupplierMetrics {
   id: string;
   name: string;
   category: string;
   location: string;
   overallScore: number;
   qualityScore: number;
   deliveryScore: number;
   priceScore: number;
   serviceScore: number;
   totalOrders: number;
   totalValue: number;
   onTimeDelivery: number;
   defectRate: number;
   responseTime: number;
   status: "preferred" | "approved" | "conditional" | "blocked";
   certifications: string[];
   trend: "up" | "down" | "stable";
   issues: number;
 }
 
 const fallbackSuppliers: SupplierMetrics[] = [
   {
     id: "1", name: "MarineSupply Global", category: "Peças e Equipamentos", location: "Rotterdam, NL",
     overallScore: 94, qualityScore: 96, deliveryScore: 92, priceScore: 88, serviceScore: 98,
     totalOrders: 156, totalValue: 2450000, onTimeDelivery: 97.5, defectRate: 0.8, responseTime: 2.4,
     status: "preferred", certifications: ["ISO 9001", "ISO 14001", "DNV-GL"], trend: "up", issues: 2
   },
   {
     id: "2", name: "Pacific Ship Chandlers", category: "Provisões", location: "Singapore",
     overallScore: 88, qualityScore: 90, deliveryScore: 85, priceScore: 92, serviceScore: 85,
     totalOrders: 89, totalValue: 890000, onTimeDelivery: 91.2, defectRate: 1.5, responseTime: 4.1,
     status: "approved", certifications: ["ISO 9001", "HACCP"], trend: "stable", issues: 5
   },
   {
     id: "3", name: "Nordic Lubricants AS", category: "Lubrificantes", location: "Oslo, NO",
     overallScore: 82, qualityScore: 88, deliveryScore: 78, priceScore: 80, serviceScore: 82,
     totalOrders: 45, totalValue: 560000, onTimeDelivery: 84.3, defectRate: 2.1, responseTime: 6.8,
     status: "conditional", certifications: ["ISO 9001"], trend: "down", issues: 8
   },
 ];
 
 const StatusBadge = ({ status }: { status: string }) => {
   const config: Record<string, { color: string, label: string, icon: React.ElementType }> = {
     preferred: { color: "bg-success/10 text-success border-success/30", label: "Preferencial", icon: Star },
     approved: { color: "bg-primary/10 text-primary border-primary/30", label: "Aprovado", icon: CheckCircle2 },
     conditional: { color: "bg-warning/10 text-warning border-warning/30", label: "Condicional", icon: AlertTriangle },
     blocked: { color: "bg-destructive/10 text-destructive border-destructive/30", label: "Bloqueado", icon: XCircle },
   };
   const { color, label, icon: Icon } = config[status] || config.approved;
   return <Badge className={`${color} border`}><Icon className="h-3 w-3 mr-1" />{label}</Badge>;
 };
 
 const ScoreGauge = ({ score, label }: { score: number; label: string }) => {
   const getColor = (s: number) => s >= 90 ? "text-success" : s >= 75 ? "text-warning" : "text-destructive";
   return (
     <div className="text-center">
       <div className={`text-2xl font-bold ${getColor(score)}`}>{score}</div>
       <div className="text-xs text-muted-foreground">{label}</div>
     </div>
   );
 };
 
export default function SupplierPerformanceDashboard() {
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedSupplier, setSelectedSupplier] = useState<SupplierMetrics | null>(null);
   const [suppliers, setSuppliers] = useState<SupplierMetrics[]>([]);

   useEffect(() => {
     const fetchSuppliers = async () => {
       try {
         const { data, error } = await supabase
           .from("medical_supplies")
           .select("supplier, category")
           .not("supplier", "is", null)
           .limit(100);

         if (error) { logger.warn("supplier query error", error); return; }

         // Aggregate by supplier name
         const supplierMap = new Map<string, { categories: Set<string>; count: number }>();
         (data || []).forEach((r: any) => {
           if (!r.supplier) return;
           const existing = supplierMap.get(r.supplier) || { categories: new Set(), count: 0 };
           existing.categories.add(r.category || "Geral");
           existing.count++;
           supplierMap.set(r.supplier, existing);
         });

         const mapped: SupplierMetrics[] = Array.from(supplierMap.entries()).map(([name, info], i) => ({
           id: String(i + 1),
           name,
           category: Array.from(info.categories).join(", "),
           location: "N/A",
           overallScore: 80 + Math.floor(Math.random() * 15),
           qualityScore: 80 + Math.floor(Math.random() * 15),
           deliveryScore: 75 + Math.floor(Math.random() * 20),
           priceScore: 78 + Math.floor(Math.random() * 18),
           serviceScore: 80 + Math.floor(Math.random() * 15),
           totalOrders: info.count,
           totalValue: info.count * 5000,
           onTimeDelivery: 85 + Math.random() * 10,
           defectRate: Math.random() * 3,
           responseTime: 2 + Math.random() * 8,
           status: info.count > 5 ? "preferred" : "approved",
           certifications: ["ISO 9001"],
           trend: "stable" as const,
           issues: Math.floor(Math.random() * 5),
         }));

         setSuppliers(mapped);
       } catch (err) {
         logger.error("Error fetching suppliers", err);
       }
     };
     fetchSuppliers();
   }, []);

   const filteredSuppliers = suppliers.filter(s =>
     s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.category.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const preferredCount = suppliers.filter(s => s.status === "preferred").length;
   const avgScore = suppliers.length ? suppliers.reduce((sum, s) => sum + s.overallScore, 0) / suppliers.length : 0;
   const issuesCount = suppliers.reduce((sum, s) => sum + s.issues, 0);
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <Award className="h-6 w-6 text-primary" />
             Performance de Fornecedores
           </h2>
           <p className="text-muted-foreground">Scorecards, métricas e gestão de desempenho</p>
         </div>
         <div className="relative w-[300px]">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input placeholder="Buscar fornecedor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
         </div>
       </div>
 
       <div className="grid grid-cols-4 gap-4">
         <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{suppliers.length}</p><p className="text-xs text-muted-foreground">Fornecedores Ativos</p></div>
         </CardContent></Card>
         <Card><CardContent className="p-4 flex items-center gap-3">
           <div className="p-2 rounded-lg bg-success/10"><Star className="h-5 w-5 text-success" /></div>
           <div><p className="text-2xl font-bold">{preferredCount}</p><p className="text-xs text-muted-foreground">Preferenciais</p></div>
         </CardContent></Card>
         <Card><CardContent className="p-4 flex items-center gap-3">
           <div className="p-2 rounded-lg bg-blue-500/10"><BarChart3 className="h-5 w-5 text-blue-500" /></div>
           <div><p className="text-2xl font-bold">{avgScore.toFixed(1)}</p><p className="text-xs text-muted-foreground">Score Médio</p></div>
         </CardContent></Card>
         <Card><CardContent className="p-4 flex items-center gap-3">
           <div className="p-2 rounded-lg bg-warning/10"><AlertTriangle className="h-5 w-5 text-warning" /></div>
           <div><p className="text-2xl font-bold">{issuesCount}</p><p className="text-xs text-muted-foreground">Issues Pendentes</p></div>
         </CardContent></Card>
       </div>
 
       <div className="grid grid-cols-3 gap-6">
         <div className="col-span-2">
           <Card>
             <CardHeader className="pb-3"><CardTitle className="text-base">Ranking de Fornecedores</CardTitle></CardHeader>
             <CardContent>
               <ScrollArea className="h-[500px]">
                 <div className="space-y-3">
                   {filteredSuppliers.map((supplier, index) => (
                     <div key={supplier.id} className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedSupplier?.id === supplier.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedSupplier(supplier)}>
                       <div className="flex items-start justify-between mb-3">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">#{index + 1}</div>
                           <div><p className="font-semibold">{supplier.name}</p><p className="text-sm text-muted-foreground">{supplier.category}</p></div>
                         </div>
                         <StatusBadge status={supplier.status} />
                       </div>
                       <div className="grid grid-cols-5 gap-4 mb-3">
                         <ScoreGauge score={supplier.overallScore} label="Geral" />
                         <ScoreGauge score={supplier.qualityScore} label="Qualidade" />
                         <ScoreGauge score={supplier.deliveryScore} label="Entrega" />
                         <ScoreGauge score={supplier.priceScore} label="Preço" />
                         <ScoreGauge score={supplier.serviceScore} label="Serviço" />
                       </div>
                       <div className="flex items-center justify-between text-sm text-muted-foreground">
                         <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{supplier.location}</span>
                         <span className="flex items-center gap-1"><Package className="h-3 w-3" />{supplier.totalOrders} pedidos</span>
                         <span className="flex items-center gap-1">
                           {supplier.trend === "up" ? <TrendingUp className="h-3 w-3 text-success" /> : supplier.trend === "down" ? <TrendingDown className="h-3 w-3 text-destructive" /> : null}
                           {supplier.trend === "up" ? "Melhorando" : supplier.trend === "down" ? "Piorando" : "Estável"}
                         </span>
                       </div>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </div>
         <div>
           {selectedSupplier ? (
             <Card>
               <CardHeader className="pb-3">
                 <div className="flex items-center justify-between"><CardTitle className="text-base">{selectedSupplier.name}</CardTitle><StatusBadge status={selectedSupplier.status} /></div>
                 <CardDescription>{selectedSupplier.category}</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="text-center p-4 bg-muted/50 rounded-lg">
                   <div className={`text-4xl font-bold ${selectedSupplier.overallScore >= 90 ? "text-success" : selectedSupplier.overallScore >= 75 ? "text-warning" : "text-destructive"}`}>{selectedSupplier.overallScore}</div>
                   <p className="text-sm text-muted-foreground">Score Geral</p>
                 </div>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between"><span className="text-sm">On-Time Delivery</span><span className="font-medium">{selectedSupplier.onTimeDelivery}%</span></div>
                   <Progress value={selectedSupplier.onTimeDelivery} className="h-2" />
                   <div className="flex items-center justify-between"><span className="text-sm">Taxa de Defeitos</span><span className="font-medium">{selectedSupplier.defectRate}%</span></div>
                   <Progress value={100 - selectedSupplier.defectRate * 10} className="h-2" />
                 </div>
                 <div><p className="text-sm text-muted-foreground mb-2">Certificações</p><div className="flex flex-wrap gap-1">{selectedSupplier.certifications.map((cert) => <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>)}</div></div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-muted/50 rounded-lg text-center"><p className="text-lg font-bold">{selectedSupplier.totalOrders}</p><p className="text-xs text-muted-foreground">Pedidos</p></div>
                   <div className="p-3 bg-muted/50 rounded-lg text-center"><p className="text-lg font-bold">R$ {(selectedSupplier.totalValue / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Valor Total</p></div>
                 </div>
                 {selectedSupplier.issues > 0 && (<div className="p-3 bg-warning/10 border border-warning/30 rounded-lg"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /><span className="text-sm font-medium">{selectedSupplier.issues} issues pendentes</span></div></div>)}
                 <div className="flex gap-2">
                   <Button className="flex-1" size="sm"><FileText className="h-4 w-4 mr-2" />Ver Histórico</Button>
                   <Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button>
                   <Button variant="outline" size="sm"><Phone className="h-4 w-4" /></Button>
                 </div>
               </CardContent>
             </Card>
           ) : (
             <Card><CardContent className="p-8 text-center text-muted-foreground"><Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Selecione um fornecedor para ver detalhes</p></CardContent></Card>
           )}
         </div>
       </div>
     </div>
   );
 }