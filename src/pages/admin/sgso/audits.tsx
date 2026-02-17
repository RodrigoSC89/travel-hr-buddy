/**
 * SGSO Audits Module
 * Safety Management System Audits - ANP/IBAMA Compliance
 * @version 3.2.1 - TypeScript strict compliant
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, Eye, Calendar, ClipboardCheck } from "lucide-react";

// Interface aligned with sgso_audits Supabase schema
interface SGSOAudit {
  id: string;
  vessel_id: string | null;
  auditor_id: string | null;
  audit_date: string;
  audit_type: string | null;
  status: string | null;
  compliance_score: number | null;
  non_conformities_count: number | null;
  findings: string | null;
  recommendations: string | null;
  next_audit_date: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// Form data for creating/editing audits
interface AuditFormData {
  id?: string;
  audit_date: string;
  audit_type: string;
  status: string;
  compliance_score: string;
  non_conformities_count: string;
  findings: string;
  recommendations: string;
  next_audit_date: string;
}

const AUDIT_TYPES = [
  { value: "internal", label: "Auditoria Interna" },
  { value: "external", label: "Auditoria Externa" },
  { value: "regulatory", label: "Auditoria Regulatória" },
  { value: "certification", label: "Auditoria de Certificação" },
  { value: "follow_up", label: "Follow-up" },
];

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Agendada" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluída" },
  { value: "cancelled", label: "Cancelada" },
];

const initialFormData: AuditFormData = {
  audit_date: new Date().toISOString().split('T')[0],
  audit_type: "internal",
  status: "scheduled",
  compliance_score: "",
  non_conformities_count: "0",
  findings: "",
  recommendations: "",
  next_audit_date: "",
};

export default function SGSOAudits() {
  const [audits, setAudits] = useState<SGSOAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<AuditFormData>(initialFormData);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sgso_audits")
        .select("*")
        .order("audit_date", { ascending: false });

      if (error) throw error;

      setAudits((data as SGSOAudit[]) || []);
      logger.info("SGSO audits loaded successfully", { count: data?.length });
    } catch (error) {
      logger.error("Failed to load SGSO audits", error);
      toast.error("Falha ao carregar auditorias");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const auditData = {
        audit_date: formData.audit_date,
        audit_type: formData.audit_type,
        status: formData.status,
        compliance_score: formData.compliance_score ? parseFloat(formData.compliance_score) : null,
        non_conformities_count: parseInt(formData.non_conformities_count) || 0,
        findings: formData.findings || null,
        recommendations: formData.recommendations || null,
        next_audit_date: formData.next_audit_date || null,
      };

      if (formData.id) {
        // Update existing audit
        const { error } = await supabase
          .from("sgso_audits")
          .update(auditData)
          .eq("id", formData.id);

        if (error) throw error;
        toast.success("Auditoria atualizada com sucesso");
      } else {
        // Create new audit
        const { error } = await supabase
          .from("sgso_audits")
          .insert(auditData);

        if (error) throw error;

        // Log access for compliance
        await supabase.from("access_logs").insert({
          action: "create",
          module_accessed: "sgso_audits",
          result: "success",
          details: { audit_type: formData.audit_type, audit_date: formData.audit_date },
        });

        toast.success("Auditoria criada com sucesso");
      }

      setEditMode(false);
      setFormData(initialFormData);
      loadAudits();
    } catch (error) {
      logger.error("Failed to save audit", error);
      toast.error("Falha ao salvar auditoria");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta auditoria?")) return;

    try {
      const { error } = await supabase.from("sgso_audits").delete().eq("id", id);

      if (error) throw error;

      // Log access for compliance
      await supabase.from("access_logs").insert({
        action: "delete",
        module_accessed: "sgso_audits",
        result: "success",
        details: { audit_id: id },
      });

      toast.success("Auditoria excluída com sucesso");
      loadAudits();
    } catch (error) {
      logger.error("Failed to delete audit", error);
      toast.error("Falha ao excluir auditoria");
    }
  };

  const handleEdit = (audit: SGSOAudit) => {
    setFormData({
      id: audit.id,
      audit_date: audit.audit_date,
      audit_type: audit.audit_type || "internal",
      status: audit.status || "scheduled",
      compliance_score: audit.compliance_score?.toString() || "",
      non_conformities_count: audit.non_conformities_count?.toString() || "0",
      findings: audit.findings || "",
      recommendations: audit.recommendations || "",
      next_audit_date: audit.next_audit_date || "",
    });
    setEditMode(true);
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      scheduled: { variant: "secondary", label: "Agendada" },
      in_progress: { variant: "default", label: "Em Andamento" },
      completed: { variant: "outline", label: "Concluída" },
      cancelled: { variant: "destructive", label: "Cancelada" },
    };
    const config = statusMap[status || "scheduled"] || statusMap.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">Carregando auditorias...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SGSO Audits</h1>
          <p className="text-muted-foreground">Sistema de Gestão de Segurança Operacional - Auditorias</p>
        </div>
        <Button onClick={() => setEditMode(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Auditoria
        </Button>
      </div>

      {editMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {formData.id ? "Editar Auditoria" : "Criar Nova Auditoria"}
            </CardTitle>
            <CardDescription>
              Preencha os detalhes da auditoria SGSO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="audit_date">Data da Auditoria</Label>
                  <Input
                    id="audit_date"
                    type="date"
                    value={formData.audit_date}
                    onChange={(e) => setFormData({ ...formData, audit_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="audit_type">Tipo de Auditoria</Label>
                  <Select
                    value={formData.audit_type}
                    onValueChange={(value) => setFormData({ ...formData, audit_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="compliance_score">Score de Conformidade (%)</Label>
                  <Input
                    id="compliance_score"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0-100"
                    value={formData.compliance_score}
                    onChange={(e) => setFormData({ ...formData, compliance_score: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="non_conformities_count">Não Conformidades</Label>
                  <Input
                    id="non_conformities_count"
                    type="number"
                    min="0"
                    value={formData.non_conformities_count}
                    onChange={(e) => setFormData({ ...formData, non_conformities_count: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="next_audit_date">Próxima Auditoria</Label>
                  <Input
                    id="next_audit_date"
                    type="date"
                    value={formData.next_audit_date}
                    onChange={(e) => setFormData({ ...formData, next_audit_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="findings">Achados (Findings)</Label>
                <Textarea
                  id="findings"
                  placeholder="Descreva os achados da auditoria..."
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="recommendations">Recomendações</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Descreva as recomendações..."
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    setFormData(initialFormData);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {audits.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma auditoria encontrada. Clique em "Nova Auditoria" para começar.
            </CardContent>
          </Card>
        ) : (
          audits.map((audit) => (
            <Card key={audit.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      {new Date(audit.audit_date).toLocaleDateString('pt-BR')}
                      <span className="text-base font-normal text-muted-foreground">
                        - {AUDIT_TYPES.find(t => t.value === audit.audit_type)?.label || audit.audit_type}
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {audit.findings ? audit.findings.substring(0, 100) + (audit.findings.length > 100 ? '...' : '') : 'Sem achados registrados'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(audit)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(audit.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">{getStatusBadge(audit.status)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Score:</span>
                    <p className={`font-semibold text-lg ${getScoreColor(audit.compliance_score)}`}>
                      {audit.compliance_score !== null ? `${audit.compliance_score}%` : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Não Conformidades:</span>
                    <p className="font-semibold text-lg">
                      {audit.non_conformities_count || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Próxima Auditoria:</span>
                    <p className="font-semibold">
                      {audit.next_audit_date ? new Date(audit.next_audit_date).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Criado em:</span>
                    <p className="font-semibold">
                      {audit.created_at ? new Date(audit.created_at).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
