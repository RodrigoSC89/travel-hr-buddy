/**
 * RegulationsV2 - Regulamentos V2
 * Base de conhecimento regulatório com IA
 */

import { useState } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  BookOpen, Brain, FileText, Search, AlertTriangle, CheckCircle, 
  Globe, Calendar, Sparkles
} from "lucide-react";

interface Regulation {
  id: string;
  code: string;
  title: string;
  category: string;
  issuer: string;
  effective_date: string;
  status: string;
}

const QUICK_QUESTIONS = [
  "Quais são os principais regulamentos IMO?",
  "O que é SOLAS?",
  "Requisitos MARPOL?",
  "Regulamentos da ANTAQ?",
  "Normas da Marinha do Brasil?",
  "Como acompanhar atualizações?"
];

const EVIDENCE_FIELDS = [
  { name: "regulation_code", label: "Código do Regulamento", type: "text" as const, required: true },
  { name: "observed_condition", label: "Descrição da Não Conformidade", type: "textarea" as const, required: true },
  { name: "issuer", label: "Órgão Emissor", type: "select" as const, options: [
    { value: "imo", label: "IMO" },
    { value: "antaq", label: "ANTAQ" },
    { value: "marina", label: "Marinha do Brasil" },
    { value: "ibama", label: "IBAMA" }
  ]},
];

export default function RegulationsV2() {
  const [regulations] = useState<Regulation[]>([
    { id: "1", code: "SOLAS", title: "Safety of Life at Sea", category: "Safety", issuer: "IMO", effective_date: "1974-11-01", status: "active" },
    { id: "2", code: "MARPOL", title: "Marine Pollution Convention", category: "Environmental", issuer: "IMO", effective_date: "1973-02-17", status: "active" },
    { id: "3", code: "MLC 2006", title: "Maritime Labour Convention", category: "Labour", issuer: "ILO", effective_date: "2006-02-23", status: "active" },
    { id: "4", code: "STCW", title: "Standards of Training, Certification and Watchkeeping", category: "Training", issuer: "IMO", effective_date: "1978-07-07", status: "active" },
  ]);

  const stats = [
    { label: "Total Regulamentos", value: regulations.length, icon: BookOpen, color: "blue" as const },
    { label: "IMO", value: regulations.filter(r => r.issuer === 'IMO').length, icon: Globe, color: "green" as const },
    { label: "Atualizações (30d)", value: 3, icon: Calendar, color: "orange" as const },
    { label: "Alertas", value: 1, icon: AlertTriangle, color: "red" as const },
  ];

  const columns = [
    { key: "code", label: "Código", sortable: true },
    { key: "title", label: "Título", sortable: true },
    { key: "category", label: "Categoria", render: (item: Regulation) => <Badge variant="secondary">{item.category}</Badge> },
    { key: "issuer", label: "Emissor" },
    { key: "status", label: "Status", render: (item: Regulation) => (
      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
        {item.status === 'active' ? 'Vigente' : item.status}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={BookOpen}
      title="Regulamentos V2"
      description="Base de conhecimento regulatório marítimo com IA"
      gradient="blue"
      badges={[
        { icon: Brain, label: "IA Consulta" },
        { icon: Globe, label: "IMO/ILO" },
        { icon: Search, label: "Busca Inteligente" },
        { icon: Sparkles, label: "Layout V2" }
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="regulations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="regulations">Regulamentos</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="regulations">
          <DataTableV2
            data={regulations}
            columns={columns}
            title="Base de Regulamentos"
            icon={BookOpen}
            searchable
            searchPlaceholder="Buscar regulamentos..."
            onRefresh={() => toast.success("Dados atualizados")}
            actions={[
              { label: "Consultar IA", icon: Brain, onClick: (item) => toast.success(`Consultando ${item.code}`) },
              { label: "Ver Detalhes", icon: FileText, onClick: (item) => toast.info(`Abrindo ${item.title}`) },
            ]}
            filters={[
              { key: "category", label: "Categoria", options: [
                { value: "Safety", label: "Safety" },
                { value: "Environmental", label: "Environmental" },
                { value: "Labour", label: "Labour" }
              ]}
            ]}
          />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Regulamentos"
            moduleContext="regulamentos marítimos, SOLAS, MARPOL, MLC, STCW, IMO, ILO, ANTAQ"
            systemPrompt="Você é especialista em regulamentação marítima internacional. Ajude com interpretação de SOLAS, MARPOL, MLC, STCW e normas IMO/ILO."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="regulations-ai"
            accentColor="blue"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Regulamentos"
            moduleContext="conformidade regulatória, SOLAS, MARPOL, MLC, STCW"
            edgeFunctionName="regulations-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="blue"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
