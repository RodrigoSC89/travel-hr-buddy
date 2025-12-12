/**
 * Security Monitoring - Monitoramento de Segurança com IA
 */

import { useCallback, useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
  Lock,
  Unlock,
  Send,
  Bot,
  RefreshCw,
  FileWarning,
  Users,
  Ship,
  Loader2
} from "lucide-react";

interface SecurityAlert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: Date;
  status: "open" | "investigating" | "resolved";
  source: string;
}

const mockAlerts: SecurityAlert[] = [
  {
    id: "1",
    type: "warning",
    title: "Tentativa de acesso não autorizado",
    description: "Múltiplas tentativas de login falhadas detectadas do IP 192.168.1.100",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: "investigating",
    source: "Sistema de Autenticação"
  },
  {
    id: "2",
    type: "info",
    title: "Atualização de certificado SSL",
    description: "Certificado SSL renovado com sucesso para o domínio principal",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "resolved",
    source: "Infraestrutura"
  },
  {
    id: "3",
    type: "critical",
    title: "Anomalia de tráfego detectada",
    description: "Aumento incomum de requisições detectado no endpoint /api/vessels",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: "open",
    source: "Firewall"
  }
];

const securityMetrics = [
  { label: "Ameaças Bloqueadas", value: 1247, icon: Shield, trend: "+12%" },
  { label: "Incidentes Ativos", value: 3, icon: AlertTriangle, trend: "-25%" },
  { label: "Conformidade", value: 98, icon: CheckCircle2, trend: "+2%" },
  { label: "Usuários Monitorados", value: 156, icon: Users, trend: "+8%" }
];

export default function SecurityMonitoring() {
  const [alerts] = useState<SecurityAlert[]>(mockAlerts);
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeWithAI = useCallback(async () => {
    if (!query.trim()) {
      toast({
        title: "Consulta vazia",
        description: "Digite uma pergunta sobre segurança para análise.",
        variant: "destructive"
      };
      return;
    }

    setIsAnalyzing(true);
    setAiResponse(null);

    try {
      const systemContext = `Você é um especialista em segurança marítima e cibersegurança. 
Analise questões de segurança com base nos seguintes alertas ativos:
${alerts.map(a => `- [${a.type.toUpperCase()}] ${a.title}: ${a.description}`).join("\n")}

Métricas atuais:
- Ameaças bloqueadas: 1247
- Incidentes ativos: 3
- Conformidade: 98%
- Usuários monitorados: 156

Forneça análises detalhadas e recomendações de segurança.`;

      const { data, error } = await supabase.functions.invoke("optimization-ai-copilot", {
        body: {
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: query }
          ]
        }
      });

      if (error) throw error;

      setAiResponse(data.response || data.content || "Análise concluída.");
      toast({
        title: "Análise concluída",
        description: "A IA analisou sua consulta de segurança."
      });
    } catch (err) {
      console.error("Erro na análise:", err);
      toast({
        title: "Erro na análise",
        description: "Não foi possível processar a análise de segurança.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [query, alerts, toast]);

  const getAlertIcon = (type: SecurityAlert["type"]) => {
    switch (type) {
    case "critical":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusBadge = (status: SecurityAlert["status"]) => {
    switch (status) {
    case "open":
      return <Badge variant="destructive">Aberto</Badge>;
    case "investigating":
      return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Investigando</Badge>;
    default:
      return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Resolvido</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Monitoramento de Segurança
          </h1>
          <p className="text-muted-foreground">
            Análise e detecção de ameaças com IA
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map((metric, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">
                    {metric.label === "Conformidade" ? `${metric.value}%` : metric.value}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Badge variant="outline" className="mt-2 text-xs">
                {metric.trend}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="ai-analysis">
            <Bot className="h-4 w-4 mr-2" />
            Análise IA
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Conformidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Segurança</CardTitle>
              <CardDescription>
                Monitore e gerencie alertas de segurança em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alert.title}</h4>
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Fonte: {alert.source}</span>
                          <span>
                            {alert.timestamp.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Análise de Segurança com IA
              </CardTitle>
              <CardDescription>
                Faça perguntas sobre segurança para obter análises inteligentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Quais são os principais riscos de segurança atuais?"
                  value={query}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && analyzeWithAI()}
                  disabled={isAnalyzing}
                />
                <Button onClick={analyzeWithAI} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {aiResponse && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Bot className="h-5 w-5 text-primary mt-1" />
                      <div className="prose prose-sm dark:prose-invert">
                        <p className="whitespace-pre-wrap">{aiResponse}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleSetQuery}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Analisar alertas críticos
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleSetQuery}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Recomendações de segurança
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleSetQuery}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verificar conformidade
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status de Conformidade</CardTitle>
              <CardDescription>
                Verificação de conformidade com regulamentações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: "ISPS Code", progress: 100, status: "compliant" },
                { name: "ISM Code", progress: 95, status: "compliant" },
                { name: "SOLAS", progress: 98, status: "compliant" },
                { name: "MARPOL", progress: 92, status: "partial" },
                { name: "Cybersecurity Guidelines", progress: 88, status: "partial" }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <Badge
                      className={
                        item.status === "compliant"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }
                    >
                      {item.status === "compliant" ? "Conforme" : "Parcial"}
                    </Badge>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {item.progress}%
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
