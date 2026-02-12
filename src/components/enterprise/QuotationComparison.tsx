 /**
  * Quotation Comparison Panel
  * Comparativo de cotações lado-a-lado
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { Separator } from "@/components/ui/separator";
 import { 
   CheckCircle, XCircle, Star, DollarSign, Clock, 
   Truck, Award, AlertTriangle, Sparkles, Scale,
   FileText, Building, Calendar, Package
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface Quotation {
   id: string;
   supplier: string;
   supplierRating: number;
   unitPrice: number;
   quantity: number;
   totalPrice: number;
   currency: string;
   leadTime: number; // days
   warranty: number; // months
   paymentTerms: string;
   incoterm: string;
   validUntil: string;
   pros: string[];
   cons: string[];
   score: number; // AI calculated score 0-100
 }
 
 interface QuotationComparisonProps {
   requestTitle?: string;
   quotations?: Quotation[];
   onSelect?: (quotation: Quotation) => void;
 }
 
 const defaultQuotations: Quotation[] = [
   {
     id: "Q-001",
     supplier: "MAN Energy Solutions",
     supplierRating: 4.8,
     unitPrice: 8500,
     quantity: 5,
     totalPrice: 42500,
     currency: "USD",
     leadTime: 14,
     warranty: 24,
     paymentTerms: "Net 30",
     incoterm: "DDP Santos",
     validUntil: "2026-02-20",
     pros: ["OEM original", "Garantia estendida", "Suporte técnico incluído"],
     cons: ["Preço mais alto", "Lead time maior"],
     score: 92
   },
   {
     id: "Q-002",
     supplier: "Wärtsilä Parts",
     supplierRating: 4.5,
     unitPrice: 7800,
     quantity: 5,
     totalPrice: 39000,
     currency: "USD",
     leadTime: 10,
     warranty: 18,
     paymentTerms: "Net 45",
     incoterm: "CIF Santos",
     validUntil: "2026-02-15",
     pros: ["Bom preço", "Entrega rápida", "Pagamento flexível"],
     cons: ["Garantia menor", "Não inclui instalação"],
     score: 88
   },
   {
     id: "Q-003",
     supplier: "MarineParts Global",
     supplierRating: 4.2,
     unitPrice: 6900,
     quantity: 5,
     totalPrice: 34500,
     currency: "USD",
     leadTime: 21,
     warranty: 12,
     paymentTerms: "50% Adiantado",
     incoterm: "FOB Hamburgo",
     validUntil: "2026-02-18",
     pros: ["Melhor preço", "Fornecedor aprovado"],
     cons: ["Lead time longo", "Garantia básica", "Frete adicional"],
     score: 75
   }
 ];
 
 export function QuotationComparison({ 
   requestTitle = "Peças de reposição - Motor Principal",
   quotations = defaultQuotations,
   onSelect 
 }: QuotationComparisonProps) {
   const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);
 
   const lowestPrice = Math.min(...quotations.map(q => q.totalPrice));
   const fastestDelivery = Math.min(...quotations.map(q => q.leadTime));
   const bestRating = Math.max(...quotations.map(q => q.supplierRating));
   const bestScore = Math.max(...quotations.map(q => q.score));
 
   const handleSelect = (quotation: Quotation) => {
     setSelectedQuotation(quotation.id);
     onSelect?.(quotation);
   };
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h3 className="text-lg font-semibold flex items-center gap-2">
             <Scale className="h-5 w-5 text-primary" />
             Comparativo de Cotações
           </h3>
           <p className="text-sm text-muted-foreground">{requestTitle}</p>
         </div>
         <Badge variant="outline" className="gap-1">
           <Sparkles className="h-3 w-3" />
           {quotations.length} cotações recebidas
         </Badge>
       </div>
 
       {/* Quick Stats */}
       <div className="grid grid-cols-4 gap-4">
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="p-3 text-center">
             <DollarSign className="h-5 w-5 mx-auto text-success mb-1" />
             <p className="text-xs text-muted-foreground">Menor Preço</p>
             <p className="font-bold">${lowestPrice.toLocaleString()}</p>
           </CardContent>
         </Card>
        <Card className="bg-gradient-to-br from-info/10 to-info/5">
            <CardContent className="p-3 text-center">
              <Truck className="h-5 w-5 mx-auto text-info mb-1" />
             <p className="text-xs text-muted-foreground">Entrega Mais Rápida</p>
             <p className="font-bold">{fastestDelivery} dias</p>
           </CardContent>
         </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
            <CardContent className="p-3 text-center">
              <Star className="h-5 w-5 mx-auto text-warning mb-1" />
             <p className="text-xs text-muted-foreground">Melhor Rating</p>
             <p className="font-bold">{bestRating.toFixed(1)}</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="p-3 text-center">
             <Award className="h-5 w-5 mx-auto text-primary mb-1" />
             <p className="text-xs text-muted-foreground">Melhor Score IA</p>
             <p className="font-bold">{bestScore}%</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Comparison Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {quotations.map((quotation, idx) => {
           const isLowestPrice = quotation.totalPrice === lowestPrice;
           const isFastest = quotation.leadTime === fastestDelivery;
           const isBestScore = quotation.score === bestScore;
           const isSelected = selectedQuotation === quotation.id;
 
           return (
             <Card 
               key={quotation.id}
               className={cn(
                 "relative overflow-hidden transition-all cursor-pointer hover:shadow-lg",
                 isSelected && "ring-2 ring-primary",
                 isBestScore && "border-primary"
               )}
               onClick={() => handleSelect(quotation)}
             >
               {/* Best Score Badge */}
               {isBestScore && (
                 <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                   <Sparkles className="h-3 w-3 inline mr-1" />
                   Recomendado IA
                 </div>
               )}
 
               <CardHeader className="pb-3">
                 <div className="flex items-start justify-between">
                   <div>
                     <CardTitle className="text-base">{quotation.supplier}</CardTitle>
                     <div className="flex items-center gap-1 mt-1">
                       <Star className="h-3 w-3 fill-warning text-warning" />
                       <span className="text-sm">{quotation.supplierRating.toFixed(1)}</span>
                     </div>
                   </div>
                   <Badge variant="outline">{quotation.id}</Badge>
                 </div>
               </CardHeader>
 
               <CardContent className="space-y-4">
                 {/* Price */}
                 <div className="text-center py-4 bg-muted/30 rounded-lg">
                   <p className="text-3xl font-bold">
                     ${quotation.totalPrice.toLocaleString()}
                   </p>
                   <p className="text-sm text-muted-foreground">
                     ${quotation.unitPrice.toLocaleString()} x {quotation.quantity} un
                   </p>
                   {isLowestPrice && (
                     <Badge className="mt-2 bg-success/20 text-success border-0">
                       <DollarSign className="h-3 w-3 mr-1" />
                       Menor Preço
                     </Badge>
                   )}
                 </div>
 
                 {/* AI Score */}
                 <div>
                   <div className="flex justify-between text-sm mb-1">
                     <span className="text-muted-foreground">Score IA</span>
                     <span className="font-bold">{quotation.score}%</span>
                   </div>
                   <Progress 
                     value={quotation.score} 
                     className={cn(
                       "h-2",
                       quotation.score >= 90 && "[&>div]:bg-success",
                       quotation.score >= 80 && quotation.score < 90 && "[&>div]:bg-primary",
                       quotation.score < 80 && "[&>div]:bg-warning"
                     )}
                   />
                 </div>
 
                 <Separator />
 
                 {/* Details */}
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="flex items-center gap-1 text-muted-foreground">
                       <Truck className="h-3 w-3" /> Lead Time
                     </span>
                     <span className={cn("font-medium", isFastest && "text-info")}>
                       {quotation.leadTime} dias
                       {isFastest && " ⚡"}
                     </span>
                   </div>
                   <div className="flex justify-between">
                     <span className="flex items-center gap-1 text-muted-foreground">
                       <Clock className="h-3 w-3" /> Garantia
                     </span>
                     <span className="font-medium">{quotation.warranty} meses</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="flex items-center gap-1 text-muted-foreground">
                       <FileText className="h-3 w-3" /> Pagamento
                     </span>
                     <span className="font-medium">{quotation.paymentTerms}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="flex items-center gap-1 text-muted-foreground">
                       <Package className="h-3 w-3" /> Incoterm
                     </span>
                     <span className="font-medium">{quotation.incoterm}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="flex items-center gap-1 text-muted-foreground">
                       <Calendar className="h-3 w-3" /> Válido até
                     </span>
                     <span className="font-medium">{quotation.validUntil}</span>
                   </div>
                 </div>
 
                 <Separator />
 
                 {/* Pros & Cons */}
                 <div className="space-y-2">
                   <div>
                     <p className="text-xs font-medium text-success mb-1">Vantagens</p>
                      {quotation.pros.map((pro) => (
                        <div key={pro} className="flex items-start gap-1 text-xs text-muted-foreground">
                         <CheckCircle className="h-3 w-3 text-success shrink-0 mt-0.5" />
                         <span>{pro}</span>
                       </div>
                     ))}
                   </div>
                   <div>
                     <p className="text-xs font-medium text-destructive mb-1">Desvantagens</p>
                      {quotation.cons.map((con) => (
                        <div key={con} className="flex items-start gap-1 text-xs text-muted-foreground">
                         <XCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                         <span>{con}</span>
                       </div>
                     ))}
                   </div>
                 </div>
 
                 {/* Action */}
                 <Button 
                   className="w-full" 
                   variant={isSelected ? "default" : "outline"}
                 >
                   {isSelected ? (
                     <>
                       <CheckCircle className="h-4 w-4 mr-2" />
                       Selecionado
                     </>
                   ) : (
                     "Selecionar"
                   )}
                 </Button>
               </CardContent>
             </Card>
           );
         })}
       </div>
     </div>
   );
 }
 
 export default QuotationComparison;