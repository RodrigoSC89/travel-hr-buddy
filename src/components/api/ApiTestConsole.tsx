/**
 * API Test Console Component
 * Interactive console to test API endpoints with real requests
 */

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Zap,
  Code2,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ApiTestConsoleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEndpoint?: string;
  defaultMethod?: "GET" | "POST" | "PUT" | "DELETE";
}

interface TestResult {
  status: number;
  statusText: string;
  data: unknown;
  headers: Record<string, string>;
  duration: number;
  timestamp: Date;
}

const PRESET_ENDPOINTS = [
  { method: "GET", path: "/api/v1/vessels", label: "List Vessels" },
  { method: "GET", path: "/api/v1/crew", label: "List Crew" },
  { method: "GET", path: "/api/v1/certificates", label: "List Certificates" },
  { method: "GET", path: "/api/v1/status", label: "API Status" },
  { method: "GET", path: "/api/v1/analytics/crew", label: "Crew Analytics" },
  { method: "POST", path: "/api/v1/vessels", label: "Create Vessel" },
];

export function ApiTestConsole({
  open,
  onOpenChange,
  defaultEndpoint = "/api/v1/status",
  defaultMethod = "GET",
}: ApiTestConsoleProps) {
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">(defaultMethod);
  const [endpoint, setEndpoint] = useState(defaultEndpoint);
  const [apiKey, setApiKey] = useState("");
  const [requestBody, setRequestBody] = useState("{\n  \n}");
  const [headers, setHeaders] = useState("{\n  \"Content-Type\": \"application/json\"\n}");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);

  const getMethodColor = (m: string) => {
    switch (m) {
      case "GET": return "bg-success/10 text-success border-success/30";
      case "POST": return "bg-primary/10 text-primary border-primary/30";
      case "PUT": return "bg-warning/10 text-warning border-warning/30";
      case "DELETE": return "bg-danger/10 text-danger border-danger/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-success";
    if (status >= 400 && status < 500) return "text-warning";
    if (status >= 500) return "text-danger";
    return "text-muted-foreground";
  };

  const executeRequest = useCallback(async () => {
    if (!endpoint) {
      toast.error("Endpoint é obrigatório");
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Build the full URL
      const baseUrl = "https://vnbptmixvwropvanyhdb.supabase.co";
      const fullUrl = `${baseUrl}/functions/v1/public-api${endpoint}`;

      // Parse headers
      let parsedHeaders: Record<string, string> = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch {
        parsedHeaders = { "Content-Type": "application/json" };
      }

      // Add API key if provided
      if (apiKey) {
        parsedHeaders["x-api-key"] = apiKey;
      }

      // Add auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        parsedHeaders["Authorization"] = `Bearer ${session.access_token}`;
      }

      // Parse request body for POST/PUT
      let body: string | undefined;
      if (method !== "GET" && method !== "DELETE") {
        try {
          body = requestBody;
        } catch {
          toast.error("Request body inválido");
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(fullUrl, {
        method,
        headers: parsedHeaders,
        body,
      });

      const duration = Date.now() - startTime;
      
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      // Extract headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const testResult: TestResult = {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: responseHeaders,
        duration,
        timestamp: new Date(),
      };

      setResult(testResult);
      setHistory(prev => [testResult, ...prev.slice(0, 9)]);

      if (response.ok) {
        toast.success(`Request completed in ${duration}ms`);
      } else {
        toast.error(`Request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult: TestResult = {
        status: 0,
        statusText: error instanceof Error ? error.message : "Network Error",
        data: { error: "Failed to connect" },
        headers: {},
        duration,
        timestamp: new Date(),
      };
      setResult(errorResult);
      toast.error("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, method, apiKey, headers, requestBody]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const generateCurl = () => {
    const baseUrl = "https://vnbptmixvwropvanyhdb.supabase.co";
    let curl = `curl -X ${method} "${baseUrl}/functions/v1/public-api${endpoint}"`;
    
    if (apiKey) {
      curl += ` \\\n  -H "x-api-key: ${apiKey}"`;
    }
    curl += ` \\\n  -H "Content-Type: application/json"`;
    
    if (method !== "GET" && method !== "DELETE" && requestBody.trim() !== "{\n  \n}") {
      curl += ` \\\n  -d '${requestBody}'`;
    }
    
    return curl;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Console de Testes da API
          </DialogTitle>
          <DialogDescription>
            Teste endpoints da API Nautilus One em tempo real
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
          {/* Request Panel */}
          <div className="space-y-4 overflow-y-auto pr-2">
            {/* Method & Endpoint */}
            <div className="flex gap-2">
              <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
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
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/api/v1/..."
                className="flex-1 font-mono text-sm"
              />
              <Button onClick={executeRequest} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Enviar
              </Button>
            </div>

            {/* Preset Endpoints */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Endpoints Rápidos</Label>
              <div className="flex flex-wrap gap-1">
                {PRESET_ENDPOINTS.map((preset, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setMethod(preset.method as typeof method);
                      setEndpoint(preset.path);
                    }}
                  >
                    <Badge className={`mr-1 text-[10px] ${getMethodColor(preset.method)}`}>
                      {preset.method}
                    </Badge>
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="naut_xxxxxxxx..."
                className="font-mono text-sm"
              />
            </div>

            <Tabs defaultValue="body" className="flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>

              <TabsContent value="body" className="mt-2">
                <Textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="font-mono text-sm h-32 resize-none"
                  disabled={method === "GET" || method === "DELETE"}
                />
              </TabsContent>

              <TabsContent value="headers" className="mt-2">
                <Textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="font-mono text-sm h-32 resize-none"
                />
              </TabsContent>

              <TabsContent value="curl" className="mt-2">
                <div className="relative">
                  <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto h-32">
                    {generateCurl()}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => copyToClipboard(generateCurl())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* History */}
            {history.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Histórico</Label>
                <ScrollArea className="h-24">
                  <div className="space-y-1">
                    {history.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                        onClick={() => setResult(item)}
                      >
                        <span className={getStatusColor(item.status)}>{item.status}</span>
                        <span className="text-muted-foreground">{item.duration}ms</span>
                        <span className="text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Response Panel */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-muted px-4 py-2 flex items-center justify-between border-b">
              <span className="text-sm font-medium">Resposta</span>
              {result && (
                <div className="flex items-center gap-3 text-sm">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status} {result.statusText}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {result.duration}ms
                  </span>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              {result ? (
                <Tabs defaultValue="body" className="h-full">
                  <TabsList className="mx-4 mt-2">
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>

                  <TabsContent value="body" className="p-4">
                    <div className="relative">
                      <pre className="bg-background p-3 rounded-lg text-xs font-mono overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => copyToClipboard(JSON.stringify(result.data, null, 2))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="headers" className="p-4">
                    <pre className="bg-background p-3 rounded-lg text-xs font-mono">
                      {JSON.stringify(result.headers, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                  <Zap className="h-12 w-12 mb-4" />
                  <p>Execute uma requisição para ver a resposta</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ApiTestConsole;
