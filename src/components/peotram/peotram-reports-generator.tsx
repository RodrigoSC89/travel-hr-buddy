import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Download,
  Eye,
  BarChart3,
  PieChart,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Settings,
  Mail,
  Printer,
  Share2,
  Clock,
  Target,
} from "lucide-react";

interface ReportConfig {
  type: "audit" | "compliance" | "dashboard" | "non-conformities" | "performance";
  format: "pdf" | "excel" | "word" | "html";
  period: string;
  auditType: "all" | "vessel" | "shore";
  includeCharts: boolean;
  includeEvidence: boolean;
  includeRecommendations: boolean;
  sections: string[];
  recipients?: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportConfig["type"];
  icon: React.ElementType;
  sections: Array<{
    id: string;
    name: string;
    description: string;
    required: boolean;
  }>;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "audit-complete",
    name: "Relatório Completo de Auditoria PEOTRAM",
    description: "Relatório detalhado com todos os elementos, evidências e não conformidades",
    type: "audit",
    icon: FileCheck,
    sections: [
      {
        id: "cover",
        name: "Capa e Identificação",
        description: "Informações básicas da auditoria",
        required: true,
      },
      {
        id: "executive-summary",
        name: "Sumário Executivo",
        description: "Resumo dos principais achados",
        required: true,
      },
      {
        id: "audit-scope",
        name: "Escopo e Metodologia",
        description: "Detalhes do escopo e método de auditoria",
        required: true,
      },
      {
        id: "elements-evaluation",
        name: "Avaliação por Elementos",
        description: "Análise detalhada dos 10 elementos PEOTRAM",
        required: true,
      },
      {
        id: "non-conformities",
        name: "Não Conformidades",
        description: "Lista e classificação das não conformidades",
        required: true,
      },
      {
        id: "evidence",
        name: "Evidências Coletadas",
        description: "Documentos e registros verificados",
        required: false,
      },
      {
        id: "recommendations",
        name: "Recomendações",
        description: "Sugestões de melhoria",
        required: false,
      },
      {
        id: "action-plan",
        name: "Plano de Ação",
        description: "Cronograma de correções",
        required: false,
      },
    ],
  },
  {
    id: "compliance-dashboard",
    name: "Dashboard de Conformidade",
    description: "Indicadores visuais de performance e conformidade",
    type: "compliance",
    icon: BarChart3,
    sections: [
      {
        id: "kpis",
        name: "Indicadores Chave",
        description: "KPIs de conformidade e performance",
        required: true,
      },
      {
        id: "trends",
        name: "Tendências",
        description: "Gráficos de evolução temporal",
        required: true,
      },
      {
        id: "benchmarks",
        name: "Benchmarks",
        description: "Comparação com metas e padrões",
        required: false,
      },
      {
        id: "risk-matrix",
        name: "Matriz de Riscos",
        description: "Visualização de riscos por criticidade",
        required: false,
      },
    ],
  },
  {
    id: "performance-analysis",
    name: "Análise de Performance",
    description: "Relatório de performance operacional e indicadores TASO/IDEMB",
    type: "performance",
    icon: TrendingUp,
    sections: [
      {
        id: "taso-analysis",
        name: "Análise TASO",
        description: "Taxa de Acidentes de Segurança Operacional",
        required: true,
      },
      {
        id: "idemb-analysis",
        name: "Análise IDEMB",
        description: "Índice de Disponibilidade de Embarcação",
        required: true,
      },
      {
        id: "efficiency",
        name: "Eficiência Energética",
        description: "Métricas de consumo e emissões",
        required: false,
      },
      {
        id: "innovation",
        name: "Inovação",
        description: "Práticas inovadoras implementadas",
        required: false,
      },
    ],
  },
  {
    id: "nc-detailed",
    name: "Relatório Detalhado de Não Conformidades",
    description: "Análise detalhada das não conformidades e ações corretivas",
    type: "non-conformities",
    icon: AlertTriangle,
    sections: [
      {
        id: "nc-summary",
        name: "Resumo das NC",
        description: "Estatísticas gerais das não conformidades",
        required: true,
      },
      {
        id: "nc-classification",
        name: "Classificação por Criticidade",
        description: "Distribuição por níveis de criticidade",
        required: true,
      },
      {
        id: "nc-root-cause",
        name: "Análise de Causa Raiz",
        description: "Investigação das causas fundamentais",
        required: false,
      },
      {
        id: "corrective-actions",
        name: "Ações Corretivas",
        description: "Planos de correção e prazos",
        required: true,
      },
      {
        id: "effectiveness",
        name: "Eficácia das Ações",
        description: "Acompanhamento da eficácia",
        required: false,
      },
    ],
  },
];

