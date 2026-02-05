 /**
  * Document Intelligence Hub - Smart Document Management
  * OCR, AI Tagging, and Compliance Automation
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Input } from "@/components/ui/input";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   FileText, Search, Upload, Tag, Brain, CheckCircle2,
   AlertTriangle, Clock, Download, Eye, Folder, 
   FileCheck, FileClock, FileX, Filter, Sparkles
 } from "lucide-react";
 
 interface Document {
   id: string;
   name: string;
   type: string;
   category: string;
   vessel: string;
   status: "valid" | "expiring" | "expired" | "pending";
   expiryDate: string;
   lastModified: string;
   aiTags: string[];
   confidence: number;
 }
 
 const documents: Document[] = [
   { id: "1", name: "Certificado SOLAS", type: "Certificado", category: "Compliance", vessel: "Nautilus Star", status: "valid", expiryDate: "2027-06-15", lastModified: "2026-01-20", aiTags: ["SOLAS", "Safety", "IMO"], confidence: 98 },
   { id: "2", name: "Certificado STCW - João Silva", type: "Certificado Pessoal", category: "Tripulação", vessel: "Nautilus Star", status: "expiring", expiryDate: "2026-03-01", lastModified: "2021-03-01", aiTags: ["STCW", "Competência", "Capitão"], confidence: 95 },
   { id: "3", name: "Contrato de Afretamento TCP-2024-045", type: "Contrato", category: "Comercial", vessel: "Nautilus Explorer", status: "valid", expiryDate: "2026-12-31", lastModified: "2024-07-15", aiTags: ["Charter", "TCP", "Afretamento"], confidence: 92 },
   { id: "4", name: "Certificado de Classe DNV", type: "Certificado", category: "Classe", vessel: "Nautilus Star", status: "expired", expiryDate: "2026-01-30", lastModified: "2021-01-30", aiTags: ["DNV", "Classe", "Vistoria"], confidence: 99 },
   { id: "5", name: "Apólice P&I Insurance", type: "Seguro", category: "Financeiro", vessel: "Nautilus Star", status: "valid", expiryDate: "2027-02-20", lastModified: "2026-02-01", aiTags: ["Seguro", "P&I", "Marine Insurance"], confidence: 97 },
   { id: "6", name: "Checklist Pre-Arrival Santos", type: "Checklist", category: "Operacional", vessel: "Nautilus Explorer", status: "pending", expiryDate: "-", lastModified: "2026-02-04", aiTags: ["Checklist", "Port Call", "Santos"], confidence: 88 }
 ];
 
 export default function DocumentIntelligenceHub() {
   const [activeTab, setActiveTab] = useState("overview");
   const [searchQuery, setSearchQuery] = useState("");
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case "expired": return <Badge className="bg-destructive text-destructive-foreground"><FileX className="h-3 w-3 mr-1" />Expirado</Badge>;
       case "expiring": return <Badge className="bg-warning/10 text-warning"><FileClock className="h-3 w-3 mr-1" />Expirando</Badge>;
       case "pending": return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
       default: return <Badge className="bg-success/10 text-success"><FileCheck className="h-3 w-3 mr-1" />Válido</Badge>;
     }
   };
 
   const validDocs = documents.filter(d => d.status === "valid").length;
   const expiringDocs = documents.filter(d => d.status === "expiring").length;
   const expiredDocs = documents.filter(d => d.status === "expired").length;
 
   const filteredDocs = documents.filter(doc => 
     doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     doc.aiTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
   );
 
   return (
     <div className="space-y-6">
       {/* KPI Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Total Documentos</p>
                 <p className="text-2xl font-bold">1,247</p>
               </div>
               <FileText className="h-8 w-8 text-primary/50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">+23 este mês</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Válidos</p>
                 <p className="text-2xl font-bold text-success">{validDocs}</p>
               </div>
               <FileCheck className="h-8 w-8 text-success/50" />
             </div>
             <Progress value={(validDocs / documents.length) * 100} className="h-1.5 mt-2" />
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Expirando</p>
                 <p className="text-2xl font-bold text-warning">{expiringDocs}</p>
               </div>
               <FileClock className="h-8 w-8 text-warning/50" />
             </div>
             <p className="text-xs text-warning mt-2">Próx. 30 dias</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Expirados</p>
                 <p className="text-2xl font-bold text-destructive">{expiredDocs}</p>
               </div>
               <FileX className="h-8 w-8 text-destructive/50" />
             </div>
             <p className="text-xs text-destructive mt-2">Ação imediata</p>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">OCR Processado</p>
                 <p className="text-2xl font-bold">95%</p>
               </div>
               <Brain className="h-8 w-8 text-purple-500/50" />
             </div>
             <p className="text-xs text-muted-foreground mt-2">AI tagging ativo</p>
           </CardContent>
         </Card>
       </div>
 
       {/* Search and Actions */}
       <div className="flex items-center gap-4">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
             placeholder="Buscar por nome, tags, categoria..." 
             className="pl-10"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </div>
         <Button variant="outline">
           <Filter className="h-4 w-4 mr-2" />
           Filtros
         </Button>
         <Button>
           <Upload className="h-4 w-4 mr-2" />
           Upload
         </Button>
       </div>
 
       {/* Main Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid w-full grid-cols-4 h-auto p-1">
           <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
             <Folder className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Documentos</span>
           </TabsTrigger>
           <TabsTrigger value="certificates" className="flex items-center gap-2 py-2">
             <FileCheck className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Certificados</span>
           </TabsTrigger>
           <TabsTrigger value="ai" className="flex items-center gap-2 py-2">
             <Sparkles className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">IA & OCR</span>
           </TabsTrigger>
           <TabsTrigger value="reports" className="flex items-center gap-2 py-2">
             <Download className="h-4 w-4" />
             <span className="hidden sm:inline text-xs">Relatórios</span>
           </TabsTrigger>
         </TabsList>
 
         {/* Documents Overview */}
         <TabsContent value="overview" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <FileText className="h-5 w-5 text-primary" />
                 Biblioteca de Documentos
               </CardTitle>
               <CardDescription>
                 Gestão inteligente com OCR e classificação automática
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {filteredDocs.map((doc) => (
                   <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                         <FileText className="h-5 w-5 text-primary" />
                       </div>
                       <div>
                         <p className="font-medium">{doc.name}</p>
                         <p className="text-xs text-muted-foreground">
                           {doc.type} • {doc.vessel} • {doc.category}
                         </p>
                         <div className="flex gap-1 mt-1">
                           {doc.aiTags.map((tag, idx) => (
                             <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0">
                               <Tag className="h-2 w-2 mr-1" />
                               {tag}
                             </Badge>
                           ))}
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="text-right text-sm">
                         <p className="text-muted-foreground">Validade</p>
                         <p className="font-medium">{doc.expiryDate}</p>
                       </div>
                       {getStatusBadge(doc.status)}
                       <div className="flex gap-1">
                         <Button variant="ghost" size="sm">
                           <Eye className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="sm">
                           <Download className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Certificates Tab */}
         <TabsContent value="certificates" className="space-y-4">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
             <Card className="border-success/50">
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm flex items-center gap-2 text-success">
                   <CheckCircle2 className="h-4 w-4" />
                   Certificados Válidos
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-3xl font-bold">42</p>
                 <p className="text-xs text-muted-foreground">SOLAS, STCW, ISM, ISPS...</p>
               </CardContent>
             </Card>
 
             <Card className="border-warning/50">
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm flex items-center gap-2 text-warning">
                   <Clock className="h-4 w-4" />
                   Próx. 30 Dias
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-3xl font-bold">7</p>
                 <p className="text-xs text-muted-foreground">Renovações necessárias</p>
               </CardContent>
             </Card>
 
             <Card className="border-destructive/50">
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                   <AlertTriangle className="h-4 w-4" />
                   Ação Urgente
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-3xl font-bold">2</p>
                 <p className="text-xs text-muted-foreground">Certificados expirados</p>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* AI & OCR Tab */}
         <TabsContent value="ai" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-purple-500" />
                 Inteligência Artificial & OCR
               </CardTitle>
               <CardDescription>
                 Processamento automático de documentos
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="text-center p-4 border rounded-lg">
                   <Brain className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                   <p className="text-2xl font-bold">96.5%</p>
                   <p className="text-sm text-muted-foreground">Precisão OCR</p>
                 </div>
                 <div className="text-center p-4 border rounded-lg">
                   <Tag className="h-8 w-8 mx-auto text-primary mb-2" />
                   <p className="text-2xl font-bold">3,421</p>
                   <p className="text-sm text-muted-foreground">Tags Geradas</p>
                 </div>
                 <div className="text-center p-4 border rounded-lg">
                   <Clock className="h-8 w-8 mx-auto text-success mb-2" />
                   <p className="text-2xl font-bold">2.3s</p>
                   <p className="text-sm text-muted-foreground">Tempo Médio</p>
                 </div>
               </div>
 
               <div className="border rounded-lg p-4 bg-muted/30">
                 <div className="flex items-center gap-3 mb-3">
                   <Upload className="h-5 w-5 text-primary" />
                   <p className="font-medium">Zona de Upload Inteligente</p>
                 </div>
                 <div className="border-2 border-dashed rounded-lg p-8 text-center">
                   <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                   <p className="text-muted-foreground">
                     Arraste documentos aqui para processamento automático
                   </p>
                   <p className="text-xs text-muted-foreground mt-1">
                     PDF, DOC, DOCX, JPG, PNG (máx. 50MB)
                   </p>
                   <Button className="mt-4">Selecionar Arquivos</Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Reports Tab */}
         <TabsContent value="reports" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Download className="h-5 w-5 text-primary" />
                 Geração de Relatórios
               </CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { name: "Relatório de Certificados", desc: "Status de todos os certificados da frota" },
                 { name: "Compliance Report", desc: "Conformidade regulatória consolidada" },
                 { name: "Documentos Expirados", desc: "Lista de ações pendentes" },
                 { name: "Histórico de Uploads", desc: "Auditoria de movimentações" }
               ].map((report, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                   <div>
                     <p className="font-medium">{report.name}</p>
                     <p className="text-xs text-muted-foreground">{report.desc}</p>
                   </div>
                   <Button variant="outline" size="sm">
                     <Download className="h-4 w-4 mr-2" />
                     Gerar
                   </Button>
                 </div>
               ))}
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }