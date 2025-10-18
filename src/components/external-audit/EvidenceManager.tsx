import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Loader2, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  AlertTriangle,
  Filter
} from 'lucide-react';
import {
  ComplianceEvidence,
  AuditNormTemplate,
  MissingEvidence,
  NormType,
  NORM_TYPE_NAMES
} from '@/types/external-audit';

export const EvidenceManager: React.FC = () => {
  const [vesselId, setVesselId] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [selectedNorm, setSelectedNorm] = useState<NormType>('ISO_9001');
  const [templates, setTemplates] = useState<AuditNormTemplate[]>([]);
  const [evidences, setEvidences] = useState<ComplianceEvidence[]>([]);
  const [missingEvidences, setMissingEvidences] = useState<MissingEvidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Upload form state
  const [selectedTemplate, setSelectedTemplate] = useState<AuditNormTemplate | null>(null);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [selectedNorm]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_norm_templates')
        .select('*')
        .eq('norm_type', selectedNorm)
        .order('clause_number');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load norm templates');
    }
  };

  const loadEvidences = async () => {
    if (!vesselId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('compliance_evidences')
        .select('*')
        .eq('vessel_id', vesselId)
        .eq('norm_type', selectedNorm)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvidences(data || []);

      // Load missing evidences
      const { data: missing, error: missingError } = await supabase
        .rpc('get_missing_evidences', {
          p_vessel_id: vesselId,
          p_norm_type: selectedNorm
        });

      if (missingError) throw missingError;
      setMissingEvidences(missing || []);

      toast.success('Evidences loaded successfully');
    } catch (error) {
      console.error('Error loading evidences:', error);
      toast.error(`Failed to load evidences: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!vesselId || !vesselName || !selectedTemplate || !evidenceTitle) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploadLoading(true);
    try {
      let filePath = null;
      let fileName = null;
      let fileSize = null;
      let fileType = null;

      // Upload file to Supabase Storage if provided
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const timestamp = Date.now();
        const filePath_ = `evidences/${vesselId}/${selectedNorm}/${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('compliance-evidences')
          .upload(filePath_, selectedFile);

        if (uploadError) {
          // Create bucket if it doesn't exist
          const { error: bucketError } = await supabase.storage.createBucket('compliance-evidences', {
            public: false,
            fileSizeLimit: 52428800 // 50MB
          });

          if (!bucketError) {
            // Retry upload
            const { error: retryError } = await supabase.storage
              .from('compliance-evidences')
              .upload(filePath_, selectedFile);
            
            if (retryError) throw retryError;
          } else {
            throw uploadError;
          }
        }

        filePath = filePath_;
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        fileType = selectedFile.type;
      }

      // Insert evidence record
      const { error: insertError } = await supabase
        .from('compliance_evidences')
        .insert({
          vessel_id: vesselId,
          vessel_name: vesselName,
          norm_type: selectedNorm,
          clause_number: selectedTemplate.clause_number,
          clause_description: selectedTemplate.clause_description,
          evidence_title: evidenceTitle,
          evidence_description: evidenceDescription || null,
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          status: 'submitted'
        });

      if (insertError) throw insertError;

      toast.success('Evidence uploaded successfully');
      
      // Reset form
      setSelectedTemplate(null);
      setEvidenceTitle('');
      setEvidenceDescription('');
      setSelectedFile(null);
      
      // Reload evidences
      loadEvidences();
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error(`Failed to upload evidence: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleValidateEvidence = async (evidenceId: string, status: 'validated' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('compliance_evidences')
        .update({
          status,
          validated_at: new Date().toISOString(),
          validation_notes: notes || null
        })
        .eq('id', evidenceId);

      if (error) throw error;

      toast.success(`Evidence ${status}`);
      loadEvidences();
    } catch (error) {
      console.error('Error validating evidence:', error);
      toast.error('Failed to validate evidence');
    }
  };

  const filteredEvidences = evidences.filter(evidence => {
    const matchesSearch = searchTerm === '' || 
      evidence.evidence_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evidence.clause_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || evidence.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Evidence Management System
          </CardTitle>
          <CardDescription>
            Structured evidence repository for certification compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselId">Vessel ID *</Label>
              <Input
                id="vesselId"
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value)}
                placeholder="Enter vessel ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name *</Label>
              <Input
                id="vesselName"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="Enter vessel name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="normType">Norm Type *</Label>
              <Select value={selectedNorm} onValueChange={(value) => setSelectedNorm(value as NormType)}>
                <SelectTrigger id="normType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NORM_TYPE_NAMES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={loadEvidences} disabled={loading || !vesselId} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Load Evidences
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Missing Evidences Alert */}
      {missingEvidences.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="font-medium text-orange-900 mb-2">
              {missingEvidences.length} Missing Evidence(s) Detected
            </div>
            <div className="text-sm text-orange-700">
              {missingEvidences.slice(0, 3).map((missing, idx) => (
                <div key={idx}>• {missing.clause_number}: {missing.clause_title}</div>
              ))}
              {missingEvidences.length > 3 && (
                <div>... and {missingEvidences.length - 3} more</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload New Evidence */}
      {vesselId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload New Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Clause *</Label>
              <Select 
                value={selectedTemplate?.id || ''} 
                onValueChange={(value) => {
                  const template = templates.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a clause" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.clause_number} - {template.clause_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <Alert>
                <AlertDescription>
                  <div className="text-sm font-medium mb-1">{selectedTemplate.clause_title}</div>
                  <div className="text-xs text-gray-600">{selectedTemplate.clause_description}</div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="evidenceTitle">Evidence Title *</Label>
              <Input
                id="evidenceTitle"
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
                placeholder="Enter evidence title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidenceDescription">Description (Optional)</Label>
              <Textarea
                id="evidenceDescription"
                value={evidenceDescription}
                onChange={(e) => setEvidenceDescription(e.target.value)}
                placeholder="Provide additional details..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File (Optional)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, DOC, XLS, JPG, PNG (max 50MB)
              </p>
            </div>

            <Button 
              onClick={handleFileUpload} 
              disabled={uploadLoading || !selectedTemplate || !evidenceTitle}
              className="w-full"
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Evidence
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Evidence List */}
      {evidences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evidence Repository</CardTitle>
            <div className="flex gap-2 mt-4">
              <div className="flex-1">
                <Input
                  placeholder="Search evidences..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEvidences.map((evidence) => (
                <div key={evidence.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{evidence.clause_number}</span>
                        <Badge variant="outline">{evidence.status}</Badge>
                        {getStatusIcon(evidence.status)}
                      </div>
                      <div className="text-sm font-medium">{evidence.evidence_title}</div>
                      {evidence.evidence_description && (
                        <div className="text-xs text-gray-600 mt-1">{evidence.evidence_description}</div>
                      )}
                      {evidence.file_name && (
                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {evidence.file_name}
                        </div>
                      )}
                    </div>
                    {evidence.status === 'submitted' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleValidateEvidence(evidence.id, 'validated')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleValidateEvidence(evidence.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Uploaded: {new Date(evidence.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
