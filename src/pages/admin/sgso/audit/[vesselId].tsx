import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SGSO_REQUIREMENTS, ComplianceStatus, SGSOAuditItem, AIAnalysis } from "@/types/sgso-audit";
import { 
  Shield, 
  Save, 
  Send, 
  FileDown, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SGSOAuditPage = () => {
  const { vesselId } = useParams<{ vesselId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzingItems, setAnalyzingItems] = useState<Set<number>>(new Set());
  const [auditId, setAuditId] = useState<string | null>(null);
  const [vesselName, setVesselName] = useState<string>("");
  const [auditItems, setAuditItems] = useState<SGSOAuditItem[]>([]);

  useEffect(() => {
    loadAuditData();
  }, [vesselId]);

  const loadAuditData = async () => {
    try {
      setLoading(true);

      // Get vessel info
      if (vesselId) {
        const { data: vessel } = await supabase
          .from("vessels")
          .select("name")
          .eq("id", vesselId)
          .single();
        
        if (vessel) {
          setVesselName(vessel.name);
        }
      }

      // Get or create audit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Get user's organization
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile?.organization_id) {
        toast({
          title: "Erro",
          description: "Organização não encontrada",
          variant: "destructive"
        });
        return;
      }

      // Check for existing in-progress audit for this vessel
      const { data: existingAudit } = await supabase
        .from("sgso_audits")
        .select("*")
        .eq("vessel_id", vesselId)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let currentAuditId: string;

      if (existingAudit) {
        currentAuditId = existingAudit.id;
        setAuditId(currentAuditId);
      } else {
        // Create new audit
        const auditNumber = `SGSO-${Date.now()}`;
        const { data: newAudit, error: auditError } = await supabase
          .from("sgso_audits")
          .insert({
            organization_id: profile.organization_id,
            audit_number: auditNumber,
            audit_type: "internal",
            audit_scope: "Auditoria SGSO - 17 Requisitos ANP",
            audit_date: new Date().toISOString(),
            status: "in_progress",
            vessel_id: vesselId
          })
          .select()
          .single();

        if (auditError) {
          throw auditError;
        }

        currentAuditId = newAudit.id;
        setAuditId(currentAuditId);

        // Create audit items for all 17 requirements
        const items = SGSO_REQUIREMENTS.map(req => ({
          audit_id: currentAuditId,
          requirement_number: req.requirement_number,
          requirement_title: req.requirement_title,
          description: req.description,
          compliance_status: 'pending' as ComplianceStatus,
          evidence: '',
          ai_analysis: null
        }));

        await supabase.from("sgso_audit_items").insert(items);
      }

      // Load audit items
      const { data: items, error: itemsError } = await supabase
        .from("sgso_audit_items")
        .select("*")
        .eq("audit_id", currentAuditId)
        .order("requirement_number");

      if (itemsError) {
        throw itemsError;
      }

      setAuditItems(items || []);
    } catch (error) {
      console.error("Error loading audit data:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da auditoria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAuditItem = (requirementNumber: number, field: keyof SGSOAuditItem, value: any) => {
    setAuditItems(prev =>
      prev.map(item =>
        item.requirement_number === requirementNumber
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const analyzeWithAI = async (item: SGSOAuditItem) => {
    if (!item.evidence || item.evidence.trim() === '') {
      toast({
        title: "Atenção",
        description: "Por favor, adicione evidências antes de analisar com IA",
        variant: "destructive"
      });
      return;
    }

    setAnalyzingItems(prev => new Set(prev).add(item.requirement_number));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      // Call Supabase Edge Function for AI analysis
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/analyze-sgso-requirement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            requirement: item.requirement_title,
            description: item.description,
            evidence: item.evidence,
            compliance_status: item.compliance_status
          })
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao analisar com IA");
      }

      const analysis: AIAnalysis = await response.json();

      // Update the item with AI analysis
      updateAuditItem(item.requirement_number, 'ai_analysis', analysis);

      toast({
        title: "Análise Concluída",
        description: "Análise de IA realizada com sucesso"
      });
    } catch (error) {
      console.error("Error analyzing with AI:", error);
      toast({
        title: "Erro",
        description: "Erro ao analisar com IA. Verifique se a função está configurada.",
        variant: "destructive"
      });
    } finally {
      setAnalyzingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.requirement_number);
        return newSet;
      });
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);

      // Update all audit items
      for (const item of auditItems) {
        await supabase
          .from("sgso_audit_items")
          .update({
            compliance_status: item.compliance_status,
            evidence: item.evidence,
            ai_analysis: item.ai_analysis
          })
          .eq("id", item.id);
      }

      toast({
        title: "Rascunho Salvo",
        description: "Auditoria salva como rascunho"
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar rascunho",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const submitAudit = async () => {
    try {
      setSaving(true);

      // Validate all items have been assessed
      const pendingItems = auditItems.filter(item => item.compliance_status === 'pending');
      if (pendingItems.length > 0) {
        toast({
          title: "Atenção",
          description: `${pendingItems.length} requisito(s) ainda pendente(s) de avaliação`,
          variant: "destructive"
        });
        return;
      }

      // Update all audit items
      for (const item of auditItems) {
        await supabase
          .from("sgso_audit_items")
          .update({
            compliance_status: item.compliance_status,
            evidence: item.evidence,
            ai_analysis: item.ai_analysis
          })
          .eq("id", item.id);
      }

      // Update audit status
      if (auditId) {
        await supabase
          .from("sgso_audits")
          .update({
            status: "completed",
            completion_date: new Date().toISOString()
          })
          .eq("id", auditId);
      }

      toast({
        title: "Auditoria Enviada",
        description: "Auditoria submetida para validação"
      });

      navigate("/admin/sgso");
    } catch (error) {
      console.error("Error submitting audit:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar auditoria",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text("Auditoria SGSO - ANP Resolução 43/2007", 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Embarcação: ${vesselName}`, 14, 30);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);

      // Audit items table
      const tableData = auditItems.map(item => [
        item.requirement_number.toString(),
        item.requirement_title,
        item.compliance_status === 'compliant' ? 'Conforme' :
        item.compliance_status === 'non_compliant' ? 'Não Conforme' :
        item.compliance_status === 'partial' ? 'Parcial' : 'Pendente',
        item.evidence || 'N/A'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['#', 'Requisito', 'Status', 'Evidência']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 70 },
          2: { cellWidth: 30 },
          3: { cellWidth: 70 }
        }
      });

      doc.save(`auditoria-sgso-${vesselName}-${Date.now()}.pdf`);

      toast({
        title: "PDF Exportado",
        description: "Relatório de auditoria exportado com sucesso"
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao exportar PDF",
        variant: "destructive"
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
    const variants = {
      compliant: "default",
      non_compliant: "destructive",
      partial: "outline",
      pending: "secondary"
    } as const;

    const labels = {
      compliant: "Conforme",
      non_compliant: "Não Conforme",
      partial: "Parcial",
      pending: "Pendente"
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/sgso")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Auditoria SGSO
            </h1>
            <p className="text-muted-foreground mt-1">
              Embarcação: {vesselName} - 17 Requisitos ANP
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={saveDraft} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Rascunho
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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(item.compliance_status)}
                    <CardTitle className="text-lg">
                      {item.requirement_number}. {item.requirement_title}
                    </CardTitle>
                    {getStatusBadge(item.compliance_status)}
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </div>
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
                  onValueChange={(value) =>
                    updateAuditItem(item.requirement_number, 'compliance_status', value as ComplianceStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliant">✅ Conforme</SelectItem>
                    <SelectItem value="non_compliant">❌ Não Conforme</SelectItem>
                    <SelectItem value="partial">⚠️ Parcial</SelectItem>
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
                  placeholder="Descreva as evidências encontradas durante a auditoria..."
                  value={item.evidence || ''}
                  onChange={(e) =>
                    updateAuditItem(item.requirement_number, 'evidence', e.target.value)
                  }
                  rows={4}
                />
              </div>

              {/* AI Analysis Button */}
              <Button
                variant="outline"
                onClick={() => analyzeWithAI(item)}
                disabled={analyzingItems.has(item.requirement_number) || !item.evidence}
              >
                {analyzingItems.has(item.requirement_number) ? (
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

              {/* AI Analysis Results */}
              {item.ai_analysis && (
                <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
                  <h4 className="font-semibold text-sm">Análise de IA</h4>
                  
                  {item.ai_analysis.causa_provavel && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Causa Provável:</p>
                      <p className="text-sm">{item.ai_analysis.causa_provavel}</p>
                    </div>
                  )}
                  
                  {item.ai_analysis.recomendacao && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Recomendação:</p>
                      <p className="text-sm">{item.ai_analysis.recomendacao}</p>
                    </div>
                  )}
                  
                  {item.ai_analysis.impacto && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Impacto:</p>
                      <p className="text-sm">{item.ai_analysis.impacto}</p>
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
