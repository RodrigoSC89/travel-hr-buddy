/**
 * SafetyIMCAV2 - Safety IMCA V2
 * Análise de incidentes com lições aprendidas
 */

import { useState, useEffect } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Shield, Brain, AlertTriangle, CheckCircle, FileText, 
  TrendingUp, BookOpen, Sparkles, Search
} from "lucide-react";

interface IMCAIncident {
  id: string;
  title: string;
  category: string;
  severity: string;
  date: string;
  lessons_learned: string;
  status: string;
}

const QUICK_QUESTIONS = [
  "O que é IMCA?",
  "Categorias de incidentes?",
  "Como reportar um near miss?",
  "Lições aprendidas obrigatórias?",
  "Análise de causa raiz?",
  "Como prevenir recorrência?"
];

const EVIDENCE_FIELDS = [
  { name: "incident_title", label: "Título do Incidente", type: "text" as const, required: true },
  { name: "category", label: "Categoria", type: "select" as const, options: [
    { value: "hipo", label: "HIPO - Alto Potencial" },
    { value: "lti", label: "LTI - Lost Time Injury" },
    { value: "near_miss", label: "Near Miss" },
    { value: "observation", label: "Observação de Segurança" }
  ], required: true },
  { name: "observed_condition", label: "Descrição", type: "textarea" as const, required: true },
];

export default function SafetyIMCAV2() {
  const [incidents, setIncidents] = useState<IMCAIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIncidents([
      { id: "IMCA-001", title: "Near miss - procedimento de amarração", category: "near_miss", severity: "medium", date: "2024-12-15", lessons_learned: "Revisar procedimento e treinar equipe", status: "closed" },
      { id: "IMCA-002", title: "Observação - EPI incorreto", category: "observation", severity: "low", date: "2024-12-20", lessons_learned: "Reforçar uso correto de EPI", status: "closed" },
      { id: "IMCA-003", title: "HIPO - Queda de objeto", category: "hipo", severity: "high", date: "2024-12-28", lessons_learned: "Implementar zona de exclusão", status: "open" },
    ]);
    setLoading(false);
  }, []);

  const total = incidents.length;
  const hipos = incidents.filter(i => i.category === 'hipo').length;
  const nearMisses = incidents.filter(i => i.category === 'near_miss').length;
  const closed = incidents.filter(i => i.status === 'closed').length;

  const stats = [
    { label: "Total Incidentes", value: total, icon: AlertTriangle, color: "blue" as const },
    { label: "HIPOs", value: hipos, icon: Shield, color: "red" as const },
    { label: "Near Misses", value: nearMisses, icon: AlertTriangle, color: "orange" as const },
    { label: "Fechados", value: closed, icon: CheckCircle, color: "green" as const },
  ];

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "title", label: "Incidente", sortable: true },
    { key: "category", label: "Categoria", render: (item: IMCAIncident) => (
      <Badge variant={item.category === 'hipo' ? 'destructive' : item.category === 'near_miss' ? 'secondary' : 'outline'}>
        {item.category === 'hipo' ? 'HIPO' : item.category === 'near_miss' ? 'Near Miss' : item.category === 'lti' ? 'LTI' : 'Observação'}
      </Badge>
    )},
    { key: "severity", label: "Severidade", render: (item: IMCAIncident) => (
      <Badge variant={item.severity === 'high' ? 'destructive' : item.severity === 'medium' ? 'secondary' : 'outline'}>
        {item.severity === 'high' ? 'Alta' : item.severity === 'medium' ? 'Média' : 'Baixa'}
      </Badge>
    )},
    { key: "date", label: "Data", render: (item: IMCAIncident) => new Date(item.date).toLocaleDateString('pt-BR') },
    { key: "status", label: "Status", render: (item: IMCAIncident) => (
      <Badge variant={item.status === 'closed' ? 'default' : 'secondary'}>
        {item.status === 'closed' ? 'Fechado' : 'Aberto'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={Shield}
      title="Safety IMCA V2"
      description="Análise de incidentes IMCA com lições aprendidas e IA"
      gradient="red"
      badges={[
        { icon: Brain, label: "IA Análise" },
        { icon: BookOpen, label: "Lições Aprendidas" },
        { icon: Search, label: "Causa Raiz" },
        { icon: Sparkles, label: "Layout V2" }
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="lessons">Lições Aprendidas</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents">
          <DataTableV2
            data={incidents}
            columns={columns}
            title="Base de Incidentes IMCA"
            icon={Shield}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            loading={loading}
            actions={[
              { label: "Analisar com IA", icon: Brain, onClick: (item) => toast.success(`Analisando ${item.id}`) },
              { label: "Ver Lições", icon: BookOpen, onClick: (item) => toast.info(item.lessons_learned) },
            ]}
            filters={[
              { key: "category", label: "Categoria", options: [
                { value: "hipo", label: "HIPO" },
                { value: "near_miss", label: "Near Miss" },
                { value: "observation", label: "Observação" }
              ]}
            ]}
          />
        </TabsContent>

        <TabsContent value="lessons">
          <CardV2 icon={BookOpen} title="Lições Aprendidas" description="Conhecimento extraído dos incidentes" gradient="blue">
            <div className="space-y-4">
              {incidents.map(incident => (
                <div key={incident.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{incident.title}</p>
                    <Badge variant="outline">{incident.id}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.lessons_learned}</p>
                </div>
              ))}
            </div>
          </CardV2>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Safety IMCA"
            moduleContext="análise de incidentes IMCA, lições aprendidas, causa raiz e prevenção"
            systemPrompt="Você é especialista em segurança marítima e análise de incidentes IMCA. Ajude com investigação, causa raiz e ações preventivas."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="imca-ai"
            accentColor="red"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Safety IMCA"
            moduleContext="análise de incidentes, causa raiz, lições aprendidas"
            edgeFunctionName="imca-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="red"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
