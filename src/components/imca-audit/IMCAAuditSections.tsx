import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Wrench, 
  Settings, 
  Users, 
  FileText, 
  TrendingUp,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";

interface AuditSection {
  code: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  weight: number;
  standards: string[];
  keyItems: string[];
}

const AUDIT_SECTIONS: AuditSection[] = [
  {
    code: "TEC",
    name: "Auditoria Técnica",
    description: "Sistema DP (controle, potência, sensores, redundância)",
    icon: <Wrench className="h-5 w-5" />,
    weight: 0.30,
    standards: ["IMCA M103", "IMCA M166", "IMCA M206", "IMO MSC.1/Circ.1580"],
    keyItems: [
      "Presença de FMEA atualizado",
      "Redundância dos sistemas de controle DP",
      "Isolação de falhas validada via FMEA",
      "UPS testado com sucesso",
      "Plotagem de capacidade conforme local"
    ]
  },
  {
    code: "OPR",
    name: "Auditoria Operacional",
    description: "ASOG, CAMO, logs, resposta a falhas, comunicação",
    icon: <Settings className="h-5 w-5" />,
    weight: 0.25,
    standards: ["IMCA M220", "IMCA M182", "IMCA M205", "IMO MSC.1/Circ.1580 sec.4.5"],
    keyItems: [
      "ASOG por tipo de missão",
      "CAMO implementado com base no WCFDI",
      "Checklist de mudança de turno",
      "Eventos DP reportados ao IMCA",
      "Comunicação passadiço-operação"
    ]
  },
  {
    code: "COMP",
    name: "Competência e Treinamento",
    description: "Certificações, experiência, avaliações IMCA M117/STCW",
    icon: <Users className="h-5 w-5" />,
    weight: 0.20,
    standards: ["IMCA M117", "STCW 2010", "NI DPO Scheme", "IMO MSC/Circ.738"],
    keyItems: [
      "DPOs com certificado NI válido",
      "Treinamento em simulador registrado",
      "Familiarização formal em cada embarcação",
      "Autoridade DP e autonomia",
      "Avaliações de competência"
    ]
  },
  {
    code: "DOC",
    name: "Auditoria Documental",
    description: "FMEA, DPOM, Capability Plot, relatórios, versionamento",
    icon: <FileText className="h-5 w-5" />,
    weight: 0.15,
    standards: ["IMCA M109", "IMCA M166", "IMCA M140", "IMCA M190"],
    keyItems: [
      "FMEA disponível e digitalizado",
      "Annual Trials dentro da janela FSVAD",
      "DPOM atualizado conforme operações",
      "Plotagens de capacidade (intacta/degradada)",
      "Controle de revisões sistematizado"
    ]
  },
  {
    code: "CPD",
    name: "Desenvolvimento Contínuo (CPD)",
    description: "Programa de CPD, mentoria, drills, lições aprendidas",
    icon: <TrendingUp className="h-5 w-5" />,
    weight: 0.10,
    standards: ["IMCA M117 Cap. IX-X", "NI CPD Scheme"],
    keyItems: [
      "Plano de CPD embarcado por função",
      "Participação em drills de DP",
      "Mentoria SDPO-DPO Jr registrada",
      "Lições aprendidas documentadas",
      "Gaps de competência identificados"
    ]
  }
];

interface Props {
  selectedDPClass: "DP1" | "DP2" | "DP3";
  sectionScores: Record<string, { compliant: number; nonCompliant: number; total: number }>;
}

export const IMCAAuditSections = memo(function({ selectedDPClass, sectionScores }: Props) {
  const calculateOverallScore = () => {
    let weightedSum = 0;
    let totalWeight = 0;

    AUDIT_SECTIONS.forEach(section => {
      const score = sectionScores[section.code];
      if (score && score.total > 0) {
        const sectionScore = (score.compliant / score.total) * 100;
        weightedSum += sectionScore * section.weight;
        totalWeight += section.weight;
      }
    });

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">Conforme</Badge>;
    if (score >= 70) return <Badge className="bg-amber-500">Atenção</Badge>;
    return <Badge variant="destructive">Não Conforme</Badge>;
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Score Geral Ponderado</p>
              <p className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                Classe {selectedDPClass} • Metodologia: Média Ponderada
              </p>
            </div>
            <div className="text-right space-y-1">
              {getScoreBadge(overallScore)}
              <div className="text-xs text-muted-foreground mt-2">
                <p>≥90%: Conforme</p>
                <p>70-89%: Atenção</p>
                <p>&lt;70%: Não Conforme</p>
              </div>
            </div>
          </div>
          <Progress value={overallScore} className="mt-4 h-3" />
        </CardContent>
      </Card>

      {/* Section Cards */}
      <Tabs defaultValue="TEC" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          {AUDIT_SECTIONS.map(section => {
            const score = sectionScores[section.code];
            const sectionScore = score && score.total > 0 
              ? Math.round((score.compliant / score.total) * 100) 
              : 0;
            return (
              <TabsTrigger 
                key={section.code} 
                value={section.code}
                className="flex-col gap-1 py-3"
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="hidden lg:inline">{section.code}</span>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(sectionScore)}`}>
                  {sectionScore}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Peso: {(section.weight * 100)}%
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {AUDIT_SECTIONS.map(section => {
          const score = sectionScores[section.code] || { compliant: 0, nonCompliant: 0, total: 0 };
          const sectionScore = score.total > 0 
            ? Math.round((score.compliant / score.total) * 100) 
            : 0;
          const pending = score.total - score.compliant - score.nonCompliant;

          return (
            <TabsContent key={section.code} value={section.code}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        {section.icon}
                      </div>
                      <div>
                        <CardTitle>{section.name}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getScoreColor(sectionScore)}`}>
                        {sectionScore}%
                      </p>
                      {getScoreBadge(sectionScore)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold">{score.total}</p>
                      <p className="text-xs text-muted-foreground">Total Itens</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">{score.compliant}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Conformes</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <p className="text-2xl font-bold text-red-600">{score.nonCompliant}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Não Conformes</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Activity className="h-5 w-5 text-amber-600" />
                        <p className="text-2xl font-bold text-amber-600">{pending}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Pendentes</p>
                    </div>
                  </div>

                  <Progress value={sectionScore} className="h-2" />

                  {/* Standards */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Normas Aplicáveis
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {section.standards.map(std => (
                        <Badge key={std} variant="outline">{std}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Key Items */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Itens Chave de Verificação
                    </h4>
                    <ScrollArea className="h-[150px]">
                      <ul className="space-y-2">
                        {section.keyItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/30">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Section Weights Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ponderação por Seção</CardTitle>
          <CardDescription>
            Metodologia de cálculo do score geral conforme IMCA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AUDIT_SECTIONS.map(section => {
              const score = sectionScores[section.code] || { compliant: 0, total: 0 };
              const sectionScore = score.total > 0 
                ? Math.round((score.compliant / score.total) * 100) 
                : 0;
              const contribution = Math.round(sectionScore * section.weight);

              return (
                <div key={section.code} className="flex items-center gap-4">
                  <div className="w-48 flex items-center gap-2">
                    {section.icon}
                    <span className="text-sm font-medium">{section.name}</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={sectionScore} className="h-2" />
                  </div>
                  <div className="w-20 text-right">
                    <span className={`font-bold ${getScoreColor(sectionScore)}`}>{sectionScore}%</span>
                  </div>
                  <div className="w-16 text-right text-muted-foreground">
                    x{(section.weight * 100)}%
                  </div>
                  <div className="w-16 text-right font-medium">
                    = {contribution}pts
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { AUDIT_SECTIONS };
