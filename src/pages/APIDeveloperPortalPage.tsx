/**
 * API Developer Portal — Gap #9: API Marketplace & Ecosystem
 * OpenAPI documentation, SDKs, sandbox with live API calls, and 3rd-party integration hub
 */

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Code, FileText, Key, Play, Globe, Search,
  Copy, ExternalLink, Lock, Unlock, Zap, Database,
  Ship, Users, Wrench, Shield, BarChart3, BookOpen,
  Loader2, CheckCircle2, XCircle, Clock, ArrowRight,
  Terminal, Download, Webhook
} from "lucide-react";

const API_ENDPOINTS = [
  { method: "GET", path: "/v1/vessels", description: "Listar embarcações da frota", scope: "read:vessels", category: "Fleet", hasBody: false },
  { method: "GET", path: "/v1/vessels/:id", description: "Detalhes de uma embarcação", scope: "read:vessels", category: "Fleet", hasBody: false },
  { method: "GET", path: "/v1/crew", description: "Listar tripulantes", scope: "read:crew", category: "Crew", hasBody: false },
  { method: "POST", path: "/v1/crew", description: "Criar tripulante", scope: "write:crew", category: "Crew", hasBody: true },
  { method: "GET", path: "/v1/documents", description: "Listar documentos", scope: "read:documents", category: "Documents", hasBody: false },
  { method: "GET", path: "/v1/maintenance", description: "Work orders ativas", scope: "read:maintenance", category: "Maintenance", hasBody: false },
  { method: "GET", path: "/v1/certificates", description: "Certificados e validades", scope: "read:compliance", category: "Compliance", hasBody: false },
  { method: "GET", path: "/v1/analytics/summary", description: "KPIs consolidados", scope: "read:analytics", category: "Analytics", hasBody: false },
  { method: "GET", path: "/v1/status", description: "Health check (público)", scope: "none", category: "System", hasBody: false },
  { method: "GET", path: "/v1/docs", description: "Spec OpenAPI 3.0 (público)", scope: "none", category: "System", hasBody: false },
  { method: "POST", path: "/v1/webhooks/dispatch", description: "Disparar webhook", scope: "write:webhooks", category: "Webhooks", hasBody: true },
];

