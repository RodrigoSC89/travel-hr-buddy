 /**
  * API Gateway Intelligence
  * Enterprise API management dashboard
  * Based on Kong, Apigee, AWS API Gateway best practices
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Input } from "@/components/ui/input";
 import { 
   Zap, 
   Activity,
   Shield,
   Key,
   AlertTriangle,
   CheckCircle,
   Clock,
   TrendingUp,
   TrendingDown,
   Globe,
   Server,
   Database,
   RefreshCw,
   Copy,
   Eye,
   EyeOff,
   Settings,
   BarChart3,
   PieChart,
   Webhook,
   Link2,
   ExternalLink,
   Lock,
   Unlock,
   Gauge
 } from "lucide-react";
 
 // API Endpoints
 const apiEndpoints = [
   {
     path: "/api/v1/vessels",
     method: "GET",
     requests24h: 15420,
     avgLatencyMs: 45,
     p99LatencyMs: 182,
     errorRate: 0.12,
     status: "healthy",
     rateLimit: 1000,
     rateLimitUsed: 654
   },
   {
     path: "/api/v1/crew",
     method: "GET",
     requests24h: 8930,
     avgLatencyMs: 62,
     p99LatencyMs: 245,
     errorRate: 0.08,
     status: "healthy",
     rateLimit: 500,
     rateLimitUsed: 289
   },
   {
     path: "/api/v1/documents",
     method: "POST",
     requests24h: 2145,
     avgLatencyMs: 320,
     p99LatencyMs: 890,
     errorRate: 1.45,
     status: "warning",
     rateLimit: 200,
     rateLimitUsed: 178
   },
   {
     path: "/api/v1/ai/chat",
     method: "POST",
     requests24h: 4560,
     avgLatencyMs: 1850,
     p99LatencyMs: 4200,
     errorRate: 2.34,
     status: "warning",
     rateLimit: 100,
     rateLimitUsed: 92
   }
 ];
 
 // API Keys
 const apiKeys = [
   {
     id: "key_prod_001",
     name: "Production - Fleet App",
     prefix: "nau_prod_*****",
     created: "2024-01-15",
     lastUsed: "2024-01-28 14:32",
     requests30d: 45230,
     quotaLimit: 100000,
     quotaUsed: 45230,
     status: "active",
     scopes: ["vessels:read", "crew:read", "documents:read"]
   },
   {
     id: "key_int_002",
     name: "Integration - ERP Sync",
     prefix: "nau_int_*****",
     created: "2024-01-10",
     lastUsed: "2024-01-28 14:28",
     requests30d: 28450,
     quotaLimit: 50000,
     quotaUsed: 28450,
     status: "active",
     scopes: ["vessels:read", "vessels:write", "maintenance:read"]
   },
   {
     id: "key_dev_003",
     name: "Development - Testing",
     prefix: "nau_dev_*****",
     created: "2024-01-20",
     lastUsed: "2024-01-27 18:45",
     requests30d: 5670,
     quotaLimit: 10000,
     quotaUsed: 5670,
     status: "active",
     scopes: ["*:read"]
   }
 ];
 
 // Webhooks
 const webhooks = [
   {
     id: "wh_001",
     name: "ERP Sync - Vessel Updates",
     url: "https://erp.company.com/webhooks/vessels",
     events: ["vessel.updated", "vessel.position.changed"],
     status: "active",
     deliveryRate: 99.8,
     lastDelivery: "2024-01-28 14:30:12",
     avgLatencyMs: 245,
     retryCount: 2
   },
   {
     id: "wh_002",
     name: "Slack - Alert Notifications",
     url: "https://hooks.slack.com/services/xxx",
     events: ["alert.critical", "maintenance.overdue"],
     status: "active",
     deliveryRate: 100,
     lastDelivery: "2024-01-28 12:15:45",
     avgLatencyMs: 180,
     retryCount: 0
   },
   {
     id: "wh_003",
     name: "Analytics - Event Stream",
     url: "https://analytics.company.com/ingest",
     events: ["user.action", "ai.decision"],
     status: "degraded",
     deliveryRate: 94.5,
     lastDelivery: "2024-01-28 14:28:00",
     avgLatencyMs: 520,
     retryCount: 8
   }
 ];
 
 // Status code distribution
 const statusCodeDistribution = {
   "2xx": 96.2,
   "3xx": 1.1,
   "4xx": 2.3,
   "5xx": 0.4
 };
 
 export default function APIGatewayIntelligence() {
   const [showApiKey, setShowApiKey] = useState<string | null>(null);
 
   const totalRequests = apiEndpoints.reduce((sum, ep) => sum + ep.requests24h, 0);
   const avgErrorRate = apiEndpoints.reduce((sum, ep) => sum + ep.errorRate, 0) / apiEndpoints.length;
 
   return (
     <div className="space-y-6">
       {/* Header KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Requests (24h)</p>
                 <p className="text-2xl font-bold text-primary">{(totalRequests / 1000).toFixed(1)}K</p>
                 <div className="flex items-center gap-1 mt-1">
                   <TrendingUp className="h-3 w-3 text-success" />
                   <span className="text-xs text-success">+12.5%</span>
                 </div>
               </div>
               <Activity className="h-10 w-10 text-primary/40" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Avg Latency</p>
                 <p className="text-2xl font-bold text-success">85ms</p>
                 <p className="text-xs text-muted-foreground">p99: 420ms</p>
               </div>
               <Gauge className="h-10 w-10 text-success/40" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Error Rate</p>
                 <p className="text-2xl font-bold text-warning">{avgErrorRate.toFixed(2)}%</p>
                 <p className="text-xs text-muted-foreground">429s: 0.8%</p>
               </div>
               <AlertTriangle className="h-10 w-10 text-warning/40" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">API Keys Ativos</p>
                 <p className="text-2xl font-bold text-accent-foreground">{apiKeys.length}</p>
                 <p className="text-xs text-muted-foreground">3 consumers</p>
               </div>
               <Key className="h-10 w-10 text-accent/40" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Webhooks</p>
                 <p className="text-2xl font-bold text-info">{webhooks.length}</p>
                 <p className="text-xs text-muted-foreground">99.2% delivery</p>
               </div>
               <Webhook className="h-10 w-10 text-info/40" />
             </div>
           </CardContent>
         </Card>
       </div>
 
       <Tabs defaultValue="endpoints" className="space-y-4">
         <TabsList className="grid w-full grid-cols-5">
           <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
           <TabsTrigger value="keys">API Keys</TabsTrigger>
           <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
           <TabsTrigger value="security">Segurança</TabsTrigger>
           <TabsTrigger value="docs">Documentação</TabsTrigger>
         </TabsList>
 
         {/* Endpoints Analytics */}
         <TabsContent value="endpoints" className="space-y-4">
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="flex items-center gap-2">
                     <Server className="h-5 w-5" />
                     Endpoint Analytics
                   </CardTitle>
                   <CardDescription>Performance e uso dos endpoints da API</CardDescription>
                 </div>
                 <Button variant="outline" size="sm">
                   <RefreshCw className="h-4 w-4 mr-2" />
                   Atualizar
                 </Button>
               </div>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {apiEndpoints.map((endpoint) => (
                   <div key={endpoint.path + endpoint.method} className="p-4 border rounded-lg">
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-3">
                         <Badge 
                           variant={endpoint.method === "GET" ? "secondary" : "default"}
                           className="font-mono"
                         >
                           {endpoint.method}
                         </Badge>
                         <code className="text-sm font-medium">{endpoint.path}</code>
                       </div>
                       <div className="flex items-center gap-2">
                         {endpoint.status === "healthy" ? (
                           <CheckCircle className="h-4 w-4 text-success" />
                         ) : (
                           <AlertTriangle className="h-4 w-4 text-warning" />
                         )}
                         <Badge variant={endpoint.status === "healthy" ? "default" : "secondary"}>
                           {endpoint.status === "healthy" ? "Saudável" : "Atenção"}
                         </Badge>
                       </div>
                     </div>
 
                     <div className="grid grid-cols-5 gap-4">
                       <div className="p-2 bg-muted/50 rounded text-center">
                         <p className="text-xs text-muted-foreground">Requests 24h</p>
                         <p className="font-semibold">{endpoint.requests24h.toLocaleString()}</p>
                       </div>
                       <div className="p-2 bg-muted/50 rounded text-center">
                         <p className="text-xs text-muted-foreground">Avg Latency</p>
                         <p className="font-semibold">{endpoint.avgLatencyMs}ms</p>
                       </div>
                       <div className="p-2 bg-muted/50 rounded text-center">
                         <p className="text-xs text-muted-foreground">p99 Latency</p>
                         <p className="font-semibold">{endpoint.p99LatencyMs}ms</p>
                       </div>
                       <div className={`p-2 rounded text-center ${endpoint.errorRate > 1 ? "bg-destructive/10" : "bg-muted/50"}`}>
                         <p className="text-xs text-muted-foreground">Error Rate</p>
                         <p className={`font-semibold ${endpoint.errorRate > 1 ? "text-destructive" : ""}`}>
                           {endpoint.errorRate}%
                         </p>
                       </div>
                       <div className="p-2 bg-muted/50 rounded">
                         <p className="text-xs text-muted-foreground mb-1">Rate Limit</p>
                         <Progress 
                           value={(endpoint.rateLimitUsed / endpoint.rateLimit) * 100} 
                           className="h-2"
                         />
                         <p className="text-xs text-right mt-1">
                           {endpoint.rateLimitUsed}/{endpoint.rateLimit}/min
                         </p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
 
               {/* Status Code Distribution */}
               <div className="mt-6 p-4 border rounded-lg">
                 <h4 className="font-semibold mb-4">Distribuição de Status Codes</h4>
                 <div className="flex items-center gap-4">
                   {Object.entries(statusCodeDistribution).map(([code, percent]) => (
                     <div key={code} className="flex-1">
                       <div className="flex items-center justify-between mb-1">
                         <span className={`text-sm font-medium ${
                           code === "2xx" ? "text-success" :
                           code === "4xx" ? "text-warning" :
                           code === "5xx" ? "text-destructive" : ""
                         }`}>{code}</span>
                         <span className="text-sm">{percent}%</span>
                       </div>
                       <Progress 
                         value={percent} 
                         className={`h-3 ${
                           code === "2xx" ? "bg-success/10" :
                           code === "4xx" ? "bg-warning/10" :
                           code === "5xx" ? "bg-destructive/10" : ""
                         }`}
                       />
                     </div>
                   ))}
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* API Keys */}
         <TabsContent value="keys" className="space-y-4">
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="flex items-center gap-2">
                     <Key className="h-5 w-5" />
                     API Key Management
                   </CardTitle>
                   <CardDescription>Gerenciamento de chaves e quotas de uso</CardDescription>
                 </div>
                 <Button>
                   <Key className="h-4 w-4 mr-2" />
                   Nova API Key
                 </Button>
               </div>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {apiKeys.map((key) => (
                   <div key={key.id} className="p-4 border rounded-lg">
                     <div className="flex items-center justify-between mb-3">
                       <div>
                         <p className="font-semibold">{key.name}</p>
                         <div className="flex items-center gap-2 mt-1">
                           <code className="text-sm text-muted-foreground">{key.prefix}</code>
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                           >
                             {showApiKey === key.id ? (
                               <EyeOff className="h-3 w-3" />
                             ) : (
                               <Eye className="h-3 w-3" />
                             )}
                           </Button>
                           <Button variant="ghost" size="sm">
                             <Copy className="h-3 w-3" />
                           </Button>
                         </div>
                       </div>
                       <Badge variant={key.status === "active" ? "default" : "secondary"}>
                         {key.status === "active" ? "Ativo" : "Inativo"}
                       </Badge>
                     </div>
 
                     <div className="grid grid-cols-4 gap-4 mb-3">
                       <div className="p-2 bg-muted/50 rounded">
                         <p className="text-xs text-muted-foreground">Criado</p>
                         <p className="text-sm font-medium">{key.created}</p>
                       </div>
                       <div className="p-2 bg-muted/50 rounded">
                         <p className="text-xs text-muted-foreground">Último Uso</p>
                         <p className="text-sm font-medium">{key.lastUsed}</p>
                       </div>
                       <div className="p-2 bg-muted/50 rounded">
                         <p className="text-xs text-muted-foreground">Requests (30d)</p>
                         <p className="text-sm font-medium">{key.requests30d.toLocaleString()}</p>
                       </div>
                       <div className="p-2 bg-muted/50 rounded">
                         <p className="text-xs text-muted-foreground mb-1">Quota</p>
                         <Progress value={(key.quotaUsed / key.quotaLimit) * 100} className="h-2" />
                         <p className="text-xs text-right">{((key.quotaUsed / key.quotaLimit) * 100).toFixed(0)}%</p>
                       </div>
                     </div>
 
                     <div className="flex items-center gap-2">
                       <span className="text-xs text-muted-foreground">Scopes:</span>
                       {key.scopes.map((scope) => (
                         <Badge key={scope} variant="outline" className="text-xs">
                           {scope}
                         </Badge>
                       ))}
                     </div>
 
                     <div className="flex items-center gap-2 mt-3">
                       <Button variant="outline" size="sm">
                         <RefreshCw className="h-3 w-3 mr-1" />
                         Rotacionar
                       </Button>
                       <Button variant="outline" size="sm">
                         <Settings className="h-3 w-3 mr-1" />
                         Editar
                       </Button>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Webhooks */}
         <TabsContent value="webhooks" className="space-y-4">
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="flex items-center gap-2">
                     <Webhook className="h-5 w-5" />
                     Webhook Management
                   </CardTitle>
                   <CardDescription>Monitoramento de entregas e eventos</CardDescription>
                 </div>
                 <Button>
                   <Link2 className="h-4 w-4 mr-2" />
                   Novo Webhook
                 </Button>
               </div>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {webhooks.map((wh) => (
                   <div key={wh.id} className="p-4 border rounded-lg">
                     <div className="flex items-center justify-between mb-3">
                       <div>
                         <p className="font-semibold">{wh.name}</p>
                         <div className="flex items-center gap-2 mt-1">
                           <ExternalLink className="h-3 w-3 text-muted-foreground" />
                           <code className="text-xs text-muted-foreground truncate max-w-md">
                             {wh.url}
                           </code>
                         </div>
                       </div>
                       <Badge variant={
                         wh.status === "active" ? "default" :
                         wh.status === "degraded" ? "secondary" : "destructive"
                       }>
                         {wh.status === "active" ? "Ativo" : 
                          wh.status === "degraded" ? "Degradado" : "Erro"}
                       </Badge>
                     </div>
 
                     <div className="grid grid-cols-4 gap-4 mb-3">
                       <div className={`p-2 rounded text-center ${wh.deliveryRate >= 99 ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                         <p className="text-xs text-muted-foreground">Delivery Rate</p>
                         <p className={`font-semibold ${wh.deliveryRate >= 99 ? "text-emerald-600" : "text-amber-600"}`}>
                           {wh.deliveryRate}%
                         </p>
                       </div>
                       <div className="p-2 bg-muted/50 rounded text-center">
                         <p className="text-xs text-muted-foreground">Avg Latency</p>
                         <p className="font-semibold">{wh.avgLatencyMs}ms</p>
                       </div>
                       <div className="p-2 bg-muted/50 rounded text-center">
                         <p className="text-xs text-muted-foreground">Retries (24h)</p>
                         <p className={`font-semibold ${wh.retryCount > 5 ? "text-amber-600" : ""}`}>
                           {wh.retryCount}
                         </p>
                       </div>
                       <div className="p-2 bg-muted/50 rounded text-center">
                         <p className="text-xs text-muted-foreground">Last Delivery</p>
                         <p className="text-xs font-medium">{wh.lastDelivery}</p>
                       </div>
                     </div>
 
                     <div className="flex items-center gap-2">
                       <span className="text-xs text-muted-foreground">Events:</span>
                       {wh.events.map((event) => (
                         <Badge key={event} variant="outline" className="text-xs">
                           {event}
                         </Badge>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Security */}
         <TabsContent value="security" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Shield className="h-5 w-5" />
                   Security Scorecard
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded">
                   <div className="flex items-center gap-2">
                     <CheckCircle className="h-4 w-4 text-emerald-500" />
                     <span className="text-sm">Autenticação em todos os endpoints</span>
                   </div>
                   <Badge variant="default">OK</Badge>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded">
                   <div className="flex items-center gap-2">
                     <CheckCircle className="h-4 w-4 text-emerald-500" />
                     <span className="text-sm">Rate limiting configurado</span>
                   </div>
                   <Badge variant="default">OK</Badge>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded">
                   <div className="flex items-center gap-2">
                     <CheckCircle className="h-4 w-4 text-emerald-500" />
                     <span className="text-sm">HTTPS enforced</span>
                   </div>
                   <Badge variant="default">OK</Badge>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded">
                   <div className="flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4 text-amber-500" />
                     <span className="text-sm">2 API keys sem rotação há 90+ dias</span>
                   </div>
                   <Badge variant="secondary">Atenção</Badge>
                 </div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Lock className="h-5 w-5" />
                   Políticas de Acesso
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="p-3 border rounded">
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-sm">IP Whitelist</span>
                     <Badge variant="secondary">Desativado</Badge>
                   </div>
                 </div>
                 <div className="p-3 border rounded">
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-sm">OAuth 2.0</span>
                     <Badge variant="default">Ativo</Badge>
                   </div>
                 </div>
                 <div className="p-3 border rounded">
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-sm">JWT Validation</span>
                     <Badge variant="default">Ativo</Badge>
                   </div>
                 </div>
                 <div className="p-3 border rounded">
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-sm">CORS Policy</span>
                     <Badge variant="default">Configurado</Badge>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         </TabsContent>
 
         {/* Documentation */}
         <TabsContent value="docs" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Globe className="h-5 w-5" />
                 Developer Portal
               </CardTitle>
               <CardDescription>Documentação interativa e sandbox da API</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-6 border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                   <BarChart3 className="h-10 w-10 mx-auto mb-3 text-primary" />
                   <h4 className="font-semibold">OpenAPI Spec</h4>
                   <p className="text-sm text-muted-foreground mt-1">Swagger/OpenAPI 3.0</p>
                   <Button variant="outline" size="sm" className="mt-4">
                     <ExternalLink className="h-4 w-4 mr-2" />
                     Abrir Docs
                   </Button>
                 </div>
                 <div className="p-6 border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                   <Database className="h-10 w-10 mx-auto mb-3 text-primary" />
                   <h4 className="font-semibold">API Sandbox</h4>
                   <p className="text-sm text-muted-foreground mt-1">Teste endpoints ao vivo</p>
                   <Button variant="outline" size="sm" className="mt-4">
                     <Zap className="h-4 w-4 mr-2" />
                     Try It Out
                   </Button>
                 </div>
                 <div className="p-6 border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                   <PieChart className="h-10 w-10 mx-auto mb-3 text-primary" />
                   <h4 className="font-semibold">SDKs & Libraries</h4>
                   <p className="text-sm text-muted-foreground mt-1">JS, Python, Go</p>
                   <Button variant="outline" size="sm" className="mt-4">
                     <ExternalLink className="h-4 w-4 mr-2" />
                     Download
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }