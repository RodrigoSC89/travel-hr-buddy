/**
 * DueDiligenceV2 - Due Diligence V2
 * Verificação de terceiros com IA
 */

import { useState } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Search, Brain, Shield, CheckCircle, AlertTriangle, 
  Building2, Users, FileCheck, Sparkles
} from "lucide-react";

interface ThirdParty {
  id: string;
  name: string;
  type: string;
  risk_level: string;
  score: number;
  last_review: string;
  status: string;
}

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
  const [thirdParties] = useState<ThirdParty[]>([
    { id: "1", name: "Global Shipping Agency", type: "agent", risk_level: "low", score: 92, last_review: "2024-12-15", status: "approved" },
    { id: "2", name: "Marine Supplies Ltd", type: "supplier", risk_level: "medium", score: 75, last_review: "2024-11-20", status: "review" },
    { id: "3", name: "Port Services Inc", type: "contractor", risk_level: "low", score: 88, last_review: "2024-12-01", status: "approved" },
  ]);

  const approved = thirdParties.filter(t => t.status === 'approved').length;
  const underReview = thirdParties.filter(t => t.status === 'review').length;
  const avgScore = thirdParties.length > 0 ? (thirdParties.reduce((a, t) => a + t.score, 0) / thirdParties.length).toFixed(0) : 0;

  const stats = [
    { label: "Total Terceiros", value: thirdParties.length, icon: Building2, color: "blue" as const },
    { label: "Aprovados", value: approved, icon: CheckCircle, color: "green" as const },
    { label: "Em Revisão", value: underReview, icon: AlertTriangle, color: "orange" as const },
    { label: "Score Médio", value: `${avgScore}%`, icon: Shield, color: "purple" as const },
  ];

  const columns = [
    { key: "name", label: "Nome", sortable: true },
    { key: "type", label: "Tipo", render: (item: ThirdParty) => <Badge variant="secondary">{item.type}</Badge> },
    { key: "risk_level", label: "Risco", render: (item: ThirdParty) => (
      <Badge variant={item.risk_level === 'high' ? 'destructive' : item.risk_level === 'medium' ? 'secondary' : 'outline'}>
        {item.risk_level === 'high' ? 'Alto' : item.risk_level === 'medium' ? 'Médio' : 'Baixo'}
      </Badge>
    )},
    { key: "score", label: "Score", render: (item: ThirdParty) => (
      <div className="flex items-center gap-2">
        <Progress value={item.score} className="w-16 h-2" />
        <span className="text-sm">{item.score}%</span>
      </div>
    )},
    { key: "last_review", label: "Última Revisão", render: (item: ThirdParty) => new Date(item.last_review).toLocaleDateString('pt-BR') },
    { key: "status", label: "Status", render: (item: ThirdParty) => (
      <Badge variant={item.status === 'approved' ? 'default' : 'secondary'}>
        {item.status === 'approved' ? 'Aprovado' : 'Em Revisão'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={Search}
      title="Due Diligence V2"
      description="Verificação e análise de terceiros com IA"
      gradient="cyan"
      badges={[
        { icon: Brain, label: "IA Análise" },
        { icon: Shield, label: "Risk Assessment" },
        { icon: FileCheck, label: "Compliance Check" },
        { icon: Sparkles, label: "Layout V2" }
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
            data={thirdParties}
            columns={columns}
            title="Cadastro de Terceiros"
            icon={Building2}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            actions={[
              { label: "Analisar IA", icon: Brain, onClick: (item) => toast.success(`Analisando ${item.name}`) },
              { label: "Aprovar", icon: CheckCircle, onClick: (item) => toast.success(`Terceiro aprovado`) },
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