export const PeotramReportsGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: "audit",
    format: "pdf",
    period: "2024-Q4",
    auditType: "all",
    includeCharts: true,
    includeEvidence: false,
    includeRecommendations: true,
    sections: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const template = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setReportConfig(prev => ({
        ...prev,
        type: template.type,
        sections: template.sections.filter(s => s.required).map(s => s.id),
      }));
    }
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    setReportConfig(prev => ({
      ...prev,
      sections: checked
        ? [...prev.sections, sectionId]
        : prev.sections.filter(id => id !== sectionId),
    }));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simular geração do relatório
    const steps = [
      "Coletando dados da auditoria...",
      "Processando indicadores...",
      "Gerando gráficos e tabelas...",
      "Compilando evidências...",
      "Formatando documento...",
      "Finalizando relatório...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(((i + 1) / steps.length) * 100);
    }

    setIsGenerating(false);

    // Simular download
    const blob = new Blob(["Relatório PEOTRAM gerado"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-peotram-${reportConfig.period}.${reportConfig.format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scheduleReport = () => {
    alert("Funcionalidade de agendamento de relatórios será implementada em breve.");
  };

  const previewReport = () => {
    alert("Visualização do relatório será implementada em breve.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerador de Relatórios PEOTRAM</h2>
          <p className="text-muted-foreground">
            Crie relatórios personalizados de auditoria e conformidade
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={scheduleReport}>
            <Clock className="w-4 h-4 mr-2" />
            Agendar
          </Button>
          <Button variant="outline" onClick={previewReport} disabled={!selectedTemplate}>
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Templates de Relatório
              </CardTitle>
              <CardDescription>Escolha um template base para seu relatório</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {REPORT_TEMPLATES.map(template => {
                const TemplateIcon = template.icon;
                return (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-start gap-3">
                      <TemplateIcon
                        className={`w-5 h-5 mt-1 ${
                          selectedTemplate === template.id
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auditorias Completas</span>
                <Badge variant="outline">18</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Não Conformidades</span>
                <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                  12
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Score Médio</span>
                <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                  87.5%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuração do Relatório
              </CardTitle>
              <CardDescription>Configure os parâmetros e seções do relatório</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedTemplate && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Selecione um template de relatório para começar a configuração.
                  </AlertDescription>
                </Alert>
              )}

              {selectedTemplate && (
                <>
                  {/* Basic Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="format">Formato do Arquivo</Label>
                      <Select
                        value={reportConfig.format}
                        onValueChange={(value: any) =>
                          setReportConfig(prev => ({ ...prev, format: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              PDF
                            </div>
                          </SelectItem>
                          <SelectItem value="excel">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              Excel
                            </div>
                          </SelectItem>
                          <SelectItem value="word">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Word
                            </div>
                          </SelectItem>
                          <SelectItem value="html">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              HTML
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="period">Período</Label>
                      <Select
                        value={reportConfig.period}
                        onValueChange={value =>
                          setReportConfig(prev => ({ ...prev, period: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-Q4">2024 - Q4</SelectItem>
                          <SelectItem value="2024-Q3">2024 - Q3</SelectItem>
                          <SelectItem value="2024-Q2">2024 - Q2</SelectItem>
                          <SelectItem value="2024-Q1">2024 - Q1</SelectItem>
                          <SelectItem value="2024">2024 (Ano Completo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auditType">Tipo de Auditoria</Label>
                      <Select
                        value={reportConfig.auditType}
                        onValueChange={(value: any) =>
                          setReportConfig(prev => ({ ...prev, auditType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="vessel">Embarcações</SelectItem>
                          <SelectItem value="shore">Base Terrestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Content Options */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Opções de Conteúdo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeCharts"
                          checked={reportConfig.includeCharts}
                          onCheckedChange={checked =>
                            setReportConfig(prev => ({
                              ...prev,
                              includeCharts: checked as boolean,
                            }))
                          }
                        />
                        <Label htmlFor="includeCharts">Incluir gráficos e tabelas</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeEvidence"
                          checked={reportConfig.includeEvidence}
                          onCheckedChange={checked =>
                            setReportConfig(prev => ({
                              ...prev,
                              includeEvidence: checked as boolean,
                            }))
                          }
                        />
                        <Label htmlFor="includeEvidence">Incluir evidências coletadas</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeRecommendations"
                          checked={reportConfig.includeRecommendations}
                          onCheckedChange={checked =>
                            setReportConfig(prev => ({
                              ...prev,
                              includeRecommendations: checked as boolean,
                            }))
                          }
                        />
                        <Label htmlFor="includeRecommendations">Incluir recomendações</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Sections Selection */}
                  {template && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Seções do Relatório</h4>
                      <div className="space-y-3">
                        {template.sections.map(section => (
                          <div key={section.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={section.id}
                              checked={reportConfig.sections.includes(section.id)}
                              onCheckedChange={checked =>
                                handleSectionToggle(section.id, checked as boolean)
                              }
                              disabled={section.required}
                            />
                            <div className="flex-1">
                              <Label htmlFor={section.id} className="font-medium">
                                {section.name}
                                {section.required && (
                                  <span className="text-destructive ml-1">*</span>
                                )}
                              </Label>
                              <p className="text-sm text-muted-foreground">{section.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Generation Progress */}
                  {isGenerating && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Gerando Relatório...</h4>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(generationProgress)}%
                        </span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {reportConfig.sections.length} seções selecionadas
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={previewReport} disabled={isGenerating}>
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>

                      <Button
                        onClick={generateReport}
                        disabled={isGenerating || reportConfig.sections.length === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isGenerating ? "Gerando..." : "Gerar Relatório"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Relatórios Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: "Relatório Auditoria Q4 2024",
                    date: "2024-12-20",
                    format: "PDF",
                    size: "2.3 MB",
                  },
                  {
                    name: "Dashboard Conformidade Nov 2024",
                    date: "2024-12-18",
                    format: "Excel",
                    size: "1.8 MB",
                  },
                  {
                    name: "Análise Não Conformidades Q4",
                    date: "2024-12-15",
                    format: "Word",
                    size: "3.1 MB",
                  },
                ].map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.date} • {report.format} • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
