/**
 * DueDiligenceV2 - Due Diligence
 * Verificação de terceiros com IA
 */

import { PageLayoutV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Search, Brain, Shield, CheckCircle, AlertTriangle, 
  Building2, FileCheck
} from "lucide-react";
import { useDueDiligenceReports, DueDiligenceReport } from "@/hooks/useDueDiligence";

const QUICK_QUESTIONS = [
  "O que é due diligence?",
  "Quando fazer verificação de terceiros?",
  "Critérios de avaliação?",
  "Red flags a observar?",
  "Frequência de revisão?",
  "Documentos necessários?"
];

const EVIDENCE_FIELDS = [
  { name: "third_party_name", label: "Nome do Terceiro", type: "text" as const, required: true },
  { name: "type", label: "Tipo", type: "select" as const, options: [
    { value: "supplier", label: "Fornecedor" },
    { value: "agent", label: "Agente" },
    { value: "contractor", label: "Contratado" },
    { value: "partner", label: "Parceiro" }
  ], required: true },
  { name: "observed_condition", label: "Observação/Risco Identificado", type: "textarea" as const, required: true },
];

export default function DueDiligenceV2() {
  const { data: reports = [], isLoading, refetch } = useDueDiligenceReports();

  const completed = reports.filter(r => r.report_status === 'completed').length;
  const pending = reports.filter(r => r.report_status === 'pending').length;
  const avgScore = reports.length > 0 
    ? (reports.reduce((a, r) => a + (r.risk_score || 0), 0) / reports.length).toFixed(0) 
    : 0;

  const stats = [
    { label: "Total Relatórios", value: reports.length, icon: Building2, color: "blue" as const },
    { label: "Concluídos", value: completed, icon: CheckCircle, color: "green" as const },
    { label: "Pendentes", value: pending, icon: AlertTriangle, color: "orange" as const },
    { label: "Score Médio", value: `${avgScore}%`, icon: Shield, color: "purple" as const },
  ];

  const columns = [
    { key: "report_code", label: "Código", sortable: true },
    { key: "subject_name", label: "Sujeito", sortable: true },
    { key: "subject_type", label: "Tipo", render: (item: DueDiligenceReport) => <Badge variant="secondary">{item.subject_type}</Badge> },
    { key: "risk_level", label: "Risco", render: (item: DueDiligenceReport) => (
      <Badge variant={item.risk_level === 'high' ? 'destructive' : item.risk_level === 'medium' ? 'secondary' : 'outline'}>
        {item.risk_level === 'high' ? 'Alto' : item.risk_level === 'medium' ? 'Médio' : 'Baixo'}
      </Badge>
    )},
    { key: "risk_score", label: "Score", render: (item: DueDiligenceReport) => (
      <div className="flex items-center gap-2">
        <Progress value={item.risk_score || 0} className="w-16 h-2" />
        <span className="text-sm">{item.risk_score || 0}%</span>
      </div>
    )},
    { key: "report_status", label: "Status", render: (item: DueDiligenceReport) => (
      <Badge variant={item.report_status === 'completed' ? 'default' : 'secondary'}>
        {item.report_status === 'completed' ? 'Concluído' : item.report_status === 'pending' ? 'Pendente' : 'Ação Requerida'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={Search}
      title="Due Diligence"
      description="Verificação e análise de terceiros com IA"
      gradient="cyan"
      badges={[
        { icon: Brain, label: "IA Análise" },
        { icon: Shield, label: "Risk Assessment" },
        { icon: FileCheck, label: "Compliance Check" },
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="third-parties" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="third-parties">Terceiros</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="third-parties">
          <DataTableV2
            data={reports}
            columns={columns}
            title="Relatórios de Due Diligence"
            icon={Building2}
            searchable
            loading={isLoading}
            onRefresh={() => {
              refetch();
              toast.success("Dados atualizados");
            }}
            actions={[
              { label: "Analisar IA", icon: Brain, onClick: (item: DueDiligenceReport) => { navigator.clipboard?.writeText(`Due Diligence: ${item.subject_name} | Score: ${item.risk_score} | Status: ${item.report_status}`); toast.success(`Dados de ${item.subject_name} copiados para análise`); } },
              { label: "Concluir", icon: CheckCircle, onClick: (item: DueDiligenceReport) => { navigator.clipboard?.writeText(`Relatório concluído: ${item.subject_name}`); toast.success(`Relatório ${item.subject_name} marcado para conclusão`); } },
            ]}
          />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Due Diligence"
            moduleContext="verificação de terceiros, análise de risco, compliance de fornecedores"
            systemPrompt="Você é especialista em due diligence e análise de terceiros. Ajude com avaliação de riscos, red flags e processo de verificação."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="due-diligence-ai"
            accentColor="cyan"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Due Diligence"
            moduleContext="verificação de terceiros, análise de risco, compliance"
            edgeFunctionName="due-diligence-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="cyan"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
