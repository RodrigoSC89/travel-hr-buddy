import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Search, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ComplianceEvidence,
  AuditNormTemplate,
  NORM_TYPE_OPTIONS,
  NormType,
  getStatusColor,
  formatNormType,
} from "@/types/external-audit";

export function EvidenceManager() {
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedNorm, setSelectedNorm] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [vessels, setVessels] = useState<Array<{ id: string; name: string }>>([]);
  const [templates, setTemplates] = useState<AuditNormTemplate[]>([]);
  const [evidences, setEvidences] = useState<ComplianceEvidence[]>([]);
  const [missingEvidences, setMissingEvidences] = useState<AuditNormTemplate[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVessels = async () => {
      const { data, error } = await supabase.from("vessels").select("id, name").order("name");
      if (!error && data) {
        setVessels(data);
      }
    };
    fetchVessels();
  }, []);

  useEffect(() => {
    if (selectedVessel) {
      fetchEvidences();
      fetchMissingEvidences();
    }
  }, [selectedVessel, selectedNorm]);

  useEffect(() => {
    const fetchTemplates = async () => {
      let query = supabase.from("audit_norm_templates").select("*").order("norm_type, clause_number");
      
      if (selectedNorm) {
        query = query.eq("norm_type", selectedNorm);
      }

      const { data, error } = await query;
      if (!error && data) {
        setTemplates(data);
      }
    };
    fetchTemplates();
  }, [selectedNorm]);

  const fetchEvidences = async () => {
    if (!selectedVessel) return;

    let query = supabase
      .from("compliance_evidences")
      .select("*")
      .eq("vessel_id", selectedVessel)
      .order("created_at", { ascending: false });

    if (selectedNorm) {
      query = query.eq("norm_type", selectedNorm);
    }

    const { data, error } = await query;
    if (!error && data) {
      setEvidences(data);
    }
  };

  const fetchMissingEvidences = async () => {
    if (!selectedVessel) return;

    const { data, error } = await supabase.rpc("get_missing_evidences", {
      p_vessel_id: selectedVessel,
      p_norm_type: selectedNorm || null,
    });

    if (!error && data) {
      setMissingEvidences(data);
    }
  };

  const handleFileUpload = async (
    templateId: string,
    normType: NormType,
    clauseNumber: string,
    clauseTitle: string,
    file: File
  ) => {
    if (!selectedVessel) return;

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedVessel}/${normType}/${clauseNumber}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("compliance-evidences")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create evidence record
      const { error: insertError } = await supabase.from("compliance_evidences").insert({
        vessel_id: selectedVessel,
        norm_template_id: templateId,
        norm_type: normType,
        clause_number: clauseNumber,
        clause_title: clauseTitle,
        file_path: fileName,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user.id,
        status: "submitted",
      });

      if (insertError) throw insertError;

      toast({
        title: "Evidence Uploaded",
        description: "Compliance evidence uploaded successfully",
      });

      fetchEvidences();
      fetchMissingEvidences();
    } catch (error) {
      console.error("Error uploading evidence:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload evidence",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      searchQuery === "" ||
      template.clause_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.clause_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEvidenceForClause = (clauseNumber: string, normType: string) => {
    return evidences.find(
      (e) => e.clause_number === clauseNumber && e.norm_type === normType
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evidence Management</CardTitle>
          <CardDescription>
            Structured evidence repository for certification compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Vessel</label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose vessel..." />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Norm</label>
              <Select value={selectedNorm} onValueChange={setSelectedNorm}>
                <SelectTrigger>
                  <SelectValue placeholder="All norms..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Norms</SelectItem>
                  {NORM_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clauses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Evidences Alert */}
      {selectedVessel && missingEvidences.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Missing Evidences</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              {missingEvidences.length} mandatory clause(s) require evidence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingEvidences.slice(0, 5).map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formatNormType(template.norm_type)}</Badge>
                    <span className="font-mono text-sm">{template.clause_number}</span>
                    <span className="text-sm">{template.clause_title}</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Evidence</DialogTitle>
                        <DialogDescription>
                          {template.clause_number} - {template.clause_title}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(
                                template.id,
                                template.norm_type,
                                template.clause_number,
                                template.clause_title,
                                file
                              );
                            }
                          }}
                          disabled={isUploading}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
              {missingEvidences.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  And {missingEvidences.length - 5} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Norm Templates Table */}
      {selectedVessel && (
        <Card>
          <CardHeader>
            <CardTitle>Norm Templates & Evidence Status</CardTitle>
            <CardDescription>
              {filteredTemplates.length} clause(s) {selectedNorm && `for ${formatNormType(selectedNorm as NormType)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Norm</TableHead>
                  <TableHead>Clause</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => {
                  const evidence = getEvidenceForClause(
                    template.clause_number,
                    template.norm_type
                  );
                  return (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Badge variant="outline">{formatNormType(template.norm_type)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {template.clause_number}
                      </TableCell>
                      <TableCell>{template.clause_title}</TableCell>
                      <TableCell>
                        {evidence ? (
                          <Badge className={getStatusColor(evidence.status)}>
                            {evidence.status === "validated" && (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            )}
                            {evidence.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Missing
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {evidence ? (
                          <Button size="sm" variant="ghost">
                            <FileText className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Evidence</DialogTitle>
                                <DialogDescription>
                                  {template.clause_number} - {template.clause_title}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(
                                        template.id,
                                        template.norm_type,
                                        template.clause_number,
                                        template.clause_title,
                                        file
                                      );
                                    }
                                  }}
                                  disabled={isUploading}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
