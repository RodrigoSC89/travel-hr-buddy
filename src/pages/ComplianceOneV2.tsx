/**
 * ComplianceOneV2 - Compliance One
 * GRC Dashboard com ISO 37301
 */

import { useState } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Scale, Brain, Shield, FileCheck, AlertTriangle, CheckCircle, 
  TrendingUp, Eye, BookOpen, Sparkles, Flag
} from "lucide-react";

const QUICK_QUESTIONS = [
  "O que é ISO 37301?",
  "Como estruturar um GRC?",
  "Requisitos de compliance marítimo?",
  "Canal de denúncias obrigatório?",
  "Mapeamento de riscos?",
  "Due diligence de terceiros?"
];

const EVIDENCE_FIELDS = [
  { name: "compliance_area", label: "Área de Compliance", type: "select" as const, options: [
    { value: "regulatory", label: "Regulatório" },
    { value: "legal", label: "Legal" },
    { value: "ethical", label: "Ética" },
    { value: "environmental", label: "Ambiental" }
  ], required: true },
  { name: "observed_condition", label: "Não Conformidade", type: "textarea" as const, required: true },
  { name: "regulation", label: "Regulamento Afetado", type: "text" as const },
];

export default function ComplianceOneV2() {
  const [metrics] = useState({
    overallScore: 91,
    regulatoryCompliance: 94,
    riskMitigation: 88,
    trainingCompletion: 85,
    openIssues: 3
  });

  const stats = [
    { label: "Score Geral", value: `${metrics.overallScore}%`, icon: Scale, color: "green" as const },
    { label: "Compliance Regulatório", value: `${metrics.regulatoryCompliance}%`, icon: Shield, color: "blue" as const },
    { label: "Mitigação de Riscos", value: `${metrics.riskMitigation}%`, icon: TrendingUp, color: "purple" as const },
    { label: "Issues Abertas", value: metrics.openIssues, icon: AlertTriangle, color: "orange" as const },
  ];

  return (
    <PageLayoutV2
      icon={Scale}
      title="Compliance One"
      description="GRC Dashboard com framework ISO 37301 e IA"
      gradient="green"
      badges={[
        { icon: Brain, label: "IA Análise" },
        { icon: Scale, label: "ISO 37301" },
        { icon: Eye, label: "Monitoramento" },
        { icon: Sparkles, label: "Layout V2" }
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="dashboard">Dashboard GRC</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardV2 icon={Scale} title="Compliance Score" description="Visão geral de conformidade" gradient="green">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-green-500">{metrics.overallScore}%</p>
                  <p className="text-muted-foreground">Score de Compliance</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Regulatório", value: metrics.regulatoryCompliance },
                    { label: "Legal", value: 92 },
                    { label: "Ética", value: 89 },
                    { label: "Ambiental", value: 87 }
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={item.value} className="w-24 h-2" />
                        <span className="text-xs">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardV2>
            <CardV2 icon={AlertTriangle} title="Issues de Compliance" description="Não conformidades abertas" gradient="orange">
              <div className="space-y-3">
                {[
                  { title: "Renovação de certificado pendente", severity: "medium", area: "Regulatório" },
                  { title: "Treinamento atrasado", severity: "low", area: "RH" },
                  { title: "Documentação incompleta", severity: "high", area: "Legal" }
                ].map((issue, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{issue.title}</p>
                      <p className="text-xs text-muted-foreground">{issue.area}</p>
                    </div>
                    <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'}>
                      {issue.severity === 'high' ? 'Alta' : issue.severity === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="risks">
          <CardV2 icon={Shield} title="Mapeamento de Riscos" description="Matriz de probabilidade x impacto" gradient="purple">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Baixo", count: 5, color: "green" },
                { label: "Médio", count: 8, color: "orange" },
                { label: "Alto", count: 2, color: "red" }
              ].map(risk => (
                <div key={risk.label} className={`p-6 rounded-lg text-center bg-${risk.color}-500/10 border border-${risk.color}-500/20`}>
                  <p className={`text-3xl font-bold text-${risk.color}-500`}>{risk.count}</p>
                  <p className="text-sm text-muted-foreground">Risco {risk.label}</p>
                </div>
              ))}
            </div>
          </CardV2>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Compliance One"
            moduleContext="GRC, governança, riscos, compliance, ISO 37301 e conformidade marítima"
            systemPrompt="Você é especialista em GRC e compliance marítimo. Ajude com ISO 37301, mapeamento de riscos, due diligence e canal de denúncias."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="compliance-one-ai"
            accentColor="green"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Compliance One"
            moduleContext="GRC, compliance, riscos, ISO 37301"
            edgeFunctionName="compliance-one-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="green"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
