/**
 * RegulationsV2 - Regulamentos V2
 * Base de conhecimento regulatório com IA
 */

import { PageLayoutV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  BookOpen, Brain, FileText, Search, AlertTriangle, 
  Globe, Calendar, Sparkles, RefreshCw
} from "lucide-react";
import { useRegulations, Regulation } from "@/hooks/useRegulations";

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
  const { data: regulations = [], isLoading, refetch } = useRegulations();

  const stats = [
    { label: "Total Regulamentos", value: regulations.length, icon: BookOpen, color: "blue" as const },
    { label: "IMO", value: regulations.filter(r => r.authority === 'IMO').length, icon: Globe, color: "green" as const },
    { label: "ILO", value: regulations.filter(r => r.authority === 'ILO').length, icon: Calendar, color: "orange" as const },
    { label: "Mandatórios", value: regulations.filter(r => r.is_mandatory).length, icon: AlertTriangle, color: "red" as const },
  ];

  const columns = [
    { key: "reg_code", label: "Código", sortable: true },
    { key: "title", label: "Título", sortable: true },
    { key: "category", label: "Categoria", render: (item: Regulation) => <Badge variant="secondary">{item.category}</Badge> },
    { key: "authority", label: "Autoridade" },
    { key: "reg_status", label: "Status", render: (item: Regulation) => (
      <Badge variant={item.reg_status === 'active' ? 'default' : 'secondary'}>
        {item.reg_status === 'active' ? 'Vigente' : item.reg_status}
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
            loading={isLoading}
            onRefresh={() => {
              refetch();
              toast.success("Dados atualizados");
            }}
            actions={[
              { label: "Consultar IA", icon: Brain, onClick: (item) => toast.success(`Consultando ${item.reg_code}`) },
              { label: "Ver Detalhes", icon: FileText, onClick: (item) => toast.info(`Abrindo ${item.title}`) },
            ]}
            filters={[
              { key: "category", label: "Categoria", options: [
                { value: "safety", label: "Safety" },
                { value: "labor", label: "Labour" },
                { value: "environmental", label: "Environmental" }
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
