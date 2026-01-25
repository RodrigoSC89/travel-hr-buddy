/**
 * SGSO Audit Editor - Refactored
 * Resolução ANP 43/2007 - 17 Práticas Obrigatórias
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Save, FileCheck } from "lucide-react";

import { AuditResult, AuditType } from "./audit/types";
import { auditAreas } from "./audit/audit-areas";
import { calculateOverallSeverity, getNonCompliances } from "./audit/audit-utils";
import { exportAuditToPDF } from "./audit/pdf-export";
import { AuditAreaSelector } from "./audit/AuditAreaSelector";
import { AuditResultCard } from "./audit/AuditResultCard";

export default function SGSOAuditEditor() {
  const { toast } = useToast();
  const [vesselId, setVesselId] = useState("");
  const [auditType, setAuditType] = useState<AuditType>("internal");
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [saving, setSaving] = useState(false);

  const handleAddResult = useCallback((area: string, criterion: string) => {
    setAuditResults((prev) => [
      ...prev,
      { area, criterion, status: "compliant", comments: "", evidence: [] },
    ]);
  }, []);

  const handleRemoveResult = useCallback((criterion: string) => {
    setAuditResults((prev) => prev.filter((r) => r.criterion !== criterion));
  }, []);

  const handleUpdateResult = useCallback((index: number, updates: Partial<AuditResult>) => {
    setAuditResults((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  }, []);

  const handleSaveAudit = async () => {
    if (!vesselId) {
      toast({ title: "Erro", description: "Selecione uma embarcação", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const severity = calculateOverallSeverity(auditResults);

      const { data: audit, error } = await supabase
        .from("safety_incidents")
        .insert({
          title: `Auditoria SGSO - ${auditType}`,
          incident_type: "operational",
          severity,
          status: "investigating",
          incident_date: new Date().toISOString(),
          vessel_id: vesselId,
          description: `SGSO Audit - ${auditType}`,
          immediate_actions: JSON.stringify(auditResults),
          reported_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create action plans for non-compliances
      const nonCompliances = getNonCompliances(auditResults);
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30); // 30 dias para resolver
      
      for (const nc of nonCompliances) {
        await supabase.from("sgso_action_plans").insert({
          code: `SGSO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          title: `NC: ${nc.criterion}`,
          description: `Resolver não conformidade: ${nc.criterion}`,
          deadline: deadline.toISOString(),
          responsible: user?.id ?? "unassigned",
          status: "open",
          audit_id: audit.id,
          created_by: user?.id,
        });
      }

      toast({ title: "Auditoria salva", description: "Auditoria SGSO salva com sucesso" });
      setAuditResults([]);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    await exportAuditToPDF(auditResults, auditType);
    toast({ title: "PDF exportado", description: "Relatório exportado com sucesso" });
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
          <Button variant="outline" onClick={handleExportPDF} disabled={auditResults.length === 0}>
            <FileCheck className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleSaveAudit} disabled={saving || auditResults.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Auditoria
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração da Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Auditoria</Label>
            <Select value={auditType} onValueChange={(v) => setAuditType(v as AuditType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vessel-1">PSV Atlântico</SelectItem>
                <SelectItem value="vessel-2">PSV Pacífico</SelectItem>
                <SelectItem value="vessel-3">AHTS Oceano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seleção de Áreas e Critérios</CardTitle>
          <CardDescription>Selecione as práticas e critérios a serem auditados</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditAreaSelector
            areas={auditAreas}
            selectedResults={auditResults}
            onAddResult={handleAddResult}
            onRemoveResult={handleRemoveResult}
          />
        </CardContent>
      </Card>

      {auditResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Auditoria</CardTitle>
            <CardDescription>{auditResults.length} critérios selecionados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditResults.map((result, index) => (
              <AuditResultCard key={index} result={result} index={index} onUpdate={handleUpdateResult} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
