import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, FileCheck, Save, Send, FileDown, Brain, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { SGSO_REQUIREMENTS, SGSOAudit, SGSOAuditItem, AIAnalysis } from "@/types/sgso";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SGSOAuditPage = () => {
  const { vesselId } = useParams<{ vesselId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [audit, setAudit] = useState<SGSOAudit | null>(null);
  const [auditItems, setAuditItems] = useState<SGSOAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzingItem, setAnalyzingItem] = useState<number | null>(null);
  const [vesselName, setVesselName] = useState<string>("");

  useEffect(() => {
    loadAuditData();
  }, [vesselId]);

  const loadAuditData = async () => {
    try {
      setLoading(true);

      // Get vessel name
      if (vesselId) {
        const { data: vesselData } = await supabase
          .from("vessels")
          .select("name")
          .eq("id", vesselId)
          .single();
        
        if (vesselData) {
          setVesselName(vesselData.name);
        }
      }

      // Check for existing audit for this vessel with status in_progress
      const { data: existingAudit, error: auditError } = await supabase
        .from("sgso_audits")
        .select("*")
        .eq("vessel_id", vesselId || "")
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (auditError && auditError.code !== "PGRST116") {
        throw auditError;
      }

      let currentAudit = existingAudit;

      // If no in_progress audit exists, create one
      if (!currentAudit) {
        const { data: userData } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", userData.user?.id)
          .single();

        const auditNumber = `SGSO-${Date.now()}`;
        const { data: newAudit, error: createError } = await supabase
          .from("sgso_audits")
          .insert({
            organization_id: profile?.organization_id,
            vessel_id: vesselId || null,
            auditor_id: userData.user?.id,
            audit_number: auditNumber,
            audit_date: new Date().toISOString(),
            status: "in_progress",
            audit_type: "internal",
            audit_scope: "SGSO - 17 Requisitos IBAMA",
          })
          .select()
          .single();

        if (createError) throw createError;
        currentAudit = newAudit;
      }

      setAudit(currentAudit);

      // Load or create audit items
      const { data: items, error: itemsError } = await supabase
        .from("sgso_audit_items")
        .select("*")
        .eq("audit_id", currentAudit.id)
        .order("requirement_number");

      if (itemsError) throw itemsError;

      // If no items exist, create them from template
      if (!items || items.length === 0) {
        const newItems = SGSO_REQUIREMENTS.map(req => ({
          audit_id: currentAudit.id,
          requirement_number: req.requirement_number,
          requirement_title: req.requirement_title,
          description: req.description,
          compliance_status: null,
          evidence: "",
          ai_analysis: null,
        }));

        const { data: createdItems, error: createItemsError } = await supabase
          .from("sgso_audit_items")
          .insert(newItems)
          .select();

        if (createItemsError) throw createItemsError;
        setAuditItems(createdItems);
      } else {
        setAuditItems(items);
      }
    } catch (error) {
      console.error("Error loading audit data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da auditoria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAuditItem = (itemId: string, field: keyof SGSOAuditItem, value: any) => {
    setAuditItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const saveAsDraft = async () => {
    try {
      setSaving(true);
      
      // Update all audit items
      for (const item of auditItems) {
        if (item.id) {
          const { error } = await supabase
            .from("sgso_audit_items")
            .update({
              compliance_status: item.compliance_status,
              evidence: item.evidence,
              ai_analysis: item.ai_analysis,
            })
            .eq("id", item.id);

          if (error) throw error;
        }
      }

      toast({
        title: "Sucesso",
        description: "Rascunho salvo com sucesso.",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o rascunho.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const submitAudit = async () => {
    try {
      setSaving(true);

      // Validate all items have compliance status
      const incompleteItems = auditItems.filter(item => !item.compliance_status);
      if (incompleteItems.length > 0) {
        toast({
          title: "Atenção",
          description: `${incompleteItems.length} requisito(s) sem status de conformidade.`,
          variant: "destructive",
        });
        return;
      }

      // Update all audit items
      for (const item of auditItems) {
        if (item.id) {
          const { error } = await supabase
            .from("sgso_audit_items")
            .update({
              compliance_status: item.compliance_status,
              evidence: item.evidence,
              ai_analysis: item.ai_analysis,
            })
            .eq("id", item.id);

          if (error) throw error;
        }
      }

      // Update audit status to completed
      if (audit?.id) {
        const { error } = await supabase
          .from("sgso_audits")
          .update({ status: "completed", completion_date: new Date().toISOString() })
          .eq("id", audit.id);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Auditoria enviada para validação.",
      });

      navigate("/admin/sgso");
    } catch (error) {
      console.error("Error submitting audit:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a auditoria.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const analyzeWithAI = async (item: SGSOAuditItem) => {
    try {
      setAnalyzingItem(item.requirement_number);

      const response = await supabase.functions.invoke("analyze-sgso-item", {
        body: {
          requirement_title: item.requirement_title,
          description: item.description,
          evidence: item.evidence || "",
          compliance_status: item.compliance_status,
        },
      });

      if (response.error) throw response.error;

      const analysis: AIAnalysis = response.data;
      
      if (item.id) {
        updateAuditItem(item.id, "ai_analysis", analysis);
        
        // Save to database
        await supabase
          .from("sgso_audit_items")
          .update({ ai_analysis: analysis })
          .eq("id", item.id);
      }

      toast({
        title: "Análise concluída",
        description: "A análise por IA foi gerada com sucesso.",
      });
    } catch (error) {
      console.error("Error analyzing with AI:", error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a análise por IA.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingItem(null);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Auditoria SGSO - IBAMA", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Embarcação: ${vesselName || "N/A"}`, 14, 30);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 37);
    doc.text(`Auditor: ${audit?.auditor_id || "N/A"}`, 14, 44);
    
    // Prepare table data
    const tableData = auditItems.map(item => [
      item.requirement_number.toString(),
      item.requirement_title,
      item.compliance_status || "N/A",
      item.evidence || "N/A",
    ]);

    // Add table
    (doc as any).autoTable({
      startY: 55,
      head: [["#", "Requisito", "Status", "Evidência"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 30 },
        3: { cellWidth: 70 },
      },
    });

    // Save PDF
    doc.save(`auditoria-sgso-${vesselName}-${Date.now()}.pdf`);

    toast({
      title: "PDF gerado",
      description: "O relatório foi exportado com sucesso.",
    });
  };

  const getComplianceIcon = (status: string | null) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "non-compliant":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Auditoria SGSO
          </h1>
          <p className="text-muted-foreground mt-2">
            {vesselName ? `Embarcação: ${vesselName}` : "Nova Auditoria"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button onClick={saveAsDraft} disabled={saving} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Rascunho"}
          </Button>
          <Button onClick={submitAudit} disabled={saving}>
            <Send className="mr-2 h-4 w-4" />
            Enviar para Validação
          </Button>
        </div>
      </div>

      {/* Audit Items */}
      <div className="space-y-4">
        {auditItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-lg">
                    {item.requirement_number}
                  </Badge>
                  <div>
                    <CardTitle className="text-xl">{item.requirement_title}</CardTitle>
                    <CardDescription className="mt-2">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
                {getComplianceIcon(item.compliance_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Compliance Status */}
              <div className="space-y-2">
                <Label>Status de Conformidade</Label>
                <Select
                  value={item.compliance_status || ""}
                  onValueChange={(value) =>
                    item.id && updateAuditItem(item.id, "compliance_status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliant">✅ Conformidade</SelectItem>
                    <SelectItem value="non-compliant">❌ Não Conformidade</SelectItem>
                    <SelectItem value="partial">⚠️ Conformidade Parcial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Evidence */}
              <div className="space-y-2">
                <Label>Evidência</Label>
                <Textarea
                  placeholder="Descreva as evidências encontradas (ex: Documento assinado pela diretoria, murais da embarcação, briefing semanal)..."
                  value={item.evidence}
                  onChange={(e) =>
                    item.id && updateAuditItem(item.id, "evidence", e.target.value)
                  }
                  rows={3}
                />
              </div>

              {/* AI Analysis Button */}
              <Button
                onClick={() => analyzeWithAI(item)}
                disabled={analyzingItem === item.requirement_number || !item.evidence}
                variant="secondary"
                className="w-full"
              >
                <Brain className="mr-2 h-4 w-4" />
                {analyzingItem === item.requirement_number ? "Analisando..." : "🧠 Analisar com IA"}
              </Button>

              {/* AI Analysis Results */}
              {item.ai_analysis && (
                <div className="rounded-lg border bg-muted p-4 space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Análise por IA
                  </h4>
                  
                  {item.ai_analysis.causa_provavel && (
                    <div>
                      <p className="text-sm font-medium">Causa Provável:</p>
                      <p className="text-sm text-muted-foreground">{item.ai_analysis.causa_provavel}</p>
                    </div>
                  )}
                  
                  {item.ai_analysis.recomendacao && (
                    <div>
                      <p className="text-sm font-medium">Recomendação:</p>
                      <p className="text-sm text-muted-foreground">{item.ai_analysis.recomendacao}</p>
                    </div>
                  )}
                  
                  {item.ai_analysis.impacto && (
                    <div>
                      <p className="text-sm font-medium">Impacto Operacional:</p>
                      <p className="text-sm text-muted-foreground">{item.ai_analysis.impacto}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SGSOAuditPage;
