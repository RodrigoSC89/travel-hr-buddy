/**
 * API Documentation Component - PHASE 2
 * Documentação interativa da API pública do Nautilus One
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Book, 
  Code, 
  Copy, 
  ChevronDown,
  ChevronRight,
  Ship,
  Award,
  Users,
  ClipboardCheck,
  Activity,
  Globe,
  Lock,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  rateLimit: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  requestBody?: {
    type: string;
    example: object;
  };
  response: {
    status: number;
    example: object;
  };
}

const endpoints: Record<string, Endpoint[]> = {
  vessels: [
    {
      method: "GET",
      path: "/api/v1/vessels",
      description: "Lista todas as embarcações registradas na organização",
      auth: true,
      rateLimit: "60 req/min",
      parameters: [
        { name: "limit", type: "number", required: false, description: "Número máximo de resultados (default: 50)" },
        { name: "offset", type: "number", required: false, description: "Offset para paginação" },
        { name: "status", type: "string", required: false, description: "Filtrar por status (active, inactive, maintenance)" }
      ],
      response: {
        status: 200,
        example: {
          data: [
            {
              id: "uuid",
              name: "MV Nautilus",
              type: "PSV",
              imo_number: "1234567",
              flag: "BR",
              status: "active"
            }
          ],
          meta: { total: 1, limit: 50 }
        }
      }
    }
  ],
  certificates: [
    {
      method: "GET",
      path: "/api/v1/certificates",
      description: "Lista todos os certificados da tripulação",
      auth: true,
      rateLimit: "60 req/min",
      parameters: [
        { name: "employee_id", type: "uuid", required: false, description: "Filtrar por tripulante" },
        { name: "status", type: "string", required: false, description: "Filtrar por status (active, expired, pending)" }
      ],
      response: {
        status: 200,
        example: {
          data: [
            {
              id: "uuid",
              certificate_type: "BOSIET",
              certificate_number: "CERT-001",
              issue_date: "2024-01-15",
              expiry_date: "2025-01-15",
              status: "active"
            }
          ],
          meta: { total: 1, limit: 100 }
        }
      }
    },
    {
      method: "POST",
      path: "/api/v1/certificates",
      description: "Cria um novo certificado",
      auth: true,
      rateLimit: "30 req/min",
      requestBody: {
        type: "application/json",
        example: {
          certificate_type: "BOSIET",
          certificate_number: "CERT-002",
          issue_date: "2024-06-01",
          expiry_date: "2026-06-01",
          issuing_authority: "DNV GL",
          employee_id: "uuid"
        }
      },
      response: {
        status: 201,
        example: {
          data: { id: "uuid", message: "Certificate created successfully" }
        }
      }
    }
  ],
  analytics: [
    {
      method: "GET",
      path: "/api/v1/analytics/crew",
      description: "Retorna analytics agregados da tripulação",
      auth: true,
      rateLimit: "30 req/min",
      response: {
        status: 200,
        example: {
          data: {
            total_crew: 45,
            by_status: { active: 40, on_leave: 5 },
            avg_experience: 8.5,
            by_position: { Captain: 2, Chief_Engineer: 2 }
          }
        }
      }
    }
  ],
  peotram: [
    {
      method: "GET",
      path: "/api/v1/peotram/reports",
      description: "Lista relatórios de auditoria PEOTRAM",
      auth: true,
      rateLimit: "30 req/min",
      response: {
        status: 200,
        example: {
          data: [
            {
              id: "uuid",
              audit_type: "PSC",
              status: "completed",
              overall_score: 92.5,
              non_conformities_count: 2
            }
          ]
        }
      }
    }
  ],
  status: [
    {
      method: "GET",
      path: "/api/v1/status",
      description: "Verifica o status da API",
      auth: true,
      rateLimit: "120 req/min",
      response: {
        status: 200,
        example: {
          status: "healthy",
          version: "1.0.0",
          timestamp: "2024-06-01T12:00:00Z"
        }
      }
    }
  ]
};

const categoryIcons: Record<string, React.ReactNode> = {
  vessels: <Ship className="h-5 w-5" />,
  certificates: <Award className="h-5 w-5" />,
  analytics: <Activity className="h-5 w-5" />,
  peotram: <ClipboardCheck className="h-5 w-5" />,
  status: <Globe className="h-5 w-5" />
};

export const ApiDocumentation: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["vessels"]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "POST": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "PUT": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "DELETE": return "bg-red-500/10 text-red-600 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const generateCurlExample = (endpoint: Endpoint) => {
    const baseUrl = "https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/public-api";
    let curl = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "x-api-key: naut_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;
    
    if (endpoint.requestBody) {
      curl += ` \\
  -d '${JSON.stringify(endpoint.requestBody.example, null, 2)}'`;
    }
    
    return curl;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar - Endpoints List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Endpoints
          </CardTitle>
          <CardDescription>
            API REST v1.0
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {Object.entries(endpoints).map(([category, categoryEndpoints]) => (
                <Collapsible
                  key={category}
                  open={expandedCategories.includes(category)}
                  onOpenChange={() => toggleCategory(category)}
                >
                  <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted transition-colors">
                    {expandedCategories.includes(category) 
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                    }
                    {categoryIcons[category]}
                    <span className="font-medium capitalize">{category}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {categoryEndpoints.length}
                    </Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-8 space-y-1 mt-1">
                    {categoryEndpoints.map((endpoint, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedEndpoint(endpoint)}
                        className={`w-full text-left p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2 ${
                          selectedEndpoint?.path === endpoint.path ? 'bg-primary/10' : ''
                        }`}
                      >
                        <Badge className={`text-xs ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </Badge>
                        <span className="text-sm font-mono truncate">{endpoint.path}</span>
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content - Endpoint Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Documentação do Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEndpoint ? (
            <div className="space-y-6">
              {/* Endpoint Header */}
              <div className="flex items-center gap-3">
                <Badge className={`text-sm ${getMethodColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </Badge>
                <code className="text-lg font-mono">{selectedEndpoint.path}</code>
              </div>
              
              <p className="text-muted-foreground">{selectedEndpoint.description}</p>
              
              {/* Meta Info */}
              <div className="flex gap-4">
                {selectedEndpoint.auth && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Requer Autenticação
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  {selectedEndpoint.rateLimit}
                </Badge>
              </div>

              <Tabs defaultValue="request" className="w-full">
                <TabsList>
                  <TabsTrigger value="request">Requisição</TabsTrigger>
                  <TabsTrigger value="response">Resposta</TabsTrigger>
                  <TabsTrigger value="example">Exemplo cURL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="request" className="space-y-4">
                  {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Parâmetros de Query</h4>
                      <div className="border rounded-lg divide-y">
                        {selectedEndpoint.parameters.map((param, idx) => (
                          <div key={idx} className="p-3 flex items-start justify-between">
                            <div>
                              <code className="text-sm font-mono">{param.name}</code>
                              <Badge variant="secondary" className="ml-2 text-xs">{param.type}</Badge>
                              {param.required && <Badge variant="destructive" className="ml-2 text-xs">required</Badge>}
                              <p className="text-sm text-muted-foreground mt-1">{param.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEndpoint.requestBody && (
                    <div>
                      <h4 className="font-medium mb-2">Request Body</h4>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{JSON.stringify(selectedEndpoint.requestBody.example, null, 2)}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => copyCode(JSON.stringify(selectedEndpoint.requestBody?.example, null, 2))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="response">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Resposta</h4>
                      <Badge variant="outline">{selectedEndpoint.response.status}</Badge>
                    </div>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{JSON.stringify(selectedEndpoint.response.example, null, 2)}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(JSON.stringify(selectedEndpoint.response.example, null, 2))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="example">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{generateCurlExample(selectedEndpoint)}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(generateCurlExample(selectedEndpoint))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Selecione um endpoint para ver a documentação
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocumentation;
