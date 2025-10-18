import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Evidence {
  id: string;
  norm: string;
  clause: string;
  description: string;
  evidence_url: string | null;
  evidence_type: string | null;
  validated: boolean;
  created_at: string;
  submitted_by: string;
}

interface MissingEvidence {
  norm: string;
  clause_number: string;
  clause_title: string;
  severity: string;
  has_evidence: boolean;
}

interface NormTemplate {
  id: string;
  norm: string;
  clause_number: string;
  clause_title: string;
  clause_description: string | null;
  severity: string | null;
}

const NORMS = [
  { value: "ISO_9001", label: "ISO 9001" },
  { value: "ISO_14001", label: "ISO 14001" },
  { value: "ISO_45001", label: "ISO 45001" },
  { value: "ISM_CODE", label: "ISM Code" },
  { value: "ISPS_CODE", label: "ISPS Code" },
  { value: "MODU_CODE", label: "MODU Code" },
  { value: "IBAMA", label: "IBAMA" },
  { value: "PETROBRAS", label: "Petrobras" },
  { value: "IMCA", label: "IMCA" },
];

const EVIDENCE_TYPES = [
  { value: "document", label: "Documento" },
  { value: "video", label: "Vídeo" },
  { value: "photo", label: "Foto" },
  { value: "log", label: "Log" },
  { value: "report", label: "Relatório" },
  { value: "certificate", label: "Certificado" },
  { value: "other", label: "Outro" },
];

