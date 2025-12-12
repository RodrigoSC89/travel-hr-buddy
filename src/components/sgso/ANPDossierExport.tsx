import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Folder,
  FileArchive,
  Printer,
  Eye,
  TrendingUp,
  Calendar,
  Users,
  Target
} from "lucide-react";

interface PracticeStatus {
  id: number;
  name: string;
  compliance: number;
  status: "conforme" | "parcial" | "nao_conforme" | "pendente";
  evidencias: number;
  ncs: number;
  capas: number;
}

const PRACTICES_STATUS: PracticeStatus[] = [
  { id: 1, name: "Liderança e Responsabilidade", compliance: 95, status: "conforme", evidencias: 12, ncs: 0, capas: 0 },
  { id: 2, name: "Identificação de Perigos", compliance: 78, status: "parcial", evidencias: 8, ncs: 1, capas: 1 },
  { id: 3, name: "Controle de Riscos", compliance: 92, status: "conforme", evidencias: 15, ncs: 0, capas: 0 },
  { id: 4, name: "Treinamento", compliance: 65, status: "nao_conforme", evidencias: 6, ncs: 2, capas: 2 },
  { id: 5, name: "Comunicação", compliance: 88, status: "conforme", evidencias: 10, ncs: 0, capas: 0 },
  { id: 6, name: "Documentação SGSO", compliance: 90, status: "conforme", evidencias: 20, ncs: 0, capas: 0 },
  { id: 7, name: "Controle Operacional", compliance: 75, status: "parcial", evidencias: 9, ncs: 1, capas: 1 },
  { id: 8, name: "Emergências", compliance: 94, status: "conforme", evidencias: 18, ncs: 0, capas: 0 },
  { id: 9, name: "Monitoramento", compliance: 85, status: "conforme", evidencias: 11, ncs: 0, capas: 0 },
  { id: 10, name: "Conformidade", compliance: 72, status: "parcial", evidencias: 7, ncs: 1, capas: 1 },
  { id: 11, name: "Investigação Incidentes", compliance: 89, status: "conforme", evidencias: 14, ncs: 0, capas: 0 },
  { id: 12, name: "Análise Crítica", compliance: 91, status: "conforme", evidencias: 8, ncs: 0, capas: 0 },
  { id: 13, name: "Gestão de Mudanças", compliance: 58, status: "nao_conforme", evidencias: 3, ncs: 2, capas: 1 },
  { id: 14, name: "Aquisição", compliance: 87, status: "conforme", evidencias: 9, ncs: 0, capas: 0 },
  { id: 15, name: "Projeto e Construção", compliance: 70, status: "parcial", evidencias: 5, ncs: 1, capas: 0 },
  { id: 16, name: "Info. Segurança Processo", compliance: 93, status: "conforme", evidencias: 16, ncs: 0, capas: 0 },
  { id: 17, name: "Integridade Mecânica", compliance: 62, status: "nao_conforme", evidencias: 4, ncs: 2, capas: 2 }
];

const getStatusConfig = (status: PracticeStatus["status"]) => {
  const configs = {
    conforme: { color: "bg-green-600 text-white", icon: CheckCircle, label: "Conforme" },
    parcial: { color: "bg-yellow-600 text-white", icon: AlertTriangle, label: "Parcial" },
    nao_conforme: { color: "bg-red-600 text-white", icon: XCircle, label: "Não Conforme" },
    pendente: { color: "bg-secondary text-secondary-foreground", icon: Clock, label: "Pendente" }
  };
  return configs[status];
};

