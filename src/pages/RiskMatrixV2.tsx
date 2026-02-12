/**
 * RiskMatrixV2 - Matriz de Riscos
 * Gestão de riscos com probabilidade x impacto
 */

import { useState } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  AlertTriangle, Brain, Shield, TrendingDown, CheckCircle, 
  Target, BarChart3
} from "lucide-react";

interface Risk {
  id: string;
  title: string;
  category: string;
  probability: number;
  impact: number;
  risk_score: number;
  mitigation: string;
  owner: string;
  status: string;
}

const QUICK_QUESTIONS = [
  "Como calcular score de risco?",
  "Matriz 5x5 vs 3x3?",
  "O que é apetite de risco?",
  "Como priorizar mitigações?",
  "Riscos operacionais marítimos?",
  "Monitoramento contínuo?"
];

const EVIDENCE_FIELDS = [
  { name: "risk_title", label: "Título do Risco", type: "text" as const, required: true },
  { name: "category", label: "Categoria", type: "select" as const, options: [
    { value: "operational", label: "Operacional" },
    { value: "safety", label: "Segurança" },
    { value: "environmental", label: "Ambiental" },
    { value: "financial", label: "Financeiro" },
    { value: "regulatory", label: "Regulatório" }
  ], required: true },
  { name: "observed_condition", label: "Descrição/Análise", type: "textarea" as const, required: true },
];

export default function RiskMatrixV2() {
  const [risks] = useState<Risk[]>([
    { id: "1", title: "Falha em equipamento crítico", category: "operational", probability: 3, impact: 5, risk_score: 15, mitigation: "Manutenção preventiva", owner: "Chief Engineer", status: "mitigated" },
    { id: "2", title: "Derramamento de óleo", category: "environmental", probability: 2, impact: 5, risk_score: 10, mitigation: "SOPEP atualizado", owner: "Captain", status: "mitigated" },
    { id: "3", title: "Acidente de trabalho", category: "safety", probability: 3, impact: 4, risk_score: 12, mitigation: "Treinamento e EPIs", owner: "Safety Officer", status: "monitoring" },
  ]);

  const highRisks = risks.filter(r => r.risk_score >= 15).length;
  const mediumRisks = risks.filter(r => r.risk_score >= 8 && r.risk_score < 15).length;
  const lowRisks = risks.filter(r => r.risk_score < 8).length;
  const mitigated = risks.filter(r => r.status === 'mitigated').length;

  const stats = [
    { label: "Riscos Altos", value: highRisks, icon: AlertTriangle, color: "red" as const },
    { label: "Riscos Médios", value: mediumRisks, icon: Target, color: "orange" as const },
    { label: "Riscos Baixos", value: lowRisks, icon: CheckCircle, color: "green" as const },
    { label: "Mitigados", value: mitigated, icon: Shield, color: "blue" as const },
  ];

  const columns = [
    { key: "title", label: "Risco", sortable: true },
    { key: "category", label: "Categoria", render: (item: Risk) => <Badge variant="secondary">{item.category}</Badge> },
    { key: "probability", label: "P", render: (item: Risk) => <span className="font-mono">{item.probability}</span> },
    { key: "impact", label: "I", render: (item: Risk) => <span className="font-mono">{item.impact}</span> },
    { key: "risk_score", label: "Score", render: (item: Risk) => (
      <Badge variant={item.risk_score >= 15 ? 'destructive' : item.risk_score >= 8 ? 'secondary' : 'outline'}>
        {item.risk_score}
      </Badge>
    )},
    { key: "owner", label: "Responsável" },
    { key: "status", label: "Status", render: (item: Risk) => (
      <Badge variant={item.status === 'mitigated' ? 'default' : 'secondary'}>
        {item.status === 'mitigated' ? 'Mitigado' : 'Monitorando'}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={AlertTriangle}
      title="Matriz de Riscos"
      description="Gestão de riscos com matriz probabilidade x impacto e IA"
      gradient="orange"
      badges={[
        { icon: Brain, label: "IA Análise" },
        { icon: Target, label: "Matriz P×I" },
        { icon: TrendingDown, label: "Mitigação" },
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="risks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="risks">Riscos</TabsTrigger>
          <TabsTrigger value="matrix">Matriz Visual</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="risks">
          <DataTableV2
            data={risks}
            columns={columns}
            title="Registro de Riscos"
            icon={AlertTriangle}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            actions={[
              { label: "Analisar IA", icon: Brain, onClick: (item) => { navigator.clipboard?.writeText(`Risco: ${item.title} | P:${item.probability} I:${item.impact}`); toast.success(`Análise copiada: ${item.title}`); } },
              { label: "Mitigar", icon: Shield, onClick: (item) => { navigator.clipboard?.writeText(item.mitigation || 'Definir plano'); toast.success(`Mitigação copiada: ${item.title}`); } },
            ]}
          />
        </TabsContent>

        <TabsContent value="matrix">
          <CardV2 icon={BarChart3} title="Matriz de Riscos 5x5" description="Visualização probabilidade × impacto" gradient="orange">
            <div className="grid grid-cols-6 gap-1">
              <div className="col-span-1"></div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={`impact-${i}`} className="text-center text-xs font-medium p-2">I={i}</div>
              ))}
              {[5, 4, 3, 2, 1].map(p => (
                <>
                  <div key={`p${p}`} className="text-center text-xs font-medium p-2">P={p}</div>
                  {[1, 2, 3, 4, 5].map(i => {
                    const score = p * i;
                    const risksInCell = risks.filter(r => r.probability === p && r.impact === i).length;
                    return (
                      <div 
                        key={`${p}-${i}`} 
                        className={`p-3 text-center text-xs rounded ${
                          score >= 15 ? 'bg-red-500/30' : 
                          score >= 8 ? 'bg-orange-500/30' : 
                          score >= 4 ? 'bg-yellow-500/30' : 
                          'bg-green-500/30'
                        }`}
                      >
                        {risksInCell > 0 && <span className="font-bold">{risksInCell}</span>}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </CardV2>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Matriz de Riscos"
            moduleContext="gestão de riscos marítimos, matriz probabilidade x impacto, mitigação"
            systemPrompt="Você é especialista em gestão de riscos marítimos. Ajude com análise de riscos, cálculo de scores, planos de mitigação e monitoramento."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="risk-matrix-ai"
            accentColor="orange"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Matriz de Riscos"
            moduleContext="gestão de riscos, mitigação, análise de impacto"
            edgeFunctionName="risk-matrix-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="orange"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
