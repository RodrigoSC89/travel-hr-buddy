/**
 * Documents & Analytics AI Hub - Auto-geração, OCR, Executive Dashboards
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Brain, Zap, Loader2, BarChart3, PieChart, Sparkles,
  FileSearch, FilePlus, Printer, Download, BookOpen, Scan,
  ClipboardList, CheckSquare, Globe, Calendar
} from "lucide-react";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

// ============ AUTO DOCUMENT GENERATION ============
export const AutoDocumentGenerationAI: React.FC = () => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [document, setDocument] = useState<any>(null);
  const [docType, setDocType] = useState("");
  const [context, setContext] = useState("");

  const docTypes = [
    { value: "voyage_report", label: "Relatório de Viagem" },
    { value: "incident_report", label: "Relatório de Incidente" },
    { value: "port_state_report", label: "Relatório Port State" },
    { value: "maintenance_report", label: "Relatório de Manutenção" },
    { value: "safety_meeting", label: "Ata de Reunião de Segurança" },
    { value: "drill_report", label: "Relatório de Exercício" },
    { value: "cargo_report", label: "Relatório de Carga" },
    { value: "bunker_report", label: "Relatório de Bunker" },
  ];

  const handleGenerate = async () => {
    const res = await invoke('journaling_generate', `Gere um ${docTypes.find(d => d.value === docType)?.label || docType} completo e profissional. Contexto: ${context}. Inclua: cabeçalho oficial, dados do navio, detalhes técnicos, conclusões e assinaturas necessárias. Formato: documento marítimo oficial.`);
    if (res) setDocument(res.response);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FilePlus className="h-5 w-5 text-primary" />
          Auto-Geração de Documentos
          <Badge className="ml-auto bg-primary/10 text-primary">DocGen AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de documento..." />
          </SelectTrigger>
          <SelectContent>
            {docTypes.map((dt) => (
              <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Descreva o contexto, dados relevantes e informações que o documento deve conter..."
          value={context}
          onChange={e => setContext(e.target.value)}
          rows={4}
        />

        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={isLoading || !docType} className="flex-1">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Gerar Documento
          </Button>
          {document && (
            <>
              <Button variant="outline" size="icon" aria-label="Imprimir documento" title="Imprimir"><Printer className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" aria-label="Baixar documento" title="Baixar"><Download className="h-4 w-4" /></Button>
            </>
          )}
        </div>

        {document && (
          <ScrollArea className="h-72 rounded-md border p-4 bg-background">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm">{typeof document === 'string' ? document : JSON.stringify(document, null, 2)}</p>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ============ SMART OCR AI ============
export const SmartOCRAI: React.FC = () => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [result, setResult] = useState<any>(null);

  const handleOCR = async () => {
    const res = await invoke('audit_analyze', 'Processe o documento escaneado, extraia todos os dados estruturados (nomes, datas, valores, certificados), classifique o tipo de documento e sugira arquivamento no sistema correto.');
    if (res) setResult(res.response);
  };

  return (
    <Card className="border-cyan-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-cyan-500" />
          OCR Inteligente
          <Badge className="ml-auto bg-cyan-500/10 text-cyan-500">Smart Extract</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Scan className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Arraste documentos escaneados (PDF, imagens)</p>
          <p className="text-xs text-muted-foreground mt-1">IA extrai dados, classifica e indexa automaticamente</p>
        </div>

        <Button onClick={handleOCR} disabled={isLoading} className="w-full" variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          Processar com OCR IA
        </Button>

        {result && (
          <div className="p-3 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ EXECUTIVE REPORT AI ============
export const ExecutiveReportAI: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [report, setReport] = useState<any>(null);

  const handleGenerate = async () => {
    const res = await invoke('audit_analyze', 'Gere um relatório executivo consolidado incluindo: KPIs operacionais, financeiros, de segurança, compliance e RH. Apresente tendências, alertas críticos, recomendações estratégicas e projeções para o próximo trimestre. Formato: dashboard executivo com bullet points e métricas.', {
      vesselId,
      reportType: 'executive_summary'
    });
    if (res) setReport(res.response);
  };

  return (
    <Card className="border-indigo-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          Relatório Executivo IA
          <Badge className="ml-auto bg-indigo-500/10 text-indigo-500">Executive AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Diário do Comandante", icon: BookOpen },
            { label: "Relatório Semanal", icon: Calendar },
            { label: "Dashboard KPIs", icon: PieChart },
            { label: "Briefing Executivo", icon: ClipboardList },
          ].map((item) => (
            <Button key={item.label} variant="outline" size="sm" className="justify-start">
              <item.icon className="h-3 w-3 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>

        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Gerar Relatório Executivo
        </Button>

        {report && (
          <ScrollArea className="h-64 rounded-md border p-3 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{typeof report === 'string' ? report : JSON.stringify(report, null, 2)}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ============ MAIN EXPORT ============
const DocumentsAIHub: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  return (
    <Tabs defaultValue="autogen" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="autogen"><FilePlus className="h-3 w-3 mr-1" />AutoGen</TabsTrigger>
        <TabsTrigger value="ocr"><Scan className="h-3 w-3 mr-1" />OCR IA</TabsTrigger>
        <TabsTrigger value="executive"><BarChart3 className="h-3 w-3 mr-1" />Executivo</TabsTrigger>
      </TabsList>
      <TabsContent value="autogen"><AutoDocumentGenerationAI /></TabsContent>
      <TabsContent value="ocr"><SmartOCRAI /></TabsContent>
      <TabsContent value="executive"><ExecutiveReportAI vesselId={vesselId} /></TabsContent>
    </Tabs>
  );
};

export default DocumentsAIHub;
