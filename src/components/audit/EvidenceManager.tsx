// ETAPA 32.3: Evidence Management System for Certifications
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";

interface Evidence {
  id: string;
  vessel_id: string;
  norm: string;
  clause: string;
  description: string;
  evidence_url: string;
  file_name: string;
  file_type: string;
  validated: boolean;
  submitted_by: string;
  created_at: string;
}

interface NormTemplate {
  id: string;
  norm: string;
  clause_number: string;
  clause_title: string;
  clause_description: string;
  required_evidence_types: string[];
}

const NORMS = [
  { value: "ISO-9001", label: "ISO 9001 - Gestão da Qualidade" },
  { value: "ISO-14001", label: "ISO 14001 - Gestão Ambiental" },
  { value: "ISO-45001", label: "ISO 45001 - Saúde e Segurança" },
  { value: "ISM-Code", label: "ISM Code" },
  { value: "ISPS-Code", label: "ISPS Code" },
  { value: "MODU-Code", label: "MODU Code" },
  { value: "IBAMA", label: "IBAMA" },
  { value: "Petrobras", label: "Petrobras" },
  { value: "IMCA", label: "IMCA" },
];

export const EvidenceManager: React.FC = () => {
  const [selectedNorm, setSelectedNorm] = useState("");
  const [selectedVessel, setSelectedVessel] = useState("");
  const [vessels, setVessels] = useState<string[]>([]);
  const [templates, setTemplates] = useState<NormTemplate[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [missingEvidences, setMissingEvidences] = useState<NormTemplate[]>([]);
  const [uploadingClause, setUploadingClause] = useState<string | null>(null);
  const [filterValidated, setFilterValidated] = useState<string>("all");

  useEffect(() => {
    loadVessels();
  }, []);

  useEffect(() => {
    if (selectedNorm) {
      loadTemplates();
      if (selectedVessel) {
        loadEvidences();
        loadMissingEvidences();
      }
    }
  }, [selectedNorm, selectedVessel]);

  const loadVessels = async () => {
    try {
      const { data, error } = await supabase
        .from("dp_incidents")
        .select("vessel")
        .order("vessel");

      if (error) throw error;

      const uniqueVessels = [...new Set(data?.map((d) => d.vessel) || [])];
      setVessels(uniqueVessels);
    } catch (error: any) {
      console.error("Erro ao carregar embarcações:", error);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_norm_templates")
        .select("*")
        .eq("norm", selectedNorm)
        .order("clause_number");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar templates:", error);
      toast.error("Erro ao carregar cláusulas da norma");
    }
  };

  const loadEvidences = async () => {
    try {
      const { data, error } = await supabase
        .from("compliance_evidences")
        .select("*")
        .eq("norm", selectedNorm)
        .eq("vessel_id", selectedVessel)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvidences(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar evidências:", error);
      toast.error("Erro ao carregar evidências");
    }
  };

  const loadMissingEvidences = async () => {
    try {
      const { data, error } = await supabase.rpc("get_missing_evidences", {
        p_vessel_id: selectedVessel,
        p_norm: selectedNorm,
      });

      if (error) throw error;
      setMissingEvidences(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar evidências faltantes:", error);
    }
  };

  const handleFileUpload = async (clause: string, clauseTitle: string, file: File) => {
    if (!selectedVessel || !selectedNorm) {
      toast.error("Selecione uma embarcação e norma");
      return;
    }

    setUploadingClause(clause);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedVessel}/${selectedNorm}/${clause}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("evidence-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("evidence-files")
        .getPublicUrl(fileName);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Save evidence record
      const { error: insertError } = await supabase
        .from("compliance_evidences")
        .insert({
          vessel_id: selectedVessel,
          norm: selectedNorm,
          clause: clause,
          description: clauseTitle,
          evidence_url: urlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
          submitted_by: user?.id,
          validated: false,
        });

      if (insertError) throw insertError;

      toast.success("Evidência enviada com sucesso!");
      loadEvidences();
      loadMissingEvidences();
    } catch (error: any) {
      console.error("Erro ao enviar evidência:", error);
      toast.error(error.message || "Erro ao enviar evidência");
    } finally {
      setUploadingClause(null);
    }
  };

  const handleValidateEvidence = async (evidenceId: string, validated: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("compliance_evidences")
        .update({
          validated,
          validated_by: user?.id,
          validated_at: new Date().toISOString(),
        })
        .eq("id", evidenceId);

      if (error) throw error;

      toast.success(validated ? "Evidência validada!" : "Validação removida");
      loadEvidences();
      loadMissingEvidences();
    } catch (error: any) {
      console.error("Erro ao validar evidência:", error);
      toast.error("Erro ao validar evidência");
    }
  };

  const filteredEvidences = evidences.filter((e) => {
    if (filterValidated === "all") return true;
    if (filterValidated === "validated") return e.validated;
    if (filterValidated === "pending") return !e.validated;
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Evidências para Certificações</CardTitle>
          <CardDescription>
            Centralize todas as evidências exigidas por normas e certificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="norm-select">Norma</Label>
              <Select value={selectedNorm} onValueChange={setSelectedNorm}>
                <SelectTrigger id="norm-select">
                  <SelectValue placeholder="Selecione a norma" />
                </SelectTrigger>
                <SelectContent>
                  {NORMS.map((norm) => (
                    <SelectItem key={norm.value} value={norm.value}>
                      {norm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vessel-select-evidence">Embarcação</Label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger id="vessel-select-evidence">
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel} value={vessel}>
                      {vessel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-validated">Filtrar por Status</Label>
              <Select value={filterValidated} onValueChange={setFilterValidated}>
                <SelectTrigger id="filter-validated">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="validated">Validadas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedNorm && selectedVessel && missingEvidences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
              Evidências Faltantes ({missingEvidences.length})
            </CardTitle>
            <CardDescription>
              Cláusulas da norma {selectedNorm} sem evidências validadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {missingEvidences.map((template) => (
                <Card key={template.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{template.clause_number}</Badge>
                          <span className="font-semibold">{template.clause_title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.clause_description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Tipos aceitos: {template.required_evidence_types.join(", ")}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Input
                          type="file"
                          id={`upload-${template.clause_number}`}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(template.clause_number, template.clause_title, file);
                            }
                          }}
                          disabled={uploadingClause === template.clause_number}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={uploadingClause === template.clause_number}
                          onClick={() => {
                            document.getElementById(`upload-${template.clause_number}`)?.click();
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {uploadingClause === template.clause_number ? "Enviando..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedNorm && selectedVessel && (
        <Card>
          <CardHeader>
            <CardTitle>Evidências Enviadas ({filteredEvidences.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEvidences.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma evidência encontrada. Faça upload das evidências necessárias.
                </p>
              ) : (
                filteredEvidences.map((evidence) => (
                  <Card key={evidence.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{evidence.clause}</Badge>
                            {evidence.validated ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Validado
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="mr-1 h-3 w-3" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium mb-1">{evidence.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <FileText className="mr-1 h-3 w-3" />
                              {evidence.file_name}
                            </span>
                            <span>{new Date(evidence.created_at).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(evidence.evidence_url, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {!evidence.validated ? (
                            <Button
                              size="sm"
                              onClick={() => handleValidateEvidence(evidence.id, true)}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Validar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleValidateEvidence(evidence.id, false)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Remover
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
