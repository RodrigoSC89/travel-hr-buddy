import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Send, 
  MessageSquare,
  Mail,
  Loader2,
  AlertTriangle,
  Settings,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IntegrationStatus {
  name: string;
  configured: boolean;
  status: "connected" | "disconnected" | "error";
  optional?: boolean;
}

interface TestResult {
  integration: string;
  success: boolean;
  timestamp: string;
  message?: string;
}

export function IntegrationStatusPanel() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-integrations-status");
      
      if (error) throw error;
      
      // Mark Slack/Discord as optional
      const updatedIntegrations = (data.integrations || []).map((i: IntegrationStatus) => ({
        ...i,
        optional: i.name === "Slack" || i.name === "Discord"
      }));
      
      setIntegrations(updatedIntegrations);
    } catch (err) {
      console.error("Failed to fetch integration status:", err);
      toast.error("Erro ao verificar status das integrações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const sendTestNotification = async (integration: string) => {
    setTesting(integration);
    try {
      const { data, error } = await supabase.functions.invoke("notify-slack", {
        body: {
          message: `🧪 Teste de integração ${integration} - ${new Date().toLocaleString("pt-BR")}`,
          severity: "info",
          title: `Teste de Conexão - ${integration}`,
          source: "Integration Status Panel",
          details: {
            testType: "manual",
            integration,
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      const success = data?.success || data?.results?.[integration.toLowerCase()];
      
      const result: TestResult = {
        integration,
        success: !!success,
        timestamp: new Date().toISOString(),
        message: success ? "Notificação enviada com sucesso!" : "Falha no envio",
      };

      setTestResults(prev => [result, ...prev.slice(0, 4)]);
      
      if (success) {
        toast.success(`Teste ${integration} enviado com sucesso!`);
      } else {
        toast.warning(`Teste ${integration}: verifique os logs`);
      }
    } catch (err) {
      console.error(`Test ${integration} failed:`, err);
      
      const result: TestResult = {
        integration,
        success: false,
        timestamp: new Date().toISOString(),
        message: err instanceof Error ? err.message : "Erro desconhecido",
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 4)]);
      toast.error(`Erro ao testar ${integration}`);
    } finally {
      setTesting(null);
    }
  };

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "slack":
        return <MessageSquare className="w-5 h-5" />;
      case "discord":
        return <MessageSquare className="w-5 h-5" />;
      case "email (resend)":
        return <Mail className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-success/20 text-success border-success/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        );
      case "disconnected":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            <XCircle className="w-3 h-3 mr-1" />
            Não Configurado
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Status das Integrações
            </CardTitle>
            <CardDescription>
              Verifique e teste suas conexões com serviços externos
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStatus}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Integration Status List */}
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div 
                  key={integration.name}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      integration.status === "connected" 
                        ? "bg-success/10 text-success" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {getIcon(integration.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{integration.name}</p>
                        {integration.optional && (
                          <Badge variant="outline" className="text-xs py-0">Opcional</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {integration.configured 
                          ? "Configurado" 
                          : integration.optional 
                            ? "Não configurado (opcional)" 
                            : "Não configurado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(integration.status)}
                    {integration.status === "connected" && integration.name !== "Email (Resend)" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendTestNotification(integration.name)}
                        disabled={testing === integration.name}
                      >
                        {testing === integration.name ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Testar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">Resultados dos Testes</h4>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div 
                        key={`${result.integration}-${result.timestamp}-${index}`}
                        className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                          result.success 
                            ? "bg-success/10 border border-success/20" 
                            : "bg-destructive/10 border border-destructive/20"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          <span>{result.integration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs">{result.message}</span>
                          <span className="text-xs">
                            {new Date(result.timestamp).toLocaleTimeString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Quick Actions */}
            <Separator />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  sendTestNotification("Slack");
                  sendTestNotification("Discord");
                }}
                disabled={testing !== null}
              >
                <Send className="w-4 h-4 mr-2" />
                Testar Todos
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
