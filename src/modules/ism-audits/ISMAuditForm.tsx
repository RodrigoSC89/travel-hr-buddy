/**
 * ISM Audit Form
 * PATCH-609: Interactive form for creating/editing ISM audits
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Sparkles, FileText } from "lucide-react";
import { ISMChecklistCard } from "./components/ISMChecklistCard";
import type { ISMAudit, ISMAuditItem } from "@/types/ism-audit";
import { ISM_CHECKLIST_TEMPLATES, calculateComplianceScore } from "@/types/ism-audit";
import { analyzeISMItem, generateAuditSummary } from "@/lib/llm/ismAssistant";

interface ISMAuditFormProps {
  audit?: ISMAudit;
  onSave: (audit: ISMAudit) => void;
  onCancel: () => void;
}

export function ISMAuditForm({ audit, onSave, onCancel }: ISMAuditFormProps) {
  const [formData, setFormData] = useState<Partial<ISMAudit>>({
    vesselName: audit?.vesselName || "",
    auditType: audit?.auditType || "internal",
    auditDate: audit?.auditDate || new Date().toISOString().split("T")[0],
    auditor: audit?.auditor || "",
    port: audit?.port || "",
    status: audit?.status || "draft",
    items: audit?.items || [],
  });

  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLoadTemplate = () => {
    const templateItems: ISMAuditItem[] = ISM_CHECKLIST_TEMPLATES.flatMap(template =>
      template.questions.map((question, index) => ({
        id: `template-${Date.now()}-${index}`,
        question,
        category: template.category,
        compliant: "pending" as const,
        notes: "",
        timestamp: new Date().toISOString(),
      }))
    );

    setFormData(prev => ({ ...prev, items: templateItems }));
    toast.success(`${templateItems.length} itens carregados do template`);
  };

  const handleItemUpdate = (updatedItem: ISMAuditItem) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  };

  const handleAnalyzeItem = async (item: ISMAuditItem) => {
    if (!item.notes) {
      toast.error("Adicione notas ou evidências antes de analisar");
      return;
    }

    setIsAnalyzing(item.id);
    try {
      const analysis = await analyzeISMItem({
        question: item.question,
        response: item.notes,
        category: item.category,
      });

      const updatedItem: ISMAuditItem = {
        ...item,
        compliant: analysis.compliant,
        aiAnalysis: analysis.explanation,
        aiConfidence: analysis.confidence,
      };

      handleItemUpdate(updatedItem);
      toast.success("Análise concluída");
    } catch (error) {
      console.error("Error analyzing item:", error);
      toast.error("Erro ao analisar item");
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (!formData.items || formData.items.length === 0) {
      toast.error("Adicione itens à auditoria antes de gerar sumário");
      return;
    }

    setGeneratingSummary(true);
    try {
      const summary = await generateAuditSummary(
        formData.items,
        formData.vesselName || "Embarcação",
        formData.auditType || "internal"
      );

      setFormData(prev => ({ ...prev, summary }));
      toast.success("Sumário gerado com sucesso");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Erro ao gerar sumário");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.vesselName || !formData.auditor || !formData.auditDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      toast.error("Adicione pelo menos um item ao checklist");
      return;
    }

    const score = calculateComplianceScore(formData.items);

    const auditToSave: ISMAudit = {
      id: audit?.id || `audit-${Date.now()}`,
      vesselId: audit?.vesselId || `vessel-${Date.now()}`,
      vesselName: formData.vesselName!,
      auditType: formData.auditType!,
      auditDate: formData.auditDate!,
      auditor: formData.auditor!,
      port: formData.port,
      status: formData.status!,
      items: formData.items,
      complianceScore: score.score,
      summary: formData.summary,
      createdAt: audit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: formData.auditor!,
    };

    onSave(auditToSave);
    toast.success("Auditoria salva com sucesso");
  };

  const score = formData.items && formData.items.length > 0
    ? calculateComplianceScore(formData.items)
    : null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {audit ? "Editar Auditoria ISM" : "Nova Auditoria ISM"}
          </h1>
          <p className="text-gray-600 mt-1">
            Preencha os dados da auditoria e o checklist
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Dados da embarcação e auditoria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselName">Embarcação *</Label>
              <Input
                id="vesselName"
                value={formData.vesselName}
                onChange={(e) => handleFieldChange("vesselName", e.target.value)}
                placeholder="Nome da embarcação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditType">Tipo de Auditoria *</Label>
              <Select
                value={formData.auditType}
                onValueChange={(value) => handleFieldChange("auditType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Interna</SelectItem>
                  <SelectItem value="external">Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditDate">Data da Auditoria *</Label>
              <Input
                id="auditDate"
                type="date"
                value={formData.auditDate}
                onChange={(e) => handleFieldChange("auditDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditor">Auditor *</Label>
              <Input
                id="auditor"
                value={formData.auditor}
                onChange={(e) => handleFieldChange("auditor", e.target.value)}
                placeholder="Nome do auditor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Porto</Label>
              <Input
                id="port"
                value={formData.port}
                onChange={(e) => handleFieldChange("port", e.target.value)}
                placeholder="Porto (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFieldChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="approved">Aprovada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Checklist ISM</CardTitle>
              <CardDescription>
                {formData.items?.length || 0} itens
                {score && ` | Score: ${score.score}% (${score.grade})`}
              </CardDescription>
            </div>
            <Button onClick={handleLoadTemplate} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Carregar Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.items && formData.items.length > 0 ? (
            formData.items.map((item) => (
              <ISMChecklistCard
                key={item.id}
                item={item}
                onUpdate={handleItemUpdate}
                onAnalyze={handleAnalyzeItem}
                showAIAnalysis={true}
                disabled={isAnalyzing === item.id}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum item adicionado. Carregue um template ou faça upload de PDF.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {formData.items && formData.items.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sumário da Auditoria</CardTitle>
              <Button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                variant="outline"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generatingSummary ? "Gerando..." : "Gerar com IA"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.summary || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Sumário executivo da auditoria..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
