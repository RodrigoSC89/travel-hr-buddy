/**
 * APIDocsPage - Public API Documentation & Webhook Management
 * Phase 4: Global Scale - APIs públicas e webhooks
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Globe, Code, Webhook, Key, Copy, CheckCircle, 
  ArrowRight, Lock, Zap, BookOpen, Terminal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const endpoints = [
  { method: "GET", path: "/api/v1/vessels", desc: "Listar embarcações", auth: true, rate: "100/min" },
  { method: "GET", path: "/api/v1/vessels/:id", desc: "Detalhes da embarcação", auth: true, rate: "100/min" },
  { method: "GET", path: "/api/v1/crew", desc: "Listar tripulantes", auth: true, rate: "100/min" },
  { method: "GET", path: "/api/v1/crew/:id", desc: "Detalhes do tripulante", auth: true, rate: "100/min" },
  { method: "POST", path: "/api/v1/crew", desc: "Criar tripulante", auth: true, rate: "50/min" },
  { method: "GET", path: "/api/v1/voyages", desc: "Listar viagens", auth: true, rate: "100/min" },
  { method: "GET", path: "/api/v1/certificates", desc: "Listar certificados", auth: true, rate: "100/min" },
  { method: "GET", path: "/api/v1/compliance/score", desc: "Score de compliance", auth: true, rate: "30/min" },
  { method: "POST", path: "/api/v1/documents/upload", desc: "Upload de documento", auth: true, rate: "20/min" },
  { method: "GET", path: "/api/v1/analytics/kpis", desc: "KPIs operacionais", auth: true, rate: "30/min" },
  { method: "POST", path: "/api/v1/webhooks", desc: "Registrar webhook", auth: true, rate: "10/min" },
  { method: "GET", path: "/api/v1/webhooks", desc: "Listar webhooks", auth: true, rate: "30/min" },
];

const webhookEvents = [
  { event: "vessel.position.updated", desc: "Posição AIS atualizada" },
  { event: "crew.certificate.expiring", desc: "Certificado próximo do vencimento" },
  { event: "maintenance.work_order.created", desc: "Nova ordem de serviço" },
  { event: "compliance.audit.completed", desc: "Auditoria finalizada" },
  { event: "voyage.status.changed", desc: "Status da viagem alterado" },
  { event: "incident.reported", desc: "Incidente reportado" },
  { event: "ai.decision.made", desc: "Decisão autônoma da IA" },
  { event: "document.ocr.completed", desc: "OCR de documento concluído" },
];

const codeExamples = {
  curl: `curl -X GET https://api.nautione.com/v1/vessels \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  node: `const response = await fetch('https://api.nautione.com/v1/vessels', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const vessels = await response.json();`,
  python: `import requests

response = requests.get(
    'https://api.nautione.com/v1/vessels',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
vessels = response.json()`,
  webhook: `// Webhook payload example
{
  "event": "crew.certificate.expiring",
  "timestamp": "2026-02-19T10:30:00Z",
  "data": {
    "crew_id": "uuid",
    "certificate_type": "STCW",
    "expires_at": "2026-03-19",
    "days_remaining": 28
  }
}`,
};

const APIDocsPage = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    toast.success("Código copiado!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const methodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-[hsl(142,76%,36%)]/10 text-[hsl(142,76%,36%)]";
      case "POST": return "bg-[hsl(214,84%,46%)]/10 text-[hsl(214,84%,46%)]";
      case "PUT": return "bg-[hsl(45,100%,51%)]/10 text-[hsl(45,100%,51%)]";
      case "DELETE": return "bg-[hsl(4,90%,45%)]/10 text-[hsl(4,90%,45%)]";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            API & Webhooks
          </h1>
          <p className="text-muted-foreground mt-1">Documentação da API REST e configuração de webhooks</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">v1.0</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Endpoints", value: endpoints.length, icon: Code },
          { label: "Webhook Events", value: webhookEvents.length, icon: Webhook },
          { label: "Rate Limit", value: "100/min", icon: Zap },
          { label: "Auth", value: "Bearer Token", icon: Lock },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints"><Code className="w-4 h-4 mr-1" /> Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="w-4 h-4 mr-1" /> Webhooks</TabsTrigger>
          <TabsTrigger value="examples"><Terminal className="w-4 h-4 mr-1" /> Exemplos</TabsTrigger>
          <TabsTrigger value="auth"><Key className="w-4 h-4 mr-1" /> Autenticação</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader><CardTitle>API Endpoints</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {endpoints.map(ep => (
                  <div key={ep.path + ep.method} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <Badge className={`${methodColor(ep.method)} font-mono text-xs w-16 justify-center`}>{ep.method}</Badge>
                    <code className="text-sm font-mono text-foreground flex-1">{ep.path}</code>
                    <span className="text-sm text-muted-foreground hidden md:block">{ep.desc}</span>
                    <Badge variant="outline" className="text-xs">{ep.rate}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader><CardTitle>Webhook Events</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {webhookEvents.map(wh => (
                  <div key={wh.event} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                    <Webhook className="w-4 h-4 text-primary shrink-0" />
                    <code className="text-sm font-mono text-foreground">{wh.event}</code>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">{wh.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <div className="space-y-4">
            {Object.entries(codeExamples).map(([lang, code]) => (
              <Card key={lang}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm uppercase">{lang}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => copyCode(code, lang)}>
                      {copiedCode === lang ? <CheckCircle className="w-4 h-4 text-[hsl(142,76%,36%)]" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted/50 rounded-lg p-4 text-sm font-mono overflow-x-auto text-foreground">
                    <code>{code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader><CardTitle>Autenticação</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" /> Bearer Token
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Todas as requisições devem incluir o header de autorização com seu API key.
                </p>
                <pre className="bg-muted/50 rounded p-3 text-sm font-mono text-foreground">
                  Authorization: Bearer sk_live_your_api_key_here
                </pre>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">
                  Requisições são limitadas por endpoint. Respostas 429 incluem o header <code className="bg-muted px-1 rounded">X-RateLimit-Reset</code> 
                  indicando quando o limite será resetado.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">Multi-tenant</h3>
                <p className="text-sm text-muted-foreground">
                  Cada API key está vinculada a uma organização. Todos os dados retornados são automaticamente 
                  filtrados pelo tenant da chave, garantindo isolamento total de dados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIDocsPage;
