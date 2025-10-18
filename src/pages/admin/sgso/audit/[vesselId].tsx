import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Save, 
  Send, 
  FileText, 
  Brain, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle 
} from "lucide-react";
import { 
  SGSO_REQUIREMENTS, 
  SGSOAuditItem, 
  SGSOAudit,
  ComplianceStatus,
  AIAnalysis 
} from "@/types/sgso-audit";
import { analyzeSGSOItemWithAI, exportSGSOAuditToPDF } from "@/lib/sgso-audit-helpers";

const SGSOAuditPage = () => {
  const { vesselId } = useParams<{ vesselId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [audit, setAudit] = useState<SGSOAudit | null>(null);
  const [auditItems, setAuditItems] = useState<SGSOAuditItem[]>([]);
  const [vesselName, setVesselName] = useState<string>("");

  useEffect(() => {
    loadAuditData();
  }, [vesselId]);

  const loadAuditData = async () => {
    try {
      setLoading(true);

      // Load vessel info
      const { data: vesselData } = await supabase
        .from("vessels")
        .select("name")
        .eq("id", vesselId)
        .single();
      
      if (vesselData) {
        setVesselName(vesselData.name);
      }

      // Check if there's an existing in-progress audit for this vessel
      const { data: existingAudit } = await supabase
        .from("sgso_audits")
        .select("*")
        .eq("vessel_id", vesselId)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingAudit) {
        setAudit(existingAudit);
        // Load existing audit items
        const { data: items } = await supabase
          .from("sgso_audit_items")
          .select("*")
          .eq("audit_id", existingAudit.id)
          .order("requirement_number");
        
        if (items) {
          setAuditItems(items);
        }
      } else {
        // Create new audit
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", (await supabase.auth.getUser()).data.user?.id)
          .single();

        const auditNumber = `SGSO-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const { data: newAudit, error: auditError } = await supabase
          .from("sgso_audits")
          .insert({
            organization_id: profile?.organization_id,
            audit_number: auditNumber,
            audit_type: "internal",
            audit_scope: "17 Práticas ANP - Resolução 43/2007",
            audit_date: new Date().toISOString(),
            status: "in_progress",
            vessel_id: vesselId,
          })
          .select()
          .single();

        if (auditError) throw auditError;
        
        setAudit(newAudit);

        // Create audit items for all 17 requirements
        const items = SGSO_REQUIREMENTS.map(req => ({
          audit_id: newAudit.id,
          requirement_number: req.requirement_number,
          requirement_title: req.requirement_title,
          description: req.description,
          compliance_status: 'pending' as ComplianceStatus,
          evidence: '',
          ai_analysis: {},
          notes: ''
        }));

        const { data: createdItems, error: itemsError } = await supabase
          .from("sgso_audit_items")
          .insert(items)
          .select();

        if (itemsError) throw itemsError;
        
        if (createdItems) {
          setAuditItems(createdItems);
        }
      }
    } catch (error: any) {
      console.error("Error loading audit data:", error);
      toast({
        title: "Erro ao carregar auditoria",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (itemId: string, status: ComplianceStatus) => {
    setAuditItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, compliance_status: status } : item
      )
    );
  };

  const handleEvidenceChange = (itemId: string, evidence: string) => {
    setAuditItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, evidence } : item
      )
    );
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setAuditItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const handleAIAnalysis = async (item: SGSOAuditItem) => {
    try {
      setAnalyzingId(item.id);
      
      const analysis = await analyzeSGSOItemWithAI(
        item.requirement_title,
        item.description,
        item.evidence || "",
        item.compliance_status
      );

      setAuditItems(items =>
        items.map(i =>
          i.id === item.id ? { ...i, ai_analysis: analysis } : i
        )
      );

      toast({
        title: "Análise IA concluída",
        description: "A análise foi gerada com sucesso.",
      });
    } catch (error: any) {
      console.error("Error analyzing with AI:", error);
      toast({
        title: "Erro na análise IA",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      // Update all audit items
      for (const item of auditItems) {
        await supabase
          .from("sgso_audit_items")
          .update({
            compliance_status: item.compliance_status,
            evidence: item.evidence,
            ai_analysis: item.ai_analysis,
            notes: item.notes,
          })
          .eq("id", item.id);
      }

      toast({
        title: "Rascunho salvo",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Validate that all items have been reviewed
      const pendingItems = auditItems.filter(item => item.compliance_status === 'pending');
      if (pendingItems.length > 0) {
        toast({
          title: "Auditoria incompleta",
          description: `Existem ${pendingItems.length} requisitos pendentes de avaliação.`,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Update all audit items
      for (const item of auditItems) {
        await supabase
          .from("sgso_audit_items")
          .update({
            compliance_status: item.compliance_status,
            evidence: item.evidence,
            ai_analysis: item.ai_analysis,
            notes: item.notes,
          })
          .eq("id", item.id);
      }

      // Update audit status
      if (audit) {
        await supabase
          .from("sgso_audits")
          .update({
            status: "completed",
            completion_date: new Date().toISOString(),
          })
          .eq("id", audit.id);
      }

      toast({
        title: "Auditoria finalizada",
        description: "A auditoria foi concluída e enviada com sucesso.",
      });

      // Navigate back to SGSO admin page
      navigate("/admin/sgso");
    } catch (error: any) {
      console.error("Error submitting audit:", error);
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!audit) return;
      
      await exportSGSOAuditToPDF(audit, auditItems, vesselName);
      
      toast({
        title: "PDF exportado",
        description: "O relatório foi gerado com sucesso.",
      });
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'non_compliant':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ComplianceStatus) => {
    const variants: Record<ComplianceStatus, string> = {
      compliant: "bg-green-100 text-green-800 border-green-300",
      non_compliant: "bg-red-100 text-red-800 border-red-300",
      partial: "bg-yellow-100 text-yellow-800 border-yellow-300",
      pending: "bg-gray-100 text-gray-800 border-gray-300"
    };
    
    const labels: Record<ComplianceStatus, string> = {
      compliant: "Conforme",
      non_compliant: "Não Conforme",
      partial: "Parcialmente Conforme",
      pending: "Pendente"
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const complianceStats = {
    compliant: auditItems.filter(i => i.compliance_status === 'compliant').length,
    non_compliant: auditItems.filter(i => i.compliance_status === 'non_compliant').length,
    partial: auditItems.filter(i => i.compliance_status === 'partial').length,
    pending: auditItems.filter(i => i.compliance_status === 'pending').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/sgso")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Auditoria SGSO - {vesselName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {audit?.audit_number} | 17 Práticas ANP - Resolução 43/2007
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={saving}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Rascunho
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Finalizar Auditoria
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{complianceStats.compliant}</div>
              <div className="text-sm text-muted-foreground">Conformes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{complianceStats.non_compliant}</div>
              <div className="text-sm text-muted-foreground">Não Conformes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{complianceStats.partial}</div>
              <div className="text-sm text-muted-foreground">Parciais</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{complianceStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Items */}
      <div className="space-y-4">
        {auditItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(item.compliance_status)}
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {item.requirement_number}. {item.requirement_title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(item.compliance_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Compliance Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Status de Conformidade
                </label>
                <Select
                  value={item.compliance_status}
                  onValueChange={(value) => handleStatusChange(item.id, value as ComplianceStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliant">✅ Conforme</SelectItem>
                    <SelectItem value="partial">⚠️ Parcialmente Conforme</SelectItem>
                    <SelectItem value="non_compliant">❌ Não Conforme</SelectItem>
                    <SelectItem value="pending">⏳ Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Evidence */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Evidências
                </label>
                <Textarea
                  value={item.evidence || ""}
                  onChange={(e) => handleEvidenceChange(item.id, e.target.value)}
                  placeholder="Descreva as evidências encontradas para este requisito..."
                  rows={3}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Observações
                </label>
                <Textarea
                  value={item.notes || ""}
                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              {/* AI Analysis */}
              {Object.keys(item.ai_analysis || {}).length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Análise IA
                  </h4>
                  <div className="space-y-2 text-sm">
                    {item.ai_analysis.causa_provavel && (
                      <div>
                        <span className="font-medium">Causa Provável:</span>{" "}
                        {item.ai_analysis.causa_provavel}
                      </div>
                    )}
                    {item.ai_analysis.recomendacao && (
                      <div>
                        <span className="font-medium">Recomendação:</span>{" "}
                        {item.ai_analysis.recomendacao}
                      </div>
                    )}
                    {item.ai_analysis.impacto && (
                      <div>
                        <span className="font-medium">Impacto:</span>{" "}
                        {item.ai_analysis.impacto}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Analysis Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAIAnalysis(item)}
                disabled={analyzingId === item.id || !item.evidence}
              >
                {analyzingId === item.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analisar com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SGSOAuditPage;