export default function EvidenceManager() {
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [selectedNorm, setSelectedNorm] = useState<string>("");
  const [clauseFilter, setClauseFilter] = useState<string>("");
  const [showValidatedOnly, setShowValidatedOnly] = useState(false);
  
  // Form state
  const [formNorm, setFormNorm] = useState<string>("");
  const [formClause, setFormClause] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formEvidenceType, setFormEvidenceType] = useState<string>("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const queryClient = useQueryClient();

  // Fetch vessels
  const { data: vessels } = useQuery({
    queryKey: ["vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch evidences
  const { data: evidences, isLoading: evidencesLoading } = useQuery({
    queryKey: ["evidences", selectedVesselId, selectedNorm, showValidatedOnly],
    queryFn: async () => {
      if (!selectedVesselId) return [];
      
      let query = supabase
        .from("compliance_evidences")
        .select("*")
        .eq("vessel_id", selectedVesselId)
        .order("created_at", { ascending: false });
      
      if (selectedNorm) {
        query = query.eq("norm", selectedNorm);
      }
      
      if (showValidatedOnly) {
        query = query.eq("validated", true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Evidence[];
    },
    enabled: !!selectedVesselId,
  });

  // Fetch norm templates
  const { data: normTemplates } = useQuery({
    queryKey: ["norm-templates", formNorm],
    queryFn: async () => {
      if (!formNorm) return [];
      
      const { data, error } = await supabase
        .from("audit_norm_templates")
        .select("*")
        .eq("norm", formNorm)
        .order("clause_number");
      
      if (error) throw error;
      return data;
    },
    enabled: !!formNorm,
  });

  // Fetch missing evidences
  const { data: missingEvidences } = useQuery({
    queryKey: ["missing-evidences", selectedVesselId, selectedNorm],
    queryFn: async () => {
      if (!selectedVesselId) return [];
      
      const { data, error } = await supabase.rpc("get_missing_evidences", {
        p_vessel_id: selectedVesselId,
        p_norm: selectedNorm || null
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedVesselId,
  });

  // Upload evidence mutation
  const uploadEvidenceMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `evidences/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("evidence-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("evidence-files")
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onSuccess: () => {
      toast.success("Arquivo enviado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao enviar arquivo:", error);
      toast.error("Erro ao enviar arquivo");
    },
  });

  // Submit evidence mutation
  const submitEvidenceMutation = useMutation({
    mutationFn: async (data: { norm: string; clause: string; description: string; evidenceType: string; evidenceUrl: string | undefined }) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { error } = await supabase
        .from("compliance_evidences")
        .insert({
          organization_id: profile?.organization_id,
          vessel_id: selectedVesselId,
          norm: data.norm,
          clause: data.clause,
          description: data.description,
          evidence_url: data.evidenceUrl,
          evidence_type: data.evidenceType,
          submitted_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidences"] });
      queryClient.invalidateQueries({ queryKey: ["missing-evidences"] });
      toast.success("Evidência enviada com sucesso!");
      // Reset form
      setFormNorm("");
      setFormClause("");
      setFormDescription("");
      setFormEvidenceType("");
    },
    onError: (error) => {
      console.error("Erro ao enviar evidência:", error);
      toast.error("Erro ao enviar evidência");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await uploadEvidenceMutation.mutateAsync(file);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVesselId || !formNorm || !formClause || !formDescription) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    await submitEvidenceMutation.mutateAsync({
      norm: formNorm,
      clause: formClause,
      description: formDescription,
      evidenceType: formEvidenceType,
      evidenceUrl: uploadEvidenceMutation.data || null,
    });
  };

  const filteredEvidences = evidences?.filter(e => 
    !clauseFilter || e.clause.includes(clauseFilter)
  );

  return (
    <div className="space-y-6">
      {/* Vessel Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Módulo de Evidências para Certificadoras</CardTitle>
          <CardDescription>
            Centralize evidências para ISO, IMO, IBAMA e outras certificações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel">Embarcação</Label>
              <Select value={selectedVesselId} onValueChange={setSelectedVesselId}>
                <SelectTrigger id="vessel">
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels?.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="normFilter">Filtrar por Norma</Label>
              <Select value={selectedNorm} onValueChange={setSelectedNorm}>
                <SelectTrigger id="normFilter">
                  <SelectValue placeholder="Todas as normas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {NORMS.map((norm) => (
                    <SelectItem key={norm.value} value={norm.value}>
                      {norm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar por cláusula..."
                value={clauseFilter}
                onChange={(e) => setClauseFilter(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button
              variant={showValidatedOnly ? "default" : "outline"}
              onClick={() => setShowValidatedOnly(!showValidatedOnly)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showValidatedOnly ? "Validadas" : "Todas"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Missing Evidences Alert */}
      {selectedVesselId && missingEvidences && (missingEvidences as MissingEvidence[]).filter((e) => !e.has_evidence).length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              Evidências Faltantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-3">
              {(missingEvidences as MissingEvidence[]).filter((e) => !e.has_evidence).length} cláusulas sem evidências validadas
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(missingEvidences as MissingEvidence[])
                .filter((e) => !e.has_evidence)
                .slice(0, 5)
                .map((item, idx: number) => (
                  <div key={idx} className="text-xs text-yellow-700">
                    <Badge variant="outline" className="mr-2">{item.norm}</Badge>
                    {item.clause_number}: {item.clause_title}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      {selectedVesselId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Adicionar Nova Evidência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="formNorm">Norma *</Label>
                  <Select value={formNorm} onValueChange={setFormNorm}>
                    <SelectTrigger id="formNorm">
                      <SelectValue placeholder="Selecione" />
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
                  <Label htmlFor="formClause">Cláusula *</Label>
                  {normTemplates && normTemplates.length > 0 ? (
                    <Select value={formClause} onValueChange={setFormClause}>
                      <SelectTrigger id="formClause">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {(normTemplates as NormTemplate[]).map((template) => (
                          <SelectItem key={template.id} value={template.clause_number}>
                            {template.clause_number}: {template.clause_title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="formClause"
                      value={formClause}
                      onChange={(e) => setFormClause(e.target.value)}
                      placeholder="Ex: 4.1"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formDescription">Descrição *</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descreva a evidência..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="formEvidenceType">Tipo de Evidência</Label>
                  <Select value={formEvidenceType} onValueChange={setFormEvidenceType}>
                    <SelectTrigger id="formEvidenceType">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVIDENCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileUpload">Arquivo (opcional)</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitEvidenceMutation.isPending}>
                {submitEvidenceMutation.isPending ? "Enviando..." : "Enviar Evidência"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Evidences Table */}
      {selectedVesselId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Evidências Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {evidencesLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : filteredEvidences && filteredEvidences.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Norma</TableHead>
                    <TableHead>Cláusula</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvidences.map((evidence) => (
                    <TableRow key={evidence.id}>
                      <TableCell>
                        <Badge variant="outline">{evidence.norm}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{evidence.clause}</TableCell>
                      <TableCell className="max-w-xs truncate">{evidence.description}</TableCell>
                      <TableCell>{evidence.evidence_type || "-"}</TableCell>
                      <TableCell>
                        {evidence.validated ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validada
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(evidence.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma evidência cadastrada
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
