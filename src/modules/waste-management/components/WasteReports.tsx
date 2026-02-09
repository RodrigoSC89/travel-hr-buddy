/**
 * Relatórios MARPOL e Certificados - Waste Management
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  FileSpreadsheet,
  FilePlus,
  AlertTriangle,
  Award,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  name: string;
  type: string;
  vessel: string;
  period: string;
  generatedAt: string;
  status: "draft" | "final" | "submitted";
  size: string;
}

interface Certificate {
  id: string;
  name: string;
  type: string;
  vessel: string;
  issuedAt: string;
  expiresAt: string;
  issuedBy: string;
  status: "valid" | "expiring" | "expired";
}

const initialReports: Report[] = [
  { id: "1", name: "Oil Record Book - Janeiro 2024", type: "Oil Record Book", vessel: "PSV Atlantic Explorer", period: "Jan/2024", generatedAt: "2024-01-31", status: "submitted", size: "1.2 MB" },
  { id: "2", name: "Garbage Record Book - Janeiro 2024", type: "Garbage Record Book", vessel: "PSV Atlantic Explorer", period: "Jan/2024", generatedAt: "2024-01-31", status: "final", size: "890 KB" },
  { id: "3", name: "Relatório Mensal MARPOL - Dez 2023", type: "Relatório MARPOL", vessel: "AHTS Pacific Star", period: "Dez/2023", generatedAt: "2024-01-05", status: "submitted", size: "2.1 MB" },
  { id: "4", name: "Resumo Anual de Resíduos 2023", type: "Resumo Anual", vessel: "Frota Completa", period: "2023", generatedAt: "2024-01-10", status: "final", size: "5.4 MB" },
  { id: "5", name: "Oil Record Book - Fevereiro 2024", type: "Oil Record Book", vessel: "PSV Atlantic Explorer", period: "Fev/2024", generatedAt: "-", status: "draft", size: "-" },
];

const initialCertificates: Certificate[] = [
  { id: "1", name: "IOPP Certificate", type: "MARPOL Anexo I", vessel: "PSV Atlantic Explorer", issuedAt: "2023-06-15", expiresAt: "2028-06-14", issuedBy: "ANTAQ", status: "valid" },
  { id: "2", name: "Sewage Certificate", type: "MARPOL Anexo IV", vessel: "PSV Atlantic Explorer", issuedAt: "2023-06-15", expiresAt: "2028-06-14", issuedBy: "ANTAQ", status: "valid" },
  { id: "3", name: "Garbage Management Plan", type: "MARPOL Anexo V", vessel: "PSV Atlantic Explorer", issuedAt: "2023-01-20", expiresAt: "2024-01-19", issuedBy: "DNV", status: "expired" },
  { id: "4", name: "IOPP Certificate", type: "MARPOL Anexo I", vessel: "AHTS Pacific Star", issuedAt: "2022-09-10", expiresAt: "2027-09-09", issuedBy: "ANTAQ", status: "valid" },
  { id: "5", name: "ISPP Certificate", type: "MARPOL Anexo IV", vessel: "OSV Caribbean Wind", issuedAt: "2023-03-01", expiresAt: "2024-03-01", issuedBy: "ABS", status: "expiring" },
];

const reportTemplates = [
  { id: "orb", name: "Oil Record Book", description: "Livro de registro de óleo - MARPOL Anexo I" },
  { id: "grb", name: "Garbage Record Book", description: "Livro de registro de resíduos - MARPOL Anexo V" },
  { id: "monthly", name: "Relatório Mensal MARPOL", description: "Consolidado mensal de operações" },
  { id: "annual", name: "Resumo Anual", description: "Relatório anual de gestão de resíduos" },
  { id: "audit", name: "Relatório de Auditoria", description: "Preparação para auditoria MARPOL" },
];

export function WasteReports() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [certificates] = useState<Certificate[]>(initialCertificates);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedVessel, setSelectedVessel] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      const template = reportTemplates.find(t => t.id === selectedTemplate);
      
      const { error } = await supabase.from("ai_generated_documents").insert({
        title: `${template?.name} - ${selectedPeriod}`,
        document_type: "waste_report",
        status: "draft",
        metadata: { vessel: selectedVessel, period: selectedPeriod, template: selectedTemplate }
      });
      
      if (error) throw error;
      
      const newReport: Report = {
        id: crypto.randomUUID(),
        name: `${template?.name} - ${selectedPeriod}`,
        type: template?.name || "",
        vessel: selectedVessel,
        period: selectedPeriod,
        generatedAt: new Date().toISOString().split("T")[0],
        status: "draft",
        size: "1.5 MB",
      };
      
      setReports([newReport, ...reports]);
      setIsDialogOpen(false);
      toast.success("Relatório gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (report: Report) => {
    toast.success(`Baixando ${report.name}...`);
  };

  const handleSubmit = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: "submitted" as const } : r));
    toast.success("Relatório submetido às autoridades!");
  };

  const validCerts = certificates.filter(c => c.status === "valid").length;
  const expiringCerts = certificates.filter(c => c.status === "expiring").length;
  const expiredCerts = certificates.filter(c => c.status === "expired").length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Relatórios Gerados</p>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-xs text-blue-600">Este ano</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certificados Válidos</p>
                <p className="text-2xl font-bold">{validCerts}</p>
                <p className="text-xs text-green-600">Em conformidade</p>
              </div>
              <Award className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirando</p>
                <p className="text-2xl font-bold">{expiringCerts}</p>
                <p className="text-xs text-amber-600">Próximos 30 dias</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold">{expiredCerts}</p>
                <p className="text-xs text-red-600">Renovação urgente</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlus className="h-5 w-5" />
            Gerar Novo Relatório
          </CardTitle>
          <CardDescription>
            Selecione um template e configure os parâmetros do relatório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {reportTemplates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedTemplate === template.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTemplate && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-end">
              <div className="grid gap-2 flex-1">
                <Label>Embarcação</Label>
                <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a embarcação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PSV Atlantic Explorer">PSV Atlantic Explorer</SelectItem>
                    <SelectItem value="AHTS Pacific Star">AHTS Pacific Star</SelectItem>
                    <SelectItem value="OSV Caribbean Wind">OSV Caribbean Wind</SelectItem>
                    <SelectItem value="PSV Gulf Stream">PSV Gulf Stream</SelectItem>
                    <SelectItem value="Frota Completa">Frota Completa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 flex-1">
                <Label>Período</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jan/2024">Janeiro 2024</SelectItem>
                    <SelectItem value="Fev/2024">Fevereiro 2024</SelectItem>
                    <SelectItem value="Q1/2024">1º Trimestre 2024</SelectItem>
                    <SelectItem value="2024">Ano 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGenerateReport} 
                disabled={!selectedVessel || !selectedPeriod || isGenerating}
                className="gap-2"
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
          )}
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Gerados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Relatório</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Embarcação</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Gerado em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {report.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      {report.vessel}
                    </div>
                  </TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{report.generatedAt}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={report.status === "submitted" ? "default" : report.status === "final" ? "secondary" : "outline"}
                      className={report.status === "submitted" ? "bg-green-600" : ""}
                    >
                      {report.status === "submitted" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {report.status === "draft" && <Clock className="h-3 w-3 mr-1" />}
                      {report.status === "submitted" ? "Submetido" : report.status === "final" ? "Final" : "Rascunho"}
                    </Badge>
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
                      {report.status === "final" && (
                        <Button variant="ghost" size="sm" onClick={() => handleSubmit(report.id)}>
                          <Send className="h-4 w-4 text-blue-600" />
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

      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificados MARPOL
          </CardTitle>
          <CardDescription>
            Status dos certificados de conformidade ambiental
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Embarcação</TableHead>
                <TableHead>Emitido em</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Emissor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      {cert.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cert.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      {cert.vessel}
                    </div>
                  </TableCell>
                  <TableCell>{cert.issuedAt}</TableCell>
                  <TableCell>{cert.expiresAt}</TableCell>
                  <TableCell>{cert.issuedBy}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={cert.status === "valid" ? "default" : cert.status === "expiring" ? "secondary" : "destructive"}
                      className={cert.status === "valid" ? "bg-green-600" : cert.status === "expiring" ? "bg-amber-500" : ""}
                    >
                      {cert.status === "valid" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {cert.status === "expiring" && <Clock className="h-3 w-3 mr-1" />}
                      {cert.status === "expired" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {cert.status === "valid" ? "Válido" : cert.status === "expiring" ? "Expirando" : "Expirado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {cert.status !== "valid" && (
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="h-4 w-4 text-blue-600" />
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
    </div>
  );
}