const SDKS = [
  { language: "TypeScript/Node.js", package: "@nauti-one/sdk", version: "1.0.0", install: "npm install @nauti-one/sdk", example: `import { NautiOne } from '@nauti-one/sdk';\n\nconst client = new NautiOne({ apiKey: 'YOUR_KEY' });\nconst vessels = await client.vessels.list({ limit: 10 });\nconsole.log(vessels.data);` },
  { language: "Python", package: "nauti-one-sdk", version: "1.0.0", install: "pip install nauti-one-sdk", example: `from nauti_one import NautiOne\n\nclient = NautiOne(api_key="YOUR_KEY")\nvessels = client.vessels.list(limit=10)\nprint(vessels.data)` },
  { language: "cURL", package: "REST API", version: "1.0.0", install: "# Nenhuma instalação necessária", example: `curl -X GET "https://api.nauti-one.com/v1/vessels?limit=10" \\\n  -H "Authorization: Bearer YOUR_KEY" \\\n  -H "Content-Type: application/json"` },
  { language: "Java", package: "com.nautione:sdk", version: "1.0.0", install: "Maven / Gradle", example: `NautiOne client = new NautiOne("YOUR_KEY");\nListResponse<Vessel> vessels = client.vessels().list(10);\nvessels.getData().forEach(System.out::println);` },
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

const CHANGELOG = [
  { version: "1.0.0", date: "2026-02-15", changes: ["API pública lançada", "SHA-256 key validation", "Rate limiting", "15 endpoints"] },
  { version: "0.9.0", date: "2026-02-01", changes: ["Beta: Vessels, Crew, Documents endpoints", "Scoped access control"] },
];

interface SandboxResult {
  status: number;
  data: unknown;
  time: number;
  headers?: Record<string, string>;
}

export default function APIDeveloperPortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Sandbox state
  const [sandboxMethod, setSandboxMethod] = useState("GET");
  const [sandboxPath, setSandboxPath] = useState("/v1/status");
  const [sandboxBody, setSandboxBody] = useState("");
  const [sandboxResult, setSandboxResult] = useState<SandboxResult | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [selectedSdkLang, setSelectedSdkLang] = useState("TypeScript/Node.js");

  const categories = ["all", ...new Set(API_ENDPOINTS.map(e => e.category))];

  const filteredEndpoints = API_ENDPOINTS.filter(ep => {
    const matchSearch = !searchQuery || ep.path.includes(searchQuery) || ep.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "all" || ep.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const methodColor = (m: string) => {
    const map: Record<string, string> = { 
      GET: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", 
      POST: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30", 
      PUT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30", 
      DELETE: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" 
    };
    return map[m] || "bg-muted text-muted-foreground";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para o clipboard!");
  };

  const executeSandbox = useCallback(async () => {
    setSandboxLoading(true);
    setSandboxResult(null);
    const start = Date.now();

    try {
      // Call the public-api edge function
      const { data, error } = await supabase.functions.invoke("public-api", {
        method: sandboxMethod as "GET" | "POST",
        body: sandboxMethod === "GET" 
          ? { _path: sandboxPath, _method: sandboxMethod }
          : { _path: sandboxPath, _method: sandboxMethod, ...(sandboxBody ? JSON.parse(sandboxBody) : {}) },
      });

      const elapsed = Date.now() - start;

      if (error) {
        setSandboxResult({ status: 500, data: { error: error.message }, time: elapsed });
      } else {
        setSandboxResult({ status: 200, data, time: elapsed });
      }
    } catch (err) {
      const elapsed = Date.now() - start;
      setSandboxResult({ 
        status: 500, 
        data: { error: err instanceof Error ? err.message : "Unknown error" }, 
        time: elapsed 
      });
    } finally {
      setSandboxLoading(false);
    }
  }, [sandboxMethod, sandboxPath, sandboxBody]);

  const selectEndpoint = (ep: typeof API_ENDPOINTS[0]) => {
    setSandboxMethod(ep.method);
    setSandboxPath(ep.path);
    setSandboxBody("");
    setSandboxResult(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Terminal className="h-8 w-8 text-primary" />
              API Developer Portal
            </h1>
            <p className="text-muted-foreground mt-1">OpenAPI 3.0 · Live Sandbox · SDKs · Webhooks</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary">v1.0.0</Badge>
            <Badge variant="outline">{API_ENDPOINTS.length} endpoints</Badge>
            <Badge variant="outline">{SCOPES.length} scopes</Badge>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30" variant="outline">
              <CheckCircle2 className="h-3 w-3 mr-1" />Live
            </Badge>
          </div>
        </div>

        {/* Quick Start Banner */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Quick Start — 3 passos</p>
                <div className="flex flex-col sm:flex-row gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Badge className="bg-primary/10 text-primary text-[10px]">1</Badge>Gere uma API Key</span>
                  <ArrowRight className="h-3 w-3 hidden sm:block self-center" />
                  <span className="flex items-center gap-1"><Badge className="bg-primary/10 text-primary text-[10px]">2</Badge>Escolha seus scopes</span>
                  <ArrowRight className="h-3 w-3 hidden sm:block self-center" />
                  <span className="flex items-center gap-1"><Badge className="bg-primary/10 text-primary text-[10px]">3</Badge>Faça sua primeira chamada</span>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono block mt-2 overflow-x-auto">
                  curl -H &quot;Authorization: Bearer YOUR_API_KEY&quot; https://api.nauti-one.com/v1/vessels
                </code>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard('curl -H "Authorization: Bearer YOUR_API_KEY" https://api.nauti-one.com/v1/vessels')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="endpoints"><Globe className="h-4 w-4 mr-1.5" />Endpoints</TabsTrigger>
            <TabsTrigger value="sandbox"><Play className="h-4 w-4 mr-1.5" />Sandbox</TabsTrigger>
            <TabsTrigger value="auth"><Key className="h-4 w-4 mr-1.5" />Auth</TabsTrigger>
            <TabsTrigger value="sdks"><Code className="h-4 w-4 mr-1.5" />SDKs</TabsTrigger>
            <TabsTrigger value="changelog"><FileText className="h-4 w-4 mr-1.5" />Changelog</TabsTrigger>
          </TabsList>

          {/* Endpoints */}
          <TabsContent value="endpoints" className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
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
                      <div 
                        key={i} 
                        className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors cursor-pointer group"
                        onClick={() => selectEndpoint(ep)}
                      >
                        <Badge className={`font-mono text-xs w-14 justify-center ${methodColor(ep.method)}`} variant="outline">{ep.method}</Badge>
                        <code className="font-mono text-sm text-foreground flex-1">{ep.path}</code>
                        <span className="text-xs text-muted-foreground hidden md:block flex-shrink-0">{ep.description}</span>
                        {ep.scope !== "none" ? (
                          <Badge variant="outline" className="text-xs flex-shrink-0"><Lock className="h-3 w-3 mr-1" />{ep.scope}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 flex-shrink-0"><Unlock className="h-3 w-3 mr-1" />público</Badge>
                        )}
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Sandbox */}
          <TabsContent value="sandbox" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Request Panel */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Terminal className="h-4 w-4 text-primary" />
                    Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Select value={sandboxMethod} onValueChange={setSandboxMethod}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      value={sandboxPath} 
                      onChange={e => setSandboxPath(e.target.value)} 
                      className="font-mono text-sm flex-1"
                      placeholder="/v1/vessels"
                    />
                    <Button onClick={executeSandbox} disabled={sandboxLoading} className="gap-2">
                      {sandboxLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Run
                    </Button>
                  </div>

                  {/* Quick endpoint buttons */}
                  <div className="flex gap-1 flex-wrap">
                    {["/v1/status", "/v1/docs", "/v1/vessels", "/v1/crew", "/v1/analytics/summary"].map(path => (
                      <Button 
                        key={path} 
                        variant="outline" 
                        size="sm" 
                        className="text-xs font-mono h-7"
                        onClick={() => { setSandboxPath(path); setSandboxMethod("GET"); }}
                      >
                        {path}
                      </Button>
                    ))}
                  </div>

                  {(sandboxMethod === "POST" || sandboxMethod === "PUT") && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Request Body (JSON)</p>
                      <Textarea 
                        value={sandboxBody} 
                        onChange={e => setSandboxBody(e.target.value)}
                        placeholder='{ "full_name": "John Doe", "position": "Captain" }'
                        className="font-mono text-xs min-h-[100px]"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Response Panel */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      Response
                    </span>
                    {sandboxResult && (
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={sandboxResult.status < 300 
                            ? "text-emerald-600 border-emerald-500/30" 
                            : "text-red-600 border-red-500/30"
                          }
                        >
                          {sandboxResult.status < 300 ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {sandboxResult.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {sandboxResult.time}ms
                        </Badge>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sandboxLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                  {!sandboxLoading && sandboxResult && (
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 z-10"
                        onClick={() => copyToClipboard(JSON.stringify(sandboxResult.data, null, 2))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <ScrollArea className="max-h-[400px]">
                        <pre className="bg-muted/50 p-3 rounded-lg border text-xs font-mono text-foreground whitespace-pre-wrap">
                          {JSON.stringify(sandboxResult.data, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                  {!sandboxLoading && !sandboxResult && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Play className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Selecione um endpoint e clique em <strong>Run</strong></p>
                      <p className="text-xs mt-1">Endpoints públicos (/v1/status, /v1/docs) não requerem API key</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* cURL generator */}
            {sandboxResult && (
              <Card className="border-muted">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium">cURL equivalente:</p>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(
                      `curl -X ${sandboxMethod} "https://api.nauti-one.com${sandboxPath}" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"${sandboxBody ? ` \\\n  -d '${sandboxBody}'` : ''}`
                    )}>
                      <Copy className="h-3 w-3 mr-1" /> Copiar
                    </Button>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground block mt-1">
                    curl -X {sandboxMethod} "https://api.nauti-one.com{sandboxPath}" -H "Authorization: Bearer YOUR_API_KEY"
                  </code>
                </CardContent>
              </Card>
            )}
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
                    <p className="text-muted-foreground"># Headers obrigatórios</p>
                    <p className="text-foreground">Authorization: Bearer {"<api_key>"}</p>
                    <p className="text-foreground">Content-Type: application/json</p>
                    <p className="text-muted-foreground mt-2"># Opcional — multi-tenant</p>
                    <p className="text-foreground">X-Tenant-ID: {"<your_org_id>"}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg text-xs space-y-2">
                    <p className="font-medium text-foreground">Rate Limiting</p>
                    <p className="text-muted-foreground">Headers de resposta incluem:</p>
                    <div className="font-mono space-y-0.5 text-muted-foreground">
                      <p>X-RateLimit-Limit: 1000</p>
                      <p>X-RateLimit-Remaining: 999</p>
                      <p>X-RateLimit-Reset: 1708905600</p>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => toast.info("Acesse Configurações → API Keys para gerar uma chave")}>
                    <Key className="h-4 w-4 mr-2" />Gerar Nova API Key
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Scopes Disponíveis</CardTitle>
                  <CardDescription>Permissões granulares por recurso — RBAC</CardDescription>
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

          {/* SDKs with code examples */}
          <TabsContent value="sdks">
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {SDKS.map(sdk => (
                  <Button 
                    key={sdk.language} 
                    variant={selectedSdkLang === sdk.language ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedSdkLang(sdk.language)}
                  >
                    {sdk.language}
                  </Button>
                ))}
              </div>
              {SDKS.filter(s => s.language === selectedSdkLang).map(sdk => (
                <div key={sdk.language} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Instalação
                      </CardTitle>
                      <CardDescription>Pacote: <code className="font-mono">{sdk.package}</code> v{sdk.version}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 p-3 rounded-lg flex items-center justify-between">
                        <code className="font-mono text-sm text-foreground">{sdk.install}</code>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(sdk.install)}><Copy className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Exemplo de Uso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(sdk.example)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <pre className="bg-muted/30 p-3 rounded-lg font-mono text-xs text-foreground whitespace-pre-wrap overflow-x-auto">
                          {sdk.example}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Changelog */}
          <TabsContent value="changelog">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Changelog</CardTitle>
                <CardDescription>Histórico de versões da API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {CHANGELOG.map(entry => (
                    <div key={entry.version} className="relative pl-6 border-l-2 border-primary/30">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-primary border-primary font-mono">v{entry.version}</Badge>
                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                      </div>
                      <ul className="space-y-1">
                        {entry.changes.map((change, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
