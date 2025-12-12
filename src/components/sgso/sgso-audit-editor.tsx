import { useState } from "react";;

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  Save,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";

// Lazy load jsPDF
const loadPDFLibs = async () => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  return { jsPDF, autoTable };
};

interface AuditArea {
  id: string;
  name: string;
  criteria: string[];
}

interface AuditResult {
  area: string;
  criterion: string;
  status: "compliant" | "non_compliant" | "partial" | "not_applicable";
  comments: string;
  evidence: string[];
}

export default function SGSOAuditEditor() {
  const { toast } = useToast();
  const [vesselId, setVesselId] = useState("");
  const [auditType, setAuditType] = useState("internal");
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [currentArea, setCurrentArea] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // ANP 43/2007 - 17 Práticas Obrigatórias
  const auditAreas: AuditArea[] = [
    {
      id: "practice_1",
      name: "Prática 1: Política de SGSO",
      criteria: [
        "Política documentada e assinada pela direção",
        "Comprometimento com a melhoria contínua",
        "Disponibilidade da política para todos os colaboradores"
      ]
    },
    {
      id: "practice_2",
      name: "Prática 2: Identificação de Perigos e Avaliação de Riscos",
      criteria: [
        "Procedimento para identificação de perigos",
        "Matriz de risco implementada",
        "Revisão periódica das avaliações"
      ]
    },
    {
      id: "practice_3",
      name: "Prática 3: Objetivos, Metas e Programas",
      criteria: [
        "Objetivos de SGSO definidos",
        "Indicadores de desempenho estabelecidos",
        "Programa de ação para atingir metas"
      ]
    },
    {
      id: "practice_4",
      name: "Prática 4: Estrutura e Responsabilidades",
      criteria: [
        "Organograma definido",
        "Responsabilidades documentadas",
        "Recursos adequados alocados"
      ]
    },
    {
      id: "practice_5",
      name: "Prática 5: Competência e Treinamento",
      criteria: [
        "Levantamento de necessidades de treinamento",
        "Registros de treinamento mantidos",
        "Avaliação da eficácia dos treinamentos"
      ]
    }
  ];

  const handleAddResult = (area: string, criterion: string) => {
    setAuditResults([...auditResults, {
      area,
      criterion,
      status: "compliant",
      comments: "",
      evidence: []
    }]);
  };

  const handleUpdateResult = (index: number, updates: Partial<AuditResult>) => {
    const updated = [...auditResults];
    updated[index] = { ...updated[index], ...updates };
    setAuditResults(updated);
  };

  const handleSaveAudit = async () => {
    if (!vesselId) {
      toast({
        title: "Erro",
        description: "Selecione uma embarcação",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create audit record
      const { data: audit, error } = await supabase
        .from("safety_incidents")
        .insert({
          incident_type: "operational",
          severity: calculateOverallSeverity(),
          status: "investigating",
          incident_date: new Date().toISOString(),
          vessel_id: vesselId,
          description: `SGSO Audit - ${auditType}`,
          immediate_actions: JSON.stringify(auditResults),
          reported_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create action plans for non-compliances
      const nonCompliances = auditResults.filter(r => r.status === "non_compliant");
      for (const nc of nonCompliances) {
        await supabase.from("sgso_action_plans").insert({
          incident_id: audit.id,
          action_description: `Resolver não conformidade: ${nc.criterion}`,
          priority: "high",
          status: "open",
          assigned_to: user?.id
        });
      }

      toast({
        title: "Auditoria salva",
        description: "Auditoria SGSO salva com sucesso"
      });

      // Reset form
      setAuditResults([]);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateOverallSeverity = (): string => {
    const nonCompliances = auditResults.filter(r => r.status === "non_compliant").length;
    const total = auditResults.length;
    
    if (total === 0) return "low";
    
    const ratio = nonCompliances / total;
    if (ratio > 0.5) return "critical";
    if (ratio > 0.3) return "high";
    if (ratio > 0.1) return "medium";
    return "low";
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Relatório de Auditoria SGSO", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Tipo: ${auditType}`, 14, 36);
    
    // Results table
    const tableData = auditResults.map(r => [
      r.area,
      r.criterion,
      r.status,
      r.comments
    ]);
    
    autoTable(doc, {
      head: [["Área", "Critério", "Status", "Comentários"]],
      body: tableData,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Summary
    const compliant = auditResults.filter(r => r.status === "compliant").length;
    const nonCompliant = auditResults.filter(r => r.status === "non_compliant").length;
    const partial = auditResults.filter(r => r.status === "partial").length;
    
    const finalY = ((doc as unknown).lastAutoTable?.finalY || 100) + 10;
    doc.text("Resumo:", 14, finalY);
    doc.text(`Conformes: ${compliant}`, 14, finalY + 6);
    doc.text(`Não Conformes: ${nonCompliant}`, 14, finalY + 12);
    doc.text(`Parcialmente Conformes: ${partial}`, 14, finalY + 18);
    
    doc.save(`auditoria-sgso-${Date.now()}.pdf`);
    
    toast({
      title: "PDF exportado",
      description: "Relatório exportado com sucesso"
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: { icon: CheckCircle, color: "bg-green-100 text-green-800" },
      non_compliant: { icon: XCircle, color: "bg-red-100 text-red-800" },
      partial: { icon: AlertTriangle, color: "bg-yellow-100 text-yellow-800" },
      not_applicable: { icon: FileText, color: "bg-gray-100 text-gray-800" }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.not_applicable;
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Editor de Auditoria SGSO
          </h1>
          <p className="text-muted-foreground mt-2">
            Conforme Resolução ANP 43/2007 - 17 Práticas Obrigatórias
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF} disabled={auditResults.length === 0}>
            <FileCheck className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleSaveAudit} disabled={saving || auditResults.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Auditoria
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Auditoria</Label>
              <Select value={auditType} onValueChange={setAuditType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Auditoria Interna</SelectItem>
                  <SelectItem value="external">Auditoria Externa</SelectItem>
                  <SelectItem value="certification">Certificação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Embarcação</Label>
              <Select value={vesselId} onValueChange={setVesselId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vessel-1">PSV Atlântico</SelectItem>
                  <SelectItem value="vessel-2">PSV Pacífico</SelectItem>
                  <SelectItem value="vessel-3">AHTS Oceano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Seleção de Áreas e Critérios</CardTitle>
          <CardDescription>
            Selecione as práticas e critérios a serem auditados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {auditAreas.map((area) => (
            <Card key={area.id}>
              <CardHeader>
                <CardTitle className="text-lg">{area.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {area.criteria.map((criterion, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Checkbox
                      id={`${area.id}-${i}`}
                      checked={auditResults.some(r => r.criterion === criterion)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleAddResult(area.name, criterion);
                        } else {
                          setAuditResults(auditResults.filter(r => r.criterion !== criterion));
                        }
                      }}
                    />
                    <Label htmlFor={`${area.id}-${i}`} className="cursor-pointer">
                      {criterion}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Results */}
      {auditResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Auditoria</CardTitle>
            <CardDescription>
              {auditResults.length} critérios selecionados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditResults.map((result, index) => (
              <Card key={index} className="border-2">
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{result.area}</p>
                    <p className="font-semibold">{result.criterion}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select 
                        value={result.status}
                        onValueChange={(value) => handleUpdateResult(index, { 
                          status: value as "compliant" | "non_compliant" | "partial" | "not_applicable" 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compliant">Conforme</SelectItem>
                          <SelectItem value="non_compliant">Não Conforme</SelectItem>
                          <SelectItem value="partial">Parcialmente Conforme</SelectItem>
                          <SelectItem value="not_applicable">Não Aplicável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                  <div>
                    <Label>Comentários</Label>
                    <Textarea
                      value={result.comments}
                      onChange={(e) => handleUpdateResult(index, { comments: e.target.value })}
                      placeholder="Observações, evidências e ações necessárias..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
