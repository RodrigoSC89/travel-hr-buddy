import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createLazyWorker } from '@/lib/ocr/lazy-tesseract';
import { logger } from '@/lib/logger';
import {
  Upload,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  Loader2,
  FileCheck,
  Camera,
  ScanLine
} from "lucide-react";

interface Evidence {
  id: string;
  practice_number: string;
  practice_name: string;
  evidence_type: string;
  title: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  ocr_text?: string;
  ocr_confidence?: number;
  compliance_status?: string;
  justification?: string;
  created_at: string;
}

const ANP_PRACTICES = [
  { number: "PG1", name: "Liderança e Comprometimento" },
  { number: "PG2", name: "Política de SGSO" },
  { number: "PG3", name: "Organização e Recursos" },
  { number: "PG4", name: "Competência, Treinamento e Desempenho" },
  { number: "PG5", name: "Comunicação" },
  { number: "PG6", name: "Documentação" },
  { number: "PG7", name: "Gestão de Riscos" },
  { number: "PG8", name: "Projeto, Construção e Comissionamento" },
  { number: "PG9", name: "Operação e Manutenção" },
  { number: "PG10", name: "Gestão de Mudanças" },
  { number: "PG11", name: "Gestão de Contratadas" },
  { number: "PG12", name: "Investigação de Incidentes" },
  { number: "PG13", name: "Integridade Mecânica" },
  { number: "PG14", name: "Preparação para Emergências" },
  { number: "PG15", name: "Auditorias e Análise Crítica" },
  { number: "PG16", name: "Segurança de Processo" },
  { number: "PG17", name: "Indicadores de Desempenho" }
];

