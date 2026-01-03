/**
 * ResponsibilityMatrixV2 - Matriz de Responsabilidades V2
 * RACI com automação e notificações
 */

import { useState, useEffect } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  LayoutGrid, Brain, Users, CheckCircle, AlertTriangle, Clock, 
  Send, Mail, MessageSquare, Sparkles
} from "lucide-react";

interface ResponsibilityItem {
  id: string;
  task: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
  status: string;
  due_date: string;
}

const QUICK_QUESTIONS = [
  "O que é matriz RACI?",
  "Como definir responsáveis?",
  "Diferença entre R e A?",
  "Como automatizar notificações?",
  "Quando escalar uma tarefa?",
  "Boas práticas para RACI marítimo?"
];

const EVIDENCE_FIELDS = [
  { name: "task", label: "Tarefa/Atividade", type: "text" as const, required: true },
  { name: "role", label: "Função", type: "select" as const, options: [
    { value: "responsible", label: "Responsável (R)" },
    { value: "accountable", label: "Aprovador (A)" },
    { value: "consulted", label: "Consultado (C)" },
    { value: "informed", label: "Informado (I)" }
  ], required: true },
  { name: "observed_condition", label: "Descrição/Problema", type: "textarea" as const, required: true },
];

export default function ResponsibilityMatrixV2() {
  const [items, setItems] = useState<ResponsibilityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems([
      { id: "1", task: "Inspeção de Segurança Mensal", responsible: "Safety Officer", accountable: "Capitão", consulted: "Chief Engineer", informed: "Tripulação", status: "completed", due_date: "2025-01-15" },
      { id: "2", task: "Manutenção Preventiva Motor", responsible: "Chief Engineer", accountable: "Capitão", consulted: "Fornecedor", informed: "Operações", status: "in_progress", due_date: "2025-01-20" },
      { id: "3", task: "Treinamento STCW Tripulação", responsible: "HR Manager", accountable: "DPA", consulted: "Training Provider", informed: "Tripulação", status: "pending", due_date: "2025-02-01" },
    ]);
    setLoading(false);
  }, []);

  const total = items.length;
  const completed = items.filter(i => i.status === 'completed').length;
  const inProgress = items.filter(i => i.status === 'in_progress').length;
  const pending = items.filter(i => i.status === 'pending').length;

  const stats = [
    { label: "Total Tarefas", value: total, icon: LayoutGrid, color: "blue" as const },
    { label: "Concluídas", value: completed, icon: CheckCircle, color: "green" as const },
    { label: "Em Andamento", value: inProgress, icon: Clock, color: "orange" as const },
    { label: "Pendentes", value: pending, icon: AlertTriangle, color: "red" as const },
  ];

  const columns = [
    { key: "task", label: "Tarefa", sortable: true },
    { key: "responsible", label: "R (Responsável)" },
    { key: "accountable", label: "A (Aprovador)" },
    { key: "consulted", label: "C (Consultado)" },
    { key: "informed", label: "I (Informado)" },
    { key: "due_date", label: "Prazo", render: (item: ResponsibilityItem) => new Date(item.due_date).toLocaleDateString('pt-BR') },
    { key: "status", label: "Status", render: (item: ResponsibilityItem) => (
      <Badge variant={item.status === 'completed' ? 'default' : item.status === 'in_progress' ? 'secondary' : 'outline'}>
        {item.status === 'completed' ? 'Concluída' : item.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={LayoutGrid}
      title="Matriz de Responsabilidades V2"
      description="Gestão RACI com automação de notificações e tracking"
      gradient="orange"
      badges={[
        { icon: Brain, label: "IA Sugestões" },
        { icon: Users, label: "RACI Model" },
        { icon: Send, label: "Auto-Notificações" },
        { icon: Sparkles, label: "Layout V2" }
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="matrix">Matriz RACI</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <DataTableV2
            data={items}
            columns={columns}
            title="Matriz de Responsabilidades"
            icon={LayoutGrid}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            loading={loading}
            actions={[
              { label: "Notificar R", icon: Send, onClick: (item) => toast.success(`Notificação enviada para ${item.responsible}`) },
              { label: "Marcar Concluída", icon: CheckCircle, onClick: (item) => toast.success(`Tarefa concluída`) },
            ]}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CardV2 icon={Mail} title="Email" description="Notificações por email" gradient="blue">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Mail className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="font-medium">Integrado</p>
                <p className="text-sm text-muted-foreground">12 enviados hoje</p>
              </div>
            </CardV2>
            <CardV2 icon={MessageSquare} title="WhatsApp" description="Notificações via Twilio" gradient="green">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="font-medium">Configurado</p>
                <p className="text-sm text-muted-foreground">5 enviados hoje</p>
              </div>
            </CardV2>
            <CardV2 icon={Send} title="Zapier" description="Automações customizadas" gradient="purple">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Send className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="font-medium">3 Zaps Ativos</p>
                <p className="text-sm text-muted-foreground">Slack, Teams, Jira</p>
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Matriz de Responsabilidades"
            moduleContext="gestão RACI, definição de responsabilidades, automação de notificações"
            systemPrompt="Você é especialista em gestão de responsabilidades e modelo RACI. Ajude com definição de papéis, escalação e automação."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="responsibility-matrix-ai"
            accentColor="orange"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Matriz de Responsabilidades"
            moduleContext="gestão RACI, responsabilidades, delegação de tarefas"
            edgeFunctionName="responsibility-matrix-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="orange"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
