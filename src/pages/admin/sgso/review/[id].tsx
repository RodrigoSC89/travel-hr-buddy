"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2pdf from "html2pdf.js";

interface AuditItem {
  id: string
  requirement_number: number
  requirement_title: string
  compliance_status: "compliant" | "partial" | "non-compliant"
  evidence: string
  comment: string
}

interface Audit {
  id: string
  audit_date: string
  vessel_id: string
  auditor_id: string
  vessels?: {
    name: string
  }
  users?: {
    full_name: string
  }
  sgso_audit_items: AuditItem[]
}

const complianceStatusLabels = {
  compliant: "Conforme",
  partial: "Parcialmente Conforme",
  "non-compliant": "Não Conforme"
};

const complianceStatusColors = {
  compliant: "bg-green-100 text-green-800 border-green-300",
  partial: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "non-compliant": "bg-red-100 text-red-800 border-red-300"
};

export default function SGSOAuditReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const [audit, setAudit] = useState<Audit | null>(null);
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchAudit = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("sgso_audits")
          .select(`
            id,
            audit_date,
            vessel_id,
            auditor_id,
            vessels ( name ),
            users:auditor_id ( full_name ),
            sgso_audit_items (
              id,
              requirement_number,
              requirement_title,
              compliance_status,
              evidence,
              comment
            )
          `)
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching audit:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar a auditoria",
            variant: "destructive"
          });
        } else if (data) {
          setAudit(data as Audit);
          setItems((data.sgso_audit_items || []).sort((a, b) => a.requirement_number - b.requirement_number));
        }
      } catch (err) {
        console.error("Error:", err);
        toast({
          title: "Erro",
          description: "Erro ao buscar auditoria",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [id, toast]);

  const handleItemUpdate = (itemId: string, field: string, value: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = items.map(item => ({
        id: item.id,
        compliance_status: item.compliance_status,
        evidence: item.evidence,
        comment: item.comment
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("sgso_audit_items")
          .update({
            compliance_status: update.compliance_status,
            evidence: update.evidence,
            comment: update.comment
          })
          .eq("id", update.id);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Auditoria atualizada com sucesso"
      });
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    setExporting(true);
    try {
      const element = contentRef.current;
      const opt = {
        margin: 10,
        filename: `auditoria-sgso-${audit?.vessels?.name || "sem-nome"}-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      await html2pdf().set(opt).from(element).save();

      toast({
        title: "Sucesso",
        description: "PDF exportado com sucesso"
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao exportar PDF",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Auditoria não encontrada</p>
          <Link to="/admin/sgso/history">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Histórico
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/sgso/history">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Revisão de Auditoria SGSO</h1>
            <p className="text-sm text-muted-foreground">
              {audit.vessels?.name} - {new Date(audit.audit_date).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            variant="default"
          >
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
          <Button 
            onClick={handleExportPDF} 
            disabled={exporting}
            variant="outline"
          >
            {exporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Audit Info Card */}
      <Card ref={contentRef}>
        <CardHeader>
          <CardTitle>Informações da Auditoria</CardTitle>
          <CardDescription>
            Detalhes e itens verificados nesta auditoria SGSO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Embarcação</p>
              <p className="font-semibold">{audit.vessels?.name || "---"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auditor</p>
              <p className="font-semibold">{audit.users?.full_name || "---"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data da Auditoria</p>
              <p className="font-semibold">{new Date(audit.audit_date).toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Requisitos</p>
              <p className="font-semibold">{items.length} itens</p>
            </div>
          </div>

          {/* Audit Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mt-6">Itens da Auditoria</h3>
            {items.map((item) => (
              <Card key={item.id} className="border-l-4" style={{
                borderLeftColor: item.compliance_status === "compliant" ? "#22c55e" :
                  item.compliance_status === "partial" ? "#eab308" : "#ef4444"
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {item.requirement_number}. {item.requirement_title}
                    </CardTitle>
                    <Badge className={complianceStatusColors[item.compliance_status]}>
                      {complianceStatusLabels[item.compliance_status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status de Conformidade</label>
                    <Select
                      value={item.compliance_status}
                      onValueChange={(value) => handleItemUpdate(item.id, "compliance_status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compliant">Conforme</SelectItem>
                        <SelectItem value="partial">Parcialmente Conforme</SelectItem>
                        <SelectItem value="non-compliant">Não Conforme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Evidências</label>
                    <Textarea
                      value={item.evidence || ""}
                      onChange={(e) => handleItemUpdate(item.id, "evidence", e.target.value)}
                      placeholder="Descreva as evidências encontradas..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Comentários</label>
                    <Textarea
                      value={item.comment || ""}
                      onChange={(e) => handleItemUpdate(item.id, "comment", e.target.value)}
                      placeholder="Adicione comentários adicionais..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
