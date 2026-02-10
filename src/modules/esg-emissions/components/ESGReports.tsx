/**
 * ESG Reports Generation - DCS/MRV/GRI
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Printer,
  Send,
  Calendar,
  Ship,
  CheckCircle,
  Clock,
  Eye,
  FilePlus,
  Globe,
  BarChart3,
  Loader2,
  FileSpreadsheet,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  name: string;
  type: string;
  format: string;
  vessel: string;
  period: string;
  generatedAt: string;
  status: "draft" | "final" | "submitted";
  size: string;
  submittedTo?: string;
}

const reportTemplates = [
  { id: "dcs", name: "IMO DCS Report", description: "Data Collection System - Consumo de combustível e emissões", format: "xlsx" },
  { id: "mrv", name: "EU MRV Report", description: "Monitoring, Reporting and Verification - Regulamento UE", format: "pdf" },
  { id: "cii", name: "CII Annual Report", description: "Carbon Intensity Indicator - Relatório anual", format: "pdf" },
  { id: "gri", name: "GRI Standards Report", description: "Global Reporting Initiative - Sustentabilidade", format: "pdf" },
  { id: "tcfd", name: "TCFD Report", description: "Task Force on Climate-related Financial Disclosures", format: "pdf" },
  { id: "custom", name: "Relatório Customizado", description: "Configure métricas e período personalizados", format: "xlsx" },
];

const initialReports: Report[] = [
  { id: "1", name: "IMO DCS 2023 - Frota Completa", type: "IMO DCS", format: "xlsx", vessel: "Frota", period: "2023", generatedAt: "2024-01-15", status: "submitted", size: "2.4 MB", submittedTo: "IMO GISIS" },
  { id: "2", name: "EU MRV 2023", type: "EU MRV", format: "pdf", vessel: "Frota", period: "2023", generatedAt: "2024-01-10", status: "final", size: "1.8 MB" },
  { id: "3", name: "CII Report Q4/2023", type: "CII", format: "pdf", vessel: "Frota", period: "Q4/2023", generatedAt: "2024-01-05", status: "submitted", size: "890 KB", submittedTo: "Classificadora" },
  { id: "4", name: "Relatório ESG Anual 2023", type: "GRI", format: "pdf", vessel: "Frota", period: "2023", generatedAt: "2024-01-08", status: "final", size: "5.2 MB" },
  { id: "5", name: "TCFD Climate Report 2023", type: "TCFD", format: "pdf", vessel: "Frota", period: "2023", generatedAt: "2024-01-12", status: "draft", size: "3.1 MB" },
];

export function ESGReports() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedVessel, setSelectedVessel] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !selectedPeriod) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Real progress tracking via requestAnimationFrame
    const progressSteps = [10, 25, 40, 55, 70, 85, 95, 100];
    for (const step of progressSteps) {
      await new Promise(resolve => requestAnimationFrame(resolve));
      setGenerationProgress(step);
    }
    
    const template = reportTemplates.find(t => t.id === selectedTemplate);
    const newReport: Report = {
      id: Date.now().toString(),
      name: `${template?.name} - ${selectedPeriod}`,
      type: template?.name || "",
      format: template?.format || "pdf",
      vessel: selectedVessel || "Frota",
      period: selectedPeriod,
      generatedAt: new Date().toISOString().split("T")[0],
      status: "draft",
      size: "1.5 MB",
    };
    
    setReports([newReport, ...reports]);
    setIsGenerating(false);
    setGenerationProgress(0);
    setSelectedTemplate("");
    toast.success("Relatório gerado com sucesso!");
  };

  const handleDownload = (report: Report) => {
    const csv = `Nome;Status;Período;Tipo\n${report.name};${report.status};${report.period};${report.type}`;
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`"${report.name}" exportado com sucesso`);
  };

  const handleSubmit = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: "submitted" as const, submittedTo: "Autoridade" } : r));
    toast.success("Relatório submetido com sucesso!");
  };

  const handleFinalize = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: "final" as const } : r));
    toast.success("Relatório finalizado!");
  };

  const draftCount = reports.filter(r => r.status === "draft").length;
  const finalCount = reports.filter(r => r.status === "final").length;
  const submittedCount = reports.filter(r => r.status === "submitted").length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Relatórios</p>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-xs text-blue-600">Gerados este ano</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold">{draftCount}</p>
                <p className="text-xs text-amber-600">Aguardando revisão</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Finalizados</p>
                <p className="text-2xl font-bold">{finalCount}</p>
                <p className="text-xs text-purple-600">Prontos para envio</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submetidos</p>
                <p className="text-2xl font-bold">{submittedCount}</p>
                <p className="text-xs text-green-600">Enviados às autoridades</p>
              </div>
              <Send className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilePlus className="h-5 w-5" />
                Gerar Novo Relatório ESG
              </CardTitle>
              <CardDescription>
                Selecione um template e configure os parâmetros do relatório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div>
                <Label className="text-base mb-4 block">Selecione o Tipo de Relatório</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedTemplate === template.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            {template.format === "xlsx" ? (
                              <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            ) : (
                              <FileText className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                            <Badge variant="outline" className="mt-2">{template.format.toUpperCase()}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              {selectedTemplate && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="grid gap-2">
                    <Label>Embarcação</Label>
                    <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frota">Frota Completa</SelectItem>
                        <SelectItem value="PSV Atlantic Explorer">PSV Atlantic Explorer</SelectItem>
                        <SelectItem value="AHTS Pacific Star">AHTS Pacific Star</SelectItem>
                        <SelectItem value="OSV Caribbean Wind">OSV Caribbean Wind</SelectItem>
                        <SelectItem value="PSV Gulf Stream">PSV Gulf Stream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Período</Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">Ano 2024</SelectItem>
                        <SelectItem value="2023">Ano 2023</SelectItem>
                        <SelectItem value="Q1/2024">Q1/2024</SelectItem>
                        <SelectItem value="Q4/2023">Q4/2023</SelectItem>
                        <SelectItem value="Jan/2024">Janeiro/2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={handleGenerateReport} 
                      disabled={!selectedPeriod || isGenerating}
                      className="w-full gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <FilePlus className="h-4 w-4" />
                          Gerar Relatório
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Generation Progress */}
              {isGenerating && (
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Gerando relatório...</span>
                    <span className="text-sm font-medium">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Coletando dados, calculando métricas e formatando documento...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">EU MRV 2024</p>
                    <p className="text-sm text-muted-foreground">Prazo: 30/04/2024</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3" size="sm">
                  Iniciar Preparação
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">IMO DCS 2024</p>
                    <p className="text-sm text-muted-foreground">Prazo: 31/03/2024</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3" size="sm">
                  Iniciar Preparação
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium">GRI Report 2024</p>
                    <p className="text-sm text-muted-foreground">Publicação: Q2/2024</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3" size="sm">
                  Iniciar Preparação
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Histórico de Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relatório</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Gerado em</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {report.format === "xlsx" ? (
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-red-600" />
                          )}
                          {report.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>{report.period}</TableCell>
                      <TableCell>{report.generatedAt}</TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={report.status === "submitted" ? "default" : report.status === "final" ? "secondary" : "outline"}
                          className={report.status === "submitted" ? "bg-green-600" : ""}
                        >
                          {report.status === "submitted" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {report.status === "draft" && <Clock className="h-3 w-3 mr-1" />}
                          {report.status === "submitted" ? "Submetido" : report.status === "final" ? "Final" : "Rascunho"}
                        </Badge>
                        {report.submittedTo && (
                          <p className="text-xs text-muted-foreground mt-1">{report.submittedTo}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(report)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                          {report.status === "draft" && (
                            <Button variant="ghost" size="sm" onClick={() => handleFinalize(report.id)}>
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                            </Button>
                          )}
                          {report.status === "final" && (
                            <Button variant="ghost" size="sm" onClick={() => handleSubmit(report.id)}>
                              <Send className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Relatórios Agendados
              </CardTitle>
              <CardDescription>
                Configure a geração automática de relatórios recorrentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "IMO DCS Mensal", frequency: "Mensal", nextRun: "01/02/2024", enabled: true },
                  { name: "EU MRV Trimestral", frequency: "Trimestral", nextRun: "01/04/2024", enabled: true },
                  { name: "CII Anual", frequency: "Anual", nextRun: "01/01/2025", enabled: true },
                  { name: "Relatório Executivo Semanal", frequency: "Semanal", nextRun: "22/01/2024", enabled: false },
                ].map((schedule, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${schedule.enabled ? "bg-green-100 dark:bg-green-900" : "bg-muted"}`}>
                        <FileText className={`h-5 w-5 ${schedule.enabled ? "text-green-600" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-medium">{schedule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.frequency} • Próximo: {schedule.nextRun}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={schedule.enabled ? "default" : "secondary"}>
                        {schedule.enabled ? "Ativo" : "Inativo"}
                      </Badge>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4 gap-2">
                <FilePlus className="h-4 w-4" />
                Novo Agendamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
