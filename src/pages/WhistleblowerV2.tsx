/**
 * WhistleblowerV2 - Canal de Denúncias V2
 * Canal seguro com classificação IA
 */

import { useState } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Flag, Brain, Shield, Lock, AlertTriangle, CheckCircle, 
  Eye, Send, Sparkles, MessageSquare
} from "lucide-react";

interface Report {
  id: string;
  category: string;
  severity: string;
  submitted_at: string;
  status: string;
  anonymous: boolean;
}

const QUICK_QUESTIONS = [
  "O canal é realmente anônimo?",
  "Quais categorias de denúncia?",
  "Prazo de investigação?",
  "Proteção ao denunciante?",
  "Como acompanhar denúncia?",
  "Quem investiga?"
];

const EVIDENCE_FIELDS = [
  { name: "category", label: "Categoria", type: "select" as const, options: [
    { value: "fraud", label: "Fraude" },
    { value: "corruption", label: "Corrupção" },
    { value: "harassment", label: "Assédio" },
    { value: "safety", label: "Segurança" },
    { value: "environmental", label: "Ambiental" },
    { value: "other", label: "Outro" }
  ], required: true },
  { name: "observed_condition", label: "Descrição da Denúncia", type: "textarea" as const, required: true },
];

export default function WhistleblowerV2() {
  const [reports] = useState<Report[]>([
    { id: "WB-001", category: "safety", severity: "high", submitted_at: "2024-12-20", status: "investigating", anonymous: true },
    { id: "WB-002", category: "fraud", severity: "medium", submitted_at: "2024-12-15", status: "closed", anonymous: true },
    { id: "WB-003", category: "harassment", severity: "high", submitted_at: "2024-12-28", status: "new", anonymous: false },
  ]);

  const [newReport, setNewReport] = useState({ category: '', description: '' });

  const total = reports.length;
  const newReports = reports.filter(r => r.status === 'new').length;
  const investigating = reports.filter(r => r.status === 'investigating').length;
  const closed = reports.filter(r => r.status === 'closed').length;

  const stats = [
    { label: "Total Denúncias", value: total, icon: Flag, color: "blue" as const },
    { label: "Novas", value: newReports, icon: AlertTriangle, color: "red" as const },
    { label: "Em Investigação", value: investigating, icon: Eye, color: "orange" as const },
    { label: "Fechadas", value: closed, icon: CheckCircle, color: "green" as const },
  ];

  const columns = [
    { key: "id", label: "Protocolo" },
    { key: "category", label: "Categoria", render: (item: Report) => (
      <Badge variant="secondary">{item.category}</Badge>
    )},
    { key: "severity", label: "Severidade", render: (item: Report) => (
      <Badge variant={item.severity === 'high' ? 'destructive' : item.severity === 'medium' ? 'secondary' : 'outline'}>
        {item.severity === 'high' ? 'Alta' : item.severity === 'medium' ? 'Média' : 'Baixa'}
      </Badge>
    )},
    { key: "submitted_at", label: "Data", render: (item: Report) => new Date(item.submitted_at).toLocaleDateString('pt-BR') },
    { key: "anonymous", label: "Anônimo", render: (item: Report) => (
      <Badge variant="outline">{item.anonymous ? 'Sim' : 'Não'}</Badge>
    )},
    { key: "status", label: "Status", render: (item: Report) => (
      <Badge variant={item.status === 'closed' ? 'default' : item.status === 'investigating' ? 'secondary' : 'destructive'}>
        {item.status === 'closed' ? 'Fechado' : item.status === 'investigating' ? 'Investigando' : 'Novo'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={Flag}
      title="Canal de Denúncias V2"
      description="Canal seguro e confidencial com classificação IA"
      gradient="red"
      badges={[
        { icon: Brain, label: "IA Classificação" },
        { icon: Lock, label: "100% Confidencial" },
        { icon: Shield, label: "Proteção" },
        { icon: Sparkles, label: "Layout V2" }
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="reports">Denúncias</TabsTrigger>
          <TabsTrigger value="submit">Nova Denúncia</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <DataTableV2
            data={reports}
            columns={columns}
            title="Denúncias Recebidas"
            icon={Flag}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            actions={[
              { label: "Investigar", icon: Eye, onClick: (item) => toast.info(`Abrindo investigação ${item.id}`) },
              { label: "Classificar IA", icon: Brain, onClick: (item) => toast.success(`Classificando denúncia`) },
            ]}
          />
        </TabsContent>

        <TabsContent value="submit">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardV2 icon={MessageSquare} title="Enviar Denúncia" description="Seu relato é 100% confidencial" gradient="red">
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">Comunicação Segura</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sua identidade será protegida. Você pode denunciar de forma anônima.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição da Denúncia</Label>
                  <Textarea 
                    placeholder="Descreva o que você observou ou vivenciou..."
                    rows={6}
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <Button className="w-full" onClick={() => toast.success("Denúncia registrada com sucesso! Protocolo: WB-" + Date.now().toString().slice(-6))}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Denúncia Anônima
                </Button>
              </div>
            </CardV2>
            
            <CardV2 icon={Shield} title="Proteção ao Denunciante" description="Suas garantias" gradient="green">
              <div className="space-y-4">
                {[
                  { title: "Anonimato Garantido", desc: "Sua identidade nunca será revelada" },
                  { title: "Proteção contra Retaliação", desc: "Lei protege denunciantes de boa-fé" },
                  { title: "Investigação Imparcial", desc: "Equipe independente analisa os casos" },
                  { title: "Feedback do Processo", desc: "Acompanhe o status pelo protocolo" }
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Canal de Denúncias"
            moduleContext="canal de denúncias, compliance, ética, investigação"
            systemPrompt="Você é especialista em canais de denúncia e ética corporativa. Ajude com orientações sobre denúncias, proteção ao denunciante e processo de investigação."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="whistleblower-ai"
            accentColor="red"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Canal de Denúncias"
            moduleContext="denúncias, investigação, compliance, ética"
            edgeFunctionName="whistleblower-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="red"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
