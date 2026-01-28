/**
 * API Documentation Page
 * Interactive OpenAPI documentation for the Nauti One API
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Code, Copy, ExternalLink, Key, Search, Ship, Users, FileText, Wrench, Webhook } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/api-v1";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  scope: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: Record<string, unknown>;
  responseExample: Record<string, unknown>;
}

const ENDPOINTS: Record<string, Endpoint[]> = {
  vessels: [
    {
      method: "GET",
      path: "/vessels",
      description: "Lista todas as embarcações da organização",
      scope: "read:vessels",
      parameters: [
        { name: "limit", type: "integer", required: false, description: "Número máximo de resultados (default: 50)" },
        { name: "offset", type: "integer", required: false, description: "Pular N resultados para paginação" },
        { name: "status", type: "string", required: false, description: "Filtrar por status (active, inactive, maintenance)" },
      ],
      responseExample: {
        data: [
          { id: "uuid", name: "MV Nautilus", imo_number: "9876543", vessel_type: "cargo", status: "active" },
        ],
        meta: { total: 10, limit: 50, offset: 0 },
      },
    },
    {
      method: "GET",
      path: "/vessels/:id",
      description: "Retorna detalhes de uma embarcação específica",
      scope: "read:vessels",
      responseExample: {
        data: {
          id: "uuid",
          name: "MV Nautilus",
          imo_number: "9876543",
          vessel_type: "cargo",
          status: "active",
          vessel_parts: [],
          vessel_manuals: [],
          vessel_sensors: [],
        },
      },
    },
    {
      method: "POST",
      path: "/vessels",
      description: "Cria uma nova embarcação",
      scope: "write:vessels",
      requestBody: {
        name: "MV New Ship",
        imo_number: "1234567",
        vessel_type: "tanker",
      },
      responseExample: {
        data: { id: "uuid", name: "MV New Ship", imo_number: "1234567" },
      },
    },
    {
      method: "PUT",
      path: "/vessels/:id",
      description: "Atualiza uma embarcação existente",
      scope: "write:vessels",
      requestBody: {
        name: "MV Updated Ship",
        status: "maintenance",
      },
      responseExample: {
        data: { id: "uuid", name: "MV Updated Ship", status: "maintenance" },
      },
    },
    {
      method: "DELETE",
      path: "/vessels/:id",
      description: "Remove uma embarcação",
      scope: "delete:vessels",
      responseExample: {},
    },
  ],
  crew: [
    {
      method: "GET",
      path: "/crew",
      description: "Lista todos os tripulantes",
      scope: "read:crew",
      parameters: [
        { name: "limit", type: "integer", required: false, description: "Número máximo de resultados" },
        { name: "offset", type: "integer", required: false, description: "Pular N resultados" },
      ],
      responseExample: {
        data: [
          { id: "uuid", full_name: "João Silva", rank: "Capitão", status: "active" },
        ],
        meta: { total: 50, limit: 50, offset: 0 },
      },
    },
    {
      method: "GET",
      path: "/crew/:id",
      description: "Retorna detalhes de um tripulante",
      scope: "read:crew",
      responseExample: {
        data: {
          id: "uuid",
          full_name: "João Silva",
          rank: "Capitão",
          crew_certificates: [],
          crew_contracts: [],
        },
      },
    },
    {
      method: "POST",
      path: "/crew",
      description: "Adiciona um novo tripulante",
      scope: "write:crew",
      requestBody: {
        full_name: "Maria Santos",
        rank: "Primeiro Oficial",
        email: "maria@example.com",
      },
      responseExample: {
        data: { id: "uuid", full_name: "Maria Santos" },
      },
    },
  ],
  documents: [
    {
      method: "GET",
      path: "/documents",
      description: "Lista todos os documentos",
      scope: "read:documents",
      parameters: [
        { name: "category", type: "string", required: false, description: "Filtrar por categoria" },
      ],
      responseExample: {
        data: [
          { id: "uuid", title: "Certificado SOLAS", category: "certificate", expires_at: "2025-12-31" },
        ],
      },
    },
  ],
  maintenance: [
    {
      method: "GET",
      path: "/maintenance",
      description: "Lista tarefas de manutenção",
      scope: "read:maintenance",
      parameters: [
        { name: "vessel_id", type: "uuid", required: false, description: "Filtrar por embarcação" },
        { name: "status", type: "string", required: false, description: "Filtrar por status" },
      ],
      responseExample: {
        data: [
          { id: "uuid", title: "Inspeção de casco", vessel_id: "uuid", status: "pending", due_date: "2024-02-15" },
        ],
      },
    },
    {
      method: "POST",
      path: "/maintenance",
      description: "Cria uma nova tarefa de manutenção",
      scope: "write:maintenance",
      requestBody: {
        title: "Troca de óleo",
        vessel_id: "uuid",
        due_date: "2024-03-01",
        priority: "medium",
      },
      responseExample: {
        data: { id: "uuid", title: "Troca de óleo" },
      },
    },
  ],
};

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-500",
  POST: "bg-green-500",
  PUT: "bg-yellow-500",
  DELETE: "bg-red-500",
};

export default function APIDocs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  const generateCurlExample = (endpoint: Endpoint): string => {
    let curl = `curl -X ${endpoint.method} \\\n  "${API_BASE_URL}${endpoint.path}" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`;
    
    if (endpoint.requestBody) {
      curl += ` \\\n  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'`;
    }
    
    return curl;
  };

  const generateJSExample = (endpoint: Endpoint): string => {
    const hasBody = endpoint.method === "POST" || endpoint.method === "PUT";
    
    return `const response = await fetch("${API_BASE_URL}${endpoint.path}", {
  method: "${endpoint.method}",
  headers: {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },${hasBody ? `
  body: JSON.stringify(${JSON.stringify(endpoint.requestBody, null, 4)}),` : ""}
});

const data = await response.json();
console.log(data);`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            Documentação da API
          </h1>
          <p className="text-muted-foreground">
            API REST v1.0 • Base URL: <code className="bg-muted px-2 py-1 rounded">{API_BASE_URL}</code>
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Ship, label: "Vessels", count: ENDPOINTS.vessels.length },
          { icon: Users, label: "Crew", count: ENDPOINTS.crew.length },
          { icon: FileText, label: "Documents", count: ENDPOINTS.documents.length },
          { icon: Wrench, label: "Maintenance", count: ENDPOINTS.maintenance.length },
          { icon: Key, label: "API Keys", href: "/admin/api-keys" },
        ].map((item, i) => (
          <Card key={i} className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="pt-6 flex items-center gap-3">
              <item.icon className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">{item.label}</p>
                {"count" in item && (
                  <p className="text-sm text-muted-foreground">{item.count} endpoints</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(ENDPOINTS).map(([category, endpoints]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="capitalize">
                      {category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {endpoints
                          .filter(
                            (e) =>
                              e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              e.description.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((endpoint, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedEndpoint === endpoint
                                  ? "bg-primary/10 border border-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => setSelectedEndpoint(endpoint)}
                            >
                              <Badge className={`${METHOD_COLORS[endpoint.method]} text-white text-xs`}>
                                {endpoint.method}
                              </Badge>
                              <span className="text-sm font-mono truncate">{endpoint.path}</span>
                            </div>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Endpoint Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedEndpoint ? (
                <div className="flex items-center gap-2">
                  <Badge className={`${METHOD_COLORS[selectedEndpoint.method]} text-white`}>
                    {selectedEndpoint.method}
                  </Badge>
                  <code>{selectedEndpoint.path}</code>
                </div>
              ) : (
                "Selecione um endpoint"
              )}
            </CardTitle>
            {selectedEndpoint && (
              <CardDescription>{selectedEndpoint.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!selectedEndpoint ? (
              <div className="text-center py-12 text-muted-foreground">
                Clique em um endpoint na lista para ver os detalhes
              </div>
            ) : (
              <Tabs defaultValue="info">
                <TabsList>
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  {/* Scope */}
                  <div>
                    <Label>Escopo Necessário</Label>
                    <Badge variant="outline" className="mt-1">
                      {selectedEndpoint.scope}
                    </Badge>
                  </div>

                  {/* Parameters */}
                  {selectedEndpoint.parameters && (
                    <div>
                      <Label>Parâmetros de Query</Label>
                      <div className="mt-2 border rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="p-2 text-left">Nome</th>
                              <th className="p-2 text-left">Tipo</th>
                              <th className="p-2 text-left">Obrigatório</th>
                              <th className="p-2 text-left">Descrição</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEndpoint.parameters.map((param) => (
                              <tr key={param.name} className="border-t">
                                <td className="p-2 font-mono">{param.name}</td>
                                <td className="p-2">{param.type}</td>
                                <td className="p-2">{param.required ? "Sim" : "Não"}</td>
                                <td className="p-2 text-muted-foreground">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Request Body */}
                  {selectedEndpoint.requestBody && (
                    <div>
                      <Label>Request Body</Label>
                      <pre className="mt-2 bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                        {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Response */}
                  <div>
                    <Label>Response Example</Label>
                    <pre className="mt-2 bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(selectedEndpoint.responseExample, null, 2)}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="curl">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      {generateCurlExample(selectedEndpoint)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateCurlExample(selectedEndpoint))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="javascript">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      {generateJSExample(selectedEndpoint)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateJSExample(selectedEndpoint))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Authentication Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Autenticação</CardTitle>
          <CardDescription>
            Todas as requisições devem incluir uma API Key válida
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Header de Autenticação</Label>
            <pre className="mt-2 bg-muted p-4 rounded-lg text-sm">
              X-API-Key: nk_live_xxxxxxxxxxxxxxxxxxxxx
            </pre>
          </div>
          
          <div>
            <Label>Ou via Authorization Bearer</Label>
            <pre className="mt-2 bg-muted p-4 rounded-lg text-sm">
              Authorization: Bearer nk_live_xxxxxxxxxxxxxxxxxxxxx
            </pre>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <a href="/admin/api-keys">
                <Key className="h-4 w-4 mr-2" />
                Gerenciar API Keys
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin/webhooks">
                <Webhook className="h-4 w-4 mr-2" />
                Configurar Webhooks
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
