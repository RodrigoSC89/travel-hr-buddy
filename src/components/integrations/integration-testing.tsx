import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Play,
  Settings,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code,
  Network,
  Zap,
  Download,
  Copy
} from "lucide-react";

interface TestResult {
  id: string;
  name: string;
  status: "success" | "error" | "warning";
  duration: number;
  details: string;
  response?: any;
  timestamp: string;
}

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
}

export const IntegrationTesting: React.FC = () => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [selectedEndpoint, setSelectedEndpoint] = useState("supabase-db");
  
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      id: "1",
      name: "Conexão com Database",
      status: "success",
      duration: 124,
      details: "Conexão estabelecida com sucesso. Latência baixa.",
      response: { status: 200, data: "Connected successfully" },
      timestamp: "2024-01-20 15:30:25"
    },
    {
      id: "2",
      name: "Autenticação OAuth",
      status: "error",
      duration: 5240,
      details: "Falha na autenticação. Token expirado.",
      response: { status: 401, error: "Unauthorized" },
      timestamp: "2024-01-20 15:30:30"
    },
    {
      id: "3",
      name: "Webhook WhatsApp",
      status: "warning",
      duration: 890,
      details: "Conexão lenta. Verificar rate limits.",
      response: { status: 200, warning: "Rate limit approaching" },
      timestamp: "2024-01-20 15:30:35"
    }
  ]);

  const [loadTestResults] = useState<LoadTestResult>({
    totalRequests: 1000,
    successfulRequests: 950,
    failedRequests: 50,
    averageResponseTime: 245,
    minResponseTime: 89,
    maxResponseTime: 1240,
    requestsPerSecond: 45.2
  });

  const endpoints = [
    { id: "supabase-db", name: "Supabase Database", url: "https://api.supabase.io/rest/v1/" },
    { id: "whatsapp-api", name: "WhatsApp Business API", url: "https://graph.facebook.com/v18.0/" },
    { id: "google-calendar", name: "Google Calendar API", url: "https://www.googleapis.com/calendar/v3/" },
    { id: "slack-webhook", name: "Slack Webhook", url: "https://hooks.slack.com/services/" }
  ];

  const runSingleTest = async () => {
    setIsRunningTest(true);
    setTestProgress(0);
    
    // Simular teste com progresso
    for (let i = 0; i <= 100; i += 10) {
      setTestProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Simular resultado
    const newResult: TestResult = {
      id: Date.now().toString(),
      name: `Teste ${endpoints.find(e => e.id === selectedEndpoint)?.name}`,
      status: Math.random() > 0.3 ? "success" : Math.random() > 0.5 ? "warning" : "error",
      duration: Math.floor(Math.random() * 1000) + 100,
      details: "Teste executado com sucesso",
      response: { status: 200, data: "Test completed" },
      timestamp: new Date().toLocaleString("pt-BR")
    };
    
    setTestResults(prev => [newResult, ...prev]);
    setIsRunningTest(false);
    setTestProgress(0);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
    case "success": return <CheckCircle className="w-4 h-4 text-success" />;
    case "error": return <XCircle className="w-4 h-4 text-destructive" />;
    case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
    case "success": return "bg-success/20 text-success border-success/30";
    case "error": return "bg-destructive/20 text-destructive border-destructive/30";
    case "warning": return "bg-warning/20 text-warning border-warning/30";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
                Centro de Testes de Integração
              </CardTitle>
              <CardDescription>
                Teste, valide e monitore a performance de suas integrações
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="single-test" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="single-test">Teste Único</TabsTrigger>
          <TabsTrigger value="load-test">Teste de Carga</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        {/* Teste Único */}
        <TabsContent value="single-test" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="w-5 h-5 text-primary" />
                  Configuração do Teste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Endpoint para Teste
                  </label>
                  <select 
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    {endpoints.map(endpoint => (
                      <option key={endpoint.id} value={endpoint.id}>
                        {endpoint.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    URL do Endpoint
                  </label>
                  <Input 
                    value={endpoints.find(e => e.id === selectedEndpoint)?.url || ""}
                    placeholder="https://api.exemplo.com/v1/"
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Headers (JSON)
                  </label>
                  <Textarea 
                    placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                    className="font-mono text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Payload (JSON)
                  </label>
                  <Textarea 
                    placeholder='{"test": true, "timestamp": "2024-01-20T15:30:00Z"}'
                    className="font-mono text-sm"
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={runSingleTest}
                  disabled={isRunningTest}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isRunningTest ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Executando Teste...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Executar Teste
                    </>
                  )}
                </Button>

                {isRunningTest && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">Progresso</span>
                      <span className="text-muted-foreground">{testProgress}%</span>
                    </div>
                    <Progress value={testProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-primary" />
                  Testes Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="justify-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-success" />
                    Teste de Conectividade
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Network className="w-4 h-4 mr-2 text-primary" />
                    Validar Autenticação
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Zap className="w-4 h-4 mr-2 text-warning" />
                    Teste de Performance
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Code className="w-4 h-4 mr-2 text-accent" />
                    Validar Payload
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Dicas de Teste</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sempre teste em ambiente de desenvolvimento primeiro</li>
                    <li>• Verifique tokens antes de executar testes</li>
                    <li>• Use payloads pequenos para testes rápidos</li>
                    <li>• Monitore rate limits durante os testes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Teste de Carga */}
        <TabsContent value="load-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-primary" />
                Teste de Carga e Performance
              </CardTitle>
              <CardDescription>
                Simule múltiplas requisições para testar a capacidade da integração
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Requisições</p>
                  <p className="text-2xl font-bold text-foreground">{loadTestResults.totalRequests.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Sucessos</p>
                  <p className="text-2xl font-bold text-success">{loadTestResults.successfulRequests.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Falhas</p>
                  <p className="text-2xl font-bold text-destructive">{loadTestResults.failedRequests.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Req/segundo</p>
                  <p className="text-2xl font-bold text-primary">{loadTestResults.requestsPerSecond}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tempo Médio</p>
                  <p className="text-lg font-medium text-foreground">{loadTestResults.averageResponseTime}ms</p>
                  <Progress value={60} className="h-2 mt-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tempo Mínimo</p>
                  <p className="text-lg font-medium text-success">{loadTestResults.minResponseTime}ms</p>
                  <Progress value={20} className="h-2 mt-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tempo Máximo</p>
                  <p className="text-lg font-medium text-destructive">{loadTestResults.maxResponseTime}ms</p>
                  <Progress value={90} className="h-2 mt-1" />
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-primary hover:bg-primary/90">
                  <Zap className="w-4 h-4 mr-2" />
                  Executar Teste de Carga
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resultados */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-primary" />
                Histórico de Testes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.id} className="p-4 border border-border/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium text-foreground">{result.name}</h4>
                          <p className="text-sm text-muted-foreground">{result.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status === "success" ? "Sucesso" : 
                            result.status === "error" ? "Erro" : "Aviso"}
                        </Badge>
                        <Badge variant="outline">
                          {result.duration}ms
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{result.details}</p>
                    
                    {result.response && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-foreground">Resposta:</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(JSON.stringify(result.response, null, 2))}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <pre className="text-xs text-muted-foreground font-mono overflow-x-auto">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoramento */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Network className="w-5 h-5 text-primary" />
                  Status em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{endpoint.name}</p>
                        <p className="text-xs text-muted-foreground">{endpoint.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-sm text-success">Online</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="w-5 h-5 text-primary" />
                  Monitoramento Automático
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Testes automáticos a cada:</span>
                    <Badge variant="outline">5 minutos</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Próximo teste em:</span>
                    <Badge variant="outline">2min 34s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Alertas por email:</span>
                    <Badge className="bg-success/20 text-success border-success/30">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Relatórios semanais:</span>
                    <Badge className="bg-success/20 text-success border-success/30">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};