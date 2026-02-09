/**
 * Crew Reports Panel - Report generation and export
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, Calendar, Users, TrendingUp, Clock, CheckCircle2, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  status: string;
  experience_years?: number;
}

interface CrewAssignment {
  id: string;
  crew_member_name: string;
  vessel_name: string;
  position: string;
  start_date: string;
  end_date?: string;
  status: string;
}

interface CrewReportsPanelProps {
  crewMembers: CrewMember[];
  assignments: CrewAssignment[];
}

type ReportType = "availability" | "assignments" | "certifications" | "performance";

export const CrewReportsPanel: React.FC<CrewReportsPanelProps> = ({ crewMembers, assignments }) => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<ReportType>("availability");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<{ id: string; type: string; date: string; status: string }[]>([]);

  const reportTypes = [
    { value: "availability", label: "Disponibilidade", icon: Users, description: "Status atual da tripulação" },
    { value: "assignments", label: "Escalas", icon: Calendar, description: "Histórico de designações" },
    { value: "certifications", label: "Certificações", icon: CheckCircle2, description: "Validade das certificações" },
    { value: "performance", label: "Performance", icon: TrendingUp, description: "Métricas de desempenho" }
  ];

  const stats = {
    totalCrew: crewMembers.length,
    available: crewMembers.filter(m => m.status === "available").length,
    activeAssignments: assignments.filter(a => a.status === "active").length,
    avgExperience: crewMembers.reduce((sum, m) => sum + (m.experience_years || 0), 0) / crewMembers.length || 0
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    const report = {
      id: `report-${Date.now()}`,
      type: selectedReport,
      date: new Date().toISOString(),
      status: "completed"
    };
    
    setGeneratedReports(prev => [report, ...prev]);
    setIsGenerating(false);
    
    toast({ 
      title: "✅ Relatório gerado", 
      description: `Relatório de ${reportTypes.find(r => r.value === selectedReport)?.label} pronto para download` 
    });
  };

  const handleDownload = (reportId: string) => {
    const report = generatedReports.find(r => r.id === reportId);
    if (!report) return;

    // Generate CSV content based on report type
    let content = "";
    let filename = "";

    if (report.type === "availability") {
      content = "Nome,Cargo,Status,Experiência (anos)\n";
      content += crewMembers.map(m => `${m.full_name},${m.position},${m.status},${m.experience_years || 0}`).join("\n");
      filename = "tripulacao-disponibilidade.csv";
    } else if (report.type === "assignments") {
      content = "Tripulante,Embarcação,Cargo,Início,Fim,Status\n";
      content += assignments.map(a => `${a.crew_member_name},${a.vessel_name},${a.position},${a.start_date},${a.end_date || "Em aberto"},${a.status}`).join("\n");
      filename = "escalas-tripulacao.csv";
    } else {
      content = "Relatório,Data,Status\n";
      content += `${report.type},${report.date},${report.status}`;
      filename = `relatorio-${report.type}.csv`;
    }

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    
    toast({ title: "Download iniciado" });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.totalCrew}</div>
            <div className="text-sm text-muted-foreground">Total Tripulantes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.available}</div>
            <div className="text-sm text-muted-foreground">Disponíveis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.activeAssignments}</div>
            <div className="text-sm text-muted-foreground">Escalas Ativas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.avgExperience.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Média Anos Exp.</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Gerador de Relatórios
          </CardTitle>
          <CardDescription>Selecione o tipo de relatório e gere documentos detalhados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Tipo de Relatório</h4>
              <div className="space-y-2">
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  return (
                    <div
                      key={report.value}
                      onClick={() => setSelectedReport(report.value as ReportType)}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-colors
                        ${selectedReport === report.value ? "border-primary bg-primary/5" : "hover:bg-accent"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{report.label}</p>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Relatórios Gerados</h4>
              {generatedReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum relatório gerado</p>
                  <p className="text-sm">Selecione um tipo e clique em gerar</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {generatedReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium capitalize">{report.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(report.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