export const SGSOEvidenceManager: React.FC = () => {
  const { toast } = useToast();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newEvidence, setNewEvidence] = useState({
    practice_number: "",
    practice_name: "",
    evidence_type: "document",
    title: "",
    description: "",
    compliance_status: "compliant",
    justification: ""
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<{ text: string; confidence: number } | null>(null);

  // Load evidences from Supabase on mount
  const loadEvidences = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sgso_evidence')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEvidences((data || []).map(e => ({
        id: e.id,
        practice_number: e.practice_number,
        practice_name: e.practice_name,
        evidence_type: e.evidence_type || 'document',
        title: e.title,
        description: e.description || undefined,
        file_url: e.file_url || undefined,
        file_name: e.file_name || undefined,
        ocr_text: e.ocr_text || undefined,
        ocr_confidence: e.ocr_confidence ? Number(e.ocr_confidence) : undefined,
        compliance_status: e.compliance_status || undefined,
        justification: e.justification || undefined,
        created_at: e.created_at || new Date().toISOString()
      })));
    } catch (error) {
      logger.error("Error loading evidences:", error);
      toast({
        title: "Erro ao carregar evidências",
        description: "Não foi possível carregar as evidências do banco de dados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadEvidences();
  }, [loadEvidences]);

  const processOCR = async (file: File): Promise<{ text: string; confidence: number }> => {
    setIsProcessingOCR(true);
    try {
      const worker = await createLazyWorker('por');
      const imageUrl = URL.createObjectURL(file);
      const { data } = await worker.recognize(imageUrl);
      await worker.terminate();
      URL.revokeObjectURL(imageUrl);
      
      return {
        text: data.text,
        confidence: data.confidence
      };
    } catch (error) {
      logger.error("OCR Error:", error);
      throw error;
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    // Check if it's an image for OCR
    if (file.type.startsWith('image/')) {
      toast({
        title: "🔍 Processando OCR...",
        description: "Extraindo texto da imagem automaticamente"
      });

      try {
        const result = await processOCR(file);
        setOcrResult(result);
        toast({
          title: "✅ OCR Concluído",
          description: `Confiança: ${result.confidence.toFixed(1)}%`
        });
      } catch {
        toast({
          title: "⚠️ OCR Falhou",
          description: "Não foi possível extrair texto da imagem",
          variant: "destructive"
        });
      }
    }
  };

  const handlePracticeChange = (practiceNumber: string) => {
    const practice = ANP_PRACTICES.find(p => p.number === practiceNumber);
    setNewEvidence(prev => ({
      ...prev,
      practice_number: practiceNumber,
      practice_name: practice?.name || ""
    }));
  };

  const uploadEvidence = async () => {
    if (!newEvidence.title || !newEvidence.practice_number) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e prática de gestão",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      if (uploadedFile) {
        const filePath = `${Date.now()}_${uploadedFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from('sgso-evidence')
          .upload(filePath, uploadedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('sgso-evidence')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = uploadedFile.name;
        fileSize = uploadedFile.size;
      }

      // Get current user and organization
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para registrar evidências",
          variant: "destructive"
        });
        return;
      }

      // Try organization_members first, fallback to organization_users
      let { data: orgData, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!orgData) {
        const { data: legacyOrg, error: legacyError } = await supabase
          .from('organization_users')
          .select('organization_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        orgData = legacyOrg;
        if (!orgData) orgError = legacyError;
      }

      if (orgError || !orgData?.organization_id) {
        toast({
          title: "Organização não encontrada",
          description: "Você precisa estar associado a uma organização",
          variant: "destructive"
        });
        return;
      }

      // Insert into Supabase with validated organization_id
      const { data: insertedEvidence, error: insertError } = await supabase
        .from('sgso_evidence')
        .insert({
          organization_id: orgData.organization_id,
          practice_number: newEvidence.practice_number,
          practice_name: newEvidence.practice_name,
          evidence_type: newEvidence.evidence_type,
          title: newEvidence.title,
          description: newEvidence.description || null,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          ocr_text: ocrResult?.text || null,
          ocr_confidence: ocrResult?.confidence || null,
          compliance_status: newEvidence.compliance_status,
          justification: newEvidence.justification || null,
          created_by: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      const newEvidenceData: Evidence = {
        id: insertedEvidence.id,
        practice_number: insertedEvidence.practice_number,
        practice_name: insertedEvidence.practice_name,
        evidence_type: insertedEvidence.evidence_type || 'document',
        title: insertedEvidence.title,
        description: insertedEvidence.description || undefined,
        file_url: insertedEvidence.file_url || undefined,
        file_name: insertedEvidence.file_name || undefined,
        ocr_text: insertedEvidence.ocr_text || undefined,
        ocr_confidence: insertedEvidence.ocr_confidence ? Number(insertedEvidence.ocr_confidence) : undefined,
        compliance_status: insertedEvidence.compliance_status || undefined,
        justification: insertedEvidence.justification || undefined,
        created_at: insertedEvidence.created_at || new Date().toISOString()
      };

      setEvidences(prev => [newEvidenceData, ...prev]);

      toast({
        title: "✅ Evidência Registrada",
        description: `Evidência para ${newEvidence.practice_number} salva com sucesso`
      });

      // Reset form
      setNewEvidence({
        practice_number: "",
        practice_name: "",
        evidence_type: "document",
        title: "",
        description: "",
        compliance_status: "compliant",
        justification: ""
      });
      setUploadedFile(null);
      setOcrResult(null);
      setDialogOpen(false);

    } catch (error) {
      logger.error("Upload error:", error);
      toast({
        title: "Erro no Upload",
        description: "Falha ao salvar evidência",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteEvidence = async (evidenceId: string) => {
    try {
      const { error } = await supabase
        .from('sgso_evidence')
        .delete()
        .eq('id', evidenceId);

      if (error) throw error;

      setEvidences(prev => prev.filter(e => e.id !== evidenceId));
      toast({
        title: "Evidência removida",
        description: "A evidência foi excluída com sucesso"
      });
    } catch (error) {
      logger.error("Delete error:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a evidência",
        variant: "destructive"
      });
    }
  };

  const getComplianceIcon = (status?: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'non_compliant': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-warning" />;
      default: return <FileCheck className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getComplianceBadge = (status?: string) => {
    switch (status) {
      case 'compliant': return <Badge className="bg-success">Conforme</Badge>;
      case 'non_compliant': return <Badge className="bg-destructive">Não Conforme</Badge>;
      case 'partial': return <Badge className="bg-warning">Parcial</Badge>;
      default: return <Badge variant="outline">N/A</Badge>;
    }
  };

  const filteredEvidences = evidences.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.practice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPractice = !selectedPractice || e.practice_number === selectedPractice;
    return matchesSearch && matchesPractice;
  });

  const groupedByPractice = ANP_PRACTICES.map(practice => ({
    ...practice,
    evidences: filteredEvidences.filter(e => e.practice_number === practice.number),
    count: filteredEvidences.filter(e => e.practice_number === practice.number).length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-xl">
                <FileText className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Módulo de Evidências SGSO</CardTitle>
                <CardDescription>
                  Upload, OCR automático e categorização por Prática de Gestão ANP
                </CardDescription>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Nova Evidência
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Registrar Nova Evidência
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prática de Gestão *</Label>
                      <Select value={newEvidence.practice_number} onValueChange={handlePracticeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a PG" />
                        </SelectTrigger>
                        <SelectContent>
                          {ANP_PRACTICES.map(p => (
                            <SelectItem key={p.number} value={p.number}>
                              {p.number} - {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Evidência</Label>
                      <Select value={newEvidence.evidence_type} onValueChange={(v) => setNewEvidence(prev => ({ ...prev, evidence_type: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">Documento</SelectItem>
                          <SelectItem value="photo">Foto</SelectItem>
                          <SelectItem value="record">Registro</SelectItem>
                          <SelectItem value="interview">Entrevista</SelectItem>
                          <SelectItem value="observation">Observação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Título da Evidência *</Label>
                    <Input
                      value={newEvidence.title}
                      onChange={(e) => setNewEvidence(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Certificado de treinamento NR-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={newEvidence.description}
                      onChange={(e) => setNewEvidence(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva a evidência..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status de Conformidade</Label>
                      <Select value={newEvidence.compliance_status} onValueChange={(v) => setNewEvidence(prev => ({ ...prev, compliance_status: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compliant">✅ Conforme</SelectItem>
                          <SelectItem value="partial">⚠️ Parcialmente Conforme</SelectItem>
                          <SelectItem value="non_compliant">❌ Não Conforme</SelectItem>
                          <SelectItem value="not_applicable">➖ Não Aplicável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Justificativa</Label>
                      <Input
                        value={newEvidence.justification}
                        onChange={(e) => setNewEvidence(prev => ({ ...prev, justification: e.target.value }))}
                        placeholder="Justificativa do status"
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Arquivo (PDF, Imagem)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="evidence-file"
                      />
                      <label htmlFor="evidence-file" className="cursor-pointer">
                        {uploadedFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="h-8 w-8 text-primary" />
                            <span className="font-medium">{uploadedFile.name}</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Clique para upload ou arraste o arquivo
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, JPG, PNG, DOCX (máx. 50MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* OCR Result */}
                  {isProcessingOCR && (
                    <div className="flex items-center gap-2 p-4 bg-info/10 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-info" />
                      <span>Processando OCR...</span>
                    </div>
                  )}

                  {ocrResult && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <ScanLine className="h-4 w-4 text-primary" />
                          Texto Extraído (OCR)
                        </Label>
                        <Badge variant="outline">
                          Confiança: {ocrResult.confidence.toFixed(1)}%
                        </Badge>
                      </div>
                      <Textarea
                        value={ocrResult.text}
                        readOnly
                        rows={4}
                        className="bg-muted text-sm"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={uploadEvidence} 
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Salvar Evidência
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar evidências..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedPractice} onValueChange={setSelectedPractice}>
              <SelectTrigger className="w-[250px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por Prática" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Práticas</SelectItem>
                {ANP_PRACTICES.map(p => (
                  <SelectItem key={p.number} value={p.number}>
                    {p.number} - {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Grid by Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groupedByPractice.map(practice => (
          <Card key={practice.number} className={practice.count > 0 ? "border-success/30" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={practice.count > 0 ? "default" : "outline"} className={practice.count > 0 ? "bg-success" : ""}>
                    {practice.number}
                  </Badge>
                  <CardTitle className="text-sm font-medium">{practice.name}</CardTitle>
                </div>
                <Badge variant="outline">{practice.count} evidência(s)</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {practice.evidences.length > 0 ? (
                <div className="space-y-2">
                  {practice.evidences.map(evidence => (
                    <div key={evidence.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getComplianceIcon(evidence.compliance_status)}
                        <span className="text-sm font-medium">{evidence.title}</span>
                        {evidence.ocr_text && (
                          <Badge variant="outline" className="text-xs">
                            <ScanLine className="h-3 w-3 mr-1" />
                            OCR
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getComplianceBadge(evidence.compliance_status)}
                        <Button variant="ghost" size="icon" aria-label="Visualizar evidência" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma evidência registrada
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{evidences.filter(e => e.compliance_status === 'compliant').length}</p>
            <p className="text-sm text-green-600">Conformes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 border-yellow-200">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-700">{evidences.filter(e => e.compliance_status === 'partial').length}</p>
            <p className="text-sm text-yellow-600">Parciais</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-700">{evidences.filter(e => e.compliance_status === 'non_compliant').length}</p>
            <p className="text-sm text-red-600">Não Conformes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200">
          <CardContent className="p-4 text-center">
            <ScanLine className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{evidences.filter(e => e.ocr_text).length}</p>
            <p className="text-sm text-blue-600">Com OCR</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SGSOEvidenceManager;