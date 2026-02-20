/**
 * API Developer Portal — Gap #9: API Marketplace & Ecosystem
 * OpenAPI documentation, SDKs, sandbox, and 3rd-party integration hub
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Code, FileText, Key, Play, Globe, Search,
  Copy, ExternalLink, Lock, Unlock, Zap, Database,
  Ship, Users, Wrench, Shield, BarChart3, BookOpen
} from "lucide-react";

const API_ENDPOINTS = [
  { method: "GET", path: "/v1/vessels", description: "Listar embarcações da frota", scope: "read:vessels", category: "Fleet" },
  { method: "GET", path: "/v1/vessels/:id", description: "Detalhes de uma embarcação", scope: "read:vessels", category: "Fleet" },
  { method: "GET", path: "/v1/vessels/:id/position", description: "Posição AIS em tempo real", scope: "read:tracking", category: "Tracking" },
  { method: "GET", path: "/v1/crew", description: "Listar tripulantes", scope: "read:crew", category: "Crew" },
  { method: "GET", path: "/v1/crew/:id/certifications", description: "Certificações do tripulante", scope: "read:crew", category: "Crew" },
  { method: "GET", path: "/v1/documents", description: "Listar documentos", scope: "read:documents", category: "Documents" },
  { method: "POST", path: "/v1/documents/upload", description: "Upload de documento com OCR", scope: "write:documents", category: "Documents" },
  { method: "GET", path: "/v1/maintenance/work-orders", description: "Work orders ativas", scope: "read:maintenance", category: "Maintenance" },
  { method: "POST", path: "/v1/maintenance/work-orders", description: "Criar work order", scope: "write:maintenance", category: "Maintenance" },
  { method: "GET", path: "/v1/compliance/certificates", description: "Certificados e validades", scope: "read:compliance", category: "Compliance" },
  { method: "GET", path: "/v1/compliance/inspections", description: "Histórico de inspeções", scope: "read:compliance", category: "Compliance" },
  { method: "GET", path: "/v1/analytics/fleet-kpis", description: "KPIs consolidados da frota", scope: "read:analytics", category: "Analytics" },
  { method: "GET", path: "/v1/analytics/vessel/:id/performance", description: "Performance individual", scope: "read:analytics", category: "Analytics" },
  { method: "POST", path: "/v1/webhooks", description: "Registrar webhook", scope: "admin:webhooks", category: "Webhooks" },
  { method: "GET", path: "/v1/webhooks", description: "Listar webhooks ativos", scope: "read:webhooks", category: "Webhooks" },
];

const SDKS = [
  { language: "TypeScript/Node.js", package: "@nauti-one/sdk", version: "1.0.0", install: "npm install @nauti-one/sdk" },
  { language: "Python", package: "nauti-one-sdk", version: "1.0.0", install: "pip install nauti-one-sdk" },
  { language: "Java", package: "com.nautione:sdk", version: "1.0.0", install: "Maven / Gradle" },
  { language: "C# / .NET", package: "NautiOne.SDK", version: "1.0.0", install: "dotnet add package NautiOne.SDK" },
];

const SCOPES = [
  { scope: "read:vessels", description: "Leitura de dados de embarcações" },
  { scope: "write:vessels", description: "Modificar dados de embarcações" },
  { scope: "read:crew", description: "Leitura de dados de tripulação" },
  { scope: "write:crew", description: "Modificar dados de tripulação" },
  { scope: "read:documents", description: "Leitura de documentos" },
  { scope: "write:documents", description: "Upload e gestão de documentos" },
  { scope: "read:maintenance", description: "Leitura de manutenção e PMS" },
  { scope: "write:maintenance", description: "Criar/editar work orders" },
  { scope: "read:compliance", description: "Dados de compliance e certificados" },
  { scope: "read:tracking", description: "Posições AIS e tracking" },
  { scope: "read:analytics", description: "KPIs e relatórios analíticos" },
  { scope: "admin:webhooks", description: "Gestão de webhooks" },
];

export default function APIDeveloperPortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...new Set(API_ENDPOINTS.map(e => e.category))];

  const filteredEndpoints = API_ENDPOINTS.filter(ep => {
    const matchSearch = !searchQuery || ep.path.includes(searchQuery) || ep.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "all" || ep.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const methodColor = (m: string) => {
    const map: Record<string, string> = { GET: "bg-success/10 text-success", POST: "bg-primary/10 text-primary", PUT: "bg-warning/10 text-warning", DELETE: "bg-destructive/10 text-destructive" };
    return map[m] || "bg-muted text-muted-foreground";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Code className="h-8 w-8 text-primary" />
              API Developer Portal
            </h1>
            <p className="text-muted-foreground mt-1">Documentação OpenAPI 3.0, SDKs, sandbox e integrações 3rd-party</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-primary border-primary">v1.0.0</Badge>
            <Badge variant="outline">{API_ENDPOINTS.length} endpoints</Badge>
            <Badge variant="outline">{SCOPES.length} scopes</Badge>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Quick Start</p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono block mt-1">
                  curl -H &quot;Authorization: Bearer YOUR_API_KEY&quot; -H &quot;X-Scope: read:vessels&quot; https://api.nauti-one.com/v1/vessels
                </code>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard('curl -H "Authorization: Bearer YOUR_API_KEY" -H "X-Scope: read:vessels" https://api.nauti-one.com/v1/vessels')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="endpoints"><Globe className="h-4 w-4 mr-2" />Endpoints</TabsTrigger>
            <TabsTrigger value="auth"><Key className="h-4 w-4 mr-2" />Autenticação</TabsTrigger>
            <TabsTrigger value="sdks"><Code className="h-4 w-4 mr-2" />SDKs</TabsTrigger>
            <TabsTrigger value="sandbox"><Play className="h-4 w-4 mr-2" />Sandbox</TabsTrigger>
          </TabsList>

          {/* Endpoints */}
          <TabsContent value="endpoints" className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar endpoint..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex gap-1 flex-wrap">
                {categories.map(cat => (
                  <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="text-xs capitalize">
                    {cat === "all" ? "Todos" : cat}
                  </Button>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[60vh]">
                  <div className="divide-y divide-border">
                    {filteredEndpoints.map((ep, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                        <Badge className={`font-mono text-xs w-14 justify-center ${methodColor(ep.method)}`} variant="outline">{ep.method}</Badge>
                        <code className="font-mono text-sm text-foreground flex-1">{ep.path}</code>
                        <span className="text-xs text-muted-foreground hidden md:block">{ep.description}</span>
                        <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" />{ep.scope}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auth */}
          <TabsContent value="auth">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-primary" />API Keys</CardTitle>
                  <CardDescription>Autenticação via SHA-256 hash + Bearer Token</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted/30 p-3 rounded-lg font-mono text-xs space-y-1">
                    <p className="text-muted-foreground"># Header obrigatório</p>
                    <p className="text-foreground">Authorization: Bearer {"<api_key>"}</p>
                    <p className="text-foreground">X-Scope: read:vessels,read:crew</p>
                    <p className="text-foreground">X-Tenant-ID: {"<your_org_id>"}</p>
                  </div>
                  <Button className="w-full"><Key className="h-4 w-4 mr-2" />Gerar Nova API Key</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Scopes Disponíveis</CardTitle>
                  <CardDescription>Permissões granulares por recurso</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[40vh]">
                    <div className="space-y-2">
                      {SCOPES.map(s => (
                        <div key={s.scope} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                          <code className="font-mono text-xs text-foreground">{s.scope}</code>
                          <span className="text-xs text-muted-foreground">{s.description}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SDKs */}
          <TabsContent value="sdks">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SDKS.map(sdk => (
                <Card key={sdk.language}>
                  <CardHeader>
                    <CardTitle className="text-lg">{sdk.language}</CardTitle>
                    <CardDescription>Pacote: <code className="font-mono">{sdk.package}</code> v{sdk.version}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-3 rounded-lg flex items-center justify-between">
                      <code className="font-mono text-sm text-foreground">{sdk.install}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(sdk.install)}><Copy className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sandbox */}
          <TabsContent value="sandbox">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Play className="h-5 w-5 text-primary" />API Sandbox</CardTitle>
                <CardDescription>Teste endpoints em tempo real com dados de demonstração</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <Badge className="bg-success/10 text-success font-mono" variant="outline">GET</Badge>
                    <Input defaultValue="/v1/vessels" className="font-mono" />
                    <Button><Play className="h-4 w-4 mr-2" />Executar</Button>
                  </div>
                  <pre className="bg-background p-3 rounded border text-xs font-mono text-foreground overflow-auto max-h-64">
{`{
  "data": [
    {
      "id": "v-001",
      "name": "MV Atlantic Star",
      "imo": "9876543",
      "type": "Bulk Carrier",
      "flag": "Panama",
      "status": "at_sea",
      "position": { "lat": -23.5505, "lng": -46.6333 },
      "speed_knots": 12.5,
      "heading": 180
    }
  ],
  "meta": { "total": 42, "page": 1, "per_page": 20 }
}`}
                  </pre>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">Rate Limit: 1000 req/min</Badge>
                  <Badge variant="outline">Max Payload: 10MB</Badge>
                  <Badge variant="outline">Formato: JSON</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
