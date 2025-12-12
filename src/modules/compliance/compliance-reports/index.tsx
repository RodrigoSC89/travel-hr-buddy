import { useEffect, useState, useCallback } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Calendar, Clock, Filter, Send, FileJson, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  return { jsPDF, autoTable: autoTableModule.default };
};

let XLSX: unknown = null;
const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import("xlsx");
  }
  return XLSX;
};
import { format } from "date-fns";

// PATCH 392 - Compliance Reports: Advanced Filtering & Multi-Format Export
const ComplianceReports = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [reportConfig, setReportConfig] = useState({
    title: "",
    template: "",
    format: "pdf",
    schedule: "manual",
    categories: [] as string[],
    severities: [] as string[],
    dateFrom: "",
    dateTo: ""
  };

  const [reports, setReports] = useState([
    {
      id: "1",
      title: "Relatório Mensal SGSO",
      template: "SGSO Compliance",
      format: "pdf",
      status: "completed",
      generated_at: "2025-01-15T10:00:00",
      scheduled: false
    },
    {
      id: "2",
      title: "Auditoria Trimestral",
      template: "Full Audit",
      format: "excel",
      status: "scheduled",
      generated_at: "2025-01-20T09:00:00",
      scheduled: true,
      next_run: "2025-02-01"
    }
  ]);

  // 7 report templates as per PATCH 392
  const templates = [
    "SGSO Compliance",
    "Full Audit",
    "Environmental Report",
    "Safety Metrics",
    "Training Summary",
    "Incident Report",
    "Vessel Compliance"
  ];

  // 7 categories for filtering
  const categories = [
    "Safety",
    "Environmental",
    "Training",
    "Documentation",
    "Equipment",
    "Personnel",
    "Operations"
  ];

  // 4 severity levels
  const severities = ["low", "medium", "high", "critical"];

  // Fetch compliance data from Supabase
  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      let query = supabase.from("compliance_items" as unknown).select("*");
      
      // Apply filters if any
      if (reportConfig.categories?.length > 0) {
        query = query.in("category", reportConfig.categories);
      }
      if (reportConfig.severities?.length > 0) {
        query = query.in("severity", reportConfig.severities);
      }
      if (reportConfig.dateFrom) {
        query = query.gte("created_at", reportConfig.dateFrom);
      }
      if (reportConfig.dateTo) {
        query = query.lte("created_at", reportConfig.dateTo);
      }

      const { data, error } = await query;
      
      if (error) {
        // Use mock data if table doesn't exist
        setComplianceData([
          { id: 1, category: "Safety", severity: "high", status: "open", title: "Safety inspection pending", created_at: new Date().toISOString() },
          { id: 2, category: "Environmental", severity: "medium", status: "closed", title: "Environmental audit completed", created_at: new Date().toISOString() }
        ]);
      } else {
        setComplianceData(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      console.error("Error:", error);
      // Use mock data on error
      setComplianceData([
        { id: 1, category: "Safety", severity: "high", status: "open", title: "Safety inspection pending", created_at: new Date().toISOString() },
        { id: 2, category: "Environmental", severity: "medium", status: "closed", title: "Environmental audit completed", created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // PDF Export using jsPDF
  const exportToPDF = async (data: unknown[]) => {
    try {
      const { jsPDF, autoTable } = await loadJsPDF();
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(reportConfig.title || "Compliance Report", 14, 22);
      
      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);
      doc.text(`Template: ${reportConfig.template}`, 14, 36);
      
      // Prepare table data
      const tableData = data.map(item => [
        item.id || "N/A",
        item.category || "N/A",
        item.severity || "N/A",
        item.status || "N/A",
        item.title || "N/A",
        item.created_at ? format(new Date(item.created_at), "dd/MM/yyyy") : "N/A"
      ]);
      
      // Add table using autoTable
      autoTable(doc, {
        head: [["ID", "Category", "Severity", "Status", "Title", "Date"]],
        body: tableData,
        startY: 42,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      };
      
      // Save the PDF
      doc.save(`${reportConfig.title || "compliance-report"}.pdf`);
      
      toast({
        title: "PDF gerado",
        description: "Download iniciado automaticamente"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  // CSV Export with Excel compatibility
  const exportToCSV = (data: unknown[]) => {
    try {
      const headers = ["ID", "Category", "Severity", "Status", "Title", "Date"];
      const rows = data.map(item => [
        item.id || "",
        item.category || "",
        item.severity || "",
        item.status || "",
        (item.title || "").replace(/"/g, "\"\""), // Escape quotes
        item.created_at ? format(new Date(item.created_at), "dd/MM/yyyy") : ""
      ]);
      
      // PATCH 540: Otimização - pré-processar linhas CSV
      const csvRows = rows.map(row => row.map(cell => `"${cell}"`).join(","));
      const csvContent = [headers.join(","), ...csvRows].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${reportConfig.title || "compliance-report"}.csv`;
      link.click();
      
      toast({
        title: "CSV gerado",
        description: "Download iniciado automaticamente"
      };
    } catch (error) {
      console.error("Error generating CSV:", error);
      console.error("Error generating CSV:", error);
      toast({
        title: "Erro ao gerar CSV",
        description: "Tente novamente",
        variant: "destructive"
      };
    }
  };

  // Excel Export using xlsx
  const exportToExcel = (data: unknown[]) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
        "ID": item.id,
        "Category": item.category,
        "Severity": item.severity,
        "Status": item.status,
        "Title": item.title,
        "Date": item.created_at ? format(new Date(item.created_at), "dd/MM/yyyy") : ""
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Compliance Data");
      
      XLSX.writeFile(workbook, `${reportConfig.title || "compliance-report"}.xlsx`);
      
      toast({
        title: "Excel gerado",
        description: "Download iniciado automaticamente"
      };
    } catch (error) {
      console.error("Error generating Excel:", error);
      console.error("Error generating Excel:", error);
      toast({
        title: "Erro ao gerar Excel",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  // JSON Export with metadata
  const exportToJSON = (data: unknown[]) => {
    try {
      const jsonData = {
        metadata: {
          title: reportConfig.title,
          template: reportConfig.template,
          generated_at: new Date().toISOString(),
          filters: {
            categories: reportConfig.categories,
            severities: reportConfig.severities,
            dateFrom: reportConfig.dateFrom,
            dateTo: reportConfig.dateTo
          },
          total_records: data.length
        },
        data: data
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${reportConfig.title || "compliance-report"}.json`;
      link.click();
      
      toast({
        title: "JSON gerado",
        description: "Download iniciado automaticamente"
      });
    } catch (error) {
      console.error("Error generating JSON:", error);
      console.error("Error generating JSON:", error);
      toast({
        title: "Erro ao gerar JSON",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleCreateReport = async () => {
    if (!reportConfig.title || !reportConfig.template) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e template",
        variant: "destructive"
      };
      return;
    }

    // Fetch data with filters
    await fetchComplianceData();

    const report = {
      id: Date.now().toString(),
      ...reportConfig,
      status: reportConfig.schedule === "manual" ? "pending" : "scheduled",
      generated_at: new Date().toISOString(),
      scheduled: reportConfig.schedule !== "manual",
      next_run: reportConfig.schedule !== "manual" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : undefined
    };

    setReports([report, ...reports]);
    setShowForm(false);
    
    toast({
      title: "Relatório configurado",
      description: report.scheduled ? "Será gerado automaticamente" : "Iniciando geração"
    });

    // If manual, generate immediately
    if (reportConfig.schedule === "manual") {
      setTimeout(() => handleGenerateReport(report.id), 1000);
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: "generating" } : r
    ));

    // Simulate report generation
    setTimeout(() => {
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: "completed", generated_at: new Date().toISOString() } : r
      ));
      toast({
        title: "Relatório gerado",
        description: "Disponível para download"
      };
    }, 2000);
  };

  const handleDownload = (report: unknown) => {
    // Export based on format
    if (report.format === "pdf") {
      exportToPDF(complianceData);
    } else if (report.format === "csv") {
      exportToCSV(complianceData);
    } else if (report.format === "excel") {
      exportToExcel(complianceData);
    } else if (report.format === "json") {
      exportToJSON(complianceData);
    }
  };

  const handleGenerateNow = (reportId: string) => {
    handleGenerateReport(reportId);
  };

  const toggleCategory = (category: string) => {
    setReportConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleSeverity = (severity: string) => {
    setReportConfig(prev => ({
      ...prev,
      severities: prev.severities.includes(severity)
        ? prev.severities.filter(s => s !== severity)
        : [...prev.severities, severity]
    }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500",
      generating: "bg-blue-500",
      scheduled: "bg-amber-500",
      pending: "bg-muted",
      error: "bg-destructive"
    };
    return colors[status] || "bg-muted";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      completed: "Concluído",
      generating: "Gerando",
      scheduled: "Agendado",
      pending: "Pendente",
      error: "Erro"
    };
    return texts[status] || status;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Compliance Reports</h1>
            <p className="text-muted-foreground">Geração e gerenciamento de relatórios de compliance</p>
          </div>
        </div>
        <Button onClick={handleSetShowForm}>
          <FileText className="mr-2 h-4 w-4" />
          Novo Relatório
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.scheduled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de criação com filtros avançados */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Novo Relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título do Relatório</Label>
              <Input
                value={reportConfig.title}
                onChange={handleChange})}
                placeholder="Ex: Relatório Mensal de Compliance"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template</Label>
                <Select 
                  value={reportConfig.template} 
                  onValueChange={(v) => setReportConfig({ ...reportConfig, template: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Formato</Label>
                <Select 
                  value={reportConfig.format} 
                  onValueChange={(v) => setReportConfig({ ...reportConfig, format: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Agendamento</Label>
              <Select 
                value={reportConfig.schedule} 
                onValueChange={(v) => setReportConfig({ ...reportConfig, schedule: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters - PATCH 392 */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base">Filtros Avançados</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSetShowFilters}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Ocultar" : "Mostrar"} Filtros
                </Button>
              </div>

              {showFilters && (
                <div className="space-y-4">
                  {/* Category Filters */}
                  <div>
                    <Label className="text-sm mb-2 block">Categorias</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cat-${category}`}
                            checked={reportConfig.categories.includes(category)}
                            onCheckedChange={() => toggleCategory(category}
                          />
                          <label
                            htmlFor={`cat-${category}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Severity Filters */}
                  <div>
                    <Label className="text-sm mb-2 block">Níveis de Severidade</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {severities.map((severity) => (
                        <div key={severity} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sev-${severity}`}
                            checked={reportConfig.severities.includes(severity)}
                            onCheckedChange={() => toggleSeverity(severity}
                          />
                          <label
                            htmlFor={`sev-${severity}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                          >
                            {severity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Filters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Data Início</Label>
                      <Input
                        type="date"
                        value={reportConfig.dateFrom}
                        onChange={handleChange})}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Data Fim</Label>
                      <Input
                        type="date"
                        value={reportConfig.dateTo}
                        onChange={handleChange})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateReport} disabled={loading}>
                {loading ? "Processando..." : "Criar Relatório"}
              </Button>
              <Button variant="outline" onClick={handleSetShowForm}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{report.title}</h3>
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusText(report.status)}
                    </Badge>
                    {report.scheduled && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Agendado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Template: {report.template}</span>
                    <span>Formato: {report.format.toUpperCase()}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(report.generated_at).toLocaleDateString("pt-BR")}
                    </span>
                    {report.next_run && (
                      <span>Próxima: {new Date(report.next_run).toLocaleDateString("pt-BR")}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.status === "scheduled" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlehandleGenerateNow}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Gerar Agora
                    </Button>
                  )}
                  {report.status === "completed" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlehandleDownload}
                    >
                      {report.format === "pdf" && <FileText className="mr-2 h-4 w-4" />}
                      {report.format === "excel" && <FileSpreadsheet className="mr-2 h-4 w-4" />}
                      {report.format === "csv" && <FileSpreadsheet className="mr-2 h-4 w-4" />}
                      {report.format === "json" && <FileJson className="mr-2 h-4 w-4" />}
                      Download {report.format.toUpperCase()}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default ComplianceReports;
