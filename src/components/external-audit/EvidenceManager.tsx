// ETAPA 32.3: Evidence Management System Component
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ComplianceEvidence, AuditNormTemplate, MissingEvidence, ValidationStatus } from "@/types/external-audit";

interface EvidenceManagerProps {
  vesselId: string;
}

const NORM_NAMES = [
  "ISO-9001",
  "ISO-14001",
  "ISO-45001",
  "ISM-Code",
  "ISPS-Code",
  "MODU-Code",
  "IBAMA",
  "Petrobras",
  "IMCA",
];

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({ vesselId }) => {
  const [evidences, setEvidences] = useState<ComplianceEvidence[]>([]);
  const [missingEvidences, setMissingEvidences] = useState<MissingEvidence[]>([]);
  const [normTemplates, setNormTemplates] = useState<AuditNormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedNorm, setSelectedNorm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<ValidationStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, [vesselId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadEvidences(), loadMissingEvidences(), loadNormTemplates()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvidences = async () => {
    const { data, error } = await supabase
      .from("compliance_evidences")
      .select("*, norm_template:audit_norm_templates(*)")
      .eq("vessel_id", vesselId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading evidences:", error);
      return;
    }

    setEvidences(data || []);
  };

  const loadMissingEvidences = async () => {
    const { data, error } = await supabase.rpc("get_missing_evidences", {
      p_vessel_id: vesselId,
      p_norm_name: selectedNorm || null,
    });

    if (error) {
      console.error("Error loading missing evidences:", error);
      return;
    }

    setMissingEvidences(data || []);
  };

  const loadNormTemplates = async () => {
    const { data, error } = await supabase
      .from("audit_norm_templates")
      .select("*")
      .order("norm_name", { ascending: true })
      .order("clause_number", { ascending: true });

    if (error) {
      console.error("Error loading norm templates:", error);
      return;
    }

    setNormTemplates(data || []);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadEvidence = async () => {
    if (!selectedTemplate || !evidenceTitle || !selectedFile) {
      toast.error("Please fill all required fields and select a file");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${vesselId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("compliance-evidences")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("compliance-evidences").getPublicUrl(fileName);

      // Create evidence record
      const { error: insertError } = await supabase.from("compliance_evidences").insert({
        vessel_id: vesselId,
        norm_template_id: selectedTemplate,
        evidence_title: evidenceTitle,
        evidence_description: evidenceDescription,
        file_path: fileName,
        file_url: urlData.publicUrl,
        validation_status: "submitted",
      });

      if (insertError) throw insertError;

      toast.success("Evidence uploaded successfully");
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error uploading evidence:", error);
      toast.error("Failed to upload evidence");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate("");
    setEvidenceTitle("");
    setEvidenceDescription("");
    setSelectedFile(null);
  };

  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case "validated":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ValidationStatus) => {
    const variants: Record<ValidationStatus, any> = {
      validated: "default",
      submitted: "secondary",
      rejected: "destructive",
    };
    return variants[status] || "secondary";
  };

  const filteredEvidences = evidences.filter((evidence) => {
    const matchesNorm = !selectedNorm || evidence.norm_template?.norm_name === selectedNorm;
    const matchesStatus = selectedStatus === "all" || evidence.validation_status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      evidence.evidence_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evidence.evidence_description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNorm && matchesStatus && matchesSearch;
  });

  const filteredTemplates = normTemplates.filter(
    (template) => !selectedNorm || template.norm_name === selectedNorm
  );

  const getCoverageStat = () => {
    const totalRequired = normTemplates.length;
    const covered = evidences.filter((e) => e.validation_status === "validated").length;
    const percentage = totalRequired > 0 ? ((covered / totalRequired) * 100).toFixed(1) : "0.0";
    return { covered, totalRequired, percentage };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const coverage = getCoverageStat();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Evidence Management</h2>
          <p className="text-muted-foreground">Manage compliance evidence and documentation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Evidence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Compliance Evidence</DialogTitle>
              <DialogDescription>Provide evidence for norm compliance verification</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Norm Clause *</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select norm clause" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.norm_name} - {template.clause_number}: {template.clause_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Evidence Title *</Label>
                <Input
                  id="title"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="e.g., Quality Manual v2.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  placeholder="Brief description of the evidence"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File *</Label>
                <Input id="file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={uploadEvidence} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{evidences.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Validated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {evidences.filter((e) => e.validation_status === "validated").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{coverage.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              {coverage.covered} of {coverage.totalRequired} clauses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search evidence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedNorm} onValueChange={setSelectedNorm}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All norms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All norms</SelectItem>
                {NORM_NAMES.map((norm) => (
                  <SelectItem key={norm} value={norm}>
                    {norm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ValidationStatus | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Evidence List */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence Records ({filteredEvidences.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvidences.length > 0 ? (
            <div className="space-y-2">
              {filteredEvidences.map((evidence) => (
                <Card key={evidence.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{evidence.evidence_title}</p>
                            <Badge variant="outline">{evidence.norm_template?.norm_name}</Badge>
                            <Badge variant="outline">{evidence.norm_template?.clause_number}</Badge>
                          </div>
                          {evidence.evidence_description && (
                            <p className="text-sm text-muted-foreground">{evidence.evidence_description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Uploaded: {new Date(evidence.created_at).toLocaleDateString()}</span>
                            {evidence.validated_at && (
                              <span>Validated: {new Date(evidence.validated_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(evidence.validation_status)}
                        <Badge variant={getStatusBadge(evidence.validation_status)}>
                          {evidence.validation_status}
                        </Badge>
                        {evidence.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(evidence.file_url, "_blank")}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No evidence records found</p>
          )}
        </CardContent>
      </Card>

      {/* Missing Evidence Alerts */}
      {missingEvidences.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="h-5 w-5" />
              Missing Evidence ({missingEvidences.length})
            </CardTitle>
            <CardDescription>Clauses requiring evidence documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingEvidences.slice(0, 10).map((missing, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{missing.norm_name}</Badge>
                          <Badge variant="outline">{missing.clause_number}</Badge>
                          {missing.category && <Badge variant="secondary">{missing.category}</Badge>}
                        </div>
                        <p className="text-sm font-medium">{missing.clause_title}</p>
                        {missing.clause_description && (
                          <p className="text-xs text-muted-foreground mt-1">{missing.clause_description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {missingEvidences.length > 10 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  ...and {missingEvidences.length - 10} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