export const ANPDossierExport: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("prontidao");
  const [selectedPractices, setSelectedPractices] = useState<number[]>(
    PRACTICES_STATUS.map(p => p.id)
  );
  const [isExporting, setIsExporting] = useState(false);

  // Calculate overall metrics
  const overallCompliance = Math.round(
    PRACTICES_STATUS.reduce((acc, p) => acc + p.compliance, 0) / 17
  );
  const conformeCount = PRACTICES_STATUS.filter(p => p.status === "conforme").length;
  const parcialCount = PRACTICES_STATUS.filter(p => p.status === "parcial").length;
  const naoConformeCount = PRACTICES_STATUS.filter(p => p.status === "nao_conforme").length;
  const totalEvidencias = PRACTICES_STATUS.reduce((acc, p) => acc + p.evidencias, 0);
  const totalNCs = PRACTICES_STATUS.reduce((acc, p) => acc + p.ncs, 0);
  const totalCAPAs = PRACTICES_STATUS.reduce((acc, p) => acc + p.capas, 0);

  // Readiness score
  const readinessScore = Math.round(
    (conformeCount * 100 + parcialCount * 50) / 17
  );

  const handleExportPDF = async () => {
    setIsExporting(true);
    toast({
      title: "Gerando Dossiê ANP...",
      description: "Aguarde enquanto o relatório é preparado."
    };

    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Dossiê ANP Gerado!",
      description: "O arquivo PDF foi baixado com sucesso."
    };
    setIsExporting(false);
  };

  const handleExportZIP = async () => {
    setIsExporting(true);
    toast({
      title: "Gerando Pacote Completo...",
      description: "Incluindo PDF + evidências anexas."
    };

    await new Promise(resolve => setTimeout(resolve, 3000));

    toast({
      title: "Pacote ZIP Gerado!",
      description: "Dossiê completo com evidências baixado."
    };
    setIsExporting(false);
  };

  const togglePractice = (id: number) => {
    setSelectedPractices(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Readiness Overview */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-primary">{readinessScore}%</span>
                    <p className="text-xs text-muted-foreground">Prontidão</p>
                  </div>
                </div>
                <Badge className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${
                  readinessScore >= 80 ? "bg-green-600" : readinessScore >= 60 ? "bg-yellow-600" : "bg-red-600"
                } text-white`}>
                  {readinessScore >= 80 ? "Pronto" : readinessScore >= 60 ? "Atenção" : "Crítico"}
                </Badge>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-2">Prontidão para Auditoria ANP</h2>
                <p className="text-muted-foreground mb-4">
                  Índice de conformidade geral: <span className="font-bold text-foreground">{overallCompliance}%</span>
                </p>
                <div className="flex gap-3">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {conformeCount} Conformes
                  </Badge>
                  <Badge className="bg-yellow-600 text-white px-3 py-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {parcialCount} Parciais
                  </Badge>
                  <Badge className="bg-red-600 text-white px-3 py-1">
                    <XCircle className="h-3 w-3 mr-1" />
                    {naoConformeCount} Não Conformes
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <FileText className="h-5 w-5 mr-2" />
                Gerar Dossiê PDF
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleExportZIP}
                disabled={isExporting}
              >
                <FileArchive className="h-5 w-5 mr-2" />
                Pacote Completo (ZIP)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evidências</p>
                <p className="text-3xl font-bold">{totalEvidencias}</p>
              </div>
              <Folder className="h-10 w-10 text-blue-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NCs Abertas</p>
                <p className="text-3xl font-bold text-red-600">{totalNCs}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CAPAs</p>
                <p className="text-3xl font-bold text-yellow-600">{totalCAPAs}</p>
              </div>
              <Target className="h-10 w-10 text-yellow-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Geral</p>
                <p className="text-3xl font-bold text-green-600">{overallCompliance}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Dossiê ANP - Resolução 43/2007
          </CardTitle>
          <CardDescription>
            Selecione as práticas e gere o dossiê completo para auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-lg">
              <TabsTrigger value="prontidao">Prontidão</TabsTrigger>
              <TabsTrigger value="praticas">17 Práticas</TabsTrigger>
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
            </TabsList>

            <TabsContent value="prontidao" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Checklist de Prontidão */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Checklist de Prontidão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Todas as 17 práticas avaliadas", done: true },
                      { label: "Evidências digitalizadas", done: true },
                      { label: "NCs com CAPA definida", done: totalNCs === totalCAPAs },
                      { label: "CAPAs em tratamento", done: totalCAPAs > 0 },
                      { label: "Assinaturas coletadas", done: true },
                      { label: "Revisão final realizada", done: false }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        {item.done ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className={item.done ? "text-green-700" : "text-yellow-700"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Práticas Críticas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Práticas Críticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {PRACTICES_STATUS.filter(p => p.status === "nao_conforme").map((practice) => (
                      <div key={practice.id} className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-red-800">
                            Prática {practice.id} - {practice.name}
                          </span>
                          <Badge className="bg-red-600 text-white">{practice.compliance}%</Badge>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="text-red-600">{practice.ncs} NCs</span>
                          <span className="text-yellow-600">{practice.capas} CAPAs</span>
                          <span className="text-blue-600">{practice.evidencias} evidências</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="praticas" className="space-y-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {selectedPractices.length} de 17 práticas selecionadas
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetSelectedPractices}
                  >
                    Selecionar Todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetSelectedPractices}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRACTICES_STATUS.map((practice) => {
                  const statusConfig = getStatusConfig(practice.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={practice.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPractices.includes(practice.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handletogglePractice}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedPractices.includes(practice.id)}
                          onCheckedChange={() => togglePractice(practice.id}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                              Prática {practice.id}
                            </span>
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{practice.name}</p>
                          <Progress value={practice.compliance} className="h-2" />
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{practice.evidencias} evidências</span>
                            <span>{practice.ncs} NCs</span>
                            <span>{practice.capas} CAPAs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="conteudo" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estrutura do Dossiê</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { icon: FileText, label: "1. Capa e Identificação", desc: "Dados da unidade, data, responsável" },
                      { icon: TrendingUp, label: "2. Sumário Executivo", desc: "Índice de conformidade, resumo" },
                      { icon: Shield, label: "3. Relatório por Prática", desc: "17 práticas com status e evidências" },
                      { icon: XCircle, label: "4. Lista de NCs", desc: "Não conformidades identificadas" },
                      { icon: Target, label: "5. CAPAs em Andamento", desc: "Ações corretivas e preventivas" },
                      { icon: Folder, label: "6. Anexos de Evidências", desc: "Documentos, fotos, registros" },
                      { icon: Users, label: "7. Assinaturas", desc: "Auditor, responsável SGSO" },
                      { icon: Calendar, label: "8. Trilha de Auditoria", desc: "Logs e histórico de alterações" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <item.icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Pré-visualizar
                </Button>
                <Button variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button className="flex-1" onClick={handleExportPDF} disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dossiê
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ANPDossierExport;
